import { useState, useRef, useCallback, useEffect } from 'react';

export interface UseGnaniVoiceOptions {
  lang?: string;
  sampleRate?: 8000 | 16000 | 44100 | 48000;
  onTranscriptionSuccess?: (transcript: string) => void;
  onTranscriptionError?: (error: Error) => void;
  onProcessing?: () => void;
}

const FRAME_SIZE_BYTES = 1024; // 512 samples × 2 bytes (16-bit PCM)
const CAPTURE_SAMPLE_RATE = 16000; // Hz - matches Vachana's best wideband mode

/**
 * useGnaniVoice — Real-time STT via Vachana WebSocket API.
 *
 * Flow:
 *  1. getUserMedia  → AudioContext @ 16kHz
 *  2. ScriptProcessor → downsample to 16kHz PCM Int16
 *  3. WebSocket → backend /ws/gnani (proxy adds auth headers)
 *  4. Receive transcript/processing JSON events from server
 */
export function useGnaniVoice(options: UseGnaniVoiceOptions = {}) {
  const {
    lang = 'en-IN',
    sampleRate = 16000,
    onTranscriptionSuccess,
    onTranscriptionError,
    onProcessing,
  } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pcmBufferRef = useRef<Uint8Array>(new Uint8Array(0));
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, []);

  const cleanup = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    pcmBufferRef.current = new Uint8Array(0);
  }, []);

  /** Convert Float32 audio samples to Int16 PCM bytes (little-endian) */
  const float32ToInt16 = (float32Buf: Float32Array): Uint8Array => {
    const int16 = new Int16Array(float32Buf.length);
    for (let i = 0; i < float32Buf.length; i++) {
      const clamped = Math.max(-1, Math.min(1, float32Buf[i]));
      int16[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
    }
    return new Uint8Array(int16.buffer);
  };

  /** Append new PCM bytes to buffer and flush 1024-byte frames over WS */
  const flushPcmFrames = useCallback((newBytes: Uint8Array) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    // Append new bytes
    const combined = new Uint8Array(pcmBufferRef.current.length + newBytes.length);
    combined.set(pcmBufferRef.current, 0);
    combined.set(newBytes, pcmBufferRef.current.length);
    pcmBufferRef.current = combined;

    // Send all complete 1024-byte frames
    while (pcmBufferRef.current.length >= FRAME_SIZE_BYTES) {
      ws.send(pcmBufferRef.current.slice(0, FRAME_SIZE_BYTES));
      pcmBufferRef.current = pcmBufferRef.current.slice(FRAME_SIZE_BYTES);
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (isRecording) return;
    setError(null);
    setTranscript(null);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone access is not supported by your browser.');
      }

      // --- 1. Open WebSocket to backend proxy ---
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}/ws/gnani?lang=${encodeURIComponent(lang)}&sampleRate=${sampleRate}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      // Handle WS messages from server
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data as string);
          if (msg.type === 'connected') {
            console.log('[Gnani] Connected:', msg.message);
          } else if (msg.type === 'processing') {
            setIsTranscribing(true);
            onProcessing?.();
          } else if (msg.type === 'transcript') {
            const text: string = msg.text || '';
            if (text && isMountedRef.current) {
              setTranscript(text);
              setIsTranscribing(false);
              onTranscriptionSuccess?.(text);
            }
          } else if (msg.type === 'error') {
            throw new Error(`Gnani error: ${msg.message}`);
          }
        } catch (parseErr) {
          // non-JSON frame, ignore
        }
      };

      ws.onerror = (e) => {
        const err = new Error('Gnani WebSocket connection error');
        setError(err.message);
        onTranscriptionError?.(err);
      };

      ws.onclose = (e) => {
        if (isMountedRef.current && isRecording) {
          setIsRecording(false);
          setIsTranscribing(false);
        }
      };

      // Wait for WS to open before starting audio
      await new Promise<void>((resolve, reject) => {
        ws.onopen = () => resolve();
        setTimeout(() => reject(new Error('WebSocket connection timeout')), 5000);
      });

      // --- 2. Get microphone stream ---
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: CAPTURE_SAMPLE_RATE,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = micStream;

      // --- 3. Set up AudioContext + ScriptProcessor ---
      const ctx = new AudioContext({ sampleRate: CAPTURE_SAMPLE_RATE });
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(micStream);
      // ScriptProcessorNode is deprecated but universally supported; AudioWorklet needs HTTPS
      const processor = ctx.createScriptProcessor(2048, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (!isMountedRef.current) return;
        const floatData = e.inputBuffer.getChannelData(0);
        const pcmBytes = float32ToInt16(floatData);
        flushPcmFrames(pcmBytes);
      };

      source.connect(processor);
      processor.connect(ctx.destination); // must connect to destination to fire onaudioprocess

      setIsRecording(true);
    } catch (err: any) {
      const errMsg = err?.message || 'Failed to start recording.';
      setError(errMsg);
      onTranscriptionError?.(err instanceof Error ? err : new Error(errMsg));
      cleanup();
    }
  }, [isRecording, lang, sampleRate, flushPcmFrames, onTranscriptionSuccess, onTranscriptionError, onProcessing, cleanup]);

  const stopRecording = useCallback(() => {
    if (!isRecording) return;
    setIsRecording(false);

    // Disconnect audio graph (stops sending frames)
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    // Keep WS open briefly to receive final transcript, then close
    setTimeout(() => {
      if (wsRef.current) {
        wsRef.current.close(1000, 'Recording stopped');
        wsRef.current = null;
      }
      pcmBufferRef.current = new Uint8Array(0);
    }, 2000);
  }, [isRecording]);

  return {
    startRecording,
    stopRecording,
    isRecording,
    isTranscribing,
    transcript,
    error,
  };
}

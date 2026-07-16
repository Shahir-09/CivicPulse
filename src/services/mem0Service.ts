/**
 * Mem0 AI memory layer service.
 * Uses the mem0ai npm SDK (MemoryClient) to provide user-scoped long-term memory.
 * Gracefully degrades when MEM0_API_KEY is not set.
 */
import { MemoryClient } from 'mem0ai';

// Lazily instantiated client — created on first use so dotenv has time to load
let _client: MemoryClient | null = null;
let _initAttempted = false;

function getClient(): MemoryClient | null {
  if (_initAttempted) return _client;
  _initAttempted = true;

  const apiKey = process.env.MEM0_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    console.warn('[Mem0] MEM0_API_KEY not set — memory layer disabled.');
    return null;
  }

  try {
    _client = new MemoryClient({ apiKey });
    console.log('[Mem0] MemoryClient initialized successfully.');
  } catch (err: any) {
    console.error('[Mem0] Failed to initialize MemoryClient:', err?.message);
    _client = null;
  }
  return _client;
}

export function isMem0Configured(): boolean {
  return getClient() !== null;
}

/**
 * Retrieves relevant memories for a specific user.
 * @param userId Unique identifier of the user (e.g. Firebase UID)
 * @param query Search text to match relevant memories
 */
export async function getUserMemories(userId: string, query: string): Promise<string> {
  const client = getClient();
  if (!client) {
    console.log('[Mem0] Memory disabled. Returning empty context.');
    return '';
  }

  try {
    const results = await (client as any).search(query, { user_id: userId, limit: 10 });
    if (Array.isArray(results)) {
      return results
        .map((m: any) => `- ${m.memory || m.text || ''}`)
        .filter(Boolean)
        .join('\n');
    }
    return '';
  } catch (err: any) {
    console.warn('[Mem0 Search Error]', err?.message || err);
    return '';
  }
}

/**
 * Adds new interaction exchanges to Mem0 to form long-term memory.
 * @param userId Unique identifier of the user
 * @param messages User/Assistant interaction sequence
 */
export async function addMemory(
  userId: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<void> {
  const client = getClient();
  if (!client) return;

  try {
    // mem0ai SDK expects messages array directly
    await (client as any).add(messages, { user_id: userId });
    console.log(`[Mem0] Memory updated for user: ${userId}`);
  } catch (err: any) {
    console.warn('[Mem0 Add Error]', err?.message || err);
  }
}

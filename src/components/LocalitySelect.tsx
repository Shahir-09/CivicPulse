import React, { useState, useEffect, useCallback } from 'react';
import { Locality } from '../utils/localities';
import { Search, MapPin, X, Loader, Navigation, Map } from 'lucide-react';

interface LocalitySelectProps {
  onSelect: (locality: Locality) => void;
  onClose?: () => void;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    neighbourhood?: string;
    suburb?: string;
    city_district?: string;
    city?: string;
    town?: string;
    state?: string;
  };
}

function extractLocality(result: NominatimResult): Locality {
  const addr = result.address || {};
  const name = addr.neighbourhood || addr.suburb || addr.city_district || result.display_name.split(',')[0];
  const city = addr.city || addr.town || addr.state || 'Kolkata';
  return {
    name: name.trim(),
    lat: parseFloat(result.lat),
    lng: parseFloat(result.lon),
    city: city.trim()
  };
}

export default function LocalitySelect({ onSelect, onClose }: LocalitySelectProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Locality[]>([]);
  const [nearbyResults, setNearbyResults] = useState<Locality[]>([]);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [searchDebounce, setSearchDebounce] = useState<ReturnType<typeof setTimeout> | null>(null);

  // On mount: try to get user's GPS, then reverse-geocode nearby areas
  useEffect(() => {
    fetchNearbyLocalities();
  }, []);

  const fetchNearbyLocalities = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation not supported. Please search for your area manually.');
      return;
    }
    setLoadingNearby(true);
    setGpsError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Use Nominatim reverse geocode to get nearby suburbs/localities
          const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`;
          const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
          const data: NominatimResult = await res.json();
          const currentLocality = extractLocality({ ...data, lat: String(latitude), lon: String(longitude) });

          // Also search for nearby localities around GPS point
          const searchUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=locality+near+${latitude},${longitude}&limit=8&addressdetails=1&viewbox=${longitude - 0.08},${latitude + 0.08},${longitude + 0.08},${latitude - 0.08}&bounded=1`;
          const searchRes = await fetch(searchUrl, { headers: { 'Accept-Language': 'en' } });
          const searchData: NominatimResult[] = await searchRes.json();

          const nearby: Locality[] = [
            currentLocality,
            ...searchData.map(extractLocality)
          ]
            // deduplicate by name
            .filter((loc, idx, arr) => arr.findIndex(l => l.name === loc.name) === idx)
            .slice(0, 8);

          setNearbyResults(nearby);
        } catch {
          setGpsError('Could not load nearby areas. Please search manually.');
        } finally {
          setLoadingNearby(false);
        }
      },
      (err) => {
        setLoadingNearby(false);
        if (err.code === 1) {
          setGpsError('Location access denied. Please search for your area below.');
        } else {
          setGpsError('Could not detect location. Please search manually.');
        }
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  };

  // Debounced Nominatim free-text search
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (searchDebounce) clearTimeout(searchDebounce);
    if (!val.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setLoadingSearch(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(val)}&limit=8&addressdetails=1&countrycodes=in`;
        const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
        const data: NominatimResult[] = await res.json();
        setResults(data.map(extractLocality));
      } catch {
        setResults([]);
      } finally {
        setLoadingSearch(false);
      }
    }, 500);
    setSearchDebounce(t);
  }, [searchDebounce]);

  const displayResults = query.trim() ? results : nearbyResults;

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(10,12,16,0.85)', zIndex: 999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px'
      }}
      onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '460px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxHeight: '85vh',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: 'var(--text-1)' }}>Select Your Locality</h3>
            <p style={{ fontSize: '11px', color: 'var(--text-3)', margin: '4px 0 0 0' }}>
              {loadingNearby ? 'Detecting your location...' : 'Showing areas near you. Search to find any location.'}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '4px', flexShrink: 0 }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* GPS Retry button */}
        {gpsError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'var(--surface-2)', borderRadius: '6px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-2)', flex: 1 }}>{gpsError}</span>
            <button
              onClick={fetchNearbyLocalities}
              style={{ fontSize: '11px', padding: '4px 10px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}
            >
              <Navigation size={11} /> Retry
            </button>
          </div>
        )}

        {/* Search input */}
        <div style={{ position: 'relative' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '36px', paddingRight: loadingSearch ? '36px' : '12px', width: '100%' }}
            placeholder="Search any neighborhood, ward, or area..."
            value={query}
            onChange={handleSearch}
            autoFocus
          />
          {loadingSearch && (
            <Loader
              size={14}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', animation: 'spin 1s linear infinite' }}
            />
          )}
        </div>

        {/* Section heading */}
        {!query.trim() && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {loadingNearby ? (
              <Loader size={13} style={{ color: 'var(--text-3)', animation: 'spin 1s linear infinite' }} />
            ) : (
              <Navigation size={13} style={{ color: 'var(--primary)' }} />
            )}
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {loadingNearby ? 'Detecting nearby areas...' : 'Nearby Areas'}
            </span>
          </div>
        )}

        {/* Results list */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', minHeight: '200px' }}>
          {loadingNearby && !query.trim() ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '6px', background: 'var(--surface-2)', animation: 'pulse 1.5s infinite' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--border)' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ height: '10px', width: '60%', borderRadius: '4px', background: 'var(--border)' }} />
                  <div style={{ height: '8px', width: '35%', borderRadius: '4px', background: 'var(--border)' }} />
                </div>
              </div>
            ))
          ) : displayResults.length > 0 ? (
            displayResults.map((loc, idx) => (
              <button
                key={`${loc.name}-${idx}`}
                onClick={() => onSelect(loc)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                  background: 'transparent', border: 'none', borderRadius: '6px',
                  width: '100%', textAlign: 'left', cursor: 'pointer', transition: 'background 0.2s'
                }}
                className="hover-card"
              >
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '32px', height: '32px', borderRadius: '6px',
                  background: 'var(--surface-2)', color: 'var(--primary)', flexShrink: 0
                }}>
                  <MapPin size={16} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{loc.name}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>{loc.city}</span>
                </div>
              </button>
            ))
          ) : query.trim() ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-3)', fontSize: '13px' }}>
              No matching locations found. Try a different search.
            </div>
          ) : !gpsError ? null : (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-3)', fontSize: '13px' }}>
              Search above to find your locality.
            </div>
          )}
        </div>

        {/* Pin on Map option */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
          <button
            onClick={() => {
              // Close modal and navigate to report page where user can click on map to place pin
              if (onClose) onClose();
            }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '10px', background: 'var(--surface-2)', border: '1px dashed var(--border)',
              borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
              color: 'var(--text-2)', transition: 'all 0.2s'
            }}
            className="hover-card"
          >
            <Map size={14} style={{ color: 'var(--primary)' }} />
            Or click directly on the map to set your location
          </button>
        </div>
      </div>
    </div>
  );
}

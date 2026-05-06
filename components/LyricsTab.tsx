'use client';
import { useState, useEffect } from 'react';
import type { Track } from '@/app/page';
type Props = { currentTrack: Track|null };

export default function LyricsTab({currentTrack}: Props) {
  const [artist, setArtist] = useState('');
  const [title, setTitle] = useState('');
  const [lyrics, setLyrics] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentTrack) {
      setArtist(currentTrack.artist || ''); setTitle(currentTrack.title || '');
      setLyrics(null); setError('');
    }
  }, [currentTrack?.id]);

  const fetch_ = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!artist || !title) return;
    setLoading(true); setError(''); setLyrics(null);
    try {
      const r = await fetch(`/api/lyrics?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`);
      const d = await r.json();
      if (d.lyrics) setLyrics(d.lyrics);
      else setError('Lyrics not found — try adjusting the artist or song name.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{ padding:'20px 24px 16px' }}>
        <form onSubmit={fetch_} style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ display:'flex', gap:10 }}>
            <input className="input" value={artist} onChange={e=>setArtist(e.target.value)} placeholder="Artist name…"/>
            <input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Song title…"/>
          </div>
          <button type="submit" disabled={loading||!artist||!title} className="btn-primary"
            style={{ padding:'11px', fontSize:14 }}>
            {loading ? 'Searching lyrics…' : '🎤 Find Lyrics'}
          </button>
          {currentTrack && (
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', textAlign:'center' }}>
              Auto-filled from: <span style={{ color:'#a78bfa' }}>{currentTrack.title}</span>
            </div>
          )}
        </form>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'0 24px 24px' }}>
        {!lyrics && !error && !loading && (
          <div style={{ textAlign:'center', paddingTop:60, color:'rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize:56, marginBottom:16 }}>🎤</div>
            <div style={{ fontSize:16, fontWeight:600, color:'rgba(255,255,255,0.35)' }}>Find lyrics instantly</div>
            <div style={{ fontSize:13, marginTop:6 }}>Auto-fills when a track is playing</div>
          </div>
        )}
        {error && (
          <div style={{ textAlign:'center', paddingTop:40, color:'rgba(248,113,113,0.8)' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>😕</div>
            <div style={{ fontSize:14 }}>{error}</div>
          </div>
        )}
        {lyrics && (
          <div className="card fade-in" style={{ padding:24, borderRadius:16 }}>
            <div style={{ marginBottom:16 }}>
              <div className="gradient-text" style={{ fontSize:18, fontWeight:700 }}>{title}</div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.45)', marginTop:4 }}>{artist}</div>
            </div>
            <pre style={{ fontSize:14, color:'rgba(255,255,255,0.75)', whiteSpace:'pre-wrap', lineHeight:1.8, fontFamily:'inherit' }}>{lyrics}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

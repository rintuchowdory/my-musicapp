'use client';
import { useState, useRef } from 'react';
import type { Track } from '@/app/page';

type Props = { onPlay:(t:Track)=>void; onAdd:(t:Track)=>void; currentTrack:Track|null };

export default function SearchTab({onPlay, onAdd, currentTrack}: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [locals, setLocals] = useState<Track[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const search = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const d = await r.json();
      setResults(d.results ?? []);
    } finally { setLoading(false); }
  };

  const toTrack = (r: any): Track => ({
    id: r.videoId, title: r.title, artist: r.artist,
    videoId: r.videoId, thumbnail: r.thumbnail, source: 'youtube',
  });

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fs = Array.from(e.target.files ?? []);
    setLocals(prev => [...prev, ...fs.map(f => ({
      id: `local-${Date.now()}-${f.name}`,
      title: f.name.replace(/\.[^.]+$/, ''),
      artist: 'Local File', url: URL.createObjectURL(f),
      source: 'local' as const,
    }))]);
  };

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* Search bar */}
      <div style={{ padding:'20px 24px 12px' }}>
        <form onSubmit={search} style={{ display:'flex', gap:10 }}>
          <input className="input" value={query} onChange={e=>setQuery(e.target.value)}
            placeholder="Search YouTube: artist, song, album…"
            style={{ flex:1 }}
          />
          <button type="submit" disabled={loading} className="btn-primary"
            style={{ padding:'10px 24px', fontSize:14, whiteSpace:'nowrap' }}>
            {loading ? '⟳' : 'Search'}
          </button>
          <button type="button" onClick={()=>fileRef.current?.click()}
            style={{
              padding:'10px 16px', borderRadius:12, fontSize:13,
              background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)',
              color:'rgba(255,255,255,0.7)', cursor:'pointer', whiteSpace:'nowrap',
              transition:'all 0.2s'
            }}>
            💾 Local Files
          </button>
          <input ref={fileRef} type="file" multiple accept="audio/*" style={{display:'none'}} onChange={handleFiles}/>
        </form>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'0 24px 20px' }}>
        {/* Local files */}
        {locals.length > 0 && (
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.35)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:10 }}>Local Files</div>
            {locals.map(t => (
              <div key={t.id} className={`track-row${currentTrack?.id===t.id?' active':''} fade-in`} onClick={()=>onPlay(t)}>
                <div className="thumb" style={{ fontSize:20 }}>💾</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.title}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>Local Audio</div>
                </div>
                <span className="pill">LOCAL</span>
              </div>
            ))}
          </div>
        )}

        {/* YouTube results */}
        {results.length === 0 && !loading ? (
          <div style={{ textAlign:'center', paddingTop:60, color:'rgba(255,255,255,0.2)' }}>
            <div style={{ fontSize:56, marginBottom:16 }}>🎵</div>
            <div style={{ fontSize:16, fontWeight:600, color:'rgba(255,255,255,0.4)' }}>Search for any music</div>
            <div style={{ fontSize:13, marginTop:6 }}>YouTube, local files — all in one place</div>
          </div>
        ) : (
          <>
            {results.length > 0 && <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.35)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:10 }}>YouTube Results</div>}
            {loading && <div style={{ textAlign:'center', padding:40, color:'rgba(255,255,255,0.3)', fontSize:14 }}>Searching…</div>}
            {results.map((r, i) => (
              <div key={r.videoId} className={`track-row${currentTrack?.videoId===r.videoId?' active':''} fade-in`}
                style={{ animationDelay:`${i*0.03}s` }}
                onClick={()=>onPlay(toTrack(r))}>
                <div className="thumb">
                  {r.thumbnail && <img src={r.thumbnail} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.title}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>{r.artist} {r.duration && `· ${r.duration}`}</div>
                </div>
                <div style={{ display:'flex', gap:6, opacity:0 }} className="row-actions">
                  <button onClick={e=>{e.stopPropagation();onAdd(toTrack(r));}}
                    style={{ padding:'4px 10px', borderRadius:8, background:'rgba(255,255,255,0.08)', border:'none', color:'white', cursor:'pointer', fontSize:12 }}>+ Add</button>
                </div>
                <span className="pill">▶ YT</span>
              </div>
            ))}
          </>
        )}
      </div>

      <style>{`.track-row:hover .row-actions { opacity:1 !important; transition:opacity 0.2s; }`}</style>
    </div>
  );
}

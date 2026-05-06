'use client';
import { useState, useEffect } from 'react';
import type { Track } from '@/app/page';

const GENRES = [
  {id:'pop',icon:'🎤'},{id:'rock',icon:'🎸'},{id:'jazz',icon:'🎷'},
  {id:'classical',icon:'🎻'},{id:'hiphop',icon:'🎧'},{id:'electronic',icon:'⚡'},
  {id:'lofi',icon:'☕'},{id:'news',icon:'📰'},{id:'top40',icon:'🔥'},
];

type Props = { onPlay:(t:Track)=>void; currentTrack:Track|null };

export default function RadioTab({onPlay,currentTrack}: Props) {
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState('pop');

  const load = async (q='', tag='') => {
    setLoading(true);
    try {
      const r = await fetch(`/api/radio?q=${encodeURIComponent(q)}&tag=${encodeURIComponent(tag)}`);
      const d = await r.json();
      setStations(d.stations ?? []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load('', 'pop'); }, []);

  const toTrack = (s: any): Track => ({
    id: `radio-${s.id}`, title: s.name,
    artist: [s.country, s.bitrate?`${s.bitrate}kbps`:''].filter(Boolean).join(' · '),
    url: s.url, thumbnail: s.favicon, source: 'radio',
  });

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{ padding:'20px 24px 12px' }}>
        <form onSubmit={e=>{e.preventDefault();setActiveTag('');load(query,'');}} style={{display:'flex',gap:10,marginBottom:14}}>
          <input className="input" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search radio stations…"/>
          <button type="submit" disabled={loading} className="btn-primary" style={{padding:'10px 20px',fontSize:14}}>
            {loading?'⟳':'Search'}
          </button>
        </form>
        {/* Genre pills */}
        <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4 }}>
          {GENRES.map(g => (
            <button key={g.id} onClick={()=>{setActiveTag(g.id);setQuery('');load('',g.id);}}
              style={{
                padding:'7px 14px', borderRadius:20, fontSize:13, fontWeight:500,
                whiteSpace:'nowrap', cursor:'pointer', border:'none', transition:'all 0.2s',
                background: activeTag===g.id ? 'linear-gradient(135deg,#7c3aed,#db2777)' : 'rgba(255,255,255,0.08)',
                color: activeTag===g.id ? 'white' : 'rgba(255,255,255,0.6)',
                boxShadow: activeTag===g.id ? '0 4px 14px #7c3aed55' : 'none',
              }}>
              {g.icon} {g.id}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'0 24px 20px' }}>
        {loading && <div style={{textAlign:'center',padding:40,color:'rgba(255,255,255,0.3)',fontSize:14}}>Loading stations…</div>}
        {!loading && stations.length === 0 && (
          <div style={{textAlign:'center',paddingTop:60,color:'rgba(255,255,255,0.2)'}}>
            <div style={{fontSize:56,marginBottom:16}}>📻</div>
            <div style={{fontSize:16,fontWeight:600,color:'rgba(255,255,255,0.35)'}}>No stations found</div>
          </div>
        )}
        {stations.map((s, i) => (
          <div key={s.id} className={`track-row${currentTrack?.id===`radio-${s.id}`?' active':''} fade-in`}
            style={{ animationDelay:`${i*0.02}s` }} onClick={()=>onPlay(toTrack(s))}>
            <div className="thumb" style={{ borderRadius:'50%', fontSize:20 }}>
              {s.favicon
                ? <img src={s.favicon} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}} alt=""
                    onError={e=>(e.currentTarget.style.display='none')}/>
                : '📻'}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{fontSize:14,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.name}</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>{s.country} {s.tags?`· ${s.tags.split(',').slice(0,2).join(', ')}`:''}</div>
            </div>
            {s.bitrate>0 && <span className="pill">{s.bitrate}k</span>}
            <button style={{
              padding:'5px 12px', borderRadius:8, fontSize:12, fontWeight:600,
              background:'linear-gradient(135deg,#7c3aed,#db2777)', border:'none',
              color:'white', cursor:'pointer', opacity:0, transition:'opacity 0.2s'
            }} className="play-btn">▶ Play</button>
          </div>
        ))}
        <style>{`.track-row:hover .play-btn { opacity:1 !important; }`}</style>
      </div>
    </div>
  );
}

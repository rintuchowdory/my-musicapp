'use client';
import type { Track } from '@/app/page';
type Props = { playlist:Track[]; onPlay:(t:Track)=>void; currentTrack:Track|null; onRemove:(id:string)=>void; };

export default function PlaylistTab({playlist,onPlay,currentTrack,onRemove}: Props) {
  if (!playlist.length) return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,0.2)' }}>
      <div style={{ fontSize:64, marginBottom:16 }}>🎵</div>
      <div style={{ fontSize:18, fontWeight:600, color:'rgba(255,255,255,0.35)' }}>Your playlist is empty</div>
      <div style={{ fontSize:13, marginTop:6 }}>Search for songs or tune into radio to get started</div>
    </div>
  );
  return (
    <div style={{ height:'100%', overflowY:'auto', padding:'20px 24px' }}>
      <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.35)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:12 }}>
        {playlist.length} {playlist.length === 1 ? 'track' : 'tracks'}
      </div>
      {playlist.map((t, i) => (
        <div key={t.id} className={`track-row${currentTrack?.id===t.id?' active':''} fade-in`}
          style={{ animationDelay:`${i*0.03}s` }} onClick={()=>onPlay(t)}>
          <span style={{ fontSize:12, color:'rgba(255,255,255,0.25)', width:20, textAlign:'right', flexShrink:0 }}>{i+1}</span>
          <div className="thumb" style={{ fontSize:20 }}>
            {t.thumbnail ? <img src={t.thumbnail} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/> : t.source==='radio'?'📻':'♪'}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:14, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:currentTrack?.id===t.id?'#a78bfa':'white' }}>{t.title}</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>{t.artist}</div>
          </div>
          <span className="pill">{t.source==='youtube'?'▶ YT':t.source==='radio'?'📻':'💾'}</span>
          <button onClick={e=>{e.stopPropagation();onRemove(t.id);}}
            style={{ background:'none', border:'none', cursor:'pointer', fontSize:18, color:'rgba(255,255,255,0.25)', padding:'0 4px', transition:'color 0.2s' }}
            onMouseEnter={e=>(e.currentTarget.style.color='#f87171')} onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.25)')}>×</button>
        </div>
      ))}
    </div>
  );
}

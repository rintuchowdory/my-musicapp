'use client';
import { useState } from 'react';
import Player from '@/components/Player';
import SearchTab from '@/components/SearchTab';
import LyricsTab from '@/components/LyricsTab';
import RadioTab from '@/components/RadioTab';
import PlaylistTab from '@/components/PlaylistTab';

export type Track = {
  id: string; title: string; artist: string;
  videoId?: string; url?: string; thumbnail?: string;
  source: 'youtube' | 'local' | 'radio';
};
type Tab = 'search' | 'playlist' | 'lyrics' | 'radio';

export default function Home() {
  const [tab, setTab] = useState<Tab>('search');
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const addToPlaylist = (track: Track) =>
    setPlaylist(prev => prev.find(t => t.id === track.id) ? prev : [...prev, track]);
  const playTrack = (track: Track) => {
    setCurrentTrack(track); setIsPlaying(true); addToPlaylist(track);
  };

  const NAV: { id: Tab; icon: string; label: string; badge?: number }[] = [
    { id: 'search', icon: '🔍', label: 'Search' },
    { id: 'playlist', icon: '🎵', label: 'Playlist', badge: playlist.length || undefined },
    { id: 'lyrics', icon: '🎤', label: 'Lyrics' },
    { id: 'radio', icon: '📻', label: 'Radio' },
  ];

  return (
    <div style={{ display:'flex', height:'100vh', flexDirection:'column', background:'#070b14' }}>
      {/* Layout */}
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
        {/* Sidebar */}
        <aside style={{
          width: 220, flexShrink: 0, display:'flex', flexDirection:'column',
          borderRight:'1px solid rgba(255,255,255,0.07)',
          background:'rgba(0,0,0,0.3)', padding:'24px 12px'
        }}>
          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'0 8px', marginBottom:32 }}>
            <div style={{
              width:36, height:36, borderRadius:10,
              background:'linear-gradient(135deg,#7c3aed,#db2777)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:18, flexShrink:0,
              boxShadow:'0 4px 20px #7c3aed55'
            }}>♪</div>
            <div>
              <div className="gradient-text" style={{ fontWeight:700, fontSize:16 }}>MusicApp</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:1 }}>Your music, everywhere</div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {NAV.map(n => (
              <button key={n.id} className={`nav-btn${tab===n.id?' active':''}`}
                onClick={() => setTab(n.id as Tab)}>
                <span style={{ fontSize:18 }}>{n.icon}</span>
                <span style={{ flex:1, textAlign:'left' }}>{n.label}</span>
                {n.badge ? (
                  <span style={{
                    background:'linear-gradient(135deg,#7c3aed,#db2777)',
                    borderRadius:20, padding:'1px 7px', fontSize:11, fontWeight:700, color:'white'
                  }}>{n.badge}</span>
                ) : null}
              </button>
            ))}
          </nav>

          {/* Now playing mini in sidebar */}
          {currentTrack && (
            <div style={{ marginTop:'auto', padding:'0 4px' }}>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginBottom:8, letterSpacing:'0.8px', textTransform:'uppercase' }}>Now Playing</div>
              <div className="card" style={{ padding:10, borderRadius:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  {isPlaying ? (
                    <div style={{ display:'flex', alignItems:'flex-end', gap:2, width:20, height:20 }}>
                      {[0,1,2].map(i => (
                        <div key={i} className={`bar${i+1}`} style={{
                          width:4, background:'#a78bfa', borderRadius:2,
                          height:8, transformOrigin:'bottom'
                        }}/>
                      ))}
                    </div>
                  ) : <span style={{ fontSize:16 }}>⏸</span>}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{currentTrack.title}</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{currentTrack.artist}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Main content */}
        <main style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
          {/* Top bar */}
          <div style={{
            padding:'16px 24px', borderBottom:'1px solid rgba(255,255,255,0.06)',
            display:'flex', alignItems:'center', justifyContent:'space-between',
            background:'rgba(0,0,0,0.2)'
          }}>
            <div>
              <h1 style={{ fontSize:20, fontWeight:700 }}>
                {{ search:'Discover Music', playlist:'My Playlist', lyrics:'Lyrics', radio:'Internet Radio' }[tab]}
              </h1>
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginTop:2 }}>
                {{ search:'Search YouTube or add local files', playlist:`${playlist.length} tracks`, lyrics:'Find lyrics for any song', radio:'Stream live radio stations' }[tab]}
              </p>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{
                padding:'6px 12px', borderRadius:20,
                background:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.3)',
                fontSize:11, fontWeight:600, color:'#4ade80', display:'flex', alignItems:'center', gap:5
              }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'#4ade80', display:'inline-block' }}></span>
                Online
              </div>
            </div>
          </div>

          {/* Tab content */}
          <div style={{ flex:1, overflow:'hidden' }}>
            {tab==='search'   && <SearchTab  onPlay={playTrack} onAdd={addToPlaylist} currentTrack={currentTrack}/>}
            {tab==='playlist' && <PlaylistTab playlist={playlist} onPlay={playTrack} currentTrack={currentTrack} onRemove={id=>setPlaylist(p=>p.filter(t=>t.id!==id))}/>}
            {tab==='lyrics'   && <LyricsTab  currentTrack={currentTrack}/>}
            {tab==='radio'    && <RadioTab   onPlay={playTrack} currentTrack={currentTrack}/>}
          </div>
        </main>
      </div>

      {/* Player bar */}
      <Player
        track={currentTrack} playlist={playlist}
        isPlaying={isPlaying} setIsPlaying={setIsPlaying}
        onTrackChange={setCurrentTrack} onTabChange={t=>setTab(t as Tab)}
      />
    </div>
  );
}

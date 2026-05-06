'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import type { Track } from '@/app/page';
import YouTube from 'react-youtube';

type Props = {
  track: Track|null; playlist: Track[];
  isPlaying: boolean; setIsPlaying: (v:boolean)=>void;
  onTrackChange: (t:Track)=>void; onTabChange: (tab:any)=>void;
};

export default function Player({track,playlist,isPlaying,setIsPlaying,onTrackChange,onTabChange}: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const ytRef = useRef<any>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(75);
  const [ytReady, setYtReady] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [shuffle, setShuffle] = useState(false);

  const isYT = track?.source === 'youtube';
  const isAudio = track?.source === 'local' || track?.source === 'radio';

  const handleNext = useCallback(() => {
    if (!track || !playlist.length) return;
    const idx = playlist.findIndex(t => t.id === track.id);
    const next = shuffle
      ? playlist[Math.floor(Math.random() * playlist.length)]
      : playlist[(idx + 1) % playlist.length];
    if (next) onTrackChange(next);
  }, [track, playlist, shuffle, onTrackChange]);

  const handlePrev = useCallback(() => {
    if (!track || !playlist.length) return;
    const idx = playlist.findIndex(t => t.id === track.id);
    onTrackChange(playlist[(idx - 1 + playlist.length) % playlist.length]);
  }, [track, playlist, onTrackChange]);

  useEffect(() => {
    const audio = audioRef.current; if (!audio) return;
    const a = () => setProgress(audio.currentTime);
    const b = () => setDuration(audio.duration);
    const c = () => handleNext();
    audio.addEventListener('timeupdate', a);
    audio.addEventListener('loadedmetadata', b);
    audio.addEventListener('ended', c);
    return () => { audio.removeEventListener('timeupdate',a); audio.removeEventListener('loadedmetadata',b); audio.removeEventListener('ended',c); };
  }, [handleNext]);

  useEffect(() => {
    if (isYT && ytRef.current && ytReady) { isPlaying ? ytRef.current.playVideo() : ytRef.current.pauseVideo(); }
    if (isAudio && audioRef.current) { isPlaying ? audioRef.current.play().catch(()=>{}) : audioRef.current.pause(); }
  }, [isPlaying, isYT, isAudio, ytReady]);

  useEffect(() => {
    if (!track) return;
    setProgress(0); setDuration(0); setYtReady(false);
    if (isAudio && audioRef.current && track.url) {
      audioRef.current.src = track.url;
      audioRef.current.volume = volume / 100;
      if (isPlaying) audioRef.current.play().catch(()=>{});
    }
  }, [track?.id]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
    if (ytRef.current) ytRef.current.setVolume?.(volume);
  }, [volume]);

  useEffect(() => {
    if (!isYT || !ytReady) return;
    const iv = setInterval(() => {
      if (ytRef.current) { setProgress(ytRef.current.getCurrentTime()||0); setDuration(ytRef.current.getDuration()||0); }
    }, 500);
    return () => clearInterval(iv);
  }, [isYT, ytReady]);

  const seek = (v: number) => {
    if (isYT && ytRef.current) ytRef.current.seekTo(v, true);
    if (isAudio && audioRef.current) { audioRef.current.currentTime = v; setProgress(v); }
  };

  const fmt = (s: number) => {
    if (!s || isNaN(s)) return '0:00';
    return `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,'0')}`;
  };

  const pct = duration ? (progress / duration) * 100 : 0;

  return (
    <div style={{
      borderTop: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(5,5,15,0.97)',
      backdropFilter: 'blur(24px)',
      flexShrink: 0,
    }}>
      {/* Video panel */}
      {isYT && track?.videoId && (
        <div style={{ height: showVideo ? 200 : 0, overflow:'hidden', transition:'height 0.3s ease' }}>
          <YouTube
            videoId={track.videoId}
            onReady={e => { ytRef.current = e.target; setYtReady(true); e.target.setVolume(volume); if(isPlaying) e.target.playVideo(); }}
            onStateChange={e => { if(e.data===1)setIsPlaying(true); if(e.data===2||e.data===0)setIsPlaying(false); if(e.data===0)handleNext(); }}
            opts={{ width:'100%', height:'200', playerVars:{ autoplay:1, controls:1 } }}
            style={{ width:'100%' }}
          />
        </div>
      )}
      <audio ref={audioRef} preload="metadata"/>

      <div style={{ padding:'12px 24px 14px' }}>
        {/* Progress */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
          <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)', width:36, textAlign:'right' }}>{fmt(progress)}</span>
          <div style={{ flex:1, position:'relative' }}>
            <input type="range" min={0} max={duration||100} value={progress}
              onChange={e => seek(Number(e.target.value))}
              style={{ width:'100%', background:`linear-gradient(to right,#a78bfa ${pct}%,rgba(255,255,255,0.1) ${pct}%)` }}
            />
          </div>
          <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)', width:36 }}>{fmt(duration)}</span>
        </div>

        {/* Controls */}
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {/* Track info */}
          <div style={{ display:'flex', alignItems:'center', gap:12, width:240, flexShrink:0 }}>
            <div className={isPlaying ? 'glow-pulse' : ''} style={{
              width:44, height:44, borderRadius:10, flexShrink:0, overflow:'hidden',
              background:'linear-gradient(135deg,#1e1033,#0f172a)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:20
            }}>
              {track?.thumbnail
                ? <img src={track.thumbnail} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>
                : track?.source==='radio' ? '📻' : '♪'}
            </div>
            {track ? (
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{track.title}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{track.artist}</div>
              </div>
            ) : (
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>Nothing playing</div>
            )}
          </div>

          {/* Center controls */}
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:12 }}>
            <button onClick={() => setShuffle(s=>!s)} title="Shuffle"
              style={{ background:'none', border:'none', cursor:'pointer', fontSize:18, opacity:shuffle?1:0.4, color:'#a78bfa', transition:'opacity 0.2s' }}>⇄</button>
            <button onClick={handlePrev}
              style={{ background:'none', border:'none', cursor:'pointer', fontSize:22, color:'rgba(255,255,255,0.7)', transition:'all 0.2s' }}>⏮</button>
            <button onClick={() => setIsPlaying(!isPlaying)}
              className="btn-primary"
              style={{ width:48, height:48, borderRadius:'50%', fontSize:20, display:'flex', alignItems:'center', justifyContent:'center' }}>
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button onClick={handleNext}
              style={{ background:'none', border:'none', cursor:'pointer', fontSize:22, color:'rgba(255,255,255,0.7)', transition:'all 0.2s' }}>⏭</button>
            <button onClick={() => onTabChange('lyrics')} title="Lyrics"
              style={{ background:'none', border:'none', cursor:'pointer', fontSize:18, opacity:0.5, color:'white', transition:'opacity 0.2s' }}
              onMouseEnter={e=>(e.currentTarget.style.opacity='1')} onMouseLeave={e=>(e.currentTarget.style.opacity='0.5')}>🎤</button>
          </div>

          {/* Right: volume + video toggle */}
          <div style={{ display:'flex', alignItems:'center', gap:12, width:200, flexShrink:0, justifyContent:'flex-end' }}>
            {isYT && (
              <button onClick={() => setShowVideo(v=>!v)} title={showVideo?'Hide video':'Show video'}
                style={{ background:'none', border:'none', cursor:'pointer', fontSize:14, color: showVideo?'#a78bfa':'rgba(255,255,255,0.4)', transition:'color 0.2s' }}>
                📺 {showVideo ? '▼' : '▲'}
              </button>
            )}
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:13, color:'rgba(255,255,255,0.35)' }}>
                {volume===0?'🔇':volume<40?'🔈':'🔊'}
              </span>
              <input type="range" min={0} max={100} value={volume}
                onChange={e => setVolume(Number(e.target.value))}
                style={{ width:80, background:`linear-gradient(to right,#a78bfa ${volume}%,rgba(255,255,255,0.1) ${volume}%)` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

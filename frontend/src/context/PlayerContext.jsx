import React, { createContext, useContext, useRef, useState, useEffect } from 'react'

const PlayerContext = createContext(null)

export function PlayerProvider({ children }) {
  const audioRef = useRef(null)
  const [queue, setQueue] = useState(() => {
    try {
      const raw = localStorage.getItem('player.queue')
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  })
  const [index, setIndex] = useState(() => {
    try { return Number(localStorage.getItem('player.index')) || 0 } catch { return 0 }
  })
  const [isPlaying, setIsPlaying] = useState(() => {
    try { return localStorage.getItem('player.playing') === '1' } catch { return false }
  })
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(() => {
    try { return Number(localStorage.getItem('player.time')) || 0 } catch { return 0 }
  })
  const [repeat, setRepeat] = useState(false)
  const [shuffle, setShuffle] = useState(false)

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    const onTime = () => setCurrentTime(a.currentTime || 0)
    const onLoaded = () => setDuration(a.duration || 0)
    const onEnded = () => {
      if (repeat) {
        a.currentTime = 0; a.play().catch(()=>{})
      } else {
        next()
      }
    }
    a.addEventListener('timeupdate', onTime)
    a.addEventListener('loadedmetadata', onLoaded)
    a.addEventListener('ended', onEnded)
    return () => {
      a.removeEventListener('timeupdate', onTime)
      a.removeEventListener('loadedmetadata', onLoaded)
      a.removeEventListener('ended', onEnded)
    }
  }, [repeat])

  // Persist currentTime periodically
  useEffect(() => {
    try { localStorage.setItem('player.time', String(currentTime || 0)) } catch {}
  }, [currentTime])

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    a.loop = !!repeat
  }, [repeat])

  useEffect(() => {
    const a = audioRef.current
    if (!a || !queue[index]) return
    a.src = queue[index].url
    // Restore position if available
    if (typeof currentTime === 'number' && currentTime > 0) {
      try { a.currentTime = currentTime } catch {}
    }
    if (isPlaying) a.play().catch(()=>{})
  }, [index, queue])

  // Persist queue and index and playing flag
  useEffect(() => {
    try { localStorage.setItem('player.queue', JSON.stringify(queue)) } catch {}
  }, [queue])
  useEffect(() => {
    try { localStorage.setItem('player.index', String(index)) } catch {}
  }, [index])
  useEffect(() => {
    try { localStorage.setItem('player.playing', isPlaying ? '1' : '0') } catch {}
  }, [isPlaying])

  function playPause() {
    const a = audioRef.current; if (!a) return
    if (isPlaying) { a.pause(); setIsPlaying(false) } else { a.play().catch(()=>{}); setIsPlaying(true) }
  }
  function select(i) {
    setIndex(i)
    setIsPlaying(true)
    const a = audioRef.current
    if (a) {
      a.src = queue[i]?.url || ''
      try { a.currentTime = 0 } catch {}
      setCurrentTime(0)
      a.play().catch(()=>{})
    }
  }
  function prev() { if (!queue.length) return; const i = (index - 1 + queue.length) % queue.length; select(i) }
  function next() { if (!queue.length) return; let i; if (shuffle) { i = Math.floor(Math.random() * queue.length) } else { i = (index + 1) % queue.length } select(i) }
  function seek(pct) { const a = audioRef.current; if (!a || !duration) return; a.currentTime = pct * duration }

  const value = {
    audioRef, queue, setQueue, index, setIndex,
    isPlaying, setIsPlaying, duration, currentTime,
    repeat, setRepeat, shuffle, setShuffle,
    playPause, select, prev, next, seek
  }

  return (
    <PlayerContext.Provider value={value}>
      {children}
      {/* global audio element */}
      <audio ref={audioRef} />
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider')
  return ctx
}
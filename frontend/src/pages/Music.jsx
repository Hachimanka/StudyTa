import React, { useState, useEffect, useRef } from 'react'
import Sidebar from '../components/Sidebar'
import ChatWidget from '../components/ChatWidget'

export default function Music() {
  const [query, setQuery] = useState('')
  const [tracks, setTracks] = useState([
    { id: 1, name: 'White noise.mp3', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', duration: '3:12' },
    { id: 2, name: 'golden.mp3', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', duration: '3:45' }
  ])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isRepeat, setIsRepeat] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    const onTime = () => setCurrentTime(a.currentTime || 0)
    const onLoaded = () => setDuration(a.duration || 0)
    const onEnded = () => {
      if (isRepeat) {
        // restart the same track
        a.currentTime = 0
        a.play().catch(() => {})
      } else {
        handleNext()
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
  }, [currentIndex, isRepeat])

  // Keep the native loop flag in sync (optional but safe)
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    a.loop = !!isRepeat
  }, [isRepeat])

  useEffect(() => {
    const a = audioRef.current
    if (!a || !tracks[currentIndex]) return
    a.src = tracks[currentIndex].url
    if (isPlaying) a.play().catch(() => {})
  }, [currentIndex, tracks])

  const filtered = tracks.filter((t) => t.name.toLowerCase().includes(query.toLowerCase()))

  function handlePlayPause() {
    const a = audioRef.current
    if (!a) return
    if (isPlaying) {
      a.pause()
      setIsPlaying(false)
    } else {
      a.play().catch(() => {})
      setIsPlaying(true)
    }
  }

  function handleSelect(index) {
    setCurrentIndex(index)
    setIsPlaying(true)
    const a = audioRef.current
    if (a) {
      a.src = tracks[index].url
      a.play().catch(() => {})
    }
  }

  function handlePrev() {
    const prev = (currentIndex - 1 + tracks.length) % tracks.length
    handleSelect(prev)
  }

  function handleNext() {
    let next
    if (isShuffle) {
      // pick a random different index
      if (tracks.length <= 1) next = currentIndex
      else {
        do {
          next = Math.floor(Math.random() * tracks.length)
        } while (next === currentIndex)
      }
    } else {
      next = (currentIndex + 1) % tracks.length
    }
    handleSelect(next)
  }

  function toggleRepeat() {
    setIsRepeat((s) => {
      const next = !s
      if (next) setIsShuffle(false)
      return next
    })
  }

  function toggleShuffle() {
    setIsShuffle((s) => {
      const next = !s
      if (next) setIsRepeat(false)
      return next
    })
  }

  function handleSeek(e) {
    const bar = e.currentTarget
    const rect = bar.getBoundingClientRect()
    const clickX = (e.clientX || 0) - rect.left
    const pct = Math.max(0, Math.min(1, clickX / rect.width))
    const a = audioRef.current
    if (a && duration) {
      a.currentTime = pct * duration
      setCurrentTime(a.currentTime)
    }
  }

  function handleUpload(e) {
    const file = e.target.files && e.target.files[0]
    if (!file) return

    // Try uploading to the backend. Fall back to object URL on failure.
    const form = new FormData()
    form.append('track', file)

    fetch('/api/music/upload', { method: 'POST', body: form })
      .then(async (resp) => {
        if (!resp.ok) throw new Error('Upload failed')
        const j = await resp.json()
        // Use backend _id when available
        const id = j._id || Date.now()
        const next = { id, name: j.name || file.name, url: j.url, duration: '0:00' }
        setTracks((s) => [...s, next])
        // Update duration using metadata and persist to backend when available
        updateTrackDuration(id, j.url, false).then(({ seconds, formatted }) => {
          if (j._id && seconds) {
            try {
              fetch(`/api/music/${j._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ durationSeconds: seconds, duration: formatted })
              }).catch(() => {})
            } catch (e) {}
          }
        }).catch(() => {})
        setQuery('')
      })
      .catch(() => {
        // Fallback to local object URL
        const url = URL.createObjectURL(file)
        const id = Date.now()
        const next = { id, name: file.name, url, duration: '0:00' }
        setTracks((s) => [...s, next])
        // Update duration and revoke object URL after read (no backend persist)
        updateTrackDuration(id, url, true).catch(() => {})
        setQuery('')
      })
  }

  function formatSeconds(s) {
    if (!s || isNaN(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }

  // Load audio metadata for a URL and update the corresponding track's duration
  function updateTrackDuration(id, url, revokeAfter = false) {
    return new Promise((resolve, reject) => {
      try {
        const a = new Audio()
        const cleanup = () => {
          a.src = ''
          a.removeEventListener('loadedmetadata', onLoaded)
          a.removeEventListener('error', onError)
          if (revokeAfter && url && url.startsWith('blob:')) {
            try { URL.revokeObjectURL(url) } catch (e) {}
          }
        }

        const onLoaded = () => {
          const seconds = isFinite(a.duration) ? Math.floor(a.duration) : 0
          const dur = seconds ? formatSeconds(seconds) : '0:00'
          setTracks((prev) => prev.map((t) => (t.id === id ? { ...t, duration: dur } : t)))
          cleanup()
          resolve({ seconds, formatted: dur })
        }

        const onError = (e) => {
          cleanup()
          reject(e || new Error('Failed to load metadata'))
        }

        a.addEventListener('loadedmetadata', onLoaded)
        a.addEventListener('error', onError)
        a.preload = 'metadata'
        a.src = url
      } catch (err) {
        reject(err)
      }
    })
  }

  return (
    <div className="flex min-h-screen bg-[#e9d8d0] p-8 pl-0">
      <Sidebar />
      <main className="flex-1 ml-34">
        <ChatWidget />

        <div className="max-w-6xl w-full px-4">
          <h1 className="text-5xl font-bold text-[#5f341e] mb-4">Musics</h1>
          <p className="text-sm text-[#6b4b3a] mb-6">Enhance focus with curated study playlists.</p>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left card (wider) */}
            <div className="bg-white rounded-xl p-4 lg:w-2/3 h-[480px]">
              <div className="flex items-center gap-3 mb-4">
                <input
                  className="flex-1 border rounded-full px-4 py-2 text-sm"
                  placeholder="Search Music..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <label className="inline-block">
                  <input type="file" accept="audio/*" onChange={handleUpload} className="hidden" />
                  <span className="bg-[#7a4a36] text-white px-4 py-2 rounded-xl">Upload Music</span>
                </label>
              </div>

              <div className="space-y-3 overflow-auto h-[400px] pb-4">
                {filtered.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSelect(tracks.indexOf(t))}
                    className={`w-full text-left p-4 rounded-lg flex items-center gap-4 border ${tracks.indexOf(t) === currentIndex ? 'shadow-md bg-[#fff5f2]' : 'bg-white'}`}>
                    <div className="w-10 h-10 rounded-full bg-[#7a4a36] flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                        <path d="M12 3v10.55A4 4 0 1014 17V7h4V3h-6z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-[#5f341e]">{t.name}</div>
                      <div className="text-xs text-gray-500">{t.duration}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right card (narrower) */}
            <div className="bg-white rounded-xl p-6 lg:w-1/3 h-[480px] flex flex-col items-center justify-between">
              <div className="w-40 h-40 bg-[#7a4a36] rounded-md mb-4 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-16 h-16 text-white" fill="currentColor" aria-hidden="true">
                  <path d="M12 3v10.55A4 4 0 1014 17V7h4V3h-6z" />
                </svg>
              </div>
              <div className="text-center text-sm text-[#5f341e] mb-6">Instrumental beats for concentration</div>

              <div className="w-full">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <div></div>
                  <div>{tracks[currentIndex] && typeof tracks[currentIndex].duration === 'string' ? tracks[currentIndex].duration : formatSeconds(duration)}</div>
                </div>
                <div className="w-full h-2 bg-[#efe6e3] rounded-full mb-6 cursor-pointer" onClick={handleSeek}>
                  <div className="h-2 bg-[#7a4a36] rounded-full" style={{ width: duration ? `${Math.min(100, (currentTime / duration) * 100)}%` : '0%' }} />
                </div>

                <div className="flex items-center justify-center gap-6">
                  <button
                    onClick={toggleRepeat}
                    className={`w-8 h-8 flex items-center justify-center rounded-md border ${isRepeat ? 'bg-[#7a4a36] text-white border-[#7a4a36]' : 'bg-white text-[#5f341e] border-[#e6e0dc]'}`}
                    aria-label="Repeat"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M17 1v4l4-4-4-4v4h-8a4 4 0 00-4 4v2h2V5a2 2 0 012-2h8zM7 23v-4L3 23l4 4v-4h8a4 4 0 004-4v-2h-2v2a2 2 0 01-2 2H7z" fill="currentColor" /></svg>
                  </button>

                  <button onClick={handlePrev} className="p-3 rounded bg-white border" aria-label="Previous"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M11 19V5l-7 7 7 7zM20 19V5h-2v14h2z" fill="#5f341e"/></svg></button>

                  <button onClick={handlePlayPause} className="w-16 h-16 rounded-full bg-[#7a4a36] flex items-center justify-center text-white text-xl shadow" aria-label="Play/Pause">
                    {isPlaying ? (
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="#fff"/></svg>
                    ) : (
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M8 5v14l11-7L8 5z" fill="#fff"/></svg>
                    )}
                  </button>

                  <button onClick={handleNext} className="p-3 rounded bg-white border" aria-label="Next"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M13 5v14l7-7-7-7zM4 5v14h2V5H4z" fill="#5f341e"/></svg></button>

                  <button
                    onClick={toggleShuffle}
                    className={`w-8 h-8 flex items-center justify-center rounded-md border ${isShuffle ? 'bg-[#7a4a36] text-white border-[#7a4a36]' : 'bg-white text-[#5f341e] border-[#e6e0dc]'}`}
                    aria-label="Shuffle"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M16 3h5v5l-2.5-2.5L16 8V3zM3 6h2.2l6.4 8.5 1.4-1.1L6.6 6H9l6 8v4H15v-2.2L9.6 11.3 8.2 12.4 14 19H3V6z" fill="currentColor" /></svg>
                  </button>
                </div>
              </div>

              <audio ref={audioRef} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

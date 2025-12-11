import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
import ChatWidget from '../components/ChatWidget'
import { useAuth } from '../context/AuthContext'
import { usePlayer } from '../context/PlayerContext'
import { useModal } from '../context/ModalContext'

export default function Music() {
  const { showModal } = useModal()
  const { user } = useAuth()
  const {
    queue, setQueue,
    index: currentIndex, setIndex: setCurrentIndex,
    isPlaying, setIsPlaying,
    currentTime, duration,
    repeat: isRepeat, setRepeat: setIsRepeat,
    shuffle: isShuffle, setShuffle: setIsShuffle,
    playPause: handlePlayPause,
    select: handleSelect,
    prev: handlePrev,
    next: handleNext,
    seek: seekPct,
    audioRef
  } = usePlayer()
  const [query, setQuery] = useState('')
  const [tracks, setTracks] = useState([])

  const API_BASE = import.meta.env.VITE_API_BASE || ''

  // playback managed globally by PlayerContext

  useEffect(() => {
    fetchTracks()
  }, [user])

  const fetchTracks = async () => {
    try {
      // Fetch only the logged-in user's uploads
      const params = {}
      if (user && user._id) {
        params.owner = user._id
      }
      const res = await axios.get(`${API_BASE}/api/music`, { params })
      setTracks(res.data)
    } catch (err) {
      console.error('Failed to fetch tracks', err)
    }
  }

  // event wiring handled in PlayerProvider

  // Keep the native loop flag in sync (optional but safe)
  // loop handled globally

  useEffect(() => {
    setQueue(tracks)
  }, [tracks, setQueue])

  const filtered = tracks.filter((t) => t.name.toLowerCase().includes(query.toLowerCase()))

  // use global handlePlayPause

  // use global handleSelect

  // use global handlePrev

  // use global handleNext

  function toggleRepeat() {
    setIsRepeat((s) => { const next = !s; if (next) setIsShuffle(false); return next })
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
    if (duration) { seekPct(pct) }
  }

  function handleDelete(e, id) {
    e.stopPropagation()
    if (!window.confirm('Delete this track?')) return

    // Optimistic update or wait for server? Let's wait for server to be safe
    axios.delete(`${API_BASE}/api/music/${id}`)
      .then(() => {
        const idx = tracks.findIndex((t) => t._id === id)
        if (idx === -1) return

        if (idx < currentIndex) {
          setCurrentIndex((c) => c - 1)
        } else if (idx === currentIndex) {
          setIsPlaying(false)
          setCurrentIndex(0)
        }
        setTracks((prev) => prev.filter((t) => t._id !== id))
      })
      .catch((err) => {
        console.error('Delete failed', err)
        showModal('Failed to delete track', 'Error', 'error')
      })
  }

  function handleUpload(e) {
    const file = e.target.files && e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('track', file)
    // Tag upload with current user for ownership on server
    if (user && user._id) {
      formData.append('user_id', user._id)
    }

    axios.post(`${API_BASE}/api/music/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    .then((res) => {
      const newTrack = res.data
      // Add to list immediately
      setTracks((prev) => [...prev, newTrack])
      
      // Calculate duration
      const tempAudio = new Audio()
      tempAudio.src = newTrack.url
      tempAudio.addEventListener('loadedmetadata', () => {
        const durSec = tempAudio.duration || 0
        const m = Math.floor(durSec / 60)
        const sec = Math.floor(durSec % 60).toString().padStart(2, '0')
        const durStr = `${m}:${sec}`

        // Update backend with duration
        axios.put(`${API_BASE}/api/music/${newTrack._id}`, { duration: durStr, durationSeconds: durSec })
          .then((updRes) => {
            // Update local state
            setTracks((prev) => prev.map((t) => t._id === newTrack._id ? updRes.data : t))
          })
          .catch(err => console.error('Failed to update duration', err))
      })
    })
    .catch((err) => {
      console.error('Upload failed', err)
      showModal('Upload failed', 'Error', 'error')
    })
  }

  function formatSeconds(s) {
    if (!s || isNaN(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
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
                  <div
                    key={t._id}
                    onClick={() => handleSelect(tracks.indexOf(t))}
                    className={`w-full text-left p-4 rounded-lg flex items-center gap-4 border cursor-pointer ${tracks.indexOf(t) === currentIndex ? 'shadow-md bg-[#fff5f2]' : 'bg-white'}`}>
                    <div className="w-10 h-10 rounded-full bg-[#7a4a36] flex items-center justify-center text-white">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 4v8.8c-.58-.19-1.23-.3-1.9-.3-2.1 0-3.8 1.17-3.8 2.6s1.7 2.6 3.8 2.6 3.8-1.17 3.8-2.6V8h7V4H9Z" fill="#fff"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-[#5f341e]">{t.name}</div>
                      <div className="text-xs text-gray-500">{t.duration}</div>
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, t._id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right card (narrower) */}
            <div className="bg-white rounded-xl p-6 lg:w-1/3 h-[480px] flex flex-col items-center justify-between">
              <div className="w-40 h-40 bg-[#7a4a36] rounded-md mb-4 flex items-center justify-center">
                {/* Simple music note icon */}
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 4v10.35c-.6-.23-1.26-.35-1.95-.35-2.21 0-4 1.34-4 3s1.79 3 4 3 4-1.34 4-3V8h7V4H9Z" fill="#fff"/>
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

              {/* audio element is provided globally by PlayerProvider */}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
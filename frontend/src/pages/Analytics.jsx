import React, { useState, useRef, useEffect, useMemo } from 'react'
import Sidebar from '../components/Sidebar'
import ChatWidget from '../components/ChatWidget'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

export default function Analytics() {
  const { user } = useAuth()
  const [summary, setSummary] = useState({ totalSessions: 0, totalDurationSeconds: 0, byMode: [] })
  const [weekly, setWeekly] = useState([])
  const formatHMS = (secs) => {
    const s = Math.max(0, Math.floor(secs || 0))
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const ss = s % 60
    const pad = (n) => String(n).padStart(2, '0')
    return `${h}:${pad(m)}:${pad(ss)}`
  }
  const stats = [
    { label: 'Time Studied', value: formatHMS(summary.totalDurationSeconds || 0) },
    { label: 'Total Sessions', value: summary.totalSessions || 0 },
    { label: 'Active Modes', value: (summary.byMode || []).length },
  ]

  // Dropdown state for chart range selectors
  const [lineOpen, setLineOpen] = useState(false)
  const [donutOpen, setDonutOpen] = useState(false)

  // keys represent number of points shown for the line chart
  const [lineRangeKey, setLineRangeKey] = useState('7')
  const [donutRangeKey, setDonutRangeKey] = useState('7')

  const lineRangeLabel = lineRangeKey === '7' ? 'Last 7 days' : lineRangeKey === '4' ? 'Last 30 days' : 'Last year'
  const donutRangeLabel = donutRangeKey === '7' ? 'Last 7 days' : donutRangeKey === '4' ? 'Last 30 days' : donutRangeKey === '12' ? 'Last year' : 'All time'

  const lineRangeOptions = [
    { key: '7', label: 'Last 7 days' },
    { key: '4', label: 'Last 30 days' },
    { key: '12', label: 'Last year' },
  ]
  const donutRangeOptions = [
    { key: '7', label: 'Last 7 days' },
    { key: '4', label: 'Last 30 days' },
    { key: '12', label: 'Last year' },
    { key: 'all', label: 'All time' },
  ]

  const lineBtnRef = useRef(null)
  const donutBtnRef = useRef(null)

  useEffect(() => {
    function onDocClick(e) {
      if (lineBtnRef.current && !lineBtnRef.current.contains(e.target)) setLineOpen(false)
      if (donutBtnRef.current && !donutBtnRef.current.contains(e.target)) setDonutOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  // Mock datasets (one value per point). Values scaled for visual plotting.
  const mockData = useMemo(() => ({
    '7': weekly.slice(-7).map(w => Math.round((w.duration || 0)/3600)),
    '4': weekly.slice(-4).map(w => Math.round((w.duration || 0)/3600)),
    '12': weekly.slice(-12).map(w => Math.round((w.duration || 0)/3600)),
  }), [weekly])

  // Build SVG path and points so the line passes through each dot
  function buildLineChart(values, innerWidth = 520, innerHeight = 180) {
    if (!values || values.length === 0) return { path: '', points: [] }
    const max = Math.max(...values)
    const min = Math.min(...values)
    const padTop = 8
    const padBottom = 8
    const h = innerHeight - padTop - padBottom
    const count = values.length
    const step = count === 1 ? 0 : innerWidth / (count - 1)
    const points = values.map((v, i) => {
      const x = Math.round(i * step)
      const t = max === min ? 0.5 : (v - min) / (max - min)
      const y = Math.round(padTop + (1 - t) * h)
      return { x, y, v }
    })
    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    return { path, points }
  }

  const lineValues = mockData[lineRangeKey] || []
  const { path: linePath, points: linePoints } = buildLineChart(lineValues)

  useEffect(() => {
    async function load() {
      if (!user?._id) return
      try {
        const base = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
        const [sRes, wRes] = await Promise.all([
          axios.get(`${base}/api/analytics/summary`, { params: { userId: user._id } }),
          axios.get(`${base}/api/analytics/weekly`, { params: { userId: user._id, weeks: 12 } })
        ])
        setSummary(sRes.data || { totalSessions: 0, totalDurationSeconds: 0, byMode: [] })
        setWeekly((wRes.data?.weeks || []).map(x => ({ label: x.label, duration: x.duration, sessions: x.sessions })))
      } catch (err) {
        console.error('Load analytics failed', err)
      }
    }
    load()
  }, [user?._id])

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8 ml-20 md:ml-30 mr-7.5">
   
        <ChatWidget />

        <div className="max-w-full mx-auto">
          <header className="mb-8">
            <h1 className="text-5xl font-bold transition-colors duration-300 text-[#6F422B]">Analytics</h1>
            <p className="mt-1 text-xl transition-colors duration-300 text-[#5C4333]">Understand your learning journey with smart insights.</p>
          </header>

          <div className="flex flex-wrap gap-4 mb-8">
            {stats.map((s, i) => (
              <div key={i} className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm w-72">
                <div>
                  <p className="text-xs text-[#5C4333]">{s.label}</p>
                  <div className="mt-2 text-3xl font-bold text-[#6F422B]">{s.value}</div>
                </div>
                <div className="w-12 h-12 rounded-lg bg-[#6F422B] flex items-center justify-center">
                  {/* Simple icon inside the brown square */}
                  {i === 0 && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="9" stroke="#FFFFFF" strokeWidth="2" />
                      <path d="M12 6v6l4 2" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {i === 1 && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 20V10" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                      <path d="M10 20V6" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                      <path d="M16 20V13" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                      <path d="M22 20V8" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                  {i === 2 && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 18h18" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                      <path d="M6 15l6-9 6 9" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-white rounded-2xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#6F422B]">Study Progress</h3>
                <div className="relative" ref={lineBtnRef}>
                  <button
                    onClick={() => setLineOpen(v => !v)}
                    className="text-sm text-[#5C4333] border border-[#E9D8D0] px-3 py-1 rounded"
                    aria-expanded={lineOpen}
                  >
                    {lineRangeLabel} ▾
                  </button>

                  {lineOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-white rounded shadow-md z-40">
                      <ul className="py-1">
                        {lineRangeOptions.map(opt => (
                          <li key={opt.key}>
                            <button
                              className="w-full text-left px-3 py-2 text-sm text-[#5C4333] hover:bg-[#f3e6df]"
                              onClick={() => { setLineRangeKey(opt.key); setLineOpen(false) }}
                            >
                              {opt.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="h-64 bg-white rounded-lg p-4">
                <svg className="w-full h-full" viewBox="0 0 600 260" preserveAspectRatio="none">
                  <rect width="100%" height="100%" fill="#fff" rx="12" />
                  <g transform="translate(40,20)">
                    {[0,1,2,3,4,5,6].map((r,i)=> (
                      <line key={i} x1={0} x2={520} y1={(i*34)} y2={(i*34)} stroke="#f3e6df" strokeWidth="1" />
                    ))}
                    <path d={linePath} fill="none" stroke="#E59C5C" strokeWidth="3" strokeLinecap="round" />
                    {linePoints.map((p, i) => (
                      <circle key={i} cx={p.x} cy={p.y} r="5" fill="#6F422B" stroke="#fff" strokeWidth="2" />
                    ))}
                  </g>
                </svg>
                <div className="mt-3 text-xs text-[#5C4333] flex justify-between">
                  {/* x-axis labels: for 7 days show Mon..Sun, for 4 show W1..W4, for 12 show M1..M12 */}
                  {lineRangeKey === '7' && ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d,i)=>(<span key={i}>{d}</span>))}
                  {lineRangeKey === '4' && ['Wk1','Wk2','Wk3','Wk4'].map((d,i)=>(<span key={i}>{d}</span>))}
                  {lineRangeKey === '12' && ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((d,i)=>(<span key={i} className="text-xs">{d}</span>))}
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#6F422B]">Time by Study Mode</h3>
                <div className="relative" ref={donutBtnRef}>
                  <button
                    onClick={() => setDonutOpen(v => !v)}
                    className="text-sm text-[#5C4333] border border-[#E9D8D0] px-3 py-1 rounded"
                    aria-expanded={donutOpen}
                  >
                    {donutRangeLabel} ▾
                  </button>

                  {donutOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-white rounded shadow-md z-40">
                      <ul className="py-1">
                        {donutRangeOptions.map(opt => (
                          <li key={opt.key}>
                            <button
                              className="w-full text-left px-3 py-2 text-sm text-[#5C4333] hover:bg-[#f3e6df]"
                              onClick={() => { setDonutRangeKey(opt.key); setDonutOpen(false) }}
                            >
                              {opt.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-8">
                <svg width="260" height="180" viewBox="0 0 260 180" className="flex-shrink-0">
                  <circle cx="130" cy="90" r="56" fill="#fff" />
                  {(() => {
                    const total = (summary.byMode || []).reduce((a,b)=> a + (b.duration||0), 0)
                    const colors = ['#6F422B','#E59C5C','#CFA88F','#F6E6DA','#E9D8D0','#B37A5D']
                    let acc = 0
                    return (summary.byMode || []).map((m, idx) => {
                      const frac = total > 0 ? (m.duration || 0) / total : 0
                      const dash = Math.max(0, Math.round(frac * 2 * Math.PI * 56))
                      const gap = Math.round((2 * Math.PI * 56) - dash)
                      const rotate = (acc / (2 * Math.PI * 56)) * 360
                      acc += dash
                      return (
                        <circle key={m.mode} cx="130" cy="90" r="56" stroke={colors[idx%colors.length]} strokeWidth="26" strokeDasharray={`${dash} ${gap}`} strokeLinecap="butt" fill="none" transform={`rotate(${rotate-90} 130 90)`} />
                      )
                    })
                  })()}
                  <circle cx="130" cy="90" r="30" fill="#fff" />
                </svg>

                <ul className="text-sm text-[#5C4333] space-y-3">
                  {(summary.byMode || []).map((m, idx) => (
                    <li key={m.mode} className="flex items-center">
                      <span className="inline-block w-3 h-3 mr-3 rounded-sm" style={{ backgroundColor: ['#6F422B','#E59C5C','#CFA88F','#F6E6DA','#E9D8D0','#B37A5D'][idx%6] }}></span>
                      {m.mode} — {Math.round((m.duration||0)/3600)}h
                    </li>
                  ))}
                  {(summary.byMode || []).length === 0 && <li className="text-[#5C4333]">No study sessions yet.</li>}
                </ul>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}


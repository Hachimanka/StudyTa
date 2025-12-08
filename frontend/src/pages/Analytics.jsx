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

  const lineRangeLabel = lineRangeKey === '7' ? 'Last 7 days' : lineRangeKey === '30' ? 'Last 30 days' : 'Last year'
  const donutRangeLabel = donutRangeKey === '7' ? 'Last 7 days' : donutRangeKey === '30' ? 'Last 30 days' : donutRangeKey === '365' ? 'Last year' : 'All time'

  const lineRangeOptions = [
    { key: '7', label: 'Last 7 days' },
    { key: '30', label: 'Last 30 days' },
    { key: '365', label: 'Last year' },
  ]
  const donutRangeOptions = [
    { key: '7', label: 'Last 7 days' },
    { key: '30', label: 'Last 30 days' },
    { key: '365', label: 'Last year' },
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

  // Mock datasets fallback for offline/dev
  const mockData = useMemo(() => ({
    '7': weekly.slice(-7).map(w => Math.round((w.duration || 0) / 60)),
    '4': weekly.slice(-4).map(w => Math.round((w.duration || 0) / 60)),
    '12': weekly.slice(-12).map(w => Math.round((w.duration || 0) / 60)),
  }), [weekly])

  // No server-side chart endpoints used here; derive chart data from weekly summary

  // Build SVG path and points so the line passes through each dot
  // Scale always starts at 0 (so Y axis restarts at 0) and max is rounded up to nearest hour (60 minutes)
  function buildLineChart(values, innerWidth = 520, innerHeight = 180) {
    if (!values || values.length === 0) return { path: '', points: [], padTop: 8, h: innerHeight - 16, scaleMaxHours: 1, hours: [0,1] }
    const padTop = 8
    const padBottom = 8
    const h = innerHeight - padTop - padBottom
    const count = values.length
    const step = count === 1 ? 0 : innerWidth / (count - 1)

    // scale from 0 to nearest-hour-above-max, but do not add extra padding
    // unless the base exceeds 5 hours — in that case add one extra hour
    const maxVal = Math.max(...values, 0)
    const baseHours = Math.ceil(maxVal / 60)
    let scaleMaxHours = Math.max(1, baseHours)
    if (baseHours > 5) scaleMaxHours = baseHours + 1
    const scaleMaxMinutes = scaleMaxHours * 60

    const points = values.map((v, i) => {
      const x = Math.round(i * step)
      const t = scaleMaxMinutes === 0 ? 0.5 : (v / scaleMaxMinutes)
      const y = Math.round(padTop + (1 - t) * h)
      return { x, y, v }
    })
    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

    // generate integer hours from 0 .. scaleMaxHours
    const hours = Array.from({ length: scaleMaxHours + 1 }, (_, i) => i)

    return { path, points, padTop, h, scaleMaxHours, hours }
  }

  // prefer server-provided line values, fallback to mock data
  // prefer server-provided line values, fallback to zeros (no fake activity)
  // For 7-day view, map dates to Monday..Sunday so chart always starts on Monday
  let lineValues = []
  if (lineRangeKey === '7') {
    // last 7 entries from weekly; convert seconds to minutes
    const last7 = weekly.slice(-7)
    lineValues = last7.map(w => Math.round((w.duration || 0) / 60))
  } else if (lineRangeKey === '30') {
    const last30 = weekly.slice(-30)
    lineValues = last30.map(w => Math.round((w.duration || 0) / 60))
    // if backend only returns weeks, we might have fewer than 30 points
    if (lineValues.length === 0) lineValues = Array.from({ length: 30 }, () => 0)
  } else {
    // 365 -> show monthly aggregates; weekly may carry labels as dates
    const last12 = weekly.slice(-12)
    lineValues = last12.map(w => Math.round((w.duration || 0) / 60))
    if (lineValues.length === 0) lineValues = Array.from({ length: 12 }, () => 0)
  }
  const { path: linePath, points: linePoints, padTop, h, scaleMaxHours, hours } = buildLineChart(lineValues)

  // helper to format x-axis labels
  function formatXAxisLabels() {
    if (lineRangeKey === '7') return weekly.slice(-7).map(w => {
      try { return new Date(w.label).toLocaleDateString(undefined, { weekday: 'short' }) } catch { return 'Day' }
    })
    if (lineRangeKey === '30') return weekly.slice(-30).map(w => {
      try { return new Date(w.label).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) } catch { return 'D' }
    })
    return weekly.slice(-12).map(w => {
      try { return new Date(w.label).toLocaleDateString(undefined, { month: 'short' }) } catch { return 'M' }
    })
  }

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
                  <p className="text-lg text-[#5C4333]">{s.label}</p>
                  <div className="mt-2 text-3xl font-bold text-[#6F422B]">{s.value}</div>
                </div>
                <div className="w-12 h-12 flex items-center justify-center">
                  {s.label === 'Hours Studied' ? (
                    <svg viewBox="0 0 57 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                      <path d="M56.9517 70.5589C55.3946 56.8286 49.1431 51.1375 44.5769 46.9875C41.42 44.1071 39.9021 42.6089 39.9021 40C39.9021 37.4268 41.4146 35.9571 44.5627 33.1357C49.1823 28.9982 55.5087 23.3304 56.9553 9.41432C57.071 8.24518 56.9404 7.06472 56.5722 5.94934C56.2039 4.83396 55.6061 3.8085 54.8174 2.93933C53.9752 2.01095 52.9482 1.26975 51.8028 0.763499C50.6573 0.257246 49.4187 -0.00282594 48.1668 4.38619e-05H8.8332C7.57958 -0.0038812 6.33907 0.255666 5.1917 0.761938C4.04433 1.26821 3.0156 2.00996 2.17189 2.93933C1.38561 3.8097 0.790062 4.8356 0.423671 5.95086C0.05728 7.06612 -0.0718226 8.24597 0.0446911 9.41432C1.48598 23.2857 7.7892 28.9125 12.391 33.0197C15.5693 35.8572 17.0979 37.3375 17.0979 40C17.0979 42.6964 15.5658 44.2071 12.3768 47.0982C7.83374 51.2232 1.59822 56.8714 0.048255 70.5589C-0.0774836 71.7227 0.0431793 72.9001 0.402362 74.014C0.761546 75.1279 1.35117 76.1533 2.1327 77.0232C2.97818 77.9634 4.01189 78.7145 5.16641 79.2274C6.32094 79.7403 7.57035 80.0035 8.8332 80H48.1668C49.4296 80.0035 50.6791 79.7403 51.8336 79.2274C52.9881 78.7145 54.0218 77.9634 54.8673 77.0232C55.6488 76.1533 56.2385 75.1279 56.5976 74.014C56.9568 72.9001 57.0775 71.7227 56.9517 70.5589ZM44.0531 71.4285H13.0235C10.2442 71.4285 9.46031 68.2143 11.4094 66.2214C16.127 61.4286 25.6495 57.9964 25.6495 52.5V34.2857C25.6495 30.7411 18.8795 28.0357 14.691 22.2857C13.9998 21.3375 14.0692 20 15.8259 20H41.2543C42.7526 20 43.0751 21.3268 42.3945 22.2768C38.2666 28.0357 31.3505 30.7232 31.3505 34.2857V52.5C31.3505 57.9518 41.2757 60.8928 45.6744 66.2268C47.447 68.3768 46.8271 71.4285 44.0531 71.4285Z" fill="#71412A"/>
                    </svg>
                  ) : s.label === 'Topics Covered' ? (
                    <svg viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                      <path d="M54.2973 0C57.0512 0 59.8134 0.447179 61.7415 2.43282C63.6408 4.39385 64 7.10974 64 9.64103V58.0513C64 60.279 63.7027 62.4697 62.5549 64.2421C61.8927 65.2643 60.9657 66.0905 59.8712 66.6339V70.359C59.8712 73.0913 59.4253 75.8359 57.4311 77.7518C55.4575 79.6472 52.7243 80 50.1768 80H6.19684C4.5543 80 2.97903 79.3517 1.81758 78.1976C0.656134 77.0435 0.00363936 75.4783 0.00363936 73.8462V15.4544C-0.00874703 13.4113 -0.021133 10.8595 0.540384 8.53333C1.22989 5.69436 2.81948 2.94154 6.20096 1.23077C7.5965 0.525128 9.06635 0.246154 10.6353 0.123077C12.1423 -1.14624e-07 13.9796 0 16.1885 0H54.2973ZM50.1768 73.8462C52.4352 73.8462 52.9967 73.4523 53.1247 73.3292C53.228 73.2308 53.678 72.6933 53.678 70.359V67.6923H12.39C10.7475 67.6923 9.17223 68.3407 8.01078 69.4947C6.84933 70.6488 6.19684 72.2141 6.19684 73.8462H50.1768ZM43.7771 25.3949C44.0157 25.0676 44.1871 24.6968 44.2814 24.3037C44.3758 23.9106 44.3913 23.5029 44.3271 23.1038C44.2629 22.7048 44.1202 22.3222 43.9072 21.9779C43.6941 21.6337 43.415 21.3345 43.0856 21.0974C42.7562 20.8604 42.383 20.6901 41.9874 20.5964C41.5918 20.5026 41.1815 20.4872 40.7799 20.551C40.3783 20.6148 39.9933 20.7566 39.6468 20.9683C39.3003 21.1799 38.9992 21.4573 38.7607 21.7846L28.5708 35.8031L24.4213 31.0933C23.8751 30.5005 23.117 30.1436 22.3093 30.099C21.5016 30.0544 20.7084 30.3257 20.0994 30.8547C19.4904 31.3838 19.1139 32.1286 19.0505 32.9299C18.987 33.7312 19.2417 34.5254 19.7599 35.1426L25.4577 41.6082C27.2867 43.6882 30.5939 43.5364 32.2206 41.2923L43.7771 25.3949Z" fill="#71412A"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 62 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                      <path d="M56.1097 36.4455C55.0913 35.1121 53.8516 33.9565 52.7003 32.8009C49.7337 30.1342 46.3686 28.223 43.5349 25.4229C36.9375 18.9339 35.4764 8.22246 39.6827 0C35.4764 1.02225 31.8013 3.33343 28.6576 5.86683C17.1897 15.1115 12.6734 31.4231 18.0753 45.4235C18.2524 45.868 18.4295 46.3124 18.4295 46.8902C18.4295 47.868 17.7653 48.7569 16.8798 49.1125C15.8614 49.557 14.7987 49.2903 13.9574 48.5792C13.7061 48.3679 13.496 48.1117 13.3376 47.8236C8.33418 41.4678 7.53718 32.3565 10.9023 25.0674C3.50792 31.112 -0.521339 41.3345 0.0542699 50.9792C0.319936 53.2015 0.585601 55.4238 1.33832 57.6461C1.95821 60.3128 3.1537 62.9796 4.48203 65.3352C9.26401 73.0243 17.5439 78.5356 26.4437 79.6467C35.9191 80.8467 46.0587 79.1134 53.3202 72.5354C61.423 65.1574 64.2568 53.3349 60.0947 43.2012L59.5191 42.0456C58.5893 40.0011 56.1097 36.4455 56.1097 36.4455ZM42.118 64.4463C40.8782 65.513 38.8414 66.6686 37.2475 67.113C32.2884 68.8909 27.3293 66.4019 24.407 63.4685C29.676 62.224 32.8197 58.3128 33.7495 54.3571C34.5022 50.8014 33.0854 47.868 32.5098 44.4457C31.9784 41.1567 32.067 38.3566 33.2625 35.2899C34.1037 36.9788 34.9893 38.6678 36.052 40.0011C39.4613 44.4457 44.8189 46.4013 45.9701 52.4459C46.1473 53.0682 46.2358 53.6904 46.2358 54.3571C46.3686 58.0016 44.7747 62.0018 42.118 64.4463Z" fill="#71412A"/>
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
                    {(() => {
                      // Show labels 0..N where N = max(5, scaleMaxHours)
                      const maxLabel = Math.max(5, scaleMaxHours || 0)
                      const display = Array.from({ length: maxLabel + 1 }, (_, i) => i)
                      return display.map((hr) => {
                        // Position labels evenly from bottom (0h) to top (Nh)
                        const ratio = hr / (maxLabel || 1)
                        const yPos = Math.round(padTop + (1 - ratio) * h)
                        return (
                          <g key={hr}>
                            <line x1={0} x2={520} y1={yPos} y2={yPos} stroke="#f3e6df" strokeWidth="1" />
                            <text x={-12} y={yPos + 4} fontSize="11" fill="#5C4333" textAnchor="end">{`${hr}h`}</text>
                          </g>
                        )
                      })
                    })()}
                    <path d={linePath} fill="none" stroke="#E59C5C" strokeWidth="3" strokeLinecap="round" />
                    {linePoints.map((p, i) => (
                      <circle key={i} cx={p.x} cy={p.y} r="5" fill="#6F422B" stroke="#fff" strokeWidth="2" />
                    ))}
                  </g>
                </svg>
                <div className="mt-3 text-xs text-[#5C4333] flex justify-between">
                  {(() => {
                    const labels = formatXAxisLabels()
                    return labels.slice(0, lineValues.length).map((d, i) => (<span key={i}>{d}</span>))
                  })()}
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#6F422B]">Time per Topic</h3>
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


import React, { useState, useRef, useEffect, useMemo } from 'react'
import Sidebar from '../components/Sidebar'
import ChatWidget from '../components/ChatWidget'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import axios from 'axios'

export default function Analytics() {
  const { user } = useAuth()
  const { darkMode } = useSettings()
  const [summary, setSummary] = useState({ totalSessions: 0, totalDurationSeconds: 0, byMode: [] })
  const [weekly, setWeekly] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lineRangeKey, setLineRangeKey] = useState('7') // '7' | '30' | '365'
  const formatHMS = (secs) => {
    const s = Math.max(0, Math.floor(secs || 0))
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const ss = s % 60
    const pad = (n) => String(n).padStart(2, '0')
    return `${h}:${pad(m)}:${pad(ss)}`
  }
  const studyStreak = useMemo(() => {
    try {
      if (!weekly || weekly.length === 0) return 0
      let count = 0
      for (let i = weekly.length - 1; i >= 0; i--) {
        if ((weekly[i].sessions || 0) > 0) count++
        else break
      }
      return count
    } catch (e) { return 0 }
  }, [weekly])

  const stats = [
    { label: 'Time Studied', value: formatHMS(summary.totalDurationSeconds || 0) },
    { label: 'Total Sessions', value: summary.totalSessions || 0 },
    { label: 'Study Streak', value: studyStreak },
  ]

  // Saved study sets for Time per Topic (from localStorage)
  const [savedStudySets, setSavedStudySets] = useState([])

  // Load saved study sets from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('studyta_saved_sets')
      if (raw) {
        const sets = JSON.parse(raw)
        if (Array.isArray(sets)) {
          setSavedStudySets(sets)
        }
      }
    } catch (e) {
      console.warn('Failed to load saved study sets', e)
    }
  }, [])

  // Mock datasets fallback for offline/dev
  const mockData = useMemo(() => ({
    '7': weekly.slice(-7).map(w => Math.round((w.duration || 0) / 60)),
    '4': weekly.slice(-4).map(w => Math.round((w.duration || 0) / 60)),
    '12': weekly.slice(-12).map(w => Math.round((w.duration || 0) / 60)),
  }), [weekly])

  // No server-side chart endpoints used here; derive chart data from weekly summary

  // Build SVG path and points so the line passes through each dot
  // Y-axis shows hour labels with appropriate spacing for readability
  function buildLineChart(values, innerWidth = 520, innerHeight = 180) {
    if (!values || values.length === 0) {
      // Return empty chart with proper defaults (0-4 hours, showing 0, 2, 4)
      const padTop = 8;
      const h = innerHeight - padTop - 8;
      return { 
        path: '', 
        points: [], 
        padTop, 
        h, 
        scaleMaxHours: 4, 
        hourLabels: [0, 2, 4] 
      };
    }
    
    const padTop = 8;
    const padBottom = 8;
    const h = innerHeight - padTop - padBottom;
    const count = values.length;
    const step = count === 1 ? 0 : innerWidth / (count - 1);

    // Convert minutes to hours for display, capped at 24 hours per day
    const hoursValues = values.map(v => Math.min(v / 60, 24));
    const maxVal = Math.max(...hoursValues, 0);
    
    // Scale based on max value, round up to nice intervals for readability
    // Use intervals: 4, 6, 8, 12, 16, 20, 24 hours
    let scaleMaxHours;
    if (maxVal <= 4) scaleMaxHours = 4;
    else if (maxVal <= 6) scaleMaxHours = 6;
    else if (maxVal <= 8) scaleMaxHours = 8;
    else if (maxVal <= 12) scaleMaxHours = 12;
    else if (maxVal <= 16) scaleMaxHours = 16;
    else if (maxVal <= 20) scaleMaxHours = 20;
    else scaleMaxHours = 24;

    const points = hoursValues.map((v, i) => {
      const x = Math.round(i * step);
      const t = scaleMaxHours === 0 ? 0 : (v / scaleMaxHours);
      const y = Math.round(padTop + (1 - t) * h);
      return { x, y, v: Math.round(v * 100) / 100 }; // Round to 2 decimals
    });
    
    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    
    // Generate hour labels with 2-hour increments for readability (max ~5 labels)
    const labelStep = scaleMaxHours <= 6 ? 2 : scaleMaxHours <= 12 ? 3 : 4;
    const hourLabels = [];
    for (let i = 0; i <= scaleMaxHours; i += labelStep) {
      hourLabels.push(i);
    }
    // Ensure max is always shown
    if (hourLabels[hourLabels.length - 1] !== scaleMaxHours) {
      hourLabels.push(scaleMaxHours);
    }

    return { path, points, padTop, h, scaleMaxHours, hourLabels };
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
  
  const { path: linePath, points: linePoints, padTop, h, scaleMaxHours, hourLabels } = buildLineChart(lineValues)
  const xAxisLabels = formatXAxisLabels()

  // helper to format x-axis labels
  function formatXAxisLabels() {
    if (lineRangeKey === '7') return weekly.slice(-7).map(w => {
      try { 
        // w.label is YYYY-MM-DD, which parses correctly
        const d = new Date(w.label);
        // Adjust for timezone offset if needed, but usually YYYY-MM-DD is parsed as UTC in some envs and local in others.
        // To be safe, we can just use the weekday from the date object.
        // Appending 'T00:00:00' ensures local time parsing in most browsers or use UTC methods.
        // Actually, just splitting the string is safer to avoid timezone shifts.
        const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        // Create date using components to avoid timezone issues
        const parts = w.label.split('-');
        const dateObj = new Date(parts[0], parts[1]-1, parts[2]); 
        return days[dateObj.getDay()];
      } catch { return 'Day' }
    })
    if (lineRangeKey === '30') return weekly.slice(-30).map(w => {
      try { 
         const parts = w.label.split('-');
         const dateObj = new Date(parts[0], parts[1]-1, parts[2]);
         return dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      } catch { return 'D' }
    })
    return weekly.slice(-12).map(w => {
      try { return new Date(w.label).toLocaleDateString(undefined, { month: 'short' }) } catch { return 'M' }
    })
  }

  useEffect(() => {
    async function load() {
      if (!user?._id) return
      try {
        setLoading(true)
        setError('')
        const base = import.meta.env.VITE_API_BASE || import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
        const [sRes, wRes] = await Promise.all([
          axios.get(`${base}/api/analytics/summary`, { params: { userId: user._id } }),
          axios.get(`${base}/api/analytics/daily`, { params: { userId: user._id, days: 30 } })
        ])
        setSummary(sRes.data || { totalSessions: 0, totalDurationSeconds: 0, byMode: [] })
        setWeekly((wRes.data?.days || []).map(x => ({ label: x.label, duration: x.duration, sessions: x.sessions })))
        setLoading(false)
      } catch (err) {
        console.error('Load analytics failed', err)
        setError(err?.response?.data?.error || err?.message || 'Failed to load analytics')
        setLoading(false)
      }
    }
    load()
  }, [user?._id])

  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#1f1b16]' : 'bg-[#F2D9C7]'}`}>
      <Sidebar />

      <main className="flex-1 p-12 ml-20 md:ml-30 mr-7.5">
   
        <ChatWidget />

        <div className="max-w-full mx-auto">
          <header className="mb-8">
            <h1 className={`text-6xl font-bold transition-colors duration-300 ${darkMode ? 'text-[#F5E9DF]' : 'text-[#6F422B]'}`}>Analytics</h1>
            <p className={`mt-1 text-xl transition-colors duration-300 ${darkMode ? 'text-[#8D5A3F]' : 'text-[#8D5A3F]'}`}>Understand your learning journey with smart insights.</p>
          </header>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Error loading analytics</p>
              <p>{error}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-4 mb-8">
            {stats.map((s, i) => (
              <div key={i} className={`flex items-center justify-between rounded-2xl p-4 shadow-sm w-72 transition-colors duration-300 ${darkMode ? 'bg-[#2e2119]' : 'bg-white'}`}>
                <div>
                  <p className={`text-lg ${darkMode ? 'text-[#d4c4b5]' : 'text-[#5C4333]'}`}>{s.label}</p>
                  <div className={`mt-2 text-3xl font-bold ${darkMode ? 'text-[#f5e9df]' : 'text-[#6F422B]'}`}>{s.value}</div>
                </div>
                <div className="w-12 h-12 flex items-center justify-center">
                  {s.label === 'Time Studied' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-10 h-10 ${darkMode ? 'text-[#E59C5C]' : 'text-[#6F422B]'}`}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  ) : s.label === 'Total Sessions' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-10 h-10 ${darkMode ? 'text-[#E59C5C]' : 'text-[#6F422B]'}`}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6A2.25 2.25 0 0 1 6 3.75h1.5m9 0h-9" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-10 h-10 ${darkMode ? 'text-[#E59C5C]' : 'text-[#6F422B]'}`}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className={`rounded-2xl p-6 shadow-md transition-colors duration-300 ${darkMode ? 'bg-[#2e2119]' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-[#f5e9df]' : 'text-[#6F422B]'}`}>Study Progress</h3>
                <span className={`text-sm border px-3 py-1 rounded ${darkMode ? 'text-[#d4c4b5] border-[#3d2f24]' : 'text-[#5C4333] border-[#E9D8D0]'}`}>
                  This Week
                </span>
              </div>

              <div className={`h-64 rounded-lg p-4 ${darkMode ? 'bg-[#1f1b16]' : 'bg-white'}`}>
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${darkMode ? 'border-[#E59C5C]' : 'border-[#6F422B]'}`}></div>
                  </div>
                ) : (
                  <svg className="w-full h-full" viewBox="0 0 600 260" preserveAspectRatio="none">
                    <rect width="100%" height="100%" fill={darkMode ? '#1f1b16' : '#fff'} rx="12" />
                    <g transform="translate(40,20)">
                      {(() => {
                        // Show hour labels on Y-axis
                        const labels = hourLabels || [0, 0.5, 1, 1.5, 2];
                        const maxLabel = scaleMaxHours || 2;
                        return labels.map((hrs, idx) => {
                          // Position labels evenly from bottom (0h) to top (max)
                          const ratio = hrs / maxLabel;
                          const yPos = Math.round(padTop + (1 - ratio) * h);
                          return (
                            <g key={idx}>
                              <line x1={0} x2={520} y1={yPos} y2={yPos} stroke={darkMode ? '#3d2f24' : '#f3e6df'} strokeWidth="1" />
                              <text x={-8} y={yPos + 4} fontSize="11" fill={darkMode ? '#d4c4b5' : '#5C4333'} textAnchor="end">{`${hrs}h`}</text>
                            </g>
                          );
                        });
                      })()}
                      <path d={linePath} fill="none" stroke="#E59C5C" strokeWidth="3" strokeLinecap="round" />
                      {linePoints.map((p, i) => (
                        <g key={i}>
                          <circle cx={p.x} cy={p.y} r="5" fill={darkMode ? '#E59C5C' : '#6F422B'} stroke={darkMode ? '#1f1b16' : '#fff'} strokeWidth="2" />
                          {/* Show value tooltip on hover area */}
                          <title>{`${p.v}h`}</title>
                        </g>
                      ))}
                    </g>
                  </svg>
                )}
                <div className={`mt-3 text-xs flex justify-between ${darkMode ? 'text-[#d4c4b5]' : 'text-[#5C4333]'}`}>
                  {xAxisLabels.map((d, i) => (<span key={i}>{d}</span>))}
                </div>
              </div>
            </section>

            <section className={`rounded-2xl p-6 shadow-md transition-colors duration-300 ${darkMode ? 'bg-[#2e2119]' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-[#f5e9df]' : 'text-[#6F422B]'}`}>Time per Mode</h3>
                <span className={`text-sm border px-3 py-1 rounded ${darkMode ? 'text-[#d4c4b5] border-[#3d2f24]' : 'text-[#5C4333] border-[#E9D8D0]'}`}>
                  All Sessions
                </span>
              </div>

              <div className="flex items-center gap-8">
                <svg width="260" height="180" viewBox="0 0 260 180" className="flex-shrink-0">
                  <circle cx="130" cy="90" r="56" fill={darkMode ? '#1f1b16' : '#fff'} />
                  {(() => {
                    const modes = (summary.byMode || []).filter(m => (m.mode || '').toLowerCase() !== 'custom')
                    const total = modes.reduce((a,b)=> a + (b.duration||0), 0)
                    const colors = darkMode ? ['#E59C5C','#d4a88a','#a07860','#6F422B','#5a3520','#3d2f24'] : ['#6F422B','#E59C5C','#CFA88F','#F6E6DA','#E9D8D0','#B37A5D']
                    let acc = 0
                    return modes.map((m, idx) => {
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
                  <circle cx="130" cy="90" r="30" fill={darkMode ? '#1f1b16' : '#fff'} />
                </svg>

                <ul className={`text-sm space-y-3 ${darkMode ? 'text-[#d4c4b5]' : 'text-[#5C4333]'}`}>
                  {((summary.byMode || []).filter(m => (m.mode || '').toLowerCase() !== 'custom')).map((m, idx) => (
                    <li key={m.mode} className="flex items-center">
                      <span className="inline-block w-3 h-3 mr-3 rounded-sm" style={{ backgroundColor: darkMode ? ['#E59C5C','#d4a88a','#a07860','#6F422B','#5a3520','#3d2f24'][idx%6] : ['#6F422B','#E59C5C','#CFA88F','#F6E6DA','#E9D8D0','#B37A5D'][idx%6] }}></span>
                      {m.mode} — {Math.round((m.duration||0)/60)}m
                    </li>
                  ))}
                  {((summary.byMode || []).filter(m => (m.mode || '').toLowerCase() !== 'custom')).length === 0 && <li className={darkMode ? 'text-[#d4c4b5]' : 'text-[#5C4333]'}>No study sessions yet.</li>}
                </ul>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
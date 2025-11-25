import React, { useState, useRef, useEffect, useMemo } from 'react'
import Sidebar from '../components/Sidebar'
import ChatWidget from '../components/ChatWidget'

export default function Analytics() {
  // Static placeholder data for frontend-only implementation
  const stats = [
    { label: 'Hours Studied', value: 36 },
    { label: 'Topics Covered', value: 12 },
    { label: 'Study Streak', value: 7 },
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
    '7': [3.5, 4.1, 2.8, 5.2, 5.0, 3.1, 4.6],
    '4': [12, 15, 9, 14],
    '12': [40, 36, 42, 38, 45, 50, 47, 43, 39, 44, 48, 52],
  }), [])

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
                <div className="w-12 h-12 rounded-lg bg-[#6F422B]" />
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
                <h3 className="text-lg font-semibold text-[#6F422B]">Time per Subject</h3>
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
                  <circle cx="130" cy="90" r="56" stroke="#6F422B" strokeWidth="26" strokeDasharray="95 60 45 40 40" strokeLinecap="butt" fill="none" transform="rotate(-90 130 90)" />
                  <circle cx="130" cy="90" r="30" fill="#fff" />
                </svg>

                <ul className="text-sm text-[#5C4333] space-y-3">
                  <li className="flex items-center"><span className="inline-block w-3 h-3 mr-3 bg-[#6F422B] rounded-sm"></span>Mathematics</li>
                  <li className="flex items-center"><span className="inline-block w-3 h-3 mr-3 bg-[#E59C5C] rounded-sm"></span>Physics</li>
                  <li className="flex items-center"><span className="inline-block w-3 h-3 mr-3 bg-[#CFA88F] rounded-sm"></span>Chemistry</li>
                  <li className="flex items-center"><span className="inline-block w-3 h-3 mr-3 bg-[#F6E6DA] rounded-sm"></span>Biology</li>
                  <li className="flex items-center"><span className="inline-block w-3 h-3 mr-3 bg-[#E9D8D0] rounded-sm border" ></span>Literature</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}


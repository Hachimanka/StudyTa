import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const CalendarWidget = ({ darkMode, themeColors }) => {
  const { user } = useAuth();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentDate = new Date();
  const [currentMonthIndex, setCurrentMonthIndex] = useState(currentDate.getMonth()); // Start with current month
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [upcoming, setUpcoming] = useState([]);

  const handlePreviousMonth = () => {
    if (currentMonthIndex > 0) {
      setCurrentMonthIndex(currentMonthIndex - 1);
    } else {
      setCurrentMonthIndex(months.length - 1);
      setCurrentYear(currentYear - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex < months.length - 1) {
      setCurrentMonthIndex(currentMonthIndex + 1);
    } else {
      setCurrentMonthIndex(0);
      setCurrentYear(currentYear + 1);
    }
  };

  // Get the 5 months to display (current month in the middle)
  const getDisplayMonths = () => {
    const result = [];
    for (let i = -2; i <= 2; i++) {
      const index = (currentMonthIndex + i + months.length) % months.length;
      result.push({
        name: months[index],
        isCurrent: i === 0
      });
    }
    return result;
  };

  const displayMonths = getDisplayMonths();

  useEffect(() => {
    const loadUpcoming = async () => {
      if (!user?._id) { setUpcoming([]); return; }
      try {
        const API_BASE = import.meta.env.VITE_API_BASE || ''
        const res = await fetch(`${API_BASE}/api/calendar?userId=${encodeURIComponent(user._id)}`);
        if (res.ok) {
          const data = await res.json();
          // Filter to events for the selected month and year, sort ascending, take 5
          const list = (Array.isArray(data) ? data : [])
            .filter(ev => {
              const evDate = new Date(ev.start);
              return evDate.getMonth() === currentMonthIndex && evDate.getFullYear() === currentYear;
            })
            .sort((a,b) => new Date(a.start) - new Date(b.start))
            .slice(0,5)
            .map(ev => ({
              id: ev._id,
              title: ev.title,
              start: new Date(ev.start),
              allDay: !!ev.allDay,
            }));
          setUpcoming(list);
        }
      } catch {}
    };
    loadUpcoming();
  }, [user?._id, currentMonthIndex, currentYear]);

  const formatEvent = (ev) => {
    const date = ev.start.toLocaleDateString();
    const time = ev.allDay ? 'All day' : ev.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${date} • ${time}`;
  };

  return (
    <div
      className={`p-5 rounded-2xl shadow transition-colors duration-300 ${
        darkMode ? "bg-[#2e2119]" : "bg-white"
      }`}
    >
      {/* Year Display */}
      <div className="text-center">
        <span className={`text-xs ${darkMode ? "text-white/50" : "text-[#5C4333]/70"}`}>
          {currentYear}
        </span>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-2">
        <button 
          onClick={handlePreviousMonth}
          className={`p-2 rounded-lg transition-colors duration-300 ${
            darkMode ? "hover:bg-[#3a2a20]" : "hover:bg-gray-100"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        
        <div className="flex items-center space-x-4">
          {displayMonths.map((month, index) => (
            <span
              key={index}
              className={`transition-colors duration-300 ${
                month.isCurrent
                  ? `font-bold ${darkMode ? "text-[#E59C5C]" : "text-[#71412A]"}`
                  : `font-normal ${darkMode ? "text-white/70" : "text-[#5C4333]"}`
              }`}
            >
              {month.name}
            </span>
          ))}
        </div>
        
        <button 
          onClick={handleNextMonth}
          className={`p-2 rounded-lg transition-colors duration-300 ${
            darkMode ? "hover:bg-[#3a2a20]" : "hover:bg-gray-100"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      {/* Line under the months */}
      <div className={`w-full h-0.5 mb-8 ${darkMode ? "bg-[#f5e9df]/40" : "bg-[#4A2C1E]/40"}`}></div>

      {/* Upcoming events list */}
      {upcoming.length === 0 ? (
        <div className={`text-center py-4 ${darkMode ? "text-white/70" : "text-[#5C4333]"}`}>
          <div className="flex justify-center mb-4">
            <svg width="72" height="80" viewBox="0 0 72 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M36 57.6L29.6 64C28.8667 64.7333 27.9333 65.1 26.8 65.1C25.6667 65.1 24.7333 64.7333 24 64C23.2667 63.2667 22.9 62.3333 22.9 61.2C22.9 60.0667 23.2667 59.1334 24 58.4L30.4 52L24 45.6C23.2667 44.8667 22.9 43.9333 22.9 42.8C22.9 41.6667 23.2667 40.7333 24 40C24.7333 39.2667 25.6667 38.9 26.8 38.9C27.9333 38.9 28.8667 39.2667 29.6 40L36 46.4L42.4 40C43.1333 39.2667 44.0667 38.9 45.2 38.9C46.3333 38.9 47.2667 39.2667 48 40C48.7333 40.7333 49.1 41.6667 49.1 42.8C49.1 43.9333 48.7333 44.8667 48 45.6L41.6 52L48 58.4C48.7333 59.1334 49.1 60.0667 49.1 61.2C49.1 62.3333 48.7333 63.2667 48 64C47.2667 64.7333 46.3333 65.1 45.2 65.1C44.0667 65.1 43.1333 64.7333 42.4 64L36 57.6ZM8 80C5.8 80 3.91733 79.2173 2.352 77.652C0.786667 76.0867 0.00266667 74.2027 0 72V16C0 13.8 0.784 11.9173 2.352 10.352C3.92 8.78668 5.80267 8.00268 8 8.00001H12V4.00001C12 2.86668 12.384 1.91735 13.152 1.15201C13.92 0.386681 14.8693 0.00268046 16 1.37931e-05C17.1307 -0.00265287 18.0813 0.381348 18.852 1.15201C19.6227 1.92268 20.0053 2.87201 20 4.00001V8.00001H52V4.00001C52 2.86668 52.384 1.91735 53.152 1.15201C53.92 0.386681 54.8693 0.00268046 56 1.37931e-05C57.1307 -0.00265287 58.0813 0.381348 58.852 1.15201C59.6227 1.92268 60.0053 2.87201 60 4.00001V8.00001H64C66.2 8.00001 68.084 8.78401 69.652 10.352C71.22 11.92 72.0027 13.8027 72 16V72C72 74.2 71.2173 76.084 69.652 77.652C68.0867 79.22 66.2027 80.0027 64 80H8ZM8 72H64V32H8V72Z" fill={darkMode ? "#E59C5C" : "#71412A"} />
            </svg>
          </div>
          <p className="text-lg">No Events</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {upcoming.map(ev => (
            <Link to="/calendar" key={ev.id} className={`block p-3 rounded-xl ${darkMode ? 'bg-[#3a2a20] hover:bg-[#4a3528]' : 'bg-white hover:bg-gray-100'} shadow-sm transition-colors`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: darkMode ? `${themeColors.primary}20` : `${themeColors.primary}15` }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path fill={darkMode ? "#E59C5C" : "#71412A"} d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
                  </svg>
                </div>
                <div>
                  <div className={`font-semibold ${darkMode ? 'text-white' : 'text-[#4A2C1E]'}`}>{ev.title}</div>
                  <div className={`text-sm ${darkMode ? 'text-white/70' : 'text-[#5C4333]'}`}>{formatEvent(ev)}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarWidget;
import React, { useState } from 'react';

const CalendarWidget = ({ darkMode, themeColors }) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [currentMonthIndex, setCurrentMonthIndex] = useState(3); // Start with April (index 3)

  const handlePreviousMonth = () => {
    setCurrentMonthIndex(prev => (prev > 0 ? prev - 1 : months.length - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthIndex(prev => (prev < months.length - 1 ? prev + 1 : 0));
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

  return (
    <div
      className={`p-9 rounded-2xl shadow transition-colors duration-300 ${
        darkMode ? "bg-[#2e2119]" : "bg-white"
      }`}
    >
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
                  : `font-normal ${darkMode ? "text-[#f5e9df]/70" : "text-[#5C4333]"}`
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

      {/* Calendar Icon and No Events Message */}
      <div className={`text-center py-4 ${darkMode ? "text-[#f5e9df]/70" : "text-[#5C4333]"}`}>
        <div className="flex justify-center mb-4">
          <svg width="72" height="80" viewBox="0 0 72 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M36 57.6L29.6 64C28.8667 64.7333 27.9333 65.1 26.8 65.1C25.6667 65.1 24.7333 64.7333 24 64C23.2667 63.2667 22.9 62.3333 22.9 61.2C22.9 60.0667 23.2667 59.1334 24 58.4L30.4 52L24 45.6C23.2667 44.8667 22.9 43.9333 22.9 42.8C22.9 41.6667 23.2667 40.7333 24 40C24.7333 39.2667 25.6667 38.9 26.8 38.9C27.9333 38.9 28.8667 39.2667 29.6 40L36 46.4L42.4 40C43.1333 39.2667 44.0667 38.9 45.2 38.9C46.3333 38.9 47.2667 39.2667 48 40C48.7333 40.7333 49.1 41.6667 49.1 42.8C49.1 43.9333 48.7333 44.8667 48 45.6L41.6 52L48 58.4C48.7333 59.1334 49.1 60.0667 49.1 61.2C49.1 62.3333 48.7333 63.2667 48 64C47.2667 64.7333 46.3333 65.1 45.2 65.1C44.0667 65.1 43.1333 64.7333 42.4 64L36 57.6ZM8 80C5.8 80 3.91733 79.2173 2.352 77.652C0.786667 76.0867 0.00266667 74.2027 0 72V16C0 13.8 0.784 11.9173 2.352 10.352C3.92 8.78668 5.80267 8.00268 8 8.00001H12V4.00001C12 2.86668 12.384 1.91735 13.152 1.15201C13.92 0.386681 14.8693 0.00268046 16 1.37931e-05C17.1307 -0.00265287 18.0813 0.381348 18.852 1.15201C19.6227 1.92268 20.0053 2.87201 20 4.00001V8.00001H52V4.00001C52 2.86668 52.384 1.91735 53.152 1.15201C53.92 0.386681 54.8693 0.00268046 56 1.37931e-05C57.1307 -0.00265287 58.0813 0.381348 58.852 1.15201C59.6227 1.92268 60.0053 2.87201 60 4.00001V8.00001H64C66.2 8.00001 68.084 8.78401 69.652 10.352C71.22 11.92 72.0027 13.8027 72 16V72C72 74.2 71.2173 76.084 69.652 77.652C68.0867 79.22 66.2027 80.0027 64 80H8ZM8 72H64V32H8V72Z" 
              fill={darkMode ? "#E59C5C" : "#71412A"}
            />
          </svg>
        </div>
        <p className="text-lg">No Events</p>
      </div>
    </div>
  );
};

export default CalendarWidget;
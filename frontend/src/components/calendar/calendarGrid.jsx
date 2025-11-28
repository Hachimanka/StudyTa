import React from 'react';

const CalendarGrid = ({ currentDate, events, selectedDate, onDateClick, onEventClick }) => {
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // Sept 1 2025 is Monday
    
    const days = [];
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    
    // Previous Month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ 
        day: prevMonthLastDate - i, 
        isCurrent: false, 
        date: new Date(year, month - 1, prevMonthLastDate - i) 
      });
    }
    
    // Current Month
    const lastDate = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= lastDate; i++) {
      days.push({ 
        day: i, 
        isCurrent: true, 
        date: new Date(year, month, i) 
      });
    }
    
    // Next Month padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ 
        day: i, 
        isCurrent: false, 
        date: new Date(year, month + 1, i) 
      });
    }

    return days;
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Week Header */}
      <div className="grid grid-cols-7 border-b border-gray-100 py-4 bg-white">
        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
          <div key={day} className="text-center text-[#5D4037] font-bold text-sm">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-3 p-4 bg-white">
        {days.map((dayObj, idx) => {
          const dateKey = dayObj.date.toISOString().split('T')[0];
          const dayEvents = events.filter(e => e.date === dateKey);
          
          const isSelected = selectedDate && 
                             dayObj.date.getDate() === selectedDate.getDate() &&
                             dayObj.date.getMonth() === selectedDate.getMonth() &&
                             dayObj.date.getFullYear() === selectedDate.getFullYear();

          return (
            <div 
              key={idx}
              onClick={() => onDateClick(dayObj.date)}
              className={`
                relative rounded-xl border flex flex-col items-center pt-2 cursor-pointer transition-all
                ${!dayObj.isCurrent ? 'opacity-40 border-gray-100 bg-gray-50' : 'border-gray-200'}
                ${isSelected ? 'border-[#8B5E3C] ring-2 ring-[#8B5E3C] ring-opacity-50 bg-[#FAF6F3]' : 'hover:border-[#8B5E3C]'}
              `}
            >
              <span className={`text-2xl font-semibold ${isSelected ? 'text-[#8B5E3C]' : 'text-[#5D4037]'}`}>
                {dayObj.day}
              </span>

              {/* Event Chips */}
              <div className="w-full px-1 mt-1 flex flex-col gap-1 overflow-hidden">
                {dayEvents.map(ev => (
                  <div 
                    key={ev.id}
                    onClick={(e) => onEventClick(e, ev)}
                    className="text-[10px] p-1 rounded font-medium truncate text-center bg-[#E6D5C4] text-[#5D4037] hover:bg-[#D7C4B0] border border-[#D7C4B0] shadow-sm transition-colors"
                  >
                    {ev.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
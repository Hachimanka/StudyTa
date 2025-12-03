import React from 'react';

const CalendarGrid = ({ currentDate, events, selectedDate, onDateClick, onEventClick }) => {
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    
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
    
    // Next Month padding - Only fill to 35 cells (5 rows × 7 columns)
    const remaining = 35 - days.length;
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
  const today = new Date();

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-b-xl shadow-sm overflow-hidden">

      {/* Week Header */}
      <div className="grid grid-cols-7 py-4 bg-white">
        {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(day => (
          <div key={day} className="text-center text-[#5D4037] font-bold text-sm">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-5 gap-3 p-4 bg-white">
        {days.map((dayObj, idx) => {
          const dateKey = dayObj.date.toISOString().split('T')[0];
          const dayEvents = events.filter(e => e.date === dateKey);
          
          const isToday = 
            dayObj.date.getDate() === today.getDate() &&
            dayObj.date.getMonth() === today.getMonth() &&
            dayObj.date.getFullYear() === today.getFullYear();
          
          const isSelected = selectedDate &&
            dayObj.date.getDate() === selectedDate.getDate() &&
            dayObj.date.getMonth() === selectedDate.getMonth() &&
            dayObj.date.getFullYear() === selectedDate.getFullYear();

          const isClickable = dayObj.isCurrent;

          return (
            <div 
              key={idx}
              onClick={() => isClickable && onDateClick(dayObj.date)}
              className={`
                relative rounded-xl border flex flex-row items-start gap-1 p-2 transition-all
                ${!dayObj.isCurrent ? 'opacity-40 border-gray-100 bg-gray-50' : 'border-gray-200'}
                ${isClickable ? 'cursor-pointer hover:border-[#8B5E3C]' : 'cursor-default'}
                ${isToday ? 'border-[#8B5E3C] ring-2 ring-[#8B5E3C] ring-opacity-50 bg-[#FAF6F3]' : ''}
                ${isSelected && !isToday ? 'border-[#A1887F] ring-1 ring-[#A1887F]' : ''}
              `}
            >
              <span className={`
                text-2xl font-semibold 
                ${isToday ? 'text-[#8B5E3C]' : ''}
                ${isSelected && !isToday ? 'text-[#A1887F]' : 'text-[#5D4037]'}
              `}>
                {dayObj.day}
              </span>

              {/* Event Chips */}
              <div className="w-full px-1 mt-0.5 flex flex-col gap-0.5 overflow-y-auto h-[50px]">
                {dayEvents.map(ev => {

                  // ADD PRIORITY COLORS
                  const priorityClass =
                    ev.priority === "high"
                      ? "bg-red-200 text-red-700 border-red-300 hover:bg-red-300"
                      : ev.priority === "low"
                        ? "bg-green-200 text-green-700 border-green-300 hover:bg-green-300"
                        : ev.priority === "medium"
                          ? "bg-[#D7C4B0] text-[#5D4037] border-[#D7C4B0] hover:bg-[#CBB7A3]"
                          : "bg-[#E6D5C4] text-[#5D4037] hover:bg-[#D7C4B0] border-[#D7C4B0]";

                  return (
                    <div 
                      key={ev.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isClickable) onEventClick(e, ev);
                      }}
                      className={`
                        text-[9px] px-1 py-0.5 rounded font-medium truncate text-center shadow-sm
                        ${priorityClass}
                        ${!isClickable ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-default' : 'cursor-pointer'}
                        transition-colors
                      `}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {ev.priority === 'low' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-3 h-3 flex-shrink-0" aria-hidden="true">
                            <path fill="#00D26A" d="M30 16c0 7.732-6.268 14-14 14S2 23.732 2 16S8.268 2 16 2s14 6.268 14 14Z"/>
                          </svg>
                        ) : ev.priority === 'medium' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-3 h-3 flex-shrink-0" aria-hidden="true">
                            <path fill="#A1887F" d="M30 16c0 7.732-6.268 14-14 14S2 23.732 2 16S8.268 2 16 2s14 6.268 14 14Z"/>
                          </svg>
                        ) : ev.priority === 'high' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-3 h-3 flex-shrink-0" aria-hidden="true">
                            <path fill="#F8312F" d="M30 16c0 7.732-6.268 14-14 14S2 23.732 2 16S8.268 2 16 2s14 6.268 14 14Z"/>
                          </svg>
                        ) : null}

                        <span className="truncate">{ev.title}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;

import React, { useState, useEffect } from 'react';

const EventModal = ({ 
  isOpen, 
  onClose, 
  date, 
  selectedEvent, 
  onSave, 
  onAdd, 
  onDelete,
  isDateEditable = false,
  darkMode = false
}) => {
  if (!isOpen) return null;

  const isEditMode = !!selectedEvent;
  const [priority, setPriority] = useState("low");
  
  // Initialize form state based on mode
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState(date);

  // Reset form when modal opens or mode changes
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && selectedEvent) {
        // Edit mode: populate with existing event data
        setTitle(selectedEvent.title);
        setTime(selectedEvent.time);
        setPriority(selectedEvent.priority || "low");
        setDescription(selectedEvent.description);
        setSelectedDate(new Date(selectedEvent.date));
      } else {
        // Add mode: set to current time (rounded to nearest 15 minutes)
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = Math.floor(now.getMinutes() / 15) * 15;
        const formattedMinutes = minutes.toString().padStart(2, '0');
        setTime(`${hours}:${formattedMinutes}`);
        
        setTitle('');
        setDescription('');
        setSelectedDate(date || new Date());
      }
    }
  }, [isOpen, isEditMode, selectedEvent, date]);

  // Get date string for display
  const getDateString = () => {
    return selectedDate.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Format date for input[type="date"]
  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handle date change
  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
  };

  const handleSubmit = () => {
    if (!title.trim()) return;

    if (isEditMode) {
      // Edit mode: update existing event
      onSave({
        ...selectedEvent,
        title,
        time,
        description,
        priority, // NEW
      });
    } else {
      // Add mode: create new event
        onAdd({
        id: Date.now(),
        title,
        time,
        description,
        date: selectedDate.toISOString().split('T')[0],
        priority, // NEW
        });
    }
    onClose();
  };

  const handleDelete = () => {
    if (isEditMode && selectedEvent) {
      onDelete(selectedEvent.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className={`rounded-lg shadow-2xl w-[400px] overflow-hidden font-sans transition-colors duration-300 ${darkMode ? 'bg-[#2e2119]' : 'bg-[#EBCFB2]'}`}>

        {/* Header */}
        <div className={`p-4 flex justify-between items-center text-white transition-colors duration-300 ${darkMode ? 'bg-[#5a4535]' : 'bg-[#8B5E3C]'}`}>
          <h2 className="text-lg font-normal tracking-wide">
            {isEditMode ? 'Edit Event' : 'Add Event'}
          </h2>
          <button 
            onClick={onClose} 
            className="opacity-80 hover:opacity-100 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5">
          <input 
            type="text" 
            placeholder="Add Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full p-3 rounded outline-none shadow-sm focus:ring-2 focus:ring-[#8B5E3C]/50 transition-colors duration-300 ${darkMode ? 'bg-[#3d2f24] text-[#f5e9df] placeholder-gray-400' : 'bg-white text-[#5D4037] placeholder-[#8D6E63]'}`}
            autoFocus
          />

          <div className="flex flex-col gap-2">
            <label className={`text-sm transition-colors duration-300 ${darkMode ? 'text-[#d4c4b5]' : 'text-[#5D4037]'}`}>Set Time & Date</label>
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <div className={`p-2 rounded shadow-sm w-32 flex justify-center items-center transition-colors duration-300 ${darkMode ? 'bg-[#3d2f24] text-[#f5e9df]' : 'bg-white text-[#5D4037]'}`}>
                  <input 
                    type="time" 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="bg-transparent border-none outline-none w-full text-center"
                    step="900"
                  />
                </div>
                {isDateEditable && !isEditMode ? (
                  <div className={`p-2 rounded shadow-sm flex-1 flex justify-center items-center transition-colors duration-300 ${darkMode ? 'bg-[#3d2f24] text-[#f5e9df]' : 'bg-white text-[#5D4037]'}`}>
                    <input 
                      type="date" 
                      value={formatDateForInput(selectedDate)}
                      onChange={handleDateChange}
                      className="bg-transparent border-none outline-none w-full text-center"
                      min="2000-01-01"
                      max="2100-12-31"
                    />
                  </div>
                ) : (
                  <div className={`p-2 rounded shadow-sm flex-1 text-center text-sm flex items-center justify-center transition-colors duration-300 ${darkMode ? 'bg-[#3d2f24] text-[#f5e9df]' : 'bg-white text-[#5D4037]'}`}>
                    {getDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>

            {/* Priority Selector */}
            <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <label className={`text-sm transition-colors duration-300 ${darkMode ? 'text-[#d4c4b5]' : 'text-[#5D4037]'}`}>Priority</label>

              {/* Current priority icon */}
              <div aria-hidden className="flex items-center">
                {priority === 'low' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32" className="w-4 h-4" aria-hidden="true">
                    <path fill="#00D26A" d="M30 16c0 7.732-6.268 14-14 14S2 23.732 2 16S8.268 2 16 2s14 6.268 14 14Z"/>
                  </svg>
                ) : priority === 'medium' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32" className="w-4 h-4" aria-hidden="true">
                    <path fill="#A1887F" d="M30 16c0 7.732-6.268 14-14 14S2 23.732 2 16S8.268 2 16 2s14 6.268 14 14Z"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32" className="w-4 h-4" aria-hidden="true">
                    <path fill="#F8312F" d="M30 16c0 7.732-6.268 14-14 14S2 23.732 2 16S8.268 2 16 2s14 6.268 14 14Z"/>
                  </svg>
                )}
              </div>

            </div>
            <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={`w-full mt-2 p-3 rounded shadow-sm focus:ring-2 focus:ring-[#8B5E3C]/50 transition-colors duration-300 ${darkMode ? 'bg-[#3d2f24] text-[#f5e9df]' : 'bg-white text-[#5D4037]'}`}
            >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
            </select>
            </div>

          <textarea 
            placeholder="Add Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className={`w-full p-3 rounded outline-none shadow-sm resize-none focus:ring-2 focus:ring-[#8B5E3C]/50 transition-colors duration-300 ${darkMode ? 'bg-[#3d2f24] text-[#f5e9df] placeholder-gray-400' : 'bg-white text-[#5D4037] placeholder-[#8D6E63]'}`}
          />

          <div className="flex gap-4 mt-2">
            <button 
              onClick={handleSubmit}
              className={`flex-1 font-bold py-2 rounded shadow-sm border transition-colors duration-300 ${darkMode ? 'bg-[#3d2f24] text-[#f5e9df] border-[#5a4535]' : 'bg-white text-[#5D4037] border-[#d4c4b5]'}`}
            >
              {isEditMode ? 'Save' : 'Add'}
            </button>
            
            {isEditMode ? (
              <button 
                onClick={handleDelete}
                className={`flex-1 font-bold py-2 rounded shadow-sm border hover:bg-red-50 hover:text-red-700 transition-colors duration-300 ${darkMode ? 'bg-[#3d2f24] text-[#f5e9df] border-[#5a4535]' : 'bg-white text-[#5D4037] border-[#d4c4b5]'}`}
              >
                Delete Event
              </button>
            ) : (
              <button 
                onClick={onClose}
                className={`flex-1 font-bold py-2 rounded shadow-sm border transition-colors duration-300 ${darkMode ? 'bg-[#3d2f24] text-[#f5e9df] border-[#5a4535]' : 'bg-white text-[#5D4037] border-[#d4c4b5]'}`}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default EventModal;
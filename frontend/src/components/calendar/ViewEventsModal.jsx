import React, { useState } from 'react';

const ViewEventsModal = ({ 
  isOpen, 
  onClose, 
  date, 
  events, 
  onEventClick, 
  onDeleteSelected,
  onAddEvent,
  darkMode = false
}) => {
  if (!isOpen) return null;

  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState([]);

  const dateString = date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const handleEventClick = (event) => {
    if (isSelectMode) {
      // Toggle selection in select mode
      setSelectedEvents(prev => {
        const exists = prev.find(e => e.id === event.id);
        if (exists) {
          return prev.filter(e => e.id !== event.id);
        } else {
          return [...prev, event];
        }
      });
    } else {
      // Directly navigate to event edit in normal mode
      onEventClick(event);
      onClose();
    }
  };

  const handleSelectModeToggle = () => {
    if (isSelectMode) {
      // Exit select mode and clear selections
      setSelectedEvents([]);
    }
    setIsSelectMode(!isSelectMode);
  };

  const handleDeleteSelected = () => {
    if (selectedEvents.length > 0) {
      onDeleteSelected(selectedEvents.map(e => e.id));
      setSelectedEvents([]);
      setIsSelectMode(false);
      onClose();
    }
  };

  const handleEventSelect = (event) => {
    const exists = selectedEvents.find(e => e.id === event.id);
    if (exists) {
      setSelectedEvents(prev => prev.filter(e => e.id !== event.id));
    } else {
      setSelectedEvents(prev => [...prev, event]);
    }
  };

  const handleAddEvent = () => {
    onAddEvent(date);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className={`${darkMode ? 'bg-[#2e2119]' : 'bg-[#EBCFB2]'} rounded-lg shadow-2xl w-[400px] overflow-hidden font-sans max-h-[85vh] flex flex-col`}>

        {/* Header */}
        <div className={`${darkMode ? 'bg-[#E59C5C]' : 'bg-[#8B5E3C]'} p-4 flex justify-between items-center text-white flex-shrink-0`}>
          <h2 className="text-lg font-normal tracking-wide">
            Events on {dateString}
          </h2>
          <button 
            onClick={onClose} 
            className="opacity-80 hover:opacity-100 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="p-6 flex flex-col flex-1 overflow-hidden">
          <div className="mb-4">
            
            {events.length === 0 ? (
              <p className={`${darkMode ? 'text-[#c4a68a]' : 'text-[#8D6E63]'} italic text-center py-8`}>
                No events scheduled for this date
              </p>
            ) : (
              <div className="space-y-2 overflow-y-auto max-h-[50vh] pr-2 custom-scrollbar">
                {events.map(event => (
                  <div 
                    key={event.id}
                    className={`flex items-start gap-3 p-3 rounded cursor-pointer transition-all ${
                      isSelectMode && selectedEvents.find(e => e.id === event.id)
                        ? darkMode ? 'bg-[#E59C5C]/20 border border-[#E59C5C]/30' : 'bg-[#8B5E3C]/20 border border-[#8B5E3C]/30'
                        : darkMode ? 'bg-[#1f1b16] hover:bg-[#E59C5C]/10' : 'bg-white hover:bg-[#8B5E3C]/10'
                    }`}
                    onClick={() => handleEventClick(event)}
                  >
                    {isSelectMode && (
                      <div 
                        className="mt-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventSelect(event);
                        }}
                      >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                          selectedEvents.find(e => e.id === event.id)
                            ? darkMode ? 'bg-[#E59C5C] border-[#E59C5C]' : 'bg-[#8B5E3C] border-[#8B5E3C]'
                            : darkMode ? 'bg-[#1f1b16] border-[#c4a68a]' : 'bg-white border-[#8D6E63]'
                        }`}>
                          {selectedEvents.find(e => e.id === event.id) && (
                            <span className="text-white text-sm">✓</span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`${darkMode ? 'text-[#E59C5C] bg-[#E59C5C]/10' : 'text-[#8B5E3C] bg-[#8B5E3C]/10'} text-sm font-medium px-2 py-0.5 rounded flex-shrink-0`}>
                          {event.time}
                        </span>
                        <h4 className={`${darkMode ? 'text-[#f5e9df]' : 'text-[#5D4037]'} font-semibold truncate`}>
                          {event.title}
                        </h4>
                      </div>
                      {event.description && (
                        <p className={`${darkMode ? 'text-[#c4a68a]' : 'text-[#8D6E63]'} text-sm line-clamp-2`}>
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons - Fixed at bottom */}
          <div className={`flex flex-col gap-3 mt-6 pt-4 border-t ${darkMode ? 'border-[#3d2f24]' : 'border-[#D7C4B0]'} flex-shrink-0`}>
            {/* Top row with Add Event and Select Event buttons */}
            <div className="flex gap-3">
              <button 
                onClick={handleAddEvent}
                className={`flex-1 py-3 ${darkMode ? 'bg-[#1f1b16] text-[#f5e9df] border-[#3d2f24] hover:bg-[#2e2119]' : 'bg-white text-[#5D4037] border-[#d4c4b5] hover:bg-gray-50'} border rounded font-semibold transition-all flex items-center justify-center gap-2`}
              >
                Add Event
              </button>
              
              <button 
                onClick={handleSelectModeToggle}
                className={`flex-1 py-3 rounded font-semibold transition-all flex items-center justify-center ${
                  isSelectMode
                    ? darkMode ? 'bg-[#E59C5C] text-white hover:bg-[#d08a4a]' : 'bg-[#5D4037] text-white hover:bg-[#4A3224]'
                    : darkMode ? 'bg-[#1f1b16] text-[#f5e9df] border border-[#3d2f24] hover:bg-[#2e2119]' : 'bg-white text-[#5D4037] border border-[#d4c4b5] hover:bg-gray-50'
                } ${events.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={events.length === 0}
              >
                {isSelectMode ? 'Cancel' : 'Select'}
              </button>
            </div>
            
            {/* Delete Selected button (only shows in select mode with selections) */}
            {isSelectMode && selectedEvents.length > 0 && (
              <button 
                onClick={handleDeleteSelected}
                className="w-full py-3 bg-red-600 text-white rounded font-semibold hover:bg-red-700 transition-all flex items-center justify-center gap-2"
              >
                Delete Selected ({selectedEvents.length})
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ViewEventsModal;
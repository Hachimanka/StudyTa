import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
// Import the components
import EventModal from '../components/calendar/EventModal';
import ViewEventsModal from '../components/calendar/ViewEventsModal';
import CalendarGrid from '../components/calendar/calendarGrid';

const Calendar = () => {
  // Set current date to real-time
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDateEditable, setIsDateEditable] = useState(false); // New state for date editability

  // Update current date every minute to keep it accurate
  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1)); // Keep at 1st of month for calendar view
    };

    // Update immediately
    updateCurrentTime();

    // Update every minute
    const intervalId = setInterval(updateCurrentTime, 60000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  // Handle date click - now opens ViewEventsModal instead of EventModal
  const handleDateClick = (date) => {
    setSelectedDate(date);
    
    // Get events for the clicked date
    const dateEvents = events.filter(event => 
      event.date === date.toISOString().split('T')[0]
    );
    
    if (dateEvents.length > 0) {
      // If there are events, open ViewEventsModal
      setIsViewModalOpen(true);
    } else {
      // If no events, open EventModal in add mode with date NOT editable
      setSelectedEvent(null);
      setIsDateEditable(false); // Date should NOT be editable
      setIsEventModalOpen(true);
    }
  };

  // New function for adding event from ViewEventsModal
  const handleAddEventFromViewModal = (date) => {
    setSelectedDate(date);
    setSelectedEvent(null); // Ensure add mode
    setIsDateEditable(false); // Date should NOT be editable (clicked from View modal)
    setIsViewModalOpen(false);
    setIsEventModalOpen(true);
  };

  const handlePlusClick = () => {
    setSelectedEvent(null); // Ensure add mode
    setIsDateEditable(true); // Date SHOULD be editable (clicked from + button)
    setIsEventModalOpen(true);
  };

  // When clicking an event in the calendar
  const handleEventClick = (e, event) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setIsDateEditable(false); // Date should NOT be editable in edit mode
    setIsEventModalOpen(true); // Open EventModal in edit mode
  };

  // When clicking an event in ViewEventsModal (to edit)
  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setIsDateEditable(false); // Date should NOT be editable in edit mode
    setIsViewModalOpen(false);
    setIsEventModalOpen(true); // Open EventModal in edit mode
  };

  const handleAddEvent = (newEvent) => {
    setEvents([...events, newEvent]);
  };

  const handleUpdateEvent = (updatedEvent) => {
    setEvents(events.map(ev => ev.id === updatedEvent.id ? updatedEvent : ev));
  };

  const handleDeleteEvent = (id) => {
    setEvents(events.filter(ev => ev.id !== id));
  };

  const handleDeleteSelectedEvents = (eventIds) => {
    setEvents(events.filter(ev => !eventIds.includes(ev.id)));
  };

  // Get events for the selected date
  const getDateEvents = () => {
    return events.filter(event => 
      event.date === selectedDate.toISOString().split('T')[0]
    );
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Go to today's date
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  return (
    <div className="flex min-h-screen"><Sidebar />
    <div className="flex h-screen w-full bg-[#EFE5DA] overflow-hidden font-sans text-[#5D4037] justify-center items-center">
      <div className="flex flex-col w-full max-w-6xl h-[95vh] p-4 relative">

        {/* Calendar Top Controls */}
        <div className="bg-[#8B5E3C] p-4 rounded-t-xl flex items-center justify-center relative text-white shadow-md z-10">
          <button 
            onClick={goToPreviousMonth}
            className="absolute left-100 p-2 hover:bg-white/10 rounded-full transition-colors text-3xl"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="19" viewBox="0 0 17 16" className="w-7 h-7" aria-hidden="true">
              <path fill="#ffffffff" fillRule="evenodd" d="M10.978 1.162c0 .225-.062.45-.196.65L6.626 8.041l4.197 6.037c.359.541.213 1.27-.328 1.629a1.174 1.174 0 0 1-1.63-.325l-4.63-6.688a1.172 1.172 0 0 1-.002-1.304L8.822.51a1.178 1.178 0 0 1 2.156.652z"/>
            </svg>
          </button>

          <div className="flex flex-col items-center">
            <h2 className="text-3xl font-bold tracking-wide">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
          </div>

          <button 
            onClick={goToNextMonth}
            className="absolute right-100 p-2 hover:bg-white/10 rounded-full transition-colors text-3xl"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 17 16" className="w-7 h-7" aria-hidden="true">
              <path fill="#ffffffff" fillRule="evenodd" d="M6.077 1.162c0 .225.062.45.196.65l4.156 6.229l-4.197 6.037a1.175 1.175 0 0 0 .328 1.629a1.174 1.174 0 0 0 1.63-.325l4.63-6.688c.264-.394.266-.908.002-1.304L8.233.51a1.178 1.178 0 0 0-2.156.652z"/>
            </svg>
          </button>
        </div>

        {/* Grid */}
        <CalendarGrid 
          currentDate={currentDate}
          events={events}
          selectedDate={selectedDate}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
        />

        {/* Floating Add */}
        <button 
          onClick={handlePlusClick}
          className="absolute bottom-8 right-8 bg-[#5D4037] text-white rounded-full h-15 w-15 shadow-xl hover:scale-110 hover:bg-[#4E342E] transition-all z-20 text-3xl"
        >
          ＋
        </button>

      </div>

      {/* Unified Event Modal */}
      <EventModal 
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        date={selectedDate}
        selectedEvent={selectedEvent}
        onAdd={handleAddEvent}
        onSave={handleUpdateEvent}
        onDelete={handleDeleteEvent}
        isDateEditable={isDateEditable} // Pass date editability
      />

      {/* View Events Modal */}
      <ViewEventsModal 
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        date={selectedDate}
        events={getDateEvents()}
        onEventClick={handleEventSelect}
        onDeleteSelected={handleDeleteSelectedEvents}
        onAddEvent={handleAddEventFromViewModal}
      />
    </div>
    </div>
  );
};

export default Calendar;
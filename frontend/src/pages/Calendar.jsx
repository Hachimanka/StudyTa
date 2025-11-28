import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Sparkles } from 'lucide-react';

// Import the components
import AddEventModal from '../components/calendar/addEvent';
import EditEventModal from '../components/calendar/editEvent';
import CalendarGrid from '../components/calendar/calendarGrid';

const Calendar = () => {
  // State
  const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 1)); 
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 8, 20));
  
  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);

  // Handlers
  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handlePlusClick = () => {
    setIsAddModalOpen(true);
  };

  const handleEventClick = (e, event) => {
    e.stopPropagation();
    setEventToEdit(event);
    setIsEditModalOpen(true);
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

  return (
    <div className="flex h-screen w-full bg-[#EFE5DA] overflow-hidden font-sans text-[#5D4037] justify-center items-center">
      
      {/* Main Content */}
      <div className="flex flex-col w-full max-w-6xl h-[95vh] p-4 relative">
        
        {/* Calendar Top Controls */}
        <div className="bg-[#8B5E3C] p-4 rounded-t-xl flex items-center justify-center relative text-white shadow-md z-10">
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth()-1)))} 
            className="absolute left-6 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronLeft size={32} />
          </button>
          
          <h2 className="text-3xl font-bold tracking-wide">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth()+1)))} 
            className="absolute right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ChevronRight size={32} />
          </button>
        </div>

        {/* The Calendar Grid Component */}
        <CalendarGrid 
          currentDate={currentDate}
          events={events}
          selectedDate={selectedDate}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
        />

        {/* Floating Action Button */}
        <button 
          onClick={handlePlusClick}
          className="absolute bottom-8 right-8 bg-[#5D4037] text-white p-4 rounded-full shadow-xl hover:scale-110 hover:bg-[#4E342E] transition-all z-20"
          title="Add Event"
        >
          <Plus size={32} strokeWidth={3} />
        </button>

        {/* Support Button */}
        <button className="absolute bottom-8 left-8 bg-[#8B5E3C] text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform opacity-80 hover:opacity-100">
           <Sparkles size={24} />
        </button>

      </div>

      {/* Modals */}
      <AddEventModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        date={selectedDate}
        onAdd={handleAddEvent}
      />

      <EditEventModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        event={eventToEdit}
        onSave={handleUpdateEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
};

export default Calendar;
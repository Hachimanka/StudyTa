import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const EditEventModal = ({ isOpen, onClose, event, onSave, onDelete }) => {
  if (!isOpen || !event) return null;

  const [title, setTitle] = useState(event.title);
  const [time, setTime] = useState(event.time);
  const [description, setDescription] = useState(event.description);

  useEffect(() => {
    setTitle(event.title);
    setTime(event.time);
    setDescription(event.description);
  }, [event]);

  const handleSave = () => {
    onSave({
      ...event,
      title,
      time,
      description,
    });
    onClose();
  };

  const [y, m, d] = event.date.split('-');
  const dateObj = new Date(y, m - 1, d);
  const dateString = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-[#EBCFB2] rounded-lg shadow-2xl w-[400px] overflow-hidden font-sans">
        {/* Header */}
        <div className="bg-[#8B5E3C] p-4 flex justify-between items-center text-white">
          <h2 className="text-lg font-normal tracking-wide">Event for [{dateString}]</h2>
          <button onClick={onClose} className="opacity-80 hover:opacity-100">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5">
          <input 
            type="text" 
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 rounded bg-white text-[#5D4037] placeholder-[#8D6E63] outline-none shadow-sm focus:ring-2 focus:ring-[#8B5E3C]/50"
          />

          <div className="flex flex-col gap-2">
            <label className="text-[#5D4037] text-sm">Time & Date</label>
            <div className="flex gap-3">
              <div className="bg-white p-2 rounded text-[#5D4037] shadow-sm w-32 flex justify-center items-center">
                <input 
                  type="time" 
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-center"
                />
              </div>
            </div>
          </div>

          <textarea 
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full p-3 rounded bg-white text-[#5D4037] placeholder-[#8D6E63] outline-none shadow-sm resize-none focus:ring-2 focus:ring-[#8B5E3C]/50"
          />

          <div className="flex gap-4 mt-2">
            <button 
              onClick={handleSave}
              className="flex-1 bg-white text-[#5D4037] font-bold py-2 rounded shadow-sm border border-[#d4c4b5] hover:bg-[#faf6f3] active:scale-95 transition-all"
            >
              Save Changes
            </button>
            <button 
              onClick={() => { onDelete(event.id); onClose(); }}
              className="flex-1 bg-white text-[#5D4037] font-bold py-2 rounded shadow-sm border border-[#d4c4b5] hover:bg-red-50 hover:text-red-700 hover:border-red-200 active:scale-95 transition-all"
            >
              Delete Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEventModal;
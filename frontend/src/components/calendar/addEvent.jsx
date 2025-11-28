import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const AddEventModal = ({ isOpen, onClose, date, onAdd }) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [time, setTime] = useState('08:00');
  const [description, setDescription] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setTime('08:00');
      setDescription('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd({
      id: Date.now(),
      title,
      time,
      description,
      date: date.toISOString().split('T')[0],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-[#EBCFB2] rounded-lg shadow-2xl w-[400px] overflow-hidden font-sans">
        {/* Header */}
        <div className="bg-[#8B5E3C] p-4 flex justify-between items-center text-white">
          <h2 className="text-lg font-normal tracking-wide">Add Event</h2>
          <button onClick={onClose} className="opacity-80 hover:opacity-100">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5">
          <input 
            type="text" 
            placeholder="Add Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 rounded bg-white text-[#5D4037] placeholder-[#8D6E63] outline-none shadow-sm focus:ring-2 focus:ring-[#8B5E3C]/50"
            autoFocus
          />

          <div className="flex flex-col gap-2">
            <label className="text-[#5D4037] text-sm">Set Time & Date</label>
            <div className="flex gap-3">
              <div className="bg-white p-2 rounded text-[#5D4037] shadow-sm w-32 flex justify-center items-center">
                <input 
                  type="time" 
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-center"
                />
              </div>
              <div className="bg-white p-2 rounded text-[#5D4037] shadow-sm flex-1 flex justify-center items-center text-sm">
                {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>

          <textarea 
            placeholder="Add Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full p-3 rounded bg-white text-[#5D4037] placeholder-[#8D6E63] outline-none shadow-sm resize-none focus:ring-2 focus:ring-[#8B5E3C]/50"
          />

          <div className="flex gap-4 mt-2">
            <button 
              onClick={handleSubmit}
              className="flex-1 bg-white text-[#5D4037] font-bold py-2 rounded shadow-sm border border-[#d4c4b5] hover:bg-[#faf6f3] active:scale-95 transition-all"
            >
              Add
            </button>
            <button 
              onClick={onClose}
              className="flex-1 bg-white text-[#5D4037] font-bold py-2 rounded shadow-sm border border-[#d4c4b5] hover:bg-[#faf6f3] active:scale-95 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEventModal;
import React from 'react';

export default function ConfirmSaveModal({ open, onClose, onSave, onDiscard }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#2e2119] rounded-lg shadow-lg max-w-lg w-full p-6 z-10">
        <h3 className="text-lg font-semibold mb-2 text-[#6F422B] dark:text-white">Save current work?</h3>
        <p className="text-sm mb-4 text-[#6F422B] dark:text-gray-200">You have generated materials in this session. Do you want to save them before switching study methods?</p>

        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 rounded border bg-transparent text-sm">Cancel</button>
          <button onClick={onDiscard} className="px-4 py-2 rounded border bg-white text-sm">Don't Save</button>
          <button onClick={onSave} className="px-4 py-2 rounded bg-[#8D5A3F] text-white text-sm">Save</button>
        </div>
      </div>
    </div>
  );
}

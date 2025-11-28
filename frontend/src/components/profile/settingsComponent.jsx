import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const ToggleSwitch = ({ label, subLabel, checked, onChange }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="text-left">
        <p className="font-bold text-[#5C4033]">{label}</p>
        <p className="text-xs text-[#8D6E63]">{subLabel}</p>
      </div>
      <div 
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 ${checked ? 'bg-[#8B5E3C]' : 'bg-gray-300'}`}
      >
        <motion.div 
          layout
          transition={{ type: "spring", stiffness: 700, damping: 30 }}
          className="bg-white w-4 h-4 rounded-full shadow-md"
          style={{ marginLeft: checked ? 'auto' : '0' }} // Simple logic paired with layout prop
        />
      </div>
    </div>
  );
};

/* Change Password Modal Component */
export const ChangePasswordModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          {/* Modal Container */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-[#BC8F73] w-full max-w-md rounded-2xl p-8 shadow-2xl border-4 border-[#D7B69C] relative"
          >
            
            {/* Header */}
            <h2 className="text-2xl font-bold text-white text-center mb-6 italic">Change Password</h2>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <input 
                  type="email" 
                  placeholder="Email" 
                  className="w-full p-3 rounded-lg bg-white outline-none text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#8B5E3C]/40 transition-shadow"
                />
              </div>

              <div>
                <label className="text-white text-sm ml-1 mb-1 block italic">Enter current password</label>
                <input 
                  type="password" 
                  placeholder="Enter password" 
                  className="w-full p-3 rounded-lg bg-white outline-none text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#8B5E3C]/40 transition-shadow"
                />
                <div className="flex justify-between items-center mt-1">
                  <label className="flex items-center text-xs text-white cursor-pointer select-none">
                    <input type="checkbox" className="mr-1 accent-[#5C4033]" /> Show password
                  </label>
                  <button className="text-xs text-blue-100 hover:text-white transition-colors">Forgot Password?</button>
                </div>
              </div>

              <div>
                <label className="text-white text-sm ml-1 mb-1 block italic">Enter new password</label>
                <input 
                  type="password" 
                  placeholder="Enter password" 
                  className="w-full p-3 rounded-lg bg-white outline-none text-gray-700 placeholder-gray-400 mb-2 focus:ring-2 focus:ring-[#8B5E3C]/40 transition-shadow"
                />
                <input 
                  type="password" 
                  placeholder="Confirm password" 
                  className="w-full p-3 rounded-lg bg-white outline-none text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-[#8B5E3C]/40 transition-shadow"
                />
                <label className="flex items-center text-xs text-white mt-1 cursor-pointer select-none">
                  <input type="checkbox" className="mr-1 accent-[#5C4033]" /> Show password
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 space-y-3">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-[#5C4033] text-white py-3 rounded-xl font-bold hover:bg-[#4A332A] transition-colors"
              >
                Change
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full bg-white text-[#5C4033] py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Modal({ isOpen, onClose, title, message, type = 'info' }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
           {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative bg-white dark:bg-[#2e2119] rounded-xl shadow-2xl max-w-md w-full p-6 overflow-hidden border border-gray-100 dark:border-[#4a3525]"
          >
            {title && (
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                {title}
              </h3>
            )}
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              {message}
            </p>
            
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#8D5A3F] hover:bg-[#6F422B] text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                OK
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../../context/SettingsContext';

export const ToggleSwitch = ({ label, subLabel, checked, onChange, darkMode: propDarkMode }) => {
  const settings = useSettings();
  const darkMode = propDarkMode !== undefined ? propDarkMode : settings?.darkMode;
  
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="text-left">
        <p className={`font-bold transition-colors duration-300 ${darkMode ? 'text-[#f5e9df]' : 'text-[#6F422B]'}`}>{label}</p>
        <p className={`text-xs transition-colors duration-300 ${darkMode ? 'text-[#d4c4b5]' : 'text-[#6F422B]'}`}>{subLabel}</p>
      </div>
      <div 
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 ${checked ? 'bg-[#8B5E3C]' : darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}
      >
        <motion.div 
          layout
          transition={{ type: "spring", stiffness: 700, damping: 30 }}
          className="bg-white w-4 h-4 rounded-full shadow-md"
          style={{ marginLeft: checked ? 'auto' : '0' }}
        />
      </div>
    </div>
  );
};

/* Change Password Modal Component */
export const ChangePasswordModal = ({ isOpen, onClose, userEmail }) => {
  const { darkMode } = useSettings();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedUserId, setVerifiedUserId] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setError('');
    setSuccess('');
    setLoading(false);
    setIsVerified(false);
    setVerifiedUserId(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleVerifyPassword = async () => {
    setError('');
    
    if (!currentPassword) {
      setError('Please enter your current password');
      return;
    }

    setLoading(true);
    try {
      const verifyResponse = await fetch(`${API_BASE}/api/profile/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, currentPassword }),
      });

      const verifyData = await verifyResponse.json();
      
      if (!verifyResponse.ok) {
        setError(verifyData.message || 'Invalid current password');
        setLoading(false);
        return;
      }

      setIsVerified(true);
      setVerifiedUserId(verifyData.userId);
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
    setLoading(false);
  };

  const handleChangePassword = async () => {
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const changeResponse = await fetch(`${API_BASE}/api/profile/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: verifiedUserId, newPassword }),
      });

      const changeData = await changeResponse.json();
      
      if (!changeResponse.ok) {
        setError(changeData.message || 'Failed to change password');
        setLoading(false);
        return;
      }

      setSuccess('Password changed successfully!');
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
    setLoading(false);
  };

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
            className={`w-full max-w-md rounded-2xl p-8 shadow-2xl border-4 relative transition-colors duration-300 ${
              darkMode 
                ? 'bg-[#3d2f24] border-[#5a4535]' 
                : 'bg-[#BC8F73] border-[#D7B69C]'
            }`}
          >
            
            {/* Header */}
            <h2 className="text-2xl font-bold text-white text-center mb-6 italic">Change Password</h2>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                {success}
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <input 
                  type="email" 
                  value={userEmail}
                  disabled
                  className="w-full p-3 rounded-lg bg-gray-100 outline-none text-[#6F422B] placeholder-gray-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-white text-sm ml-1 mb-1 block italic">Enter current password</label>
                <input 
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Enter password" 
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (isVerified) {
                      setIsVerified(false);
                      setVerifiedUserId(null);
                      setNewPassword('');
                      setConfirmPassword('');
                    }
                  }}
                  disabled={isVerified}
                  className={`w-full p-3 rounded-lg outline-none text-[#6F422B] placeholder-gray-400 focus:ring-2 focus:ring-[#8B5E3C]/40 transition-shadow ${isVerified ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                />
                <div className="flex justify-between items-center mt-1">
                  <label className="flex items-center text-xs text-white cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      className="mr-1 accent-[#5C4033]"
                      checked={showCurrentPassword}
                      onChange={(e) => setShowCurrentPassword(e.target.checked)}
                    /> Show password
                  </label>
                  {isVerified && (
                    <span className="text-xs text-green-200 font-semibold">✓ Verified</span>
                  )}
                </div>
              </div>

              <div className={!isVerified ? 'opacity-50' : ''}>
                <label className="text-white text-sm ml-1 mb-1 block italic">Enter new password</label>
                <input 
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={!isVerified}
                  className={`w-full p-3 rounded-lg outline-none text-[#6F422B] placeholder-gray-400 mb-2 focus:ring-2 focus:ring-[#8B5E3C]/40 transition-shadow ${!isVerified ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                />
                <input 
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Confirm password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={!isVerified}
                  className={`w-full p-3 rounded-lg outline-none text-[#6F422B] placeholder-gray-400 focus:ring-2 focus:ring-[#8B5E3C]/40 transition-shadow ${!isVerified ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                />
                <label className="flex items-center text-xs text-white mt-1 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    className="mr-1 accent-[#5C4033]"
                    checked={showNewPassword}
                    onChange={(e) => setShowNewPassword(e.target.checked)}
                    disabled={!isVerified}
                  /> Show password
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 space-y-3">
              {!isVerified ? (
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleVerifyPassword}
                  disabled={loading}
                  className="w-full bg-[#5C4033] text-white py-3 rounded-xl font-bold hover:bg-[#4A332A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify Password'}
                </motion.button>
              ) : (
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="w-full bg-[#5C4033] text-white py-3 rounded-xl font-bold hover:bg-[#4A332A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Changing...' : 'Change'}
                </motion.button>
              )}
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClose}
                disabled={loading}
                className="w-full bg-white text-[#6F422B] py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors disabled:opacity-50"
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
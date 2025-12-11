import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion'; 
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { useSettings } from '../../context/SettingsContext';

/* ProfileSection Component */
export const ProfileSection = ({ onOpenPasswordModal }) => {
  const { user } = useAuth();

  const initialData = {
    fullName: '',
    bio: '',
    username: '',
    email: '',
    avatar: ''
  };

  const [formData, setFormData] = useState(initialData);

  // Keep a snapshot of the original loaded profile so we can compare for changes
  const [originalData, setOriginalData] = useState(initialData);

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);

  const hasChanges = useMemo(() => {
    // If a new avatar file has been selected that's a change
    if (avatarFile) return true;

    // Compare each visible field against the original loaded snapshot
    if (!originalData) return false;
    return (
      (formData.fullName || '') !== (originalData.fullName || '') ||
      (formData.bio || '') !== (originalData.bio || '') ||
      (formData.username || '') !== (originalData.username || '') ||
      (formData.avatar || '') !== (originalData.avatar || '')
    );
  }, [formData, originalData, avatarFile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
    setAvatarFile(file);
    setFormData(prev => ({ ...prev, avatar: file.name }));
  };

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  // Load profile from backend when user available
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user || !user._id) return;
        const API_BASE = import.meta.env.VITE_API_BASE || '';
        const res = await fetch(`${API_BASE}/api/profile/${user._id}`);
        if (!res.ok) {
          // If API fails, still populate email from user context
          setFormData(prev => ({
            ...prev,
            email: user?.email || ''
          }));
          setOriginalData(prev => ({
            ...prev,
            email: user?.email || ''
          }));
          return;
        }
        const data = await res.json();
        const p = data.profile || {};
        const userEmail = data.user?.email || user?.email || '';
        setFormData({
          fullName: p.fullName || data.user?.name || '',
          bio: p.bio || '',
          username: p.username || data.user?.username || '',
          email: userEmail,
          avatar: p.profileImageUrl || ''
        });
        // Save the loaded profile snapshot for change-detection
        setOriginalData({
          fullName: p.fullName || data.user?.name || '',
          bio: p.bio || '',
          username: p.username || data.user?.username || '',
          email: userEmail,
          avatar: p.profileImageUrl || ''
        });
        if (p.profileImageUrl) setAvatarPreview(p.profileImageUrl);
      } catch (err) {
        console.warn('Failed to load profile', err);
        // On error, still populate email from user context
        if (user?.email) {
          setFormData(prev => ({ ...prev, email: user.email }));
          setOriginalData(prev => ({ ...prev, email: user.email }));
        }
      }
    };
    fetchProfile();
  }, [user]);

const saveProfile = async () => {
  try {
    if (!user || !user._id) return showModal('Not authenticated', 'Error', 'error');
    const API_BASE = import.meta.env.VITE_API_BASE || '';
    const form = new FormData();
    form.append('fullName', formData.fullName || '');
    form.append('username', formData.username || '');
    form.append('bio', formData.bio || '');
    form.append('email', formData.email || '');
    if (avatarFile) form.append('profileImage', avatarFile);

    const res = await fetch(`${API_BASE}/api/profile/${user._id}`, {
      method: 'PUT',
      body: form
    });
    const data = await res.json();
    if (!res.ok) return showModal(data.message || 'Failed to save', 'Error', 'error');

    // Update localStorage user snapshot to keep UI in sync
    try {
      const storedRaw = localStorage.getItem('stuyta_user');
      let stored = storedRaw ? JSON.parse(storedRaw) : {};
      
      // Update all relevant fields
      stored.name = data.user?.name || stored.name;
      stored.email = data.user?.email || stored.email;
      stored.profile = data.profile || stored.profile;
      
      // Ensure avatarUrl is set in multiple places for compatibility
      if (data.profile?.profileImageUrl) {
        stored.avatarUrl = data.profile.profileImageUrl;
        stored.avatar = data.profile.profileImageUrl;
        stored.profileImageUrl = data.profile.profileImageUrl;
      }
      
      // Also update any stored user profile data
      stored.fullName = data.profile?.fullName || stored.fullName;
      stored.username = data.profile?.username || stored.username;
      stored.bio = data.profile?.bio || stored.bio;
      
      localStorage.setItem('stuyta_user', JSON.stringify(stored));
      
      // Dispatch multiple events to ensure all components update
      window.dispatchEvent(new Event('authChanged'));
      window.dispatchEvent(new Event('profileUpdated'));
      window.dispatchEvent(new Event('storage'));
      
    } catch (e) {
      console.warn('LocalStorage update failed:', e);
    }

    // Update local state preview with new image URL
    if (data.profile?.profileImageUrl) {
      setAvatarPreview(data.profile.profileImageUrl);
    }

    // Update original snapshot so Save button becomes disabled again
    const newSnapshot = {
      fullName: data.profile?.fullName || formData.fullName || '',
      bio: data.profile?.bio || formData.bio || '',
      username: data.profile?.username || formData.username || '',
      email: data.user?.email || formData.email || '',
      avatar: data.profile?.profileImageUrl || formData.avatar || ''
    };
    setOriginalData(newSnapshot);
    setFormData(prev => ({ ...prev, ...newSnapshot }));

    showModal('Profile updated', 'Success', 'success');
    setAvatarFile(null);
  } catch (err) {
    console.error('saveProfile error', err);
    showModal('Save failed', 'Error', 'error');
  }
};

  return (
    <div className={`${darkMode ? 'bg-[#2e2119] border-[#3d2f24]' : 'bg-[#F5E6D3] border-[#E6D0B3]'} rounded-2xl p-6 shadow-sm border relative`}>
      <h3 className={`font-bold ${darkMode ? 'text-[#f5e9df]' : 'text-[#6F422B]'} text-lg mb-4`}>Profile Settings</h3>
      
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Avatar Circle */}
        <div className="flex flex-col items-center justify-center md:w-1/4">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />

          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            whileHover={{ scale: 1.05, rotate: 3 }}
            onClick={handleAvatarClick}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') handleAvatarClick(); }}
            className={`w-32 h-32 rounded-full ${darkMode ? 'bg-[#3a2a20] border-[#E59C5C] text-[#f5e9df]' : 'bg-white border-[#8B5E3C] text-[#6F422B]'} border-4 flex items-center justify-center text-6xl font-bold cursor-pointer select-none shadow-md overflow-hidden`}
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="avatar preview" className="w-full h-full object-cover" />
            ) : (
              (formData.email || user?.email || 'U').charAt(0).toUpperCase()
            )}
          </motion.div>
        </div>

        {/* Inputs Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className={`text-xs font-bold ${darkMode ? 'text-[#f5e9df]' : 'text-[#6F422B]'} ml-1`}>Full Name</label>
            <input 
              type="text" 
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`w-full p-2 rounded-lg ${darkMode ? 'bg-[#3a2a20] text-[#f5e9df] focus:ring-[#E59C5C]/20' : 'bg-white text-[#6F422B] focus:ring-[#8B5E3C]/20'} border-none outline-none shadow-inner focus:ring-2 transition-all`}
            />
          </div>
          
          <div className="space-y-1">
            <label className={`text-xs font-bold ${darkMode ? 'text-[#f5e9df]' : 'text-[#6F422B]'} ml-1`}>Bio</label>
            <input 
              type="text" 
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className={`w-full p-2 rounded-lg ${darkMode ? 'bg-[#3a2a20] text-[#f5e9df] focus:ring-[#E59C5C]/20' : 'bg-white text-[#6F422B] focus:ring-[#8B5E3C]/20'} border-none outline-none shadow-inner focus:ring-2 transition-all`}
            />
          </div>

          <div className="space-y-1">
            <label className={`text-xs font-bold ${darkMode ? 'text-[#f5e9df]' : 'text-[#6F422B]'} ml-1`}>Username</label>
            <input 
              type="text" 
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full p-2 rounded-lg ${darkMode ? 'bg-[#3a2a20] text-[#f5e9df] focus:ring-[#E59C5C]/20' : 'bg-white text-[#6F422B] focus:ring-[#8B5E3C]/20'} border-none outline-none shadow-inner focus:ring-2 transition-all`}
            />
          </div>

          <div className="space-y-1">
            <label className={`text-xs font-bold ${darkMode ? 'text-[#f5e9df]' : 'text-[#6F422B]'} ml-1`}>Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              disabled
              className={`w-full p-2 rounded-lg ${darkMode ? 'bg-[#1f1b16] text-gray-400' : 'bg-gray-100 text-gray-500'} border-none outline-none shadow-inner cursor-not-allowed`}
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-6">
          <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenPasswordModal}
          className={`px-4 py-2 bg-transparent border-2 ${darkMode ? 'border-[#E59C5C] text-[#f5e9df] hover:bg-[#E59C5C]' : 'border-[#8B5E3C] text-[#6F422B] hover:bg-[#8B5E3C]'} hover:text-white rounded-lg text-sm font-bold transition-colors`}
        >
          Change Password
        </motion.button>
        <motion.button 
          whileHover={hasChanges ? { scale: 1.02 } : {}}
          whileTap={hasChanges ? { scale: 0.98 } : {}}
          onClick={saveProfile}
          disabled={!hasChanges}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-colors ${
            hasChanges 
              ? darkMode ? "bg-[#E59C5C] text-white hover:bg-[#d08a4a]" : "bg-[#8B5E3C] text-white hover:bg-[#70482E]" 
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Save Profile
        </motion.button>
      </div>
    </div>
  );
};
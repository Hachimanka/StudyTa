import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion'; 

/* ProfileSection Component */
export const ProfileSection = ({ onOpenPasswordModal }) => {
  // Hardcoded initial data
  const initialData = {
    fullName: "Placeholder",
    bio: "Placeholder",
    username: "placeholder",
    email: "placeholder",
    avatar: ""
  };

  const [formData, setFormData] = useState(initialData);

  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  const hasChanges = 
    formData.fullName !== initialData.fullName ||
    formData.bio !== initialData.bio ||
    formData.username !== initialData.username ||
    formData.avatar !== initialData.avatar;

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
    setFormData(prev => ({ ...prev, avatar: file.name }));
  };

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  return (
    <div className="bg-[#F5E6D3] rounded-2xl p-6 shadow-sm border border-[#E6D0B3] relative">
      <h3 className="font-bold text-[#6F422B] text-lg mb-4">Profile Settings</h3>
      
      
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
            className="w-32 h-32 rounded-full bg-white border-4 border-[#8B5E3C] flex items-center justify-center text-6xl text-[#6F422B] font-bold cursor-pointer select-none shadow-md overflow-hidden"
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="avatar preview" className="w-full h-full object-cover" />
            ) : (
              formData.fullName.charAt(0)
            )}
          </motion.div>
        </div>

        {/* Inputs Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#6F422B] ml-1">Full Name</label>
            <input 
              type="text" 
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full p-2 rounded-lg bg-white border-none outline-none text-[#6F422B] shadow-inner focus:ring-2 focus:ring-[#8B5E3C]/20 transition-all"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#6F422B] ml-1">Bio</label>
            <input 
              type="text" 
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="w-full p-2 rounded-lg bg-white border-none outline-none text-[#6F422B] shadow-inner focus:ring-2 focus:ring-[#8B5E3C]/20 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#6F422B] ml-1">Username</label>
            <input 
              type="text" 
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-2 rounded-lg bg-white border-none outline-none text-[#6F422B] shadow-inner focus:ring-2 focus:ring-[#8B5E3C]/20 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#6F422B] ml-1">Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              disabled
              className="w-full p-2 rounded-lg bg-gray-100 border-none outline-none text-gray-500 shadow-inner cursor-not-allowed"
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
          className="px-4 py-2 bg-transparent border-2 border-[#8B5E3C] text-[#6F422B] rounded-lg text-sm font-bold hover:bg-[#8B5E3C] hover:text-white transition-colors"
        >
          Change Password
        </motion.button>
        <motion.button 
          whileHover={hasChanges ? { scale: 1.02 } : {}}
          whileTap={hasChanges ? { scale: 0.98 } : {}}
          disabled={!hasChanges}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-colors ${
            hasChanges 
              ? "bg-[#8B5E3C] text-white hover:bg-[#70482E]" 
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Save Profile
        </motion.button>
      </div>
    </div>
  );
};
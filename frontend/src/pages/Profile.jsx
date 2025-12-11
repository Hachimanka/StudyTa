import React, { useState } from 'react'
import { motion } from 'framer-motion';
import { ToggleSwitch, ChangePasswordModal } from '../components/profile/settingsComponent';
import { ProfileSection } from '../components/profile/profileSection';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

/* Animation Variants */
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
};

export default function Profile() {
    const { user } = useAuth();
    const { darkMode, setDarkMode } = useSettings();

    const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);

    return (
        <div className={`min-h-screen font-sans p-4 md:p-8 transition-colors duration-300 ${
            darkMode ? 'bg-[#1f1b16]' : 'bg-[#E5D4C0]'
        }`}>
            
            {/* Page Header */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-6xl mx-auto mb-6"
            >
                <h1 className={`text-4xl font-bold transition-colors duration-300 ${
                    darkMode ? 'text-[#f5e9df]' : 'text-[#6F422B]'
                }`}>Settings</h1>
            </motion.div>

            {/* Main Grid Layout - Animated Container */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                
                {/* Profile Section */}
                <motion.div variants={itemVariants} className="md:col-span-3">
                    <ProfileSection onOpenPasswordModal={() => setPasswordModalOpen(true)} />
                </motion.div>

                {/* Appearance Card */}
                <motion.div 
                    variants={itemVariants}
                    whileHover={{ y: -5 }} 
                    className={`rounded-2xl p-6 shadow-sm border h-full min-h-[12rem] transition-colors duration-300 ${
                        darkMode 
                            ? 'bg-[#2e2119] border-[#3d2f24]' 
                            : 'bg-[#F5E6D3] border-[#E6D0B3]'
                    }`}
                >
                    <h3 className={`font-bold text-lg mb-4 transition-colors duration-300 ${
                        darkMode ? 'text-[#f5e9df]' : 'text-[#6F422B]'
                    }`}>Appearance</h3>
                    <ToggleSwitch 
                        label="Dark Mode" 
                        subLabel="Switch to dark theme" 
                        checked={darkMode} 
                        onChange={setDarkMode}
                        darkMode={darkMode}
                    />
                </motion.div>
            </motion.div>

            {/* Modal Overlay */}
            <ChangePasswordModal 
                isOpen={isPasswordModalOpen} 
                onClose={() => setPasswordModalOpen(false)}
                userEmail={user?.email || ''}
            />

        </div>
    )
}
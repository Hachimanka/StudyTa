import React, { useState } from 'react'
import { motion } from 'framer-motion';
import { ToggleSwitch, ChangePasswordModal } from '../components/profile/settingsComponent';
import { ProfileSection } from '../components/profile/profileSection';

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
    const defaultSettings = {
        darkMode: false,
        emailNotif: false
    };

    const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
    
    // Settings State
    const [darkMode, setDarkMode] = useState(defaultSettings.darkMode);
    const [emailNotif, setEmailNotif] = useState(defaultSettings.emailNotif);

    const hasSettingsChanged = 
        darkMode !== defaultSettings.darkMode || 
        emailNotif !== defaultSettings.emailNotif;

    const handleCancel = () => {
        setDarkMode(defaultSettings.darkMode);
        setEmailNotif(defaultSettings.emailNotif);
    };

    // Save (Mock function)
    const handleSave = () => {
        console.log("Saving settings:", { darkMode, emailNotif });
    };

    return (
        <div className="min-h-screen bg-[#E5D4C0] font-sans p-4 md:p-8">
            
            {/* Page Header */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-6xl mx-auto mb-6"
            >
                <h1 className="text-4xl font-bold text-[#6F422B]">Settings</h1>
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
                    className="bg-[#F5E6D3] rounded-2xl p-6 shadow-sm border border-[#E6D0B3] h-full min-h-[12rem] transition-colors"
                >
                    <h3 className="font-bold text-[#6F422B] text-lg mb-4">Appearance</h3>
                    <ToggleSwitch 
                        label="Dark Mode" 
                        subLabel="Switch to dark theme" 
                        checked={darkMode} 
                        onChange={setDarkMode} 
                    />
                </motion.div>

                {/* Notifications Card */}
                <motion.div 
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                    className="bg-[#F5E6D3] rounded-2xl p-6 shadow-sm border border-[#E6D0B3] h-full min-h-[12rem] transition-colors"
                >
                    <h3 className="font-bold text-[#6F422B] text-lg mb-4">Notifications</h3>
                    <ToggleSwitch 
                        label="Email Notifications" 
                        subLabel="Study reminders via email" 
                        checked={emailNotif} 
                        onChange={setEmailNotif} 
                    />
                </motion.div>
            </motion.div>

            {/* Footer Actions */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="max-w-6xl mx-auto flex justify-end gap-4 -mt-10.5 pb-0"
            >
                <motion.button 
                    whileHover={hasSettingsChanged ? { scale: 1.05 } : {}}
                    whileTap={hasSettingsChanged ? { scale: 0.95 } : {}}
                    onClick={handleCancel}
                    disabled={!hasSettingsChanged}
                    className={`px-8 py-2 border rounded-xl font-bold transition shadow-sm ${
                        hasSettingsChanged 
                        ? "bg-white border-[#8B5E3C] text-[#8B5E3C] hover:bg-gray-50" 
                        : "bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed"
                    }`}
                >
                    Cancel Changes
                </motion.button>
                <motion.button 
                    whileHover={hasSettingsChanged ? { scale: 1.05 } : {}}
                    whileTap={hasSettingsChanged ? { scale: 0.95 } : {}}
                    onClick={handleSave}
                    disabled={!hasSettingsChanged}
                    className={`px-8 py-2 rounded-xl font-bold transition shadow-sm ${
                        hasSettingsChanged 
                        ? "bg-[#8B5E3C] text-white hover:bg-[#70482E]" 
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                >
                    Save Changes
                </motion.button>
            </motion.div>

            {/* Modal Overlay */}
            <ChangePasswordModal 
                isOpen={isPasswordModalOpen} 
                onClose={() => setPasswordModalOpen(false)} 
            />

        </div>
    )
}
import React, { useState } from 'react'
import { motion } from 'framer-motion';
import { ToggleSwitch, ChangePasswordModal } from '../components/profile/settingsComponent';
import { ProfileSection } from '../components/profile/profileSection';

/* Connected Apps Icons (SVG) */
const GoogleIcon = () => (
    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 16 16">
            <g fill="none" fillRule="evenodd" clipRule="evenodd">
                <path fill="#F44336" d="M7.209 1.061c.725-.081 1.154-.081 1.933 0a6.57 6.57 0 0 1 3.65 1.82a100 100 0 0 0-1.986 1.93q-1.876-1.59-4.188-.734q-1.696.78-2.362 2.528a78 78 0 0 1-2.148-1.658a.26.26 0 0 0-.16-.027q1.683-3.245 5.26-3.86" opacity=".987"/>
                <path fill="#FFC107" d="M1.946 4.92q.085-.013.161.027a78 78 0 0 0 2.148 1.658A7.6 7.6 0 0 0 4.04 7.99q.037.678.215 1.331L2 11.116Q.527 8.038 1.946 4.92" opacity=".997"/>
                <path fill="#448AFF" d="M12.685 13.29a26 26 0 0 0-2.202-1.74q1.15-.812 1.396-2.228H8.122V6.713q3.25-.027 6.497.055q.616 3.345-1.423 6.032a7 7 0 0 1-.51.49" opacity=".999"/>
                <path fill="#43A047" d="M4.255 9.322q1.23 3.057 4.51 2.854a3.94 3.94 0 0 0 1.718-.626q1.148.812 2.202 1.74a6.62 6.62 0 0 1-4.027 1.684a6.4 6.4 0 0 1-1.02 0Q3.82 14.524 2 11.116z" opacity=".993"/>
            </g>
        </svg>
    </div>
);

const FBIcon = () => (
    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256">
            <path fill="#1877F2" d="M256 128C256 57.308 198.692 0 128 0C57.308 0 0 57.307 0 128c0 63.888 46.808 116.843 108 126.445V165H75.5v-37H108V99.8c0-32.08 19.11-49.8 48.347-49.8C170.352 50 185 52.5 185 52.5V84h-16.14C152.958 84 148 93.867 148 103.99V128h35.5l-5.675 37H148v89.445c61.192-9.602 108-62.556 108-126.445"/>
            <path fill="#FFF" d="m177.825 165l5.675-37H148v-24.01C148 93.866 152.959 84 168.86 84H185V52.5S170.352 50 156.347 50C127.11 50 108 67.72 108 99.8V128H75.5v37H108v89.445A128.959 128.959 0 0 0 128 256a128.9 128.9 0 0 0 20-1.555V165h29.825"/>
        </svg>
    </div>
);

const MicrosoftIcon = () => (
    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256">
            <path fill="#F1511B" d="M121.666 121.666H0V0h121.666z"/>
            <path fill="#80CC28" d="M256 121.666H134.335V0H256z"/>
            <path fill="#00ADEF" d="M121.663 256.002H0V134.336h121.663z"/>
            <path fill="#FBBC09" d="M256 256.002H134.335V134.336H256z"/>
        </svg>
    </div>
);

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

                {/* Connected Apps Card */}
                <motion.div 
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                    className="bg-[#F5E6D3] rounded-2xl p-6 shadow-sm border border-[#E6D0B3] self-start min-h-[8rem] flex flex-col transition-colors"
                >
                    <h3 className="font-bold text-[#6F422B] text-lg mb-2">Connected Apps</h3>
                    <div className="flex gap-4 mt-2 justify-center items-center w-full">
                        <motion.div whileHover={{ scale: 1.1 }} className="flex items-center justify-center"><GoogleIcon /></motion.div>
                        <motion.div whileHover={{ scale: 1.1 }} className="flex items-center justify-center"><FBIcon /></motion.div>
                        <motion.div whileHover={{ scale: 1.1 }} className="flex items-center justify-center"><MicrosoftIcon /></motion.div>
                    </div>
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
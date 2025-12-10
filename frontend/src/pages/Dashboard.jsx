import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import Sidebar from "../components/Sidebar";
import ChatWidget from "../components/ChatWidget";
import { Link } from 'react-router-dom'
import QuickSummaryCard from "../components/dashboard/QuickSummaryCard";
import StudyCard from "../components/dashboard/StudyCard";
import MusicCard from "../components/dashboard/MusicCard";
import RecentFilesList from "../components/dashboard/RecentFilesList";
import CalendarWidget from "../components/dashboard/CalendarWidget";
import AnalyticsWidget from "../components/dashboard/AnalyticsWidget";

export default function Home() {
  const { user } = useAuth();
  const { darkMode, studyStats, profileName, getThemeColors } = useSettings();
  const [displayName, setDisplayName] = useState("");
  const [analyticsStats, setAnalyticsStats] = useState({
    hoursStudied: 0,
    topicsCovered: 0,
    streak: 0
  }); // Stats from analytics API
  const [libraryStats, setLibraryStats] = useState({
    totalFiles: 0,
    totalFolders: 0,
    recentFiles: [],
    totalSize: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch analytics stats from API (shared with Analytics page)
  const fetchAnalyticsStats = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || '';
      let userId = user?._id;
      if (!userId) {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        userId = userData?._id;
      }
      if (!userId) return;

      const res = await fetch(`${API_BASE}/api/analytics/stats?userId=${userId}&range=all`);
      if (res.ok) {
        const data = await res.json();
        setAnalyticsStats({
          hoursStudied: data.totalHours || 0,
          topicsCovered: data.topicsFinished || 0,
          streak: data.streak || 0
        });
      }
    } catch (err) {
      console.error('Failed to fetch analytics stats:', err);
    }
  };

  // Fetch library statistics
  const fetchLibraryStats = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || ''
      const userId = user?._id
      const [filesRes, foldersRes] = await Promise.all([
        fetch(`${API_BASE}/api/library/files${userId ? `?userId=${encodeURIComponent(userId)}` : ''}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`${API_BASE}/api/library/folders`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (filesRes.ok && foldersRes.ok) {
        const filesRaw = await filesRes.json();
        const folders = await foldersRes.json();
        const files = Array.isArray(filesRaw) ? filesRaw.map(f => ({
          name: f.originalName || f.fileName,
          uploadDate: f.createdAt,
          size: f.fileSize || 0,
          type: f.fileType || 'unknown'
        })) : [];
        
        // Calculate total size and get recent files
        const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
        const recentFiles = files
          .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
          .slice(0, 5)
          ;

        setLibraryStats({
          totalFiles: files.length,
          totalFolders: folders.length,
          recentFiles,
          totalSize
        });
      }
    } catch (error) {
      console.log('Library stats unavailable:', error.message);
    }
  };

  // Generate recent activities based on app usage
  const generateRecentActivities = () => {
    const activities = [];
    const now = new Date();
    
    // Add library-based activities
    if (libraryStats.recentFiles.length > 0) {
      libraryStats.recentFiles.slice(0, 3).forEach((file, index) => {
        const uploadTime = new Date(file.uploadDate);
        const timeDiff = Math.floor((now - uploadTime) / (1000 * 60 * 60)); // hours ago
        
        activities.push({
          icon: '📁',
          text: `Uploaded "${file.name}"`,
          time: timeDiff < 1 ? 'Just now' : `${timeDiff} hours ago`,
          type: 'upload'
        });
      });
    }

    // Add study session activities (from localStorage or settings)
    const lastStudySession = localStorage.getItem('lastStudySession');
    if (lastStudySession) {
      const sessionTime = new Date(lastStudySession);
      const hoursAgo = Math.floor((now - sessionTime) / (1000 * 60 * 60));
      activities.push({
        icon: '🎯',
        text: 'Completed study session',
        time: hoursAgo < 1 ? 'Just now' : `${hoursAgo} hours ago`,
        type: 'study'
      });
    }

    // Add summary activities
    const summaryHistory = JSON.parse(localStorage.getItem('summaryHistory') || '[]');
    if (summaryHistory.length > 0) {
      const lastSummary = summaryHistory[summaryHistory.length - 1];
      activities.push({
        icon: '📋',
        text: `Created summary: "${lastSummary.title || 'Content Summary'}"`,
        time: '2 hours ago',
        type: 'summary'
      });
    }

    // Sort by most recent and limit to 5
    setRecentActivities(activities.slice(0, 5));
  };

  // Generate weekly progress data
  const generateWeeklyProgress = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const progress = days.map((day, index) => ({
      day,
      sessions: Math.floor(Math.random() * 5) + 1, // Mock data for now
      minutes: Math.floor(Math.random() * 120) + 30
    }));
    setWeeklyProgress(progress);
  };

  useEffect(() => {
    async function fetchUserInfo() {
      if (user?._id) {
        try {
          const API_BASE = import.meta.env.VITE_API_BASE || ''
          // Prefer profile endpoint which contains username and profile fields
          const res = await fetch(`${API_BASE}/api/profile/${user._id}`);
          if (res.ok) {
            const payload = await res.json();
            const p = payload.profile || {};
            const u = payload.user || {};
            // Prioritize: profile username > user username > settings profileName
            setDisplayName(p.username || u.username || profileName || u.name || '');
          } else {
            // Fallback to user object from auth context
            setDisplayName(user?.profile?.username || user?.username || profileName || '');
          }
        } catch {
          setDisplayName(user?.username || profileName || '');
        }
      } else {
        setDisplayName(profileName || '');
      }
    }

    const loadDashboardData = async () => {
      setLoading(true);
      await Promise.all([
        fetchUserInfo(),
        fetchLibraryStats(),
        fetchAnalyticsStats()
      ]);
      generateRecentActivities();
      generateWeeklyProgress();
      setLoading(false);
    };

    loadDashboardData();
  }, [user, profileName]);

  // Update activities when library stats change
  useEffect(() => {
    if (!loading) {
      generateRecentActivities();
    }
  }, [libraryStats, loading]);

  const themeColors = getThemeColors();

  // Derive avatar URL: prefer profile.profileImageUrl, then user.avatarUrl, then localStorage
const avatarUrl = (() => {
  try {
    // First check user object from auth context
    const fromUser = user?.profile?.profileImageUrl || user?.avatarUrl || null;
    if (fromUser) return fromUser;
    
    // Then check localStorage
    const raw = localStorage.getItem('stuyta_user') || localStorage.getItem('studytA_user') || localStorage.getItem('user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    
    // Check multiple possible locations in localStorage
    const fromStorage = parsed?.profile?.profileImageUrl || parsed?.avatarUrl || parsed?.avatar || null;
    
    return fromStorage;
  } catch (e) {
    console.warn('Error getting avatar URL:', e);
    return null;
  }
})();

  // Utility function to format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Utility function to format time ago
  const formatTimeAgo = (date) => {
    if (!date) return 'Unknown';
    const now = new Date();
    const past = new Date(date);
    const diffInHours = Math.floor((now - past) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const days = Math.floor(diffInHours / 24);
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;
    const weeks = Math.floor(days / 7);
    if (weeks === 1) return '1 week ago';
    return `${weeks} weeks ago`;
  };

  const getInitial = () => {
    // For avatar placeholder, use the first letter of email
    let email = user?.email;
    if (!email) {
      try {
        const stored = localStorage.getItem('stuyta_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          email = parsed?.email;
        }
      } catch (e) {
        // ignore parse errors
      }
    }
    if (email) return email.charAt(0).toUpperCase();
    if (!displayName) return "?";
    return displayName.trim().charAt(0).toUpperCase();
  };

  return (
    <div
      className={`flex min-h-screen transition-colors duration-500 ${
        darkMode ? "bg-[#1f1b16] text-[#f5e9df]" : "bg-[#F2D9C7] text-[#4A2C1E]"
      }`}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Scoped styles to apply dashboard text color */}
      <style>{`#dashboard-main, #dashboard-main * { color: #6F422B !important; } #dashboard-main .dashboard-subtitle { color: #FFFFFF !important; }`}</style>

      {/* Main Dashboard */}
      <main id="dashboard-main" className="p-12 flex-1 ml-20 md:ml-30 mr-7.5 transition-all duration-300">
        <ChatWidget />
        
        {/* Header and Study Streak Section */}
        <div className="mb-8">
          <div
            className={`p-4 rounded-2xl shadow transition-colors duration-300 ${
              darkMode ? "bg-[#2e2119]" : "bg-[#D69055]/75"
            }`}
          >
            <div className="flex items-start justify-between">
              {/* Left: Profile Image */}
              <div className="flex items-center">
                <div className="w-20 h-20 rounded-full bg-[#FFFFFF] border-2 border-[#6F422B] text-[#845C47] flex items-center justify-center font-semibold focus:outline-none focus:ring-2 focus:ring-[#FDF3EA]/60 focus:ring-offset-2 focus:ring-offset-[#845845] transition-shadow overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    getInitial()
                  )}
                </div>
              </div>

              {/* Middle: Welcome Title and Subtitle */}
              <div className="flex-1 mx-8">
                <h1
                  className={`text-5xl font-bold transition-colors duration-300 ${
                    darkMode ? "text-[#f5e9df]" : "text-[#4A2C1E]"
                  }`}
                >
                  {displayName ? `Welcome back, ${displayName}!` : "Welcome back!"}
                </h1>
                <p className="mt-1 text-xl transition-colors duration-300 dashboard-subtitle">
                  Ready to continue your learning journey?
                </p>
              </div>

              {/* Right: Study Streak */}
              <div className={`p-2 rounded-xl shadow transition-colors duration-300 ${
                darkMode ? "bg-[#2e2119]" : "bg-white"
              }`}>
                <div className="flex items-center justify-between">
                  {/* Study Streak Text and Number */}
                  <div className="text-center">
                    <h2
                      className={`text-sm font-bold transition-colors duration-300 ${
                        darkMode ? "text-[#f5e9df]" : "text-[#4A2C1E]"
                      }`}
                    >
                      Study Streak
                    </h2>
                    <p
                      className={`text-4xl font-bold transition-colors duration-300 ${
                        darkMode ? "text-[#f5e9df]" : "text-[#4A2C1E]"
                      }`}
                    >
                      {analyticsStats.streak}
                    </p>
                  </div>
                  
                  {/* Flame SVG on the right */}
                  <div className="ml-2">
                    <svg width="50" height="50" viewBox="0 0 62 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M56.1097 36.4455C55.0913 35.1121 53.8516 33.9565 52.7003 32.8009C49.7337 30.1342 46.3686 28.223 43.5349 25.4229C36.9375 18.9339 35.4764 8.22246 39.6827 0C35.4764 1.02225 31.8013 3.33343 28.6576 5.86683C17.1897 15.1115 12.6734 31.4231 18.0753 45.4235C18.2524 45.868 18.4295 46.3124 18.4295 46.8902C18.4295 47.868 17.7653 48.7569 16.8798 49.1125C15.8614 49.557 14.7987 49.2903 13.9574 48.5792C13.7061 48.3679 13.496 48.1117 13.3376 47.8236C8.33418 41.4678 7.53718 32.3565 10.9023 25.0674C3.50792 31.112 -0.521339 41.3345 0.0542699 50.9792C0.319936 53.2015 0.585601 55.4238 1.33832 57.6461C1.95821 60.3128 3.1537 62.9796 4.48203 65.3352C9.26401 73.0243 17.5439 78.5356 26.4437 79.6467C35.9191 80.8467 46.0587 79.1134 53.3202 72.5354C61.423 65.1574 64.2568 53.3349 60.0947 43.2012L59.5191 42.0456C58.5893 40.0011 56.1097 36.4455 56.1097 36.4455ZM42.118 64.4463C40.8782 65.513 38.8414 66.6686 37.2475 67.113C32.2884 68.8909 27.3293 66.4019 24.407 63.4685C29.676 62.224 32.8197 58.3128 33.7495 54.3571C34.5022 50.8014 33.0854 47.868 32.5098 44.4457C31.9784 41.1567 32.067 38.3566 33.2625 35.2899C34.1037 36.9788 34.9893 38.6678 36.052 40.0011C39.4613 44.4457 44.8189 46.4013 45.9701 52.4459C46.1473 53.0682 46.2358 53.6904 46.2358 54.3571C46.3686 58.0016 44.7747 62.0018 42.118 64.4463Z" 
                        fill={darkMode ? "#E59C5C" : "#71412A"} 
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {loading && (
              <div className="flex items-center mt-6 pt-6 border-t border-gray-300/30">
                <div
                  className="animate-spin rounded-full h-4 w-4 border-b-2 mr-2"
                  style={{ borderColor: "#E59C5C" }}
                ></div>
                <span
                  className={`transition-colors duration-300 ${
                    darkMode ? "text-[#f5e9df]/70" : "text-[#5C4333]"
                  }`}
                >
                  Loading your data...
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-8">
          {/* Left Column - 2 rows, 2 columns width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions - Row 1 */}
            <div>
              <h3
                className={`text-2xl font-semibold mb-4 transition-colors duration-300 ${
                  darkMode ? "text-[#f5e9df]" : "text-[#6F422B]"
                }`}
              >
                Quick Actions
              </h3>
              <div className="flex flex-row gap-4">
                {/* Use the individual card components */}
                <QuickSummaryCard darkMode={darkMode} themeColors={themeColors} />
                <StudyCard darkMode={darkMode} themeColors={themeColors} />
                <MusicCard darkMode={darkMode} themeColors={themeColors} />
              </div>
            </div>

            {/* Recent Files - Row 2 */}
            <div>
              <h3
                className={`text-2xl font-semibold mb-6 transition-colors duration-300 ${
                  darkMode ? "text-[#f5e9df]" : "text-[#4A2C1E]"
                }`}
              >
                Recent Files
              </h3>
              <div className="flex flex-row gap-4">
                <RecentFilesList darkMode={darkMode} themeColors={themeColors} recentFiles={libraryStats.recentFiles} />
              </div>
            </div>
          </div>

          {/* Right Column - 1 column width, 2 rows */}
          <div className="space-y-6">
            {/* Upcoming Events - Row 1 & 2 (taller) */}
            <div>
              <h3
                className={`text-2xl font-semibold mb-4 transition-colors duration-300 ${
                  darkMode ? "text-[#f5e9df]" : "text-[#4A2C1E]"
                }`}
              >
                Upcoming Events
              </h3>
              
              {/* Month Navigation */}
              <CalendarWidget darkMode={darkMode} themeColors={themeColors} />
            </div>

            {/* This Week - Row 3 (shorter) */}
            <div>
              <h3
                className={`text-2xl font-semibold mb-4 transition-colors duration-300 ${
                  darkMode ? "text-[#f5e9df]" : "text-[#4A2C1E]"
                }`}
              >
                This Week
              </h3>

              {/* This Week Analytics */}
              <AnalyticsWidget darkMode={darkMode} themeColors={themeColors} studyStats={studyStats} analyticsStats={analyticsStats} /> 
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

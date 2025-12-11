import React from 'react';
import { useNavigate } from 'react-router-dom';

const AnalyticsWidget = ({ darkMode, themeColors, studyStats, analyticsStats }) => {
  const navigate = useNavigate();
  
  const formatHMS = (secs) => {
    const s = Math.max(0, Math.floor(secs || 0));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return `${h}:${pad(m)}:${pad(ss)}`;
  };

  // Use analyticsStats from API if available, fallback to studyStats from localStorage
  const timeStudied = analyticsStats?.totalDurationSeconds !== undefined 
    ? formatHMS(analyticsStats.totalDurationSeconds) 
    : formatHMS((studyStats?.totalTime || 0) * 60);

  const totalSessions = analyticsStats?.totalSessions ?? (studyStats?.dailySessions || 0);

  const handleNavigateToAnalytics = () => {
    navigate('/analytics');
  };
  
  return (
    <div>
      <div className="grid grid-cols-2 gap-4 h-20">
        {/* Time Studied Box - Clickable */}
        <button
          onClick={handleNavigateToAnalytics}
          className={`p-2 rounded-xl shadow transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-lg ${
            darkMode ? "bg-[#2e2119] hover:bg-[#3a2a1f]" : "bg-white hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center justify-between">
            {/* Time Studied Text and Number */}
            <div className="text-center">
              <h2
                className={`whitespace-nowrap pl-2 text-xs font-medium transition-colors duration-300 ${
                  darkMode ? "text-white" : "text-[#4A2C1E]"
                }`}
              >
                Time Studied
              </h2>
              <p
                className={`text-2xl font-bold transition-colors duration-300 ${
                  darkMode ? "text-[#f5e9df]" : "text-[#4A2C1E]"
                }`}
              >
                {timeStudied}
              </p>
            </div>
            
            {/* Clock SVG on the right */}
            <div className="ml-2">
              <svg width="50" height="50" viewBox="0 0 57 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M56.9517 70.5589C55.3946 56.8286 49.1431 51.1375 44.5769 46.9875C41.42 44.1071 39.9021 42.6089 39.9021 40C39.9021 37.4268 41.4146 35.9571 44.5627 33.1357C49.1823 28.9982 55.5087 23.3304 56.9553 9.41432C57.071 8.24518 56.9404 7.06472 56.5722 5.94934C56.2039 4.83396 55.6061 3.8085 54.8174 2.93933C53.9752 2.01095 52.9482 1.26975 51.8028 0.763499C50.6573 0.257246 49.4187 -0.00282594 48.1668 4.38619e-05H8.8332C7.57958 -0.0038812 6.33907 0.255666 5.1917 0.761938C4.04433 1.26821 3.0156 2.00996 2.17189 2.93933C1.38561 3.8097 0.790062 4.8356 0.423671 5.95086C0.05728 7.06612 -0.0718226 8.24597 0.0446911 9.41432C1.48598 23.2857 7.7892 28.9125 12.391 33.0197C15.5693 35.8572 17.0979 37.3375 17.0979 40C17.0979 42.6964 15.5658 44.2071 12.3768 47.0982C7.83374 51.2232 1.59822 56.8714 0.048255 70.5589C-0.0774836 71.7227 0.0431793 72.9001 0.402362 74.014C0.761546 75.1279 1.35117 76.1533 2.1327 77.0232C2.97818 77.9634 4.01189 78.7145 5.16641 79.2274C6.32094 79.7403 7.57035 80.0035 8.8332 80H48.1668C49.4296 80.0035 50.6791 79.7403 51.8336 79.2274C52.9881 78.7145 54.0218 77.9634 54.8673 77.0232C55.6488 76.1533 56.2385 75.1279 56.5976 74.014C56.9568 72.9001 57.0775 71.7227 56.9517 70.5589ZM44.0531 71.4285H13.0235C10.2442 71.4285 9.46031 68.2143 11.4094 66.2214C16.127 61.4286 25.6495 57.9964 25.6495 52.5V34.2857C25.6495 30.7411 18.8795 28.0357 14.691 22.2857C13.9998 21.3375 14.0692 20 15.8259 20H41.2543C42.7526 20 43.0751 21.3268 42.3945 22.2768C38.2666 28.0357 31.3505 30.7232 31.3505 34.2857V52.5C31.3505 57.9518 41.2757 60.8928 45.6744 66.2268C47.447 68.3768 46.8271 71.4285 44.0531 71.4285Z" 
                  fill={darkMode ? "#E59C5C" : "#71412A"}
                />
              </svg>
            </div>
          </div>
        </button>

        {/* Total Sessions Box - Clickable */}
        <button
          onClick={handleNavigateToAnalytics}
          className={`p-2 rounded-xl shadow transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-lg ${
            darkMode ? "bg-[#2e2119] hover:bg-[#3a2a1f]" : "bg-white hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center justify-between">
            {/* Total Sessions Text and Number */}
            <div className="text-center">
              <h2
                className={`whitespace-nowrap pl-2 text-xs font-medium transition-colors duration-300 ${
                  darkMode ? "text-white" : "text-[#4A2C1E]"
                }`}
              >
                Total Sessions
              </h2>
              <p
                className={`text-4xl font-bold transition-colors duration-300 ${
                  darkMode ? "text-white" : "text-[#4A2C1E]"
                }`}
              >
                {totalSessions}
              </p>
            </div>
            
            {/* Book SVG on the right */}
            <div className="ml-2">
              <svg width="50" height="50" viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M54.2973 0C57.0512 0 59.8134 0.447179 61.7415 2.43282C63.6408 4.39385 64 7.10974 64 9.64103V58.0513C64 60.279 63.7027 62.4697 62.5549 64.2421C61.8927 65.2643 60.9657 66.0905 59.8712 66.6339V70.359C59.8712 73.0913 59.4253 75.8359 57.4311 77.7518C55.4575 79.6472 52.7243 80 50.1768 80H6.19684C4.5543 80 2.97903 79.3517 1.81758 78.1976C0.656134 77.0435 0.00363936 75.4783 0.00363936 73.8462V15.4544C-0.00874703 13.4113 -0.021133 10.8595 0.540384 8.53333C1.22989 5.69436 2.81948 2.94154 6.20096 1.23077C7.5965 0.525128 9.06635 0.246154 10.6353 0.123077C12.1423 -1.14624e-07 13.9796 0 16.1885 0H54.2973ZM50.1768 73.8462C52.4352 73.8462 52.9967 73.4523 53.1247 73.3292C53.228 73.2308 53.678 72.6933 53.678 70.359V67.6923H12.39C10.7475 67.6923 9.17223 68.3407 8.01078 69.4947C6.84933 70.6488 6.19684 72.2141 6.19684 73.8462H50.1768ZM43.7771 25.3949C44.0157 25.0676 44.1871 24.6968 44.2814 24.3037C44.3758 23.9106 44.3913 23.5029 44.3271 23.1038C44.2629 22.7048 44.1202 22.3222 43.9072 21.9779C43.6941 21.6337 43.415 21.3345 43.0856 21.0974C42.7562 20.8604 42.383 20.6901 41.9874 20.5964C41.5918 20.5026 41.1815 20.4872 40.7799 20.551C40.3783 20.6148 39.9933 20.7566 39.6468 20.9683C39.3003 21.1799 38.9992 21.4573 38.7607 21.7846L28.5708 35.8031L24.4213 31.0933C23.8751 30.5005 23.117 30.1436 22.3093 30.099C21.5016 30.0544 20.7084 30.3257 20.0994 30.8547C19.4904 31.3838 19.1139 32.1286 19.0505 32.9299C18.987 33.7312 19.2417 34.5254 19.7599 35.1426L25.4577 41.6082C27.2867 43.6882 30.5939 43.5364 32.2206 41.2923L43.7771 25.3949Z" 
                  fill={darkMode ? "#E59C5C" : "#71412A"}
                />
              </svg>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default AnalyticsWidget;
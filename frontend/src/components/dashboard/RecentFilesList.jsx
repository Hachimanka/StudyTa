import React from 'react';
import { Link } from 'react-router-dom';

const RecentFilesList = ({ darkMode, themeColors, recentFiles }) => {
  const displayFiles = recentFiles?.slice(0, 2) || [];

  const formatDateTime = (value) => {
    if (!value) return '';
    try {
      const d = new Date(value);
      if (isNaN(d)) return String(value);
      const date = d.toLocaleDateString();
      const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `${date} ${time}`;
    } catch (e) {
      return String(value);
    }
  };

  return (
    <div
      className={`w-full p-6 rounded-2xl shadow transition-colors duration-300 ${
        darkMode ? "bg-[#2e2119]" : "bg-white"
      }`}
      // style={{ height: '292px' }} // Fixed height to match other cards
    >
      
      {displayFiles.length === 0 ? (
        <div className={`text-center py-8 ${darkMode ? "text-white/70" : "text-[#5C4333]"}`}>
          <div className="flex justify-center mb-4">
            <svg width="70" height="70" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path fill={darkMode ? "#E59C5C" : "#71412A"} fillRule="evenodd" d="M12 2H6a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-8h-6a3 3 0 0 1-3-3V2zm9 7v-.172a3 3 0 0 0-.879-2.12l-3.828-3.83A3 3 0 0 0 14.172 2H14v6a1 1 0 0 0 1 1h6z" clipRule="evenodd"/>
            </svg>
          </div>
          <p className="text-sm">No recent files</p>
        </div>
      ) : (
      <div className="space-y-4">
        {displayFiles.map((file, index) => (
          <Link to="/library" key={index} className="block"
            onClick={(e) => { /* could pass state later to preselect */ }}
          >
          <div
            className={`relative p-4 rounded-xl shadow-sm transition-colors duration-300 ${
              darkMode ? "bg-[#3a2a20] hover:bg-[#4a3528]" : "bg-white hover:bg-gray-100"
            }`}
            style={{ minHeight: 72 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mr-4"
                  style={{
                    backgroundColor: darkMode
                      ? `${themeColors.primary}20`
                      : `${themeColors.primary}15`
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path fill={darkMode ? "#E59C5C" : "#71412A"} fillRule="evenodd" d="M12 2H6a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-8h-6a3 3 0 0 1-3-3V2zm9 7v-.172a3 3 0 0 0-.879-2.12l-3.828-3.83A3 3 0 0 0 14.172 2H14v6a1 1 0 0 0 1 1h6z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <h4 className={`font-semibold ${darkMode ? "text-white" : "text-[#4A2C1E]"}`}>
                    {file.name}
                  </h4>
                </div>
              </div>
            </div>

            {/* Date positioned bottom-right */}
            <span className={`absolute text-sm ${darkMode ? "text-[#f5e9df]/70" : "text-[#5C4333]"} bottom-2 right-3`}>
              {formatDateTime(file.uploadDate)}
            </span>
          </div>
          </Link>
        ))}
      </div>
      )}
    </div>
  );
};

export default RecentFilesList;
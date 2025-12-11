import React from 'react';
import { Link } from 'react-router-dom';

const RecentFilesList = ({ darkMode, themeColors, recentFiles }) => {
  // Mock files to match the image when no real files exist
  const mockFiles = [
    { name: "Calculus Notes.pdf", uploadDate: "Sep 20, 2025", type: "pdf" },
    { name: "Essay Draft.docx", uploadDate: "Sep 20, 2025", type: "docx" }
  ];

  const displayFiles = recentFiles.length > 0 ? recentFiles.slice(0, 2) : mockFiles;

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
                      : `${themeColors.primary}15`,
                    color: darkMode ? '#FFFFFF' : themeColors.primary
                  }}
                >
                  {file.type?.includes('pdf') || file.name?.includes('.pdf') ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="M14 2v6h6" />
                      <path d="M10 14h4M10 17h4" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="M14 2v6h6" />
                      <path d="M8 12h8M8 16h8" />
                    </svg>
                  )}
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
    </div>
  );
};

export default RecentFilesList;
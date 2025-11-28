import React from 'react';
import { Link } from 'react-router-dom';

const MusicCard = ({ darkMode, themeColors }) => {
  return (
    <Link to="/music" className="w-full">
      <button
        className={`w-full p-6 rounded-xl flex items-center justify-center text-center transition-all duration-300 hover:scale-105 ${
          darkMode 
            ? "bg-[#3a2a20] hover:bg-[#4a3528]" 
            : "bg-white hover:bg-gray-50"
        } shadow`}
      >
        <div className="flex flex-col items-center gap-2">
          <div 
            className="w-20 h-20 rounded-lg flex items-center justify-center mb-2"
            style={{ 
              backgroundColor: darkMode 
                ? `${themeColors.primary}20` 
                : `${themeColors.primary}15`,
              color: themeColors.primary
            }}
          >
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M52 24H40V46C40 48.6522 38.9464 51.1957 37.0711 53.0711C35.1957 54.9464 32.6522 56 30 56C27.3478 56 24.8043 54.9464 22.9289 53.0711C21.0536 51.1957 20 48.6522 20 46C20 43.3478 21.0536 40.8043 22.9289 38.9289C24.8043 37.0536 27.3478 36 30 36C32.28 36 34.32 36.76 36 38V16H52M64 0H8C5.87827 0 3.84344 0.842854 2.34315 2.34315C0.842854 3.84344 0 5.87827 0 8V64C0 66.1217 0.842854 68.1566 2.34315 69.6569C3.84344 71.1571 5.87827 72 8 72H64C66.1217 72 68.1566 71.1571 69.6569 69.6569C71.1571 68.1566 72 66.1217 72 64V8C72 5.87827 71.1571 3.84344 69.6569 2.34315C68.1566 0.842854 66.1217 0 64 0Z" fill="#71412A"/>
            </svg>
          </div>
          <h4 className="font-regular text-lg" style={{ color: '#6F422B' }}>Listen to music</h4>
        </div>
      </button>
    </Link>
  );
};

export default MusicCard;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useSettings } from '../context/SettingsContext';
import ChatWidget from '../components/ChatWidget';

export default function StudyMode() {
  const { darkMode } = useSettings();
  const navigate = useNavigate();
  
  const [fileContent, setFileContent] = useState('');
  const [activeTab, setActiveTab] = useState('text'); // 'text' or 'file'
  const [studyMode, setStudyMode] = useState(''); // Empty by default
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const studyModes = [
    { id: '', name: 'Choose' }, // Placeholder option
    { id: 'multipleChoice', name: 'Multiple Choice' },
    { id: 'trueFalse', name: 'True or False' },
    { id: 'flashcards', name: 'Flashcards' }
  ];

  const historyItems = [
    {
      title: 'Calculus Flashcard',
      date: 'Sep 20, 2025'
    },
    {
      title: 'Biology Quiz',
      date: 'Sep 18, 2025'
    },
    {
      title: 'History True/False',
      date: 'Sep 15, 2025'
    },
    {
      title: 'Physics Multiple Choice',
      date: 'Sep 12, 2025'
    },
    {
      title: 'Chemistry Flashcards',
      date: 'Sep 10, 2025'
    }
  ];

  const handleCreate = () => {
    if (!studyMode) {
      alert('Please select a study mode first.');
      return;
    }
    
    if (!fileContent.trim() && !selectedFile) {
      alert('Please enter some text or upload a file to create study materials.');
      return;
    }
    
    setLoading(true);
    // Simulate API call and then navigate to the selected study mode
    setTimeout(() => {
      setLoading(false);
      navigateToStudyMode(studyMode);
    }, 1500);
  };

  const handleStudyModeChange = (modeId) => {
    setStudyMode(modeId);
    
    // If a valid study mode is selected (not the placeholder), navigate directly
    if (modeId && modeId !== '') {
      navigateToStudyMode(modeId);
    }
  };

  const navigateToStudyMode = (modeId) => {
    // Map the logical mode ids to the actual routes used in `App.jsx`
    switch (modeId) {
      case 'multipleChoice':
        navigate('/MultipleChoiceMode');
        break;
      case 'trueFalse':
        navigate('/TrueFalseMode');
        break;
      case 'flashcards':
        navigate('/FlashCardMode');
        break;
      default:
        // Do nothing for placeholder
        break;
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (limit to 20MB)
    if (file.size > 20 * 1024 * 1024) {
      alert("File size must be less than 20MB.");
      return;
    }

    // Supported file types
    const supportedTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv',
      'application/json',
      'text/markdown',
      'text/html'
    ];

    if (!supportedTypes.includes(file.type) && !file.name.match(/\.(txt|md|csv|json|html|htm)$/i)) {
      alert("Supported file types: PDF, TXT, DOC, DOCX, CSV, JSON, MD, HTML");
      return;
    }

    setSelectedFile(file);
    setFileContent(''); // Clear text input when file is selected
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const clearText = () => {
    setFileContent('');
  };

  const clearHistory = () => {
    if (historyItems.length > 0) {
      if (window.confirm('Are you sure you want to clear all history?')) {
        alert('History cleared!');
        // In a real app, you would update the state to clear historyItems
      }
    }
  };

  // Handle history item click to navigate to study modes
  const handleHistoryItemClick = (title) => {
    if (title.includes('Multiple Choice')) {
      navigate('/MultipleChoiceMode');
    } else if (title.includes('True/False')) {
      navigate('/TrueFalseMode');
    } else if (title.includes('Flashcard')) {
      navigate('/FlashCardMode');
    } else {
      // Default to flashcards if no specific mode detected
      navigate('/FlashCardMode');
    }
  };

  return (
    <div
      className={`flex min-h-screen transition-colors duration-500 ${
        darkMode ? "bg-[#1f1b16] text-[#f5e9df]" : "bg-[#F2D9C7] text-[#4A2C1E]"
      }`}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="p-12 flex-1 ml-20 md:ml-30 mr-7.5 transition-all duration-300">
        <ChatWidget />

        {/* Study Mode Header */}
        <div className="mb-8">
          <h1
            className={`text-6xl font-bold transition-colors duration-300 ${
              darkMode ? "text-[#f5e9df]" : "text-[#6F422B]"
            }`}
          >
            Study Mode
          </h1>
          <p className="mt-1 text-[#8D5A3F] text-xl transition-colors duration-300">
            Create personalized study tools for active recall.
          </p>
        </div>

        {/* Content Wrapper - 70/30 split with 500px height */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-10">
          {/* Input Section - 70% width (7/10 columns) */}
          <div className="lg:col-span-7">
            <div className={`${darkMode ? 'bg-[#2e2119]' : 'bg-white'} rounded-xl p-6 shadow-lg h-[500px]`}>
              {/* Header Row with Study Mode in Top-Right */}
              <div className="flex justify-between items-start mb-4">
                <h2 className={`text-3xl font-semibold ${darkMode ? 'text-white' : 'text-[#6F422B]'}`}>
                  Input Content
                </h2>
                
                {/* Study Mode Selector - Top Right */}
                <div className="flex items-center space-x-3">
                  <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-[#8D5A3F]'}`}>
                    Study Mode:
                  </span>
                  <select
                    value={studyMode}
                    onChange={(e) => handleStudyModeChange(e.target.value)}
                    className={`border rounded-md px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#8C5A41] cursor-pointer ${
                      darkMode 
                        ? 'border-gray-600 bg-[#3a2a20] text-white' 
                        : 'border-[#D9D9D9] bg-white text-[#8D5A3F]'
                    }`}
                  >
                    {studyModes.map(mode => (
                      <option key={mode.id} value={mode.id}>
                        {mode.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tab Buttons */}
              <div className="flex mb-6 space-x-4">
                <button
                  className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
                    activeTab === "text"
                      ? "bg-[#8E593E] text-white"
                      : "border border-[#8E593E] text-[#8E593E] bg-white"
                  }`}
                  onClick={() => setActiveTab("text")}
                >
                  Text Input
                </button>

                <button
                  className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
                    activeTab === "file"
                      ? "bg-[#8E593E] text-white"
                      : "border border-[#8E593E] text-[#8E593E] bg-white"
                  }`}
                  onClick={() => setActiveTab("file")}
                >
                  File Upload
                </button>
              </div>

              {/* New Layout Container - Adjusted for 500px height */}
              <div className="flex flex-col h-[calc(500px-140px)]"> 
                {/* Tabs Content */}
                <div className="flex-1 overflow-y-auto">
                  
                  {/* Text Input Tab */}
                  {activeTab === "text" && (
                    <div className="space-y-4">
                      <textarea
                        className={`w-full h-60 p-4 rounded-xl text-sm font-semibold focus:outline-none resize-none
                          ${darkMode
                            ? 'border-gray-600 bg-[#3a2a20] text-white placeholder-white'
                            : 'border border-[#D9D9D9] bg-white text-[#8D5A3F] placeholder-[#B77A57]'
                          }`}
                        placeholder="Paste your text here to create study materials..."
                        value={fileContent}
                        onChange={(e) => setFileContent(e.target.value)}
                      />

                      <div className={`flex justify-between text-xs mt-1 font-semibold ${darkMode ? 'text-gray-400' : 'text-[#8D5A3F]'}`}>
                        <span>{fileContent.length} Characters</span>
                        <button
                          onClick={clearText}
                          className="text-[#8D5A3F] hover:text-red-700 font-semibold"
                        >
                          Clear Text
                        </button>
                      </div>
                    </div>
                  )}

                  {/* File Upload Tab */}
                  {activeTab === "file" && (
                    <div className="space-y-4">
                      {!selectedFile ? (
                        <div className={`border-2 border-dashed h-64 ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg p-8 text-center flex flex-col items-center justify-center`}>
                          <div className="mb-4">
                            <svg className="mx-auto w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <p className={`mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Upload a file to create study materials</p>
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept=".pdf,.txt,.doc,.docx,.csv,.json,.md,.html,.htm"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                            <span className={`inline-flex items-center px-4 py-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-[#BE8E78] hover:bg-[#A36B4E]'} text-white rounded-lg text-sm font-medium transition-colors`}>
                              Choose File
                            </span>
                          </label>
                        </div>
                      ) : (
                        <div className={`flex items-center justify-between p-4 border ${darkMode ? 'border-gray-600 bg-[#3a2a20]' : 'border-gray-300 bg-gray-50'} rounded-lg h-64`}>
                          <div className="flex items-center">
                            <svg className="w-8 h-8 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                            <div>
                              <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{selectedFile.name}</p>
                              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <button
                            onClick={removeFile}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* Create Button - Bottom */}
                <div className="mt-auto my-4">
                  <button
                    onClick={handleCreate}
                    disabled={loading || !studyMode || (!fileContent.trim() && !selectedFile)}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      loading || !studyMode || (!fileContent.trim() && !selectedFile)
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : `bg-[#8D5A3F] hover:bg-[#6F422B] text-white`
                    }`}
                  >
                    {loading ? "Creating..." : "Create"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* History Section - 30% width (3/10 columns) */}
          <div className="lg:col-span-3">
            <div className={`${darkMode ? 'bg-[#2e2119]' : 'bg-white'} rounded-xl p-6 shadow-lg h-[500px] flex flex-col`}>
              <h2 className={`text-3xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-[#6F422B]'}`}>
                History
              </h2>

              {/* History Content - Takes available space */}
              <div className="flex-1 overflow-y-auto mb-4">
                {historyItems.length > 0 ? (
                  <div className="space-y-3">
                    {historyItems.map((item, index) => (
                      <div 
                        key={index}
                        onClick={() => handleHistoryItemClick(item.title)}
                        className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all duration-200 ${
                          darkMode 
                            ? 'border-gray-600 bg-[#3a2a20] text-white hover:bg-[#4a3528]' 
                            : 'border-[#D9D9D9] bg-white text-[#8D5A3F] hover:bg-gray-50'
                        }`}
                      >
                        {/* Title - Center Left */}
                        <div className="flex items-center justify-between">
                          <h4 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-[#8D5A3F]'}`}>
                            {item.title}
                          </h4>
                        </div>
                        
                        {/* Date - Bottom Right */}
                        <div className="flex justify-end mt-2">
                          <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-[#B77A57]'}`}>
                            {item.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`p-8 text-center rounded-xl border-1 h-full flex flex-col items-center justify-center
                    ${darkMode
                      ? 'border-gray-600 bg-[#3a2a20] text-gray-400'
                      : 'border-gray-300 bg-white text-[#8D5A3F]'
                    }`}>
                    {/* SVG Icon */}
                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4">
                      <path d="M40 0C17.92 0 0 17.92 0 40C0 62.08 17.92 80 40 80C62.08 80 80 62.08 80 40C80 17.92 62.08 0 40 0ZM40 72C22.36 72 8 57.64 8 40C8 22.36 22.36 8 40 8C57.64 8 72 22.36 72 40C72 57.64 57.64 72 40 72ZM44 20H36V44H44V20ZM44 52H36V60H44V52Z" fill="#71412A"/>
                    </svg>
                    <p className={`font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-[#8D5A3F]'}`}>
                      No study history yet
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-[#B77A57]'}`}>
                      Created study materials will appear here
                    </p>
                  </div>
                )}
              </div>

              {/* Clear History Button - Bottom Left */}
              <div className="mt-auto">
                <button
                  onClick={clearHistory}
                  disabled={historyItems.length === 0}
                  className={`text-[#8D5A3F] hover:text-red-700 font-semibold text-xs ${
                    historyItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Clear History
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Generated Study Materials Area - Will be populated after creation */}
        {(fileContent || selectedFile) && (
          <div className={`mt-8 ${darkMode ? 'bg-[#2e2119]' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
            <h3 className={`text-3xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-[#6F422B]'}`}>
              Generated Study Materials
            </h3>
            <div className="text-center py-8">
              <p className={`font-semibold ${darkMode ? 'text-gray-400' : 'text-[#8D5A3F]'}`}>
                Study materials will appear here after generation...
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
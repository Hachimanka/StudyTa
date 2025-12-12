import axios from "axios";
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import Sidebar from "../components/Sidebar";
import ChatWidget from "../components/ChatWidget";
import { useModal } from "../context/ModalContext";

export default function Summarize() {
  const { showModal } = useModal();
  const { user } = useAuth();
  const { darkMode, getThemeColors, playSound } = useSettings();
  const themeColors = getThemeColors();
  const API_BASE = import.meta.env.VITE_API_BASE || '';
  const [inputText, setInputText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("text"); // "text" or "file"
  const [selectedFile, setSelectedFile] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [history, setHistory] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ open: false, type: null, item: null });

  const handleSummarize = async () => {
    if (!inputText.trim() && !selectedFile) return;

    setLoading(true);
    setSummary("");

    try {
      let textToSummarize = inputText;

      // If we have a file but no text, extract text from file first
      if (selectedFile && !inputText.trim()) {
        const formData = new FormData();
        formData.append("pdf", selectedFile);

        const extractResponse = await axios.post(
          `${API_BASE}/api/pdf/extract-text`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        textToSummarize = extractResponse.data.text;
      }

      // Now summarize the text
      const res = await axios.post(`${API_BASE}/api/ai/summarize`, {
        text: textToSummarize,
      });
      setSummary(res.data.summary);

      // Save summary record to backend with userId
      try {
        await axios.post(`${API_BASE}/api/summarize`, {
          sourceText: textToSummarize,
          summaryText: res.data.summary,
          fileName: selectedFile?.name || '',
          userId: user?._id || null
        });
        // reload history
        fetchHistory();
      } catch (saveErr) {
        console.warn('Could not save summary:', saveErr?.message || saveErr);
      }
    } catch (error) {
      console.error("Summarize error:", error);
      setSummary("Error: Failed to summarize the content. Please try again.");
    }

    setLoading(false);
  };

  const fetchHistory = async () => {
    try {
      const userId = user?._id;
      const res = await axios.get(`${API_BASE}/api/summarize/history`, {
        params: userId ? { userId } : {}
      });
      setHistory(res.data.items || []);
    } catch (err) {
      console.warn('Failed to load summary history', err?.message || err);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const handleDeleteHistory = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/summarize/${id}`);
      fetchHistory();
    } catch (err) {
      console.error('Failed to delete summary', err);
    }
  };

  const openLoadModal = (item) => {
    setConfirmModal({ open: true, type: 'load', item });
  };
  const openDeleteModal = (item) => {
    setConfirmModal({ open: true, type: 'delete', item });
  };
  const closeConfirmModal = () => setConfirmModal({ open: false, type: null, item: null });
  const confirmAction = async () => {
    const { type, item } = confirmModal;
    if (!item) return closeConfirmModal();
    if (type === 'load') {
      setSummary(item.summaryText || '');
      closeConfirmModal();
      return;
    }
    if (type === 'delete') {
      try { await handleDeleteHistory(item._id); } catch {}
      closeConfirmModal();
      return;
    }
    closeConfirmModal();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (limit to 20MB)
    if (file.size > 20 * 1024 * 1024) {
      showModal("File size must be less than 20MB.", "File Too Large", "warning");
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
      showModal("Supported file types: PDF, TXT, DOC, DOCX, CSV, JSON, MD, HTML", "Invalid File Type", "warning");
      return;
    }

    setSelectedFile(file);
    setInputText(""); // Clear text input when file is selected
  };

  const clearAll = () => {
    setInputText("");
    setSelectedFile(null);
    setSummary("");
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const copySummary = async () => {
    if (!summary) return;
    
    try {
      await navigator.clipboard.writeText(summary);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Generate a short title from a summary text (first sentence or first ~10 words)
  const generateTitle = (text) => {
    if (!text) return '';
    const cleaned = text.replace(/\s+/g, ' ').trim();
    // Try to use the first sentence
    const sentenceMatch = cleaned.match(/^(.*?[\.\!\?])\s/);
    let title = '';
    if (sentenceMatch && sentenceMatch[1]) {
      title = sentenceMatch[1];
    } else {
      // fallback: first 10 words
      title = cleaned.split(' ').slice(0, 10).join(' ');
    }
    if (title.length > 60) title = title.slice(0, 57) + '...';
    return title;
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
      <main className="p-12 flex-1 ml-20 md:ml-30 mr-7.5 transition-all duration-300">
        <ChatWidget />

        {/* Summarize Section */}
        <div className="mb-8">
          <h1
          className={`text-6xl font-bold transition-colors duration-300 ${
          darkMode ? "text-[#f5e9df]" : "text-[#6F422B]"
          }`}
          >
            Summarize It!
          </h1>
            <p className="mt-1 text-[#8D5A3F] text-xl transition-colors duration-300 summarize-subtitle">
            Turn long notes into clear, concise points instantly.
          </p>
        </div>

        {/* Content Wrapper */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Input Section - Updated to match image design */}
          <div className={`${darkMode ? 'bg-[#2e2119]' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
            <h2 className={`text-3xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-[#6F422B]'}`}>
              Input Content
            </h2>

            {/* Tab Buttons */}
            <div className="flex mb-6 space-x-4">
              <button
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
                  activeTab === "text"
                    ? "bg-[#8E593E] text-white" // active
                    : "border border-[#8E593E] text-[#8E593E] bg-white" // inactive
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

            {/* New Layout Container */}
            <div className="flex flex-col h-[350px]"> 
              {/* Tabs Content */}
              <div className="flex-1 overflow-y-auto">
                
                {/* Text Input Tab */}
                {activeTab === "text" && (
                  <div className="space-y-4">
                    <textarea
                      className={`w-full h-48 p-4 rounded-xl text-sm font-semibold focus:outline-none resize-none
                        ${darkMode
                          ? 'border-gray-600 bg-[#3a2a20] text-white placeholder-white'
                          : 'border border-[#D9D9D9] bg-white text-[#8D5A3F] placeholder-[#B77A57]'
                        }`}
                      placeholder="Paste your text here to summarize..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                    />

                    <div className={`flex justify-between text-xs mt-1 font-semibold ${darkMode ? 'text-gray-400' : 'text-[#8D5A3F]'}`}>
                      <span>{inputText.length} Characters</span>
                      <button
                        onClick={() => setInputText("")}
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
                      <div className={`border-2 border-dashed h-48 ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg p-8 text-center flex flex-col items-center justify-center`}>
                        <div className="mb-4">
                          <svg className="mx-auto w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <p className={`mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Upload a file to summarize</p>
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
                      <div className={`flex items-center justify-between p-4 border ${darkMode ? 'border-gray-600 bg-[#3a2a20]' : 'border-gray-300 bg-gray-50'} rounded-lg h-48`}>
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

              {/* Summarize Button — Always Bottom */}
              <div className="mt-auto my-4">
                <button
                  onClick={handleSummarize}
                  disabled={loading || (!inputText.trim() && !selectedFile)}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    loading || (!inputText.trim() && !selectedFile)
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : `bg-[#8D5A3F] hover:bg-[#6F422B] text-white`
                  }`}
                >
                  {loading ? "Summarizing..." : "Summarize"}
                </button>
              </div>
            </div>
          </div>

          {/* Summary Results Section - Updated with same design */}
          <div className={`${darkMode ? 'bg-[#2e2119]' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
            <h2 className={`text-3xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-[#6F422B]'}`}>
              Summary Results
            </h2>

            {/* New Layout Container */}
            <div className="flex flex-col">
              {/* Summary Content - fixed rectangle; inner area scrolls when content is long */}
              <div className="h-[350px]">
                {summary ? (
                  <div className={`p-4 rounded-xl text-sm font-semibold focus:outline-none resize-none h-full overflow-auto box-border
                    ${darkMode
                      ? 'border-gray-600 bg-[#3a2a20] text-white'
                      : 'border border-[#D9D9D9] bg-white text-[#8D5A3F]'
                    } break-words break-all`}>
                    <p className={`whitespace-pre-wrap break-words break-all ${darkMode ? 'text-gray-200' : 'text-[#8D5A3F]'}`}>{summary}</p>
                  </div>
                ) : (
                  <div className={`p-8 text-center rounded-xl border-1 flex flex-col items-center justify-center h-full box-border
                    ${darkMode
                      ? 'border-gray-600 bg-[#3a2a20] text-gray-400'
                      : 'border-gray-300 bg-white text-[#8D5A3F]'
                    }`}>
                    {/* SVG Icon */}
                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4">
                      <path d="M54.0746 58.0042C54.7746 57.4602 55.4106 56.8242 56.6786 55.5562L72.5066 39.7242C72.8906 39.3442 72.7146 38.6842 72.2066 38.5042C69.7278 37.645 67.4785 36.2303 65.6306 34.3682C63.7684 32.5203 62.3537 30.2709 61.4946 27.7922C61.3146 27.2842 60.6546 27.1082 60.2746 27.4922L44.4386 43.3202C43.1706 44.5882 42.5346 45.2242 41.9906 45.9242C41.3426 46.7535 40.7932 47.6415 40.3426 48.5882C39.9626 49.3882 39.6786 50.2442 39.1106 51.9482L38.3746 54.1482L37.2066 57.6482L36.1146 60.9282C35.9784 61.3393 35.9592 61.7801 36.0591 62.2015C36.159 62.6229 36.3741 63.0082 36.6803 63.3144C36.9865 63.6206 37.3718 63.8357 37.7932 63.9356C38.2146 64.0355 38.6555 64.0163 39.0666 63.8802L42.3466 62.7882L45.8466 61.6202L48.0466 60.8842C49.7506 60.3162 50.6066 60.0362 51.4066 59.6522C52.3532 59.1988 53.2452 58.6495 54.0746 58.0042ZM77.4666 34.7682C79.0892 33.145 80.0005 30.9438 80.0001 28.6487C79.9998 26.3537 79.0877 24.1527 77.4646 22.5302C75.8414 20.9076 73.6402 19.9962 71.3451 19.9966C69.0501 19.997 66.8492 20.909 65.2266 22.5322L64.7226 23.0442C64.4792 23.2821 64.298 23.5761 64.1948 23.9004C64.0916 24.2247 64.0695 24.5693 64.1306 24.9042C64.2106 25.3322 64.3506 25.9642 64.6106 26.7122C65.1306 28.2122 66.1146 30.1802 67.9666 32.0322C69.8186 33.8842 71.7866 34.8682 73.2866 35.3882C74.0386 35.6482 74.6666 35.7882 75.0946 35.8682C75.4293 35.9257 75.773 35.902 76.0967 35.799C76.4204 35.6959 76.7146 35.5166 76.9546 35.2762L77.4666 34.7682Z" fill="#71412A"/>
                      <path fillRule="evenodd" clipRule="evenodd" d="M4.688 4.688C-4.76837e-07 9.372 0 16.916 0 32V48C0 63.084 -4.76837e-07 70.628 4.688 75.312C9.376 79.996 16.916 80 32 80H40C55.084 80 62.628 80 67.312 75.312C71.924 70.704 72 63.328 72 48.72L60.728 59.992C59.648 61.072 58.764 61.956 57.768 62.736C56.5997 63.651 55.3333 64.4332 53.992 65.068C52.7645 65.6203 51.5033 66.0946 50.216 66.488L40.968 69.572C39.4999 70.0616 37.9245 70.1326 36.4183 69.7772C34.9121 69.4218 33.5347 68.6538 32.4404 67.5596C31.3461 66.4653 30.5782 65.0878 30.2228 63.5817C29.8674 62.0755 29.9384 60.5001 30.428 59.032L31.524 55.752L33.424 50.048L33.508 49.784C33.992 48.336 34.388 47.152 34.932 46.008C35.572 44.664 36.3493 43.4067 37.264 42.236C38.044 41.236 38.928 40.356 40.008 39.276L56.032 23.248L60.48 18.8L60.988 18.292C62.3472 16.9286 63.9627 15.8475 65.7413 15.1109C67.52 14.3743 69.4268 13.9968 71.352 14C70.748 9.88 69.576 6.948 67.312 4.688C62.628 -4.76837e-07 55.084 0 40 0H32C16.916 0 9.372 -4.76837e-07 4.688 4.688ZM17 28C17 27.2044 17.3161 26.4413 17.8787 25.8787C18.4413 25.3161 19.2044 25 20 25H46C46.7957 25 47.5587 25.3161 48.1213 25.8787C48.6839 26.4413 49 27.2044 49 28C49 28.7956 48.6839 29.5587 48.1213 30.1213C47.5587 30.6839 46.7957 31 46 31H20C19.2044 31 18.4413 30.6839 17.8787 30.1213C17.3161 29.5587 17 28.7956 17 28ZM17 44C17 43.2043 17.3161 42.4413 17.8787 41.8787C18.4413 41.3161 19.2044 41 20 41H30C30.7956 41 31.5587 41.3161 32.1213 41.8787C32.6839 42.4413 33 43.2043 33 44C33 44.7957 32.6839 45.5587 32.1213 46.1213C31.5587 46.6839 30.7956 47 30 47H20C19.2044 47 18.4413 46.6839 17.8787 46.1213C17.3161 45.5587 17 44.7957 17 44ZM17 60C17 59.2043 17.3161 58.4413 17.8787 57.8787C18.4413 57.3161 19.2044 57 20 57H26C26.7956 57 27.5587 57.3161 28.1213 57.8787C28.6839 58.4413 29 59.2043 29 60C29 60.7957 28.6839 61.5587 28.1213 62.1213C27.5587 62.6839 26.7956 63 26 63H20C19.2044 63 18.4413 62.6839 17.8787 62.1213C17.3161 61.5587 17 60.7957 17 60Z" fill="#71412A"/>
                    </svg>
                    <p className={`font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-[#8D5A3F]'}`}>
                      Your AI-generated summary will appear here
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-[#B77A57]'}`}>
                      Add some content and click "Summarize" to get started
                    </p>
                  </div>
                )}
              </div>

              {/* Copy Button - Bottom Left */}
              <div className="mt-1">
                <button
                  onClick={copySummary}
                  disabled={!summary}
                  className={`text-[#8D5A3F] hover:text-red-700 font-semibold text-xs ${
                    !summary ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {copySuccess ? "Copied!" : "Copy Text"}
                </button>
              </div>

              {/* History List */}
              <div className="mt-4">
                <h3 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-[#6F422B]'}`}>Recent Summaries</h3>
                {history && history.length > 0 ? (
                  <ul className="space-y-2 max-h-40 overflow-y-auto overflow-x-hidden">
                    {history.map((h) => (
                      <li key={h._id} className={`flex items-center justify-between p-2 rounded-md ${darkMode ? 'bg-[#3a2a20] text-gray-200' : 'bg-[#FFF7F3] text-[#6F422B]'}`}>
                        <div className="mr-3 flex-1 min-w-0">
                          <div className="text-xs text-gray-500">{new Date(h.createdAt).toLocaleString()}</div>
                          <div className="text-sm truncate" title={h.summaryText}>{generateTitle(h.summaryText)}</div>
                        </div>
                        <div className="ml-2 flex-shrink-0">
                          <button onClick={() => openLoadModal(h)} className="text-xs text-[#8D5A3F] hover:underline mr-2">Load</button>
                          <button onClick={() => openDeleteModal(h)} className="text-xs text-red-500">Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-[#8D5A3F]'}`}>No saved summaries yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      {confirmModal.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={closeConfirmModal}>
          <div className={`${darkMode ? 'bg-[#2e2119] text-white' : 'bg-white text-[#4A2C1E]'} w-full max-w-md rounded-2xl shadow-xl p-6 border ${darkMode ? 'border-gray-700' : 'border-[#E9D8D0]'} mx-4`} onClick={(e) => e.stopPropagation()}>
            <h3 className={`text-2xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-[#6F422B]'}`}>
              {confirmModal.type === 'delete' ? 'Delete summary?' : 'Load this summary?'}
            </h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-[#8D5A3F]'} mb-4`}>
              {confirmModal.type === 'delete' ? 'This action cannot be undone.' : 'This will replace the current summary content.'}
            </p>
            {confirmModal.item && (
              <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-[#3a2a20] border border-gray-700' : 'bg-[#F6E6DA] border border-[#E9D8D0]'}`}>
                <div className="text-xs mb-1">{new Date(confirmModal.item.createdAt).toLocaleString()}</div>
                <div className="text-sm font-semibold truncate" title={generateTitle(confirmModal.item.summaryText)}>
                  {generateTitle(confirmModal.item.summaryText)}
                </div>
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button onClick={closeConfirmModal} className={`${darkMode ? 'bg-[#3a2a20] text-white hover:bg-[#4a3528]' : 'bg-white text-[#8D5A3F] border border-[#E9D8D0] hover:bg-[#F6E6DA]'} px-4 py-2 rounded-lg font-medium`}>Cancel</button>
              <button onClick={confirmAction} className={`px-4 py-2 rounded-lg font-medium ${darkMode ? 'bg-[#8D5A3F] hover:bg-[#6F422B] text-white' : 'bg-[#8D5A3F] hover:bg-[#6F422B] text-white'}`}>
                {confirmModal.type === 'delete' ? 'Delete' : 'Load'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
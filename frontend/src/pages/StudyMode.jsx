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

  const [savedSets, setSavedSets] = useState(() => {
    try {
      const raw = localStorage.getItem('studyta_saved_sets');
      if (raw) return JSON.parse(raw);

      // Migration: if older key exists, migrate it to the new key
      const legacy = localStorage.getItem('studyta_history');
      if (legacy) {
        try {
          const parsed = JSON.parse(legacy);
          localStorage.setItem('studyta_saved_sets', JSON.stringify(parsed));
          localStorage.removeItem('studyta_history');
          return parsed;
        } catch (e) {
          console.warn('Failed to migrate legacy history to saved sets', e);
        }
      }
    } catch (e) {
      console.warn('Failed to read saved sets from localStorage', e);
    }
    // default empty saved sets
    return [];
  });
  const [savedFilter, setSavedFilter] = useState('all'); // 'all' | 'multipleChoice' | 'trueFalse' | 'flashcards'

  const handleCreate = async () => {
    if (!studyMode) {
      alert('Please select a study mode first.');
      return;
    }
    
    if (!fileContent.trim() && !selectedFile) {
      alert('Please enter some text or upload a file to create study materials.');
      return;
    }
    
    setLoading(true);

    try {
      let textToUse = fileContent;

      // If a file was selected, try to extract text. PDFs use the backend endpoint.
      if (selectedFile) {
        const isPDF = selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf');

        if (isPDF) {
          const form = new FormData();
          form.append('pdf', selectedFile);

          const resp = await fetch('/api/pdf/extract-text', {
            method: 'POST',
            body: form
          });

          if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            throw new Error(err?.error || 'Failed to extract text from PDF');
          }

          const data = await resp.json();
          textToUse = data.text || '';
        } else {
          // Try to read plain text files client-side
          textToUse = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ''));
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(selectedFile);
          });
        }
      }

      if (!textToUse || !textToUse.trim()) {
        throw new Error('No usable text found to generate study materials.');
      }

      // First, try the AI endpoint for higher-quality questions. Fall back to
      // the local generator if AI fails.
      let questions = null;
      try {
        const resp = await fetch('/api/ai/generate-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textToUse, mode: studyMode })
        });

        if (resp.ok) {
          const j = await resp.json();
          if (Array.isArray(j.questions) && j.questions.length) {
            questions = j.questions;
          } else {
            console.warn('AI returned no questions, falling back.');
          }
        } else {
          const err = await resp.json().catch(() => ({}));
          console.warn('AI generation failed:', err);
        }
      } catch (aiErr) {
        console.warn('AI generation request failed:', aiErr);
      }

      if (!questions) {
        questions = generateQuestionsFromText(textToUse, studyMode);
      }

      // Derive a title for this generated session (do NOT auto-save to saved sets)
      const deriveTitleFromText = (txt) => {
        try {
          const s = String(txt || '').trim();
          if (!s) return 'Study Session';
          const firstSentence = s.split(/(?<=[.?!])\s+/)[0] || s;
          const words = firstSentence.split(/\s+/).slice(0, 6).join(' ');
          return words.length ? words : firstSentence.slice(0, 30);
        } catch (e) { return 'Study Session'; }
      };

      const title = (questions && questions.title) || deriveTitleFromText(textToUse) || 'Study Session';

      // Navigate to the selected study mode and pass generated questions in state
      navigateToStudyMode(studyMode, { questions, sourceText: textToUse, title: (questions && questions.title) });
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to create study materials.');
    } finally {
      setLoading(false);
    }
  };

  const handleStudyModeChange = (modeId) => {
    // Only select the study mode here. Navigation should happen when user
    // clicks the Create button to avoid accidental navigation.
    setStudyMode(modeId);
  };

  const navigateToStudyMode = (modeId, state = {}) => {
    // Persist the session so other study methods can read it if navigation
    // doesn't pass state (user switching methods manually).
    try {
      const sess = {
        questions: state.questions || null,
        sourceText: state.sourceText || null,
        title: state.title || null,
        mode: modeId || null,
        createdAt: Date.now(),
      };
      sessionStorage.setItem('studyta_session', JSON.stringify(sess));
    } catch (e) {
      console.warn('Failed to persist study session', e);
    }
    // Map the logical mode ids to the actual routes used in `App.jsx`
    switch (modeId) {
      case 'multipleChoice':
        navigate('/MultipleChoiceMode', { state });
        break;
      case 'trueFalse':
        navigate('/TrueFalseMode', { state });
        break;
      case 'flashcards':
        navigate('/FlashCardMode', { state });
        break;
      default:
        // Do nothing for placeholder
        break;
    }
  };

  // Simple, deterministic question generation from text. This is intentionally
  // lightweight so it works offline; for better results you can replace this
  // with an AI backend call later.
  const generateQuestionsFromText = (text, mode) => {
    // Improved generator heuristics
    const stopwords = new Set(['the','and','a','an','in','on','at','to','of','for','with','is','are','was','were','by','from','that','this','these','those','it','as','be','or','which']);

    const splitSentences = (txt) => txt.split(/(?<=[.?!])\s+/).map(s => s.trim()).filter(s => s.length > 20);
    const rawSentences = splitSentences(text);
    const max = 12;
    const sentences = rawSentences.slice(0, max);

    const pickKey = (sentence) => {
      // choose a candidate word: prefer capitalized words, then long words not in stopwords
      const words = sentence.replace(/[^\w\s]/g,'').split(/\s+/).filter(Boolean);
      for (const w of words) {
        if (/[A-Z][a-z]/.test(w) && w.length > 2) return w;
      }
      const candidates = words.filter(w => w.length > 4 && !stopwords.has(w.toLowerCase()));
      if (candidates.length) return candidates[Math.floor(Math.random() * candidates.length)];
      // fallback: longest word
      return words.sort((a,b)=>b.length-a.length)[0] || '';
    };

    const shuffle = (arr) => {
      const a = arr.slice();
      for (let i = a.length -1; i>0; i--) {
        const r = Math.floor(Math.random()*(i+1));
        [a[i], a[r]] = [a[r], a[i]];
      }
      return a;
    };

    if (mode === 'trueFalse') {
      // Produce a mix of true and false statements. False statements are created by
      // simple negation or numeric perturbation when possible.
      return sentences.map((s, i) => {
        const makeFalse = () => {
          // numeric change
          const numMatch = s.match(/(\d+)/);
          if (numMatch) {
            const orig = numMatch[1];
            const changed = String(Number(orig) + 1);
            return s.replace(orig, changed);
          }
          // insert 'not' after common auxiliaries
          if (/\b(is|are|was|were|has|have|had|can|could|will|would|should)\b/i.test(s)) {
            return s.replace(/\b(is|are|was|were|has|have|had|can|could|will|would|should)\b/i, (m) => m + ' not');
          }
          // simple antonym attempt: prefix 'Not:'
          return 'Not: ' + s;
        };

        // Randomly decide whether to make it false (~40% false)
        const makeItFalse = Math.random() < 0.4;
        return {
          statement: makeItFalse ? makeFalse() : s,
          answer: !makeItFalse
        };
      });
    }

    if (mode === 'flashcards') {
      // Produce flashcards where the front shows a concise meaning and the back
      // shows the short term. Format: "Meaning: ..." / "Answer: ...".
      return sentences.map(s => {
        const rawKey = pickKey(s) || '';
        const term = String(rawKey).replace(/[^\w\s-]/g, '').trim();
        // Keep the answer short (prefer 1-3 words)
        const answer = term.split(/\s+/).slice(0,3).join(' ');

        // Try to extract a concise definition clause from the sentence.
        let meaning = '';
        const defRegex = /\b(?:is|are|refers to|means|defined as|is called|describes)\b/i;
        const m = s.match(defRegex);
        if (m) {
          const start = s.toLowerCase().indexOf(m[0].toLowerCase()) + m[0].length;
          meaning = s.slice(start).trim();
        }

        // Fallback: remove the term from the sentence and truncate to 12-18 words
        if (!meaning) {
          const withoutTerm = term ? s.replace(new RegExp('\\b' + term.replace(/[.*+?^${}()|[\\]\\]/g,'\\\\$&') + '\\b','i'), ' ').replace(/\s+/g,' ').trim() : s;
          meaning = withoutTerm.split(/\s+/).slice(0,14).join(' ');
        }

        // Clean up trailing punctuation and ensure it's short
        meaning = meaning.replace(/^[,:\-\s]+|[\.,;:\-\s]+$/g, '').trim();
        meaning = meaning.split(/\s+/).slice(0,18).join(' ');

        const front = meaning;
        const back = answer || term || '—';
        return { front, back };
      });
    }

    // multipleChoice: produce a cloze question with one correct key and 3 distractor keys
    return sentences.map((s, i) => {
      const key = pickKey(s) || '';
      const regex = new RegExp('\\b' + key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '\\b','i');
      const questionText = regex.test(s) ? s.replace(regex, '_____') : s.split(' ').slice(0,8).join(' ') + '...';

      // Collect distractor candidates from other sentences' keys
      const otherKeys = sentences.map(ss => pickKey(ss)).filter(k => k && k.toLowerCase() !== key.toLowerCase());
      const distractors = shuffle(otherKeys).slice(0,3);
      const options = shuffle([key, ...distractors].slice(0,4));
      const correctIndex = options.findIndex(o => o === key);

      return {
        question: questionText,
        options,
        correctIndex: correctIndex === -1 ? 0 : correctIndex
      };
    });
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

  const clearSavedSets = () => {
    if (savedSets.length > 0) {
      if (window.confirm('Are you sure you want to clear all saved study sets?')) {
        try {
          localStorage.removeItem('studyta_saved_sets');
        } catch (e) { console.warn('Failed to clear saved sets', e); }
        setSavedSets([]);
        alert('Saved study sets cleared!');
      }
    }
  };

  // Handle history item click: select the study mode but DO NOT navigate.
  // User must click the Create button to actually navigate into the study mode.
  const handleSavedSetClick = (title) => {
    // Find the saved set by title (titles are not guaranteed unique so prefer the first match)
    const entry = savedSets.find(h => h.title === title);
    if (!entry) {
      alert('History item not found.');
      return;
    }
    setStudyMode(entry.mode || 'flashcards');
    // Restore session and navigate directly to saved materials
    try {
      const sess = {
        questions: entry.questions || null,
        sourceText: entry.sourceText || null,
        title: entry.title || null,
        mode: entry.mode || null,
        createdAt: Date.now(),
      };
      sessionStorage.setItem('studyta_session', JSON.stringify(sess));
    } catch (e) {
      console.warn('Failed to restore session to sessionStorage', e);
    }
    navigateToStudyMode(entry.mode, { questions: entry.questions, sourceText: entry.sourceText, title: entry.title });
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
                    Saved Study Sets
                  </h2>

              {/* Saved Sets Content - Takes available space */}
              <div className="flex-1 overflow-y-auto mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-[#8D5A3F]'}`}>Filter:</div>
                  <select
                    value={savedFilter}
                    onChange={(e) => setSavedFilter(e.target.value)}
                    className={`text-sm rounded-md px-2 py-1 border focus:outline-none ${darkMode ? 'bg-[#3a2a20] border-gray-600 text-white' : 'bg-white border-[#D9D9D9] text-[#8D5A3F]'}`}
                  >
                    <option value="all">All</option>
                    <option value="multipleChoice">Multiple Choice</option>
                    <option value="trueFalse">True or False</option>
                    <option value="flashcards">Flashcards</option>
                  </select>
                </div>

                {(() => {
                  const filteredSets = savedFilter === 'all' ? savedSets : savedSets.filter(s => s.mode === savedFilter);
                  if (filteredSets.length === 0) {
                    return (
                      <div className={`p-8 text-center rounded-xl border-1 h-full flex flex-col items-center justify-center
                        ${darkMode ? 'border-gray-600 bg-[#3a2a20] text-gray-400' : 'border-gray-300 bg-white text-[#8D5A3F]'}`}
                      >
                        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4">
                          <path d="M40 0C17.92 0 0 17.92 0 40C0 62.08 17.92 80 40 80C62.08 80 80 62.08 80 40C80 17.92 62.08 0 40 0ZM40 72C22.36 72 8 57.64 8 40C8 22.36 22.36 8 40 8C57.64 8 72 22.36 72 40C72 57.64 57.64 72 40 72ZM44 20H36V44H44V20ZM44 52H36V60H44V52Z" fill="#71412A"/>
                        </svg>
                        <p className={`font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-[#8D5A3F]'}`}>
                          {savedFilter === 'all' ? 'No saved study sets yet' : 'No saved sets for this mode'}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-[#B77A57]'}`}>
                          {savedFilter === 'all' ? 'Saved study sets will appear here' : 'Try a different filter or create a new set'}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {filteredSets.map((item, index) => (
                        <div 
                          key={index}
                          onClick={() => handleSavedSetClick(item.title)}
                          className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all duration-200 ${darkMode ? 'border-gray-600 bg-[#3a2a20] text-white hover:bg-[#4a3528]' : 'border-[#D9D9D9] bg-white text-[#8D5A3F] hover:bg-gray-50'}`}
                        >
                          <div className="flex items-center justify-between">
                            <h4 className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-[#8D5A3F]'}`}>{item.title}</h4>
                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-[#B77A57]'}`}>{item.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Clear History Button - Bottom Left */}
              <div className="mt-auto">
                <button
                  onClick={clearSavedSets}
                  disabled={savedSets.length === 0}
                  className={`text-[#8D5A3F] hover:text-red-700 font-semibold text-xs ${
                    savedSets.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Clear Saved Sets
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Note: The explicit "Generated Study Materials" preview panel was removed per request. */}
      </main>
    </div>
  );
}
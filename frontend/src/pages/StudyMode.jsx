import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useSettings } from '../context/SettingsContext';
import ChatWidget from '../components/ChatWidget';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useModal } from '../context/ModalContext';

export default function StudyMode() {
  const { showModal } = useModal();
  const { darkMode } = useSettings();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [fileContent, setFileContent] = useState('');
  const [activeTab, setActiveTab] = useState('text'); // 'text' or 'file'
  const [studyMode, setStudyMode] = useState(''); // Empty by default
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [chooseSourceOpen, setChooseSourceOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryItems, setLibraryItems] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(false);

  const studyModes = [
    { id: '', name: 'Choose' }, // Placeholder option
    { id: 'multipleChoice', name: 'Multiple Choice' },
    { id: 'trueFalse', name: 'True or False' },
    { id: 'flashcards', name: 'Flashcards' }
  ];

  const [savedSets, setSavedSets] = useState([]);
  
  // Fetch saved sets from backend when user is available
  useEffect(() => {
    const fetchSavedSets = async () => {
      let userId = user?._id;
      
      // Fallback to localStorage if user context is not ready
      if (!userId) {
        try {
          const raw = localStorage.getItem('stuyta_user') || localStorage.getItem('studytA_user') || localStorage.getItem('user');
          if (raw) {
            const parsed = JSON.parse(raw);
            userId = parsed._id || parsed.id;
          }
        } catch (e) {
          console.warn('Error parsing user from storage', e);
        }
      }

      if (!userId) {
        setSavedSets([]);
        return;
      }

      try {
        const API_BASE = import.meta.env.VITE_API_BASE || '';
        const res = await fetch(`${API_BASE}/api/studymode/saved-sets/${userId}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.sets)) {
             const formatted = data.sets.map(s => ({
                ...s,
                date: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'Unknown date'
            }));
            setSavedSets(formatted);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch saved sets:', err);
      }
    };
    fetchSavedSets();
  }, [user]);

  const [savedFilter, setSavedFilter] = useState('all'); // 'all' | 'multipleChoice' | 'trueFalse' | 'flashcards'
  // Modal state for confirming opening a saved set
  const [confirmOpenSaved, setConfirmOpenSaved] = useState(false)
  const [selectedSavedSet, setSelectedSavedSet] = useState(null)
  
  // Modal state for question quantity
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [questionCount, setQuestionCount] = useState(5);

  const handleCreate = async () => {
    if (!studyMode) {
      showModal('Please select a study mode first.', 'Selection Required', 'warning');
      return;
    }
    
    if (!fileContent.trim() && !selectedFile) {
      showModal('Please enter some text or upload a file to create study materials.', 'Content Required', 'warning');
      return;
    }

    // Open the quantity modal instead of proceeding immediately
    setShowQuantityModal(true);
  };

  const proceedWithGeneration = async () => {
    setShowQuantityModal(false);
    setLoading(true);

    try {
      let textToUse = fileContent;

      // If a file was selected, try to extract text.
      if (selectedFile) {
        const isFromLibrary = selectedFile.source === 'library' && selectedFile.id;
        const isPDF = (selectedFile.type || '').toLowerCase() === 'application/pdf' || (selectedFile.name || '').toLowerCase().endsWith('.pdf');

        if (isFromLibrary && isPDF) {
          // Prefer uploading the actual PDF blob to the existing extraction endpoint
          const API_BASE = import.meta.env.VITE_API_BASE;
          if (!API_BASE) {
            throw new Error('API base URL is not configured. Set VITE_API_BASE to your backend (e.g., http://localhost:3000).');
          }
          try {
            // Attempt to download the PDF binary
            const userIdParam = (user && user._id) ? `?userId=${encodeURIComponent(user._id)}` : '';
            const pdfRes = await fetch(`${API_BASE}/api/library/download/${selectedFile.id}${userIdParam}`);
            if (pdfRes.ok) {
              const rawBlob = await pdfRes.blob();
              const blob = rawBlob.type ? rawBlob : new Blob([await rawBlob.arrayBuffer()], { type: 'application/pdf' });
              const form = new FormData();
              // Use 'pdf' field name to match backend extractor expectations
              form.append('pdf', blob, selectedFile.name || 'library.pdf');
              const resp = await axios.post(`${API_BASE}/api/pdf/extract-text`, form, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
              });
              const data = resp.data || {};
              textToUse = data.text || '';
            } else {
              // Fallback to id-based extraction if supported
              const resp = await axios.post(`${API_BASE}/api/pdf/extract-text`, { id: selectedFile.id }, { withCredentials: true });
              const data = resp.data || {};
              textToUse = data.text || '';
            }
          } catch (e) {
            throw e;
          }
        } else if (isFromLibrary) {
          // Fetch text content from backend by file id (non-PDF)
          const API_BASE = import.meta.env.VITE_API_BASE;
          if (!API_BASE) {
            throw new Error('API base URL is not configured. Set VITE_API_BASE to your backend (e.g., http://localhost:3000).');
          }
          const res = await fetch(`${API_BASE}/api/library/view/${selectedFile.id}`);
          if (!res.ok) {
            throw new Error('Failed to load library file content');
          }
          const data = await res.json();
          textToUse = data?.textContent || data?.content || '';
        } else if (isPDF) {
          const form = new FormData();
          // Use 'pdf' field name to match backend extractor expectations
          form.append('pdf', selectedFile, selectedFile.name || 'upload.pdf');

          const API_BASE = import.meta.env.VITE_API_BASE;
          if (!API_BASE) {
            throw new Error('API base URL is not configured. Set VITE_API_BASE to your backend (e.g., http://localhost:3000).');
          }
          const resp = await axios.post(`${API_BASE}/api/pdf/extract-text`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
            withCredentials: true
          });
          const data = resp.data || {};
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
          body: JSON.stringify({ text: textToUse, mode: studyMode, count: questionCount })
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
        // If a file was selected, use its name as the title
        if (selectedFile) {
           const name = selectedFile.name || selectedFile.originalName || selectedFile.filename;
           if (name) {
             // Remove extension if present
             return name.replace(/\.[^/.]+$/, "");
           }
        }

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
      navigateToStudyMode(studyMode, { questions, sourceText: textToUse, title: title });
    } catch (err) {
      console.error(err);
      showModal(err.message || 'Failed to create study materials.', 'Generation Error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStudyModeChange = (modeId) => {
    // Only select the study mode here. Navigation should happen when user
    // clicks the Create button to avoid accidental navigation.
    setStudyMode(modeId);
  };

  // Sessions are recorded only upon study set completion within mode-specific pages.

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
    const max = questionCount || 5;
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
    setFileContent(''); // Clear text input when file is selected
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const clearText = () => {
    setFileContent('');
  };

  // Fetch library items for the current user
  const fetchLibraryItems = async () => {
    try {
      setLibraryLoading(true);
      const API_BASE = import.meta.env.VITE_API_BASE || '';
      // Always use the authenticated user's id from context
      const userId = user?._id;
      if (!userId) {
        console.warn('No authenticated user; cannot load user library');
        setLibraryItems([]);
        return;
      }
      // Fetch only the current user's library items
      const res = await fetch(`${API_BASE}/api/library/library/${userId}`);
      const data = await res.json();
      const flat = [
        ...(Array.isArray(data?.files) ? data.files : []),
        ...((Array.isArray(data?.folders) ? data.folders.flatMap(f => Array.isArray(f.files) ? f.files : []) : []))
      ];
      // Ensure items are scoped to the current user if backend includes owner fields
      const scoped = flat.filter(it => {
        const owner = it.owner || it.userId || it.user || it.uid;
        return !owner || String(owner) === String(userId);
      });
      setLibraryItems(scoped);
    } catch (e) {
      console.warn('Failed to fetch library items', e);
      setLibraryItems([]);
    } finally {
      setLibraryLoading(false);
    }
  };

  // When user clicks a library file, load its text content into the editor
  const handleSelectLibraryFile = async (item) => {
    const API_BASE = import.meta.env.VITE_API_BASE || '';
    try {
      console.debug('Selecting library item', item);
      // Immediately reflect selection in UI (optimistic), close modal, and load content asynchronously
      const fileId = item?._id || item?.id;
      const optimisticSelected = {
        name: item.originalName || item.filename || item.name || 'library-file',
        type: item.mimetype || item.type || 'application/octet-stream',
        id: fileId,
        size: item.size || 0,
        source: 'library'
      };
      setSelectedFile(optimisticSelected);
      if (!studyMode) setStudyMode('multipleChoice');
      setActiveTab('file');
      setLibraryOpen(false);

      // If we already have text, use it; else fetch from backend
      if (item?.textContent) {
        setFileContent(item.textContent || '');
        console.debug('Library file selected (inline text), ready to create');
        return;
      }

      if (!fileId) {
        console.warn('No file id on selected library item');
        return;
      }

      // Try to fetch textual content
      const res = await fetch(`${API_BASE}/api/library/view/${fileId}`);
      if (res.ok) {
        const data = await res.json();
        const text = data?.textContent || data?.content || '';
        setFileContent(text);
        console.debug('Library file content loaded');
      } else {
        console.warn('Failed to load library file content');
      }
    } catch (err) {
      console.warn('Failed to select library file', err);
    }
  };

  // Clear all saved sets via modal confirmation
  const [clearAllOpen, setClearAllOpen] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);
  const clearSavedSets = () => {
    if (savedSets.length > 0) {
      setClearAllOpen(true);
    }
  };

  const confirmClearAll = async () => {
    try {
      setClearingAll(true);
      const API_BASE = import.meta.env.VITE_API_BASE || '';
      // Attempt backend deletion for each set that has a DB id
      const ids = (savedSets || []).map(s => s.savedSetId || s._id).filter(Boolean);
      await Promise.all(ids.map(id => {
        return fetch(`${API_BASE}/api/studymode/saved-sets/${id}`, { method: 'DELETE' }).catch(() => {});
      }));
      setSavedSets([]);
    } finally {
      setClearingAll(false);
      setClearAllOpen(false);
    }
  };

  // When clicking a saved set, ask for confirmation in a modal
  const handleSavedSetClick = (entry) => {
    if (!entry) return
    setSelectedSavedSet(entry)
    setConfirmOpenSaved(true)
  }

  const proceedOpenSavedSet = () => {
    const entry = selectedSavedSet
    if (!entry) return
    setStudyMode(entry.mode || 'flashcards')
    // Restore session and navigate to saved materials
    try {
      const sess = {
        questions: entry.questions || null,
        sourceText: entry.sourceText || null,
        title: entry.title || null,
        mode: entry.mode || null,
        createdAt: Date.now(),
      }
      sessionStorage.setItem('studyta_session', JSON.stringify(sess))
    } catch (e) {
      console.warn('Failed to restore session to sessionStorage', e)
    }
    setConfirmOpenSaved(false)
    navigateToStudyMode(entry.mode, { questions: entry.questions, sourceText: entry.sourceText, title: entry.title, fromSavedSet: true })
  }

  // Delete a saved study set (backend)
  const deleteSavedSet = async (entry) => {
    try {
      // Optimistic update
      const next = (savedSets || []).filter(s => s !== entry);
      setSavedSets(next);

      // Attempt backend deletion if id exists
      const API_BASE = import.meta.env.VITE_API_BASE || '';
      const id = entry?.savedSetId || entry?._id || entry?.id; // prefer DB id if present
      if (id) {
        await fetch(`${API_BASE}/api/studymode/saved-sets/${id}`, { method: 'DELETE' });
      }
    } catch (e) {
      console.warn('Failed to delete saved set', e);
      // Revert if needed, but for now just warn
    }
  }

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
                          <p className={`mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Create study materials from a file</p>
                          <div className="flex gap-3">
                            <button
                              onClick={() => setChooseSourceOpen(true)}
                              className={`inline-flex items-center px-4 py-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-[#BE8E78] hover:bg-[#A36B4E]'} text-white rounded-lg text-sm font-medium transition-colors`}
                            >
                              Choose Source
                            </button>
                          </div>
                          <input
                            id="studyta-file-input"
                            type="file"
                            accept=".pdf,.txt,.doc,.docx,.csv,.json,.md,.html,.htm"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
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
                          onClick={() => handleSavedSetClick(item)}
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
      {/* Confirm Open Saved Set Modal */}
      {confirmOpenSaved && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => { setConfirmOpenSaved(false); setSelectedSavedSet(null); }}
        >
          <div
            className={`${darkMode ? 'bg-[#2e2119] text-white' : 'bg-white text-[#4A2C1E]'} w-full max-w-md rounded-2xl shadow-xl p-6 border ${darkMode ? 'border-gray-700' : 'border-[#E9D8D0]'} mx-4`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={`text-2xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-[#6F422B]'}`}>Open or delete saved set?</h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-[#8D5A3F]'} mb-4`}>You can open or delete this saved set.</p>
            {selectedSavedSet && (
              <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-[#3a2a20] border border-gray-700' : 'bg-[#F6E6DA] border border-[#E9D8D0]'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">{selectedSavedSet.title || 'Untitled Set'}</div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-[#B77A57]'}`}>
                      Mode: {selectedSavedSet.mode || 'unknown'}
                    </div>
                  </div>
                  {selectedSavedSet.date && (
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-[#B77A57]'}`}>{selectedSavedSet.date}</span>
                  )}
                </div>
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setConfirmOpenSaved(false); setSelectedSavedSet(null); }}
                className={`px-4 py-2 rounded-lg font-medium ${darkMode ? 'bg-[#3a2a20] text-white hover:bg-[#4a3528]' : 'bg-white text-[#8D5A3F] border border-[#E9D8D0] hover:bg-[#F6E6DA]'}`}
              >
                Cancel
              </button>
              <button
                onClick={() => { if (selectedSavedSet) deleteSavedSet(selectedSavedSet); setConfirmOpenSaved(false); setSelectedSavedSet(null); }}
                className={`px-4 py-2 rounded-lg font-medium ${darkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
              >
                Delete
              </button>
              <button
                onClick={proceedOpenSavedSet}
                className={`px-4 py-2 rounded-lg font-medium ${darkMode ? 'bg-[#8D5A3F] hover:bg-[#6F422B] text-white' : 'bg-[#8D5A3F] hover:bg-[#6F422B] text-white'}`}
              >
                Open Set
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Choose File Source Modal */}
      {showQuantityModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowQuantityModal(false)}
        >
          <div
            className={`${darkMode ? 'bg-[#2e2119] text-white' : 'bg-white text-[#4A2C1E]'} w-full max-w-md rounded-2xl shadow-xl p-6 border ${darkMode ? 'border-gray-700' : 'border-[#E9D8D0]'} mx-4`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={`text-2xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-[#6F422B]'}`}>
              How many questions?
            </h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-[#8D5A3F]'} mb-6`}>
              Select the number of {studyModes.find(m => m.id === studyMode)?.name || 'questions'} to generate.
            </p>
            
            <div className="mb-8 flex items-center justify-center gap-4">
              <button 
                onClick={() => setQuestionCount(Math.max(1, questionCount - 1))}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold ${darkMode ? 'bg-[#3a2a20] hover:bg-[#4a3528]' : 'bg-[#F6E6DA] hover:bg-[#E9D8D0] text-[#8D5A3F]'}`}
              >
                -
              </button>
              <div className={`text-3xl font-bold w-16 text-center ${darkMode ? 'text-white' : 'text-[#6F422B]'}`}>
                {questionCount}
              </div>
              <button 
                onClick={() => setQuestionCount(Math.min(20, questionCount + 1))}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold ${darkMode ? 'bg-[#3a2a20] hover:bg-[#4a3528]' : 'bg-[#F6E6DA] hover:bg-[#E9D8D0] text-[#8D5A3F]'}`}
              >
                +
              </button>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowQuantityModal(false)}
                className={`px-4 py-2 rounded-lg font-medium ${darkMode ? 'bg-[#3a2a20] text-white hover:bg-[#4a3528]' : 'bg-white text-[#8D5A3F] border border-[#E9D8D0] hover:bg-[#F6E6DA]'}`}
              >
                Cancel
              </button>
              <button
                onClick={proceedWithGeneration}
                className={`px-6 py-2 rounded-lg font-medium ${darkMode ? 'bg-[#8D5A3F] hover:bg-[#6F422B] text-white' : 'bg-[#8D5A3F] hover:bg-[#6F422B] text-white'}`}
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Choose File Source Modal */}
      {chooseSourceOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setChooseSourceOpen(false)}
        >
          <div
            className={`${darkMode ? 'bg-[#2e2119] text-white' : 'bg-white text-[#4A2C1E]'} w-full max-w-md rounded-2xl shadow-xl p-6 border ${darkMode ? 'border-gray-700' : 'border-[#E9D8D0]'} mx-4`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={`text-2xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-[#6F422B]'}`}>Select file source</h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-[#8D5A3F]'} mb-4`}>Upload from your device or pick from the app library.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setChooseSourceOpen(false)}
                className={`px-4 py-2 rounded-lg font-medium ${darkMode ? 'bg-[#3a2a20] text-white hover:bg-[#4a3528]' : 'bg-white text-[#8D5A3F] border border-[#E9D8D0] hover:bg-[#F6E6DA]'}`}
              >
                Cancel
              </button>
              <button
                onClick={() => { setChooseSourceOpen(false); setLibraryOpen(true); fetchLibraryItems(); }}
                className={`px-4 py-2 rounded-lg font-medium ${darkMode ? 'bg-[#8D5A3F] hover:bg-[#6F422B] text-white' : 'bg-[#8D5A3F] hover:bg-[#6F422B] text-white'}`}
              >
                From Library
              </button>
              <button
                onClick={() => { setChooseSourceOpen(false); const input = document.getElementById('studyta-file-input'); if (input) input.click(); }}
                className={`px-4 py-2 rounded-lg font-medium ${darkMode ? 'bg-[#8D5A3F] hover:bg-[#6F422B] text-white' : 'bg-[#8D5A3F] hover:bg-[#6F422B] text-white'}`}
              >
                Upload from Device
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pick From Library Modal */}
      {libraryOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setLibraryOpen(false)}
        >
          <div
            className={`${darkMode ? 'bg-[#2e2119] text-white' : 'bg-white text-[#4A2C1E]'} w-full max-w-2xl rounded-2xl shadow-xl p-6 border ${darkMode ? 'border-gray-700' : 'border-[#E9D8D0]'} mx-4`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={`text-2xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-[#6F422B]'}`}>Choose from Library</h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-[#8D5A3F]'} mb-4`}>Select a text-based file to use as source content.</p>
            <div className={`max-h-96 overflow-y-auto rounded-lg ${darkMode ? 'bg-[#3a2a20] border border-gray-700' : 'bg-[#F6E6DA] border border-[#E9D8D0]'} p-3`}>
              {libraryLoading ? (
                <div className="py-10 text-center">Loading library…</div>
              ) : libraryItems.length === 0 ? (
                <div className="py-10 text-center">No files found.</div>
              ) : (
                <div className="space-y-2">
                  {libraryItems.map((item) => (
                    <button
                      key={item._id || item.id}
                      onClick={() => handleSelectLibraryFile(item)}
                      className={`w-full text-left p-3 rounded-md flex items-center justify-between ${darkMode ? 'bg-[#2e2119] hover:bg-[#4a3528] border border-gray-700' : 'bg-white hover:bg-gray-50 border border-[#E9D8D0]'} transition`}
                    >
                      <div>
                        <div className="font-semibold text-sm">{item.originalName || item.filename || item.name}</div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-[#B77A57]'}`}>
                          {(item.type || item.mimetype || 'file')} {typeof item.size === 'number' ? `• ${(item.size / (1024*1024)).toFixed(2)} MB` : ''}
                        </div>
                      </div>
                      <div className={`text-xs ${item.textContent || item.content ? 'text-green-600' : 'text-gray-400'}`}>
                        {item.textContent || item.content ? 'Text available' : 'Open to fetch'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <button
                onClick={() => setLibraryOpen(false)}
                className={`px-4 py-2 rounded-lg font-medium ${darkMode ? 'bg-[#3a2a20] text-white hover:bg-[#4a3528]' : 'bg-white text-[#8D5A3F] border border-[#E9D8D0] hover:bg-[#F6E6DA]'}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Saved Sets Modal */}
      {clearAllOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => { if (!clearingAll) setClearAllOpen(false); }}
        >
          <div
            className={`${darkMode ? 'bg-[#2e2119] text-white' : 'bg-white text-[#4A2C1E]'} w-full max-w-md rounded-2xl shadow-xl p-6 border ${darkMode ? 'border-gray-700' : 'border-[#E9D8D0]'} mx-4`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={`text-2xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-[#6F422B]'}`}>Clear all saved sets?</h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-[#8D5A3F]'} mb-4`}>This will remove all saved study sets locally and from the database.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { if (!clearingAll) setClearAllOpen(false); }}
                className={`px-4 py-2 rounded-lg font-medium ${darkMode ? 'bg-[#3a2a20] text-white hover:bg-[#4a3528]' : 'bg-white text-[#8D5A3F] border border-[#E9D8D0] hover:bg-[#F6E6DA]'}`}
                disabled={clearingAll}
              >
                Cancel
              </button>
              <button
                onClick={confirmClearAll}
                className={`px-4 py-2 rounded-lg font-medium ${darkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                disabled={clearingAll}
              >
                {clearingAll ? 'Clearing…' : 'Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}

      </main>
    </div>
  );
}

// Modal UI injected inside the component render (confirmation to open saved set)
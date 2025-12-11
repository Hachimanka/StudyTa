import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import Sidebar from '../Sidebar';
import ConfirmSaveModal from '../ConfirmSaveModal';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';

export default function MultipleChoiceMode() {
  const { showModal } = useModal();
  const { darkMode } = useSettings();
  const navigate = useNavigate();
  const { user } = useAuth();
  const startedAtRef = useRef(null);

  // API base URL
  const API_BASE = import.meta.env.VITE_API_BASE || '';

  // Function to record study sessions
  const recordStudySession = async (topic, durationMinutes) => {
    try {
      let userId = user?._id;
      if (!userId) { try { const raw = localStorage.getItem('stuyta_user'); if(raw) userId = JSON.parse(raw)._id; } catch(e){} }
      if (!userId) return;
      
      await fetch(`${API_BASE}/api/analytics/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          topic, 
          mode: 'multipleChoice',
          durationMinutes: Math.max(0.5, Math.round(durationMinutes * 10) / 10)
        }),
      });
    } catch (err) {
      console.error('Failed to record study session', err);
    }
  };

  // Function to trigger daily study start - only triggers streak once per day
  const triggerDailyStudyStart = async () => {
    try {
      const today = new Date().toDateString();
      const lastStudyDate = localStorage.getItem('studyta_last_study_date');
      
      // Only trigger if we haven't studied today yet
      if (lastStudyDate === today) {
        return; // Already triggered today
      }
      
      let userId = user?._id;
      if (!userId) { try { const raw = localStorage.getItem('stuyta_user'); if(raw) userId = JSON.parse(raw)._id; } catch(e){} }
      if (!userId) return;
      
      // Mark today as studied
      localStorage.setItem('studyta_last_study_date', today);
      
      // Record a minimal session to trigger the streak
      await fetch(`${API_BASE}/api/analytics/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          topic: 'Daily Study Start', 
          durationMinutes: 0.1 // Minimal to just trigger streak
        }),
      });
    } catch (err) {
      console.error('Failed to trigger daily study start', err);
    }
  };

  // Function to record topic completion
  const recordTopicCompletion = async (topic) => {
    try {
      let userId = user?._id;
      if (!userId) { try { const raw = localStorage.getItem('stuyta_user'); if(raw) userId = JSON.parse(raw)._id; } catch(e){} }
      if (!userId) return;
      
      // Record a minimal study session to mark topic as completed
      await fetch(`${API_BASE}/api/analytics/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          topic, 
          durationMinutes: 1 // Minimum to count as studied
        }),
      });
    } catch (err) {
      console.error('Failed to record topic completion', err);
    }
  };

  // Editable title state
  const [title, setTitle] = useState('Title11111');
  const [editingTitle, setEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const inputRef = useRef(null);

  const { state } = useLocation();
  const fromSavedSet = !!state?.fromSavedSet;
  // Prefer questions passed via navigation state; otherwise fall back to sessionStorage
  let questions = state?.questions || [];
  if ((!questions || questions.length === 0) && typeof window !== 'undefined') {
    try {
      const sessRaw = sessionStorage.getItem('studyta_session');
      if (sessRaw) {
        const sess = JSON.parse(sessRaw);
        if (sess?.questions && Array.isArray(sess.questions) && sess.questions.length) {
          questions = sess.questions;
        }
        // allow deriving title via existing effect
      }
    } catch (e) {
      console.warn('Failed to read study session', e);
    }
  }
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [userAnswers, setUserAnswers] = useState(() => Array(questions.length).fill(null));
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  useEffect(() => {
    if (!finished) return;
    (async () => {
      try {
        if (!user?._id) return;
        const startMs = startedAtRef.current || Date.now();
        const durationSeconds = Math.max(0, Math.floor((Date.now() - startMs)/1000));
        await fetch(`/api/studymode/sessions/complete`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user._id, mode: 'multipleChoice', startedAt: startMs, endedAt: Date.now(), durationSeconds })
        });
      } catch (e) {
        console.warn('Failed to record completed session', e);
      }
    })();
  }, [finished, user?._id])
  const [showFeedback, setShowFeedback] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedAlready, setSavedAlready] = useState(false);

  // Study time tracking states
  const [startTime, setStartTime] = useState(null);
  const [totalStudyTime, setTotalStudyTime] = useState(0);

  // Start tracking when component mounts or when quiz starts
  useEffect(() => {
    if (questions.length > 0 && !finished) {
      setStartTime(Date.now());
      // Trigger daily study start (streak) only once per day
      triggerDailyStudyStart();
    }
  }, [questions, finished]);

  // Track time when user answers questions
  useEffect(() => {
    if (selected !== null && startTime) {
      const endTime = Date.now();
      const minutes = (endTime - startTime) / (1000 * 60);
      setTotalStudyTime(prev => prev + minutes);
      setStartTime(Date.now()); // Reset for next question
    }
  }, [selected, startTime]);

  // Record session when component unmounts or quiz finishes
  useEffect(() => {
    return () => {
      if (totalStudyTime > 0) {
        // Use the current title ref or state
        recordStudySession(title || 'Multiple Choice Quiz', totalStudyTime);
      }
    };
  }, []); // Run only on unmount

  // Also record when quiz finishes
  useEffect(() => {
    if (finished && totalStudyTime > 0) {
      recordStudySession(title || 'Multiple Choice Quiz', totalStudyTime);
    }
  }, [finished]); // Run only when finished state changes

  // Derive title from navigation state (title or sourceText)
  useEffect(() => {
    if (state?.title) {
      setTitle(state.title);
      setTempTitle(state.title);
    } else if (state?.sourceText) {
      const s = String(state.sourceText || '').trim();
      if (s) {
        const firstSentence = s.split(/(?<=[.?!])\s+/)[0] || s;
        const words = firstSentence.split(/\s+/).slice(0, 6).join(' ');
        const derived = words.length ? words : 'Study Session';
        setTitle(derived);
        setTempTitle(derived);
      }
    }
  }, [state]);

  // Reset answers/score when questions change
  useEffect(() => {
    setUserAnswers(Array(questions.length).fill(null));
    setScore(0);
    setQIndex(0);
    setFinished(false);
    setSelected(null);
    setShowFeedback(false);
    startedAtRef.current = null;
  }, [questions]);

  useEffect(() => {
    if (editingTitle) inputRef.current?.focus();
  }, [editingTitle]);

  const deriveTitleFromText = (txt) => {
    try {
      const s = String(txt || '').trim();
      if (!s) return 'Study Session';
      const firstSentence = s.split(/(?<=[.?!])\s+/)[0] || s;
      const words = firstSentence.split(/\s+/).slice(0, 6).join(' ');
      return words.length ? words : firstSentence.slice(0, 30);
    } catch (e) {
      return 'Study Session';
    }
  };

  // Generate questions for a target mode (used when switching study methods)
  const generateAndNavigate = async (targetMode) => {
    try {
      setLoading(true);
      const sessRaw = sessionStorage.getItem('studyta_session');
      const sess = sessRaw ? JSON.parse(sessRaw) : null;
      const sourceText = (state?.sourceText) || (sess?.sourceText) || '';
      const titleFromSess = (state?.title) || (sess?.title) || title;
      if (!sourceText || !sourceText.trim()) {
        showModal('No source text found. Create materials first in Study Mode.', 'Missing Content', 'warning');
        return;
      }

      // Try AI generation
      try {
        const resp = await fetch('/api/ai/generate-questions', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: sourceText, mode: targetMode })
        });
        if (resp.ok) {
            const j = await resp.json();
            if (Array.isArray(j.questions) && j.questions.length) {
              const finalTitle = j.title || deriveTitleFromText(sourceText) || titleFromSess;
              sessionStorage.setItem('studyta_session', JSON.stringify({ questions: j.questions, sourceText, title: finalTitle, mode: targetMode, createdAt: Date.now() }));
              switch (targetMode) {
                case 'trueFalse': navigate('/TrueFalseMode', { state: { questions: j.questions, sourceText, title: finalTitle } }); break;
                case 'flashcards': navigate('/FlashCardMode', { state: { questions: j.questions, sourceText, title: finalTitle } }); break;
                default: navigate('/MultipleChoiceMode', { state: { questions: j.questions, sourceText, title: finalTitle } }); break;
              }
              return;
            }
          }
      } catch (e) {
        console.warn('AI generation failed', e);
      }

      // Fallback heuristic: simple cloze from sentences
      const splitSentences = (txt) => txt.split(/(?<=[.?!])\s+/).map(s=>s.trim()).filter(Boolean);
      const sentences = splitSentences(sourceText).slice(0,12);
      const generated = sentences.map(s => {
        const words = s.replace(/[^\w\s]/g,'').split(/\s+/).filter(Boolean);
        const key = words.find(w=>w.length>4) || words[0] || 'Option';
        const options = [key, 'Choice A', 'Choice B', 'Choice C'].slice(0,4);
        return { question: s.replace(new RegExp('\\b'+key+'\\b','i'),'_____'), options, correctIndex: 0 };
      });
      const finalTitle = deriveTitleFromText(sourceText) || titleFromSess;
      sessionStorage.setItem('studyta_session', JSON.stringify({ questions: generated, sourceText, title: finalTitle, mode: targetMode, createdAt: Date.now() }));
      switch (targetMode) {
        case 'trueFalse': navigate('/TrueFalseMode', { state: { questions: generated, sourceText, title: finalTitle } }); break;
        case 'flashcards': navigate('/FlashCardMode', { state: { questions: generated, sourceText, title: finalTitle } }); break;
        default: navigate('/MultipleChoiceMode', { state: { questions: generated, sourceText, title: finalTitle } }); break;
      }
    } catch (err) {
      console.error('generateAndNavigate error', err);
      showModal('Failed to generate materials for the selected method.', 'Generation Error', 'error');
    } finally {
      setLoading(false);
    }
  };

  

  // Confirm modal state for switching
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingTarget, setPendingTarget] = useState(null);

  const hasSession = (() => {
    try {
      const raw = sessionStorage.getItem('studyta_session');
      if (!raw) return false;
      const s = JSON.parse(raw);
      return Array.isArray(s.questions) && s.questions.length > 0;
    } catch (e) { return false; }
  })();

  const maybeConfirmSwitch = (targetMode) => {
    if (targetMode === (state?.mode || (sessionStorage.getItem('studyta_session') ? JSON.parse(sessionStorage.getItem('studyta_session')).mode : null))) {
      generateAndNavigate(targetMode);
      return;
    }
    if (hasSession && !savedAlready) {
      setPendingTarget(targetMode);
      setConfirmOpen(true);
    } else {
      generateAndNavigate(targetMode);
    }
  };

  // Check if current session is already saved locally
  const checkIfSaved = () => {
    try {
      const rawSess = sessionStorage.getItem('studyta_session');
      if (!rawSess) { setSavedAlready(false); return; }
      const sess = JSON.parse(rawSess);
      const rawSaved = localStorage.getItem('studyta_saved_sets');
      if (!rawSaved) { setSavedAlready(false); return; }
      const arr = JSON.parse(rawSaved);
      const found = arr.find(a => a.title === (sess.title || title) && a.mode === (sess.mode || 'multipleChoice'));
      setSavedAlready(!!found);
    } catch (e) { console.warn('checkIfSaved failed', e); setSavedAlready(false); }
  };

  useEffect(() => {
    checkIfSaved();
  }, []);

  const saveSession = async () => {
    // Save current session to SavedStudySet collection (no scores)
    try {
      const raw = sessionStorage.getItem('studyta_session');
      if (!raw) return;
      const s = JSON.parse(raw);
      
      let userId = user?._id;
      if (!userId) { try { const raw = localStorage.getItem('stuyta_user'); if(raw) userId = JSON.parse(raw)._id; } catch(e){} }

      const payload = {
        title: s.title || state?.title || title || 'Study Session',
        mode: s.mode || 'multipleChoice',
        questions: s.questions || [],
        userId: userId,
        durationMinutes: Math.max(0.5, Math.round(((Date.now() - (startedAtRef.current || Date.now())) / 60000) * 10) / 10)
      };
      const res = await fetch(`${API_BASE}/api/studymode/saved-sets/save`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(data?.error || 'Save failed');

      // Record topic completion
      await recordTopicCompletion(payload.title || 'Study Session');

      // Persist locally to saved sets to prevent duplicate saves
      try {
        const rawSaved = localStorage.getItem('studyta_saved_sets');
        const arr = rawSaved ? JSON.parse(rawSaved) : [];
        const entry = {
          id: Date.now(),
          title: payload.title,
          date: new Date().toLocaleDateString(),
          mode: payload.mode,
          questions: payload.questions,
          sourceText: (sessionStorage.getItem('studyta_session') ? JSON.parse(sessionStorage.getItem('studyta_session')).sourceText : '') || '',
          savedSetId: data?.savedSetId
        };
        const exists = arr.find(a => a.title === entry.title && a.mode === entry.mode);
        if (!exists) {
          const next = [entry, ...arr].slice(0,50);
          localStorage.setItem('studyta_saved_sets', JSON.stringify(next));
        }
        setSavedAlready(true);
      } catch (e) { console.warn('Failed to persist local saved set', e); }

      return data;
    } catch (err) {
      console.error('saveSession error', err);
      throw err;
    }
  };

  const handleModalSave = async () => {
    setConfirmOpen(false);
    setLoading(true);
    try {
      await saveSession();
      if (pendingTarget) await generateAndNavigate(pendingTarget);
    } catch (e) {
      console.warn('Save failed', e);
    } finally {
      setPendingTarget(null);
      setLoading(false);
    }
  };

  const handleModalDiscard = () => {
    setConfirmOpen(false);
    setLoading(true);
    (async () => {
      try {
        if (pendingTarget) await generateAndNavigate(pendingTarget);
      } catch (e) {
        console.warn('Switch failed', e);
      } finally {
        setPendingTarget(null);
        setLoading(false);
      }
    })();
  };

  const finishEditing = () => {
    const trimmed = tempTitle.trim();
    if (trimmed) setTitle(trimmed);
    setEditingTitle(false);
  };

  const cancelEditing = () => {
    setTempTitle(title);
    setEditingTitle(false);
  };

  return (
    <div className={`flex min-h-screen transition-colors duration-500 ${darkMode ? 'bg-[#1f1b16] text-[#f5e9df]' : 'bg-[#F2D9C7] text-[#4A2C1E]'}`}>
      <Sidebar />

      <main className="p-12 flex-1 ml-20 md:ml-30 mr-7.5 transition-all duration-300">
        {/* Top Controls (smaller to match other pages) */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/study')} className={`flex items-center justify-center space-x-3 px-4 py-2 rounded-full text-sm md:px-8 md:py-3 md:text-lg md:w-48 w-full ${darkMode ? 'bg-[#3a2a20] text-white' : 'bg-[#8D5A3F] text-white'}`}>
            <svg width="25" height="20" viewBox="0 0 35 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M35 29.8553C30.7183 24.5847 26.9162 21.5941 23.5935 20.8835C20.2708 20.1729 17.1074 20.0656 14.1033 20.5615V30L0 14.5985L14.1033 0V8.97088C19.6583 9.015 24.381 11.0247 28.2713 15C32.1609 18.9753 34.4038 23.9271 35 29.8553Z" fill="white"/>
            </svg>
            <span>Back</span>
          </button>

          <div className="flex items-center justify-center">
            {!editingTitle ? (
              <div className="flex items-center space-x-2">
                <h1 className={`text-xl font-bold tracking-wider ${darkMode ? 'text-[#f5e9df]' : 'text-[#6F422B]'}`}>{title}</h1>
                <button
                  aria-label="Edit title"
                  onClick={() => {
                    setTempTitle(title);
                    setEditingTitle(true);
                  }}
                  className={`p-1 rounded-md ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-current">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <input
                  ref={inputRef}
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      finishEditing();
                    } else if (e.key === 'Escape') {
                      cancelEditing();
                    }
                  }}
                  onBlur={() => finishEditing()}
                  className={`text-xl font-bold tracking-wider px-2 py-1 rounded ${darkMode ? 'bg-[#2e2119] text-white border border-gray-600' : 'bg-white text-[#6F422B] border border-[#D9D9D9]'}`}
                />
                <button
                  aria-label="Save title"
                  onClick={() => finishEditing()}
                  className={`p-1 rounded-md ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-current">
                    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            )}
          </div>

          <button onClick={async () => { try { await saveSession(); } catch(e){ console.warn(e); } }} disabled={savedAlready} className={`flex items-center justify-center space-x-3 px-4 py-2 rounded-full text-sm md:px-8 md:py-3 md:text-lg md:w-48 w-full ${savedAlready ? 'bg-gray-400 cursor-not-allowed text-white' : (darkMode ? 'bg-[#3a2a20] text-white' : 'bg-[#8D5A3F] text-white')}`}>
            <svg width="25" height="25" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.88889 35C2.81944 35 1.90426 34.6195 1.14333 33.8586C0.382407 33.0977 0.0012963 32.1818 0 31.1111V3.88889C0 2.81944 0.381111 1.90426 1.14333 1.14333C1.90556 0.382407 2.82074 0.0012963 3.88889 0H25.6181C26.1366 0 26.6311 0.0972224 27.1017 0.291667C27.5722 0.486111 27.9851 0.761574 28.3403 1.11806L33.8819 6.65972C34.2384 7.0162 34.5139 7.42972 34.7083 7.90028C34.9028 8.37083 35 8.86472 35 9.38194V31.1111C35 32.1805 34.6195 33.0964 33.8586 33.8586C33.0977 34.6208 32.1819 35.0013 31.1111 35H3.88889ZM17.5 29.1667C19.1204 29.1667 20.4977 28.5995 21.6319 27.4653C22.7662 26.331 23.3333 24.9537 23.3333 23.3333C23.3333 21.713 22.7662 20.3356 21.6319 19.2014C20.4977 18.0671 19.1204 17.5 17.5 17.5C15.8796 17.5 14.5023 18.0671 13.3681 19.2014C12.2338 20.3356 11.6667 21.713 11.6667 23.3333C11.6667 24.9537 12.2338 26.331 13.3681 27.4653C14.5023 28.5995 15.8796 29.1667 17.5 29.1667ZM7.77778 13.6111H21.3889C21.9398 13.6111 22.4019 13.4244 22.7753 13.0511C23.1486 12.6778 23.3346 12.2163 23.3333 11.6667V7.77778C23.3333 7.22685 23.1467 6.76537 22.7733 6.39333C22.4 6.0213 21.9385 5.83463 21.3889 5.83333H7.77778C7.22685 5.83333 6.76537 6.02 6.39333 6.39333C6.0213 6.76667 5.83463 7.22815 5.83333 7.77778V11.6667C5.83333 12.2176 6.02 12.6797 6.39333 13.0531C6.76667 13.4264 7.22815 13.6124 7.77778 13.6111Z" fill="white"/>
            </svg>
            <span>{savedAlready ? 'Saved' : 'Save'}</span>
          </button>
        </div>

        {/* Content Wrapper - use same sizing as other pages (500px height panels) */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-10">
          <aside className="lg:col-span-3">
            <div className={`border border-[#6F422B] ${darkMode ? 'bg-[#2e2119]' : 'bg-[#F3DAC6]'} rounded-xl p-6 shadow-lg h-[500px]`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-[#6F422B]'}`}>Study methods</h3>

              <div className="space-y-4">
                <button disabled={fromSavedSet} onClick={() => !fromSavedSet && maybeConfirmSwitch('flashcards')} className={`w-full flex items-center space-x-4 p-3 rounded-lg border ${darkMode ? 'bg-[#2e2119] border-gray-600' : 'bg-[#F3DAC6] border-[#6F422B]'} shadow-sm ${fromSavedSet ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <svg className="w-8 h-8" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path fill="#845C47" fillRule="evenodd" d="M39 13a3 3 0 0 0-3 3v2h6v-2a3 3 0 0 0-3-3Zm3 7h-6v16.5l3 4.5l3-4.5V20ZM6 9v30a3 3 0 0 0 3 3h22a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3Zm14 6a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2h-8a1 1 0 0 1-1-1Zm1 3a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-8Zm-1 10a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2h-8a1 1 0 0 1-1-1Zm1 3a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-8Zm-9-3v3h3v-3h-3Zm-1-2h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1Zm6.707-10.293a1 1 0 0 0-1.414-1.414L13 17.586l-1.293-1.293a1 1 0 0 0-1.414 1.414L13 20.414l4.707-4.707Z" clipRule="evenodd"/>
                  </svg>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-[#6F422B]'}`}>Flashcards</span>
                </button>

                <button disabled={fromSavedSet} onClick={() => !fromSavedSet && maybeConfirmSwitch('trueFalse')} className={`w-full flex items-center space-x-4 p-3 rounded-lg border ${darkMode ? 'bg-[#2e2119] border-gray-600' : 'bg-[#F3DAC6] border-[#6F422B]'} shadow-sm ${fromSavedSet ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <svg className="w-8 h-8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path fill="#845C47" d="m21.47 4.35l-1.34-.56v9.03l2.43-5.86c.41-1.02-.06-2.19-1.09-2.61m-19.5 3.7L6.93 20a2.01 2.01 0 0 0 1.81 1.26c.26 0 .53-.05.79-.16l7.37-3.05c.75-.31 1.21-1.05 1.23-1.79c.01-.26-.04-.55-.13-.81L13 3.5a1.954 1.954 0 0 0-1.81-1.25c-.26 0-.52.06-.77.15L3.06 5.45a1.994 1.994 0 0 0-1.09 2.6m16.15-3.8a2 2 0 0 0-2-2h-1.45l3.45 8.34"/>
                  </svg>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-[#6F422B]'}`}>True or False</span>
                </button>

                <button disabled={fromSavedSet} onClick={() => !fromSavedSet && maybeConfirmSwitch('multipleChoice')} className={`w-full flex items-center space-x-4 p-3 rounded-lg border-2 ${darkMode ? 'bg-[#2e2119] border-[#8D5A3F]' : 'bg-[#F3DAC6] border-[#6F422B]'} shadow-lg ${fromSavedSet ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <svg className="w-8 h-8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <g fill="none">
                      <path fillRule="evenodd" clipRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12zm10-5a2 2 0 0 0-2 2a1 1 0 0 1-2 0a4 4 0 1 1 5.31 3.78a.674.674 0 0 0-.273.169a.177.177 0 0 0-.037.054v.497a1 1 0 1 1-2 0V13c0-1.152.924-1.856 1.655-2.11A2.001 2.001 0 0 0 12 7zm1 6.007v-.004v.004zM13 17a1 1 0 1 1-2 0a1 1 0 0 1 2 0z" fill="#845C47"/>
                    </g>
                  </svg>
                  <span className={`font-medium ${darkMode ? 'text-white' : 'text-[#6F422B]'}`}>Multiple Choice</span>
                </button>
              </div>
            </div>
          </aside>

          <section className="lg:col-span-7">
            <div className={`${darkMode ? 'bg-[#2e2119]' : 'bg-[#F3DAC6]'} rounded-xl p-6 shadow-lg h-[500px] flex flex-col`}>
              <div className="text-center">
                <div className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-[#8D5A3F]'}`}>{questions.length ? `Question ${qIndex + 1}` : ''}</div>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <div className="text-center max-w-4xl mx-auto">
                  {!finished ? (
                    <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-[#6F422B]'}`}>{questions.length ? questions[qIndex]?.question : 'No questions available — create some materials first.'}</h2>
                  ) : (
                    <div className="text-center">
                      <h2 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-[#6F422B]'}`}>Quiz completed</h2>
                      <p className={`text-xl font-semibold ${darkMode ? 'text-gray-200' : 'text-[#8D5A3F]'}`}>You scored <span className="font-bold">{score}</span> out of <span className="font-bold">{questions.length}</span></p>
                      <div className="mt-6 flex items-center justify-center space-x-4">
                        <button onClick={() => { setQIndex(0); setScore(0); setUserAnswers(Array(questions.length).fill(null)); setFinished(false); }} className={`px-4 py-2 rounded ${darkMode ? 'bg-[#3a2a20] text-white' : 'bg-[#8D5A3F] text-white'}`}>Retry</button>
                        <button onClick={() => navigate('/study')} className={`px-4 py-2 rounded ${darkMode ? 'bg-transparent border border-gray-600 text-white' : 'bg-white border border-[#D9D9D9] text-[#8D5A3F]'}`}>Back</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {!finished && (
                <div className="mt-auto">
                  <div className="space-y-4">
                    {(questions[qIndex]?.options || []).map((opt, idx) => {
                      const correctIndex = questions[qIndex]?.correctIndex ?? 0;
                      const isSelected = selected === idx;
                      const isCorrect = idx === correctIndex;
                      let extraClass = '';
                      if (showFeedback) {
                        if (isCorrect) extraClass = 'ring-2 ring-green-400';
                        else if (isSelected && !isCorrect) extraClass = 'ring-2 ring-red-400 opacity-90';
                      } else if (isSelected) {
                        extraClass = 'ring-2 ring-[#6F422B]';
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            if (showFeedback || finished) return;
                            if (!startedAtRef.current) startedAtRef.current = Date.now();
                            setSelected(idx);
                            setShowFeedback(true);
                            setUserAnswers(prev => {
                              const n = prev.slice();
                              n[qIndex] = idx;
                              return n;
                            });

                            if (idx === correctIndex) setScore(s => s + 1);

                            setTimeout(() => {
                              setShowFeedback(false);
                              setSelected(null);
                              if (qIndex + 1 < questions.length) {
                                setQIndex(i => i + 1);
                              } else {
                                setFinished(true);
                              }
                            }, 900);
                          }}
                          className={`w-full text-left p-3 rounded-lg ${darkMode ? 'bg-[#1f1712] border border-gray-600' : 'bg-white border border-[#EFE2DA]'} shadow-sm ${extraClass}`}
                        >
                          <span className={`font-semibold ${darkMode ? 'text-white' : 'text-[#6F422B]'}`}>{String.fromCharCode(65 + idx)}. </span>
                          <span className={`ml-2 ${darkMode ? 'text-white' : 'text-[#6F422B]'}`}>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-4 text-center">
                    {showFeedback && (
                      <div className={`inline-block px-4 py-2 rounded ${darkMode ? 'text-white' : 'text-white'} ${'bg-[#3a7f3a]'}`}>
                        Correct answer: {questions[qIndex]?.options?.[questions[qIndex]?.correctIndex] ?? ''}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
                      {/* Progress Bar */}
                      <div className="mt-6 flex flex-col items-center">
                        <div className="w-3/4">
                          <div className={`w-full rounded-full overflow-hidden transition-colors duration-200 ${darkMode ? 'border border-[#6F422B] bg-transparent' : 'border border-[#6F422B] bg-[#FDEDE4]'}`} style={{ height: 14 }}>
                            {(() => {
                              const percent = questions.length ? Math.round(((qIndex + (finished ? 1 : 0)) / questions.length) * 100) : 0;
                              return <div className="h-full bg-[#6F422B] rounded-full transition-all duration-300" style={{ width: `${percent}%` }} />;
                            })()}
                          </div>
                        </div>
                        <div className={`mt-3 text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-[#6F422B]'}`}>{questions.length ? `${qIndex + (finished ? 1 : 0)}/${questions.length}` : '0/0'}</div>
                      </div>
          </section>
        </div>
      </main>
      <ConfirmSaveModal open={confirmOpen} onClose={() => setConfirmOpen(false)} onSave={handleModalSave} onDiscard={handleModalDiscard} />

      {loading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white/95 dark:bg-[#2b221b] rounded-lg p-6 flex flex-col items-center">
            <svg className="animate-spin h-10 w-10 text-[#6F422B]" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <div className="mt-3 text-[#6F422B] dark:text-white">Generating materials…</div>
          </div>
        </div>
      )}
    </div>
  );
}

// Record completed session when finished flips to true
// Use effect at bottom to avoid interfering in render above
 
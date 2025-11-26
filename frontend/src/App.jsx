import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, RequireAuth } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import TopNav from './components/TopNav'
import Landing from './pages/LandingPage'
import Login from './pages/LoginPage'
import Register from './pages/RegisterPage'
import ForgotPassword from './pages/ForgotPassword'
import ChangePassword from './pages/ChangePassword'
import Dashboard from './pages/Dashboard'
import Summarize from './pages/Summarize'
import Calendar from './pages/Calendar'
import Library from './pages/Library'
import Music from './pages/Music'
import StudyMode from './pages/StudyMode'
import Analytics from './pages/Analytics'
import Profile from './pages/Profile'
import ChatWidget from './components/ChatWidget'
import AuthenticatedWidget from './components/AuthenticatedWidget'
import GlobalMusicPlayer from './components/GlobalMusicPlayer'

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        {/* Top navigation shown on landing and authenticated routes */}
        <TopNav />
        {/* ChatWidget will be rendered at the app level and will show only when authenticated */}
        <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/summarize" element={<RequireAuth><Summarize /></RequireAuth>} />
        <Route path="/calendar" element={<RequireAuth><Calendar /></RequireAuth>} />
        <Route path="/library" element={<RequireAuth><Library /></RequireAuth>} />
        <Route path="/music" element={<RequireAuth><Music /></RequireAuth>} />
        <Route path="/study" element={<RequireAuth><StudyMode /></RequireAuth>} />
        <Route path="/analytics" element={<RequireAuth><Analytics /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/change-password" element={<RequireAuth><ChangePassword /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {/* Render chat widget for authenticated users */}
        <AuthenticatedWidget />
        {/* Global music player stays mounted across routes */}
        <GlobalMusicPlayer />
      </SettingsProvider>
    </AuthProvider>
  )
}

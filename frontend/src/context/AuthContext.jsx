import React, { createContext, useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useModal } from './ModalContext'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { showModal } = useModal();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      // Clear any stale authentication state on app load
      const authState = localStorage.getItem('stuyta_auth');
      console.log('Initial auth state from localStorage:', authState);
      return authState === '1'
    } catch (e) {
      return false
    }
  })

  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('stuyta_user')
      return raw ? JSON.parse(raw) : null
    } catch (e) {
      return null
    }
  });

  useEffect(() => {
    try {
      if (isAuthenticated) localStorage.setItem('stuyta_auth', '1')
      else localStorage.removeItem('stuyta_auth')
    } catch (e) {
      // ignore
    }
  }, [isAuthenticated])

  useEffect(() => {
    try {
      if (user) localStorage.setItem('stuyta_user', JSON.stringify(user))
      else localStorage.removeItem('stuyta_user')
    } catch (e) {
      // ignore
    }
  }, [user])

  // Listen for profile updates dispatched by other components so we can refresh in-memory user
  useEffect(() => {
    const handleProfileUpdated = async () => {
      try {
        if (!user || !user._id) return;
        const API_BASE = import.meta.env.VITE_API_BASE || '';
        const res = await fetch(`${API_BASE}/api/profile/${user._id}`);
        if (!res.ok) return;
        const payload = await res.json();
        const profile = payload.profile || null;
        const userFromProfile = payload.user || {};
        setUser((prev) => ({ 
          ...prev, 
          profile, 
          username: profile?.username || userFromProfile?.username || prev?.username, 
          bio: profile?.bio || prev?.bio,
          email: userFromProfile?.email || prev?.email,
          profileImageUrl: profile?.profileImageUrl || userFromProfile?.profileImageUrl || prev?.profileImageUrl
        }));
        // persist the merged user
        try { localStorage.setItem('stuyta_user', JSON.stringify({ ...(JSON.parse(localStorage.getItem('stuyta_user') || '{}')), profile, username: profile?.username, profileImageUrl: profile?.profileImageUrl })); } catch (_) {}
      } catch (err) {
        // ignore
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdated);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdated);
  }, [user]);

  // Login with backend
  const login = async (email, password, cb) => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || ''
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setIsAuthenticated(true);
        // Set basic user returned by login
        // Attach basic user and then try to fetch full profile (username, bio, avatar)
        const baseUser = data.user || {};
        setUser(baseUser);
        try {
          const profileRes = await fetch(`${API_BASE}/api/profile/${baseUser._id}`);
          if (profileRes.ok) {
            const profilePayload = await profileRes.json();
            const profile = profilePayload.profile || null;
            const userFromProfile = profilePayload.user || {};
            // Attach profile under `profile` and also copy username, email, profileImageUrl for convenience
            setUser((prev) => ({ 
              ...prev, 
              profile, 
              username: profile?.username || userFromProfile?.username || prev?.username, 
              bio: profile?.bio || prev?.bio,
              email: userFromProfile?.email || prev?.email,
              profileImageUrl: profile?.profileImageUrl || userFromProfile?.profileImageUrl || prev?.profileImageUrl
            }));
          }
        } catch (infoErr) {
          console.warn('Failed to fetch profile:', infoErr);
        }
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event('authChanged'));
        if (cb) cb();
      } else {
        showModal(data.message || 'Login failed', 'Login Error', 'error');
      }
    } catch (err) {
      showModal('Login error', 'Error', 'error');
    }
  };

  // Register with backend
  const signup = async (name, email, password, cb) => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || ''
      const res = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setIsAuthenticated(true);
        if (cb) cb();
      } else {
        showModal(data.message || 'Registration failed', 'Registration Error', 'error');
      }
    } catch (err) {
      showModal('Registration error', 'Error', 'error');
    }
  };

  // Forgot password (mock, needs backend route)
  const forgotPassword = async (email) => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || ''
      const res = await fetch(`${API_BASE}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        showModal('Reset link sent to your email', 'Success', 'success');
      } else {
        showModal(data.message || 'Failed to send reset link', 'Error', 'error');
      }
    } catch (err) {
      showModal('Error sending reset link', 'Error', 'error');
    }
  };

  const logout = (cb) => {
    console.log('Logging out...');
    setIsAuthenticated(false);
    setUser(null);
    try {
      localStorage.removeItem('stuyta_auth');
      localStorage.removeItem('stuyta_user');
      localStorage.removeItem('token');
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('authChanged'));
    } catch (e) {
      console.error('Error clearing localStorage:', e);
    }
    if (cb) cb();
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, signup, forgotPassword, user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function RequireAuth({ children }) {
  const { isAuthenticated } = React.useContext(AuthContext)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

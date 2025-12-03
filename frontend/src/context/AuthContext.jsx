import React, { createContext, useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
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

  useEffect(() => {
    try {
      if (isAuthenticated) localStorage.setItem('stuyta_auth', '1')
      else localStorage.removeItem('stuyta_auth')
    } catch (e) {
      // ignore
    }
  }, [isAuthenticated])

  // Login with backend
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('stuyta_user')
      return stored ? JSON.parse(stored) : null
    } catch (e) {
      return null
    }
  });

  useEffect(() => {
    try {
      if (user) localStorage.setItem('stuyta_user', JSON.stringify(user))
      else localStorage.removeItem('stuyta_user')
    } catch (e) {
      console.error('Failed to save user to localStorage', e)
    }
  }, [user])

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
        setUser(data.user);
        // Attempt to fetch extended user info (UserInfo model) and attach it
        try {
          const infoRes = await fetch(`${API_BASE}/api/userinfo/${data.user._id}`);
          if (infoRes.ok) {
            const info = await infoRes.json();
            setUser((prev) => ({ ...prev, info }));
          }
        } catch (infoErr) {
          console.warn('Failed to fetch userinfo:', infoErr);
        }
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event('authChanged'));
        if (cb) cb();
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      alert('Login error');
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
        alert(data.message || 'Registration failed');
      }
    } catch (err) {
      alert('Registration error');
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
        alert('Reset link sent to your email');
      } else {
        alert(data.message || 'Failed to send reset link');
      }
    } catch (err) {
      alert('Error sending reset link');
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

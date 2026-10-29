import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Use sessionStorage to isolate each browser window/session
  const getInitialUser = () => {
    try {
      const savedUser = sessionStorage.getItem('stock_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  };

  const initialToken = sessionStorage.getItem('stock_token') || null;

  const [user, setUser] = useState(getInitialUser);
  const [token, setToken] = useState(initialToken);
  // If no token exists in this browser session, loading is immediately false (instant redirect)
  const [loading, setLoading] = useState(() => !!initialToken);

  useEffect(() => {
    // Clear any legacy persistent tokens from localStorage to prevent leaking across browser profiles
    try {
      localStorage.removeItem('stock_token');
      localStorage.removeItem('stock_user');
    } catch (e) {
      // Ignore if localStorage unavailable
    }

    const verifyAuth = async () => {
      if (token) {
        try {
          const res = await axiosClient.get('/auth/profile');
          if (res.data.success) {
            setUser(res.data.user);
            sessionStorage.setItem('stock_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Session expired or invalid in this browser');
          logout();
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, [token]);

  const login = async (email, password) => {
    const response = await axiosClient.post('/auth/login', { email, password });
    if (response.data.success) {
      const { token: receivedToken, user: receivedUser } = response.data;
      setToken(receivedToken);
      setUser(receivedUser);
      sessionStorage.setItem('stock_token', receivedToken);
      sessionStorage.setItem('stock_user', JSON.stringify(receivedUser));

      // Make sure localStorage is clean
      try {
        localStorage.removeItem('stock_token');
        localStorage.removeItem('stock_user');
      } catch (e) {}

      return response.data;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    try {
      sessionStorage.removeItem('stock_token');
      sessionStorage.removeItem('stock_user');
      localStorage.removeItem('stock_token');
      localStorage.removeItem('stock_user');
    } catch (e) {}
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

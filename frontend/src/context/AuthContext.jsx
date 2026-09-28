import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const checkAuth = async () => {
    const token = api.getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      if (res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.warn('Auth check failed:', err.message);
      setUser(null);
      api.setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    const handleExpired = () => {
      setUser(null);
    };
    window.addEventListener('campus_os_auth_expired', handleExpired);
    return () => window.removeEventListener('campus_os_auth_expired', handleExpired);
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await api.login({ email, password });
      setUser(res.user);
      return res;
    } catch (err) {
      setAuthError(err.message || 'Login failed.');
      throw err;
    }
  };

  const signup = async (formData) => {
    setAuthError(null);
    try {
      const res = await api.signup(formData);
      setUser(res.user);
      return res;
    } catch (err) {
      setAuthError(err.message || 'Sign up failed.');
      throw err;
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const updateSettings = async (settingsUpdate) => {
    try {
      const res = await api.updateSettings(settingsUpdate);
      if (res.user) {
        setUser(res.user);
      }
      return res;
    } catch (err) {
      throw err;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.updateProfile(profileData);
      if (res.user) {
        setUser(res.user);
      }
      return res;
    } catch (err) {
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        isAuthenticated: !!user,
        authError,
        setAuthError,
        login,
        signup,
        logout,
        updateSettings,
        updateProfile,
        refreshUser: checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

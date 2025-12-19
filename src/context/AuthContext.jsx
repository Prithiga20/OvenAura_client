import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.log('Auth check failed, removing token');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔄 Attempting login...');
      console.log('📧 Email:', email);
      console.log('🌐 API Base URL:', api.defaults.baseURL);
      console.log('🎯 Full URL will be:', `${api.defaults.baseURL}/auth/login`);
      
      // Try axios first
      let response;
      try {
        response = await api.post('/auth/login', { email, password });
      } catch (axiosError) {
        console.log('❌ Axios failed, trying direct fetch...');
        
        // Fallback to direct fetch
        try {
          const directURL = import.meta.env.DEV ? '/api/auth/login' : 'http://localhost:5000/api/auth/login';
          const fetchResponse = await fetch(directURL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
          });
          
          const data = await fetchResponse.json();
          
          if (!fetchResponse.ok) {
            throw new Error(data.message || 'Login failed');
          }
          
          // Convert fetch response to axios-like format
          response = { data };
          console.log('✅ Direct fetch succeeded');
        } catch (fetchError) {
          console.error('❌ Both axios and fetch failed');
          throw new Error('Cannot connect to server. Please check if backend is running.');
        }
      }
      
      console.log('✅ API Response received:', response.status);
      console.log('📦 Response data:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Login failed');
      }
      
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response format');
      }
      
      localStorage.setItem('token', token);
      setUser(user);
      
      console.log('✅ Login successful, user set:', user);
      return user;
      
    } catch (error) {
      console.error('❌ Login error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Re-throw with better error message
      if (error.response) {
        throw new Error(error.response.data?.message || 'Server error');
      } else if (error.request || error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to server. Please check if backend is running.');
      } else {
        throw error;
      }
    }
  };

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (userData) => {
    const response = await api.put('/auth/profile', userData);
    setUser(response.data.user);
    return response.data.user;
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
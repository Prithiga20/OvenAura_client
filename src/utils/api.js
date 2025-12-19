import axios from 'axios';

export const API_URL = 'https://ovenaura-server.onrender.com';

const baseURL = 'https://ovenaura-server.onrender.com/api';

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {

    return response;
  },
  (error) => {

    
    return Promise.reject(error);
  }
);

// Test connectivity function
export const testBackendConnection = async () => {
  try {
    console.log('🔄 Testing backend connection to: https://ovenaura-server.onrender.com/api/health');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch('https://ovenaura-server.onrender.com/api/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend health check passed:', data.message);
      return true;
    } else {
      console.error('❌ Backend health check failed with status:', response.status);
      return false;
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('❌ Backend connection timeout');
    } else {
      console.error('❌ Backend connectivity test failed:', error.message);
    }
    return false;
  }
};

export default api;
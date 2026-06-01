import axios from 'axios';

// Ensure API URL is properly configured
const apiBaseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
console.log('[API] Using base URL:', apiBaseURL);

const API = axios.create({
  baseURL: apiBaseURL,
  timeout: 30000, // 30 second timeout for mobile
  withCredentials: false, // Important for CORS
});

// Add JWT interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[API] ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error.message);
    return Promise.reject(error);
  }
);

// Add response interceptor to improve error handling
API.interceptors.response.use(
  (response) => {
    console.log(`[API] Response success: ${response.status}`);
    return response;
  },
  (error) => {
    console.error('[API] Response error:', error.message);
    
    if (error.response) {
      // Server responded with error status
      console.error('[API] Error status:', error.response.status);
      console.error('[API] Error data:', error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('[API] No response received - Network issue');
      error.message = 'Network error - please check your internet connection';
    } else {
      // Error in request setup
      console.error('[API] Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default API;

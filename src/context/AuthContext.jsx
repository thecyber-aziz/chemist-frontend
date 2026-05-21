import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { authAPI } from '../services/apiCalls';

const AuthContext = createContext();
const googleProvider = new GoogleAuthProvider();

// Set Firebase persistence across tabs
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    
    // Handle redirect result from Google sign-in
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const idToken = await result.user.getIdToken();
          const response = await authAPI.googleAuth(idToken);
          const { token, user: userData } = response.data;

          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
        }
      } catch (err) {
        console.error('Redirect result error:', err.message);
        setError(err.message);
      }
    };

    handleRedirectResult();
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authAPI.login(email, password);
      const { token, user: userData } = response.data;

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setError(null);
      return { user: userData, token };
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data) => {
    try {
      setLoading(true);
      const response = await authAPI.signup(data);
      const { token, user: userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setError(null);
      return { user: userData, token };
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const googleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);

      // Detect if it's a mobile device
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      let result;
      
      if (isMobile) {
        // Use redirect flow for mobile
        await signInWithRedirect(auth, googleProvider);
        // The redirect will navigate away, so we return here
        return;
      } else {
        // Use popup flow for desktop
        result = await signInWithPopup(auth, googleProvider);
        const idToken = await result.user.getIdToken();

        // Send the ID token to backend for verification
        const response = await authAPI.googleAuth(idToken);
        const { token, user: userData } = response.data;

        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));

        setUser(userData);
        setLoading(false);
        return { user: userData, token };
      }
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      setError(message);
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    try {
      // Sign out from Firebase
      await signOut(auth);

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, googleSignIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

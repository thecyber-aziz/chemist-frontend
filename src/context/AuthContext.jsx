import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { authAPI } from '../services/apiCalls';

const AuthContext = createContext();
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Step 1: Set persistence
        await setPersistence(auth, browserLocalPersistence);
        console.log('[Auth] ✓ Persistence configured');
      } catch (err) {
        console.warn('[Auth] ⚠ Persistence warning:', err.message);
      }

      try {
        // Step 2: Check localStorage first (fastest path)
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
          console.log('[Auth] ✓ User from localStorage:', userData);
          setUser(JSON.parse(userData));
          setLoading(false);
          return;
        }

        // Step 3: Check for redirect result - THIS IS CRITICAL FOR MOBILE
        console.log('[Auth] → Checking redirect result (mobile recovery)...');
        let redirectResult = null;
        try {
          redirectResult = await getRedirectResult(auth);
        } catch (redirectErr) {
          console.warn('[Auth] ⚠ getRedirectResult error:', redirectErr.message);
          // Don't throw, just continue
        }
        
        if (redirectResult && redirectResult.user) {
          console.log('[Auth] ✓✓✓ REDIRECT RESULT FOUND:', redirectResult.user.email);
          try {
            await processGoogleAuth(redirectResult.user);
            return;
          } catch (processErr) {
            console.error('[Auth] ✗ Failed to process redirect result:', processErr.message);
            setError(processErr.message);
            setLoading(false);
            return;
          }
        }

        console.log('[Auth] → No redirect result, auth initialized');
        setLoading(false);
      } catch (err) {
        console.error('[Auth] ✗ Critical init error:', err.message);
        setError(err.message);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const processGoogleAuth = async (firebaseUser) => {
    try {
      console.log('[Auth] → Processing Google auth for:', firebaseUser.email);
      
      let idToken = null;
      try {
        idToken = await firebaseUser.getIdToken(true); // Force refresh
        console.log('[Auth] ✓ ID token obtained, length:', idToken.length);
      } catch (tokenErr) {
        console.error('[Auth] ✗ Failed to get ID token:', tokenErr.message);
        throw new Error('Failed to get authentication token: ' + tokenErr.message);
      }
      
      console.log('[Auth] → Sending token to backend /api/auth/google');
      let response;
      try {
        response = await authAPI.googleAuth(idToken);
        console.log('[Auth] ✓ Backend response received');
      } catch (backendErr) {
        console.error('[Auth] ✗ Backend error:', backendErr.message);
        console.error('[Auth] Full error:', backendErr);
        throw new Error('Backend authentication failed: ' + (backendErr.response?.data?.error || backendErr.message));
      }

      const { token, user: userData } = response.data;
      
      if (!token || !userData) {
        console.error('[Auth] ✗ Invalid backend response:', response.data);
        throw new Error('Invalid backend response: missing token or user data');
      }

      console.log('[Auth] ✓✓✓ AUTHENTICATION SUCCESS:', userData.email);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('[Auth] ✗ Auth processing failed:', err.message);
      setError(err.message || 'Authentication failed');
      setLoading(false);
      throw err;
    }
  };

  const googleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[Auth] → Google sign-in initiated (popup mode for all devices)');
      
      try {
        const result = await signInWithPopup(auth, googleProvider);
        console.log('[Auth] ✓ Popup successful, user:', result.user.email);
        await processGoogleAuth(result.user);
      } catch (popupErr) {
        // If popup fails, try redirect as fallback
        console.warn('[Auth] ⚠ Popup blocked, attempting redirect:', popupErr.message);
        
        const isMobileUserAgent = /iPhone|iPad|iPod|Android|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobileUserAgent || popupErr.code === 'auth/popup-blocked' || popupErr.code === 'auth/popup-closed-by-user') {
          console.log('[Auth] → Falling back to redirect flow');
          await signInWithRedirect(auth, googleProvider);
          return;
        }
        
        throw popupErr;
      }
    } catch (err) {
      setLoading(false);
      const message = err.message || 'Sign-in failed';
      
      if (err.code === 'auth/cancelled-popup-request') {
        console.log('[Auth] → User cancelled sign-in');
        return;
      }
      
      console.error('[Auth] ✗ Sign-in failed:', message);
      setError(message);
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log('[Auth] Email login attempt');
      
      const response = await authAPI.login(email, password);
      const { token, user: userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setError(null);
      
      console.log('[Auth] ✓ Email login success');
      return { user: userData, token };
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      console.error('[Auth] ✗ Login error:', message);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data) => {
    try {
      setLoading(true);
      console.log('[Auth] Email signup attempt');
      
      const response = await authAPI.signup(data);
      const { token, user: userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setError(null);
      
      console.log('[Auth] ✓ Email signup success');
      return { user: userData, token };
    } catch (err) {
      const message = err.response?.data?.error || err.message;
      console.error('[Auth] ✗ Signup error:', message);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('[Auth] Logout initiated');
      await signOut(auth);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setError(null);
      console.log('[Auth] ✓ Logout complete');
    } catch (err) {
      console.error('[Auth] ✗ Logout error:', err.message);
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

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, googleSignIn, user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Auto-redirect when user logs in (works for both Google and email login)
  useEffect(() => {
    if (user) {
      console.log('[LoginPage] User authenticated, redirecting to home');
      navigate('/home', { replace: true });
    }
  }, [user, navigate]);

  // Show loading spinner if auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-white px-4 py-10 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    if (!password.trim()) {
      toast.error('Please enter your password');
      return;
    }

    try {
      setSubmitting(true);
      await login(email, password);
      toast.success('Logged in successfully');
      // useEffect will handle redirect
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setSubmitting(true);
      await googleSignIn();
      // For mobile: page will reload and redirect result will be caught
      // For desktop: user state will update and useEffect will redirect
      // useEffect will handle redirect
    } catch (error) {
      setSubmitting(false);
      
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        console.log('[LoginPage] User cancelled sign-in');
      } else {
        console.error('[LoginPage] Google sign-in error:', error);
        toast.error(error.message || 'Google sign-in failed');
      }
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-[440px]">
        <div className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.10)]">
          <h1 className="mb-6 text-[26px] font-medium tracking-tight text-black">Login</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="sr-only">Email</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter you email"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-[#fafbfc] pl-11 pr-4 text-[14px] text-slate-700 outline-none transition focus:border-black"
                />
              </div>
            </label>

            <label className="block">
              <span className="sr-only">Password</span>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-[#fafbfc] pl-11 pr-4 text-[14px] text-slate-700 outline-none transition focus:border-black"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={submitting || loading}
              className="h-12 w-full rounded-xl bg-[#8d8d8d] text-[15px] font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-80"
            >
              {submitting ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 border-t border-slate-200"></div>
            <span className="text-xs text-slate-400 font-medium">OR</span>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={submitting || loading}
            className="h-12 w-full rounded-xl bg-black text-[15px] font-medium text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-80 flex items-center justify-center gap-3"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#1f2937"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34a853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#fbbc05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#ea4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {submitting ? 'Signing in...' : 'Continue with Google'}
          </button>

          <p className="mt-4 text-center text-[13px] text-slate-500">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-medium text-black hover:underline">
              Signup
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
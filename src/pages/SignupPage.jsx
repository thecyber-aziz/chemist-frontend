import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    try {
      setSubmitting(true);
      await signup(email);
      toast.success('Account created successfully');
      navigate('/home', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Signup failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-[440px]">
        <div className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.10)]">
          <h1 className="mb-6 text-[26px] font-medium tracking-tight text-black">Signup</h1>

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
                  placeholder="Password"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-[#fafbfc] pl-11 pr-4 text-[14px] text-slate-700 outline-none transition focus:border-black"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="h-12 w-full rounded-xl bg-[#8d8d8d] text-[15px] font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-80"
            >
              {submitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-4 text-center text-[13px] text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-black hover:underline">
              Login
            </Link>
          </p>

          <p className="mt-4 text-center text-[11px] uppercase tracking-[0.25em] text-slate-400">
            Email-based account creation
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
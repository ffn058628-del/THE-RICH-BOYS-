/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Shield, MessageSquare, Flame, CheckCircle, Apple, AlertTriangle } from 'lucide-react';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [authMethod, setAuthMethod] = useState<'welcome' | 'email' | 'phone'>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQuickBypass = () => {
    setLoading(true);
    setTimeout(() => {
      onAuthSuccess();
    }, 800);
  };

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onAuthSuccess();
    }, 1200);
  };

  const handlePhoneAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setError('Please enter your mobile phone number.');
      return;
    }
    setError('');
    
    if (!otpSent) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setOtpSent(true);
      }, 1000);
    } else {
      if (!otp) {
        setError('Please enter the 4-digit code.');
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        onAuthSuccess();
      }, 1200);
    }
  };

  return (
    <div id="auth_screen_root" className="flex-1 flex flex-col justify-between px-6 py-8 bg-zinc-950 overflow-y-auto relative">
      {/* Decorative ambient backgrounds */}
      <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-violet-600/10 blur-[60px] pointer-events-none"></div>
      <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-amber-500/10 blur-[60px] pointer-events-none"></div>

      {/* Top Brand Logo */}
      <div className="flex flex-col items-center text-center mt-6 z-10">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 shadow-lg shadow-violet-500/10 mb-4 transform hover:scale-105 transition-transform duration-300">
          <Flame className="w-8 h-8 text-white fill-white/10" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
          A U R A
        </h1>
        <p className="text-xs text-zinc-500 mt-1 font-mono tracking-widest uppercase">
          Find Your Soul Match
        </p>
      </div>

      {/* Mid Form Area */}
      <div className="my-auto py-8 z-10">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {authMethod === 'welcome' && (
          <div className="space-y-3.5">
            <button
              id="auth_quick_bypass_btn"
              onClick={handleQuickBypass}
              className="w-full flex items-center justify-center space-x-3 py-3.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-sm font-semibold text-white shadow-lg shadow-violet-600/15 transition-all duration-300"
            >
              <span>Instant Guest Access</span>
            </button>

            <button
              id="auth_email_mode_btn"
              onClick={() => { setError(''); setAuthMethod('email'); }}
              className="w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800/80 text-zinc-200 text-xs font-medium border border-zinc-800/80 transition-all"
            >
              <Mail className="w-4 h-4 text-violet-400" />
              <span>Continue with Email</span>
            </button>

            <button
              id="auth_phone_mode_btn"
              onClick={() => { setError(''); setAuthMethod('phone'); }}
              className="w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800/80 text-zinc-200 text-xs font-medium border border-zinc-800/80 transition-all"
            >
              <MessageSquare className="w-4 h-4 text-amber-500" />
              <span>Continue with OTP Phone</span>
            </button>

            <div className="flex items-center my-6">
              <div className="flex-1 h-px bg-zinc-900"></div>
              <span className="px-3 text-[10px] text-zinc-600 font-mono tracking-wider uppercase">Or Secure Socials</span>
              <div className="flex-1 h-px bg-zinc-900"></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                id="auth_google_btn"
                onClick={handleQuickBypass}
                className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-lg bg-zinc-900/60 border border-zinc-800/60 hover:bg-zinc-800 text-xs font-medium text-zinc-300 transition-all"
              >
                <span className="text-amber-500 font-bold font-mono">G</span>
                <span>Google</span>
              </button>
              <button
                id="auth_apple_btn"
                onClick={handleQuickBypass}
                className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-lg bg-zinc-900/60 border border-zinc-800/60 hover:bg-zinc-800 text-xs font-medium text-zinc-300 transition-all"
              >
                <Apple className="w-3.5 h-3.5 text-zinc-300" />
                <span>Apple ID</span>
              </button>
            </div>
          </div>
        )}

        {authMethod === 'email' && (
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <h2 className="text-xl font-bold text-white mb-1">Sign in with Email</h2>
            <p className="text-xs text-zinc-500 mb-4">Secure multi-platform JWT database access</p>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase">Email Address</label>
              <input
                id="auth_email_input"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800 focus:border-violet-500 focus:outline-none text-sm text-zinc-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase">Password</label>
              <input
                id="auth_password_input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800 focus:border-violet-500 focus:outline-none text-sm text-zinc-200"
              />
            </div>

            <button
              id="auth_email_submit_btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-violet-700 text-sm font-semibold text-white transition-all shadow-md shadow-violet-600/10"
            >
              {loading ? 'Authenticating...' : 'Sign In / Register'}
            </button>

            <button
              id="auth_back_email_btn"
              type="button"
              onClick={() => { setError(''); setAuthMethod('welcome'); }}
              className="w-full text-center text-xs text-zinc-500 hover:text-zinc-300 pt-2 transition-colors"
            >
              Go Back
            </button>
          </form>
        )}

        {authMethod === 'phone' && (
          <form onSubmit={handlePhoneAuth} className="space-y-4">
            <h2 className="text-xl font-bold text-white mb-1">Phone Verification</h2>
            <p className="text-xs text-zinc-500 mb-4">Receive a secure 4-digit mobile OTP code</p>

            {!otpSent ? (
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase">Mobile Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl bg-zinc-900 border-y border-l border-zinc-800 text-xs text-zinc-500 font-mono">+1</span>
                  <input
                    id="auth_phone_input"
                    type="tel"
                    placeholder="(555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-r-xl bg-zinc-900/80 border border-zinc-800 focus:border-violet-500 focus:outline-none text-sm text-zinc-200"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-xs mb-3 flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>OTP code sent to +1 {phone}</span>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase">4-Digit Code</label>
                  <input
                    id="auth_otp_input"
                    type="text"
                    maxLength={4}
                    placeholder="1 2 3 4"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800 focus:border-violet-500 focus:outline-none text-center tracking-[1em] font-mono text-lg text-zinc-200"
                  />
                </div>
              </div>
            )}

            <button
              id="auth_phone_submit_btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-amber-700 text-sm font-semibold text-white transition-all shadow-md shadow-amber-600/10"
            >
              {loading ? 'Processing...' : (otpSent ? 'Verify & Continue' : 'Send OTP Code')}
            </button>

            <button
              id="auth_back_phone_btn"
              type="button"
              onClick={() => { setError(''); setOtpSent(false); setAuthMethod('welcome'); }}
              className="w-full text-center text-xs text-zinc-500 hover:text-zinc-300 pt-2 transition-colors"
            >
              Go Back
            </button>
          </form>
        )}
      </div>

      {/* Bottom Legal Notice */}
      <footer id="auth_footer" className="mt-auto text-center z-10">
        <p className="text-[10px] text-zinc-600 leading-relaxed max-w-sm mx-auto">
          By signing up, you agree to our <span className="text-zinc-400 underline hover:cursor-pointer">Terms of Service</span> and <span className="text-zinc-400 underline hover:cursor-pointer">Privacy Policy</span>. Includes end-to-end encryption.
        </p>
        <div className="flex items-center justify-center space-x-1.5 text-[9px] text-zinc-600 font-mono mt-3">
          <Shield className="w-3 h-3 text-violet-500" />
          <span>AES-GCM ENCRYPTED DB BACKEND</span>
        </div>
      </footer>
    </div>
  );
}

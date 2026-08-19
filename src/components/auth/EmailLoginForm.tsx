import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Phone, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface EmailLoginFormProps {
  onLogin: (payload: { email: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  onSwitchToPhone: () => void;
  onSwitchToSignup: () => void;
  onSwitchToForgotPassword: () => void;
  isLoading: boolean;
  error?: string;
}

export const EmailLoginForm: React.FC<EmailLoginFormProps> = ({
  onLogin,
  onSwitchToPhone,
  onSwitchToSignup,
  onSwitchToForgotPassword,
  isLoading,
  error,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Please enter both your email address and password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    const res = await onLogin({ email: email.trim(), password });
    if (!res.success && res.message) {
      setLocalError(res.message);
    }
  };

  return (
    <div className="space-y-5">
      {(error || localError) && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error || localError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email-input" className="block text-xs font-bold text-stone-700 mb-1.5">
            Email Address
          </label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              id="email-input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (localError) setLocalError('');
              }}
              placeholder="e.g. farmer@kisan.ai"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-sm font-medium placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 bg-stone-50/50"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password-input" className="block text-xs font-bold text-stone-700">
              Password
            </label>
            <button
              type="button"
              onClick={onSwitchToForgotPassword}
              className="text-xs text-emerald-700 hover:underline font-semibold cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              id="password-input"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (localError) setLocalError('');
              }}
              placeholder="Enter your password"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-sm font-medium placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 bg-stone-50/50"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-stone-400 hover:text-stone-600 focus:outline-none cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button
          id="email-login-btn"
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          disabled={!email || !password || isLoading}
          icon={<ArrowRight className="w-4 h-4" />}
        >
          {isLoading ? 'Signing In...' : 'Sign In with Email'}
        </Button>
      </form>

      {/* Switch to Mobile OTP */}
      <div className="space-y-3 pt-2">
        <Button
          id="switch-phone-login-btn"
          type="button"
          variant="outline"
          size="md"
          fullWidth
          onClick={onSwitchToPhone}
          icon={<Phone className="w-4 h-4 text-emerald-700" />}
        >
          Use Mobile Number + OTP instead
        </Button>

        <div className="text-center">
          <p className="text-xs text-stone-600">
            Need an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-emerald-700 font-bold hover:underline cursor-pointer"
            >
              Register New Farm
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

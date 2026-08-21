import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Phone, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { useI18n } from '../../context/I18nContext';

interface EmailLoginFormProps {
  onLogin: (payload: { email: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  onGoogleLogin?: () => Promise<{ success: boolean; message?: string }>;
  onSwitchToPhone: () => void;
  onSwitchToSignup: () => void;
  onSwitchToForgotPassword: () => void;
  isLoading: boolean;
  error?: string;
}

export const EmailLoginForm: React.FC<EmailLoginFormProps> = ({
  onLogin,
  onGoogleLogin,
  onSwitchToPhone,
  onSwitchToSignup,
  onSwitchToForgotPassword,
  isLoading,
  error,
}) => {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError(t('errors.invalidInput'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setLocalError(t('errors.invalidInput'));
      return;
    }

    const res = await onLogin({ email: email.trim(), password });
    if (!res.success && res.message) {
      setLocalError(res.message);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!onGoogleLogin) return;
    setIsGoogleLoading(true);
    setLocalError('');
    try {
      const res = await onGoogleLogin();
      if (!res.success && res.message) {
        setLocalError(res.message);
      }
    } catch (e: any) {
      setLocalError(e.message || t('errors.generic'));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Firebase Badge */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
        <div className="flex items-center gap-1.5 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          <span>{t('auth.cloudSync')}</span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-emerald-800 border border-emerald-200">
          kisanai-8b20e
        </span>
      </div>

      {(error || localError) && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error || localError}</span>
        </div>
      )}

      {/* Google Sign In Button */}
      {onGoogleLogin && (
        <div>
          <button
            id="google-signin-btn"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading || isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-sm font-bold shadow-xs transition-all cursor-pointer disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{isGoogleLoading ? t('common.loading') : t('auth.googleLogin')}</span>
          </button>

          <div className="relative flex py-3 items-center">
            <div className="flex-grow border-t border-stone-200"></div>
            <span className="flex-shrink mx-3 text-stone-400 text-xs font-semibold uppercase">{t('common.or')}</span>
            <div className="flex-grow border-t border-stone-200"></div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email-input" className="block text-xs font-bold text-stone-700 mb-1.5">
            {t('auth.email')}
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
              placeholder="farmer@kisan.ai"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-sm font-medium placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 bg-stone-50/50"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password-input" className="block text-xs font-bold text-stone-700">
              {t('auth.password')}
            </label>
            <button
              type="button"
              onClick={onSwitchToForgotPassword}
              className="text-xs text-emerald-700 hover:underline font-semibold cursor-pointer"
            >
              {t('auth.forgotPassword')}
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
              placeholder="••••••••"
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
          {isLoading ? t('common.loading') : t('auth.login')}
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
          {t('auth.phoneLogin')}
        </Button>

        <div className="text-center">
          <p className="text-xs text-stone-600">
            {t('auth.dontHaveAccount')}{' '}
            <button
              id="switch-to-signup-from-login"
              type="button"
              onClick={onSwitchToSignup}
              className="text-emerald-700 font-bold hover:underline cursor-pointer"
            >
              {t('auth.register')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

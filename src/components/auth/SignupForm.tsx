import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { LanguageCode } from '../../types/farming';
import { INDIA_AGRO_STATES } from '../../data/indiaAgroData';
import { useI18n } from '../../context/I18nContext';

interface SignupFormProps {
  onSignup: (data: {
    name: string;
    email?: string;
    phone?: string;
    password?: string;
    preferredLanguage: LanguageCode;
    state: string;
    district: string;
    role: 'FARMER' | 'AGRICULTURAL_OFFICER';
  }) => Promise<{ success: boolean; message?: string }>;
  onGoogleSignup?: () => Promise<{ success: boolean; message?: string }>;
  onSwitchToLogin: () => void;
  isLoading: boolean;
  error?: string;
  defaultLanguage?: LanguageCode;
}

export const SignupForm: React.FC<SignupFormProps> = ({
  onSignup,
  onGoogleSignup,
  onSwitchToLogin,
  isLoading,
  error,
  defaultLanguage,
}) => {
  const { t, language } = useI18n();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [preferredLanguage, setPreferredLanguage] = useState<LanguageCode>(defaultLanguage || language);
  const [state, setState] = useState('Punjab');
  const [district, setDistrict] = useState('Ludhiana');
  const [role, setRole] = useState<'FARMER' | 'AGRICULTURAL_OFFICER'>('FARMER');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [localError, setLocalError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const currentState = INDIA_AGRO_STATES.find((s) => s.name === state) || INDIA_AGRO_STATES[0];

  const handleStateChange = (newState: string) => {
    setState(newState);
    const foundState = INDIA_AGRO_STATES.find((s) => s.name === newState);
    if (foundState && foundState.districts.length > 0) {
      setDistrict(foundState.districts[0].name);
    }
  };

  const handleGoogleSignupClick = async () => {
    if (!onGoogleSignup) return;
    setIsGoogleLoading(true);
    setLocalError('');
    try {
      const res = await onGoogleSignup();
      if (!res.success && res.message) {
        setLocalError(res.message);
      }
    } catch (e: any) {
      setLocalError(e.message || t('errors.generic'));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!name.trim()) {
      setLocalError(t('errors.invalidInput'));
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone && cleanPhone.length !== 10) {
      setLocalError(t('errors.invalidInput'));
      return;
    }

    if (!email && !cleanPhone) {
      setLocalError(t('errors.invalidInput'));
      return;
    }

    if (password.length < 6) {
      setLocalError(t('errors.invalidInput'));
      return;
    }

    if (!agreeTerms) {
      setLocalError(t('errors.invalidInput'));
      return;
    }

    const res = await onSignup({
      name: name.trim(),
      email: email.trim() || undefined,
      phone: cleanPhone || undefined,
      password,
      preferredLanguage: language,
      state,
      district,
      role,
    });

    if (!res.success && res.message) {
      setLocalError(res.message);
    }
  };

  return (
    <div className="space-y-4">
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

      {/* Google Sign In/Up */}
      {onGoogleSignup && (
        <div>
          <button
            id="google-signup-btn"
            type="button"
            onClick={handleGoogleSignupClick}
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

          <div className="relative flex py-2.5 items-center">
            <div className="flex-grow border-t border-stone-200"></div>
            <span className="flex-shrink mx-3 text-stone-400 text-xs font-semibold uppercase">{t('common.or')}</span>
            <div className="flex-grow border-t border-stone-200"></div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Full Name */}
        <div>
          <label htmlFor="signup-name" className="block text-xs font-bold text-stone-700 mb-1">
            {t('auth.fullName')} *
          </label>
          <div className="relative flex items-center">
            <User className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              id="signup-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ramesh Kumar Patel"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Email & Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label htmlFor="signup-email" className="block text-xs font-bold text-stone-700 mb-1">
              {t('auth.email')} *
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                id="signup-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@kisan.ai"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="signup-phone" className="block text-xs font-bold text-stone-700 mb-1">
              {t('auth.mobileNumber')} ({t('common.optional')})
            </label>
            <div className="relative flex items-center">
              <Phone className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                id="signup-phone"
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder={t('auth.enterPhone')}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* State & District */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label htmlFor="signup-state" className="block text-xs font-bold text-stone-700 mb-1">
              {t('onboarding.state')} *
            </label>
            <select
              id="signup-state"
              value={state}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
              disabled={isLoading}
            >
              {INDIA_AGRO_STATES.map((s) => (
                <option key={s.code} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="signup-district" className="block text-xs font-bold text-stone-700 mb-1">
              {t('onboarding.district')} *
            </label>
            <select
              id="signup-district"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
              disabled={isLoading}
            >
              {currentState.districts.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.nameMr ? `${d.name} (${d.nameMr})` : d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="signup-password" className="block text-xs font-bold text-stone-700 mb-1">
            {t('auth.password')} *
          </label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-stone-400 hover:text-stone-600 focus:outline-none cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Role Toggle */}
        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
          <div className="text-xs">
            <span className="font-bold text-stone-900">Account Type: </span>
            <span className="text-stone-600">
              {role === 'FARMER' ? t('nav.krishiMitra') : t('nav.officerDashboard')}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setRole(role === 'FARMER' ? 'AGRICULTURAL_OFFICER' : 'FARMER')}
            className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
          >
            Switch to {role === 'FARMER' ? 'Officer' : 'Farmer'}
          </button>
        </div>

        {/* Terms Checkbox */}
        <label className="flex items-start gap-2 text-xs text-stone-600 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-0.5 rounded text-emerald-700 focus:ring-emerald-700"
          />
          <span>
            {t('auth.termsAgree')}
          </span>
        </label>

        <Button
          id="complete-signup-btn"
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          disabled={!name || password.length < 6 || !agreeTerms || isLoading}
          icon={<ArrowRight className="w-4 h-4" />}
        >
          {isLoading ? t('common.loading') : t('auth.createAccount')}
        </Button>
      </form>

      {/* Switch to Login */}
      <div className="text-center pt-2 border-t border-stone-100">
        <p className="text-xs text-stone-600">
          {t('auth.alreadyHaveAccount')}{' '}
          <button
            id="switch-to-login-btn"
            type="button"
            onClick={onSwitchToLogin}
            className="text-emerald-700 font-bold hover:underline cursor-pointer"
          >
            {t('auth.login')}
          </button>
        </p>
      </div>
    </div>
  );
};

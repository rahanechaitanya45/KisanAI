import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Eye, EyeOff, MapPin, Globe, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { LanguageCode } from '../../types/farming';
import { SUPPORTED_LANGUAGES } from '../../data/i18n';
import { INDIA_AGRO_STATES } from '../../data/indiaAgroData';

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
  onSwitchToLogin: () => void;
  isLoading: boolean;
  error?: string;
  defaultLanguage?: LanguageCode;
}

export const SignupForm: React.FC<SignupFormProps> = ({
  onSignup,
  onSwitchToLogin,
  isLoading,
  error,
  defaultLanguage = 'hi',
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [preferredLanguage, setPreferredLanguage] = useState<LanguageCode>(defaultLanguage);
  const [state, setState] = useState('Punjab');
  const [district, setDistrict] = useState('Ludhiana');
  const [role, setRole] = useState<'FARMER' | 'AGRICULTURAL_OFFICER'>('FARMER');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [localError, setLocalError] = useState('');

  const currentState = INDIA_AGRO_STATES.find((s) => s.name === state) || INDIA_AGRO_STATES[0];

  const handleStateChange = (newState: string) => {
    setState(newState);
    const foundState = INDIA_AGRO_STATES.find((s) => s.name === newState);
    if (foundState && foundState.districts.length > 0) {
      setDistrict(foundState.districts[0].name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!name.trim()) {
      setLocalError('Please enter your full name.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone && cleanPhone.length !== 10) {
      setLocalError('Mobile number must be a 10-digit Indian number.');
      return;
    }

    if (!email && !cleanPhone) {
      setLocalError('Please provide either a mobile number or email address.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    if (!agreeTerms) {
      setLocalError('Please agree to terms and privacy policy.');
      return;
    }

    const res = await onSignup({
      name: name.trim(),
      email: email.trim() || undefined,
      phone: cleanPhone || undefined,
      password,
      preferredLanguage,
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
      {(error || localError) && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error || localError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Full Name */}
        <div>
          <label htmlFor="signup-name" className="block text-xs font-bold text-stone-700 mb-1">
            Full Name (पूरा नाम) *
          </label>
          <div className="relative flex items-center">
            <User className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              id="signup-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar Patel"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Mobile Number & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label htmlFor="signup-phone" className="block text-xs font-bold text-stone-700 mb-1">
              Mobile Number (मोबाइल) *
            </label>
            <div className="relative flex items-center">
              <Phone className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                id="signup-phone"
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit mobile"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="signup-email" className="block text-xs font-bold text-stone-700 mb-1">
              Email (optional)
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@kisan.ai"
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
              State (राज्य) *
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
              District (ज़िला) *
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
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="signup-password" className="block text-xs font-bold text-stone-700 mb-1">
            Create Password (पासवर्ड) *
          </label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
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
              {role === 'FARMER' ? 'Farmer / Cultivator' : 'Agricultural Extension Officer'}
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
            I agree to KisanAI data privacy terms and verified agricultural advisories.
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
          {isLoading ? 'Creating Farm Account...' : 'Create Account & Continue'}
        </Button>
      </form>

      {/* Switch to Login */}
      <div className="text-center pt-2 border-t border-stone-100">
        <p className="text-xs text-stone-600">
          Already have an account?{' '}
          <button
            id="switch-to-login-btn"
            type="button"
            onClick={onSwitchToLogin}
            className="text-emerald-700 font-bold hover:underline cursor-pointer"
          >
            Sign In with Phone or Email
          </button>
        </p>
      </div>
    </div>
  );
};

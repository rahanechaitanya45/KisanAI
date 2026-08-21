import React, { useState } from 'react';
import { Phone, ArrowRight, Mail, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { DEMO_FARMERS } from '../../data/demoFarmers';
import { useI18n } from '../../context/I18nContext';

interface PhoneLoginFormProps {
  onSendOTP: (phone: string) => Promise<{ success: boolean; message?: string }>;
  onSwitchToEmail: () => void;
  onSwitchToSignup: () => void;
  onQuickDemoLogin: (index: number) => void;
  isLoading: boolean;
  error?: string;
}

export const PhoneLoginForm: React.FC<PhoneLoginFormProps> = ({
  onSendOTP,
  onSwitchToEmail,
  onSwitchToSignup,
  onQuickDemoLogin,
  isLoading,
  error,
}) => {
  const { t, lookupAgro } = useI18n();
  const [phone, setPhone] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      setLocalError(t('errors.invalidInput'));
      return;
    }

    const res = await onSendOTP(cleaned);
    if (!res.success && res.message) {
      setLocalError(res.message);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(val);
    if (localError) setLocalError('');
  };

  return (
    <div className="space-y-5">
      {/* Development Mode Pill */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
        <div className="flex items-center gap-1.5 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span>Demo Verification</span>
        </div>
        <Badge variant="earth" size="sm">
          Demo OTP: 123456
        </Badge>
      </div>

      {(error || localError) && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error || localError}</span>
        </div>
      )}

      {/* Main Mobile Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="mobile-input" className="block text-xs font-bold text-stone-700 mb-1.5">
            {t('auth.mobileNumber')}
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center gap-1.5 text-stone-500 font-bold text-xs pointer-events-none border-r border-stone-200 pr-2">
              <span>🇮🇳</span>
              <span>+91</span>
            </div>
            <input
              id="mobile-input"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              autoFocus
              value={phone}
              onChange={handlePhoneChange}
              placeholder={t('auth.enterPhone')}
              className="w-full pl-20 pr-4 py-3 rounded-xl border border-stone-300 text-stone-900 text-sm font-semibold placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 bg-stone-50/50"
              disabled={isLoading}
            />
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            {t('auth.otpSentMessage', { phone: '+91 XXXXX XXXXX' })}
          </p>
        </div>

        <Button
          id="send-otp-btn"
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          disabled={phone.length !== 10 || isLoading}
          icon={<ArrowRight className="w-4 h-4" />}
        >
          {isLoading ? t('common.loading') : t('auth.sendOtp')}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-stone-200"></div>
        <span className="flex-shrink mx-3 text-stone-400 text-xs font-semibold uppercase">{t('common.or')}</span>
        <div className="flex-grow border-t border-stone-200"></div>
      </div>

      {/* Secondary Options */}
      <div className="space-y-2">
        <Button
          id="email-login-toggle-btn"
          type="button"
          variant="outline"
          size="md"
          fullWidth
          onClick={onSwitchToEmail}
          icon={<Mail className="w-4 h-4 text-stone-500" />}
        >
          {t('auth.emailLogin')}
        </Button>

        <div className="text-center pt-2">
          <p className="text-xs text-stone-600">
            {t('auth.dontHaveAccount')}{' '}
            <button
              id="signup-toggle-btn"
              type="button"
              onClick={onSwitchToSignup}
              className="text-emerald-700 font-bold hover:underline cursor-pointer"
            >
              {t('auth.register')}
            </button>
          </p>
        </div>
      </div>

      {/* Quick Test Demo Profiles */}
      <div className="pt-3 border-t border-stone-100">
        <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
          {t('auth.quickDemo')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {DEMO_FARMERS.map((demo, idx) => {
            const demoCrop = demo.farmer.farms[0]?.plots[0]?.currentCropSeason?.cropName || '';
            return (
              <button
                key={demo.farmer.id}
                type="button"
                onClick={() => onQuickDemoLogin(idx)}
                className="p-2 rounded-xl border border-stone-200 hover:border-emerald-700 bg-stone-50 hover:bg-emerald-50 text-left transition-all cursor-pointer group"
              >
                <p className="text-xs font-bold text-stone-900 group-hover:text-emerald-900 truncate">
                  {demo.farmer.name}
                </p>
                <p className="text-[10px] text-stone-500 truncate">
                  {demo.farmer.district} ({lookupAgro('crops', demoCrop)})
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

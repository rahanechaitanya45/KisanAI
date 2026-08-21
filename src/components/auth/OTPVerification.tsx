import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, RefreshCw, ArrowLeft, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { useI18n } from '../../context/I18nContext';

interface OTPVerificationProps {
  phone: string;
  onVerifyOTP: (otp: string) => Promise<{ success: boolean; message?: string; remainingAttempts?: number }>;
  onResendOTP: () => Promise<{ success: boolean; message?: string; cooldownSeconds?: number }>;
  onChangePhone: () => void;
  isLoading: boolean;
  error?: string;
  initialCooldown?: number;
  demoOtpHint?: string;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  phone,
  onVerifyOTP,
  onResendOTP,
  onChangePhone,
  isLoading,
  error,
  initialCooldown = 60,
  demoOtpHint = '123456',
}) => {
  const { t } = useI18n();
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState<number>(initialCooldown);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string>('');
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Format phone for privacy: +91 98765 XXXXX
  const formattedPhone = `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '');
    if (!clean) {
      const next = [...digits];
      next[index] = '';
      setDigits(next);
      return;
    }

    const lastChar = clean[clean.length - 1];
    const next = [...digits];
    next[index] = lastChar;
    setDigits(next);

    if (localError) setLocalError('');

    // Advance focus
    if (index < 5 && lastChar) {
      inputRefs.current[index + 1]?.focus();
    }

    // If all 6 digits are filled, auto-submit
    const fullCode = next.join('');
    if (fullCode.length === 6) {
      triggerVerification(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const next = ['', '', '', '', '', ''];
      for (let i = 0; i < pasted.length; i++) {
        next[i] = pasted[i];
      }
      setDigits(next);
      if (pasted.length === 6) {
        inputRefs.current[5]?.focus();
        triggerVerification(pasted);
      } else {
        inputRefs.current[pasted.length]?.focus();
      }
    }
  };

  const triggerVerification = async (code: string) => {
    setLocalError('');
    const res = await onVerifyOTP(code);
    if (res.success) {
      setIsSuccess(true);
    } else {
      if (res.message) setLocalError(res.message);
      if (res.remainingAttempts !== undefined) {
        setAttemptsLeft(res.remainingAttempts);
      }
      // Re-focus first empty
      const firstEmpty = digits.findIndex((d) => !d);
      inputRefs.current[firstEmpty !== -1 ? firstEmpty : 0]?.focus();
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length !== 6) {
      setLocalError(t('errors.invalidInput'));
      return;
    }
    triggerVerification(code);
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    setLocalError('');
    const res = await onResendOTP();
    setIsResending(false);
    if (res.success) {
      setCooldown(res.cooldownSeconds || 60);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } else if (res.message) {
      setLocalError(res.message);
    }
  };

  if (isSuccess) {
    return (
      <div className="py-8 text-center space-y-4 animate-in fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-emerald-700 animate-bounce" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-stone-900">{t('auth.verifiedSuccess')}</h3>
          <p className="text-xs text-stone-500">
            {t('common.loading')}...
          </p>
        </div>
      </div>
    );
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Dev Mode Banner */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
        <div className="flex items-center gap-1.5 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span>Demo Mode OTP: {demoOtpHint}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            const arr = demoOtpHint.split('').slice(0, 6);
            setDigits(arr);
            triggerVerification(demoOtpHint);
          }}
          className="text-amber-800 font-bold hover:underline cursor-pointer"
        >
          Auto-Fill
        </button>
      </div>

      <div className="space-y-1">
        <p className="text-xs text-stone-600">
          {t('auth.otpSentMessage', { phone: formattedPhone })}
        </p>
        <button
          type="button"
          onClick={onChangePhone}
          className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3 h-3" />
          Change Mobile Number
        </button>
      </div>

      {(error || localError) && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{error || localError}</p>
            {attemptsLeft !== null && attemptsLeft <= 3 && (
              <p className="text-[11px] font-bold mt-0.5">
                {attemptsLeft} attempts remaining.
              </p>
            )}
          </div>
        </div>
      )}

      {/* 6 Digit Inputs */}
      <form onSubmit={handleManualSubmit} className="space-y-5">
        <div className="flex justify-between gap-1.5 sm:gap-2.5">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              aria-label={`OTP Digit ${idx + 1}`}
              className={`w-11 h-13 sm:w-13 sm:h-15 text-center text-xl font-extrabold rounded-2xl border transition-all ${
                digit
                  ? 'bg-emerald-50/60 border-emerald-700 text-emerald-950 ring-2 ring-emerald-700/20'
                  : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/30'
              }`}
              disabled={isLoading}
            />
          ))}
        </div>

        <Button
          id="verify-otp-btn"
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          disabled={digits.join('').length !== 6 || isLoading}
          icon={<ShieldCheck className="w-4 h-4" />}
        >
          {isLoading ? t('common.loading') : t('auth.verifyOtp')}
        </Button>
      </form>

      {/* Resend OTP Section */}
      <div className="text-center pt-2 space-y-1">
        <p className="text-xs text-stone-500">{t('auth.resendOtp')}</p>
        {cooldown > 0 ? (
          <p className="text-xs font-semibold text-stone-600">
            Resend available in <span className="font-mono text-emerald-800">{formatTimer(cooldown)}</span>
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="text-xs font-bold text-emerald-700 hover:underline inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
            {isResending ? t('common.loading') : t('auth.resendOtp')}
          </button>
        )}
      </div>
    </div>
  );
};

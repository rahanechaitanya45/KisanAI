import React, { useState } from 'react';
import { Mail, Lock, KeyRound, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

interface ForgotPasswordFormProps {
  onRequestReset: (email: string) => Promise<{ success: boolean; message?: string; demoOtpHint?: string }>;
  onConfirmReset: (payload: { email: string; code: string; newPassword: string }) => Promise<{ success: boolean; message?: string }>;
  onBackToLogin: () => void;
  isLoading: boolean;
  error?: string;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onRequestReset,
  onConfirmReset,
  onBackToLogin,
  isLoading,
  error,
}) => {
  const [step, setStep] = useState<'request' | 'confirm'>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [demoHint, setDemoHint] = useState<string>('123456');
  const [localError, setLocalError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (!email.trim()) {
      setLocalError('Please enter your email address.');
      return;
    }

    const res = await onRequestReset(email.trim());
    if (res.success) {
      if (res.demoOtpHint) setDemoHint(res.demoOtpHint);
      setStep('confirm');
    } else if (res.message) {
      setLocalError(res.message);
    }
  };

  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!code || code.length !== 6) {
      setLocalError('Please enter the 6-digit reset code.');
      return;
    }

    if (newPassword.length < 6) {
      setLocalError('New password must be at least 6 characters long.');
      return;
    }

    const res = await onConfirmReset({ email: email.trim(), code: code.trim(), newPassword });
    if (res.success) {
      setIsSuccess(true);
    } else if (res.message) {
      setLocalError(res.message);
    }
  };

  if (isSuccess) {
    return (
      <div className="py-6 text-center space-y-4 animate-in fade-in">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-emerald-700" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-stone-900">Password Updated</h3>
          <p className="text-xs text-stone-600">
            Your password has been changed successfully. You can now sign in with your new password.
          </p>
        </div>
        <Button
          id="back-to-login-after-reset-btn"
          type="button"
          variant="primary"
          size="md"
          fullWidth
          onClick={onBackToLogin}
        >
          Sign In Now
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Dev Mode Code Banner */}
      {step === 'confirm' && (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
          <div className="flex items-center gap-1.5 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Development Reset Code: {demoHint}</span>
          </div>
          <button
            type="button"
            onClick={() => setCode(demoHint)}
            className="text-amber-800 font-bold hover:underline cursor-pointer"
          >
            Auto-Fill
          </button>
        </div>
      )}

      {(error || localError) && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error || localError}</span>
        </div>
      )}

      {step === 'request' ? (
        <form onSubmit={handleRequestSubmit} className="space-y-4">
          <div>
            <label htmlFor="forgot-email" className="block text-xs font-bold text-stone-700 mb-1.5">
              Registered Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                id="forgot-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. farmer@kisan.ai"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
                disabled={isLoading}
              />
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              We'll send a 6-digit recovery code to this email.
            </p>
          </div>

          <Button
            id="send-reset-code-btn"
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            disabled={!email || isLoading}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            {isLoading ? 'Sending Code...' : 'Send Recovery Code'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleConfirmSubmit} className="space-y-4">
          <div>
            <label htmlFor="reset-code" className="block text-xs font-bold text-stone-700 mb-1.5">
              6-Digit Recovery Code
            </label>
            <div className="relative flex items-center">
              <KeyRound className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                id="reset-code"
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit code"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-sm font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="new-password" className="block text-xs font-bold text-stone-700 mb-1.5">
              Create New Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                id="new-password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-stone-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
                disabled={isLoading}
              />
            </div>
          </div>

          <Button
            id="update-password-btn"
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            disabled={code.length !== 6 || newPassword.length < 6 || isLoading}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            {isLoading ? 'Updating Password...' : 'Reset & Save Password'}
          </Button>
        </form>
      )}

      {/* Back to Login Button */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-xs text-stone-600 hover:text-stone-900 font-semibold flex items-center justify-center gap-1 mx-auto cursor-pointer"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Sign In
        </button>
      </div>
    </div>
  );
};

import { FarmerProfile, LanguageCode } from './farming';

export type UserRole = 'FARMER' | 'AGRICULTURAL_OFFICER' | 'ADMIN';

export interface AuthUser {
  id: string;
  phone?: string;
  email?: string;
  name: string;
  preferredLanguage: LanguageCode;
  state: string;
  district: string;
  village?: string;
  role: UserRole;
  avatarUrl?: string;
  farmingExperienceYears?: number;
  farmingType?: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  isOnboarded: boolean;
  createdAt: string;
  lastLoginAt: string;
}

export interface AuthSession {
  token: string;
  expiresAt: string;
  user: AuthUser;
}

export type AuthMode =
  | 'phone-login'
  | 'otp-verify'
  | 'email-login'
  | 'signup'
  | 'forgot-password'
  | 'reset-password'
  | 'onboarding';

export interface SendOTPPayload {
  phone: string;
  language?: LanguageCode;
}

export interface VerifyOTPPayload {
  phone: string;
  otp: string;
}

export interface EmailLoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  preferredLanguage: LanguageCode;
  state: string;
  district: string;
  role?: UserRole;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  code: string;
  newPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  session?: AuthSession;
  user?: AuthUser;
  requiresOnboarding?: boolean;
  cooldownSeconds?: number;
  remainingAttempts?: number;
  demoOtpHint?: string;
}

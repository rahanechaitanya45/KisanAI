import {
  AuthResponse,
  AuthSession,
  AuthUser,
  EmailLoginPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  SendOTPPayload,
  SignupPayload,
  VerifyOTPPayload,
} from '../types/auth';
import { DEMO_FARMERS } from '../data/demoFarmers';

const SESSION_STORAGE_KEY = 'kisanai_auth_session';
const TOKEN_STORAGE_KEY = 'kisanai_auth_token';

class AuthService {
  private session: AuthSession | null = null;
  private listeners: ((user: AuthUser | null) => void)[] = [];

  constructor() {
    this.restoreSession();
  }

  public restoreSession(): AuthSession | null {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        const parsed: AuthSession = JSON.parse(stored);
        if (new Date(parsed.expiresAt).getTime() > Date.now()) {
          this.session = parsed;
          return parsed;
        } else {
          this.clearSession();
        }
      }
    } catch (e) {
      console.warn('Could not restore auth session', e);
    }
    return null;
  }

  public getSession(): AuthSession | null {
    if (!this.session) {
      this.restoreSession();
    }
    return this.session;
  }

  public getCurrentUser(): AuthUser | null {
    return this.getSession()?.user || null;
  }

  public isAuthenticated(): boolean {
    const session = this.getSession();
    return Boolean(session && new Date(session.expiresAt).getTime() > Date.now());
  }

  public subscribe(callback: (user: AuthUser | null) => void): () => void {
    this.listeners.push(callback);
    callback(this.getCurrentUser());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notify() {
    const user = this.getCurrentUser();
    this.listeners.forEach((l) => l(user));
  }

  public saveSession(session: AuthSession): void {
    this.session = session;
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      localStorage.setItem(TOKEN_STORAGE_KEY, session.token);
    } catch (e) {
      console.warn('Failed to save auth session', e);
    }
    this.notify();
  }

  public clearSession(): void {
    this.session = null;
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear auth session', e);
    }
    this.notify();
  }

  // 1. Send OTP
  public async sendOTP(payload: SendOTPPayload): Promise<AuthResponse> {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data.error || 'Failed to send verification code. Please check your connection.',
          cooldownSeconds: data.cooldownSeconds,
        };
      }

      return {
        success: true,
        message: data.message,
        cooldownSeconds: data.cooldownSeconds,
        demoOtpHint: data.demoOtpHint,
      };
    } catch (e: any) {
      // Offline / fallback demo simulation
      return {
        success: true,
        message: 'Demo verification code sent (Code: 123456)',
        cooldownSeconds: 60,
        demoOtpHint: '123456',
      };
    }
  }

  // 2. Verify OTP
  public async verifyOTP(payload: VerifyOTPPayload): Promise<AuthResponse> {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data.error || "That code isn't correct. Please check and try again.",
          remainingAttempts: data.remainingAttempts,
        };
      }

      if (data.session) {
        this.saveSession(data.session);
      }

      return {
        success: true,
        message: data.message,
        session: data.session,
        user: data.user,
        requiresOnboarding: data.requiresOnboarding,
      };
    } catch (e) {
      // Offline fallback: match demo
      if (payload.otp === '123456') {
        const demoUser: AuthUser = {
          id: 'demo-farmer-1',
          phone: payload.phone,
          name: DEMO_FARMERS[0].farmer.name,
          preferredLanguage: DEMO_FARMERS[0].farmer.preferredLanguage,
          state: DEMO_FARMERS[0].farmer.state,
          district: DEMO_FARMERS[0].farmer.district,
          village: DEMO_FARMERS[0].farmer.village,
          role: 'FARMER',
          isPhoneVerified: true,
          isEmailVerified: false,
          isOnboarded: true,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };

        const session: AuthSession = {
          token: 'offline_token_' + Date.now(),
          expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
          user: demoUser,
        };

        this.saveSession(session);
        return {
          success: true,
          message: 'Phone verified successfully.',
          session,
          user: demoUser,
          requiresOnboarding: false,
        };
      }

      return {
        success: false,
        message: "That code isn't correct. Please check and try again.",
      };
    }
  }

  // 3. Email Login
  public async loginWithEmail(payload: EmailLoginPayload): Promise<AuthResponse> {
    try {
      const res = await fetch('/api/auth/login-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data.error || 'Incorrect email or password.',
        };
      }

      if (data.session) {
        this.saveSession(data.session);
      }

      return {
        success: true,
        message: data.message,
        session: data.session,
        user: data.user,
        requiresOnboarding: data.requiresOnboarding,
      };
    } catch (e) {
      return {
        success: false,
        message: 'Could not connect to authentication service. Please try again.',
      };
    }
  }

  // 4. Email Signup
  public async signupWithEmail(payload: SignupPayload): Promise<AuthResponse> {
    try {
      const res = await fetch('/api/auth/signup-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data.error || 'Failed to create account.',
        };
      }

      if (data.session) {
        this.saveSession(data.session);
      }

      return {
        success: true,
        message: data.message,
        session: data.session,
        user: data.user,
        requiresOnboarding: true,
      };
    } catch (e) {
      return {
        success: false,
        message: 'Could not create account right now. Please try again.',
      };
    }
  }

  // 5. Forgot Password
  public async forgotPassword(payload: ForgotPasswordPayload): Promise<AuthResponse> {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      return {
        success: true,
        message: data.message || 'If an account exists, a reset code has been sent.',
        demoOtpHint: data.demoResetCodeHint,
      };
    } catch (e) {
      return {
        success: true,
        message: 'If an account exists, a reset code has been sent.',
        demoOtpHint: '123456',
      };
    }
  }

  // 6. Reset Password
  public async resetPassword(payload: ResetPasswordPayload): Promise<AuthResponse> {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data.error || 'Failed to reset password.',
        };
      }

      if (data.session) {
        this.saveSession(data.session);
      }

      return {
        success: true,
        message: data.message,
        session: data.session,
        user: data.user,
      };
    } catch (e) {
      return {
        success: false,
        message: 'Could not reset password right now. Please try again.',
      };
    }
  }

  // 7. Update User Profile
  public async updateUserProfile(updates: Partial<AuthUser>): Promise<AuthResponse> {
    const session = this.getSession();
    if (!session) {
      return { success: false, message: 'Not authenticated' };
    }

    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Failed to update profile' };
      }

      const updatedSession: AuthSession = {
        ...session,
        user: { ...session.user, ...data.user },
      };
      this.saveSession(updatedSession);

      return { success: true, user: updatedSession.user, message: data.message };
    } catch (e) {
      // Local update fallback
      const updatedSession: AuthSession = {
        ...session,
        user: { ...session.user, ...updates },
      };
      this.saveSession(updatedSession);
      return { success: true, user: updatedSession.user, message: 'Profile updated.' };
    }
  }

  // 8. Logout
  public async logout(): Promise<void> {
    const session = this.getSession();
    if (session) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        });
      } catch (e) {
        // ignore
      }
    }
    this.clearSession();
  }

  // Quick Demo Login for instant testing
  public loginWithDemoAccount(demoIndex: number): AuthSession {
    const demo = DEMO_FARMERS[demoIndex] || DEMO_FARMERS[0];
    const user: AuthUser = {
      id: demo.farmer.id,
      phone: demo.farmer.phone,
      email: `${demo.farmer.name.toLowerCase().replace(/\s+/g, '.')}@kisan.ai`,
      name: demo.farmer.name,
      preferredLanguage: demo.farmer.preferredLanguage,
      state: demo.farmer.state,
      district: demo.farmer.district,
      village: demo.farmer.village,
      role: demo.farmer.role,
      farmingExperienceYears: demo.farmer.farmingExperienceYears || 15,
      isPhoneVerified: true,
      isEmailVerified: true,
      isOnboarded: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      lastLoginAt: new Date().toISOString(),
    };

    const session: AuthSession = {
      token: 'demo_token_' + demo.farmer.id,
      expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      user,
    };

    this.saveSession(session);
    return session;
  }
}

export const authService = new AuthService();

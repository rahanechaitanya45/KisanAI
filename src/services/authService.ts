import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { firestoreService } from './firestoreService';
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
import { FarmerProfile } from '../types/farming';

const SESSION_STORAGE_KEY = 'kisanai_auth_session';

class AuthService {
  private session: AuthSession | null = null;
  private listeners: ((user: AuthUser | null) => void)[] = [];
  private isInitialized = false;

  constructor() {
    this.restoreLocalSession();
    this.initFirebaseAuthListener();
  }

  private restoreLocalSession(): void {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        const parsed: AuthSession = JSON.parse(stored);
        if (new Date(parsed.expiresAt).getTime() > Date.now()) {
          this.session = parsed;
        } else {
          this.clearSession();
        }
      }
    } catch (e) {
      console.warn('Could not restore auth session from localStorage', e);
    }
  }

  // Real-time Firebase Auth listener
  private initFirebaseAuthListener() {
    if (typeof window === 'undefined') return;

    onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      this.isInitialized = true;
      if (firebaseUser) {
        // Fetch or create Firestore user doc
        let userDoc = await firestoreService.getUserAccount(firebaseUser.uid);
        if (!userDoc) {
          userDoc = {
            id: firebaseUser.uid,
            email: firebaseUser.email || undefined,
            phone: firebaseUser.phoneNumber || undefined,
            name: firebaseUser.displayName || 'Farmer',
            preferredLanguage: 'hi',
            state: 'Punjab',
            district: 'Ludhiana',
            role: 'FARMER',
            isPhoneVerified: Boolean(firebaseUser.phoneNumber),
            isEmailVerified: firebaseUser.emailVerified,
            isOnboarded: false,
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          };
          await firestoreService.saveUserAccount(userDoc);
        } else {
          // Update last login
          userDoc.lastLoginAt = new Date().toISOString();
          await firestoreService.saveUserAccount(userDoc);
        }

        const newSession: AuthSession = {
          token: await firebaseUser.getIdToken().catch(() => 'fb_token_' + firebaseUser.uid),
          expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
          user: userDoc,
        };

        this.session = newSession;
        try {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
        } catch (e) {}
        this.notify();
      } else if (!this.session?.user?.id?.startsWith('demo-')) {
        // If not a demo user and signed out of Firebase, clear session
        this.session = null;
        try {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        } catch (e) {}
        this.notify();
      }
    });
  }

  public getSession(): AuthSession | null {
    return this.session;
  }

  public getCurrentUser(): AuthUser | null {
    return this.session?.user || null;
  }

  public isAuthenticated(): boolean {
    return Boolean(this.session && new Date(this.session.expiresAt).getTime() > Date.now());
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
    } catch (e) {
      console.warn('Failed to save auth session', e);
    }
    this.notify();
  }

  public clearSession(): void {
    this.session = null;
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {}
    this.notify();
  }

  // 1. Firebase Email & Password Signup
  public async signupWithEmail(payload: SignupPayload): Promise<AuthResponse> {
    try {
      if (!payload.email || !payload.password) {
        // If phone-only signup without email, synthesize farm user email
        const generatedEmail = payload.phone
          ? `farmer.${payload.phone}@kisanai.app`
          : `farmer.${Date.now()}@kisanai.app`;
        payload.email = generatedEmail;
      }

      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        payload.email,
        payload.password || 'Kisan@123'
      );

      const fbUser = userCredential.user;

      // Set display name in Firebase Auth
      await updateProfile(fbUser, {
        displayName: payload.name,
      }).catch((e) => console.warn('Could not update profile name in Firebase Auth', e));

      // Build User Model
      const user: AuthUser = {
        id: fbUser.uid,
        email: fbUser.email || payload.email,
        phone: payload.phone,
        name: payload.name,
        preferredLanguage: payload.preferredLanguage || 'hi',
        state: payload.state || 'Punjab',
        district: payload.district || 'Ludhiana',
        role: payload.role || 'FARMER',
        isPhoneVerified: Boolean(payload.phone),
        isEmailVerified: fbUser.emailVerified,
        isOnboarded: false,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      // Save to Cloud Firestore
      await firestoreService.saveUserAccount(user);

      // Create Initial Farmer Profile in Firestore
      const initialFarmerProfile: FarmerProfile = {
        id: fbUser.uid,
        name: payload.name,
        phone: payload.phone || '',
        state: payload.state || 'Punjab',
        district: payload.district || 'Ludhiana',
        village: '',
        preferredLanguage: payload.preferredLanguage || 'hi',
        role: payload.role || 'FARMER',
        farmingExperienceYears: 5,
        farms: [
          {
            id: `farm-${fbUser.uid.slice(0, 6)}`,
            name: `${payload.name}'s Farm`,
            state: payload.state || 'Punjab',
            district: payload.district || 'Ludhiana',
            totalAreaAcres: 3.5,
            farmingType: 'irrigated',
            isPrimary: true,
            plots: [
              {
                id: `plot-${fbUser.uid.slice(0, 6)}-1`,
                name: 'Field Plot #1 (Main)',
                areaAcres: 3.5,
                soil: {
                  soilType: 'Alluvial Soil',
                  ph: 7.0,
                  nitrogen: 'Medium',
                  phosphorus: 'Medium',
                  potassium: 'High',
                  organicCarbon: 0.55,
                  source: 'ai-estimated',
                  testDate: new Date().toISOString().split('T')[0],
                },
                currentCropSeason: {
                  id: `crop-${fbUser.uid.slice(0, 6)}-1`,
                  cropName: 'Wheat (PBW-550)',
                  variety: 'PBW-550',
                  season: 'Rabi',
                  sowingDate: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
                  expectedHarvestDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
                  currentStage: 'Tillering / Branching',
                  targetYieldQuintals: 22,
                },
                waterSource: 'Borewell',
              },
            ],
          },
        ],
      };

      await firestoreService.saveFarmerProfile(fbUser.uid, initialFarmerProfile);

      const session: AuthSession = {
        token: await fbUser.getIdToken().catch(() => 'fb_token_' + fbUser.uid),
        expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
        user,
      };

      this.saveSession(session);

      return {
        success: true,
        message: 'Account created successfully in Firebase!',
        session,
        user,
        requiresOnboarding: true,
      };
    } catch (error: any) {
      console.error('Firebase signup error:', error);
      let errorMsg = 'Failed to create account. Please check your details.';
      if (error.code === 'auth/email-already-in-use') {
        errorMsg = 'An account with this email already exists. Please sign in instead.';
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMsg = 'Password should be at least 6 characters.';
      } else if (error.message) {
        errorMsg = error.message;
      }
      return {
        success: false,
        message: errorMsg,
      };
    }
  }

  // 2. Firebase Email & Password Login
  public async loginWithEmail(payload: EmailLoginPayload): Promise<AuthResponse> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, payload.email, payload.password);
      const fbUser = userCredential.user;

      // Fetch user from Firestore
      let userDoc = await firestoreService.getUserAccount(fbUser.uid);
      if (!userDoc) {
        userDoc = {
          id: fbUser.uid,
          email: fbUser.email || payload.email,
          name: fbUser.displayName || 'Farmer',
          preferredLanguage: 'hi',
          state: 'Punjab',
          district: 'Ludhiana',
          role: 'FARMER',
          isPhoneVerified: false,
          isEmailVerified: fbUser.emailVerified,
          isOnboarded: true,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        await firestoreService.saveUserAccount(userDoc);
      } else {
        userDoc.lastLoginAt = new Date().toISOString();
        await firestoreService.saveUserAccount(userDoc);
      }

      const session: AuthSession = {
        token: await fbUser.getIdToken().catch(() => 'fb_token_' + fbUser.uid),
        expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
        user: userDoc,
      };

      this.saveSession(session);

      return {
        success: true,
        message: 'Signed in successfully with Firebase.',
        session,
        user: userDoc,
        requiresOnboarding: !userDoc.isOnboarded,
      };
    } catch (error: any) {
      console.error('Firebase email login error:', error);
      let errorMsg = 'Incorrect email or password.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMsg = 'Incorrect email or password. If you do not have an account, please Register.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMsg = 'Too many attempts. Please try again in a few moments.';
      }
      return {
        success: false,
        message: errorMsg,
      };
    }
  }

  // 3. Google Sign-In via Firebase
  public async loginWithGoogle(): Promise<AuthResponse> {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const fbUser = userCredential.user;

      let userDoc = await firestoreService.getUserAccount(fbUser.uid);
      const isNew = !userDoc;
      if (!userDoc) {
        userDoc = {
          id: fbUser.uid,
          email: fbUser.email || undefined,
          name: fbUser.displayName || 'Farmer',
          avatarUrl: fbUser.photoURL || undefined,
          preferredLanguage: 'hi',
          state: 'Punjab',
          district: 'Ludhiana',
          role: 'FARMER',
          isPhoneVerified: false,
          isEmailVerified: true,
          isOnboarded: false,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        await firestoreService.saveUserAccount(userDoc);
      } else {
        userDoc.lastLoginAt = new Date().toISOString();
        await firestoreService.saveUserAccount(userDoc);
      }

      const session: AuthSession = {
        token: await fbUser.getIdToken().catch(() => 'fb_token_' + fbUser.uid),
        expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
        user: userDoc,
      };

      this.saveSession(session);

      return {
        success: true,
        message: 'Google Sign-In successful.',
        session,
        user: userDoc,
        requiresOnboarding: isNew,
      };
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      return {
        success: false,
        message: error.message || 'Google sign-in was canceled or failed.',
      };
    }
  }

  // 4. Send Mobile OTP
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
          message: data.error || 'Failed to send verification code.',
          cooldownSeconds: data.cooldownSeconds,
        };
      }

      return {
        success: true,
        message: data.message || 'OTP sent successfully',
        cooldownSeconds: data.cooldownSeconds || 60,
        demoOtpHint: data.demoOtpHint || '123456',
      };
    } catch (e: any) {
      return {
        success: true,
        message: 'Verification code sent (Code: 123456)',
        cooldownSeconds: 60,
        demoOtpHint: '123456',
      };
    }
  }

  // 5. Verify Mobile OTP
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
        // Also ensure user doc is in Firestore
        if (data.user) {
          await firestoreService.saveUserAccount(data.user).catch((e) => console.warn(e));
        }
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
          id: 'phone-farmer-' + payload.phone,
          phone: payload.phone,
          name: 'Farmer ' + payload.phone.slice(-4),
          preferredLanguage: 'hi',
          state: 'Punjab',
          district: 'Ludhiana',
          village: 'Kanganwal',
          role: 'FARMER',
          isPhoneVerified: true,
          isEmailVerified: false,
          isOnboarded: true,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };

        const session: AuthSession = {
          token: 'phone_token_' + Date.now(),
          expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
          user: demoUser,
        };

        await firestoreService.saveUserAccount(demoUser).catch((e) => console.warn(e));
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

  // 6. Forgot Password via Firebase Auth
  public async forgotPassword(payload: ForgotPasswordPayload): Promise<AuthResponse> {
    try {
      await sendPasswordResetEmail(auth, payload.email);
      return {
        success: true,
        message: 'Password reset link sent to your email address from Firebase.',
      };
    } catch (error: any) {
      console.warn('Firebase password reset error:', error);
      // Fallback to server endpoint
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
          message: 'If an account exists, password reset instructions have been sent.',
        };
      }
    }
  }

  // 7. Reset Password
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

  // 8. Update User Profile in Auth & Firestore
  public async updateUserProfile(updates: Partial<AuthUser>): Promise<AuthResponse> {
    const session = this.getSession();
    if (!session) {
      return { success: false, message: 'Not authenticated' };
    }

    const updatedUser: AuthUser = {
      ...session.user,
      ...updates,
      lastLoginAt: new Date().toISOString(),
    };

    try {
      await firestoreService.saveUserAccount(updatedUser);
      const updatedSession: AuthSession = {
        ...session,
        user: updatedUser,
      };
      this.saveSession(updatedSession);
      return { success: true, user: updatedUser, message: 'Profile updated in Firebase Firestore.' };
    } catch (e: any) {
      console.error('Failed to update profile:', e);
      const updatedSession: AuthSession = {
        ...session,
        user: updatedUser,
      };
      this.saveSession(updatedSession);
      return { success: true, user: updatedUser, message: 'Profile updated locally.' };
    }
  }

  // 9. Logout
  public async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase signOut error', e);
    }
    this.clearSession();
  }

  // Quick Demo Login for instant testing and evaluations
  public async loginWithDemoAccount(demoIndex: number): Promise<AuthSession> {
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

    // Save demo user & farmer to Firestore
    await firestoreService.saveUserAccount(user).catch(() => {});
    await firestoreService.saveFarmerProfile(user.id, demo.farmer).catch(() => {});
    await firestoreService.saveTasks(user.id, demo.tasks).catch(() => {});

    this.saveSession(session);
    return session;
  }
}

export const authService = new AuthService();

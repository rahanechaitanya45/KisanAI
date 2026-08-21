import React, { useState, useEffect } from 'react';
import {
  FarmerProfile,
  Farm,
  FarmPlot,
  LanguageCode,
  WeatherContext,
  FarmTask,
  FarmDiaryEntry,
  ExpertTicket,
  CropHealthAnalysis,
  SoilProfile,
} from './types/farming';
import { AuthUser, AuthSession } from './types/auth';
import { DEMO_FARMERS } from './data/demoFarmers';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ChatAssistant } from './components/ChatAssistant';
import { CropHealthScanner } from './components/CropHealthScanner';
import { CropPlanner } from './components/CropPlanner';
import { CropCalendar } from './components/CropCalendar';
import { FarmDiary } from './components/FarmDiary';
import { SoilHealth } from './components/SoilHealth';
import { MandiMarket } from './components/MandiMarket';
import { GovSchemes } from './components/GovSchemes';
import { CropLibrary } from './components/CropLibrary';
import { ExpertEscalation } from './components/ExpertEscalation';
import { OfficerDashboard } from './components/OfficerDashboard';
import { FarmerOnboarding } from './components/FarmerOnboarding';

// Authentication & Cloud Firestore Services
import { authService } from './services/authService';
import { firestoreService } from './services/firestoreService';
import { AuthLayout } from './components/auth/AuthLayout';
import { PhoneLoginForm } from './components/auth/PhoneLoginForm';
import { OTPVerification } from './components/auth/OTPVerification';
import { EmailLoginForm } from './components/auth/EmailLoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { ForgotPasswordForm } from './components/auth/ForgotPasswordForm';
import { OnboardingWizard } from './components/auth/OnboardingWizard';
import { UserProfilePage } from './components/auth/UserProfilePage';
import { PublicLanding } from './components/auth/PublicLanding';

const STORAGE_KEY_FARMER = 'kisanai_farmer_profile';
const STORAGE_KEY_TASKS = 'kisanai_farm_tasks';
const STORAGE_KEY_DIARY = 'kisanai_farm_diary';
const STORAGE_KEY_TICKETS = 'kisanai_expert_tickets';

type AuthViewMode =
  | 'app'
  | 'landing'
  | 'login-phone'
  | 'verify-otp'
  | 'login-email'
  | 'signup'
  | 'forgot-password'
  | 'onboarding-wizard';

export function App() {
  // 1. Authentication State
  const [session, setSession] = useState<AuthSession | null>(() => authService.getSession());
  const [authView, setAuthView] = useState<AuthViewMode>(() => (authService.getSession() ? 'app' : 'landing'));
  const [pendingPhone, setPendingPhone] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  // 2. Farmer Profile State
  const [farmer, setFarmer] = useState<FarmerProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FARMER);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEMO_FARMERS[0].farmer;
  });

  const [selectedFarmId, setSelectedFarmId] = useState<string>(
    farmer.farms[0]?.id || 'farm-1'
  );
  const [selectedPlotId, setSelectedPlotId] = useState<string>(
    farmer.farms[0]?.plots[0]?.id || 'plot-1'
  );

  // 3. Active Tab Routing
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // 4. Farm Tasks State
  const [tasks, setTasks] = useState<FarmTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TASKS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEMO_FARMERS[0].tasks;
  });

  // 5. Farm Diary State
  const [diaryEntries, setDiaryEntries] = useState<FarmDiaryEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DIARY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEMO_FARMERS[0].diary;
  });

  // 6. Expert Tickets State
  const [expertTickets, setExpertTickets] = useState<ExpertTicket[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TICKETS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEMO_FARMERS[0].tickets;
  });

  // 7. Weather Context
  const [weather, setWeather] = useState<WeatherContext>(DEMO_FARMERS[0].weather);

  // 8. Navigation payload transfers
  const [initialChatQuery, setInitialChatQuery] = useState<string>('');
  const [escalatedAnalysis, setEscalatedAnalysis] = useState<CropHealthAnalysis | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Online / Offline monitor
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen to Auth Service state updates
  useEffect(() => {
    const unsubscribe = authService.subscribe((user) => {
      if (user) {
        setSession(authService.getSession());
        // If current view is a login/landing view, move to app or wizard
        if (authView === 'landing' || authView === 'login-phone' || authView === 'login-email' || authView === 'signup') {
          if (!user.isOnboarded) {
            setAuthView('onboarding-wizard');
          } else {
            setAuthView('app');
          }
        }
      } else {
        setSession(null);
      }
    });
    return unsubscribe;
  }, [authView]);

  // Real-time Firestore Subscriptions when user is authenticated
  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;

    // 1. Subscribe to Farmer Profile in Firestore
    const unsubFarmer = firestoreService.subscribeFarmerProfile(userId, (remoteProfile) => {
      if (remoteProfile) {
        setFarmer(remoteProfile);
        if (remoteProfile.farms && remoteProfile.farms.length > 0) {
          if (!remoteProfile.farms.some((f) => f.id === selectedFarmId)) {
            setSelectedFarmId(remoteProfile.farms[0].id);
          }
          if (remoteProfile.farms[0]?.plots?.length > 0) {
            setSelectedPlotId(remoteProfile.farms[0].plots[0].id);
          }
        }
      }
    });

    // 2. Subscribe to Tasks in Firestore
    const unsubTasks = firestoreService.subscribeTasks(userId, (remoteTasks) => {
      if (remoteTasks && remoteTasks.length > 0) {
        setTasks(remoteTasks);
      }
    });

    // 3. Subscribe to Diary Entries in Firestore
    const unsubDiary = firestoreService.subscribeDiaryEntries(userId, (remoteDiary) => {
      if (remoteDiary && remoteDiary.length > 0) {
        setDiaryEntries(remoteDiary);
      }
    });

    // 4. Subscribe to Expert Tickets in Firestore
    const isOfficer = session?.user?.role === 'AGRICULTURAL_OFFICER';
    const unsubTickets = firestoreService.subscribeExpertTickets(userId, isOfficer, (remoteTickets) => {
      if (remoteTickets && remoteTickets.length > 0) {
        setExpertTickets(remoteTickets);
      }
    });

    return () => {
      unsubFarmer();
      unsubTasks();
      unsubDiary();
      unsubTickets();
    };
  }, [session?.user?.id, session?.user?.role]);

  // Save changes to localStorage as secondary backup
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FARMER, JSON.stringify(farmer));
    } catch (e) {}
  }, [farmer]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    } catch (e) {}
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DIARY, JSON.stringify(diaryEntries));
    } catch (e) {}
  }, [diaryEntries]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(expertTickets));
    } catch (e) {}
  }, [expertTickets]);

  // Derived selected farm & plot
  const selectedFarm =
    farmer.farms?.find((f) => f.id === selectedFarmId) || farmer.farms?.[0] || ({} as Farm);
  const selectedPlot =
    selectedFarm?.plots?.find((p) => p.id === selectedPlotId) ||
    selectedFarm?.plots?.[0] ||
    ({} as FarmPlot);

  // Authentication Handlers
  const handleSendOTP = async (phone: string) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await authService.sendOTP({ phone });
      setAuthLoading(false);
      if (res.success) {
        setPendingPhone(phone);
        setAuthView('verify-otp');
        return { success: true };
      } else {
        setAuthError(res.message || 'Failed to send OTP');
        return { success: false, message: res.message };
      }
    } catch (e: any) {
      setAuthLoading(false);
      setAuthError(e.message || 'Network error');
      return { success: false, message: e.message };
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await authService.verifyOTP({ phone: pendingPhone, otp });
      setAuthLoading(false);
      if (res.success && res.session) {
        setSession(res.session);
        if (res.user) {
          setFarmer((prev) => ({
            ...prev,
            name: res.user?.name || prev.name,
            phone: res.user?.phone || prev.phone,
            state: res.user?.state || prev.state,
            district: res.user?.district || prev.district,
            preferredLanguage: res.user?.preferredLanguage || prev.preferredLanguage,
          }));
        }
        if (res.requiresOnboarding || !res.user?.isOnboarded) {
          setAuthView('onboarding-wizard');
        } else {
          setAuthView('app');
        }
        return { success: true };
      } else {
        setAuthError(res.message || 'Invalid code');
        return {
          success: false,
          message: res.message,
          remainingAttempts: res.remainingAttempts,
        };
      }
    } catch (e: any) {
      setAuthLoading(false);
      setAuthError(e.message || 'Verification failed');
      return { success: false, message: e.message };
    }
  };

  const handleResendOTP = async () => {
    return handleSendOTP(pendingPhone);
  };

  const handleEmailLogin = async (credentials: { email: string; password: string }) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await authService.loginWithEmail(credentials);
      setAuthLoading(false);
      if (res.success && res.session) {
        setSession(res.session);
        if (res.user) {
          setFarmer((prev) => ({
            ...prev,
            name: res.user?.name || prev.name,
            phone: res.user?.phone || prev.phone,
            state: res.user?.state || prev.state,
            district: res.user?.district || prev.district,
            preferredLanguage: res.user?.preferredLanguage || prev.preferredLanguage,
          }));
        }
        if (res.requiresOnboarding || !res.user?.isOnboarded) {
          setAuthView('onboarding-wizard');
        } else {
          setAuthView('app');
        }
        return { success: true };
      } else {
        setAuthError(res.message || 'Login failed');
        return { success: false, message: res.message };
      }
    } catch (e: any) {
      setAuthLoading(false);
      setAuthError(e.message || 'Server error');
      return { success: false, message: e.message };
    }
  };

  const handleGoogleAuth = async () => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await authService.loginWithGoogle();
      setAuthLoading(false);
      if (res.success && res.session) {
        setSession(res.session);
        if (res.user) {
          setFarmer((prev) => ({
            ...prev,
            name: res.user?.name || prev.name,
            phone: res.user?.phone || prev.phone,
            state: res.user?.state || prev.state,
            district: res.user?.district || prev.district,
            preferredLanguage: res.user?.preferredLanguage || prev.preferredLanguage,
          }));
        }
        if (res.requiresOnboarding || !res.user?.isOnboarded) {
          setAuthView('onboarding-wizard');
        } else {
          setAuthView('app');
        }
        return { success: true };
      } else {
        setAuthError(res.message || 'Google login failed');
        return { success: false, message: res.message };
      }
    } catch (e: any) {
      setAuthLoading(false);
      setAuthError(e.message || 'Google login error');
      return { success: false, message: e.message };
    }
  };

  const handleSignup = async (payload: any) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await authService.signupWithEmail(payload);
      setAuthLoading(false);
      if (res.success && res.session) {
        setSession(res.session);
        if (res.user) {
          setFarmer((prev) => ({
            ...prev,
            name: res.user?.name || prev.name,
            phone: res.user?.phone || prev.phone,
            state: res.user?.state || prev.state,
            district: res.user?.district || prev.district,
            preferredLanguage: res.user?.preferredLanguage || prev.preferredLanguage,
          }));
        }
        setAuthView('onboarding-wizard');
        return { success: true };
      } else {
        setAuthError(res.message || 'Signup failed');
        return { success: false, message: res.message };
      }
    } catch (e: any) {
      setAuthLoading(false);
      setAuthError(e.message || 'Server error');
      return { success: false, message: e.message };
    }
  };

  const handleRequestPasswordReset = async (email: string) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await authService.forgotPassword({ email });
      setAuthLoading(false);
      return res;
    } catch (e: any) {
      setAuthLoading(false);
      return { success: false, message: e.message };
    }
  };

  const handleConfirmPasswordReset = async (payload: {
    email: string;
    code: string;
    newPassword: string;
  }) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await authService.resetPassword({
        email: payload.email,
        code: payload.code,
        newPassword: payload.newPassword,
      });
      setAuthLoading(false);
      return res;
    } catch (e: any) {
      setAuthLoading(false);
      return { success: false, message: e.message };
    }
  };

  const handleQuickDemoLogin = async (index: number) => {
    const demo = DEMO_FARMERS[index];
    if (!demo) return;

    setAuthLoading(true);
    const demoSession = await authService.loginWithDemoAccount(index);
    setSession(demoSession);
    setFarmer(demo.farmer);
    setSelectedFarmId(demo.farmer.farms[0]?.id || 'farm-1');
    setSelectedPlotId(demo.farmer.farms[0]?.plots[0]?.id || 'plot-1');
    setWeather(demo.weather);
    setTasks(demo.tasks);
    setDiaryEntries(demo.diary);
    setExpertTickets(demo.tickets);
    setAuthLoading(false);
    setAuthView('app');
  };

  const handleLogout = async () => {
    await authService.logout();
    setSession(null);
    setAuthView('landing');
  };

  const handleUpdateProfile = async (updated: FarmerProfile) => {
    setFarmer(updated);
    if (session?.user?.id) {
      await firestoreService.saveFarmerProfile(session.user.id, updated).catch(() => {});
      await authService.updateUserProfile({
        name: updated.name,
        phone: updated.phone,
        state: updated.state,
        district: updated.district,
        village: updated.village,
        preferredLanguage: updated.preferredLanguage,
        farmingExperienceYears: updated.farmingExperienceYears,
        isOnboarded: true,
      });
    }
  };

  // General App Handlers
  const handleSelectLanguage = (lang: LanguageCode) => {
    setFarmer((prev) => {
      const updated = { ...prev, preferredLanguage: lang };
      if (session?.user?.id) {
        firestoreService.saveFarmerProfile(session.user.id, updated).catch(() => {});
      }
      return updated;
    });
  };

  const handleLoadDemoFarmer = (index: number) => {
    handleQuickDemoLogin(index);
  };

  const handleToggleRole = (role: 'FARMER' | 'AGRICULTURAL_OFFICER') => {
    setFarmer((prev) => {
      const updated = { ...prev, role };
      if (session?.user?.id) {
        firestoreService.saveFarmerProfile(session.user.id, updated).catch(() => {});
      }
      return updated;
    });
    if (role === 'AGRICULTURAL_OFFICER') {
      setActiveTab('officer');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
      const modifiedTask = updated.find((t) => t.id === taskId);
      if (modifiedTask && session?.user?.id) {
        firestoreService.upsertTask(session.user.id, modifiedTask).catch(() => {});
      }
      return updated;
    });
  };

  const handleAddTask = (newTask: Partial<FarmTask>) => {
    const task: FarmTask = {
      id: 'task-' + Date.now(),
      farmId: newTask.farmId || selectedFarm.id,
      plotId: newTask.plotId || selectedPlot.id,
      title: newTask.title || 'Field Task',
      description: newTask.description || '',
      category: newTask.category || 'Fertigation',
      priority: newTask.priority || 'Normal',
      dueDate: newTask.dueDate || new Date().toISOString().split('T')[0],
      completed: false,
      whyExplanation: newTask.whyExplanation,
    };
    setTasks((prev) => [task, ...prev]);
    if (session?.user?.id) {
      firestoreService.upsertTask(session.user.id, task).catch(() => {});
    }
  };

  const handleAddDiaryEntry = (entry: FarmDiaryEntry) => {
    setDiaryEntries((prev) => [entry, ...prev]);
    if (session?.user?.id) {
      firestoreService.saveDiaryEntry(session.user.id, entry).catch(() => {});
    }
  };

  const handleDeleteDiaryEntry = (entryId: string) => {
    setDiaryEntries((prev) => prev.filter((e) => e.id !== entryId));
    if (session?.user?.id) {
      firestoreService.deleteDiaryEntry(entryId).catch(() => {});
    }
  };

  const handleUpdateSoil = (plotId: string, updatedSoil: SoilProfile) => {
    setFarmer((prev) => {
      const updated: FarmerProfile = {
        ...prev,
        farms: prev.farms.map((farm) => ({
          ...farm,
          plots: farm.plots.map((plot) =>
            plot.id === plotId ? { ...plot, soil: updatedSoil } : plot
          ),
        })),
      };
      if (session?.user?.id) {
        firestoreService.saveFarmerProfile(session.user.id, updated).catch(() => {});
      }
      return updated;
    });
  };

  const handleEscalateToExpert = (analysis: CropHealthAnalysis) => {
    setEscalatedAnalysis(analysis);
    setActiveTab('expert');
  };

  const handleSubmitTicket = (newTicket: ExpertTicket) => {
    setExpertTickets((prev) => [newTicket, ...prev]);
    if (session?.user?.id) {
      firestoreService.saveExpertTicket(session.user.id, newTicket).catch(() => {});
    }
  };

  const handleResolveTicket = (ticketId: string, prescription: string) => {
    setExpertTickets((prev) => {
      const updated = prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: 'RESOLVED' as const,
              responseFromOfficer: prescription,
              resolvedAt: new Date().toISOString(),
            }
          : t
      );
      const modifiedTicket = updated.find((t) => t.id === ticketId);
      if (modifiedTicket && session?.user?.id) {
        firestoreService.saveExpertTicket(session.user.id, modifiedTicket).catch(() => {});
      }
      return updated;
    });
  };

  const handleQuickAsk = (prompt: string) => {
    setInitialChatQuery(prompt);
    setActiveTab('chat');
  };

  const handleNavigateTab = (tab: string, extraData?: any) => {
    if (extraData?.initialPrompt) {
      setInitialChatQuery(extraData.initialPrompt);
    }
    setActiveTab(tab);
  };

  // --- RENDER ROUTING: AUTHENTICATION FLOWS ---

  // 1. Public Landing Page
  if (authView === 'landing') {
    return (
      <PublicLanding
        currentLanguage={farmer.preferredLanguage}
        onSelectLanguage={handleSelectLanguage}
        onOpenLogin={() => {
          setAuthError('');
          setAuthView('login-email');
        }}
        onOpenSignup={() => {
          setAuthError('');
          setAuthView('signup');
        }}
        onQuickDemoLogin={handleQuickDemoLogin}
      />
    );
  }

  // 2. Mobile OTP Phone Input
  if (authView === 'login-phone') {
    return (
      <AuthLayout
        title="Sign In to KisanAI"
        subtitle="Enter your mobile number to receive a secure OTP verification code."
        currentLanguage={farmer.preferredLanguage}
        onSelectLanguage={handleSelectLanguage}
        showBack={true}
        onBackToLanding={() => setAuthView('landing')}
      >
        <PhoneLoginForm
          onSendOTP={handleSendOTP}
          onSwitchToEmail={() => {
            setAuthError('');
            setAuthView('login-email');
          }}
          onSwitchToSignup={() => {
            setAuthError('');
            setAuthView('signup');
          }}
          onQuickDemoLogin={handleQuickDemoLogin}
          isLoading={authLoading}
          error={authError}
        />
      </AuthLayout>
    );
  }

  // 3. OTP Verification Form
  if (authView === 'verify-otp') {
    return (
      <AuthLayout
        title="Verify Mobile Number"
        subtitle="Security code verification for Indian Agricultural Identity."
        currentLanguage={farmer.preferredLanguage}
        onSelectLanguage={handleSelectLanguage}
        showBack={true}
        onBackToLanding={() => setAuthView('login-phone')}
      >
        <OTPVerification
          phone={pendingPhone}
          onVerifyOTP={handleVerifyOTP}
          onResendOTP={handleResendOTP}
          onChangePhone={() => setAuthView('login-phone')}
          isLoading={authLoading}
          error={authError}
        />
      </AuthLayout>
    );
  }

  // 4. Email & Password Login (Firebase Auth)
  if (authView === 'login-email') {
    return (
      <AuthLayout
        title="Sign In to KisanAI"
        subtitle="Access your farm advisory telemetry, crop health logs, and soil data."
        currentLanguage={farmer.preferredLanguage}
        onSelectLanguage={handleSelectLanguage}
        showBack={true}
        onBackToLanding={() => setAuthView('landing')}
      >
        <EmailLoginForm
          onLogin={handleEmailLogin}
          onGoogleLogin={handleGoogleAuth}
          onSwitchToPhone={() => {
            setAuthError('');
            setAuthView('login-phone');
          }}
          onSwitchToSignup={() => {
            setAuthError('');
            setAuthView('signup');
          }}
          onSwitchToForgotPassword={() => {
            setAuthError('');
            setAuthView('forgot-password');
          }}
          isLoading={authLoading}
          error={authError}
        />
      </AuthLayout>
    );
  }

  // 5. Signup Registration Form (Firebase Auth)
  if (authView === 'signup') {
    return (
      <AuthLayout
        title="Register Farm Account"
        subtitle="Join over 140,000+ Indian farmers using AI for high-yield precision agriculture."
        currentLanguage={farmer.preferredLanguage}
        onSelectLanguage={handleSelectLanguage}
        showBack={true}
        onBackToLanding={() => setAuthView('landing')}
      >
        <SignupForm
          onSignup={handleSignup}
          onGoogleSignup={handleGoogleAuth}
          onSwitchToLogin={() => {
            setAuthError('');
            setAuthView('login-email');
          }}
          isLoading={authLoading}
          error={authError}
          defaultLanguage={farmer.preferredLanguage}
        />
      </AuthLayout>
    );
  }

  // 6. Forgot Password Recovery
  if (authView === 'forgot-password') {
    return (
      <AuthLayout
        title="Recover Password"
        subtitle="Reset your password using an email verification code."
        currentLanguage={farmer.preferredLanguage}
        onSelectLanguage={handleSelectLanguage}
        showBack={true}
        onBackToLanding={() => setAuthView('login-email')}
      >
        <ForgotPasswordForm
          onRequestReset={handleRequestPasswordReset}
          onConfirmReset={handleConfirmPasswordReset}
          onBackToLogin={() => {
            setAuthError('');
            setAuthView('login-email');
          }}
          isLoading={authLoading}
          error={authError}
        />
      </AuthLayout>
    );
  }

  // 7. Progressive Onboarding Wizard (Post-registration setup of farm, crops, soil)
  if (authView === 'onboarding-wizard') {
    return (
      <OnboardingWizard
        initialProfile={farmer}
        onComplete={(newProfile) => {
          handleUpdateProfile(newProfile);
          if (newProfile.farms && newProfile.farms.length > 0) {
            setSelectedFarmId(newProfile.farms[0].id);
            if (newProfile.farms[0].plots?.length > 0) {
              setSelectedPlotId(newProfile.farms[0].plots[0].id);
            }
          }
          setAuthView('app');
        }}
        onSkipToDashboard={() => setAuthView('app')}
      />
    );
  }

  // --- 8. MAIN AUTHENTICATED AGRITECH APPLICATION ---
  return (
    <div className="min-h-screen bg-[#f8faf6] text-stone-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-950 antialiased">
      {/* Universal Multilingual Header with User Authentication Profile Menu */}
      <Header
        farmer={farmer}
        authUser={session?.user || null}
        selectedFarm={selectedFarm}
        selectedPlot={selectedPlot}
        onSelectFarm={setSelectedFarmId}
        onSelectPlot={setSelectedPlotId}
        onSelectLanguage={handleSelectLanguage}
        onLoadDemoFarmer={handleLoadDemoFarmer}
        onToggleRole={handleToggleRole}
        onOpenOnboarding={() => setShowOnboarding(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        isOnline={isOnline}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 pb-12">
        {activeTab === 'dashboard' && (
          <Dashboard
            farmer={farmer}
            selectedFarm={selectedFarm}
            selectedPlot={selectedPlot}
            weather={weather}
            tasks={tasks}
            onCompleteTask={handleCompleteTask}
            onNavigateTab={setActiveTab}
            onQuickAsk={handleQuickAsk}
          />
        )}

        {activeTab === 'chat' && (
          <ChatAssistant
            farmer={farmer}
            selectedFarm={selectedFarm}
            selectedPlot={selectedPlot}
            weather={weather}
            initialQuery={initialChatQuery}
            onClearInitialQuery={() => setInitialChatQuery('')}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'scanner' && (
          <CropHealthScanner
            farmer={farmer}
            selectedPlot={selectedPlot}
            weather={weather}
            onEscalateToExpert={handleEscalateToExpert}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'planner' && (
          <CropPlanner
            farmer={farmer}
            selectedPlot={selectedPlot}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'calendar' && (
          <CropCalendar
            farmer={farmer}
            selectedPlot={selectedPlot}
            weather={weather}
            tasks={tasks}
            onCompleteTask={handleCompleteTask}
            onAddTask={handleAddTask}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'diary' && (
          <FarmDiary
            farmer={farmer}
            selectedPlot={selectedPlot}
            entries={diaryEntries}
            onAddEntry={handleAddDiaryEntry}
            onDeleteEntry={handleDeleteDiaryEntry}
          />
        )}

        {activeTab === 'soil' && (
          <SoilHealth
            farmer={farmer}
            selectedPlot={selectedPlot}
            onUpdateSoil={handleUpdateSoil}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'mandi' && (
          <MandiMarket
            farmer={farmer}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {activeTab === 'schemes' && (
          <GovSchemes
            farmer={farmer}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {activeTab === 'library' && (
          <CropLibrary
            farmer={farmer}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'expert' && (
          <ExpertEscalation
            farmer={farmer}
            selectedPlot={selectedPlot}
            weather={weather}
            escalatedAnalysis={escalatedAnalysis}
            tickets={expertTickets}
            onSubmitTicket={handleSubmitTicket}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'officer' && (
          <OfficerDashboard
            farmer={farmer}
            tickets={expertTickets}
            onResolveTicket={handleResolveTicket}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'profile' && (
          <UserProfilePage
            farmer={farmer}
            authUser={session?.user || null}
            onUpdateProfile={handleUpdateProfile}
            onLogout={handleLogout}
            onNavigateTab={setActiveTab}
          />
        )}
      </main>

      {/* Onboarding / Add Plot Modal */}
      {showOnboarding && (
        <FarmerOnboarding
          existingProfile={farmer}
          onComplete={(newProfile) => {
            handleUpdateProfile(newProfile);
            setSelectedFarmId(newProfile.farms[0]?.id || 'farm-1');
            setSelectedPlotId(newProfile.farms[0]?.plots[0]?.id || 'plot-1');
            setShowOnboarding(false);
          }}
          onCancel={() => setShowOnboarding(false)}
        />
      )}

      {/* Footer in professional agritech theme */}
      <footer className="mt-auto border-t border-stone-200 bg-white py-6 text-stone-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-stone-900 tracking-tight flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-700"></span>
              KisanAI Platform
            </span>
            <span className="text-stone-300">•</span>
            <span className="text-stone-600">Dedicated to Indian Farmers (किसान सेवा)</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-500">
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              Firebase: kisanai-8b20e
            </span>
            <span className="px-2.5 py-1 rounded-full bg-stone-100 border border-stone-200 font-medium">
              13 Regional Languages
            </span>
            <span className="px-2.5 py-1 rounded-full bg-stone-100 border border-stone-200 font-medium">
              ICAR & KVK Integrated
            </span>
            <span className="px-2.5 py-1 rounded-full bg-stone-100 border border-stone-200 font-medium">
              Kisan Call Centre: 1800-180-1551
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

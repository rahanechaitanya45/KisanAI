import React from 'react';
import { Sprout, ShieldCheck, Globe, Sparkles, CheckCircle2, ArrowLeft, PhoneCall } from 'lucide-react';
import { LanguageCode } from '../../types/farming';
import { SUPPORTED_LANGUAGES, getTranslation } from '../../data/i18n';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  currentLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  onBackToLanding?: () => void;
  showBack?: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  currentLanguage,
  onSelectLanguage,
  onBackToLanding,
  showBack = false,
}) => {
  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="min-h-screen bg-[#f8faf6] flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-950">
      {/* Top Bar with Language Selector & Back Button */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-stone-200/80 py-3 px-4 sm:px-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBack && onBackToLanding && (
              <button
                id="auth-back-btn"
                onClick={onBackToLanding}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-600 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
                title="Back to home"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                <Sprout className="w-5 h-5 text-emerald-100" />
              </div>
              <div>
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-stone-900">
                  Kisan<span className="text-emerald-700 font-black">AI</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  किसान सेवा
                </span>
              </div>
            </div>
          </div>

          {/* Regional Language Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-stone-600 font-medium">
              <Globe className="w-3.5 h-3.5 text-emerald-700" />
              <select
                id="auth-lang-select"
                value={currentLanguage}
                onChange={(e) => onSelectLanguage(e.target.value as LanguageCode)}
                aria-label="Select Language"
                className="bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.nativeLabel} ({l.label})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Split Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Story / Agritech Value Proposition */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-6 pr-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold w-fit shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Pan-India Agricultural AI Intelligence</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl xl:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
                Empowering Indian Farmers with Personalized Agronomy
              </h1>
              <p className="text-stone-600 text-base leading-relaxed">
                Connect your plot soil telemetry, local weather forecasts, and ICAR-backed crop advisories in your own regional language.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <div className="p-3.5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-1">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>100% Free for Farmers</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Zero subscription fees for standard crop advisories.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-1">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                  <Globe className="w-4 h-4 text-emerald-700" />
                  <span>13 Indian Languages</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Voice and text intelligence in your mother tongue.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-1">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>ICAR & KVK Integrated</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Direct escalation to agricultural extension officers.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-1">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>Plot-Level Precision</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Soil-specific spray forecasts and stage-based nutrients.
                </p>
              </div>
            </div>

            {/* Helpline Banner */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-950 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-emerald-700" />
                <span className="font-semibold">Kisan Call Centre Toll-Free</span>
              </div>
              <span className="font-mono font-bold bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                1800-180-1551
              </span>
            </div>
          </div>

          {/* Right Column: Active Auth Form Card */}
          <div className="w-full lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md bg-white rounded-3xl border border-stone-200/90 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] p-6 sm:p-8 space-y-6">
              {/* Form Title & Context */}
              <div className="space-y-1 text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                  {title}
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                  {subtitle}
                </p>
              </div>

              {/* Injected Form Component */}
              <div>{children}</div>
            </div>
          </div>
        </div>
      </main>

      {/* Simplified Footer */}
      <footer className="w-full border-t border-stone-200/80 bg-white py-4 px-4 sm:px-8 text-center text-xs text-stone-500">
        <p>
          KisanAI Farming Companion • Empowering agricultural families with real-time agronomy.
        </p>
      </footer>
    </div>
  );
};

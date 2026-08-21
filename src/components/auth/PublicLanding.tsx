import React from 'react';
import {
  Sprout,
  Sparkles,
  Phone,
  Camera,
  Landmark,
  Globe,
  ArrowRight,
  Users,
  TrendingUp,
  CloudRain,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { LanguageCode } from '../../types/farming';
import { SUPPORTED_LANGUAGES } from '../../data/i18n';
import { DEMO_FARMERS } from '../../data/demoFarmers';
import { useI18n } from '../../context/I18nContext';

interface PublicLandingProps {
  currentLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  onQuickDemoLogin: (index: number) => void;
}

export const PublicLanding: React.FC<PublicLandingProps> = ({
  currentLanguage,
  onSelectLanguage,
  onOpenLogin,
  onOpenSignup,
  onQuickDemoLogin,
}) => {
  const { t, setLanguage, lookupAgro } = useI18n();

  const handleLangChange = (newLang: LanguageCode) => {
    setLanguage(newLang);
    onSelectLanguage(newLang);
  };

  return (
    <div className="min-h-screen bg-[#f8faf6] flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-950">
      {/* Top Public Navigation - Light Aesthetic */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <Sprout className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-stone-900">
                {t('app.name')}
              </span>
              <span className="ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 hidden sm:inline-block">
                {t('app.badge')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-stone-500 hidden sm:inline" />
              <select
                id="landing-lang-select"
                value={currentLanguage}
                onChange={(e) => handleLangChange(e.target.value as LanguageCode)}
                aria-label="Select Language"
                className="bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-xs font-bold text-stone-800 focus:ring-2 focus:ring-emerald-700 cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.nativeLabel} ({l.label})
                  </option>
                ))}
              </select>
            </div>

            <Button
              id="landing-login-btn"
              variant="outline"
              size="sm"
              onClick={onOpenLogin}
              className="text-emerald-800 border-emerald-300 hover:bg-emerald-50"
            >
              {t('auth.login')}
            </Button>

            <Button
              id="landing-signup-btn"
              variant="primary"
              size="sm"
              onClick={onOpenSignup}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              {t('auth.register')}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Subtle Background Glow Blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>{t('app.subtitle')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight leading-tight">
            {t('app.tagline')}
          </h1>

          <p className="text-sm sm:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
            {t('app.description')}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <Button
              id="hero-get-started-btn"
              variant="primary"
              size="lg"
              onClick={onOpenSignup}
              icon={<ArrowRight className="w-5 h-5" />}
            >
              {t('auth.register')}
            </Button>
            <Button
              id="hero-phone-login-btn"
              variant="outline"
              size="lg"
              onClick={onOpenLogin}
              icon={<Phone className="w-4 h-4" />}
            >
              {t('auth.phoneLogin')}
            </Button>
          </div>
        </div>

        {/* Quick Demo Jump Section */}
        <div className="mt-12 p-6 rounded-3xl bg-white border border-stone-200/90 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.05)] max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
            <div>
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-700" />
                <span>{t('auth.quickDemo')}</span>
              </h3>
              <p className="text-xs text-stone-500">
                {t('auth.quickDemoDesc')}
              </p>
            </div>
            <Badge variant="success" size="sm">
              {t('common.active')}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            {DEMO_FARMERS.map((demo, idx) => {
              const demoCropName = demo.farmer.farms[0]?.plots[0]?.currentCropSeason?.cropName || '';
              return (
                <button
                  key={demo.farmer.id}
                  onClick={() => onQuickDemoLogin(idx)}
                  className="p-3.5 rounded-2xl bg-[#f9faf7] hover:bg-emerald-50/70 border border-stone-200/90 hover:border-emerald-300 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-stone-900 group-hover:text-emerald-950">
                      {demo.farmer.name}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-stone-200 text-stone-700">
                      {demo.farmer.farms[0]?.totalAreaAcres} {t('common.acre')}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    {demo.farmer.district}, {demo.farmer.state}
                  </p>
                  <div className="mt-2 text-[11px] font-semibold text-emerald-800 flex items-center justify-between">
                    <span>{lookupAgro('crops', demoCropName)}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          <Card variant="standard" padding="md">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center mb-3">
              <Camera className="w-5 h-5 text-emerald-700" />
            </div>
            <h4 className="text-sm font-bold text-stone-900">{t('nav.cropHealth')}</h4>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              {t('scanner.diagnosisSubtitle')}
            </p>
          </Card>

          <Card variant="standard" padding="md">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-amber-700" />
            </div>
            <h4 className="text-sm font-bold text-stone-900">{t('nav.cropPlanner')}</h4>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              {t('dashboard.cropPlannerAction')}
            </p>
          </Card>

          <Card variant="standard" padding="md">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200 text-sky-800 flex items-center justify-center mb-3">
              <CloudRain className="w-5 h-5 text-sky-700" />
            </div>
            <h4 className="text-sm font-bold text-stone-900">{t('nav.weather')}</h4>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              {t('weather.syncedWithDoppler')}
            </p>
          </Card>

          <Card variant="standard" padding="md">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 text-purple-800 flex items-center justify-center mb-3">
              <Landmark className="w-5 h-5 text-purple-700" />
            </div>
            <h4 className="text-sm font-bold text-stone-900">{t('nav.govSchemes')}</h4>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              {t('dashboard.govSchemesAction')}
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200/80 bg-white py-6 text-stone-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-stone-900 tracking-tight flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-700"></span>
              {t('app.name')}
            </span>
            <span className="text-stone-300">•</span>
            <span className="text-stone-600">{t('app.badge')}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-500">
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
};

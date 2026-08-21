import React, { useState } from 'react';
import {
  Sprout,
  Globe,
  MapPin,
  Sparkles,
  Users,
  ChevronDown,
  ShieldCheck,
  Building2,
  Plus,
  Home,
  Camera,
  Calendar,
  BookOpen,
  DollarSign,
  Landmark,
  Layers,
  FileText,
  UserCheck,
  User,
} from 'lucide-react';
import { FarmerProfile, LanguageCode, Farm, FarmPlot } from '../types/farming';
import { AuthUser } from '../types/auth';
import { DEMO_FARMERS } from '../data/demoFarmers';
import { UserMenu } from './auth/UserMenu';
import { useI18n } from '../context/I18nContext';

interface HeaderProps {
  farmer: FarmerProfile;
  authUser: AuthUser | null;
  selectedFarm: Farm;
  selectedPlot: FarmPlot;
  onSelectFarm: (farmId: string) => void;
  onSelectPlot: (plotId: string) => void;
  onSelectLanguage: (lang: LanguageCode) => void;
  onLoadDemoFarmer: (demoIndex: number) => void;
  onToggleRole: (role: 'FARMER' | 'AGRICULTURAL_OFFICER') => void;
  onOpenOnboarding: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  farmer,
  authUser,
  selectedFarm,
  selectedPlot,
  onSelectFarm,
  onSelectPlot,
  onSelectLanguage,
  onLoadDemoFarmer,
  onToggleRole,
  onOpenOnboarding,
  activeTab,
  setActiveTab,
  onLogout,
  isOnline,
}) => {
  const { t, language, setLanguage, supportedLanguages, lookupAgro } = useI18n();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showFarmMenu, setShowFarmMenu] = useState(false);

  const currentLang =
    supportedLanguages.find((l) => l.code === language) || supportedLanguages[0];

  const navItems = [
    { id: 'dashboard', label: t('nav.home'), icon: Home },
    { id: 'chat', label: t('nav.aiAssistant'), icon: Sparkles, highlight: true },
    { id: 'scanner', label: t('nav.cropHealth'), icon: Camera },
    { id: 'planner', label: t('nav.cropPlanner'), icon: Sprout },
    { id: 'calendar', label: t('nav.cropCalendar'), icon: Calendar },
    { id: 'diary', label: t('nav.farmDiary'), icon: FileText },
    { id: 'soil', label: t('nav.soilHealth'), icon: Layers },
    { id: 'mandi', label: t('nav.mandiMarket'), icon: DollarSign },
    { id: 'schemes', label: t('nav.govSchemes'), icon: Landmark },
    { id: 'library', label: t('nav.cropLibrary'), icon: BookOpen },
    { id: 'expert', label: t('nav.expertSupport'), icon: UserCheck, isExpert: true },
    { id: 'profile', label: t('nav.profile'), icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
      {/* Top Application Bar */}
      <div className="bg-[#fcfdfa] border-b border-stone-200/70 text-stone-800">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <button
              id="brand-logo"
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none transition-transform duration-300 ease-out hover:scale-105 active:scale-95 animate-brand-spin-in origin-left"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-100 group-hover:border-emerald-300 group-hover:shadow-md transition-all duration-300 shadow-xs">
                <Sprout className="w-5 h-5 text-emerald-700 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-stone-900 flex items-center group-hover:text-emerald-950 transition-colors">
                    {t('app.name')}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 hidden sm:inline-flex items-center gap-1 group-hover:bg-emerald-100 transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    ICAR & KVK
                  </span>
                  {!isOnline && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      {t('common.offline')}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-500 hidden sm:block font-medium">
                  {t('app.tagline')}
                </p>
              </div>
            </button>
          </div>

          {/* Controls & Quick Actions */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Farm & Plot Switcher Dropdown */}
            <div className="relative">
              <button
                id="farm-selector-btn"
                onClick={() => {
                  setShowFarmMenu(!showFarmMenu);
                  setShowLangMenu(false);
                  setShowDemoMenu(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200/90 text-stone-800 text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <div className="text-left leading-tight">
                  <p className="text-[10px] text-stone-400 font-medium">
                    {selectedFarm?.name || t('nav.switchFarm')}
                  </p>
                  <p className="text-xs font-bold text-stone-800 truncate max-w-[110px] sm:max-w-[140px]">
                    {selectedPlot?.name || 'Main Plot'}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              </button>

              {showFarmMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white text-stone-900 rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="px-3.5 py-1.5 border-b border-stone-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      {t('profile.landHoldings')}
                    </span>
                    <button
                      onClick={() => {
                        setShowFarmMenu(false);
                        onOpenOnboarding();
                      }}
                      className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {t('nav.addPlot')}
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto p-1.5 space-y-1">
                    {farmer.farms?.map((farm) => (
                      <div key={farm.id} className="p-1">
                        <div className="px-2 py-1 text-xs font-bold text-emerald-800 flex items-center justify-between">
                          <span>{farm.name}</span>
                          <span className="text-[11px] font-normal text-stone-500">
                            {farm.district}, {farm.state}
                          </span>
                        </div>
                        <div className="space-y-1 mt-0.5">
                          {farm.plots.map((plot) => (
                            <button
                              key={plot.id}
                              onClick={() => {
                                onSelectFarm(farm.id);
                                onSelectPlot(plot.id);
                                setShowFarmMenu(false);
                              }}
                              className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                                plot.id === selectedPlot?.id
                                  ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                                  : 'hover:bg-stone-50 text-stone-700'
                              }`}
                            >
                              <span className="flex items-center gap-1.5">
                                <span className="text-emerald-700">🌱</span>
                                <span>{plot.name} ({plot.areaAcres} {t('common.acre')})</span>
                              </span>
                              <span className="text-[11px] text-stone-500">
                                {plot.currentCropSeason?.cropName
                                  ? lookupAgro('crops', plot.currentCropSeason.cropName)
                                  : t('common.noData')}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                id="lang-selector-btn"
                onClick={() => {
                  setShowLangMenu(!showLangMenu);
                  setShowFarmMenu(false);
                  setShowDemoMenu(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200 text-emerald-950 text-xs font-semibold transition-all shadow-xs cursor-pointer"
                title={t('profile.selectLanguage')}
              >
                <Globe className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="font-bold text-emerald-950">{currentLang.nativeName}</span>
                <ChevronDown className="w-3 h-3 text-emerald-700 shrink-0" />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white text-stone-900 rounded-2xl shadow-2xl border border-stone-200 py-2 z-50 grid grid-cols-2 gap-1.5 p-2.5 animate-in fade-in">
                  {supportedLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        onSelectLanguage(lang.code);
                        setShowLangMenu(false);
                      }}
                      className={`px-3 py-2 rounded-xl text-left text-xs flex flex-col transition-all cursor-pointer ${
                        lang.code === language
                          ? 'bg-emerald-700 text-white font-bold shadow-xs'
                          : 'hover:bg-emerald-50 text-stone-800'
                      }`}
                    >
                      <span className="font-bold leading-tight text-[13px]">{lang.nativeName}</span>
                      <span
                        className={`text-[10px] ${
                          lang.code === language ? 'text-emerald-100' : 'text-stone-500'
                        }`}
                      >
                        {lang.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pan-India Archetype Demo Switcher */}
            <div className="relative">
              <button
                id="demo-profiles-btn"
                onClick={() => {
                  setShowDemoMenu(!showDemoMenu);
                  setShowLangMenu(false);
                  setShowFarmMenu(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100/70 text-amber-900 border border-amber-200 text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span className="hidden md:inline">{t('nav.demoProfiles')}</span>
                <ChevronDown className="w-3 h-3 text-amber-700 shrink-0" />
              </button>

              {showDemoMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white text-stone-900 rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in">
                  <div className="px-3.5 py-1.5 border-b border-stone-100">
                    <p className="text-xs font-bold text-stone-900">
                      {t('auth.selectArchetype')}
                    </p>
                    <p className="text-[11px] text-stone-500">
                      {t('auth.quickDemoLogin')}
                    </p>
                  </div>
                  <div className="p-1.5 space-y-1 max-h-72 overflow-y-auto">
                    {DEMO_FARMERS.map((demo, idx) => (
                      <button
                        key={demo.farmer.id}
                        onClick={() => {
                          onLoadDemoFarmer(idx);
                          setShowDemoMenu(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          farmer.id === demo.farmer.id
                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold'
                            : 'hover:bg-stone-50 text-stone-800'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-stone-900">{demo.farmer.name}</p>
                          <p className="text-[11px] text-stone-500">
                            {demo.farmer.district}, {demo.farmer.state} •{' '}
                            {lookupAgro(
                              'crops',
                              demo.farmer.farms[0]?.plots[0]?.currentCropSeason?.cropName || ''
                            )}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">
                          {demo.farmer.farms[0]?.totalAreaAcres} {t('common.acre')}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Role Switcher (Farmer vs KVK Officer) */}
            <button
              id="role-switch-btn"
              onClick={() =>
                onToggleRole(
                  farmer.role === 'FARMER' ? 'AGRICULTURAL_OFFICER' : 'FARMER'
                )
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                farmer.role === 'AGRICULTURAL_OFFICER'
                  ? 'bg-purple-50 border-purple-200 text-purple-900 hover:bg-purple-100/70'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100/70'
              }`}
              title="Toggle Farmer View vs KVK Agricultural Officer Extension Console"
            >
              {farmer.role === 'AGRICULTURAL_OFFICER' ? (
                <>
                  <Building2 className="w-3.5 h-3.5 text-purple-700" />
                  <span>{t('nav.officerDashboard')}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="hidden sm:inline">{t('nav.krishiMitra')}</span>
                </>
              )}
            </button>

            {/* Authenticated User Menu */}
            <UserMenu
              farmer={farmer}
              authUser={authUser}
              onNavigateTab={setActiveTab}
              onLogout={onLogout}
            />
          </div>
        </div>
      </div>

      {/* Navigation Sub-Bar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 scrollbar-none text-xs sm:text-sm font-semibold">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-xs font-bold'
                    : item.highlight
                    ? 'bg-emerald-50/80 text-emerald-800 hover:bg-emerald-100/80 border border-emerald-200/80'
                    : item.isExpert
                    ? 'text-amber-900 bg-amber-50/60 hover:bg-amber-100/60 border border-amber-200/60'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? 'text-white'
                      : item.highlight
                      ? 'text-emerald-700'
                      : item.isExpert
                      ? 'text-amber-700'
                      : 'text-stone-400'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}

          {farmer.role === 'AGRICULTURAL_OFFICER' && (
            <button
              id="nav-officer"
              onClick={() => setActiveTab('officer')}
              className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'officer'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100'
              }`}
            >
              <Building2 className="w-4 h-4 text-purple-700" />
              <span>{t('nav.officerDashboard')}</span>
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

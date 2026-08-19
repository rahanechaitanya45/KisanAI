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
  PhoneCall,
  Check,
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
import { SUPPORTED_LANGUAGES, getTranslation } from '../data/i18n';
import { DEMO_FARMERS } from '../data/demoFarmers';
import { UserMenu } from './auth/UserMenu';

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
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showFarmMenu, setShowFarmMenu] = useState(false);

  const currentLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === farmer.preferredLanguage) ||
    SUPPORTED_LANGUAGES[0];

  const navItems = [
    { id: 'dashboard', label: getTranslation(farmer.preferredLanguage, 'todaySummary'), icon: Home },
    { id: 'chat', label: 'AI Assistant', icon: Sparkles, highlight: true },
    { id: 'scanner', label: getTranslation(farmer.preferredLanguage, 'takePhoto'), icon: Camera },
    { id: 'planner', label: getTranslation(farmer.preferredLanguage, 'cropPlanner'), icon: Sprout },
    { id: 'calendar', label: getTranslation(farmer.preferredLanguage, 'cropCalendar'), icon: Calendar },
    { id: 'diary', label: getTranslation(farmer.preferredLanguage, 'farmDiary'), icon: FileText },
    { id: 'soil', label: getTranslation(farmer.preferredLanguage, 'soilHealth'), icon: Layers },
    { id: 'mandi', label: getTranslation(farmer.preferredLanguage, 'mandiMarket'), icon: DollarSign },
    { id: 'schemes', label: getTranslation(farmer.preferredLanguage, 'govSchemes'), icon: Landmark },
    { id: 'library', label: getTranslation(farmer.preferredLanguage, 'cropLibrary'), icon: BookOpen },
    { id: 'expert', label: getTranslation(farmer.preferredLanguage, 'expertEscalation'), icon: UserCheck, isExpert: true },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
      {/* Top Application Bar - Light Aesthetic */}
      <div className="bg-[#fcfdfa] border-b border-stone-200/70 text-stone-800">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <button
              id="brand-logo"
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-100/70 transition-all shadow-xs">
                <Sprout className="w-5 h-5 text-emerald-700 group-hover:scale-105 transition-transform" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-stone-900 flex items-center">
                    Kisan<span className="text-emerald-700 font-black">AI</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 hidden sm:inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    ICAR & KVK Integrated
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 hidden sm:block font-medium">
                  {getTranslation(farmer.preferredLanguage, 'appTagline')}
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
                    {selectedFarm?.name || 'My Farm'}
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
                      Farms & Plots
                    </span>
                    <button
                      onClick={() => {
                        setShowFarmMenu(false);
                        onOpenOnboarding();
                      }}
                      className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Plot
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
                                <span>{plot.name} ({plot.areaAcres} ac)</span>
                              </span>
                              <span className="text-[11px] text-stone-500">
                                {plot.currentCropSeason?.cropName || 'Empty'}
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

            {/* Language Selector */}
            <div className="relative">
              <button
                id="lang-selector-btn"
                onClick={() => {
                  setShowLangMenu(!showLangMenu);
                  setShowFarmMenu(false);
                  setShowDemoMenu(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200/90 text-stone-800 text-xs font-semibold transition-all shadow-xs cursor-pointer"
                title="Select language / भाषा चुनें (13 Indian Languages)"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="font-semibold text-stone-800">{currentLang.nativeLabel}</span>
                <ChevronDown className="w-3 h-3 text-stone-400 shrink-0" />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white text-stone-900 rounded-2xl shadow-xl border border-stone-200 py-2 z-50 grid grid-cols-2 gap-1 p-2 animate-in fade-in">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onSelectLanguage(lang.code);
                        setShowLangMenu(false);
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-left text-xs flex flex-col transition-colors cursor-pointer ${
                        lang.code === farmer.preferredLanguage
                          ? 'bg-emerald-700 text-white font-bold'
                          : 'hover:bg-stone-100 text-stone-800'
                      }`}
                    >
                      <span className="font-bold leading-tight">{lang.nativeLabel}</span>
                      <span
                        className={`text-[10px] ${
                          lang.code === farmer.preferredLanguage
                            ? 'text-emerald-100'
                            : 'text-stone-500'
                        }`}
                      >
                        {lang.label}
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
                <span className="hidden md:inline">Demo Switcher</span>
                <ChevronDown className="w-3 h-3 text-amber-700 shrink-0" />
              </button>

              {showDemoMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white text-stone-900 rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in">
                  <div className="px-3.5 py-1.5 border-b border-stone-100">
                    <p className="text-xs font-bold text-stone-900">
                      Pan-India Agricultural Archetypes
                    </p>
                    <p className="text-[11px] text-stone-500">
                      Switch agro-climatic zones, soils, and regional crops
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
                            {demo.farmer.district}, {demo.farmer.state} • {demo.farmer.farms[0]?.plots[0]?.currentCropSeason?.cropName}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">
                          {demo.farmer.farms[0]?.totalAreaAcres} Ac
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
                  <span>KVK Officer</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="hidden sm:inline">Farmer</span>
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
              <span>{getTranslation(farmer.preferredLanguage, 'officerDashboard')}</span>
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

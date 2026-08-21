import React, { useState } from 'react';
import {
  Phone,
  MapPin,
  ShieldCheck,
  Building2,
  Save,
  LogOut,
  Sprout,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { SectionHeader } from '../ui/SectionHeader';
import { FarmerProfile, LanguageCode } from '../../types/farming';
import { AuthUser } from '../../types/auth';
import { SUPPORTED_LANGUAGES } from '../../data/i18n';
import { INDIA_AGRO_STATES } from '../../data/indiaAgroData';
import { useI18n } from '../../context/I18nContext';

interface UserProfilePageProps {
  farmer: FarmerProfile;
  authUser: AuthUser | null;
  onUpdateProfile: (updatedProfile: FarmerProfile) => void;
  onLogout: () => void;
  onNavigateTab: (tab: string) => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({
  farmer,
  authUser,
  onUpdateProfile,
  onLogout,
  onNavigateTab,
}) => {
  const { t, language, setLanguage, lookupAgro } = useI18n();
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'farms' | 'security' | 'language'>('profile');

  // Edit States
  const [name, setName] = useState(farmer.name);
  const [phone, setPhone] = useState(farmer.phone);
  const [email, setEmail] = useState(authUser?.email || '');
  const [state, setState] = useState(farmer.state);
  const [district, setDistrict] = useState(farmer.district);
  const [village, setVillage] = useState(farmer.village || '');
  const [experience, setExperience] = useState(farmer.farmingExperienceYears || 12);
  const [preferredLanguage, setPreferredLanguage] = useState<LanguageCode>(farmer.preferredLanguage || language);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const currentState = INDIA_AGRO_STATES.find((s) => s.name === state) || INDIA_AGRO_STATES[0];

  const handleStateChange = (newState: string) => {
    setState(newState);
    const foundState = INDIA_AGRO_STATES.find((s) => s.name === newState);
    if (foundState && foundState.districts.length > 0) {
      setDistrict(foundState.districts[0].name);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setSaveSuccess(false);

    setTimeout(() => {
      const updatedFarms = farmer.farms?.map((f, idx) => {
        if (idx === 0 || f.isPrimary) {
          return {
            ...f,
            state,
            district,
            village: village || f.village,
          };
        }
        return f;
      }) || [];

      const updated: FarmerProfile = {
        ...farmer,
        name,
        phone,
        state,
        district,
        village: village || undefined,
        farmingExperienceYears: experience,
        preferredLanguage,
        farms: updatedFarms.length > 0 ? updatedFarms : farmer.farms,
      };

      onUpdateProfile(updated);
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 400);
  };

  const handleSelectLang = (code: LanguageCode) => {
    setPreferredLanguage(code);
    setLanguage(code);
    onUpdateProfile({ ...farmer, preferredLanguage: code });
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-800 text-emerald-200 flex items-center justify-center text-2xl font-black shadow-md border-2 border-emerald-700">
            {farmer.name ? farmer.name.charAt(0).toUpperCase() : 'K'}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
                {farmer.name}
              </h1>
              <Badge variant={farmer.role === 'AGRICULTURAL_OFFICER' ? 'purple' : 'success'} size="md">
                {farmer.role === 'AGRICULTURAL_OFFICER' ? t('nav.officerDashboard') : t('nav.krishiMitra')}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 flex flex-wrap items-center gap-2 mt-1">
              <span className="flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                {farmer.district}, {farmer.state}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                +91 {farmer.phone}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            id="profile-logout-btn"
            variant="outline"
            size="md"
            onClick={onLogout}
            icon={<LogOut className="w-4 h-4 text-red-600" />}
            className="text-red-700 border-red-200 hover:bg-red-50 hover:border-red-300"
          >
            {t('auth.logout')}
          </Button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'profile'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          {t('profile.title')}
        </button>
        <button
          onClick={() => setActiveSubTab('farms')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'farms'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          {t('profile.farmDetails')} ({farmer.farms.length})
        </button>
        <button
          onClick={() => setActiveSubTab('security')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'security'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          {t('profile.accountSecurity')}
        </button>
        <button
          onClick={() => setActiveSubTab('language')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'language'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          {t('profile.preferredLanguage')}
        </button>
      </div>

      {/* SUCCESS BANNER */}
      {saveSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <span className="font-bold">{t('profile.profileUpdated')}</span>
        </div>
      )}

      {/* 1. PERSONAL PROFILE SUBTAB */}
      {activeSubTab === 'profile' && (
        <Card variant="elevated" className="p-6 sm:p-8 space-y-6">
          <SectionHeader
            title={t('profile.title')}
            subtitle={t('profile.subtitle')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t('auth.fullName')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-medium focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t('auth.mobileNumber')}
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-bold focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
                />
                <span className="absolute right-3 text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  {t('common.verified')}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t('auth.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Optional email"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-medium focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t('onboarding.experience')}
              </label>
              <input
                type="number"
                value={experience}
                onChange={(e) => setExperience(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-bold focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t('onboarding.state')}
              </label>
              <select
                value={state}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-bold focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
              >
                {INDIA_AGRO_STATES.map((s) => (
                  <option key={s.code} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t('onboarding.district')}
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-bold focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
              >
                {currentState.districts.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.nameMr ? `${d.name} (${d.nameMr})` : d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t('onboarding.village')}
              </label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="Village name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-medium focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Agro-Climatic Zone
              </label>
              <input
                type="text"
                disabled
                value={currentState.agroClimaticZones[0] || 'Agricultural Zone'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold bg-stone-100 text-stone-600"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex justify-end">
            <Button
              id="save-profile-btn"
              variant="primary"
              size="md"
              onClick={handleSave}
              isLoading={isSaving}
              icon={<Save className="w-4 h-4" />}
            >
              {t('common.save')}
            </Button>
          </div>
        </Card>
      )}

      {/* 2. FARMS SUBTAB */}
      {activeSubTab === 'farms' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <SectionHeader
              title={t('profile.farmDetails')}
              subtitle="All farm parcels under your account"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab('soil')}
              icon={<Sprout className="w-4 h-4" />}
            >
              {t('nav.soilHealth')}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {farmer.farms.map((farm) => (
              <Card key={farm.id} variant="default" className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-stone-900">{farm.name}</h3>
                    <p className="text-xs text-stone-500">
                      {farm.district}, {farm.state}
                    </p>
                  </div>
                  <Badge variant="primary" size="md">
                    {farm.totalAreaAcres} {t('common.acre')}
                  </Badge>
                </div>

                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    {t('profile.farmDetails')} ({farm.plots.length})
                  </span>
                  <div className="space-y-1.5">
                    {farm.plots.map((plot) => (
                      <div
                        key={plot.id}
                        className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-stone-900">{plot.name}</p>
                          <p className="text-[11px] text-stone-500">
                            {t('onboarding.soilType')}: {lookupAgro('soilTypes', plot.soil.soilType)} • {lookupAgro('waterSources', plot.waterSource)}
                          </p>
                        </div>
                        <Badge variant="earth" size="sm">
                          {plot.currentCropSeason?.cropName ? lookupAgro('crops', plot.currentCropSeason.cropName) : t('common.noData')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 3. SECURITY & SESSIONS SUBTAB */}
      {activeSubTab === 'security' && (
        <Card variant="elevated" className="p-6 sm:p-8 space-y-6">
          <SectionHeader
            title={t('profile.accountSecurity')}
            subtitle="Manage your session, verified phone status, and roles."
          />

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">{t('auth.phoneLogin')}</h4>
                  <p className="text-xs text-stone-500">
                    Verified for +91 {farmer.phone}
                  </p>
                </div>
              </div>
              <Badge variant="success" size="sm">
                {t('common.active')}
              </Badge>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-purple-700" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">Account Role</h4>
                  <p className="text-xs text-stone-500">
                    {farmer.role === 'AGRICULTURAL_OFFICER' ? t('nav.officerDashboard') : t('nav.krishiMitra')}
                  </p>
                </div>
              </div>
              <Badge variant="purple" size="sm">
                {farmer.role}
              </Badge>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <KeyRound className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">Active Session</h4>
                  <p className="text-xs text-stone-500 font-mono">
                    Token ID: ksn_••••••••••••••••
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="text-red-700 border-red-200 hover:bg-red-50"
              >
                {t('auth.logout')}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 4. LANGUAGE SUBTAB */}
      {activeSubTab === 'language' && (
        <Card variant="elevated" className="p-6 sm:p-8 space-y-6">
          <SectionHeader
            title={t('profile.preferredLanguage')}
            subtitle="Choose from 13 constitutionally recognized regional languages for chat, speech, and advisories."
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {SUPPORTED_LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => handleSelectLang(l.code)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  preferredLanguage === l.code
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm'
                    : 'bg-stone-50 border-stone-200 text-stone-800 hover:border-emerald-700 hover:bg-emerald-50/50'
                }`}
              >
                <p className="font-extrabold text-sm leading-tight">{l.nativeLabel}</p>
                <p
                  className={`text-xs mt-0.5 ${
                    preferredLanguage === l.code ? 'text-emerald-200' : 'text-stone-500'
                  }`}
                >
                  {l.label}
                </p>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

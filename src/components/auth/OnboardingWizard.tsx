import React, { useState } from 'react';
import {
  Sprout,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { FarmerProfile, Farm, FarmPlot, LanguageCode, SoilType, WaterSource } from '../../types/farming';
import { INDIA_AGRO_STATES } from '../../data/indiaAgroData';
import { SUPPORTED_LANGUAGES } from '../../data/i18n';
import { useI18n } from '../../context/I18nContext';
import confetti from 'canvas-confetti';

interface OnboardingWizardProps {
  initialProfile: FarmerProfile;
  onComplete: (profile: FarmerProfile) => void;
  onSkipToDashboard: () => void;
}

const AVAILABLE_SOIL_TYPES: SoilType[] = [
  'Alluvial Soil',
  'Black Soil (Regur)',
  'Red and Yellow Soil',
  'Laterite Soil',
  'Arid / Desert Soil',
  'Saline and Alkaline Soil',
  'Peaty / Marshy Soil',
  'Forest / Mountain Soil',
  'Loamy Soil',
  'Sandy Loam',
  'Clay Loam',
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  initialProfile,
  onComplete,
  onSkipToDashboard,
}) => {
  const { t, language, setLanguage, lookupAgro } = useI18n();
  const [currentStep, setCurrentStep] = useState<number>(2);

  // Profile Form State
  const [name, setName] = useState(initialProfile.name || '');
  const [preferredLanguage, setPreferredLanguage] = useState<LanguageCode>(
    initialProfile.preferredLanguage || language
  );
  const [state, setState] = useState(initialProfile.state || 'Punjab');
  const [district, setDistrict] = useState(initialProfile.district || 'Ludhiana');
  const [village, setVillage] = useState(initialProfile.village || '');
  const [experience, setExperience] = useState<number>(
    initialProfile.farmingExperienceYears || 10
  );
  const [farmingType, setFarmingType] = useState<any>(
    initialProfile.farms[0]?.farmingType || 'irrigated'
  );

  // Farm Form State
  const [farmName, setFarmName] = useState(initialProfile.farms[0]?.name || 'Main Family Farm');
  const [totalAreaAcres, setTotalAreaAcres] = useState<number>(
    initialProfile.farms[0]?.totalAreaAcres || 5.0
  );
  const [soilType, setSoilType] = useState<SoilType>(
    initialProfile.farms[0]?.plots[0]?.soil?.soilType || 'Alluvial Soil'
  );
  const [waterSource, setWaterSource] = useState<WaterSource>(
    initialProfile.farms[0]?.plots[0]?.waterSource || 'Borewell'
  );

  // Crop Form State
  const [cropName, setCropName] = useState(
    initialProfile.farms[0]?.plots[0]?.currentCropSeason?.cropName || 'Wheat'
  );
  const [variety, setVariety] = useState(
    initialProfile.farms[0]?.plots[0]?.currentCropSeason?.variety || 'HD-2967'
  );
  const [sowingDate, setSowingDate] = useState(
    initialProfile.farms[0]?.plots[0]?.currentCropSeason?.sowingDate ||
      new Date().toISOString().split('T')[0]
  );
  const [growthStage, setGrowthStage] = useState<any>(
    initialProfile.farms[0]?.plots[0]?.currentCropSeason?.currentStage || 'Tillering / Branching'
  );

  const currentState = INDIA_AGRO_STATES.find((s) => s.name === state) || INDIA_AGRO_STATES[0];

  const handleStateChange = (newState: string) => {
    setState(newState);
    const foundState = INDIA_AGRO_STATES.find((s) => s.name === newState);
    if (foundState && foundState.districts.length > 0) {
      setDistrict(foundState.districts[0].name);
    }
  };

  const handleLangChange = (newLang: LanguageCode) => {
    setPreferredLanguage(newLang);
    setLanguage(newLang);
  };

  const handleFinish = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#047857', '#10b981', '#f59e0b', '#3b82f6'],
      });
    } catch (e) {}

    const plot: FarmPlot = {
      id: 'plot-' + Date.now(),
      name: 'Main Plot (Block A)',
      areaAcres: totalAreaAcres,
      soil: {
        soilType,
        ph: 7.2,
        nitrogen: 'Medium',
        phosphorus: 'Medium',
        potassium: 'High',
        organicCarbon: 0.65,
        source: 'farmer-reported',
      },
      waterSource,
      currentCropSeason: {
        id: 'season-' + Date.now(),
        cropName,
        variety,
        sowingDate,
        expectedHarvestDate: new Date(Date.now() + 110 * 86400000).toISOString().split('T')[0],
        currentStage: growthStage,
        areaAcres: totalAreaAcres,
      },
    };

    const farm: Farm = {
      id: 'farm-' + Date.now(),
      name: farmName,
      state,
      district,
      village: village || undefined,
      totalAreaAcres,
      farmingType,
      plots: [plot],
      isPrimary: true,
    };

    const completedProfile: FarmerProfile = {
      ...initialProfile,
      name: name || 'Kisan Mitra',
      preferredLanguage,
      state,
      district,
      village: village || undefined,
      farmingExperienceYears: experience,
      farms: [farm],
      onboardingCompleted: true,
    };

    onComplete(completedProfile);
  };

  const steps = [
    { num: 1, label: t('auth.verifiedSuccess') },
    { num: 2, label: t('profile.title') },
    { num: 3, label: t('profile.farmDetails') },
    { num: 4, label: t('cropPlanner.activeCrop') },
  ];

  return (
    <div className="min-h-screen bg-stone-100/80 py-8 px-4 sm:px-6 flex flex-col justify-center items-center">
      <div className="max-w-2xl w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold shadow-xs">
            <Sprout className="w-4 h-4 text-emerald-700" />
            <span>{t('app.name')} • {t('app.tagline')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {t('onboarding.welcomeTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
            {t('onboarding.welcomeSubtitle')}
          </p>
        </div>

        {/* Step Progress Indicator */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-stone-200 -translate-y-1/2 z-0"></div>

            {steps.map((step) => {
              const isCompleted = step.num < currentStep;
              const isCurrent = step.num === currentStep;

              return (
                <div key={step.num} className="relative z-10 flex flex-col items-center gap-1.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold transition-all ${
                      isCompleted
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : isCurrent
                        ? 'bg-emerald-800 text-white ring-4 ring-emerald-100 font-black'
                        : 'bg-stone-100 text-stone-400 border border-stone-300'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.num}
                  </div>
                  <span
                    className={`text-[10px] font-bold hidden sm:inline ${
                      isCurrent ? 'text-emerald-900' : 'text-stone-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Form Card */}
        <Card variant="elevated" className="p-6 sm:p-8 space-y-6">
          {/* STEP 2: Personal Profile */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-stone-100 pb-3">
                <h3 className="text-lg font-bold text-stone-900">Step 2: {t('profile.title')}</h3>
                <p className="text-xs text-stone-500">
                  {t('profile.subtitle')}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t('auth.fullName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ramesh Kumar Patel"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-medium focus:ring-2 focus:ring-emerald-700 focus:outline-none bg-stone-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t('profile.preferredLanguage')} *
                  </label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => handleLangChange(e.target.value as LanguageCode)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
                  >
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.nativeLabel} — {l.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {t('onboarding.state')} *
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
                      {t('onboarding.district')} *
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {t('onboarding.village')}
                    </label>
                    <input
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      placeholder="Dindori / Kanganwal"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {t('onboarding.experience')}
                    </label>
                    <select
                      value={experience}
                      onChange={(e) => setExperience(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-bold focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
                    >
                      <option value={2}>1 - 3 Years</option>
                      <option value={6}>4 - 8 Years</option>
                      <option value={15}>10 - 20 Years</option>
                      <option value={25}>20+ Years</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={onSkipToDashboard}
                  className="text-xs text-stone-500 hover:text-stone-800 font-semibold cursor-pointer"
                >
                  {t('onboarding.skipStep')}
                </button>
                <Button
                  id="onboard-step2-next"
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={() => setCurrentStep(3)}
                  disabled={!name.trim()}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  {t('common.next')}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Farm Setup */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-stone-100 pb-3">
                <h3 className="text-lg font-bold text-stone-900">Step 3: {t('profile.farmDetails')}</h3>
                <p className="text-xs text-stone-500">
                  {t('onboarding.farmDetails')}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t('profile.farmName')}
                  </label>
                  <input
                    type="text"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="North Plot / Ganga Farm"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-medium focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {t('onboarding.farmArea')} ({t('common.acre')}) *
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.25"
                      value={totalAreaAcres}
                      onChange={(e) => setTotalAreaAcres(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-bold focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {t('onboarding.farmingMethod')}
                    </label>
                    <select
                      value={farmingType}
                      onChange={(e) => setFarmingType(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-bold focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
                    >
                      <option value="irrigated">Irrigated</option>
                      <option value="rainfed">Rainfed / Dryland</option>
                      <option value="organic">Organic Certified</option>
                      <option value="natural">Natural / Zero Budget</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {t('onboarding.soilType')} *
                    </label>
                    <select
                      value={soilType}
                      onChange={(e) => setSoilType(e.target.value as SoilType)}
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-bold focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
                    >
                      {AVAILABLE_SOIL_TYPES.map((s) => (
                        <option key={s} value={s}>
                          {lookupAgro('soilTypes', s)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {t('onboarding.waterSource')} *
                    </label>
                    <select
                      value={waterSource}
                      onChange={(e) => setWaterSource(e.target.value as WaterSource)}
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-bold focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
                    >
                      <option value="Borewell">Borewell</option>
                      <option value="Canal">Canal</option>
                      <option value="Drip Irrigation">Drip Micro-Irrigation</option>
                      <option value="Open Well">Open Well</option>
                      <option value="Rainfed">Rainfed</option>
                      <option value="Pond">Farm Pond</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setCurrentStep(2)}
                  icon={<ArrowLeft className="w-4 h-4" />}
                >
                  {t('common.back')}
                </Button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onSkipToDashboard}
                    className="text-xs text-stone-500 hover:text-stone-800 font-semibold cursor-pointer px-2"
                  >
                    {t('onboarding.skipStep')}
                  </button>
                  <Button
                    id="onboard-step3-next"
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={() => setCurrentStep(4)}
                    icon={<ArrowRight className="w-4 h-4" />}
                  >
                    {t('common.next')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: First Crop */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-stone-100 pb-3">
                <h3 className="text-lg font-bold text-stone-900">Step 4: {t('cropPlanner.activeCrop')}</h3>
                <p className="text-xs text-stone-500">
                  {t('onboarding.cropDetails')}
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {t('cropPlanner.cropName')} *
                    </label>
                    <input
                      type="text"
                      value={cropName}
                      onChange={(e) => setCropName(e.target.value)}
                      placeholder="Wheat, Paddy, Cotton, Soybean, Onion"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {t('cropPlanner.variety')}
                    </label>
                    <input
                      type="text"
                      value={variety}
                      onChange={(e) => setVariety(e.target.value)}
                      placeholder="HD-2967 / BT Cotton / Shriram 303"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {t('cropPlanner.sowingDate')}
                    </label>
                    <input
                      type="date"
                      value={sowingDate}
                      onChange={(e) => setSowingDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {t('cropPlanner.growthStage')}
                    </label>
                    <select
                      value={growthStage}
                      onChange={(e) => setGrowthStage(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-bold focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
                    >
                      <option value="Sowing / Seedling">Sowing / Emergence</option>
                      <option value="Vegetative">Vegetative</option>
                      <option value="Tillering / Branching">Tillering / Branching</option>
                      <option value="Flowering / Booting">Flowering / Booting</option>
                      <option value="Fruit / Grain Formation">Grain Formation</option>
                      <option value="Maturity / Ripening">Maturity / Ripening</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Ready Confirmation */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-emerald-700 shrink-0" />
                <div>
                  <p className="font-bold">{t('auth.verifiedSuccess')}</p>
                  <p className="text-[11px] text-emerald-800">
                    {t('app.subtitle')}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setCurrentStep(3)}
                  icon={<ArrowLeft className="w-4 h-4" />}
                >
                  {t('common.back')}
                </Button>
                <Button
                  id="complete-onboarding-btn"
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={handleFinish}
                  icon={<CheckCircle2 className="w-4 h-4" />}
                >
                  {t('onboarding.completeBtn')}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

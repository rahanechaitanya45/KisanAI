import React, { useState } from 'react';
import {
  Sprout,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Globe,
  Layers,
  Droplets,
  Calendar,
  Sparkles,
  User,
  SkipForward,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { FarmerProfile, Farm, FarmPlot, LanguageCode, SoilType, WaterSource } from '../../types/farming';
import { INDIA_AGRO_STATES } from '../../data/indiaAgroData';
import { SUPPORTED_LANGUAGES, getTranslation } from '../../data/i18n';
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
  const [currentStep, setCurrentStep] = useState<number>(2); // Step 1 (Account) is already verified!

  // Profile Form State
  const [name, setName] = useState(initialProfile.name || '');
  const [preferredLanguage, setPreferredLanguage] = useState<LanguageCode>(
    initialProfile.preferredLanguage || 'hi'
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
    initialProfile.farms[0]?.plots[0]?.currentCropSeason?.cropName || 'Wheat (गेहूं)'
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
    { num: 1, label: 'Account Verified' },
    { num: 2, label: 'Personal Profile' },
    { num: 3, label: 'Farm Setup' },
    { num: 4, label: 'Current Crop' },
  ];

  return (
    <div className="min-h-screen bg-stone-100/80 py-8 px-4 sm:px-6 flex flex-col justify-center items-center">
      <div className="max-w-2xl w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold shadow-xs">
            <Sprout className="w-4 h-4 text-emerald-700" />
            <span>Welcome to KisanAI Personal Farm Companion</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Let's Personalize Your Farm Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
            Tell us about your soil and crops so your AI agronomist can provide pin-point advisory.
          </p>
        </div>

        {/* Step Progress Indicator */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between relative">
            {/* Background Line */}
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
                <h3 className="text-lg font-bold text-stone-900">Step 2: Basic Farmer Profile</h3>
                <p className="text-xs text-stone-500">
                  Your identity and preferred communication language
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Your Name (आपका नाम) *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar Patel"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-medium focus:ring-2 focus:ring-emerald-700 focus:outline-none bg-stone-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Preferred Language (पसंदीदा भाषा) *
                  </label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value as LanguageCode)}
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
                      State (राज्य) *
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
                      District (ज़िला) *
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-bold focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
                    >
                      {currentState.districts.map((d) => (
                        <option key={d.name} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Village / Taluka (गांव / तहसील)
                    </label>
                    <input
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      placeholder="e.g. Dindori / Kanganwal"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Farming Experience (अनुभव)
                    </label>
                    <select
                      value={experience}
                      onChange={(e) => setExperience(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-bold focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
                    >
                      <option value={2}>1 - 3 Years (Beginner)</option>
                      <option value={6}>4 - 8 Years (Experienced)</option>
                      <option value={15}>10 - 20 Years (Veteran)</option>
                      <option value={25}>20+ Years (Master Cultivator)</option>
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
                  Skip for Now
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
                  Next: Farm Details
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Farm Setup */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-stone-100 pb-3">
                <h3 className="text-lg font-bold text-stone-900">Step 3: Farm & Landholding</h3>
                <p className="text-xs text-stone-500">
                  Land area, soil classification, and irrigation source
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Farm Name (खेत का नाम)
                  </label>
                  <input
                    type="text"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="e.g. North Plot / Ganga Farm"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-medium focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Total Farm Area (कुल एकड़) *
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
                      Farming Method (खेती का प्रकार)
                    </label>
                    <select
                      value={farmingType}
                      onChange={(e) => setFarmingType(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-bold focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
                    >
                      <option value="irrigated">Irrigated (सिंचित)</option>
                      <option value="rainfed">Rainfed / Dryland (वर्षा आधारित)</option>
                      <option value="organic">Organic Certified (जैविक)</option>
                      <option value="natural">Natural / Zero Budget (प्राकृतिक खेती)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Primary Soil Type (मिट्टी का प्रकार) *
                    </label>
                    <select
                      value={soilType}
                      onChange={(e) => setSoilType(e.target.value as SoilType)}
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-bold focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
                    >
                      {AVAILABLE_SOIL_TYPES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Irrigation Water Source (पानी का स्रोत) *
                    </label>
                    <select
                      value={waterSource}
                      onChange={(e) => setWaterSource(e.target.value as WaterSource)}
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-bold focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
                    >
                      <option value="Borewell">Borewell (ट्यूबवेल)</option>
                      <option value="Canal">Canal Irrigation (नहर)</option>
                      <option value="Drip Irrigation">Drip Micro-Irrigation (ड्रिप)</option>
                      <option value="Open Well">Open Well (कुआं)</option>
                      <option value="Rainfed">Rainfed / Rain Only (वर्षा)</option>
                      <option value="Pond">Farm Pond (तालाब)</option>
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
                  Back
                </Button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onSkipToDashboard}
                    className="text-xs text-stone-500 hover:text-stone-800 font-semibold cursor-pointer px-2"
                  >
                    Add Later
                  </button>
                  <Button
                    id="onboard-step3-next"
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={() => setCurrentStep(4)}
                    icon={<ArrowRight className="w-4 h-4" />}
                  >
                    Next: Active Crop
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: First Crop */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="border-b border-stone-100 pb-3">
                <h3 className="text-lg font-bold text-stone-900">Step 4: Active Crop Sown</h3>
                <p className="text-xs text-stone-500">
                  Set up your current standing crop to activate live phenological tracking
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Current Crop (फसल का नाम) *
                    </label>
                    <input
                      type="text"
                      value={cropName}
                      onChange={(e) => setCropName(e.target.value)}
                      placeholder="e.g. Wheat, Paddy, Cotton, Soybean, Onion"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Seed Variety (किस्म)
                    </label>
                    <input
                      type="text"
                      value={variety}
                      onChange={(e) => setVariety(e.target.value)}
                      placeholder="e.g. HD-2967 / BT Cotton / Shriram 303"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Sowing / Planting Date (बुवाई की तारीख)
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
                      Current Growth Stage (अवस्था)
                    </label>
                    <select
                      value={growthStage}
                      onChange={(e) => setGrowthStage(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-bold focus:ring-2 focus:ring-emerald-700 bg-stone-50/50"
                    >
                      <option value="Sowing / Seedling">Sowing / Emergence (अंकुरण)</option>
                      <option value="Vegetative">Vegetative (वानस्पतिक)</option>
                      <option value="Tillering / Branching">Tillering / Branching (कल्ले फूटना)</option>
                      <option value="Flowering / Booting">Flowering / Booting (फूल / बाली)</option>
                      <option value="Fruit / Grain Formation">Grain Formation (दाना भराव)</option>
                      <option value="Maturity / Ripening">Maturity / Ripening (परिपक्वता)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Ready Confirmation */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-emerald-700 shrink-0" />
                <div>
                  <p className="font-bold">Your farm profile is ready!</p>
                  <p className="text-[11px] text-emerald-800">
                    KisanAI will automatically sync agro-meteorological spray forecasts and fertilizer recommendations for {cropName}.
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
                  Back
                </Button>
                <Button
                  id="complete-onboarding-btn"
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={handleFinish}
                  icon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Open My Farm Dashboard (डैशबोर्ड खोलें)
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

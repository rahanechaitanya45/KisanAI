import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import {
  FarmerProfile,
  Farm,
  FarmPlot,
  LanguageCode,
  SoilType,
  WaterSource,
} from '../types/farming';
import { SUPPORTED_LANGUAGES } from '../data/i18n';
import { INDIAN_STATES_AND_DISTRICTS, INDIA_AGRO_STATES } from '../data/indiaAgroData';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useI18n } from '../context/I18nContext';

interface FarmerOnboardingProps {
  onComplete: (profile: FarmerProfile) => void;
  onCancel?: () => void;
  existingProfile?: FarmerProfile;
}

export const FarmerOnboarding: React.FC<FarmerOnboardingProps> = ({
  onComplete,
  onCancel,
  existingProfile,
}) => {
  const { t, setLanguage: setGlobalLanguage } = useI18n();
  const [step, setStep] = useState(1);

  // Step 1 State: Identity
  const [name, setName] = useState(existingProfile?.name || '');
  const [phone, setPhone] = useState(existingProfile?.phone || '+91 98765 43210');
  const [state, setState] = useState(existingProfile?.state || 'Punjab');
  const [district, setDistrict] = useState(existingProfile?.district || 'Ludhiana');
  const [language, setLanguage] = useState<LanguageCode>(
    existingProfile?.preferredLanguage || 'hi'
  );

  // Step 2 State: Farm & Soil
  const [farmName, setFarmName] = useState('Green Acres');
  const [plotName, setPlotName] = useState('Main Field 1');
  const [totalAcres, setTotalAcres] = useState<number>(4);
  const [soilType, setSoilType] = useState<SoilType>('Alluvial Soil');
  const [soilPh, setSoilPh] = useState<number>(7.2);
  const [waterSource, setWaterSource] = useState<WaterSource>('Canal');

  // Step 3 State: Active Crop
  const [cropName, setCropName] = useState('Paddy (Rice)');
  const [variety, setVariety] = useState('PR-126');
  const [sowingDate, setSowingDate] = useState('2025-06-15');
  const [isOrganic, setIsOrganic] = useState(false);

  const availableDistricts =
    INDIAN_STATES_AND_DISTRICTS.find((s) => s.state === state)?.districts || [district];

  const handleFinish = () => {
    const farmId = 'farm-' + Date.now();
    const plotId = 'plot-' + Date.now();

    const newPlot: FarmPlot = {
      id: plotId,
      farmId,
      name: plotName || 'Main Field',
      areaAcres: totalAcres,
      soil: {
        soilType,
        ph: soilPh,
        nitrogen: 'Medium',
        phosphorus: 'Medium',
        potassium: 'Medium',
        organicCarbon: 0.55,
        source: 'farmer-reported',
      },
      waterSource,
      currentCropSeason: {
        id: 'season-' + Date.now(),
        cropName,
        variety,
        season: 'Kharif',
        sowingDate,
        expectedHarvestDate: '2025-10-25',
        currentStage: 'Tillering / Branching',
        isOrganic,
      },
    };

    const newFarm: Farm = {
      id: farmId,
      farmerId: existingProfile?.id || 'farmer-' + Date.now(),
      name: farmName || 'My Farm',
      state,
      district,
      totalAreaAcres: totalAcres,
      plots: [newPlot],
    };

    const newProfile: FarmerProfile = {
      id: existingProfile?.id || 'farmer-' + Date.now(),
      name: name || 'Kisan Bandhu',
      phone,
      state,
      district,
      preferredLanguage: language,
      landholdingCategory:
        totalAcres <= 2.5 ? 'Small & Marginal' : totalAcres <= 10 ? 'Medium' : 'Large',
      role: 'FARMER',
      farms: [newFarm],
      onboardingCompleted: true,
    };

    setGlobalLanguage(language);
    onComplete(newProfile);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <Card
        variant="standard"
        padding="lg"
        className="max-w-xl w-full shadow-2xl space-y-6"
      >
        {/* Header Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-extrabold">
                🌱
              </div>
              <h2 className="text-lg font-extrabold text-stone-900">
                {t('onboarding.setupProfile')}
              </h2>
            </div>
            <Badge variant="neutral" size="sm">
              Step {step} of 3
            </Badge>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
            <div
              className="h-full bg-emerald-800 transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Personal Profile */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in text-xs">
            <h3 className="font-extrabold text-stone-900 text-sm">
              {t('onboarding.setupProfile')}
            </h3>

            <div>
              <label className="font-bold text-stone-700 block mb-1">{t('profile.fullName')}</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Patel"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">{t('profile.state')}</label>
                <select
                  value={state}
                  onChange={(e) => {
                    const newState = e.target.value;
                    setState(newState);
                    const firstDist = INDIAN_STATES_AND_DISTRICTS.find(
                      (s) => s.state === newState
                    )?.districts[0];
                    if (firstDist) setDistrict(firstDist);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold"
                >
                  {INDIAN_STATES_AND_DISTRICTS.map((s) => (
                    <option key={s.state} value={s.state}>
                      {s.state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">{t('profile.district')}</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold"
                >
                  {availableDistricts.map((d) => {
                    const dInfo = INDIA_AGRO_STATES.find((s) => s.name === state)?.districts.find(
                      (item) => item.name === d
                    );
                    return (
                      <option key={d} value={d}>
                        {dInfo?.nameMr ? `${d} (${dInfo.nameMr})` : d}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">{t('profile.language')}</label>
              <select
                value={language}
                onChange={(e) => {
                  const newL = e.target.value as LanguageCode;
                  setLanguage(newL);
                  setGlobalLanguage(newL);
                }}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.nativeLabel} ({l.label})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Farm & Soil Setup */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in text-xs">
            <h3 className="font-extrabold text-stone-900 text-sm">{t('onboarding.setupFarm')}</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">{t('onboarding.farmName')}</label>
                <input
                  type="text"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">{t('onboarding.totalLand')} ({t('common.acre')})</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={totalAcres}
                  onChange={(e) => setTotalAcres(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">{t('soil.soilType')}</label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value as SoilType)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold"
                >
                  <option value="Alluvial Soil">Alluvial Soil</option>
                  <option value="Black Soil (Regur)">Black Soil (Regur)</option>
                  <option value="Red and Yellow Soil">Red and Yellow Soil</option>
                  <option value="Laterite Soil">Laterite Soil</option>
                  <option value="Loamy Soil">Loamy Soil</option>
                  <option value="Clay Loam">Clay Loam</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">{t('soil.ph')} (4.0 - 9.0)</label>
                <input
                  type="number"
                  step="0.1"
                  value={soilPh}
                  onChange={(e) => setSoilPh(parseFloat(e.target.value) || 7.0)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">{t('onboarding.waterSource')}</label>
              <select
                value={waterSource}
                onChange={(e) => setWaterSource(e.target.value as WaterSource)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold"
              >
                <option value="Canal">Canal Irrigation</option>
                <option value="Borewell">Borewell / Tubewell</option>
                <option value="Rainfed">Rainfed (Dependent on Monsoon)</option>
                <option value="Drip Irrigation">Drip / Micro-Irrigation</option>
                <option value="Pond">Farm Pond / Tank</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 3: Current Crop */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in text-xs">
            <h3 className="font-extrabold text-stone-900 text-sm">{t('cropPlanner.activeCrop')}</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">{t('cropPlanner.activeCrop')}</label>
                <input
                  type="text"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  placeholder="e.g. Paddy, Wheat, Cotton, Sugarcane"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Seed Variety</label>
                <input
                  type="text"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  placeholder="e.g. PR-126, HD-2967, Bt-Cotton"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">{t('cropPlanner.sowingDate')}</label>
              <input
                type="date"
                value={sowingDate}
                onChange={(e) => setSowingDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
              />
            </div>

            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-stone-900">Natural / Organic Farming?</p>
                <p className="text-[11px] text-stone-500 font-medium">
                  Prioritize biological remedies & ZBNF practices
                </p>
              </div>
              <input
                type="checkbox"
                checked={isOrganic}
                onChange={(e) => setIsOrganic(e.target.checked)}
                className="w-4 h-4 accent-emerald-700 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-200">
          {step > 1 ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setStep(step - 1)}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              {t('common.back')}
            </Button>
          ) : onCancel ? (
            <Button variant="secondary" size="sm" onClick={onCancel}>
              {t('common.cancel')}
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setStep(step + 1)}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              {t('common.next')}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handleFinish}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              {t('common.save')}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

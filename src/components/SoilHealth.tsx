import React, { useState } from 'react';
import {
  FlaskConical,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Save,
} from 'lucide-react';
import { FarmerProfile, FarmPlot, SoilProfile, SoilType } from '../types/farming';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { SectionHeader } from './ui/SectionHeader';
import { useI18n } from '../context/I18nContext';

interface SoilHealthProps {
  farmer: FarmerProfile;
  selectedPlot: FarmPlot;
  onUpdateSoil: (plotId: string, updatedSoil: SoilProfile) => void;
  onNavigateTab: (tab: string) => void;
}

export const SoilHealth: React.FC<SoilHealthProps> = ({
  selectedPlot,
  onUpdateSoil,
  onNavigateTab,
}) => {
  const { t, lookupAgro } = useI18n();
  const currentSoil = selectedPlot?.soil || {
    soilType: 'Alluvial Soil' as SoilType,
    ph: 7.0,
    nitrogen: 'Medium',
    phosphorus: 'Medium',
    potassium: 'Medium',
    organicCarbon: 0.55,
    source: 'laboratory-tested',
  };

  const [editMode, setEditMode] = useState(false);
  const [soilForm, setSoilForm] = useState<SoilProfile>(currentSoil);
  const [successNotice, setSuccessNotice] = useState(false);

  const handleSave = () => {
    onUpdateSoil(selectedPlot.id, soilForm);
    setEditMode(false);
    setSuccessNotice(true);
    setTimeout(() => setSuccessNotice(false), 3000);
  };

  // Determine pH condition & organic amendments
  const phStatus =
    currentSoil.ph < 6.0
      ? {
          label: 'Acidic Soil',
          badgeVariant: 'warning' as const,
          remedy:
            'Apply Agricultural Lime (Calcium Carbonate) @ 200-300 kg/acre and well-rotted Farm Yard Manure (FYM) to neutralize acidity.',
        }
      : currentSoil.ph > 8.0
      ? {
          label: 'Alkaline / Sodic Soil',
          badgeVariant: 'purple' as const,
          remedy:
            'Apply Mineral Gypsum (Calcium Sulphate) @ 400-500 kg/acre with green manuring (Dhaincha / Sunhemp) before sowing.',
        }
      : {
          label: 'Optimal Neutral Soil',
          badgeVariant: 'success' as const,
          remedy:
            'Ideal pH range (6.0 - 7.5) ensuring maximum bioavailability of all essential macro and micro-nutrients.',
        };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header */}
      <SectionHeader
        title={t('soil.title')}
        subtitle={`${t('cropPlanner.activeCrop')}: ${selectedPlot?.name} (${selectedPlot?.areaAcres} ${t('common.acre')}) • Certified under National Soil Health Card Scheme`}
        badge={
          <Badge variant="primary" size="sm">
            <FlaskConical className="w-3.5 h-3.5 mr-1" />
            SHC Lab Certified
          </Badge>
        }
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? t('common.cancel') : t('soil.title')}
          </Button>
        }
      />

      {successNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>{t('common.success')}! Soil Health parameters updated.</span>
        </div>
      )}

      {/* Main Soil Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Parameters (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <Card variant="standard" padding="lg" className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div>
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  {t('soil.soilType')}
                </span>
                <h3 className="text-xl font-extrabold text-stone-900 mt-0.5">
                  {lookupAgro('soilTypes', currentSoil.soilType)}
                </h3>
              </div>
              <Badge variant="neutral" size="sm">
                Source: {currentSoil.source}
              </Badge>
            </div>

            {/* pH Meter & Status */}
            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    {t('soil.ph')}
                  </span>
                  <div className="flex items-baseline gap-2.5 mt-1">
                    <span className="text-3xl font-extrabold text-stone-900">
                      {currentSoil.ph}
                    </span>
                    <Badge variant={phStatus.badgeVariant} size="sm">
                      {phStatus.label}
                    </Badge>
                  </div>
                </div>
                <div className="text-right text-xs text-stone-500">
                  <span>Neutral Scale: </span>
                  <strong className="text-stone-800 font-bold">6.5 - 7.5</strong>
                </div>
              </div>

              {/* pH Visual Spectrum Bar */}
              <div className="relative w-full h-3.5 bg-gradient-to-r from-red-500 via-amber-400 via-emerald-500 via-teal-500 to-purple-600 rounded-full shadow-inner">
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4.5 h-4.5 rounded-full bg-white border-2 border-stone-900 shadow-md transition-all duration-300"
                  style={{
                    left: `${Math.max(0, Math.min(96, ((currentSoil.ph - 4) / 6) * 100))}%`,
                  }}
                />
              </div>

              <p className="text-xs text-stone-700 bg-white p-3.5 rounded-xl border border-stone-200 leading-relaxed">
                💡 <strong>Remedy & Guidance:</strong> {phStatus.remedy}
              </p>
            </div>

            {/* N-P-K Macro Nutrients Status */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                Primary Macro-Nutrient Availability (N-P-K)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Nitrogen */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-stone-500">{t('soil.nitrogen')} (N)</span>
                    <p className="text-xl font-extrabold text-stone-900 mt-1">{currentSoil.nitrogen}</p>
                  </div>
                  <div className="mt-3">
                    <Badge
                      variant={
                        currentSoil.nitrogen === 'High'
                          ? 'success'
                          : currentSoil.nitrogen === 'Medium'
                          ? 'warning'
                          : 'danger'
                      }
                      size="sm"
                    >
                      {currentSoil.nitrogen === 'Low' ? 'Deficient: Apply Urea/FYM' : 'Sufficient'}
                    </Badge>
                  </div>
                </div>

                {/* Phosphorus */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-stone-500">{t('soil.phosphorus')} (P)</span>
                    <p className="text-xl font-extrabold text-stone-900 mt-1">{currentSoil.phosphorus}</p>
                  </div>
                  <div className="mt-3">
                    <Badge
                      variant={
                        currentSoil.phosphorus === 'High'
                          ? 'success'
                          : currentSoil.phosphorus === 'Medium'
                          ? 'warning'
                          : 'danger'
                      }
                      size="sm"
                    >
                      {currentSoil.phosphorus === 'Low' ? 'Deficient: Add SSP/DAP' : 'Adequate'}
                    </Badge>
                  </div>
                </div>

                {/* Potassium */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-stone-500">{t('soil.potassium')} (K)</span>
                    <p className="text-xl font-extrabold text-stone-900 mt-1">{currentSoil.potassium}</p>
                  </div>
                  <div className="mt-3">
                    <Badge
                      variant={
                        currentSoil.potassium === 'High'
                          ? 'success'
                          : currentSoil.potassium === 'Medium'
                          ? 'warning'
                          : 'danger'
                      }
                      size="sm"
                    >
                      {currentSoil.potassium === 'Low' ? 'Deficient: Apply MOP' : 'Optimal'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Organic Carbon & Electrical Conductivity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  {t('soil.organicCarbon')} (OC)
                </span>
                <p className="text-2xl font-extrabold text-emerald-950 mt-1">{currentSoil.organicCarbon}%</p>
                <p className="text-xs text-emerald-800 mt-1">
                  {currentSoil.organicCarbon >= 0.75
                    ? '✓ High Organic Carbon (Superior microbial activity and water retention)'
                    : '⚠️ Medium-Low Organic Carbon: Incorporate 5 tonnes Farm Yard Manure (FYM).'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                  Electrical Conductivity (EC)
                </span>
                <p className="text-2xl font-extrabold text-stone-900 mt-1">
                  {currentSoil.electricalConductivity || 0.35} dS/m
                </p>
                <p className="text-xs text-stone-600 mt-1">
                  Non-saline normal soil (&lt;1.0 dS/m). No osmotic salinity stress on roots.
                </p>
              </div>
            </div>

            {/* Edit Mode Form */}
            {editMode && (
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-300 space-y-4 animate-in fade-in">
                <h4 className="text-sm font-extrabold text-stone-900">Update Soil Test Report Values</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1.5">{t('soil.soilType')}</label>
                    <select
                      value={soilForm.soilType}
                      onChange={(e) =>
                        setSoilForm({ ...soilForm, soilType: e.target.value as SoilType })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
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
                    <label className="font-bold text-stone-700 block mb-1.5">{t('soil.ph')} (4.0 - 9.5)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={soilForm.ph}
                      onChange={(e) =>
                        setSoilForm({ ...soilForm, ph: parseFloat(e.target.value) || 7.0 })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-stone-700 block mb-1.5">{t('soil.organicCarbon')} (%)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={soilForm.organicCarbon}
                      onChange={(e) =>
                        setSoilForm({
                          ...soilForm,
                          organicCarbon: parseFloat(e.target.value) || 0.5,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditMode(false)}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Save className="w-3.5 h-3.5" />}
                    onClick={handleSave}
                  >
                    {t('common.save')}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Biological Amendments & Scheme Links (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card variant="standard" padding="md" className="space-y-4">
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Organic Soil Rejuvenation</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200">
                <p className="font-bold text-emerald-950">1. Jeevamrit / Bio-fertilizers</p>
                <p className="text-emerald-900 text-[11px] mt-1 leading-relaxed">
                  Apply 200 litres Jeevamrit per acre with irrigation water every 21 days to activate native microbial flora.
                </p>
              </div>

              <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200">
                <p className="font-bold text-amber-950">2. Trichoderma Compost</p>
                <p className="text-amber-900 text-[11px] mt-1 leading-relaxed">
                  Mix 2 kg *Trichoderma viride* in 100 kg FYM, keep moist under shade for 7 days, and broadcast before sowing to prevent root rots.
                </p>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                <p className="font-bold text-stone-900">3. In-Situ Green Manuring</p>
                <p className="text-stone-600 text-[11px] mt-1 leading-relaxed">
                  Grow Dhaincha (*Sesbania*) or Sunhemp for 45 days and incorporate into soil to add 20-25 kg organic Nitrogen/acre.
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              fullWidth
              rightIcon={<TrendingUp className="w-3.5 h-3.5" />}
              onClick={() => onNavigateTab('planner')}
            >
              <span>View Crops Matching this Soil</span>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Sprout,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  X,
} from 'lucide-react';
import {
  FarmerProfile,
  FarmPlot,
  CropRecommendation,
} from '../types/farming';
import { calculateCropRecommendations } from '../services/aiService';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { SectionHeader } from './ui/SectionHeader';
import { useI18n } from '../context/I18nContext';

interface CropPlannerProps {
  farmer: FarmerProfile;
  selectedPlot: FarmPlot;
  onNavigateTab: (tab: string) => void;
  onSelectCropForSeason?: (cropId: string) => void;
}

export const CropPlanner: React.FC<CropPlannerProps> = ({
  farmer,
  selectedPlot,
  onNavigateTab,
}) => {
  const { t, lookupAgro } = useI18n();
  const [selectedSeason, setSelectedSeason] = useState<'Kharif' | 'Rabi' | 'Zaid'>('Kharif');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [budgetPerAcre, setBudgetPerAcre] = useState<number>(35000);
  const [activeCropDetail, setActiveCropDetail] = useState<CropRecommendation | null>(null);

  const recommendations = calculateCropRecommendations(
    farmer.state,
    farmer.district,
    selectedPlot?.soil,
    selectedPlot?.waterSource,
    selectedSeason,
    budgetPerAcre
  );

  const filteredRecommendations = recommendations.filter((r) => {
    if (selectedCategory === 'All') return true;
    return r.crop.category === selectedCategory;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header */}
      <SectionHeader
        title={t('cropPlanner.title')}
        subtitle={`${farmer.district}, ${farmer.state} • ${lookupAgro('soilTypes', selectedPlot?.soil?.soilType || 'Soil')} (pH ${selectedPlot?.soil?.ph || 7}) • ${lookupAgro('waterSources', selectedPlot?.waterSource || 'Borewell')}`}
        badge={
          <Badge variant="primary" size="sm">
            <Sprout className="w-3.5 h-3.5 mr-1" />
            Agronomic Match Engine
          </Badge>
        }
        action={
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-950">
            <span className="font-bold">{t('cropPlanner.activeCrop')}:</span> {selectedPlot?.name} ({lookupAgro('soilTypes', selectedPlot?.soil?.soilType || '')})
          </div>
        }
      />

      {/* Filter Controls Bar */}
      <Card variant="standard" padding="md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Season Selector */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl border border-stone-200">
              {(['Kharif', 'Rabi', 'Zaid'] as const).map((season) => (
                <button
                  key={season}
                  onClick={() => setSelectedSeason(season)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedSeason === season
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {season === 'Kharif'
                    ? `🌧 ${lookupAgro('seasons', 'Kharif')}`
                    : season === 'Rabi'
                    ? `❄️ ${lookupAgro('seasons', 'Rabi')}`
                    : `☀️ ${lookupAgro('seasons', 'Zaid')}`}
                </button>
              ))}
            </div>

            {/* Category Selector */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-semibold bg-stone-50/50"
            >
              <option value="All">{t('common.all')}</option>
              <option value="Cereals">Cereals</option>
              <option value="Commercial">Commercial</option>
              <option value="Oilseeds">Oilseeds</option>
              <option value="Spices">Spices</option>
              <option value="Fruits">Fruits</option>
              <option value="Vegetables">Vegetables</option>
            </select>
          </div>

          {/* Budget Slider */}
          <div className="flex items-center gap-2.5 text-xs font-semibold text-stone-700">
            <span>{t('cropPlanner.estimatedCost')}:</span>
            <span className="font-extrabold text-emerald-800">
              ₹{budgetPerAcre.toLocaleString()}/{t('common.acre')}
            </span>
            <input
              type="range"
              min="10000"
              max="100000"
              step="5000"
              value={budgetPerAcre}
              onChange={(e) => setBudgetPerAcre(Number(e.target.value))}
              className="w-28 sm:w-36 accent-emerald-700 cursor-pointer"
            />
          </div>
        </div>
      </Card>

      {/* Recommended Crops Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecommendations.map((rec) => (
          <Card
            key={rec.crop.id}
            variant="standard"
            padding="none"
            className="overflow-hidden flex flex-col justify-between"
          >
            <div>
              {/* Image & Match Pill */}
              <div className="relative h-44 w-full overflow-hidden bg-stone-100">
                <img
                  src={rec.crop.imageUrl}
                  alt={rec.crop.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-extrabold shadow-sm bg-emerald-800 text-white flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{rec.suitabilityScorePercent}% {t('cropPlanner.suitability')}</span>
                </div>
                <div className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-stone-800 border border-stone-200 backdrop-blur-xs">
                  {rec.crop.category} • {rec.crop.durationDays} Days
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3.5">
                <div>
                  <h3 className="font-extrabold text-base text-stone-900 leading-tight">
                    {lookupAgro('crops', rec.crop.name)}
                  </h3>
                  <p className="text-xs text-stone-500 italic">{rec.crop.scientificName}</p>
                </div>

                {/* Financial estimates */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-stone-50 border border-stone-200 text-center">
                  <div>
                    <p className="text-[10px] text-stone-500 font-medium">{t('cropPlanner.estimatedCost')}</p>
                    <p className="text-xs font-extrabold text-stone-900">
                      ₹{(rec.estimatedInvestmentPerAcre / 1000).toFixed(0)}k/ac
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-500 font-medium">{t('cropPlanner.estimatedYield')}</p>
                    <p className="text-xs font-extrabold text-stone-900">
                      {rec.estimatedYieldQuintals} Qtl
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-500 font-medium">{t('cropPlanner.estimatedProfit')}</p>
                    <p className="text-xs font-extrabold text-emerald-700">
                      +₹{(rec.estimatedNetProfitPerAcre / 1000).toFixed(0)}k/ac
                    </p>
                  </div>
                </div>

                {/* Agronomic Reasons */}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                    {t('cropPlanner.whyRecommended')}:
                  </p>
                  <ul className="text-xs text-stone-700 space-y-0.5">
                    {rec.reasons.slice(0, 2).map((r, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span className="truncate">{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Risk Factors */}
                {rec.riskFactors.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-950 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                    <span className="leading-tight">{rec.riskFactors[0]}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-5 pt-0 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => setActiveCropDetail(rec)}
              >
                {t('cropPlanner.suitability')}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onNavigateTab('library')}
                title="View Full Package of Practices"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal / Detail Drawer */}
      {activeCropDetail && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <Card
            variant="standard"
            padding="lg"
            className="max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl space-y-4"
          >
            <div className="flex items-start justify-between border-b border-stone-200 pb-3">
              <div>
                <Badge variant="primary" size="sm">
                  {activeCropDetail.suitabilityScorePercent}% {t('cropPlanner.suitability')}
                </Badge>
                <h2 className="text-xl font-extrabold text-stone-900 mt-1.5">
                  {lookupAgro('crops', activeCropDetail.crop.name)}
                </h2>
                <p className="text-xs text-stone-500">{activeCropDetail.crop.scientificName}</p>
              </div>
              <button
                onClick={() => setActiveCropDetail(null)}
                className="p-1.5 text-stone-400 hover:text-stone-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <p className="text-[10px] text-stone-500 font-medium">{t('cropLibrary.duration')}</p>
                <p className="font-extrabold text-stone-900 mt-0.5">
                  {activeCropDetail.crop.durationDays} Days
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <p className="text-[10px] text-stone-500 font-medium">{t('cropLibrary.waterNeed')}</p>
                <p className="font-extrabold text-stone-900 mt-0.5">
                  {activeCropDetail.crop.waterRequirement}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <p className="text-[10px] text-stone-500 font-medium">{t('cropLibrary.soilPh')}</p>
                <p className="font-extrabold text-stone-900 mt-0.5">
                  {activeCropDetail.crop.optimalPhRange.join(' - ')}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <p className="text-[10px] text-stone-500 font-medium">{t('cropLibrary.spacing')}</p>
                <p className="font-extrabold text-stone-900 text-[11px] truncate mt-0.5">
                  {activeCropDetail.crop.seedRatePerAcre}
                </p>
              </div>
            </div>

            {/* Spacing */}
            <div className="space-y-1.5 text-xs text-stone-700">
              <p className="font-bold text-stone-900">{t('cropLibrary.spacing')}:</p>
              <p className="p-3 bg-stone-50 border border-stone-200 rounded-2xl">
                {activeCropDetail.crop.spacing}
              </p>
            </div>

            {/* Fertilizer Guide */}
            <div className="space-y-1.5 text-xs text-stone-700">
              <p className="font-bold text-stone-900">{t('cropLibrary.fertilizer')}:</p>
              <div className="space-y-1.5 p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-2xl">
                <p>
                  <strong className="text-emerald-950">Basal:</strong>{' '}
                  {activeCropDetail.crop.fertilizerSchedule.basal}
                </p>
                <p>
                  <strong className="text-emerald-950">Vegetative:</strong>{' '}
                  {activeCropDetail.crop.fertilizerSchedule.vegetative}
                </p>
                <p>
                  <strong className="text-emerald-950">Flowering / Booting:</strong>{' '}
                  {activeCropDetail.crop.fertilizerSchedule.flowering}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActiveCropDetail(null)}
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setActiveCropDetail(null);
                  onNavigateTab('calendar');
                }}
              >
                {t('calendar.title')}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

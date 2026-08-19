import React, { useState } from 'react';
import {
  Sprout,
  TrendingUp,
  Droplets,
  Coins,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Filter,
  ShieldCheck,
  Layers,
  Sparkles,
  Calendar,
  X,
} from 'lucide-react';
import {
  FarmerProfile,
  FarmPlot,
  CropCategory,
  CropRecommendation,
} from '../types/farming';
import { getTranslation } from '../data/i18n';
import { calculateCropRecommendations } from '../services/aiService';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { SectionHeader } from './ui/SectionHeader';

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
  onSelectCropForSeason,
}) => {
  const [selectedSeason, setSelectedSeason] = useState<'Kharif' | 'Rabi' | 'Zaid'>('Kharif');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [budgetPerAcre, setBudgetPerAcre] = useState<number>(35000);
  const [activeCropDetail, setActiveCropDetail] = useState<CropRecommendation | null>(null);

  const lang = farmer.preferredLanguage;

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
        title="Crop Selection & Economic Planner"
        subtitle={`Personalized for ${farmer.district}, ${farmer.state} • Matching soil chemistry (${selectedPlot?.soil?.soilType}, pH ${selectedPlot?.soil?.ph}) and irrigation access (${selectedPlot?.waterSource})`}
        badge={
          <Badge variant="primary" size="sm">
            <Sprout className="w-3.5 h-3.5 mr-1" />
            Agronomic Match Engine
          </Badge>
        }
        action={
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-950">
            <span className="font-bold">Active Plot:</span> {selectedPlot?.name} ({selectedPlot?.soil?.soilType})
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
                    ? '🌧 Kharif (Monsoon)'
                    : season === 'Rabi'
                    ? '❄️ Rabi (Winter)'
                    : '☀️ Zaid (Summer)'}
                </button>
              ))}
            </div>

            {/* Category Selector */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="agri-input text-xs py-1.5 font-semibold"
            >
              <option value="All">All Categories</option>
              <option value="Cereals">Cereals (Paddy, Wheat)</option>
              <option value="Commercial">Commercial (Cotton, Sugarcane)</option>
              <option value="Oilseeds">Oilseeds (Soybean, Mustard)</option>
              <option value="Spices">Spices (Pepper, Turmeric)</option>
              <option value="Fruits">Fruits (Banana, Mango)</option>
              <option value="Vegetables">Vegetables (Tomato, Onion)</option>
            </select>
          </div>

          {/* Budget Slider */}
          <div className="flex items-center gap-2.5 text-xs font-semibold text-stone-700">
            <span>Max Budget:</span>
            <span className="font-extrabold text-emerald-800">
              ₹{budgetPerAcre.toLocaleString()}/acre
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
                  <span>{rec.suitabilityScorePercent}% Fit</span>
                </div>
                <div className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-stone-800 border border-stone-200 backdrop-blur-xs">
                  {rec.crop.category} • {rec.crop.durationDays} Days
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3.5">
                <div>
                  <h3 className="font-extrabold text-base text-stone-900 leading-tight">
                    {rec.crop.name}
                  </h3>
                  <p className="text-xs text-stone-500 italic">{rec.crop.scientificName}</p>
                </div>

                {/* Financial estimates */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-stone-50 border border-stone-200 text-center">
                  <div>
                    <p className="text-[10px] text-stone-500 font-medium">Est. Cost</p>
                    <p className="text-xs font-extrabold text-stone-900">
                      ₹{(rec.estimatedInvestmentPerAcre / 1000).toFixed(0)}k/ac
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-500 font-medium">Avg Yield</p>
                    <p className="text-xs font-extrabold text-stone-900">
                      {rec.estimatedYieldQuintals} Qtl
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-500 font-medium">Est. Profit</p>
                    <p className="text-xs font-extrabold text-emerald-700">
                      +₹{(rec.estimatedNetProfitPerAcre / 1000).toFixed(0)}k/ac
                    </p>
                  </div>
                </div>

                {/* Agronomic Reasons */}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                    Why Recommended:
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
                Agronomy Details
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
                  {activeCropDetail.suitabilityScorePercent}% Agronomic Match
                </Badge>
                <h2 className="text-xl font-extrabold text-stone-900 mt-1.5">
                  {activeCropDetail.crop.name}
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
                <p className="text-[10px] text-stone-500 font-medium">Duration</p>
                <p className="font-extrabold text-stone-900 mt-0.5">
                  {activeCropDetail.crop.durationDays} Days
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <p className="text-[10px] text-stone-500 font-medium">Water Need</p>
                <p className="font-extrabold text-stone-900 mt-0.5">
                  {activeCropDetail.crop.waterRequirement}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <p className="text-[10px] text-stone-500 font-medium">Optimal pH</p>
                <p className="font-extrabold text-stone-900 mt-0.5">
                  {activeCropDetail.crop.optimalPhRange.join(' - ')}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <p className="text-[10px] text-stone-500 font-medium">Seed Rate/Acre</p>
                <p className="font-extrabold text-stone-900 text-[11px] truncate mt-0.5">
                  {activeCropDetail.crop.seedRatePerAcre}
                </p>
              </div>
            </div>

            {/* Spacing */}
            <div className="space-y-1.5 text-xs text-stone-700">
              <p className="font-bold text-stone-900">Recommended Spacing:</p>
              <p className="p-3 bg-stone-50 border border-stone-200 rounded-2xl">
                {activeCropDetail.crop.spacing}
              </p>
            </div>

            {/* Fertilizer Guide */}
            <div className="space-y-1.5 text-xs text-stone-700">
              <p className="font-bold text-stone-900">Fertilizer Application Schedule:</p>
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
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setActiveCropDetail(null);
                  onNavigateTab('calendar');
                }}
              >
                Add to My Crop Calendar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

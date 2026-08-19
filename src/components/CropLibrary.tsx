import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Droplets,
  Calendar,
  Layers,
  Bug,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { FarmerProfile, CropInfo, CropCategory } from '../types/farming';
import { CROP_LIBRARY } from '../data/cropLibraryData';
import { getTranslation } from '../data/i18n';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { SectionHeader } from './ui/SectionHeader';

interface CropLibraryProps {
  farmer: FarmerProfile;
  onNavigateTab: (tab: string) => void;
}

export const CropLibrary: React.FC<CropLibraryProps> = ({ farmer, onNavigateTab }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCrop, setSelectedCrop] = useState<CropInfo>(CROP_LIBRARY[0]);

  const lang = farmer.preferredLanguage;

  const filteredCrops = CROP_LIBRARY.filter((crop) => {
    const localName = crop.localNames[lang] || crop.name;
    const matchesSearch =
      crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      localName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crop.scientificName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || crop.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header */}
      <SectionHeader
        title="Crop Knowledge & Package of Practices"
        subtitle="Comprehensive agronomy dossiers verified by ICAR and State Agricultural Universities (SAUs) • Spacing, fertilizer schedules, critical irrigation windows, and IPM protocols"
        badge={
          <Badge variant="primary" size="sm">
            <BookOpen className="w-3.5 h-3.5 mr-1" />
            ICAR Certified POP
          </Badge>
        }
      />

      {/* Search & Filter Bar */}
      <Card variant="standard" padding="md">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search crop in English or regional name..."
              className="agri-input pl-10 pr-4 py-2 text-xs sm:text-sm"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto scrollbar-none">
            {['All', 'Cereals', 'Commercial', 'Oilseeds', 'Spices', 'Fruits', 'Vegetables'].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-emerald-800 text-white'
                      : 'bg-stone-100 text-stone-600 hover:text-stone-900 border border-stone-200'
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>
        </div>
      </Card>

      {/* Main 2-Column Library: List on left, Full Dossier on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Crops list (4 cols) */}
        <div className="lg:col-span-4 space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
          {filteredCrops.map((crop) => (
            <button
              key={crop.id}
              onClick={() => setSelectedCrop(crop)}
              className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
                selectedCrop.id === crop.id
                  ? 'bg-emerald-50/80 border-emerald-400 shadow-xs'
                  : 'bg-white border-stone-200 hover:border-emerald-300'
              }`}
            >
              <img
                src={crop.imageUrl}
                alt={crop.name}
                className="w-14 h-14 rounded-xl object-cover shrink-0 bg-stone-100"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <Badge variant="neutral" size="sm">
                    {crop.category}
                  </Badge>
                  <span className="text-[10px] text-stone-500 font-medium">
                    {crop.durationDays} Days
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-stone-900 truncate mt-1">
                  {crop.name}
                </h4>
                <p className="text-xs text-emerald-800 font-bold truncate">
                  {crop.localNames[lang] || crop.localNames.hi || crop.name}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Right: Detailed Dossier for Selected Crop (8 cols) */}
        <div className="lg:col-span-8">
          <Card variant="standard" padding="lg" className="space-y-6">
            {/* Header Banner for selected crop */}
            <div className="flex flex-col sm:flex-row gap-5 pb-5 border-b border-stone-200">
              <img
                src={selectedCrop.imageUrl}
                alt={selectedCrop.name}
                className="w-full sm:w-48 h-36 rounded-2xl object-cover shadow-xs border border-stone-200"
              />
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="primary" size="sm">
                    {selectedCrop.category}
                  </Badge>
                  <span className="text-xs text-stone-500 italic">
                    {selectedCrop.scientificName}
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-stone-900">
                  {selectedCrop.name}
                </h2>
                <p className="text-sm font-bold text-emerald-800">
                  {selectedCrop.localNames[lang] || selectedCrop.localNames.hi}
                </p>
                <p className="text-xs text-stone-600">
                  <strong className="text-stone-800">Major Producing States:</strong>{' '}
                  {selectedCrop.suitableStates.join(', ')}
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <p className="text-[10px] text-stone-500 font-medium">Sowing Season</p>
                <p className="font-extrabold text-stone-900 mt-0.5">
                  {selectedCrop.optimalSeason.join(', ')}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <p className="text-[10px] text-stone-500 font-medium">Duration</p>
                <p className="font-extrabold text-stone-900 mt-0.5">
                  {selectedCrop.durationDays} Days
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <p className="text-[10px] text-stone-500 font-medium">Water Need</p>
                <p className="font-extrabold text-stone-900 mt-0.5">
                  {selectedCrop.waterRequirement}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <p className="text-[10px] text-stone-500 font-medium">Soil pH Range</p>
                <p className="font-extrabold text-stone-900 mt-0.5">
                  {selectedCrop.optimalPhRange.join(' - ')}
                </p>
              </div>
            </div>

            {/* Sowing, Seed Rate & Spacing */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Seed Rate & Field Spacing
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-700">
                <div>
                  <span className="font-bold text-stone-900">Seed Rate: </span>
                  <span>{selectedCrop.seedRatePerAcre}</span>
                </div>
                <div>
                  <span className="font-bold text-stone-900">Plant Spacing: </span>
                  <span>{selectedCrop.spacing}</span>
                </div>
              </div>
            </div>

            {/* Fertilizer Schedule */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-700" />
                <span>Nutrient & Fertilizer Management Schedule</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl">
                  <span className="font-bold text-amber-900">
                    1. Basal Application (At Sowing):{' '}
                  </span>
                  <span className="text-stone-800">{selectedCrop.fertilizerSchedule.basal}</span>
                </div>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl">
                  <span className="font-bold text-emerald-900">
                    2. Active Vegetative / Tillering Stage:{' '}
                  </span>
                  <span className="text-stone-800">
                    {selectedCrop.fertilizerSchedule.vegetative}
                  </span>
                </div>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl">
                  <span className="font-bold text-teal-900">
                    3. Reproductive / Flowering Stage:{' '}
                  </span>
                  <span className="text-stone-800">
                    {selectedCrop.fertilizerSchedule.flowering}
                  </span>
                </div>
              </div>
            </div>

            {/* Critical Irrigation Stages */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-sky-600" />
                <span>Critical Irrigation Stages (Zero Moisture Stress Windows)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700">
                {selectedCrop.irrigationCriticalStages.map((stage, i) => (
                  <div
                    key={i}
                    className="p-3 bg-sky-50/50 border border-sky-200 rounded-2xl flex items-start gap-2"
                  >
                    <span className="font-extrabold text-sky-700">{i + 1}.</span>
                    <span>{stage}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Major Pests & Diseases */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <Bug className="w-4 h-4 text-rose-700" />
                <span>Major Pests & Integrated Pest Management (IPM)</span>
              </h3>
              <div className="space-y-3">
                {selectedCrop.majorPestsAndDiseases.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-stone-900 text-sm">{item.name}</span>
                      <Badge
                        variant={item.type === 'Disease' ? 'warning' : 'danger'}
                        size="sm"
                      >
                        {item.type}
                      </Badge>
                    </div>
                    <p className="text-stone-600">
                      <strong className="text-stone-800">Symptoms:</strong> {item.symptoms}
                    </p>
                    <p className="text-emerald-900 font-medium">
                      <strong>🌿 Organic / Biological Control:</strong> {item.organicRemedy}
                    </p>
                    <p className="text-stone-700">
                      <strong>🧪 Chemical Management:</strong> {item.chemicalRemedy}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Harvest Indicators */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-950">
              <span className="font-bold text-amber-900">🌾 Harvest Maturity Indicators: </span>
              <span>{selectedCrop.harvestIndicators}</span>
            </div>

            {/* Source Citation */}
            <div className="pt-3 border-t border-stone-200 text-[11px] text-stone-500 flex items-center justify-between">
              <span>Verified Source: {selectedCrop.sourceDoc}</span>
              <button
                onClick={() => onNavigateTab('planner')}
                className="text-emerald-800 font-bold hover:underline cursor-pointer"
              >
                Check Suitability for Your Farm →
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

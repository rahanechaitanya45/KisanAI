import React, { useState, useRef } from 'react';
import {
  Camera,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Bug,
  CheckCircle2,
  PhoneCall,
  BookOpen,
  Eye,
} from 'lucide-react';
import {
  FarmerProfile,
  FarmPlot,
  WeatherContext,
  CropHealthAnalysis,
} from '../types/farming';
import { useI18n } from '../context/I18nContext';
import { diagnoseCropHealth } from '../services/aiService';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { SectionHeader } from './ui/SectionHeader';
import { EmptyState } from './ui/EmptyState';

import leafSample1 from '../assets/images/regenerated_image_1787314298760.webp';
import leafSample2 from '../assets/images/regenerated_image_1787314300976.jpg';
import leafSample3 from '../assets/images/regenerated_image_1787314302616.jpg';
import leafSample4 from '../assets/images/regenerated_image_1787314304460.webp';

interface CropHealthScannerProps {
  farmer: FarmerProfile;
  selectedPlot: FarmPlot;
  weather: WeatherContext;
  onEscalateToExpert: (analysis: CropHealthAnalysis) => void;
  onNavigateTab: (tab: string) => void;
}

const SAMPLE_LEAF_IMAGES = [
  {
    id: 'sample-paddy-blast',
    crop: 'Paddy',
    cropKey: 'paddy',
    disease: 'Rice Blast (Magnaporthe oryzae)',
    url: leafSample1,
    description: 'Spindle shaped necrotic lesions with ash grey center on leaf blade.',
  },
  {
    id: 'sample-wheat-rust',
    crop: 'Wheat',
    cropKey: 'wheat',
    disease: 'Yellow Stripe Rust',
    url: leafSample2,
    description: 'Linear yellow powdery pustules forming stripes on foliage.',
  },
  {
    id: 'sample-cotton-pest',
    crop: 'Cotton',
    cropKey: 'cotton',
    disease: 'Pink Bollworm / Sucking Pest Stress',
    url: leafSample3,
    description: 'Rosetted flower petals and leaf curling with yellowing.',
  },
  {
    id: 'sample-tomato-blight',
    crop: 'Tomato',
    cropKey: 'tomato',
    disease: 'Early / Late Leaf Blight',
    url: leafSample4,
    description: 'Target-board concentric brown rings on lower leaves with yellow halo.',
  },
];

export const CropHealthScanner: React.FC<CropHealthScannerProps> = ({
  farmer,
  selectedPlot,
  weather,
  onEscalateToExpert,
  onNavigateTab,
}) => {
  const { t, language, lookupAgro } = useI18n();
  const [selectedImage, setSelectedImage] = useState<string | null>(leafSample4);
  const [observedSymptoms, setObservedSymptoms] = useState(SAMPLE_LEAF_IMAGES[3].description);
  const [isScanning, setIsScanning] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CropHealthAnalysis | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentCrop = selectedPlot?.currentCropSeason;
  const localizedCrop = currentCrop?.cropName ? lookupAgro('crops', currentCrop.cropName) : t('common.noData');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSample = (sample: typeof SAMPLE_LEAF_IMAGES[0]) => {
    setSelectedImage(sample.url);
    setObservedSymptoms(sample.description);
    setAnalysisResult(null);
  };

  const handleStartScan = async () => {
    if (!selectedImage) return;
    setIsScanning(true);

    try {
      const cropName = selectedPlot?.currentCropSeason?.cropName || 'Field Crop';
      const contextPayload = {
        farmer,
        plot: selectedPlot,
        cropSeason: selectedPlot?.currentCropSeason,
        soil: selectedPlot?.soil,
        weather,
      };

      const result = await diagnoseCropHealth(
        selectedImage,
        cropName,
        observedSymptoms,
        contextPayload,
        language
      );

      setAnalysisResult(result);
    } catch (e) {
      console.error('Diagnosis error:', e);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header Banner */}
      <SectionHeader
        title={t('scanner.title')}
        subtitle={`${t('profile.farmName')}: ${selectedPlot?.name} (${localizedCrop}) • ${t('scanner.diagnosisSubtitle')}`}
        badge={
          <Badge variant="primary" size="sm">
            {t('scanner.title')}
          </Badge>
        }
        action={
          <div className="flex items-center gap-2 p-2 px-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <PhoneCall className="w-4 h-4 text-amber-700" />
            <div>
              <span className="font-bold">Kisan Call Centre:</span> 1800-180-1551 (Toll-Free)
            </div>
          </div>
        }
      />

      {/* Main Scanner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Upload & Sample Selection (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card variant="standard" padding="lg">
            <h2 className="text-sm font-extrabold text-stone-900 flex items-center gap-2 mb-3">
              <Camera className="w-4 h-4 text-emerald-700" />
              <span>1. {t('scanner.uploadCropPhoto')}</span>
            </h2>

            {/* Drop / Capture Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[220px] relative overflow-hidden ${
                selectedImage
                  ? 'border-emerald-500 bg-emerald-50/40'
                  : 'border-stone-300 hover:border-emerald-500 bg-stone-50/50 hover:bg-stone-50'
              }`}
            >
              {selectedImage ? (
                <div className="w-full relative group">
                  <img
                    src={selectedImage}
                    alt="Uploaded Leaf"
                    className="w-full h-52 object-cover rounded-xl shadow-xs"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white text-xs font-bold">
                    {t('scanner.takePhoto')}
                  </div>
                </div>
              ) : (
                <div className="text-center p-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto mb-2.5 border border-emerald-200">
                    <Camera className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-stone-900">
                    {t('scanner.uploadCropPhoto')}
                  </p>
                  <p className="text-[11px] text-stone-500 mt-1">
                    JPG, PNG (Max 10MB)
                  </p>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Symptoms description */}
            <div className="mt-3">
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                {t('scanner.observedSymptoms')}
              </label>
              <textarea
                value={observedSymptoms}
                onChange={(e) => setObservedSymptoms(e.target.value)}
                placeholder={t('scanner.symptomsPlaceholder')}
                className="agri-input text-xs"
                rows={2}
              />
            </div>

            {/* Diagnosis Button */}
            <div className="mt-4">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                leftIcon={<Sparkles className="w-4 h-4 text-emerald-200" />}
                onClick={handleStartScan}
                disabled={!selectedImage || isScanning}
                isLoading={isScanning}
              >
                <span>{isScanning ? t('scanner.analyzingPlant') : t('scanner.diagnose')}</span>
              </Button>
            </div>
          </Card>

          {/* Sample Leaves Gallery for Quick Demo */}
          <Card variant="highlight" padding="md">
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t('scanner.sampleLeaves')}</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {SAMPLE_LEAF_IMAGES.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className={`p-2 rounded-xl text-left border transition-all flex flex-col items-start gap-1.5 cursor-pointer ${
                    selectedImage === sample.url
                      ? 'border-emerald-500 bg-white ring-2 ring-emerald-500/20'
                      : 'border-stone-200 hover:border-emerald-300 bg-white/80'
                  }`}
                >
                  <img
                    src={sample.url}
                    alt={sample.crop}
                    className="w-full h-16 object-cover rounded-lg"
                  />
                  <div>
                    <p className="text-xs font-bold text-stone-900 leading-tight">
                      {lookupAgro('crops', sample.crop)}
                    </p>
                    <p className="text-[10px] text-stone-500 truncate">{sample.disease}</p>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: AI Diagnosis Results (7 cols) */}
        <div className="lg:col-span-7">
          {analysisResult ? (
            <Card variant="standard" padding="lg" className="space-y-5 animate-in fade-in">
              {/* Header result */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="warning" size="sm">
                      <Bug className="w-3 h-3 mr-1" />
                      {t('scanner.suspectedIssue')}
                    </Badge>
                    <Badge variant="success" size="sm">
                      {analysisResult.confidenceLevel} ({analysisResult.confidencePercent}%)
                    </Badge>
                  </div>
                  <h2 className="text-xl font-extrabold text-stone-900 mt-2 tracking-tight">
                    {analysisResult.suspectedIssue}
                  </h2>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<PhoneCall className="w-3.5 h-3.5 text-purple-700" />}
                  onClick={() => onEscalateToExpert(analysisResult)}
                >
                  <span>{t('scanner.escalateToExpert')}</span>
                </Button>
              </div>

              {/* Observed Symptoms */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>{t('scanner.observedSymptoms')}</span>
                </h3>
                <ul className="space-y-1 pl-1 text-xs text-stone-700">
                  {analysisResult.observedSymptoms.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-700 font-bold">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Immediate Action & Dosages */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>{t('scanner.immediateAction')}</span>
                </h3>
                <ul className="space-y-1.5 text-xs text-emerald-900 font-medium">
                  {analysisResult.immediateActions.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="font-bold text-emerald-700">{idx + 1}.</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Organic IPM / Biological Solution */}
              {analysisResult.organicIPMSolution && (
                <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-1">
                  <h3 className="text-xs font-bold text-teal-950 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-teal-700" />
                    <span>{t('scanner.organicControl')}</span>
                  </h3>
                  <p className="text-xs text-teal-900 font-medium leading-relaxed">
                    {analysisResult.organicIPMSolution}
                  </p>
                </div>
              )}

              {/* Safety & Caution Box */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" />
                  <span>{t('scanner.safetyCaution')}</span>
                </div>
                <p className="leading-relaxed">{analysisResult.safetyCaution}</p>
                <p className="text-[11px] text-amber-800 font-medium italic pt-1">
                  ⚠️ <em>{analysisResult.whenToConsultExpert}</em>
                </p>
              </div>

              {/* Verified Source Citation */}
              <div className="pt-3 flex items-center justify-between text-[11px] text-stone-500 border-t border-stone-100">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Source: {analysisResult.verifiedSource}</span>
                </span>
                <span>Diagnosis ID: {analysisResult.id.slice(0, 14)}</span>
              </div>
            </Card>
          ) : (
            <Card variant="standard" padding="lg">
              <EmptyState
                icon={<Camera className="w-8 h-8 text-stone-400" />}
                title={t('scanner.noScanTitle')}
                description={t('scanner.noScanDescription')}
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

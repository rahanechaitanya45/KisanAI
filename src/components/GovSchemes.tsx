import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  FileText,
  Search,
  Sparkles,
  X,
  RefreshCw,
  AlertCircle,
  MessageSquare,
  Landmark,
  BadgePercent,
  Check,
} from 'lucide-react';
import { FarmerProfile, GovernmentScheme } from '../types/farming';
import { schemeService, SchemeResponse } from '../services/schemeService';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { SectionHeader } from './ui/SectionHeader';
import { useI18n } from '../context/I18nContext';

interface GovSchemesProps {
  farmer: FarmerProfile;
  onNavigateTab: (tab: string, extraData?: any) => void;
}

export const GovSchemes: React.FC<GovSchemesProps> = ({ farmer, onNavigateTab }) => {
  const { t, lookupAgro } = useI18n();
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ source: string; lastSyncTime: string }>({
    source: 'National DB (myScheme.gov.in)',
    lastSyncTime: '',
  });

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [selectedState, setSelectedState] = useState<string>('All States');
  const [selectedLevel, setSelectedLevel] = useState<'All' | 'Central' | 'State'>('All');
  const [eligibleOnly, setEligibleOnly] = useState<boolean>(false);

  // Available Filter Options
  const [categoriesList, setCategoriesList] = useState<string[]>(['All Categories']);
  const [statesList, setStatesList] = useState<string[]>(['All States']);

  // Modal State
  const [selectedScheme, setSelectedScheme] = useState<GovernmentScheme | null>(null);

  // Fetch initial filter lists
  useEffect(() => {
    async function loadOptions() {
      const [cats, sts] = await Promise.all([
        schemeService.getCategories(),
        schemeService.getStates(),
      ]);
      setCategoriesList(cats);
      setStatesList(sts);
    }
    loadOptions();
  }, []);

  // Fetch schemes from service layer
  const fetchSchemes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res: SchemeResponse = await schemeService.getSchemes(
        {
          state: selectedState,
          category: selectedCategory,
          level: selectedLevel,
          search: searchQuery,
          eligibleOnly,
        },
        farmer
      );

      if (res && res.data) {
        setSchemes(res.data);
        setMeta({
          source: res.source,
          lastSyncTime: res.lastSyncTime,
        });
      }
    } catch (err: any) {
      console.error('Failed to load schemes:', err);
      setError('Unable to load government welfare schemes. Please click Retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [selectedCategory, selectedState, selectedLevel, eligibleOnly, farmer]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSchemes();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setSelectedState('All States');
    setSelectedLevel('All');
    setEligibleOnly(false);
  };

  // Farmer matched count
  const matchedCount = useMemo(() => {
    return schemes.filter((s) => s.isEligibleForCurrentFarmer).length;
  }, [schemes]);

  // Safely extract farmer acres and crops
  const farmerAcres = useMemo(() => {
    return (
      farmer.farmSizeAcres ||
      farmer.farms?.reduce((acc, f) => acc + (f.totalAreaAcres || 0), 0) ||
      2.5
    );
  }, [farmer]);

  const farmerCropsList = useMemo(() => {
    if (farmer.crops && farmer.crops.length > 0) return farmer.crops;
    const fromPlots = farmer.farms?.flatMap((f) =>
      f.plots?.map((p) => p.currentCropSeason?.cropName).filter((c): c is string => Boolean(c))
    ) || [];
    return fromPlots.length > 0 ? fromPlots : ['Paddy', 'Wheat'];
  }, [farmer]);

  return (
    <div id="gov-schemes-container" className="space-y-6 pb-14 animate-in fade-in duration-300">
      {/* Header */}
      <SectionHeader
        title={t('schemes.title')}
        subtitle={t('schemes.subtitle')}
        badge={
          <Badge variant="primary" size="sm" className="bg-emerald-50 text-emerald-800 border-emerald-200">
            <Building2 className="w-3.5 h-3.5 mr-1 text-emerald-700" />
            <span>Official DBT & State Portals</span>
          </Badge>
        }
        action={
          <div className="flex items-center gap-2">
            <Button
              id="refresh-schemes-btn"
              variant="outline"
              size="sm"
              onClick={fetchSchemes}
              disabled={loading}
              className="bg-white border-stone-300 text-stone-700 hover:bg-stone-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin text-emerald-600' : 'text-stone-500'}`} />
              <span>{loading ? t('common.loading') : t('common.refresh')}</span>
            </Button>
            <a
              href="https://myscheme.gov.in"
              target="_blank"
              rel="noreferrer noopener"
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition border border-stone-200"
            >
              <span>myscheme.gov.in</span>
              <ExternalLink className="w-3 h-3 text-stone-400" />
            </a>
          </div>
        }
      />

      {/* Profile Suitability Callout Banner */}
      <Card variant="standard" padding="md" className="bg-gradient-to-r from-emerald-50 via-white to-amber-50/50 border-emerald-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-stone-900">
                  {farmer.name || 'Farmer'} ({farmerAcres} {t('common.acre')} - {farmer.state})
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {farmerAcres <= 5 ? 'Small & Marginal' : 'Medium Landholding'}
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                Crops: {farmerCropsList.map(c => lookupAgro('crops', c)).join(', ')} • <strong>{matchedCount} {t('schemes.eligible')}</strong>
              </p>
            </div>
          </div>

          <Button
            variant={eligibleOnly ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setEligibleOnly(!eligibleOnly)}
            className={eligibleOnly ? 'bg-emerald-800 text-white' : 'border-emerald-300 text-emerald-900 bg-white hover:bg-emerald-50'}
          >
            <BadgePercent className="w-3.5 h-3.5 mr-1" />
            <span>{eligibleOnly ? t('common.all') : t('schemes.eligible')}</span>
          </Button>
        </div>
      </Card>

      {/* Search and Filters Bar */}
      <Card variant="standard" padding="md" className="bg-white border-stone-200">
        <div className="space-y-3">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full lg:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="scheme-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common.search')}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dropdowns */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <select
                id="scheme-level-select"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as any)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-stone-50 border border-stone-200 focus:bg-white"
              >
                <option value="All">{t('common.all')}</option>
                <option value="Central">Central Govt Schemes</option>
                <option value="State">State Specific Schemes</option>
              </select>

              <select
                id="scheme-category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-stone-50 border border-stone-200 focus:bg-white"
              >
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All Categories' ? t('common.all') : cat}
                  </option>
                ))}
              </select>

              <select
                id="scheme-state-select"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-stone-50 border border-stone-200 focus:bg-white"
              >
                {statesList.map((s) => (
                  <option key={s} value={s}>
                    {s === 'All States' ? t('common.all') : s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs text-stone-500">
            <span>
              {schemes.length} {t('schemes.title')}
            </span>
            <span>
              Source: <strong className="text-stone-700">{meta.source}</strong>
            </span>
          </div>
        </div>
      </Card>

      {/* Error State */}
      {!loading && error && (
        <Card variant="standard" padding="lg" className="bg-rose-50 border-rose-200 text-rose-900 space-y-3">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <span>Connection Warning</span>
          </div>
          <p className="text-xs text-rose-800 leading-relaxed">{error}</p>
          <Button variant="primary" size="sm" onClick={fetchSchemes} className="bg-rose-700 hover:bg-rose-800 text-white">
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            {t('common.refresh')}
          </Button>
        </Card>
      )}

      {/* Schemes Grid */}
      {!loading && !error && schemes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {schemes.map((scheme) => {
            const isCentral = scheme.level === 'Central' || scheme.applicableStates.includes('All');

            return (
              <Card
                key={scheme.id}
                variant="standard"
                padding="lg"
                className="flex flex-col justify-between space-y-4 bg-white hover:border-emerald-300 transition shadow-sm"
              >
                <div className="space-y-3.5">
                  {/* Badges Bar */}
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="primary" size="sm" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]">
                      {scheme.category}
                    </Badge>

                    <div className="flex items-center gap-1">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                          isCentral ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {isCentral ? 'Central Scheme' : `${scheme.applicableStates.join(', ')} State`}
                      </span>
                    </div>
                  </div>

                  {/* Titles */}
                  <div>
                    <h3 className="text-base font-black text-stone-900 leading-snug">
                      {scheme.title || scheme.name}
                    </h3>
                    {scheme.hindiTitle && (
                      <p className="text-xs font-bold text-emerald-800 mt-0.5">
                        {scheme.hindiTitle}
                      </p>
                    )}
                    <p className="text-xs text-stone-600 mt-1.5 leading-relaxed font-medium line-clamp-2">
                      {scheme.shortDescription}
                    </p>
                  </div>

                  {/* Financial Benefit Callout */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                    <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                      {t('schemes.benefit')}:
                    </p>
                    <p className="text-xs font-black text-stone-900 leading-snug">
                      {scheme.financialBenefit}
                    </p>
                  </div>

                  {/* Suitability Match Reason */}
                  {scheme.matchReasons && scheme.matchReasons.length > 0 && (
                    <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80 text-[11px] text-emerald-950 flex items-start gap-1.5 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                      <span>{scheme.matchReasons[0]}</span>
                    </div>
                  )}

                  {/* Documents Checklist Count */}
                  <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                    <span className="flex items-center gap-1 font-medium">
                      <FileText className="w-3.5 h-3.5 text-stone-400" />
                      {scheme.requiredDocuments.length} {t('schemes.documents')}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      Verified: {scheme.lastVerifiedAt || scheme.verifiedAt || '2026'}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-stone-200 flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedScheme(scheme)}
                    className="text-stone-700 hover:bg-stone-50 text-xs font-bold"
                  >
                    {t('schemes.eligibility')}
                  </Button>

                  <a
                    href={scheme.officialPortalUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1 transition shadow-xs"
                  >
                    <span>{t('schemes.applyOnline')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Comprehensive Detail & Application Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <Card
            variant="standard"
            padding="lg"
            className="max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4 bg-white border-stone-200"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-stone-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="primary" size="sm" className="bg-emerald-100 text-emerald-800">
                    {selectedScheme.category}
                  </Badge>
                  <span className="text-xs font-bold text-stone-500">
                    {selectedScheme.level} Level Scheme
                  </span>
                </div>
                <h2 className="text-lg font-black text-stone-900 mt-1.5">
                  {selectedScheme.title || selectedScheme.name}
                </h2>
                {selectedScheme.hindiTitle && (
                  <p className="text-xs font-bold text-emerald-800 mt-0.5">
                    {selectedScheme.hindiTitle}
                  </p>
                )}
                <p className="text-xs text-stone-500 mt-1 font-medium">
                  {selectedScheme.department}
                </p>
              </div>
              <button
                onClick={() => setSelectedScheme(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Financial Support Detail */}
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                {t('schemes.benefit')}
              </span>
              <p className="text-xs font-extrabold text-emerald-950 leading-relaxed">
                {selectedScheme.financialBenefit}
              </p>
            </div>

            {/* Direct Benefits Checklist */}
            {selectedScheme.benefits && selectedScheme.benefits.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-extrabold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>{t('schemes.benefit')}</span>
                </h3>
                <ul className="space-y-1.5 text-xs text-stone-700 font-medium">
                  {selectedScheme.benefits.map((b, i) => (
                    <li key={i} className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Eligibility Conditions */}
            {selectedScheme.eligibilityConditions && selectedScheme.eligibilityConditions.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-extrabold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-stone-700" />
                  <span>{t('schemes.eligibility')}</span>
                </h3>
                <ul className="space-y-1 text-xs text-stone-700 font-medium">
                  {selectedScheme.eligibilityConditions.map((e, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                      <span>{e}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Required Documents Checklist */}
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-700" />
                <span>{t('schemes.documents')}</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-800">
                {selectedScheme.requiredDocuments.map((doc, i) => (
                  <div key={i} className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl flex items-center gap-2 font-medium">
                    <span className="text-emerald-700 font-black">✓</span>
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-stone-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const s = selectedScheme;
                  setSelectedScheme(null);
                  onNavigateTab('chat', {
                    initialPrompt: `How do I apply for ${s.title || s.name} in ${farmer.state}?`,
                  });
                }}
                className="text-emerald-900 border-emerald-300 hover:bg-emerald-50 text-xs font-bold"
              >
                <MessageSquare className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                <span>{t('chat.placeholder')}</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setSelectedScheme(null)}>
                  {t('common.cancel')}
                </Button>
                <a
                  href={selectedScheme.officialPortalUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-extrabold flex items-center gap-1.5 transition shadow-xs"
                >
                  <span>{t('schemes.applyOnline')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

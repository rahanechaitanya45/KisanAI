import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Search,
  MapPin,
  Coins,
  ShieldCheck,
  Calendar,
  Sparkles,
  RefreshCw,
  BarChart3,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { FarmerProfile, MandiRecord } from '../types/farming';
import { mandiService, MandiResponse, MandiSummaryStats } from '../services/mandiService';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { SectionHeader } from './ui/SectionHeader';

interface MandiMarketProps {
  farmer: FarmerProfile;
  onNavigateTab: (tab: string, extraData?: any) => void;
}

export const MandiMarket: React.FC<MandiMarketProps> = ({ farmer, onNavigateTab }) => {
  const [prices, setPrices] = useState<MandiRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ source: string; isLive: boolean; lastSyncTime: string }>({
    source: 'Agmarknet (Govt. of India)',
    isLive: true,
    lastSyncTime: '',
  });
  const [summary, setSummary] = useState<MandiSummaryStats | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('All States');
  const [selectedCommodity, setSelectedCommodity] = useState<string>('All Crops');
  const [sortBy, setSortBy] = useState<'modalPriceDesc' | 'modalPriceAsc' | 'commodity' | 'market'>('modalPriceDesc');
  const [quickFilter, setQuickFilter] = useState<'all' | 'my-crops' | 'above-msp'>('all');

  // Available options
  const [statesList, setStatesList] = useState<string[]>(['All States']);
  const [commoditiesList, setCommoditiesList] = useState<string[]>(['All Crops']);

  // Expanded historical chart view tracking
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // Load available states & crops list
  useEffect(() => {
    async function loadFilterOptions() {
      const [sts, cmds] = await Promise.all([
        mandiService.getStates(),
        mandiService.getCommodities(),
      ]);
      setStatesList(sts);
      setCommoditiesList(cmds);
    }
    loadFilterOptions();
  }, []);

  // Main data fetching function
  const fetchMandiData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res: MandiResponse = await mandiService.getPrices({
        state: selectedState,
        commodity: selectedCommodity,
        search: searchQuery,
        sortBy,
      });

      if (res && res.data) {
        setPrices(res.data);
        setMeta({
          source: res.source,
          isLive: res.isLive,
          lastSyncTime: res.lastSyncTime,
        });

        const stats = await mandiService.getSummaryStats(res.data);
        setSummary(stats);
      }
    } catch (err: any) {
      console.error('Failed to load Mandi rates:', err);
      setError('Unable to reach market price gateway. Click Retry to reload.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMandiData();
  }, [selectedState, selectedCommodity, sortBy]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMandiData();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Extract active crops safely
  const farmerCropsList = useMemo(() => {
    if (farmer.crops && farmer.crops.length > 0) return farmer.crops;
    const fromPlots = farmer.farms?.flatMap((f) =>
      f.plots?.map((p) => p.currentCropSeason?.cropName).filter((c): c is string => Boolean(c))
    ) || [];
    return fromPlots.length > 0 ? fromPlots : ['Paddy', 'Wheat'];
  }, [farmer]);

  // Quick filter post-processing
  const displayedPrices = useMemo(() => {
    let result = [...prices];
    const farmerCrops = farmerCropsList.map((c) => c.toLowerCase());

    if (quickFilter === 'my-crops') {
      result = result.filter((item) =>
        farmerCrops.some(
          (fc) => item.commodity.toLowerCase().includes(fc) || fc.includes(item.commodity.toLowerCase())
        )
      );
    } else if (quickFilter === 'above-msp') {
      result = result.filter((item) => {
        const msp = item.mspPrice || item.mspPriceQuintal || 0;
        const modal = item.modalPrice || item.modalPriceQuintal || 0;
        return msp > 0 && modal > msp;
      });
    }

    return result;
  }, [prices, quickFilter, farmerCropsList]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedState('All States');
    setSelectedCommodity('All Crops');
    setSortBy('modalPriceDesc');
    setQuickFilter('all');
  };

  return (
    <div id="mandi-market-container" className="space-y-6 pb-14 animate-in fade-in duration-300">
      {/* Header with Live Agmarknet Badge */}
      <SectionHeader
        title="APMC Mandi Intelligence & MSP Benchmarks"
        subtitle={`Live wholesale arrival prices, government MSP parity, and crop market timing advisory for ${farmer.district || 'India'}, ${farmer.state || 'National'}`}
        badge={
          <Badge variant="primary" size="sm" className="bg-emerald-50 text-emerald-800 border-emerald-200">
            <Coins className="w-3.5 h-3.5 mr-1 text-emerald-700" />
            <span>Agmarknet & eNAM Synced</span>
          </Badge>
        }
        action={
          <div className="flex items-center gap-2">
            <Button
              id="refresh-mandi-btn"
              variant="outline"
              size="sm"
              onClick={fetchMandiData}
              disabled={loading}
              className="bg-white border-stone-300 text-stone-700 hover:bg-stone-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin text-emerald-600' : 'text-stone-500'}`} />
              <span>{loading ? 'Updating...' : 'Sync Rates'}</span>
            </Button>
            <a
              href="https://agmarknet.gov.in"
              target="_blank"
              rel="noreferrer noopener"
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition border border-stone-200"
            >
              <span>agmarknet.gov.in</span>
              <ExternalLink className="w-3 h-3 text-stone-400" />
            </a>
          </div>
        }
      />

      {/* Summary KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <Card variant="standard" padding="md" className="bg-white border-stone-200">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">APMC Mandis</span>
            <p className="text-xl font-extrabold text-stone-900 mt-0.5">{summary.totalMandis} Active</p>
            <span className="text-[11px] text-stone-500">{summary.statesCovered} States Monitored</span>
          </Card>

          <Card variant="standard" padding="md" className="bg-white border-stone-200">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Crops Covered</span>
            <p className="text-xl font-extrabold text-stone-900 mt-0.5">{summary.commoditiesCovered} Varieties</p>
            <span className="text-[11px] text-stone-500">Kharif & Rabi Categories</span>
          </Card>

          <Card variant="standard" padding="md" className="bg-white border-stone-200">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Above MSP Rate</span>
            <p className="text-xl font-extrabold text-emerald-800 mt-0.5">{summary.aboveMspCount} Commodities</p>
            <span className="text-[11px] text-emerald-600 font-medium">Trading at premium margin</span>
          </Card>

          <Card variant="standard" padding="md" className="bg-white border-stone-200">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Highest Arrival</span>
            <p className="text-xl font-extrabold text-stone-900 mt-0.5 truncate">
              {summary.topArrivals ? summary.topArrivals.commodity.split(' ')[0] : 'Wheat'}
            </p>
            <span className="text-[11px] text-stone-500">
              {summary.topArrivals ? `${summary.topArrivals.arrivalQuantityTons || 0} MT Today` : 'Active trading'}
            </span>
          </Card>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card variant="standard" padding="md" className="bg-white border-stone-200">
        <div className="space-y-3">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full lg:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="mandi-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search crop, variety, or mandi name..."
                className="agri-input pl-10 pr-4 py-2 text-xs sm:text-sm w-full bg-stone-50 border-stone-200 focus:bg-white"
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

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <select
                id="mandi-state-select"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="agri-input text-xs font-semibold py-2 bg-stone-50 border-stone-200 focus:bg-white"
              >
                {statesList.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <select
                id="mandi-commodity-select"
                value={selectedCommodity}
                onChange={(e) => setSelectedCommodity(e.target.value)}
                className="agri-input text-xs font-semibold py-2 bg-stone-50 border-stone-200 focus:bg-white"
              >
                {commoditiesList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                id="mandi-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="agri-input text-xs font-semibold py-2 bg-stone-50 border-stone-200 focus:bg-white"
              >
                <option value="modalPriceDesc">Price: High to Low</option>
                <option value="modalPriceAsc">Price: Low to High</option>
                <option value="commodity">Crop Name (A-Z)</option>
                <option value="market">Mandi Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Quick Segment Filter Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setQuickFilter('all')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  quickFilter === 'all'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                All Mandi Crops ({prices.length})
              </button>
              <button
                onClick={() => setQuickFilter('my-crops')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1 ${
                  quickFilter === 'my-crops'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <span>My Farm Crops</span>
                <span className="text-[10px] opacity-80">({farmerCropsList.join(', ')})</span>
              </button>
              <button
                onClick={() => setQuickFilter('above-msp')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  quickFilter === 'above-msp'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Trading Above MSP 📈
              </button>
            </div>

            <div className="text-[11px] text-stone-500">
              Source: <span className="font-semibold text-stone-700">{meta.source}</span>
              {meta.lastSyncTime && <span className="ml-1">({meta.lastSyncTime})</span>}
            </div>
          </div>
        </div>
      </Card>

      {/* Loading Skeleton State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <Card key={idx} variant="standard" padding="lg" className="animate-pulse space-y-4">
              <div className="space-y-2">
                <div className="h-3 w-28 bg-stone-200 rounded" />
                <div className="h-5 w-44 bg-stone-300 rounded" />
                <div className="h-3 w-36 bg-stone-200 rounded" />
              </div>
              <div className="h-20 bg-stone-100 rounded-xl" />
              <div className="h-12 bg-amber-50 rounded-xl" />
            </Card>
          ))}
        </div>
      )}

      {/* Error Banner */}
      {!loading && error && (
        <Card variant="standard" padding="lg" className="bg-rose-50 border-rose-200 text-rose-900 space-y-3">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <span>Connection Warning</span>
          </div>
          <p className="text-xs text-rose-800 leading-relaxed">{error}</p>
          <Button variant="primary" size="sm" onClick={fetchMandiData} className="bg-rose-700 hover:bg-rose-800 text-white">
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Retry Mandi Data Sync
          </Button>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && displayedPrices.length === 0 && (
        <Card variant="standard" padding="xl" className="text-center py-12 space-y-4 bg-stone-50 border-dashed border-stone-300">
          <div className="w-12 h-12 rounded-full bg-stone-200 text-stone-500 mx-auto flex items-center justify-center">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">No Mandi records found</h3>
            <p className="text-xs text-stone-600 mt-1 max-w-md mx-auto">
              No market arrivals match your selected combination of state, commodity, and search keyword.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={resetFilters}>
            Reset All Filters
          </Button>
        </Card>
      )}

      {/* Mandi Rates Grid */}
      {!loading && !error && displayedPrices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedPrices.map((item) => {
            const modalRate = item.modalPrice || item.modalPriceQuintal || 0;
            const minRate = item.minPrice || item.minPriceQuintal || modalRate;
            const maxRate = item.maxPrice || item.maxPriceQuintal || modalRate;
            const mspRate = item.mspPrice || item.mspPriceQuintal || 0;
            const hasMsp = mspRate > 0;
            const mspDiff = modalRate - mspRate;
            const isAboveMsp = mspDiff >= 0;
            const isExpanded = expandedCardId === item.id;

            return (
              <Card
                key={item.id}
                variant="standard"
                padding="lg"
                className="flex flex-col justify-between space-y-4 bg-white hover:border-emerald-300 transition shadow-sm"
              >
                <div className="space-y-3.5">
                  {/* State & Location Badge Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-extrabold text-stone-500 uppercase tracking-wider">
                        {item.state} • {item.district}
                      </span>
                      <h3 className="text-base font-black text-stone-900 mt-0.5">
                        {item.commodity}
                      </h3>
                      <p className="text-xs font-semibold text-stone-600 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span className="truncate">{item.marketName}</span>
                      </p>
                    </div>

                    <Badge
                      variant={
                        item.trend.toUpperCase() === 'UP'
                          ? 'success'
                          : item.trend.toUpperCase() === 'DOWN'
                          ? 'danger'
                          : 'neutral'
                      }
                      size="sm"
                      className="shrink-0"
                    >
                      {item.trend.toUpperCase() === 'UP' ? (
                        <TrendingUp className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                      ) : item.trend.toUpperCase() === 'DOWN' ? (
                        <TrendingDown className="w-3.5 h-3.5 mr-1 text-rose-700" />
                      ) : (
                        <span className="mr-1">↔</span>
                      )}
                      <span>{item.trend.toUpperCase()}</span>
                    </Badge>
                  </div>

                  {/* Variety & Grade Tag */}
                  <div className="flex items-center gap-2 text-[11px] text-stone-600">
                    <span className="bg-stone-100 px-2 py-0.5 rounded-md font-medium">
                      Variety: <strong className="text-stone-800">{item.variety}</strong>
                    </span>
                    {item.grade && (
                      <span className="bg-stone-100 px-2 py-0.5 rounded-md font-medium">
                        Grade: <strong className="text-stone-800">{item.grade}</strong>
                      </span>
                    )}
                  </div>

                  {/* Modal Price Box */}
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">
                          Modal Rate (Wholesale)
                        </span>
                        <p className="text-2xl font-black text-stone-950 mt-0.5 tracking-tight">
                          ₹{modalRate.toLocaleString('en-IN')}
                          <span className="text-xs font-normal text-stone-500 ml-1">/ Quintal</span>
                        </p>
                      </div>

                      <div className="text-right text-xs">
                        <span className="text-[10px] text-stone-500 font-semibold block">Govt MSP</span>
                        {hasMsp ? (
                          <>
                            <p className="font-extrabold text-stone-800">
                              ₹{mspRate.toLocaleString('en-IN')}
                            </p>
                            <span
                              className={`text-[10px] font-extrabold block ${
                                isAboveMsp ? 'text-emerald-700' : 'text-rose-700'
                              }`}
                            >
                              {isAboveMsp ? `+₹${mspDiff} over MSP` : `-₹${Math.abs(mspDiff)} under MSP`}
                            </span>
                          </>
                        ) : (
                          <span className="text-[10px] text-stone-500 italic">Market Determined</span>
                        )}
                      </div>
                    </div>

                    {/* Range Sub-bar */}
                    <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-600">
                      <span>Min: <strong>₹{minRate.toLocaleString('en-IN')}</strong></span>
                      <span>Max: <strong>₹{maxRate.toLocaleString('en-IN')}</strong></span>
                      {item.arrivalQuantityTons !== undefined && (
                        <span className="text-emerald-800 font-bold">
                          Arrivals: {item.arrivalQuantityTons} MT
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Selling Window Advisory Insight */}
                  {item.bestSellingWindow && (
                    <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/90 text-xs space-y-1">
                      <div className="flex items-center gap-1 font-bold text-amber-950 text-[11px]">
                        <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>Selling Window Advisory</span>
                      </div>
                      <p className="text-[11px] text-amber-950 leading-relaxed font-medium">
                        {item.bestSellingWindow}
                      </p>
                    </div>
                  )}

                  {/* 7-Day History Chart Toggle */}
                  {item.history && item.history.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <button
                        onClick={() => setExpandedCardId(isExpanded ? null : item.id)}
                        className="w-full flex items-center justify-between text-[11px] font-bold text-emerald-800 hover:text-emerald-950 transition py-1"
                      >
                        <span className="flex items-center gap-1">
                          <BarChart3 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{isExpanded ? 'Hide 7-Day Price Trend' : 'View 7-Day Price History'}</span>
                        </span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isExpanded && (
                        <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2 animate-in fade-in">
                          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                            Recent 7-Day Modal Rate Trajectory
                          </span>
                          <div className="grid grid-cols-7 gap-1 text-center">
                            {item.history.map((h, i) => (
                              <div key={i} className="flex flex-col items-center justify-end h-16 space-y-1">
                                <span className="text-[9px] font-bold text-stone-800">₹{h.modalPrice}</span>
                                <div
                                  className="w-full bg-emerald-600 rounded-t-sm"
                                  style={{
                                    height: `${Math.max(15, ((h.modalPrice - 1000) / (maxRate || 3000)) * 40)}px`,
                                  }}
                                />
                                <span className="text-[9px] text-stone-500">{h.date}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Controls & AI Consult */}
                <div className="pt-3 border-t border-stone-200 flex items-center justify-between gap-2 text-xs">
                  <span className="text-[10px] text-stone-500 truncate">
                    {item.lastUpdated || 'Updated today'}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onNavigateTab('chat', {
                        initialPrompt: `What is the price forecast and best selling strategy for my ${item.commodity} (${item.variety}) in ${item.marketName} Mandi (${item.district}, ${item.state})? Current rate is ₹${modalRate}/quintal.`,
                      })
                    }
                    className="text-emerald-900 border-emerald-300 hover:bg-emerald-50 text-[11px] font-bold"
                  >
                    <MessageSquare className="w-3 h-3 mr-1 text-emerald-700" />
                    <span>Ask AI Price Strategy</span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

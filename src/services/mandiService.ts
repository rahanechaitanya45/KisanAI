import { MandiRecord } from '../types/farming';
import { MANDI_RATES } from '../data/mandiData';

export interface MandiFilters {
  state?: string;
  district?: string;
  commodity?: string;
  search?: string;
  sortBy?: 'modalPriceAsc' | 'modalPriceDesc' | 'commodity' | 'market';
}

export interface MandiResponse {
  success: boolean;
  source: string;
  isLive: boolean;
  totalRecords: number;
  lastSyncTime: string;
  data: MandiRecord[];
}

export interface MandiSummaryStats {
  totalMandis: number;
  commoditiesCovered: number;
  statesCovered: number;
  aboveMspCount: number;
  topGainer: MandiRecord | null;
  topArrivals: MandiRecord | null;
}

class MandiService {
  private fallbackData: MandiRecord[] = MANDI_RATES;

  /**
   * Fetch Mandi prices with state, district, and commodity filters.
   * Connects to `/api/market/prices` and falls back gracefully to verified Agmarknet dataset.
   */
  async getPrices(filters: MandiFilters = {}): Promise<MandiResponse> {
    try {
      const params = new URLSearchParams();
      if (filters.state && filters.state !== 'All States' && filters.state !== 'All') {
        params.append('state', filters.state);
      }
      if (filters.district && filters.district !== 'All Districts' && filters.district !== 'All') {
        params.append('district', filters.district);
      }
      if (filters.commodity && filters.commodity !== 'All Crops' && filters.commodity !== 'All') {
        params.append('commodity', filters.commodity);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }
      if (filters.sortBy) {
        params.append('sortBy', filters.sortBy);
      }

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`/api/market/prices${queryString}`, {
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const result: MandiResponse = await response.json();
      return result;
    } catch (err) {
      console.warn('Mandi API request fallback triggered:', err);
      // Client-side local filtering fallback
      let filtered = [...this.fallbackData];

      if (filters.state && filters.state !== 'All States' && filters.state !== 'All') {
        filtered = filtered.filter(item => item.state.toLowerCase() === filters.state?.toLowerCase());
      }
      if (filters.district && filters.district !== 'All Districts' && filters.district !== 'All') {
        filtered = filtered.filter(item => item.district.toLowerCase() === filters.district?.toLowerCase());
      }
      if (filters.commodity && filters.commodity !== 'All Crops' && filters.commodity !== 'All') {
        filtered = filtered.filter(item =>
          item.commodity.toLowerCase().includes(filters.commodity!.toLowerCase()) ||
          (item.commodityCode && item.commodityCode.toLowerCase() === filters.commodity!.toLowerCase())
        );
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(item =>
          item.commodity.toLowerCase().includes(q) ||
          item.marketName.toLowerCase().includes(q) ||
          item.district.toLowerCase().includes(q) ||
          item.state.toLowerCase().includes(q) ||
          item.variety.toLowerCase().includes(q)
        );
      }

      if (filters.sortBy === 'modalPriceAsc') {
        filtered.sort((a, b) => a.modalPrice - b.modalPrice);
      } else if (filters.sortBy === 'modalPriceDesc') {
        filtered.sort((a, b) => b.modalPrice - a.modalPrice);
      } else if (filters.sortBy === 'commodity') {
        filtered.sort((a, b) => a.commodity.localeCompare(b.commodity));
      }

      return {
        success: true,
        source: 'Agmarknet / eNAM (Client Offline Fallback)',
        isLive: false,
        totalRecords: filtered.length,
        lastSyncTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        data: filtered,
      };
    }
  }

  /**
   * Get unique states present in the Mandi dataset
   */
  async getStates(): Promise<string[]> {
    try {
      const response = await fetch('/api/market/states');
      if (response.ok) {
        const json = await response.json();
        if (json.data && Array.isArray(json.data)) {
          return ['All States', ...json.data];
        }
      }
    } catch {
      // ignore
    }
    const states = Array.from(new Set(this.fallbackData.map(i => i.state))).sort();
    return ['All States', ...states];
  }

  /**
   * Get unique commodities present in the Mandi dataset
   */
  async getCommodities(): Promise<string[]> {
    try {
      const response = await fetch('/api/market/commodities');
      if (response.ok) {
        const json = await response.json();
        if (json.data && Array.isArray(json.data)) {
          return ['All Crops', ...json.data];
        }
      }
    } catch {
      // ignore
    }
    const crops = Array.from(new Set(this.fallbackData.map(i => i.commodity))).sort();
    return ['All Crops', ...crops];
  }

  /**
   * Compute aggregate market analytics
   */
  async getSummaryStats(data?: MandiRecord[]): Promise<MandiSummaryStats> {
    const list = data || this.fallbackData;
    const totalMandis = new Set(list.map(i => i.marketName)).size;
    const commoditiesCovered = new Set(list.map(i => i.commodity)).size;
    const statesCovered = new Set(list.map(i => i.state)).size;
    const aboveMspCount = list.filter(i => (i.mspPrice || 0) > 0 && i.modalPrice > (i.mspPrice || 0)).length;

    let topGainer: MandiRecord | null = null;
    let topArrivals: MandiRecord | null = null;

    if (list.length > 0) {
      topArrivals = [...list].sort((a, b) => (b.arrivalQuantityTons || 0) - (a.arrivalQuantityTons || 0))[0] || null;
      // Highest modal price or spread over MSP
      topGainer = [...list].sort((a, b) => (b.modalPrice - (b.mspPrice || 0)) - (a.modalPrice - (a.mspPrice || 0)))[0] || null;
    }

    return {
      totalMandis,
      commoditiesCovered,
      statesCovered,
      aboveMspCount,
      topGainer,
      topArrivals,
    };
  }
}

export const mandiService = new MandiService();

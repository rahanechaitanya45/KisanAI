import { GovernmentScheme, FarmerProfile } from '../types/farming';
import { GOVERNMENT_SCHEMES } from '../data/schemesData';

export interface SchemeFilters {
  state?: string;
  category?: string;
  level?: 'All' | 'Central' | 'State';
  search?: string;
  eligibleOnly?: boolean;
}

export interface SchemeResponse {
  success: boolean;
  source: string;
  totalRecords: number;
  lastSyncTime: string;
  data: GovernmentScheme[];
}

class SchemeService {
  private fallbackSchemes: GovernmentScheme[] = GOVERNMENT_SCHEMES;

  /**
   * Fetch government welfare schemes with filtering.
   */
  async getSchemes(filters: SchemeFilters = {}, farmerProfile?: FarmerProfile): Promise<SchemeResponse> {
    try {
      const params = new URLSearchParams();
      if (filters.state && filters.state !== 'All States' && filters.state !== 'All') {
        params.append('state', filters.state);
      }
      if (filters.category && filters.category !== 'All Categories' && filters.category !== 'All') {
        params.append('category', filters.category);
      }
      if (filters.level && filters.level !== 'All') {
        params.append('level', filters.level);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`/api/schemes${queryString}`, {
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Server error ${response.status}`);
      }

      const json: SchemeResponse = await response.json();
      let schemes = json.data;

      // Apply farmer profile personalized matching if provided
      if (farmerProfile) {
        schemes = this.personalizeSchemes(schemes, farmerProfile);
      }

      if (filters.eligibleOnly && farmerProfile) {
        schemes = schemes.filter(s => s.isEligibleForCurrentFarmer);
      }

      return {
        ...json,
        data: schemes,
      };
    } catch (err) {
      console.warn('Scheme API fallback triggered:', err);
      let list = [...this.fallbackSchemes];

      if (filters.state && filters.state !== 'All States' && filters.state !== 'All') {
        const s = filters.state.toLowerCase();
        list = list.filter(item =>
          item.applicableStates.includes('All') ||
          item.applicableStates.some(st => st.toLowerCase() === s)
        );
      }

      if (filters.category && filters.category !== 'All Categories' && filters.category !== 'All') {
        list = list.filter(item => item.category.toLowerCase() === filters.category?.toLowerCase());
      }

      if (filters.level && filters.level !== 'All') {
        list = list.filter(item => item.level.toLowerCase() === filters.level?.toLowerCase());
      }

      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(item =>
          item.name.toLowerCase().includes(q) ||
          item.shortName.toLowerCase().includes(q) ||
          (item.hindiTitle && item.hindiTitle.toLowerCase().includes(q)) ||
          item.shortDescription.toLowerCase().includes(q) ||
          item.department.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.financialBenefit.toLowerCase().includes(q)
        );
      }

      if (farmerProfile) {
        list = this.personalizeSchemes(list, farmerProfile);
      }

      if (filters.eligibleOnly && farmerProfile) {
        list = list.filter(s => s.isEligibleForCurrentFarmer);
      }

      return {
        success: true,
        source: 'National DB (myScheme.gov.in & State Agri Depts - Offline Fallback)',
        totalRecords: list.length,
        lastSyncTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        data: list,
      };
    }
  }

  /**
   * Personalize schemes by farmer profile attributes:
   * State matching, Landholding category (Small & Marginal vs Large), Crop matches.
   */
  personalizeSchemes(schemes: GovernmentScheme[], farmer: FarmerProfile): GovernmentScheme[] {
    const computedAcres =
      farmer.farmSizeAcres ||
      farmer.farms?.reduce((acc, f) => acc + (f.totalAreaAcres || 0), 0) ||
      2.5;
    const farmerAcres = computedAcres;
    const isSmallMarginal = farmerAcres <= 5.0; // Under 2 hectares (~5 acres) = Small/Marginal in India
    const farmerCategory = isSmallMarginal ? 'Small & Marginal' : 'Medium';
    const farmerState = (farmer.state || '').toLowerCase();

    // Extract crops safely from farmer.crops or farmer's active farm plots
    const extractedCrops: string[] = farmer.crops && farmer.crops.length > 0
      ? farmer.crops
      : farmer.farms?.flatMap((f) => f.plots?.map((p) => p.currentCropSeason?.cropName).filter((c): c is string => Boolean(c))) || ['Paddy', 'Wheat'];

    const farmerCrops = extractedCrops.map((c) => c.toLowerCase());
    const displayCrops = extractedCrops.join(', ');

    return schemes.map(scheme => {
      let score = 50;
      const matchReasons: string[] = [];
      let isEligible = true;

      // 1. Check State applicability
      const isCentral = scheme.level.toLowerCase() === 'central' || scheme.applicableStates.includes('All');
      const isStateMatch = scheme.applicableStates.some(s => s.toLowerCase() === farmerState);

      if (isCentral) {
        score += 20;
        matchReasons.push('Pan-India Central Scheme applicable in your state');
      } else if (isStateMatch) {
        score += 35;
        matchReasons.push(`Direct state welfare scheme for ${farmer.state}`);
      } else {
        isEligible = false;
        score -= 40;
      }

      // 2. Check Farmer Category
      if (scheme.eligibleFarmerCategories && scheme.eligibleFarmerCategories.length > 0) {
        if (scheme.eligibleFarmerCategories.includes('All') || scheme.eligibleFarmerCategories.includes(farmerCategory as any)) {
          score += 15;
          matchReasons.push(`Eligible for ${farmerCategory} landholding (${farmerAcres} acres)`);
        }
      }

      // 3. Check Crop specific matches
      if (scheme.eligibleCrops && scheme.eligibleCrops.length > 0) {
        const hasCropMatch = scheme.eligibleCrops.includes('All Crops') ||
          scheme.eligibleCrops.some(sc => farmerCrops.some(fc => sc.toLowerCase().includes(fc) || fc.includes(sc.toLowerCase())));
        if (hasCropMatch) {
          score += 15;
          matchReasons.push(`Covers your cultivated crops (${displayCrops})`);
        }
      }

      const finalScore = Math.min(100, Math.max(10, score));

      return {
        ...scheme,
        matchScore: finalScore,
        matchReasons,
        isEligibleForCurrentFarmer: isEligible && finalScore >= 60,
      };
    }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }

  /**
   * Get unique categories
   */
  async getCategories(): Promise<string[]> {
    try {
      const response = await fetch('/api/schemes/categories');
      if (response.ok) {
        const json = await response.json();
        if (json.data && Array.isArray(json.data)) {
          return ['All Categories', ...json.data];
        }
      }
    } catch {
      // ignore
    }
    const categories = Array.from(new Set(this.fallbackSchemes.map(i => i.category))).sort();
    return ['All Categories', ...categories];
  }

  /**
   * Get all applicable states
   */
  async getStates(): Promise<string[]> {
    const states = new Set<string>();
    this.fallbackSchemes.forEach(s => {
      s.applicableStates.forEach(st => {
        if (st !== 'All') states.add(st);
      });
    });
    return ['All States', ...Array.from(states).sort()];
  }
}

export const schemeService = new SchemeService();

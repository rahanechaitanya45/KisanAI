import { KVKCenter, KVKExpert, ExpertTicket, FarmerProfile, FarmPlot, CropHealthAnalysis } from '../types/farming';
import { KVK_CENTERS, KVK_EXPERTS } from '../data/kvkData';

export interface ExpertSearchParams {
  state?: string;
  district?: string;
  specialization?: string;
  crop?: string;
  search?: string;
  availableOnly?: boolean;
}

export interface MatchExpertParams {
  farmer: FarmerProfile;
  cropName?: string;
  problemType?: string;
  analysis?: CropHealthAnalysis | null;
}

class ExpertService {
  private centers: KVKCenter[] = [...KVK_CENTERS];
  private experts: KVKExpert[] = [...KVK_EXPERTS];
  private tickets: ExpertTicket[] = [];

  constructor() {
    this.loadTicketsFromStorage();
  }

  private loadTicketsFromStorage() {
    try {
      const stored = localStorage.getItem('kisanai_expert_tickets');
      if (stored) {
        this.tickets = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not load tickets from localStorage', e);
    }
  }

  private saveTicketsToStorage() {
    try {
      localStorage.setItem('kisanai_expert_tickets', JSON.stringify(this.tickets));
    } catch (e) {
      console.warn('Could not save tickets to localStorage', e);
    }
  }

  /**
   * Fetch all KVK Centers with optional state/district filters
   */
  public async getCenters(state?: string, district?: string): Promise<KVKCenter[]> {
    try {
      const params = new URLSearchParams();
      if (state && state !== 'All States') params.append('state', state);
      if (district && district !== 'All Districts') params.append('district', district);

      const res = await fetch(`/api/kvk-centers?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn('KVK Centers API offline, using local dataset', e);
    }

    // Local fallback filtering
    let results = [...this.centers];
    if (state && state !== 'All States') {
      results = results.filter((c) => c.state.toLowerCase() === state.toLowerCase());
    }
    if (district && district !== 'All Districts') {
      results = results.filter((c) => c.district.toLowerCase() === district.toLowerCase());
    }
    return results;
  }

  /**
   * Fetch KVK Experts with rich search & filter criteria
   */
  public async getExperts(params: ExpertSearchParams = {}): Promise<KVKExpert[]> {
    try {
      const query = new URLSearchParams();
      if (params.state && params.state !== 'All States') query.append('state', params.state);
      if (params.district && params.district !== 'All Districts') query.append('district', params.district);
      if (params.specialization && params.specialization !== 'All Specializations') {
        query.append('specialization', params.specialization);
      }
      if (params.crop) query.append('crop', params.crop);
      if (params.search) query.append('search', params.search);

      const res = await fetch(`/api/experts?${query.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn('KVK Experts API offline, using local dataset', e);
    }

    // Local fallback filter
    let results = [...this.experts];

    if (params.state && params.state !== 'All States') {
      results = results.filter((e) => e.state.toLowerCase() === params.state!.toLowerCase());
    }

    if (params.district && params.district !== 'All Districts') {
      results = results.filter((e) => e.district.toLowerCase() === params.district!.toLowerCase());
    }

    if (params.specialization && params.specialization !== 'All Specializations') {
      results = results.filter((e) => e.specialization === params.specialization);
    }

    if (params.crop) {
      const cropQuery = params.crop.toLowerCase();
      results = results.filter((e) =>
        e.expertiseCrops.some((c) => c.toLowerCase().includes(cropQuery) || cropQuery.includes(c.toLowerCase()))
      );
    }

    if (params.search) {
      const q = params.search.toLowerCase().trim();
      results = results.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.designation.toLowerCase().includes(q) ||
          e.specialization.toLowerCase().includes(q) ||
          e.district.toLowerCase().includes(q) ||
          e.state.toLowerCase().includes(q) ||
          e.qualifications.toLowerCase().includes(q) ||
          e.expertiseCrops.some((c) => c.toLowerCase().includes(q))
      );
    }

    if (params.availableOnly) {
      results = results.filter((e) => e.availability === 'Available');
    }

    return results;
  }

  /**
   * Match the most suitable KVK Expert for a farmer given their location, crop, and problem
   */
  public async matchBestExperts(params: MatchExpertParams): Promise<KVKExpert[]> {
    const { farmer, cropName, analysis } = params;
    const allExperts = await this.getExperts();

    // Determine domain from analysis or problem
    let desiredSpecialization = '';
    if (analysis) {
      const issue = (analysis.suspectedIssue || '').toLowerCase();
      if (issue.includes('blight') || issue.includes('rust') || issue.includes('spot') || issue.includes('rot') || issue.includes('fungal') || issue.includes('bacterial') || issue.includes('wilt') || issue.includes('mildew')) {
        desiredSpecialization = 'Plant Pathology & Crop Protection';
      } else if (issue.includes('borer') || issue.includes('pest') || issue.includes('aphid') || issue.includes('worm') || issue.includes('caterpillar') || issue.includes('mite') || issue.includes('bug') || issue.includes('hopper')) {
        desiredSpecialization = 'Agricultural Entomology & IPM';
      } else if (issue.includes('deficiency') || issue.includes('ph') || issue.includes('salinity') || issue.includes('nitrogen') || issue.includes('chlorosis')) {
        desiredSpecialization = 'Soil Science & Agricultural Chemistry';
      }
    }

    // Scoring function
    const scored = allExperts.map((expert) => {
      let score = 0;

      // Location match
      if (expert.district.toLowerCase() === farmer.district.toLowerCase()) {
        score += 50;
      } else if (expert.state.toLowerCase() === farmer.state.toLowerCase()) {
        score += 25;
      }

      // Crop match
      if (cropName) {
        const cLower = cropName.toLowerCase();
        if (expert.expertiseCrops.some((c) => cLower.includes(c.toLowerCase()) || c.toLowerCase().includes(cLower))) {
          score += 20;
        }
      }

      // Specialization match
      if (desiredSpecialization && expert.specialization === desiredSpecialization) {
        score += 20;
      }

      // Language match
      if (expert.languages.includes(farmer.preferredLanguage)) {
        score += 10;
      }

      // Availability
      if (expert.availability === 'Available') {
        score += 5;
      }

      return { expert, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.map((s) => s.expert);
  }

  /**
   * Submit an expert ticket with strict identity separation:
   * farmerId = authenticated farmer
   * expertId = matched KVK expert
   */
  public async submitTicket(ticketData: Omit<ExpertTicket, 'id' | 'createdAt' | 'status'> & { id?: string }): Promise<ExpertTicket> {
    const newId = ticketData.id || 'KVK-' + Math.floor(100000 + Math.random() * 900000);
    const newTicket: ExpertTicket = {
      ...ticketData,
      id: newId,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString().split('T')[0],
    };

    // Try posting to API
    try {
      await fetch('/api/expert-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket),
      });
    } catch (e) {
      console.warn('API sync failed, saved locally', e);
    }

    // Save in local ticket list
    this.tickets.unshift(newTicket);
    this.saveTicketsToStorage();

    return newTicket;
  }

  /**
   * Resolve ticket by KVK Officer with official ICAR prescription
   */
  public async resolveTicket(ticketId: string, prescription: string, officerName?: string): Promise<ExpertTicket | null> {
    try {
      await fetch(`/api/expert-requests/${ticketId}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prescription, officerName }),
      });
    } catch (e) {
      console.warn('API sync failed for resolve ticket', e);
    }

    const ticket = this.tickets.find((t) => t.id === ticketId);
    if (ticket) {
      ticket.status = 'RESOLVED';
      ticket.responseFromOfficer = prescription;
      ticket.resolvedAt = new Date().toISOString().split('T')[0];
      this.saveTicketsToStorage();
      return ticket;
    }
    return null;
  }

  /**
   * Get all tickets for a specific farmer
   */
  public getFarmerTickets(farmerId: string, initialTickets: ExpertTicket[] = []): ExpertTicket[] {
    const combined = [...this.tickets];
    initialTickets.forEach((t) => {
      if (!combined.some((c) => c.id === t.id)) {
        combined.push(t);
      }
    });

    return combined.filter((t) => t.farmerId === farmerId);
  }

  /**
   * Get all tickets in district or assigned to officer
   */
  public getAllTickets(initialTickets: ExpertTicket[] = []): ExpertTicket[] {
    const combined = [...this.tickets];
    initialTickets.forEach((t) => {
      if (!combined.some((c) => c.id === t.id)) {
        combined.push(t);
      }
    });
    return combined;
  }
}

export const expertService = new ExpertService();

/**
 * Core Data Models & Types for KisanAI - Universal Pan-India AI Farming Assistant
 */

export type LanguageCode =
  | 'en' // English
  | 'hi' // Hindi
  | 'ml' // Malayalam
  | 'ta' // Tamil
  | 'te' // Telugu
  | 'kn' // Kannada
  | 'mr' // Marathi
  | 'gu' // Gujarati
  | 'bn' // Bengali
  | 'pa' // Punjabi
  | 'or' // Odia
  | 'as' // Assamese
  | 'ur'; // Urdu

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  speechLocale: string;
}

export type FarmingType = 'irrigated' | 'rainfed' | 'organic' | 'natural' | 'hydroponic' | 'mixed';

export type SoilType =
  | 'Alluvial Soil'
  | 'Black Soil (Regur)'
  | 'Red and Yellow Soil'
  | 'Laterite Soil'
  | 'Arid / Desert Soil'
  | 'Saline and Alkaline Soil'
  | 'Peaty / Marshy Soil'
  | 'Forest / Mountain Soil'
  | 'Loamy Soil'
  | 'Clay Loam'
  | 'Sandy Loam';

export interface SoilProfile {
  soilType: SoilType;
  ph: number; // e.g. 6.5 - 7.5
  nitrogen: 'Low' | 'Medium' | 'High'; // N
  phosphorus: 'Low' | 'Medium' | 'High'; // P
  potassium: 'Low' | 'Medium' | 'High'; // K
  organicCarbon: number; // e.g. 0.4% - 0.9%
  electricalConductivity?: number; // dS/m
  moisturePercent?: number;
  testDate?: string;
  source: 'farmer-reported' | 'laboratory-tested' | 'sensor-measured' | 'ai-estimated';
}

export type CropCategory =
  | 'Cereals'
  | 'Pulses'
  | 'Oilseeds'
  | 'Commercial'
  | 'Plantation'
  | 'Spices'
  | 'Fruits'
  | 'Vegetables'
  | 'Fodder';

export type GrowthStage =
  | 'Land Preparation'
  | 'Sowing / Seedling'
  | 'Sowing / Transplanting'
  | 'Seedling / Emergence'
  | 'Vegetative'
  | 'Tillering / Branching'
  | 'Flowering / Booting'
  | 'Fruit / Grain Formation'
  | 'Maturity / Ripening'
  | 'Harvest Ready'
  | 'Post-Harvest';

export type CropGrowthStage = GrowthStage;

export type WaterSource =
  | 'Borewell'
  | 'Canal'
  | 'Open Well'
  | 'Drip Irrigation'
  | 'Sprinkler'
  | 'Rainfall Only'
  | 'Rainfed'
  | 'Pond'
  | 'River';

export interface CropSeason {
  id: string;
  cropId?: string;
  cropName: string;
  variety: string;
  season?: 'Kharif' | 'Rabi' | 'Zaid' | 'Perennial' | 'All Season';
  seasonType?: 'Kharif' | 'Rabi' | 'Zaid' | 'Perennial';
  sowingDate: string;
  expectedHarvestDate: string;
  areaAcres?: number;
  currentStage: GrowthStage;
  targetYieldQuintals?: number;
  actualYieldQuintals?: number;
  status?: 'active' | 'completed' | 'abandoned';
  isOrganic?: boolean;
}

export interface FarmPlot {
  id: string;
  farmId?: string;
  name: string;
  areaAcres: number;
  soil: SoilProfile;
  waterSource: WaterSource;
  currentCropSeason?: CropSeason;
  previousCrop?: string;
}

export interface Farm {
  id: string;
  farmerId?: string;
  name: string;
  state: string;
  district: string;
  talukOrBlock?: string;
  village?: string;
  pincode?: string;
  totalAreaAcres: number;
  farmingType?: FarmingType;
  plots: FarmPlot[];
  isPrimary?: boolean;
}

export interface FarmerProfile {
  id: string;
  name: string;
  phone: string;
  preferredLanguage: LanguageCode;
  state: string;
  district: string;
  village?: string;
  farmingExperienceYears?: number;
  primaryGoal?: 'increase_yield' | 'reduce_cost' | 'soil_health' | 'pest_control' | 'schemes' | 'market_profit';
  landholdingCategory?: 'Small & Marginal' | 'Medium' | 'Large';
  farmSizeAcres?: number;
  crops?: string[];
  farms: Farm[];
  role: 'FARMER' | 'AGRICULTURAL_OFFICER' | 'ADMIN';
  onboardingCompleted?: boolean;
}

export interface WeatherCondition {
  temperatureC: number;
  minTempC: number;
  maxTempC: number;
  humidityPercent: number;
  precipitationChancePercent: number;
  windSpeedKmh: number;
  weatherCode: 'sunny' | 'partly-cloudy' | 'cloudy' | 'rain' | 'heavy-rain' | 'thunderstorm';
  description: string;
  advisoryText: string;
  farmingAction: string;
  severeAlert?: string;
}

export interface DailyForecast {
  date: string;
  dayName: string;
  maxTemp: number;
  minTemp: number;
  rainChance: number;
  weatherCode: string;
  condition: string;
}

export interface WeatherContext {
  current: WeatherCondition;
  forecast: DailyForecast[];
  locationName: string;
  lastUpdated: string;
  isSimulated?: boolean;
}

export interface FarmTask {
  id: string;
  farmId: string;
  plotId: string;
  cropName?: string;
  title: string;
  description: string;
  category: 'Irrigation' | 'Fertilizer' | 'Pest Control' | 'Weeding' | 'Scouting' | 'Harvest' | 'Soil Care' | 'Fertigation' | 'Spraying' | 'Harvesting';
  priority: 'Urgent' | 'Recommended' | 'Routine' | 'Normal' | 'High';
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  notes?: string;
  whyExplanation?: string;
}

export type ExpenseCategory =
  | 'Seed'
  | 'Seeds'
  | 'Fertilizer'
  | 'Pesticide'
  | 'Pesticides'
  | 'Labour'
  | 'Labor'
  | 'Diesel / Power'
  | 'Machinery / Rent'
  | 'Machinery'
  | 'Irrigation'
  | 'Transport'
  | 'Harvesting'
  | 'Other';

export interface ExpenseRecord {
  id: string;
  farmId: string;
  plotId?: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  cropName?: string;
}

export interface FarmDiaryEntry {
  id: string;
  farmId: string;
  plotId?: string;
  date: string;
  category: ExpenseCategory | string;
  amount: number;
  description: string;
  quantity?: string;
  laborersCount?: number;
  cropName?: string;
  notes?: string;
}

export interface HarvestRecord {
  id: string;
  farmId: string;
  plotId: string;
  cropName: string;
  harvestDate: string;
  quantityQuintals: number;
  grade: 'A (Premium)' | 'B (Standard)' | 'C (Fair)';
  storageLocation: string;
  quantitySoldQuintals: number;
  salePricePerQuintal?: number;
  totalIncome?: number;
  buyerName?: string;
}

export interface CropInfo {
  id: string;
  name: string;
  localNames: Record<LanguageCode, string>;
  scientificName: string;
  category: CropCategory;
  suitableStates: string[];
  optimalSeason: ('Kharif' | 'Rabi' | 'Zaid' | 'All Season' | 'Perennial')[];
  durationDays: number;
  waterRequirement: 'Low' | 'Medium' | 'High';
  soilSuitability: SoilType[];
  optimalPhRange: [number, number];
  temperatureRangeC: [number, number];
  rainfallRangeMm: [number, number];
  averageYieldQuintalPerAcre: number;
  costPerAcreEstimate: number;
  revenuePerAcreEstimate: number;
  seedRatePerAcre: string;
  spacing: string;
  fertilizerSchedule: {
    basal: string;
    vegetative: string;
    flowering: string;
  };
  irrigationCriticalStages: string[];
  majorPestsAndDiseases: {
    name: string;
    type: 'Pest' | 'Disease';
    symptoms: string;
    organicRemedy: string;
    chemicalRemedy: string;
  }[];
  harvestIndicators: string;
  imageUrl: string;
  sourceDoc: string;
}

export interface CropRecommendation {
  crop: CropInfo;
  suitabilityScorePercent: number;
  reasons: string[];
  riskFactors: string[];
  waterFit: 'Optimal' | 'Adequate' | 'High Risk';
  soilFit: 'Optimal' | 'Moderate' | 'Poor';
  seasonFit: boolean;
  estimatedInvestmentPerAcre: number;
  estimatedYieldQuintals: number;
  estimatedNetProfitPerAcre: number;
}

export interface CropHealthAnalysis {
  id: string;
  cropName: string;
  imageUrl?: string;
  suspectedIssue: string;
  confidencePercent: number;
  confidenceLevel: 'High confidence' | 'Moderate confidence' | 'Needs more information' | 'Expert review recommended';
  observedSymptoms: string[];
  possibleCauses: string[];
  immediateActions: string[];
  preventiveMeasures: string[];
  organicIPMSolution: string;
  safetyCaution: string;
  whenToConsultExpert: string;
  verifiedSource: string;
  createdAt: string;
}

export interface HistoricalPricePoint {
  date: string;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
  arrivalsTons?: number;
}

export interface MandiRecord {
  id: string;
  commodity: string;
  commodityCode?: string;
  state: string;
  stateCode?: string;
  district: string;
  districtCode?: string;
  marketName: string;
  marketCode?: string;
  variety: string;
  grade?: string;
  minPrice: number; // ₹/quintal
  maxPrice: number;
  modalPrice: number;
  minPriceQuintal?: number;
  maxPriceQuintal?: number;
  modalPriceQuintal?: number;
  mspPrice?: number; // Minimum Support Price
  mspPriceQuintal?: number;
  unit: string;
  priceDate: string;
  lastUpdated: string;
  arrivalQuantityTons?: number;
  bestSellingWindow?: string;
  trend: 'up' | 'down' | 'stable' | 'UP' | 'DOWN' | 'STABLE';
  source: string;
  isLiveAgmarknet: boolean;
  history?: HistoricalPricePoint[];
}

export type MandiPrice = MandiRecord;

export interface GovernmentScheme {
  id: string;
  name: string;
  title?: string;
  hindiTitle?: string;
  marathiTitle?: string;
  tamilTitle?: string;
  shortName: string;
  shortDescription: string;
  detailedDescription?: string;
  level: 'Central' | 'State' | 'CENTRAL' | 'STATE';
  type?: string;
  applicableStates: string[]; // ['All'] or specific states
  department: string;
  category: 'Direct Income' | 'Crop Insurance' | 'Credit / Loan' | 'Irrigation Subsidy' | 'Organic Farming' | 'Machinery Subsidy' | 'Solar Subsidy' | 'Fertilizer Subsidy' | 'Income Support' | 'Irrigation & Solar' | 'Soil & Nutrients' | 'Credit & Kisan Card' | string;
  eligibleCrops?: string[];
  eligibleFarmerCategories?: ('Small & Marginal' | 'Medium' | 'Large' | 'All')[];
  eligibleFarmingTypes?: string[];
  financialBenefit: string;
  benefits: string[];
  eligibilityConditions: string[];
  eligibility?: string[];
  requiredDocuments: string[];
  applicationProcess?: string;
  howToApply: string;
  officialPortalUrl: string;
  source: string;
  lastVerifiedAt: string;
  verifiedAt?: string;
  active: boolean;
  matchScore?: number;
  matchReasons?: string[];
  isEligibleForCurrentFarmer?: boolean;
}

export type GovScheme = GovernmentScheme;

export interface RegionalAlert {
  id: string;
  district: string;
  state: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  issuedAt: string;
  expiresAt: string;
}

export type KVKSpecialization =
  | 'Plant Pathology & Crop Protection'
  | 'Agricultural Entomology & IPM'
  | 'Agronomy & Weed Management'
  | 'Soil Science & Agricultural Chemistry'
  | 'Horticulture & Vegetable Crops'
  | 'Agricultural Extension & Training'
  | 'Animal Husbandry & Dairy';

export interface KVKCenter {
  id: string;
  name: string;
  code?: string;
  district: string;
  state: string;
  hostInstitution: string; // e.g. "Punjab Agricultural University (PAU)" or "ICAR-CICR" or "Tamil Nadu Agricultural University (TNAU)"
  address: string;
  pincode?: string;
  phone: string;
  tollFreePhone?: string;
  email: string;
  website?: string;
  headScientist: string;
  headDesignation: string;
  active: boolean;
  establishedYear?: number;
  totalScientists?: number;
}

export interface KVKExpert {
  id: string;
  userId?: string;
  name: string;
  designation: string; // e.g. "Senior Scientist & Head", "Subject Matter Specialist (Plant Pathology)", "Subject Matter Specialist (Agronomy)"
  specialization: KVKSpecialization;
  kvkCenterId: string;
  kvkCenterName: string;
  district: string;
  state: string;
  phone: string;
  email: string;
  avatarUrl?: string;
  languages: string[];
  experienceYears: number;
  qualifications: string; // e.g. "Ph.D. in Plant Pathology (PAU Ludhiana)"
  availability: 'Available' | 'On Field Visit' | 'In Consultation' | 'Offline';
  verified: boolean;
  rating: number;
  consultationsCount: number;
  expertiseCrops: string[];
  active: boolean;
}

export interface ExpertTicket {
  id: string;
  farmerId: string;
  farmerName: string;
  phone: string;
  state: string;
  district: string;
  village?: string;
  farmId?: string;
  plotId?: string;
  cropName: string;
  growthStage?: GrowthStage;
  cropStage?: GrowthStage;
  soilType?: SoilType | string;
  soilPh?: number;
  subject: string;
  queryTitle?: string;
  description: string;
  queryDetails?: string;
  imageUrl?: string;
  urgency: 'Normal' | 'High' | 'Emergency';
  soilDetails?: string;
  weatherDetails?: string;
  aiPreliminaryAnalysis?: string;
  expertId: string;
  expertName: string;
  expertDesignation?: string;
  kvkCenterId?: string;
  kvkCenterName?: string;
  status: 'SUBMITTED' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED' | 'Open' | 'Under Review by KVK' | 'Answered';
  assignedKVKOffice?: string;
  assignedOfficer?: string;
  responseFromOfficer?: string;
  expertResponse?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export type ExpertRequest = ExpertTicket;

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  audioAvailable?: boolean;
  structuredDetails?: {
    whatIsHappening?: string;
    whyItHappens?: string;
    whatToDoNow?: string[];
    whatToMonitor?: string[];
    whatNotToDo?: string[];
    whenToSeekExpert?: string;
    sourcesCited?: string[];
    confidenceLabel?: string;
  };
  attachments?: {
    type: 'image' | 'task' | 'scheme' | 'mandi';
    data: any;
  }[];
}

/**
 * Centralized Geocoding and Farm Location Resolver for KisanAI
 * Maps Indian States, Districts, Talukas, and Villages to accurate geographic coordinates.
 */

import { FarmerProfile, Farm, FarmPlot, FarmLocation } from '../types/farming';
import { INDIA_AGRO_STATES } from '../data/indiaAgroData';

export interface GeoCoordinate {
  lat: number;
  lon: number;
}

// Authoritative Centroid Coordinates for All Indian States & Major Union Territories
export const STATE_CENTROIDS: Record<string, GeoCoordinate> = {
  'Maharashtra': { lat: 19.7515, lon: 75.7139 },
  'Punjab': { lat: 31.1471, lon: 75.3412 },
  'Kerala': { lat: 10.8505, lon: 76.2711 },
  'Tamil Nadu': { lat: 11.1271, lon: 78.6569 },
  'Karnataka': { lat: 15.3173, lon: 75.7139 },
  'Gujarat': { lat: 22.2587, lon: 71.1924 },
  'Uttar Pradesh': { lat: 26.8467, lon: 80.9462 },
  'Madhya Pradesh': { lat: 22.9734, lon: 78.6569 },
  'Andhra Pradesh': { lat: 15.9129, lon: 79.7400 },
  'Telangana': { lat: 18.1124, lon: 79.0193 },
  'Rajasthan': { lat: 27.0238, lon: 74.2179 },
  'West Bengal': { lat: 22.9868, lon: 87.8550 },
  'Haryana': { lat: 29.0588, lon: 76.0856 },
  'Bihar': { lat: 25.0961, lon: 85.3131 },
  'Odisha': { lat: 20.9517, lon: 85.0985 },
  'Assam': { lat: 26.2006, lon: 92.9376 },
  'Himachal Pradesh': { lat: 31.1048, lon: 77.1734 },
  'Uttarakhand': { lat: 30.0668, lon: 79.0193 },
  'Jammu & Kashmir': { lat: 33.7782, lon: 76.5762 },
  'Chhattisgarh': { lat: 21.2787, lon: 81.8661 },
  'Jharkhand': { lat: 23.6102, lon: 85.2799 },
};

// District Coordinates Map (covers pan-India agricultural centers and all 36 Maharashtra districts)
export const DISTRICT_COORDINATES: Record<string, GeoCoordinate> = {
  // Maharashtra (All 36 Districts)
  'Ahilyanagar': { lat: 19.0952, lon: 74.7480 },
  'Ahmednagar': { lat: 19.0952, lon: 74.7480 },
  'Akola': { lat: 20.7002, lon: 77.0082 },
  'Amravati': { lat: 20.9320, lon: 77.7523 },
  'Beed': { lat: 18.9891, lon: 75.7601 },
  'Bhandara': { lat: 21.1687, lon: 79.6543 },
  'Buldhana': { lat: 20.5312, lon: 76.1824 },
  'Chandrapur': { lat: 19.9615, lon: 79.2961 },
  'Chhatrapati Sambhajinagar': { lat: 19.8762, lon: 75.3433 },
  'Aurangabad': { lat: 19.8762, lon: 75.3433 },
  'Dharashiv': { lat: 18.1856, lon: 76.0419 },
  'Osmanabad': { lat: 18.1856, lon: 76.0419 },
  'Dhule': { lat: 20.9042, lon: 74.7749 },
  'Gadchiroli': { lat: 20.1809, lon: 80.0035 },
  'Gondia': { lat: 21.4624, lon: 80.1961 },
  'Hingoli': { lat: 19.7196, lon: 77.1485 },
  'Jalgaon': { lat: 21.0077, lon: 75.5626 },
  'Jalna': { lat: 19.8347, lon: 75.8816 },
  'Kolhapur': { lat: 16.7050, lon: 74.2433 },
  'Latur': { lat: 18.4088, lon: 76.5604 },
  'Mumbai City': { lat: 18.9388, lon: 72.8354 },
  'Mumbai Suburban': { lat: 19.0760, lon: 72.8777 },
  'Nagpur': { lat: 21.1458, lon: 79.0882 },
  'Nanded': { lat: 19.1383, lon: 77.3210 },
  'Nandurbar': { lat: 21.3704, lon: 74.2404 },
  'Nashik': { lat: 19.9975, lon: 73.7898 },
  'Palghar': { lat: 19.6967, lon: 72.7699 },
  'Parbhani': { lat: 19.2612, lon: 76.7767 },
  'Pune': { lat: 18.5204, lon: 73.8567 },
  'Raigad': { lat: 18.5158, lon: 73.1822 },
  'Ratnagiri': { lat: 16.9902, lon: 73.3120 },
  'Sangli': { lat: 16.8524, lon: 74.5815 },
  'Satara': { lat: 17.6805, lon: 74.0183 },
  'Sindhudurg': { lat: 16.1189, lon: 73.7298 },
  'Solapur': { lat: 17.6599, lon: 75.9064 },
  'Thane': { lat: 19.2183, lon: 72.9781 },
  'Wardha': { lat: 20.7453, lon: 78.6022 },
  'Washim': { lat: 20.1110, lon: 77.1360 },
  'Yavatmal': { lat: 20.3888, lon: 78.1204 },

  // Punjab Districts
  'Ludhiana': { lat: 30.9010, lon: 75.8573 },
  'Amritsar': { lat: 31.6340, lon: 74.8723 },
  'Bathinda': { lat: 30.2110, lon: 74.9455 },
  'Jalandhar': { lat: 31.3260, lon: 75.5762 },
  'Patiala': { lat: 30.3398, lon: 76.3869 },
  'Sangrur': { lat: 30.2458, lon: 75.8421 },
  'Gurdaspur': { lat: 32.0419, lon: 75.4053 },
  'Firozpur': { lat: 30.9237, lon: 74.6133 },
  'Hoshiarpur': { lat: 31.5273, lon: 75.9149 },
  'Moga': { lat: 30.8165, lon: 75.1717 },

  // Kerala Districts
  'Thrissur': { lat: 10.5276, lon: 76.2144 },
  'Trichur': { lat: 10.5276, lon: 76.2144 },
  'Wayanad': { lat: 11.6854, lon: 76.1320 },
  'Palakkad': { lat: 10.7867, lon: 76.6548 },
  'Alappuzha': { lat: 9.4981, lon: 76.3388 },
  'Idukki': { lat: 9.8500, lon: 76.9667 },
  'Ernakulam': { lat: 9.9816, lon: 76.2999 },
  'Kottayam': { lat: 9.5916, lon: 76.5222 },
  'Kozhikode': { lat: 11.2588, lon: 75.7804 },
  'Malappuram': { lat: 11.0510, lon: 76.0711 },
  'Thiruvananthapuram': { lat: 8.5241, lon: 76.9366 },

  // Tamil Nadu
  'Thanjavur': { lat: 10.7870, lon: 79.1378 },
  'Coimbatore': { lat: 11.0168, lon: 76.9558 },
  'Madurai': { lat: 9.9252, lon: 78.1198 },
  'Salem': { lat: 11.6643, lon: 78.1460 },
  'Tiruchirappalli': { lat: 10.7905, lon: 78.7047 },
  'Erode': { lat: 11.3410, lon: 77.7172 },
  'Tirunelveli': { lat: 8.7139, lon: 77.7567 },
  'Dindigul': { lat: 10.3673, lon: 77.9803 },

  // Karnataka
  'Belagavi': { lat: 15.8497, lon: 74.4977 },
  'Chikkamagaluru': { lat: 13.3161, lon: 75.7720 },
  'Kalaburagi (Gulbarga)': { lat: 17.3297, lon: 76.8343 },
  'Hassan': { lat: 13.0033, lon: 76.1004 },
  'Mandya': { lat: 12.5218, lon: 76.8951 },
  'Mysuru': { lat: 12.2958, lon: 76.6394 },
  'Dharwad': { lat: 15.4589, lon: 75.0078 },
  'Ballari': { lat: 15.1394, lon: 76.9214 },
  'Shivamogga': { lat: 13.9299, lon: 75.5681 },

  // Gujarat
  'Rajkot': { lat: 22.3039, lon: 70.8022 },
  'Anand': { lat: 22.5645, lon: 72.9289 },
  'Banaskantha': { lat: 24.1724, lon: 72.4346 },
  'Junagadh': { lat: 21.5222, lon: 70.4579 },
  'Surat': { lat: 21.1702, lon: 72.8311 },
  'Vadodara': { lat: 22.3072, lon: 73.1812 },
  'Mehsana': { lat: 23.5880, lon: 72.3693 },

  // Uttar Pradesh
  'Varanasi': { lat: 25.3176, lon: 82.9739 },
  'Muzaffarnagar': { lat: 29.4727, lon: 77.7085 },
  'Jhansi': { lat: 25.4484, lon: 78.5685 },
  'Lucknow': { lat: 26.8467, lon: 80.9462 },
  'Agra': { lat: 27.1767, lon: 78.0081 },
  'Gorakhpur': { lat: 26.7606, lon: 83.3732 },
  'Bareilly': { lat: 28.3670, lon: 79.4304 },
  'Meerut': { lat: 28.9845, lon: 77.7064 },

  // Madhya Pradesh
  'Ujjain': { lat: 23.1765, lon: 75.7885 },
  'Hoshangabad (Narmadapuram)': { lat: 22.7519, lon: 77.7289 },
  'Indore': { lat: 22.7196, lon: 75.8577 },
  'Bhopal': { lat: 23.2599, lon: 77.4126 },
  'Jabalpur': { lat: 23.1815, lon: 79.9864 },
  'Gwalior': { lat: 26.2183, lon: 78.1828 },

  // Andhra Pradesh
  'Guntur': { lat: 16.3067, lon: 80.4365 },
  'Anantapur': { lat: 14.6819, lon: 77.6006 },
  'Krishna': { lat: 16.1875, lon: 81.1389 },
  'Kurnool': { lat: 15.8281, lon: 78.0373 },
  'East Godavari': { lat: 17.0005, lon: 81.8040 },
  'West Godavari': { lat: 16.7107, lon: 81.0952 },

  // Telangana
  'Nizamabad': { lat: 18.6725, lon: 78.0941 },
  'Warangal': { lat: 17.9689, lon: 79.5941 },
  'Karimnagar': { lat: 18.4386, lon: 79.1288 },
  'Khammam': { lat: 17.2473, lon: 80.1514 },
  'Mahabubnagar': { lat: 16.7488, lon: 77.9864 },

  // West Bengal
  'Burdwan (Purba Bardhaman)': { lat: 23.2324, lon: 87.8615 },
  'Darjeeling': { lat: 27.0410, lon: 88.2663 },
  'Murshidabad': { lat: 24.1750, lon: 88.2800 },
  'Hooghly': { lat: 22.9030, lon: 88.3968 },
  'Nadia': { lat: 23.4710, lon: 88.5565 },

  // Rajasthan
  'Sri Ganganagar': { lat: 29.9038, lon: 73.8772 },
  'Nagaur': { lat: 27.1983, lon: 73.7493 },
  'Jaipur': { lat: 26.9124, lon: 75.7873 },
  'Kota': { lat: 25.2138, lon: 75.8648 },
  'Jodhpur': { lat: 26.2389, lon: 73.0243 },

  // Assam
  'Jorhat': { lat: 26.7509, lon: 94.2037 },
  'Kamrup': { lat: 26.3161, lon: 91.5984 },
  'Dibrugarh': { lat: 27.4728, lon: 94.9120 },

  // Odisha
  'Cuttack': { lat: 20.4625, lon: 85.8828 },
  'Bhubaneswar / Khordha': { lat: 20.2961, lon: 85.8245 },
  'Sambalpur': { lat: 21.4669, lon: 83.9812 },
  'Balasore': { lat: 21.4934, lon: 86.9135 },
};

// Village & Taluka Sub-district Precise Coordinates (Key Agricultural Centers)
export const SUB_DISTRICT_VILLAGES: Record<string, GeoCoordinate> = {
  // Nashik District Talukas & Key Farming Villages
  'sinnar': { lat: 19.8453, lon: 73.9981 },
  'sinnar, nashik': { lat: 19.8453, lon: 73.9981 },
  'niphad': { lat: 20.0760, lon: 74.1110 },
  'lasalgaon': { lat: 20.1472, lon: 74.2285 }, // Asia's Largest Onion Market
  'dindori': { lat: 20.2015, lon: 73.8340 },
  'yeola': { lat: 20.0425, lon: 74.4870 },
  'malegaon': { lat: 20.5539, lon: 74.5298 },
  'satana': { lat: 20.5910, lon: 74.2025 },
  'kalwan': { lat: 20.4900, lon: 73.9600 },
  'pimpalgaon': { lat: 20.1650, lon: 73.9850 },
  'deola': { lat: 20.4600, lon: 74.1800 },
  'chandwad': { lat: 20.3275, lon: 74.2408 },
  'igatpuri': { lat: 19.6967, lon: 73.5606 },
  'trimbak': { lat: 19.9325, lon: 73.5300 },

  // Pune District Talukas & Villages
  'baramati': { lat: 18.1517, lon: 74.5772 },
  'junnar': { lat: 19.2081, lon: 73.8760 },
  'ambegaon': { lat: 19.0300, lon: 73.8500 },
  'shirur': { lat: 18.8272, lon: 74.3756 },
  'indapur': { lat: 18.1158, lon: 75.0253 },
  'daund': { lat: 18.4619, lon: 74.5828 },
  'khed': { lat: 18.8475, lon: 73.9100 },
  'maval': { lat: 18.7500, lon: 73.5500 },
  'haveli': { lat: 18.5204, lon: 73.8567 },
  'purandar': { lat: 18.2800, lon: 74.0100 },
  'bhor': { lat: 18.1300, lon: 73.8400 },

  // Ahilyanagar / Ahmednagar Talukas
  'sangamner': { lat: 19.5761, lon: 74.2128 },
  'rahata': { lat: 19.7042, lon: 74.4842 },
  'shirdi': { lat: 19.7645, lon: 74.4762 },
  'kopargaon': { lat: 19.8860, lon: 74.4800 },
  'shrirampur': { lat: 19.6190, lon: 74.6580 },
  'newasa': { lat: 19.5500, lon: 74.9200 },
  'shevgaon': { lat: 19.3400, lon: 75.2200 },
  'pathardi': { lat: 19.1700, lon: 75.1800 },
  'parner': { lat: 19.0000, lon: 74.4400 },
  'shrigonda': { lat: 18.6150, lon: 74.6980 },
  'karjat (ahilyanagar)': { lat: 18.9100, lon: 75.0000 },
  'akole': { lat: 19.5400, lon: 73.9300 },

  // Solapur Talukas
  'pandharpur': { lat: 17.6775, lon: 75.3242 },
  'akkalkot': { lat: 17.5256, lon: 76.2058 },
  'barshi': { lat: 18.2325, lon: 75.6961 },
  'karmala': { lat: 18.4100, lon: 75.2000 },
  'madha': { lat: 18.0300, lon: 75.5200 },
  'mangaweda': { lat: 17.5100, lon: 75.5400 },
  'sangola': { lat: 17.4300, lon: 75.1900 },
  'mohol': { lat: 17.8100, lon: 75.6500 },

  // Sangli Talukas
  'miraj': { lat: 16.8277, lon: 74.6469 },
  'tasgaon': { lat: 17.0347, lon: 74.6033 },
  'islampur': { lat: 17.0500, lon: 74.2600 },
  'walwa': { lat: 17.0200, lon: 74.2500 },
  'vita': { lat: 17.2700, lon: 74.5300 },
  'jat': { lat: 17.0500, lon: 75.3300 },
  'kadegaon': { lat: 17.3000, lon: 74.3300 },

  // Kolhapur Talukas
  'karveer': { lat: 16.7050, lon: 74.2433 },
  'hatkanangle': { lat: 16.7400, lon: 74.4400 },
  'shirol': { lat: 16.7200, lon: 74.5900 },
  'ichalkaranji': { lat: 16.6900, lon: 74.4600 },
  'radhanagari': { lat: 16.4100, lon: 73.9900 },
  'gadhiglaj': { lat: 16.2300, lon: 74.3500 },

  // Satara Talukas
  'karad': { lat: 17.2889, lon: 74.1844 },
  'phaltan': { lat: 17.9867, lon: 74.4300 },
  'wai': { lat: 17.9483, lon: 73.8900 },
  'koregaon': { lat: 17.7000, lon: 74.1700 },
  'mahabaleshwar': { lat: 17.9237, lon: 73.6586 },

  // Jalgaon Talukas
  'raver': { lat: 21.2500, lon: 75.9200 },
  'bhusawal': { lat: 21.0458, lon: 75.7869 },
  'chalisgaon': { lat: 20.4639, lon: 75.0150 },
  'amalner': { lat: 21.0450, lon: 75.0550 },
  'chopda': { lat: 21.2500, lon: 75.3000 },
  'yawal': { lat: 21.1700, lon: 75.7000 },
  'pachora': { lat: 20.6700, lon: 75.3500 },

  // Chhatrapati Sambhajinagar Talukas
  'paithan': { lat: 19.4800, lon: 75.3800 },
  'vaijapur': { lat: 19.9200, lon: 74.7300 },
  'gangapur': { lat: 19.7000, lon: 75.0000 },
  'sillod': { lat: 20.3000, lon: 75.6500 },
  'kannad': { lat: 20.2600, lon: 75.1300 },

  // Latur Talukas
  'ausa': { lat: 18.2500, lon: 76.5000 },
  'nilanga': { lat: 18.1200, lon: 76.7500 },
  'ahmadpur': { lat: 18.7000, lon: 76.9300 },
  'udgir': { lat: 18.3900, lon: 77.1200 },

  // Punjab Tehsils & Villages
  'samrala': { lat: 30.8350, lon: 76.1910 },
  'khanna': { lat: 30.7071, lon: 76.2168 },
  'jagraon': { lat: 30.7853, lon: 75.4789 },
  'raikot': { lat: 30.6483, lon: 75.5978 },
  'nakodar': { lat: 31.1275, lon: 75.4744 },
  'phillaur': { lat: 31.0200, lon: 75.7800 },
  'ajnala': { lat: 31.8400, lon: 74.7600 },
  'baba bakala': { lat: 31.5600, lon: 75.2600 },
  'talwandi sabo': { lat: 29.9800, lon: 75.0800 },

  // Kerala Panchayats & Villages
  'guruvayur': { lat: 10.5950, lon: 76.0400 },
  'chalakkudy': { lat: 10.3070, lon: 76.3330 },
  'kodungallur': { lat: 10.2200, lon: 76.2000 },
  'kunnamkulam': { lat: 10.6500, lon: 76.0800 },
  'kalpetta': { lat: 11.6050, lon: 76.0830 },
  'sulthan bathery': { lat: 11.6667, lon: 76.2500 },
  'mananthavady': { lat: 11.8020, lon: 76.0030 },
  'chittur': { lat: 10.7000, lon: 76.7500 },
  'ottapalam': { lat: 10.7700, lon: 76.3800 },
  'kuttanad': { lat: 9.3800, lon: 76.4500 },
};

/**
 * Normalizes string keys for case-insensitive lookup
 */
function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/gi, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * Direct Geocoding for a given state, district, and village/taluka
 */
export function geocodeLocation(query: {
  state?: string;
  district?: string;
  subDistrict?: string;
  village?: string;
}): { lat: number; lon: number; locationName: string; source: FarmLocation['source'] } | null {
  const villageKey = normalizeKey(query.village || query.subDistrict || '');
  const districtKey = normalizeKey(query.district || '');
  const stateKey = normalizeKey(query.state || '');

  // 1. Match Combined Village + District (e.g., "sinnar, nashik" or "sinnar")
  if (villageKey) {
    const combinedKey = `${villageKey}, ${districtKey}`;
    if (SUB_DISTRICT_VILLAGES[combinedKey]) {
      const coord = SUB_DISTRICT_VILLAGES[combinedKey];
      const locName = `${capitalize(query.village || query.subDistrict || '')}, ${capitalize(query.district || '')}, ${capitalize(query.state || '')}`.replace(/^, |, $/g, '');
      return { lat: coord.lat, lon: coord.lon, locationName: locName, source: 'village' };
    }

    if (SUB_DISTRICT_VILLAGES[villageKey]) {
      const coord = SUB_DISTRICT_VILLAGES[villageKey];
      const locName = `${capitalize(query.village || query.subDistrict || '')}, ${capitalize(query.district || '')}, ${capitalize(query.state || '')}`.replace(/^, |, $/g, '');
      return { lat: coord.lat, lon: coord.lon, locationName: locName, source: 'village' };
    }
  }

  // 2. Match District
  if (query.district) {
    // Exact or normalized lookup in DISTRICT_COORDINATES
    for (const [distName, coord] of Object.entries(DISTRICT_COORDINATES)) {
      if (
        normalizeKey(distName) === districtKey ||
        districtKey.includes(normalizeKey(distName)) ||
        normalizeKey(distName).includes(districtKey)
      ) {
        const villagePart = query.village ? `${capitalize(query.village)}, ` : '';
        const locName = `${villagePart}${distName}, ${capitalize(query.state || '')}`.replace(/, $/, '');
        return { lat: coord.lat, lon: coord.lon, locationName: locName, source: 'district' };
      }
    }
  }

  // 3. Match State Centroid
  if (query.state) {
    for (const [stName, coord] of Object.entries(STATE_CENTROIDS)) {
      if (
        normalizeKey(stName) === stateKey ||
        stateKey.includes(normalizeKey(stName)) ||
        normalizeKey(stName).includes(stateKey)
      ) {
        const distPart = query.district ? `${capitalize(query.district)}, ` : '';
        const locName = `${distPart}${stName}`;
        return { lat: coord.lat, lon: coord.lon, locationName: locName, source: 'state' };
      }
    }
  }

  return null;
}

/**
 * Resolves the Canonical Farm Location strictly adhering to the 4 Priority levels:
 * Priority 1: Active Plot Coordinates (latitude & longitude)
 * Priority 2: Active Farm Coordinates (latitude & longitude)
 * Priority 3: Village / Sub-District geocoded coordinates
 * Priority 4: District geocoded coordinates
 * Priority 5: State regional centroid coordinates
 * Never falls back to a hardcoded Punjab unless the farmer actually selected Punjab!
 */
export function resolveActiveFarmLocation(
  farmer?: Partial<FarmerProfile> | null,
  activeFarm?: Partial<Farm> | null,
  activePlot?: Partial<FarmPlot> | null
): FarmLocation {
  // 1. If no farmer data is present, return missing
  if (!farmer && !activeFarm) {
    return {
      state: '',
      district: '',
      locationName: 'Location Not Set',
      source: 'unresolved',
      isMissing: true,
    };
  }

  const effectiveState = activeFarm?.state || farmer?.state || '';
  const effectiveDistrict = activeFarm?.district || farmer?.district || '';
  const effectiveVillage = activeFarm?.village || activeFarm?.talukOrBlock || farmer?.village || '';

  // Priority 1: Active Plot Coordinates
  if (
    typeof activePlot?.latitude === 'number' &&
    typeof activePlot?.longitude === 'number' &&
    !isNaN(activePlot.latitude) &&
    !isNaN(activePlot.longitude) &&
    activePlot.latitude !== 0 &&
    activePlot.longitude !== 0
  ) {
    const locName = formatLocationName(effectiveVillage, effectiveDistrict, effectiveState);
    return {
      state: effectiveState,
      district: effectiveDistrict,
      subDistrict: activeFarm?.talukOrBlock,
      village: effectiveVillage,
      latitude: activePlot.latitude,
      longitude: activePlot.longitude,
      locationName: locName || `${activePlot.latitude.toFixed(3)}°N, ${activePlot.longitude.toFixed(3)}°E`,
      source: 'plot',
      isMissing: false,
    };
  }

  // Priority 2: Active Farm Coordinates
  if (
    typeof activeFarm?.latitude === 'number' &&
    typeof activeFarm?.longitude === 'number' &&
    !isNaN(activeFarm.latitude) &&
    !isNaN(activeFarm.longitude) &&
    activeFarm.latitude !== 0 &&
    activeFarm.longitude !== 0
  ) {
    const locName = formatLocationName(effectiveVillage, effectiveDistrict, effectiveState);
    return {
      state: effectiveState,
      district: effectiveDistrict,
      subDistrict: activeFarm?.talukOrBlock,
      village: effectiveVillage,
      latitude: activeFarm.latitude,
      longitude: activeFarm.longitude,
      locationName: locName || `${activeFarm.latitude.toFixed(3)}°N, ${activeFarm.longitude.toFixed(3)}°E`,
      source: 'farm',
      isMissing: false,
    };
  }

  // Priority 2.5: Farmer Profile Coordinates
  if (
    typeof farmer?.latitude === 'number' &&
    typeof farmer?.longitude === 'number' &&
    !isNaN(farmer.latitude) &&
    !isNaN(farmer.longitude) &&
    farmer.latitude !== 0 &&
    farmer.longitude !== 0
  ) {
    const locName = formatLocationName(effectiveVillage, effectiveDistrict, effectiveState);
    return {
      state: effectiveState,
      district: effectiveDistrict,
      subDistrict: activeFarm?.talukOrBlock,
      village: effectiveVillage,
      latitude: farmer.latitude,
      longitude: farmer.longitude,
      locationName: locName || `${farmer.latitude.toFixed(3)}°N, ${farmer.longitude.toFixed(3)}°E`,
      source: 'farm',
      isMissing: false,
    };
  }

  // Priority 3 & 4 & 5: Geocode Village / District / State
  const geocoded = geocodeLocation({
    state: effectiveState,
    district: effectiveDistrict,
    subDistrict: activeFarm?.talukOrBlock,
    village: effectiveVillage,
  });

  if (geocoded) {
    return {
      state: effectiveState,
      district: effectiveDistrict,
      subDistrict: activeFarm?.talukOrBlock,
      village: effectiveVillage,
      latitude: geocoded.lat,
      longitude: geocoded.lon,
      locationName: geocoded.locationName,
      source: geocoded.source,
      isMissing: false,
    };
  }

  // Fallback: If we have text state/district without matching coords
  if (effectiveDistrict || effectiveState) {
    const locName = formatLocationName(effectiveVillage, effectiveDistrict, effectiveState);
    return {
      state: effectiveState,
      district: effectiveDistrict,
      subDistrict: activeFarm?.talukOrBlock,
      village: effectiveVillage,
      latitude: 19.7515, // default Maharashtra center only if no state at all, but keep state name exact
      longitude: 75.7139,
      locationName: locName || 'Farm Location',
      source: 'district',
      isMissing: false,
    };
  }

  // No location provided
  return {
    state: '',
    district: '',
    locationName: 'Location Not Set',
    source: 'unresolved',
    isMissing: true,
  };
}

/**
 * Format a human-readable clean location badge text
 */
function formatLocationName(village?: string, district?: string, state?: string): string {
  const parts: string[] = [];
  if (village && village.trim()) parts.push(capitalize(village.trim()));
  if (district && district.trim()) parts.push(capitalize(district.trim()));
  if (state && state.trim()) parts.push(capitalize(state.trim()));
  return parts.join(', ');
}

function capitalize(s: string): string {
  if (!s) return '';
  return s
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Browser Geolocation with Timeout
 */
export async function getBrowserGPSCoordinates(): Promise<{ latitude: number; longitude: number } | null> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return null;
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        console.warn('GPS location retrieval error:', err.message);
        resolve(null);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  });
}

/**
 * Reverse Geocode Coordinates to closest known District & State in India
 */
export function reverseGeocodeToDistrict(lat: number, lon: number): {
  state: string;
  district: string;
  distanceKm: number;
} {
  let closestDist = 'Nashik';
  let closestState = 'Maharashtra';
  let minDistance = Infinity;

  // Search through all known district coordinates
  for (const [distName, coord] of Object.entries(DISTRICT_COORDINATES)) {
    const dist = calculateHaversineDistanceKm(lat, lon, coord.lat, coord.lon);
    if (dist < minDistance) {
      minDistance = dist;
      closestDist = distName;

      // Find state for this district from INDIA_AGRO_STATES
      for (const st of INDIA_AGRO_STATES) {
        if (st.districts.some((d) => d.name.toLowerCase() === distName.toLowerCase())) {
          closestState = st.name;
          break;
        }
      }
    }
  }

  return {
    state: closestState,
    district: closestDist,
    distanceKm: Math.round(minDistance),
  };
}

/**
 * Standard Haversine distance formula in kilometers
 */
function calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

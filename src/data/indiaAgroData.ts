import { SoilType } from '../types/farming';

export interface DistrictInfo {
  name: string;
  agroZone: string;
  dominantSoil: SoilType;
  majorCrops: string[];
  kvkName: string;
  kvkContact: string;
}

export interface StateInfo {
  name: string;
  code: string;
  capital: string;
  agroClimaticZones: string[];
  soilTypes: SoilType[];
  districts: DistrictInfo[];
}

export const INDIA_AGRO_STATES: StateInfo[] = [
  {
    name: 'Punjab',
    code: 'PB',
    capital: 'Chandigarh',
    agroClimaticZones: ['Trans-Gangetic Plains Zone'],
    soilTypes: ['Alluvial Soil', 'Loamy Soil', 'Sandy Loam'],
    districts: [
      {
        name: 'Ludhiana',
        agroZone: 'Central Plain Zone',
        dominantSoil: 'Alluvial Soil',
        majorCrops: ['Wheat', 'Paddy (Rice)', 'Maize', 'Mustard', 'Sugarcane', 'Potato'],
        kvkName: 'PAU Krishi Vigyan Kendra, Samrala (Ludhiana)',
        kvkContact: '0161-2401960',
      },
      {
        name: 'Amritsar',
        agroZone: 'Central Plain Zone',
        dominantSoil: 'Loamy Soil',
        majorCrops: ['Basmati Rice', 'Wheat', 'Peas', 'Sunflower'],
        kvkName: 'KVK Nag Kalan, Amritsar',
        kvkContact: '0183-2782800',
      },
      {
        name: 'Bathinda',
        agroZone: 'Western Zone (Semi-Arid)',
        dominantSoil: 'Sandy Loam',
        majorCrops: ['Cotton (Bt)', 'Wheat', 'Mustard', 'Guar'],
        kvkName: 'KVK Bathinda, Dabwali Road',
        kvkContact: '0164-2212159',
      },
      {
        name: 'Jalandhar',
        agroZone: 'Central Plain Zone',
        dominantSoil: 'Alluvial Soil',
        majorCrops: ['Potato (Seed)', 'Wheat', 'Paddy', 'Maize'],
        kvkName: 'KVK Nurmahal, Jalandhar',
        kvkContact: '0182-6244248',
      },
    ],
  },
  {
    name: 'Maharashtra',
    code: 'MH',
    capital: 'Mumbai',
    agroClimaticZones: ['Western Plateau and Hills', 'West Coast Plains and Ghats'],
    soilTypes: ['Black Soil (Regur)', 'Laterite Soil', 'Red and Yellow Soil', 'Clay Loam'],
    districts: [
      {
        name: 'Nashik',
        agroZone: 'Western Maharashtra Plain Zone',
        dominantSoil: 'Black Soil (Regur)',
        majorCrops: ['Onion', 'Grapes', 'Pomegranate', 'Tomato', 'Soybean', 'Sugarcane'],
        kvkName: 'YCMOU Krishi Vigyan Kendra, Nashik',
        kvkContact: '0253-2230717',
      },
      {
        name: 'Nagpur',
        agroZone: 'Vidarbha Agro-Climatic Zone',
        dominantSoil: 'Black Soil (Regur)',
        majorCrops: ['Nagpur Mandarin (Orange)', 'Cotton', 'Soybean', 'Pigeon Pea (Tur)', 'Gram'],
        kvkName: 'CICR Krishi Vigyan Kendra, Nagpur',
        kvkContact: '07103-275536',
      },
      {
        name: 'Kolhapur',
        agroZone: 'Sub-Montane Zone',
        dominantSoil: 'Clay Loam',
        majorCrops: ['Sugarcane', 'Paddy', 'Groundnut', 'Soybean', 'Ginger'],
        kvkName: 'KVK Kaneri Math, Kolhapur',
        kvkContact: '0231-2672322',
      },
      {
        name: 'Aurangabad (Chhatrapati Sambhajinagar)',
        agroZone: 'Marathwada Scarcity Zone',
        dominantSoil: 'Black Soil (Regur)',
        majorCrops: ['Cotton', 'Sweet Orange (Mosambi)', 'Bajra', 'Jowar', 'Soybean'],
        kvkName: 'VNMKV Krishi Vigyan Kendra, Paithan Road',
        kvkContact: '0240-2376558',
      },
    ],
  },
  {
    name: 'Tamil Nadu',
    code: 'TN',
    capital: 'Chennai',
    agroClimaticZones: ['Southern Plateau and Hills', 'East Coast Plains and Hills'],
    soilTypes: ['Red and Yellow Soil', 'Black Soil (Regur)', 'Laterite Soil', 'Alluvial Soil'],
    districts: [
      {
        name: 'Thanjavur',
        agroZone: 'Cauvery Delta Zone',
        dominantSoil: 'Alluvial Soil',
        majorCrops: ['Paddy (Kuruvai / Samba)', 'Black Gram', 'Green Gram', 'Banana', 'Coconut'],
        kvkName: 'TNAU Krishi Vigyan Kendra, Needamangalam / Sikkal',
        kvkContact: '04367-260666',
      },
      {
        name: 'Coimbatore',
        agroZone: 'Western Agro-Climatic Zone',
        dominantSoil: 'Red and Yellow Soil',
        majorCrops: ['Cotton', 'Maize', 'Coconut', 'Turmeric', 'Vegetables', 'Tea (Valparai)'],
        kvkName: 'TNAU KVK, Sandhiyur / Coimbatore',
        kvkContact: '0422-6611200',
      },
      {
        name: 'Madurai',
        agroZone: 'Southern Zone',
        dominantSoil: 'Red and Yellow Soil',
        majorCrops: ['Paddy', 'Jasmine (Malli)', 'Pulses', 'Millets', 'Banana'],
        kvkName: 'KVK AC & RI, Madurai',
        kvkContact: '0452-2422955',
      },
      {
        name: 'Salem',
        agroZone: 'North Western Zone',
        dominantSoil: 'Red and Yellow Soil',
        majorCrops: ['Tapioca (Cassava)', 'Mango', 'Turmeric', 'Tomato', 'Groundnut'],
        kvkName: 'KVK Sandhiyur, Salem',
        kvkContact: '0427-2422550',
      },
    ],
  },
  {
    name: 'Kerala',
    code: 'KL',
    capital: 'Thiruvananthapuram',
    agroClimaticZones: ['West Coast Plains and Ghats'],
    soilTypes: ['Laterite Soil', 'Peaty / Marshy Soil', 'Red and Yellow Soil', 'Forest / Mountain Soil'],
    districts: [
      {
        name: 'Wayanad',
        agroZone: 'High Altitude High Rainfall Zone',
        dominantSoil: 'Forest / Mountain Soil',
        majorCrops: ['Coffee (Robusta)', 'Black Pepper', 'Cardamom', 'Tea', 'Ginger', 'Banana (Nendran)'],
        kvkName: 'KAU Krishi Vigyan Kendra, Ambalavayal (Wayanad)',
        kvkContact: '04936-260411',
      },
      {
        name: 'Palakkad',
        agroZone: 'Palakkad Central Plains',
        dominantSoil: 'Black Soil (Regur)',
        majorCrops: ['Paddy (Rice bowl of Kerala)', 'Coconut', 'Groundnut', 'Vegetables', 'Mango'],
        kvkName: 'KAU KVK, Mele Pattambi, Palakkad',
        kvkContact: '0466-2212279',
      },
      {
        name: 'Alappuzha',
        agroZone: 'Kuttanad Below Sea Level Farming Zone',
        dominantSoil: 'Peaty / Marshy Soil',
        majorCrops: ['Paddy (Kuttanad Kari)', 'Coconut', 'Duck / Fish-Paddy Integrated', 'Banana'],
        kvkName: 'ICAR-CPCRI KVK, Kayamkulam (Alappuzha)',
        kvkContact: '0479-2449268',
      },
      {
        name: 'Idukki',
        agroZone: 'Cardamom Hill Reserve / High Range',
        dominantSoil: 'Laterite Soil',
        majorCrops: ['Small Cardamom', 'Black Pepper', 'Tea', 'Clove', 'Nutmeg', 'Garlic (Vattavada)'],
        kvkName: 'BSS KVK, Santhanpara, Idukki',
        kvkContact: '04868-247551',
      },
    ],
  },
  {
    name: 'Karnataka',
    code: 'KA',
    capital: 'Bengaluru',
    agroClimaticZones: ['Southern Plateau and Hills', 'West Coast Plains and Ghats'],
    soilTypes: ['Red and Yellow Soil', 'Black Soil (Regur)', 'Laterite Soil'],
    districts: [
      {
        name: 'Belagavi',
        agroZone: 'Northern Transition Zone',
        dominantSoil: 'Black Soil (Regur)',
        majorCrops: ['Sugarcane', 'Soybean', 'Cotton', 'Maize', 'Jowar', 'Vegetables'],
        kvkName: 'KLE Society KVK, Mattikopp, Belagavi',
        kvkContact: '08288-274250',
      },
      {
        name: 'Chikkamagaluru',
        agroZone: 'Hilly Zone',
        dominantSoil: 'Laterite Soil',
        majorCrops: ['Coffee (Arabica & Robusta)', 'Arecanut', 'Black Pepper', 'Cardamom'],
        kvkName: 'KVK Mudigere, Chikkamagaluru',
        kvkContact: '08263-228067',
      },
      {
        name: 'Kalaburagi (Gulbarga)',
        agroZone: 'North Eastern Dry Zone',
        dominantSoil: 'Black Soil (Regur)',
        majorCrops: ['Pigeon Pea (Red Gram / Tur Bowl)', 'Chickpea (Bengal Gram)', 'Sunflower', 'Jowar'],
        kvkName: 'UAS Krishi Vigyan Kendra, Kalaburagi',
        kvkContact: '08472-278637',
      },
    ],
  },
  {
    name: 'Gujarat',
    code: 'GJ',
    capital: 'Gandhinagar',
    agroClimaticZones: ['Gujarat Plains and Hills', 'Western Dry Region'],
    soilTypes: ['Black Soil (Regur)', 'Alluvial Soil', 'Arid / Desert Soil', 'Saline and Alkaline Soil'],
    districts: [
      {
        name: 'Rajkot',
        agroZone: 'North Saurashtra Agro-Climatic Zone',
        dominantSoil: 'Black Soil (Regur)',
        majorCrops: ['Groundnut (Peanut)', 'Cotton', 'Cumin (Jeera)', 'Sesame', 'Castor'],
        kvkName: 'JAU Krishi Vigyan Kendra, Targhadia (Rajkot)',
        kvkContact: '0281-2784244',
      },
      {
        name: 'Anand',
        agroZone: 'Middle Gujarat Agro-Climatic Zone',
        dominantSoil: 'Alluvial Soil',
        majorCrops: ['Tobacco', 'Banana', 'Paddy', 'Potato', 'Vegetables', 'Dairy/Fodder'],
        kvkName: 'AAU Krishi Vigyan Kendra, Anand',
        kvkContact: '02692-261830',
      },
      {
        name: 'Banaskantha',
        agroZone: 'North Gujarat Zone',
        dominantSoil: 'Sandy Loam',
        majorCrops: ['Potato (Processing)', 'Mustard', 'Pomegranate', 'Cumin', 'Castor'],
        kvkName: 'SDAU KVK, Deesa (Banaskantha)',
        kvkContact: '02744-220199',
      },
    ],
  },
  {
    name: 'Uttar Pradesh',
    code: 'UP',
    capital: 'Lucknow',
    agroClimaticZones: ['Upper Gangetic Plains Zone', 'Middle Gangetic Plains Zone'],
    soilTypes: ['Alluvial Soil', 'Clay Loam', 'Loamy Soil', 'Sandy Loam'],
    districts: [
      {
        name: 'Varanasi',
        agroZone: 'Eastern Plain Zone',
        dominantSoil: 'Alluvial Soil',
        majorCrops: ['Paddy', 'Wheat', 'Mustard', 'Vegetables (Chili, Tomato)', 'Guava (Ramnagar)'],
        kvkName: 'ICAR-IIVR Krishi Vigyan Kendra, Varanasi',
        kvkContact: '0542-2635236',
      },
      {
        name: 'Muzaffarnagar',
        agroZone: 'Western Plain Zone',
        dominantSoil: 'Alluvial Soil',
        majorCrops: ['Sugarcane (Sugar Bowl)', 'Wheat', 'Mustard', 'Poplar Agroforestry'],
        kvkName: 'KVK Baghra, Muzaffarnagar',
        kvkContact: '0131-2600244',
      },
      {
        name: 'Jhansi',
        agroZone: 'Bundelkhand Scarcity Zone',
        dominantSoil: 'Red and Yellow Soil',
        majorCrops: ['Chickpea (Gram)', 'Black Gram (Urad)', 'Sesame', 'Wheat', 'Lentil'],
        kvkName: 'ICAR-CAFRI KVK, Bharari (Jhansi)',
        kvkContact: '0510-2730666',
      },
    ],
  },
  {
    name: 'Madhya Pradesh',
    code: 'MP',
    capital: 'Bhopal',
    agroClimaticZones: ['Central Plateau and Hills', 'Western Plateau and Hills'],
    soilTypes: ['Black Soil (Regur)', 'Clay Loam', 'Red and Yellow Soil'],
    districts: [
      {
        name: 'Ujjain',
        agroZone: 'Malwa Plateau Agro-Climatic Zone',
        dominantSoil: 'Black Soil (Regur)',
        majorCrops: ['Soybean (Soy Capital)', 'Wheat (Sharbati/Malvi)', 'Garlic', 'Onion', 'Chickpea'],
        kvkName: 'RVSKVV Krishi Vigyan Kendra, Ujjain',
        kvkContact: '0734-2521500',
      },
      {
        name: 'Hoshangabad (Narmadapuram)',
        agroZone: 'Central Narmada Valley',
        dominantSoil: 'Black Soil (Regur)',
        majorCrops: ['Wheat (Narmada basin)', 'Paddy (Basmati)', 'Moong (Summer)', 'Soybean'],
        kvkName: 'JNKVV KVK, Powarkheda (Narmadapuram)',
        kvkContact: '07574-227123',
      },
    ],
  },
  {
    name: 'Andhra Pradesh',
    code: 'AP',
    capital: 'Amaravati',
    agroClimaticZones: ['East Coast Plains and Hills', 'Southern Plateau and Hills'],
    soilTypes: ['Alluvial Soil', 'Red and Yellow Soil', 'Black Soil (Regur)'],
    districts: [
      {
        name: 'Guntur',
        agroZone: 'Krishna-Godavari Zone',
        dominantSoil: 'Black Soil (Regur)',
        majorCrops: ['Guntur Sannam Chilli', 'Cotton', 'Paddy', 'Tobacco', 'Turmeric'],
        kvkName: 'ANGRAU Krishi Vigyan Kendra, Lam (Guntur)',
        kvkContact: '0863-2524017',
      },
      {
        name: 'Anantapur',
        agroZone: 'Scarce Rainfall Zone of Rayalaseema',
        dominantSoil: 'Red and Yellow Soil',
        majorCrops: ['Groundnut (Rainfed)', 'Sweet Orange', 'Pomegranate', 'Millets'],
        kvkName: 'KVK Reddipalli, Anantapuramu',
        kvkContact: '08554-200213',
      },
    ],
  },
  {
    name: 'Telangana',
    code: 'TS',
    capital: 'Hyderabad',
    agroClimaticZones: ['Southern Plateau and Hills'],
    soilTypes: ['Red and Yellow Soil', 'Black Soil (Regur)'],
    districts: [
      {
        name: 'Nizamabad',
        agroZone: 'Northern Telangana Zone',
        dominantSoil: 'Red and Yellow Soil',
        majorCrops: ['Turmeric (Armoor)', 'Paddy', 'Maize', 'Soybean'],
        kvkName: 'PJTSAU Krishi Vigyan Kendra, Rudrur (Nizamabad)',
        kvkContact: '08467-284210',
      },
      {
        name: 'Warangal',
        agroZone: 'Central Telangana Zone',
        dominantSoil: 'Black Soil (Regur)',
        majorCrops: ['Cotton', 'Chilli', 'Paddy', 'Maize'],
        kvkName: 'KVK Malyal, Mahabubabad / Warangal',
        kvkContact: '08719-240212',
      },
    ],
  },
  {
    name: 'West Bengal',
    code: 'WB',
    capital: 'Kolkata',
    agroClimaticZones: ['Lower Gangetic Plains Zone', 'Eastern Himalayan Region'],
    soilTypes: ['Alluvial Soil', 'Laterite Soil', 'Clay Loam', 'Peaty / Marshy Soil'],
    districts: [
      {
        name: 'Burdwan (Purba Bardhaman)',
        agroZone: 'Old Alluvial Zone',
        dominantSoil: 'Alluvial Soil',
        majorCrops: ['Paddy (Rice Bowl of Bengal - Aman/Boro)', 'Potato', 'Jute', 'Mustard'],
        kvkName: 'BCKV Krishi Vigyan Kendra, Burdwan',
        kvkContact: '0342-2656780',
      },
      {
        name: 'Darjeeling',
        agroZone: 'Hill Zone',
        dominantSoil: 'Forest / Mountain Soil',
        majorCrops: ['Darjeeling Orthodox Tea', 'Large Cardamom', 'Mandarin Orange', 'Ginger', 'Orchids'],
        kvkName: 'UBKV KVK, Kalimpong / Darjeeling',
        kvkContact: '03552-255366',
      },
    ],
  },
  {
    name: 'Rajasthan',
    code: 'RJ',
    capital: 'Jaipur',
    agroClimaticZones: ['Western Dry Region', 'Central Plateau and Hills'],
    soilTypes: ['Arid / Desert Soil', 'Sandy Loam', 'Alluvial Soil'],
    districts: [
      {
        name: 'Sri Ganganagar',
        agroZone: 'Irrigated North Western Plain Zone (Indira Gandhi Canal)',
        dominantSoil: 'Alluvial Soil',
        majorCrops: ['Wheat', 'Mustard', 'Cotton', 'Kinnnow (Citrus)', 'Gram', 'Guar'],
        kvkName: 'SKRAU Krishi Vigyan Kendra, Padampur Road, Sriganganagar',
        kvkContact: '0154-2462277',
      },
      {
        name: 'Nagaur',
        agroZone: 'Arid Western Plain Zone',
        dominantSoil: 'Arid / Desert Soil',
        majorCrops: ['Fenugreek (Methi)', 'Cumin (Jeera)', 'Guar', 'Bajra', 'Isabgol'],
        kvkName: 'AU Jodhpur KVK, Nagaur',
        kvkContact: '01582-240188',
      },
    ],
  },
  {
    name: 'Assam',
    code: 'AS',
    capital: 'Dispur',
    agroClimaticZones: ['Eastern Himalayan Region'],
    soilTypes: ['Alluvial Soil', 'Red and Yellow Soil', 'Loamy Soil'],
    districts: [
      {
        name: 'Jorhat',
        agroZone: 'Upper Brahmaputra Valley Zone',
        dominantSoil: 'Alluvial Soil',
        majorCrops: ['Assam CTC Tea', 'Sali Paddy', 'Boro Paddy', 'Bhut Jolokia (King Chili)', 'Assam Lemon'],
        kvkName: 'AAU Krishi Vigyan Kendra, Teok, Jorhat',
        kvkContact: '0376-2391300',
      },
    ],
  },
  {
    name: 'Odisha',
    code: 'OR',
    capital: 'Bhubaneswar',
    agroClimaticZones: ['East Coast Plains and Hills', 'Eastern Plateau and Hills'],
    soilTypes: ['Red and Yellow Soil', 'Laterite Soil', 'Alluvial Soil'],
    districts: [
      {
        name: 'Cuttack',
        agroZone: 'East and South Eastern Coastal Plain Zone',
        dominantSoil: 'Alluvial Soil',
        majorCrops: ['Paddy', 'Black Gram', 'Groundnut', 'Jute', 'Vegetables'],
        kvkName: 'ICAR-NRRI Krishi Vigyan Kendra, Santhapur (Cuttack)',
        kvkContact: '0671-2367757',
      },
    ],
  },
];

export const INDIAN_STATES_AND_DISTRICTS = INDIA_AGRO_STATES.map((state) => ({
  state: state.name,
  code: state.code,
  districts: state.districts.map((d) => d.name),
}));

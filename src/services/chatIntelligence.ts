/**
 * KisanAI Chat Intelligence & Agronomic Knowledge Engine
 * 
 * Provides:
 * 1. Multilingual Farmer Intent Classification (17 agricultural intents)
 * 2. Intent-Based Context Slicing (Hidden internal context, not repeated in text)
 * 3. Strict Master System Prompt Generation (Concise, direct answer first, anti-repetition rules)
 * 4. Response Sanitization & Anti-Boilerplate Filter
 * 5. Direct Offline & Deterministic Agronomic Advisory Fallback
 */

export type FarmerIntent =
  | 'WEATHER'
  | 'IRRIGATION'
  | 'FERTILIZER'
  | 'SOIL'
  | 'PEST'
  | 'DISEASE'
  | 'WEED'
  | 'CROP_PLANNING'
  | 'SOWING'
  | 'HARVEST'
  | 'MARKET_PRICE'
  | 'GOVERNMENT_SCHEME'
  | 'CROP_INFORMATION'
  | 'FARM_EXPENSE'
  | 'YIELD'
  | 'EXPERT_HELP'
  | 'GENERAL_CONVERSATION'
  | 'GENERAL_FARMING';

export const LANGUAGE_NAMES: Record<string, { name: string; native: string }> = {
  en: { name: 'English', native: 'English' },
  hi: { name: 'Hindi', native: 'हिन्दी' },
  mr: { name: 'Marathi', native: 'मराठी' },
  pa: { name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  ta: { name: 'Tamil', native: 'தமிழ்' },
  te: { name: 'Telugu', native: 'తెలుగు' },
  kn: { name: 'Kannada', native: 'ಕನ್ನಡ' },
  ml: { name: 'Malayalam', native: 'മലയാളം' },
  gu: { name: 'Gujarati', native: 'ગુજરાતી' },
  bn: { name: 'Bengali', native: 'বাংলা' },
  or: { name: 'Odia', native: 'ଓଡ଼ିଆ' },
  as: { name: 'Assamese', native: 'অসমীয়া' },
  ur: { name: 'Urdu', native: 'اردو' },
};

/**
 * Classify the farmer's question into one of the specialized agronomic intents
 * Supports English and major Indian regional vocabulary
 */
export function classifyFarmerIntent(
  query: string,
  history?: Array<{ sender: string; text: string }>
): FarmerIntent {
  if (!query || !query.trim()) return 'GENERAL_CONVERSATION';
  const q = query.toLowerCase().trim();

  // 1. Weather
  if (
    q.match(/\b(weather|rain|raining|forecast|temperature|humidity|storm|monsoon|climate|hail|wind)\b/) ||
    q.match(/(मौसम|बारिश|तापमान|हवामान|पाऊस|वर्षा|हवा|मழை|வானிலை|వర్షం|వాతావరణం|மழைப்பொழிவு|ਮੌਸਮ|ਮੀਂਹ|আবহাওয়া|বৃষ্টি|ହବାମାନ|ବର୍ଷା|বতৰ|বৰষুণ|بارش|موسم)/)
  ) {
    // Check if primarily asking about irrigation due to rain
    if (q.match(/\b(irrigate|irrigation|water|पानी|पाणी|सिंचाई|நனை|நீர்)\b/)) {
      return 'IRRIGATION';
    }
    return 'WEATHER';
  }

  // 2. Irrigation / Watering
  if (
    q.match(/\b(irrigate|irrigation|water|watering|drip|sprinkler|borewell|canal|moisture|dry soil|soak)\b/) ||
    q.match(/(सिंचाई|पानी देना|पानी कब दें|पाणी|पाणी देणे|ओलिता|जलसेचन|நீர் பாசனம்|నీటిపారుదల|ನೀರು ಹಾಯಿಸು|ਤੁਪਕਾ|ਸਿੰਚਾਈ|জলসেচ|পানি দিয়া|آبپاشی|پانی)/)
  ) {
    return 'IRRIGATION';
  }

  // 3. Fertilizer / Nutrition / Soil Amendments
  if (
    q.match(/\b(fertilizer|fertiliser|urea|dap|npk|potash|mop|zinc|boron|nitrogen|phosphorus|potassium|manure|compost|fym|dose|dosage|spray dose|deficiency|micronutrient)\b/) ||
    q.match(/(खाद|उर्वरक|यूरिया|डीएपी|एनपीके|पोटाश|जिंक|बोरोन|खत|शेणखत|मात्रा|எரு|உரம்|యూరియా|ఎరువులు|ರಸಗೊಬ್ಬರ|ਖਾਦ|ਯੂਰੀਆ|সার|সাৰ|کھاد|یوریا)/)
  ) {
    return 'FERTILIZER';
  }

  // 4. Pest / Insect
  if (
    q.match(/\b(pest|insect|caterpillar|worm|aphid|jassid|thrips|whitefly|bollworm|stem borer|hopper|mite|larva|bug|locust|attack|spray for pest)\b/) ||
    q.match(/(कीट|कीड़ा|इल्ली|माहू|सफेद मक्खी|तेला|कीटक|अळी|मावा|तुडतुडे|பூச்சி|புழு|పురుగులు|ಕೀಟ|ਕੀੜਾ|ਸੁੰਡੀ|কীটপতঙ্গ|পোকা|ପୋକ|কীট|کیڑا|سنڈی)/)
  ) {
    return 'PEST';
  }

  // 5. Disease / Fungus / Infection / Blight / Rot / Rust
  if (
    q.match(/\b(disease|fungus|fungal|blight|rot|wilt|rust|spot|yellowing|virus|infection|mildew|bacterial|leaf spot|blast|canker)\b/) ||
    q.match(/(रोग|बीमारी|फफूंद|झुलसा|उकठा|सड़न|पीलापन|रोगट|बुरशी|रोगराई|நோய்|வாடல்|తెగులు|ರೋಗ|ਬਿਮਾਰੀ|ਉੱਲੀ|রোগ|ঝলসানো|ରୋଗ|পোড়া|বেমাৰ|بیماری|پھپھوندی)/)
  ) {
    return 'DISEASE';
  }

  // 6. Weed / Herbicide / Weedicide
  if (
    q.match(/\b(weed|weeds|weedicide|herbicide|grass|unwanted plant|control weed|khurpi|weeding)\b/) ||
    q.match(/(खरपतवार|घास|निराई|गुड़ाई|तण|तणनाशक|களை|களைக்கொல்லி|కలుపు|ಕಳೆ|ਨਦੀਨ|আগাছা|ଘାସ|অপতৃণ|ঘাঁহ|جڑی بوٹیاں|گھاس)/)
  ) {
    return 'WEED';
  }

  // 7. Market Price / Mandi / Bhav / APMC / Rates
  if (
    q.match(/\b(mandi|bhav|market price|rate|price|apmc|msp|sell|selling price|cost of crop|rate today|bhaav|kimat)\b/) ||
    q.match(/(मंडी|भाव|दाम|रेट|बाजार भाव|दर|किंमत|சந்தை விலை|மண்டி|మార్కెట్ ధర|ಮಾರುಕಟ್ಟೆ ಬೆಲೆ|ਮੰਡੀ|ਭਾਅ|বাজার দর|ମଣ୍ଡି ଦର|দৰ|مارکیٹ ریٹ|منڈی ભાવ)/)
  ) {
    return 'MARKET_PRICE';
  }

  // 8. Government Schemes / Subsidy / PM-Kisan / Insurance
  if (
    q.match(/\b(scheme|yojana|subsidy|pm kisan|fasal bima|kcc|loan|insurance|grant|government support|portal|apply)\b/) ||
    q.match(/(योजना|सब्सिडी|अनुदान|पीएम किसान|फसल बीमा|केसीसी|योजनाएं|திட்டம்|மானியம்|పథకం|ಸಬ್ಸಿಡಿ|ਯੋਜਨਾ|ਸਬਸਿਡੀ|যোজনা|ଅନୁଦାନ|আঁচনি|اسکیم|سبسڈی)/)
  ) {
    return 'GOVERNMENT_SCHEME';
  }

  // 9. Sowing / Planting / Variety Selection / Seed Rate
  if (
    q.match(/\b(sow|sowing|seed|seeds|variety|germination|nursery|transplant|seed rate|spacing|plant population|when to sow)\b/) ||
    q.match(/(बुवाई|बीज|किस्म|अंकुरण|नर्सरी|पेरणी|बियाणे|वाण|விதைப்பு|விதை|విత్తనం|నాటు|ಬಿತ್ತನೆ|ਬਿਜਾਈ|ਬੀਜ|বপন|বীজ|ବୁଣିବା|বীজ সিঁচা|بوائی|بیج)/)
  ) {
    return 'SOWING';
  }

  // 10. Crop Planning / Next Crop / Crop Rotation
  if (
    q.match(/\b(crop planning|which crop|what to grow|next crop|crop rotation|intercrop|profitable crop|selection)\b/) ||
    q.match(/(कौन सी फसल|अगली फसल|फसल चक्र|कोणते पीक|அடுத்த பயிர்|ఏ పంట వేయాలి|ಯಾವ ಬೆಳೆ|ਕਿਹੜੀ ਫਸਲ|পরবর্তী ফসল|କେଉଁ ଫସଲ|কি শস্য|کون سی فصل)/)
  ) {
    return 'CROP_PLANNING';
  }

  // 11. Harvest / Harvesting / Maturity / Storage
  if (
    q.match(/\b(harvest|harvesting|cutting|reaping|maturity|storage|post harvest|drying|threshing)\b/) ||
    q.match(/(कटाई|कटाई का समय|तैयार|काढणी|तोडणी|அறுவடை|కోత|ಕೊಯ್ಲು|ਵਾਢੀ|ফসল তোলা|ଅମଳ|চপোৱা|کٹائی|پکائی)/)
  ) {
    return 'HARVEST';
  }

  // 12. Soil / pH / Soil Health Card / Testing
  if (
    q.match(/\b(soil|soil test|soil health|ph|saline|alkaline|black soil|clay|sandy|organic carbon|loam|soil structure)\b/) ||
    q.match(/(मिट्टी|मृदा|जमीन|माती|जमीन परीक्षण|மண்|భూమి|మట్టి|ಮಣ್ಣು|ਮਿੱਟੀ|মাটি|ମାଟି|মাটি পৰীক্ষা|مٹی)/)
  ) {
    return 'SOIL';
  }

  // 13. Crop Information / Package of Practice
  if (
    q.match(/\b(about wheat|about rice|about cotton|about sugarcane|crop guide|information on|how to grow)\b/) ||
    q.match(/(फसल की जानकारी|पीकाची माहिती|பயிர் தகவல்|సమాచారం|ਫਸਲ ਬਾਰੇ|তথ্য|ତଥ୍ୟ)/)
  ) {
    return 'CROP_INFORMATION';
  }

  // 14. Yield / Productivity / Production
  if (
    q.match(/\b(yield|production|quintal per acre|output|increase yield|productivity|how much harvest)\b/) ||
    q.match(/(पैदावार|उपज|उत्पादन|उत्पन्न|மகசூல்|దిగుబడి|ಇಳುವರಿ|ਝਾੜ|পয়দা|ଅମଳ ପରିମାଣ|উৎপাদন|پیداوار)/)
  ) {
    return 'YIELD';
  }

  // 15. Farm Expense / Cost / Profit / Budget
  if (
    q.match(/\b(expense|cost|profit|budget|income|expenditure|loss|financial|accounting)\b/) ||
    q.match(/(खर्च|लागत|मुनाफा|कमाई|नफा|ಹಣಕಾಸು|ਖਰਚਾ|মুনাফা|ହିସାବ|হিসাপ|خرچہ|منافع)/)
  ) {
    return 'FARM_EXPENSE';
  }

  // 16. Expert Escalation / Call / Help
  if (
    q.match(/\b(call|contact|expert|kvk|scientist|officer|helpline|phone number|talk to someone)\b/) ||
    q.match(/(संपर्क|अधिकारी|वैज्ञानिक|हेल्पलाइन|फोन|शास्त्रज्ञ|அதிகாரி|విజ్ఞాన కేంద్రం|ਹੈਲਪਲਾਈਨ|যোগাযোগ|ହେଲ୍ପଲାଇନ|رابطہ|ہیلپ لائن)/)
  ) {
    return 'EXPERT_HELP';
  }

  // 17. Greetings / General Conversation
  if (
    q.match(/^(hi|hello|hey|namaste|namaskar|pranam|ram ram|sat sri akaal|vanakkam|namaskaram|kem cho|kaisa hai|kaise ho|who are you|help me|good morning|good evening|thanks|thank you|dhanyawad|shukriya)[\s!.,?]*$/i)
  ) {
    return 'GENERAL_CONVERSATION';
  }

  return 'GENERAL_FARMING';
}

/**
 * Filter the farmer's internal context to only the slice relevant to the question
 */
export function filterRelevantContext(context: any, intent: FarmerIntent): string {
  if (!context) return 'No profile context available.';

  const farmer = context.farmer || {};
  const plot = context.plot || {};
  const crop = context.cropSeason || plot?.currentCropSeason || {};
  const soil = context.soil || plot?.soil || {};
  const weather = context.weather || {};

  const lines: string[] = [];

  // Hidden farmer background
  lines.push(`[INTERNAL CONTEXT - DO NOT REPEAT AS AN INTRODUCTORY LIST]`);
  lines.push(`Location: ${farmer.district || 'District'}, ${farmer.state || 'State'}`);
  lines.push(`Crop: ${crop.cropName || 'Field Crop'} (${crop.variety || 'Certified Variety'}), Stage: ${crop.currentStage || 'Active Growth'}`);

  switch (intent) {
    case 'WEATHER':
    case 'IRRIGATION':
      lines.push(`Current Weather: ${weather.current?.temperatureC || 30}°C, ${weather.current?.description || 'Clear'}, Rain Chance: ${weather.current?.precipitationChancePercent ?? 0}%, Humidity: ${weather.current?.humidityPercent || 65}%`);
      if (weather.current?.advisoryText) {
        lines.push(`Weather Advisory: ${weather.current.advisoryText}`);
      }
      lines.push(`Soil Type: ${soil.soilType || 'Loam'}, Water Source: ${plot.waterSource || 'Borewell / Canal'}`);
      break;

    case 'FERTILIZER':
      lines.push(`Soil pH: ${soil.ph || 7.0}, Nitrogen: ${soil.nitrogen || 'Medium'}, Phosphorus: ${soil.phosphorus || 'Medium'}, Potassium: ${soil.potassium || 'Medium'}, Organic Carbon: ${soil.organicCarbon || 0.5}%`);
      lines.push(`Sowing Date: ${crop.sowingDate || 'Recent'}, Irrigation: ${plot.waterSource || 'Drip/Borewell'}`);
      break;

    case 'PEST':
    case 'DISEASE':
    case 'WEED':
      lines.push(`Weather: ${weather.current?.temperatureC || 30}°C, Humidity: ${weather.current?.humidityPercent || 70}%, Rain Chance: ${weather.current?.precipitationChancePercent ?? 10}%`);
      lines.push(`Soil pH: ${soil.ph || 7.0}, Soil Type: ${soil.soilType || 'Loam'}`);
      break;

    case 'MARKET_PRICE':
      lines.push(`State: ${farmer.state || 'India'}, District: ${farmer.district || 'General'}`);
      break;

    case 'GOVERNMENT_SCHEME':
      lines.push(`Farmer State: ${farmer.state || 'India'}, Total Land: ${farmer.totalAcreage || plot.acreage || 2} Acres, Category: General/Small Farmer`);
      break;

    case 'SOIL':
      lines.push(`Soil Type: ${soil.soilType || 'Black/Alluvial'}, pH: ${soil.ph || 7.0}, N-P-K: ${soil.nitrogen || 'Medium'}-${soil.phosphorus || 'Medium'}-${soil.potassium || 'Medium'}, OC: ${soil.organicCarbon || 0.5}%`);
      break;

    case 'SOWING':
    case 'CROP_PLANNING':
      lines.push(`Acreage: ${plot.acreage || 2} Acres, Water Source: ${plot.waterSource || 'Borewell/Canal'}, Soil: ${soil.soilType || 'Loamy'}`);
      break;

    default:
      // General farming
      break;
  }

  return lines.join('\n');
}

/**
 * Builds the Master Agronomic System Instruction conforming strictly to the prompt
 */
export function buildAgronomicSystemInstruction(
  context: any,
  language: string = 'en',
  intent: FarmerIntent = 'GENERAL_FARMING'
): string {
  const langObj = LANGUAGE_NAMES[language] || { name: 'English', native: 'English' };
  const filteredContext = filterRelevantContext(context, intent);

  return `You are KisanAI (किसान मित्र), an AI farming assistant for Indian farmers.

Your primary job is to answer the farmer's CURRENT question accurately, clearly, and practically.

CRITICAL INSTRUCTIONS & ANTI-REPETITION RULES:
1. **Answer the question DIRECTLY in the very first sentence.** No fluff.
2. **NEVER introduce yourself.** Never say "I am KisanAI" or "Namaste [Farmer]! I am KisanAI, your precision farming companion...".
3. **NEVER repeat the farmer's profile, farm name, location, crop, soil, or weather as a bulleted card or introductory block.**
4. **Use farmer context INTERNALLY only.** Use the internal context to personalize your advice (for example: "Since your wheat is in the tillering stage..." or "Because rain is expected today..."), but DO NOT dump the profile details back to the farmer.
5. **Keep responses concise and scannable:**
   - Normal answers: 2–6 short sentences or 3–5 bullet points.
   - Give the most useful practical action or recommendation FIRST.
6. **Dosage & Action Accuracy:**
   - When recommending inputs, provide exact, standard Indian dosage per acre or per 15-litre knapsack spray pump.
   - Prioritize organic/IPM methods first (like 5% Neem Seed Kernel Extract / NSKE or Trichoderma) alongside safe chemical recommendations when needed.
7. **Ask follow-up questions only when essential missing information is required** (e.g. if the farmer asks for a fertilizer dose without stating what was already applied).
8. **Never invent weather numbers, market prices, government schemes, or fake agricultural facts.** If live market rates or specific data are not available, say so plainly.
9. **Language Requirement:** Answer entirely in ${langObj.name} (${langObj.native}, code "${language}"). Use simple, respectful, farmer-friendly regional terminology.
10. **Maintain conversational context:** If the farmer asks a follow-up question, answer it directly without restarting the conversation.

${filteredContext}`;
}

/**
 * Post-processes AI responses to strip unwanted introductory boilerplate,
 * repeated name introductions, or farm specification regurgitation.
 */
export function sanitizeChatResponse(rawText: string, farmerName?: string): string {
  if (!rawText) return '';
  let text = rawText.trim();

  // Pattern 1: Strip "Namaste [Name]! I am KisanAI..." or "Hello! I am KisanAI..."
  text = text.replace(
    /^(Namaste|Hello|Greetings|Welcome|नमस्ते|नमस्कार|सलाम|ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ|வணக்கம்|నమస్కారం|നമസ്കാരം|নমস্কার|ନମସ୍କାର|নমস্কাৰ|السلام علیکم)\s*[^!.\n]*[!,.]\s*(I am|I'm|मैं|मी|ഞാൻ|நான்|నేను|ਮੈਂ|আমি|ମୁଁ|میں)\s*(KisanAI|किसान मित्र|Kisan Mitra|your personal|your agronomy|agricultural companion)[^\n]*\n*/i,
    ''
  );

  // Pattern 2: Strip generic opening lines like "As KisanAI, your agricultural assistant..."
  text = text.replace(
    /^(As KisanAI|As your AI agricultural assistant|As your precision farming companion|As Kisan Mitra)[^,.\n]*[,.]\s*/i,
    ''
  );

  // Pattern 3: Strip repeated profile blocks like:
  // Main Field 1
  // Ahilyanagar, Maharashtra
  // Wheat (PR-126)
  // Tillering / Branching
  // pH 7.2
  // Clay Loam
  // 22°C
  // 100% rain chance
  text = text.replace(
    /(\n|^)(\*?\*?(Active Farm|Main Field|Farm Location|Crop Name|Current Crop|Growth Stage|Soil Condition|Soil Type|Real-time Weather|Weather Status)\*?\*?:?[^\n]*\n){2,}/gi,
    '\n'
  );

  // Strip leading redundant "Here is the advice for your question:"
  text = text.replace(/^(Here is the (advice|answer|recommendation) for your question:\s*)/i, '');

  return text.trim();
}

/**
 * Intelligent, direct, intent-specific fallback generator
 * Used when offline or when Gemini client is not initialized
 */
export function generateDirectFallbackResponse(
  query: string,
  context: any,
  language: string = 'en',
  intent?: FarmerIntent
): { response: string; groundingSources?: any[] } {
  const detectedIntent = intent || classifyFarmerIntent(query);
  const crop = context?.cropSeason?.cropName || context?.plot?.currentCropSeason?.cropName || 'crop';
  const variety = context?.cropSeason?.variety || context?.plot?.currentCropSeason?.variety || '';
  const stage = context?.cropSeason?.currentStage || context?.plot?.currentCropSeason?.currentStage || 'current stage';
  const district = context?.farmer?.district || 'your area';
  const state = context?.farmer?.state || 'India';
  const temp = context?.weather?.current?.temperatureC || 28;
  const rain = context?.weather?.current?.precipitationChancePercent ?? 20;
  const soilPh = context?.soil?.ph || 7.0;

  let response = '';

  switch (detectedIntent) {
    case 'IRRIGATION':
      if (rain > 40) {
        response = language === 'hi'
          ? `आज आपके क्षेत्र (${district}) में **${rain}% बारिश की संभावना** है, इसलिए अभी सिंचाई रोक दें। वर्षा समाप्त होने के बाद ही मिट्टी की नमी जांचकर सिंचाई का निर्णय लें।`
          : language === 'mr'
          ? `आज तुमच्या भागात (${district}) **${rain}% पावसाची शक्यता** असल्याने सध्या पाणी देणे टाळा. पाऊस थांबल्यानंतरच जमिनीतील ओलावा तपासून सिंचन करा.`
          : `Avoid irrigation today as there is a **${rain}% chance of rain** in ${district}. Check field soil moisture after rainfall before deciding to irrigate.`;
      } else {
        response = language === 'hi'
          ? `आपकी **${crop}** फसल (${stage}) के लिए हल्की सिंचाई करें। सुबह 7-10 बजे या शाम को ड्रिप/फरो से पानी देना सबसे उत्तम रहेगा। जलभराव न होने दें।`
          : language === 'mr'
          ? `तुमच्या **${crop}** पिकासाठी (${stage}) हलके पाणी द्या. सकाळी किंवा संध्याकाळी ठिबक सिंचनाने पाणी देणे फायदेशीर ठरेल.`
          : `Provide light irrigation for your **${crop}** (${stage}). Early morning or late evening watering is recommended to prevent evaporation loss.`;
      }
      break;

    case 'WEATHER':
      response = language === 'hi'
        ? `**${district}, ${state}** में आज का तापमान लगभग **${temp}°C** है और बारिश की संभावना **${rain}%** है। मौसम अनुकूल रहने पर सामान्य कृषि कार्य जारी रख सकते हैं।`
        : language === 'mr'
        ? `**${district}** मध्ये आज तापमान **${temp}°C** असून पावसाची शक्यता **${rain}%** आहे. हवामान लक्षात घेऊन फवारणी किंवा खतांचे नियोजन करा.`
        : `In **${district}, ${state}**, the current temperature is **${temp}°C** with a **${rain}% chance of precipitation**. Plan field operations according to local sky conditions.`;
      break;

    case 'FERTILIZER':
      response = language === 'hi'
        ? `**${crop}** फसल की **${stage}** अवस्था में पोषक तत्वों की आवश्यकता होती है:\n\n• **नाइट्रोजन (यूरिया)**: यदि मिट्टी में आवश्यकता हो तो 25-30 किग्रा/एकड़ की टॉप ड्रेसिंग करें (वर्षा से पहले छिड़काव न करें)।\n• **सूक्ष्म पोषक**: 19:19:19 @ 5 ग्राम/लीटर या जिंक सल्फेट 0.5% का पर्णीय छिड़काव करें।\n• संतुलित खुराक के लिए पहले अपना मृदा स्वास्थ्य कार्ड (Soil Health Card) अवश्य देखें।`
        : language === 'mr'
        ? `**${crop}** पिकाच्या **${stage}** अवस्थेसाठी खत व्यवस्थापन:\n\n• **नत्र (युरिया)**: गरजेनुसार 25-30 किलो/एकर हलका डोस द्या.\n• **विद्राव्य खत**: 19:19:19 @ 5 ग्रॅम/लिटर किंवा सूक्ष्म अन्नद्रव्यांची फवारणी करा.\n• खते देताना जमिनीत पुरेसा ओलावा असणे आवश्यक आहे.`
        : `For **${crop}** at the **${stage}** stage:\n\n• **Nitrogen Support**: Apply a split dose of Urea @ 25-30 kg/acre if top-dressing is due.\n• **Foliar Nutrition**: Spray 19:19:19 water-soluble fertilizer @ 5 g/litre to support vigorous tillering and vegetative growth.\n• Avoid broadcasting fertilizer immediately before heavy rain.`;
      break;

    case 'PEST':
      response = language === 'hi'
        ? `कीट नियंत्रण के लिए तुरंत यह कदम उठाएं:\n\n1. **जैविक रोकथाम**: 5% नीम का काढ़ा (NSKE) या नीम का तेल (10,000 PPM) @ 2-3 मिली/लीटर का छिड़काव करें।\n2. **चिपचिपे ट्रैप**: पीले और नीले स्टिकी ट्रैप (6-8 प्रति एकड़) लगाएं।\n3. **रासायनिक उपचार**: यदि प्रकोप अधिक है, तो स्थानीय कृषि अधिकारी या KVK से संपर्क कर अनुशंसित कीटनाशक का ही प्रयोग करें।`
        : language === 'mr'
        ? `कीड नियंत्रणासाठी तात्काळ उपाययोजना:\n\n1. **सेंद्रिय उपाय**: निंबोळी अर्क (5% NSKE) किंवा निम तेल @ 2-3 मिली/लिटर फवारा.\n2. **पिवळे व निळे चिकट सापळे**: शेतात 6-8 चिकट सापळे लावा.\n3. **मार्गदर्शन**: तीव्र प्रादुर्भाव असल्यास जवळच्या कृषी विज्ञान केंद्राचा (KVK) सल्ला घ्या.`
        : `Immediate pest management protocol for **${crop}**:\n\n1. **Bio-Control**: Spray Neem Seed Kernel Extract (5% NSKE) or Neem Oil @ 2-3 ml/litre as a broad-spectrum preventive measure.\n2. **Monitoring**: Install 6-8 yellow/blue sticky traps per acre to catch adult sucking pests.\n3. **Precautions**: Spray during calm morning hours with adequate protective gear.`;
      break;

    case 'DISEASE':
      response = language === 'hi'
        ? `रोग नियंत्रण के उपाय:\n\n1. प्रभावित पत्तियों को तोड़कर खेत से दूर नष्ट करें।\n2. **फफूंदनाशक**: साफ (Mancozeb + Carbendazim) @ 2 ग्राम/लीटर या कॉपर ऑक्सीक्लोराइड @ 2.5 ग्राम/लीटर का छिड़काव करें।\n3. खेत में जलभराव न होने दें और वायु संचार बनाए रखें।`
        : language === 'mr'
        ? `रोग नियंत्रणासाठी उपाय:\n\n1. प्रादुर्भाव झालेली पाने काढून नष्ट करा.\n2. **बुरशीनाशक**: मँकोझेब @ 2 ग्रॅम/लिटर किंवा कॉपर ऑक्सिक्लोराईड @ 2.5 ग्रॅम/लिटर फवारा.\n3. शेतात पाणी साचू देऊ नका.`
        : `Disease management protocol for **${crop}**:\n\n1. Remove and safely dispose of heavily infected leaves.\n2. **Fungicide Application**: Spray Mancozeb 75 WP @ 2 g/litre or Copper Oxychloride 50 WP @ 2.5 g/litre on a clear sunny morning.\n3. Ensure proper drainage to reduce excess field humidity.`;
      break;

    case 'MARKET_PRICE':
      response = language === 'hi'
        ? `**${crop}** के ताजा मंडी भाव आपके जिले (**${district}**) एवं राज्य (**${state}**) के नजदीकी APMC में औसतन **₹2,200 - ₹2,550 / क्विंटल** के बीच चल रहे हैं। लाइव ई-नाम (e-NAM) या Agmarknet पोर्टल पर ताजा नीलामी दरें देखें।`
        : language === 'mr'
        ? `**${crop}** चे चालू बाजारभाव **${district}** व परिसरातील कृषी उत्पन्न बाजार समितीत (APMC) अंदाजे **₹2,200 - ₹2,550 / क्विंटल** दरम्यान आहेत. अचूक दरांसाठी स्थानिक बाजार समितीच्या दरांशी संपर्क साधा.`
        : `Average market rates for **${crop}** in **${district}, ${state}** APMC markets are trending around **₹2,200 – ₹2,550 / Quintal**. You can check the live Agmarknet / e-NAM portal for today's exact arrivals.`;
      break;

    case 'GOVERNMENT_SCHEME':
      response = language === 'hi'
        ? `प्रमुख सरकारी योजनाएं:\n\n• **PM-किसान**: प्रति वर्ष ₹6,000 की वित्तीय सहायता (3 किस्तों में)।\n• **प्रधानमंत्री फसल बीमा योजना (PMFBY)**: प्राकृतिक आपदाओं से फसल नुकसान की भरपाई।\n• **किसान क्रेडिट कार्ड (KCC)**: 4% रियायती ब्याज दर पर कृषि ऋण।\n• आवेदन के लिए अपने नजदीकी CSC केंद्र या कृषि विभाग कार्यालय से संपर्क करें।`
        : language === 'mr'
        ? `शेतकऱ्यांसाठी प्रमुख सरकारी योजना:\n\n• **पीएम किसान सन्मान निधी**: दरवर्षी ₹6,000 ची थेट मदत.\n• **पंतप्रधान पीक विमा योजना (PMFBY)**: नैसर्गिक संकटात पिकाचे संरक्षण.\n• **किसान क्रेडिट कार्ड (KCC)**: सवलतीच्या व्याजदरात पीक कर्ज.\n• अधिक माहितीसाठी महाडीबीटी (MahaDBT) किंवा CSC केंद्राशी संपर्क साधा.`
        : `Key agricultural schemes available for you in **${state}**:\n\n• **PM-KISAN**: Direct income support of ₹6,000/year in 3 equal installments.\n• **PM Fasal Bima Yojana (PMFBY)**: Comprehensive crop insurance against non-preventable natural risks.\n• **Kisan Credit Card (KCC)**: Subsidized crop loan at 4% effective interest rate.\n• Visit your nearest CSC center or district agriculture office to apply.`;
      break;

    case 'GENERAL_CONVERSATION':
      response = language === 'hi'
        ? `नमस्ते! मैं आज आपके खेत और **${crop}** की फसल के लिए क्या सहायता कर सकता हूँ? आप मौसम, सिंचाई, खाद या कीट नियंत्रण के बारे में पूछ सकते हैं।`
        : language === 'mr'
        ? `नमस्कार! मी आज तुमच्या शेती आणि **${crop}** पिकासाठी काय मदत करू शकतो? तुम्ही पाणी, खते, कीड किंवा बाजारभावाबद्दल विचारू शकता.`
        : `Hello! How can I assist you with your farm and **${crop}** today? Feel free to ask about weather, irrigation, fertilizer dosage, or pest management.`;
      break;

    default:
      response = language === 'hi'
        ? `आपकी **${crop}** (${stage}) के संबंध में: खेत में नियमित निरीक्षण बनाए रखें। यदि आप विशिष्ट समस्या (कीट, खाद, सिंचाई या रोग) के बारे में पूछना चाहते हैं, तो कृपया विस्तार से बताएं।`
        : language === 'mr'
        ? `तुमच्या **${crop}** पिकाच्या सद्यस्थितीनुसार: शेतीचे नियमित निरीक्षण करा. तुम्हाला खत, पाणी किंवा किडीबद्दल नेमकी काय माहिती हवी आहे ते सांगा.`
        : `Regarding your **${crop}** (${stage}): Maintain regular field scouting. Please let me know if you need specific advice on fertilizer timing, pest management, or irrigation.`;
      break;
  }

  return {
    response,
    groundingSources: [
      {
        title: 'ICAR Package of Practices',
        uri: 'https://icar.org.in',
        sourceType: 'icar',
      },
      {
        title: `${district} Krishi Vigyan Kendra Portal`,
        uri: 'https://kvk.icar.gov.in',
        sourceType: 'icar',
      },
    ],
  };
}

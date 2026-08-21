import { LanguageCode } from '../types/farming';
import { SUPPORTED_LANGUAGES as NEW_SUPPORTED_LANGUAGES, translate } from '../i18n';

export interface LegacyLanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  speechLocale: string;
}

export const SUPPORTED_LANGUAGES: LegacyLanguageOption[] = NEW_SUPPORTED_LANGUAGES.map((l) => ({
  code: l.code,
  label: l.name,
  nativeLabel: l.nativeName,
  speechLocale: l.speechLangCode,
}));

export function getTranslation(lang: LanguageCode, key: string, fallback?: string): string {
  const legacyKeyMap: Record<string, string> = {
    appName: 'app.name',
    appTagline: 'app.tagline',
    speakToAssistant: 'chat.voicePrompt',
    listening: 'common.listening',
    todaySummary: 'dashboard.todaySummary',
    whatToDoToday: 'dashboard.whatToDoToday',
    todayRecommendations: 'dashboard.todayRecommendations',
    weatherAlert: 'dashboard.weatherAlert',
    cropGrowthStage: 'dashboard.cropGrowthStage',
    askQuestionPlaceholder: 'dashboard.askQuestionPlaceholder',
    send: 'common.send',
    voiceInput: 'common.tapToSpeak',
    stopVoice: 'common.stopRecording',
    takePhoto: 'nav.cropHealth',
    cropLibrary: 'nav.cropLibrary',
    soilHealth: 'nav.soilHealth',
    cropPlanner: 'nav.cropPlanner',
    cropCalendar: 'nav.cropCalendar',
    farmDiary: 'nav.farmDiary',
    mandiMarket: 'nav.mandiMarket',
    govSchemes: 'nav.govSchemes',
    expertEscalation: 'nav.expertSupport',
    officerDashboard: 'nav.officerDashboard',
    switchFarm: 'nav.switchFarm',
    addFarm: 'nav.addFarm',
    addPlot: 'nav.addPlot',
    offlineMode: 'common.offline',
    demoProfiles: 'nav.demoProfiles',
    whySeeingThis: 'dashboard.whySeeingThis',
    verifiedSource: 'dashboard.verifiedSource',
    confidenceHigh: 'dashboard.confidenceHigh',
    confidenceModerate: 'dashboard.confidenceModerate',
    markCompleted: 'dashboard.markCompleted',
    pendingTasks: 'dashboard.pendingTasks',
    soilPh: 'soil.ph',
    npkStatus: 'soil.cardHeader',
    organicCarbon: 'soil.organicCarbon',
    rainChance: 'weather.rainChance',
    temperature: 'weather.temperature',
    humidity: 'weather.humidity',
    soilMoisture: 'weather.soilMoisture',
    diagnosePlant: 'scanner.title',
    uploadLeafPhoto: 'scanner.uploadHeading',
    recommendedVarieties: 'library.recommendedVarieties',
    sowingWindow: 'library.sowingWindow',
    seedRate: 'library.seedRate',
    fertilizerDose: 'library.fertilizerDose',
    irrigationSchedule: 'soil.applicationSchedule',
    majorPests: 'library.majorPests',
    majorDiseases: 'library.majorDiseases',
  };

  const lookupKey = legacyKeyMap[key] || key;
  return translate(lang, lookupKey, undefined, fallback);
}

export * from '../i18n';

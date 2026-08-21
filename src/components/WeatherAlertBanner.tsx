import React, { useState } from 'react';
import {
  AlertTriangle,
  CloudRain,
  CloudLightning,
  Wind,
  Thermometer,
  ShieldAlert,
  Volume2,
  Sparkles,
  ChevronRight,
  ChevronDown,
  X,
  Radio,
  RefreshCw,
  MapPin,
  Droplets,
} from 'lucide-react';
import { FarmerProfile, WeatherContext } from '../types/farming';
import { voiceAssistant } from '../services/voiceService';
import { useI18n } from '../context/I18nContext';

interface WeatherAlertBannerProps {
  farmer: FarmerProfile;
  weather: WeatherContext;
  onQuickAsk: (prompt: string) => void;
  onNavigateTab: (tab: string) => void;
  onRefreshWeather?: () => void;
  onEditLocation?: () => void;
  isLoading?: boolean;
  activeCrop?: string;
}

export const WeatherAlertBanner: React.FC<WeatherAlertBannerProps> = ({
  farmer,
  weather,
  onQuickAsk,
  onNavigateTab,
  onRefreshWeather,
  onEditLocation,
  isLoading = false,
  activeCrop,
}) => {
  const { t, language, lookupAgro } = useI18n();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const { current } = weather;
  const severeAlertText = current.severeAlert || (weather.alerts && weather.alerts[0]?.headline) || '';
  const rainChance = current.precipitationChancePercent;
  const windSpeed = current.windSpeedKmh;
  const temp = current.temperatureC;
  const humidity = current.humidityPercent;

  const displayLocation =
    weather.locationName ||
    [farmer.village, farmer.district, farmer.state].filter(Boolean).join(', ') ||
    t('weather.editLocation');

  const isLocationMissing =
    weather.locationName === 'Location Not Set' ||
    (!farmer.state && !farmer.district && !weather.latitude);

  // If location is completely missing
  if (isLocationMissing) {
    return (
      <div
        id="weather-missing-location-banner"
        className="relative overflow-hidden rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50/60 to-yellow-50 p-4 shadow-xs text-amber-950"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 border border-amber-200 text-amber-800 shrink-0">
              <MapPin className="w-5 h-5 text-amber-700 animate-bounce" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-stone-900">
                {t('weather.editLocation')}
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                {t('weather.syncedWithDoppler')}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (onEditLocation) onEditLocation();
              else onNavigateTab('profile');
            }}
            className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all shrink-0"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{t('weather.editLocation')}</span>
          </button>
        </div>
      </div>
    );
  }

  // Determine severity tier
  const isHighSeverity =
    Boolean(severeAlertText) ||
    rainChance >= 70 ||
    current.weatherCode === 'heavy-rain' ||
    current.weatherCode === 'thunderstorm' ||
    windSpeed >= 30 ||
    temp >= 40;

  const isModerateSeverity =
    !isHighSeverity &&
    (rainChance >= 45 ||
      windSpeed >= 20 ||
      temp >= 36 ||
      humidity >= 80 ||
      current.weatherCode === 'rain');

  // Alert Headline
  const alertHeadline = severeAlertText
    ? severeAlertText
    : isHighSeverity
    ? `${t('weather.severeAlert')}: ${displayLocation}`
    : isModerateSeverity
    ? `${t('weather.advisoryText')}: ${displayLocation}`
    : `${t('weather.title')}: ${displayLocation}`;

  // Read out the alert in farmer's preferred language
  const handleSpeakAlert = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlayingAudio) {
      voiceAssistant.stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      const speech = `${t('weather.locationFor', { location: displayLocation })}: ${alertHeadline}. ${t('weather.farmingAction')}: ${current.farmingAction}. ${current.advisoryText}`;
      setIsPlayingAudio(true);
      voiceAssistant.speak(speech, language, () => {
        setIsPlayingAudio(false);
      });
    }
  };

  const handleConsultAI = (e: React.MouseEvent) => {
    e.stopPropagation();
    const localizedCrop = activeCrop ? lookupAgro('crops', activeCrop) : '';
    const cropContext = localizedCrop ? ` for my ${localizedCrop} crop` : '';
    const prompt = `Based on the live weather in ${displayLocation} (${alertHeadline}, Temp: ${temp}°C, Rain: ${rainChance}%, Wind: ${windSpeed} km/h), what immediate protective measures should I take${cropContext}? Please respond in ${language}.`;
    onQuickAsk(prompt);
    onNavigateTab('chat');
  };

  if (isDismissed) {
    return (
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/90 border border-stone-200/90 rounded-2xl text-xs text-stone-800 shadow-2xs">
        <div className="flex items-center gap-2">
          <ShieldAlert
            className={`w-4 h-4 shrink-0 ${
              isHighSeverity ? 'text-rose-600' : 'text-amber-600'
            }`}
          />
          <span className="font-semibold truncate max-w-md">
            📍 <strong>{displayLocation}:</strong> {alertHeadline}
          </span>
        </div>
        <button
          onClick={() => setIsDismissed(false)}
          className="text-emerald-700 hover:text-emerald-900 font-bold underline text-xs cursor-pointer ml-2"
        >
          {t('common.viewDetails')}
        </button>
      </div>
    );
  }

  return (
    <div
      id="weather-alert-banner"
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 shadow-xs ${
        isHighSeverity
          ? 'bg-gradient-to-r from-rose-50 via-rose-100/40 to-amber-50/80 border-rose-300/80 text-rose-950'
          : isModerateSeverity
          ? 'bg-gradient-to-r from-amber-50 via-orange-50/40 to-yellow-50/80 border-amber-300/80 text-amber-950'
          : 'bg-gradient-to-r from-sky-50 via-blue-50/40 to-emerald-50/80 border-sky-300/70 text-sky-950'
      }`}
    >
      <div className="p-4 sm:p-5 relative z-10 space-y-3">
        {/* Top Header Row: Alert Badges, Location, and Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Live Indicator Pill */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                isHighSeverity
                  ? 'bg-rose-600 text-white animate-pulse shadow-xs'
                  : isModerateSeverity
                  ? 'bg-amber-600 text-white'
                  : 'bg-sky-700 text-white'
              }`}
            >
              <Radio className="w-3 h-3 animate-spin" />
              {isHighSeverity ? t('weather.severeAlert') : t('weather.title')}
            </span>

            {/* Resolved Location Pill */}
            <button
              onClick={() => {
                if (onEditLocation) onEditLocation();
                else onNavigateTab('profile');
              }}
              title={t('weather.editLocation')}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/95 border border-stone-200/90 text-stone-800 shadow-2xs hover:bg-stone-50 cursor-pointer transition-all"
            >
              <MapPin className="w-3 h-3 text-emerald-700" />
              <span>📍 {displayLocation}</span>
            </button>

            {/* Active Crop Tag if present */}
            {activeCrop && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-900 border border-emerald-200">
                🌱 {lookupAgro('crops', activeCrop)}
              </span>
            )}

            {/* Telemetry Radar Timestamp */}
            <span className="text-[11px] text-stone-500 hidden md:inline">
              {t('common.updatedAgo', { time: weather.lastUpdated || t('common.justNow') })}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Manual Refresh Button */}
            {onRefreshWeather && (
              <button
                id="alert-refresh-weather-btn"
                onClick={onRefreshWeather}
                disabled={isLoading}
                className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold border border-stone-200/80 hover:border-stone-300 flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                title={t('weather.refreshWeather')}
              >
                <RefreshCw className={`w-3.5 h-3.5 text-stone-700 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isLoading ? t('common.loading') : t('common.refresh')}</span>
              </button>
            )}

            {/* Voice Readout Button */}
            <button
              id="alert-voice-btn"
              onClick={handleSpeakAlert}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold border border-stone-200/80 hover:border-stone-300 flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              title={t('chat.speakAnswer')}
            >
              <Volume2
                className={`w-3.5 h-3.5 ${
                  isPlayingAudio ? 'text-rose-600 animate-pulse' : 'text-stone-700'
                }`}
              />
              <span className="hidden sm:inline">
                {isPlayingAudio ? t('common.stopRecording') : t('chat.speakAnswer')}
              </span>
            </button>

            {/* AI Protection Guide Button */}
            <button
              id="alert-consult-ai-btn"
              onClick={handleConsultAI}
              className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer hover:scale-102 ${
                isHighSeverity
                  ? 'bg-rose-700 hover:bg-rose-800 text-white'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('nav.aiAssistant')}</span>
              <ChevronRight className="w-3 h-3" />
            </button>

            {/* Dismiss Cross */}
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-white/60 transition-all cursor-pointer"
              title={t('common.close')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Alert Warning Title & Impact Summary */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-start gap-2.5">
              <div
                className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                  isHighSeverity
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : isModerateSeverity
                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                    : 'bg-sky-100 text-sky-700 border border-sky-200'
                }`}
              >
                {current.weatherCode === 'thunderstorm' ? (
                  <CloudLightning className="w-5 h-5" />
                ) : rainChance >= 50 ? (
                  <CloudRain className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold tracking-tight leading-snug">
                  {alertHeadline}
                </h2>
                <p className="text-xs sm:text-sm font-medium opacity-90 mt-1">
                  <strong>{t('weather.farmingAction')}:</strong> {current.farmingAction}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Weather Telemetry Snapshot */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 self-start sm:self-center shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-white/95 border border-stone-200/90 flex items-center gap-1.5 shadow-2xs text-xs">
              <Thermometer className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-bold text-stone-900">{temp}°C</span>
              <span className="text-[10px] text-stone-500 font-medium">
                (Min {current.minTempC}° / Max {current.maxTempC}°)
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-white/95 border border-stone-200/90 flex items-center gap-1.5 shadow-2xs text-xs">
              <Droplets className="w-3.5 h-3.5 text-sky-600" />
              <span className="font-bold text-sky-900">{rainChance}% {t('weather.rainChance')}</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-white/95 border border-stone-200/90 flex items-center gap-1.5 shadow-2xs text-xs">
              <Wind className="w-3.5 h-3.5 text-stone-600" />
              <span className="font-bold text-stone-900">{windSpeed} km/h</span>
            </div>
          </div>
        </div>

        {/* Expandable Section: Full Technical Advisory & IMD Guidelines */}
        <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-bold flex items-center gap-1.5 text-stone-800 hover:text-stone-950 cursor-pointer"
          >
            <span>
              {isExpanded
                ? t('weather.advisoryText')
                : t('weather.forecast')}
            </span>
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          <span className="text-[11px] text-stone-500 font-medium">
            {t('weather.syncedWithDoppler')}
          </span>
        </div>

        {isExpanded && (
          <div className="mt-2 p-3.5 rounded-xl bg-white/95 border border-stone-200/90 text-xs text-stone-800 space-y-2 animate-in fade-in duration-200">
            <div>
              <span className="font-bold text-stone-900 block mb-0.5">{t('weather.advisoryText')}:</span>
              <p className="leading-relaxed text-stone-700">{current.advisoryText}</p>
            </div>

            <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-600">
              <div className="flex items-center gap-3">
                <span>
                  • {t('weather.humidity')}: <strong>{humidity}%</strong>
                </span>
                <span>
                  • {t('weather.windSpeed')}: <strong>{windSpeed} km/h</strong>
                </span>
              </div>
              <button
                onClick={handleConsultAI}
                className="text-emerald-800 font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>{t('nav.aiAssistant')}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

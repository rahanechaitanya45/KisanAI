import React, { useState } from 'react';
import {
  AlertTriangle,
  CloudRain,
  CloudLightning,
  Sun,
  Wind,
  Thermometer,
  ShieldAlert,
  Volume2,
  Sparkles,
  ChevronRight,
  ChevronDown,
  X,
  Radio,
  ExternalLink,
  Droplets,
} from 'lucide-react';
import { FarmerProfile, WeatherContext } from '../types/farming';
import { voiceAssistant } from '../services/voiceService';

interface WeatherAlertBannerProps {
  farmer: FarmerProfile;
  weather: WeatherContext;
  onQuickAsk: (prompt: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const WeatherAlertBanner: React.FC<WeatherAlertBannerProps> = ({
  farmer,
  weather,
  onQuickAsk,
  onNavigateTab,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const { current } = weather;
  const severeAlertText = current.severeAlert || '';
  const rainChance = current.precipitationChancePercent;
  const windSpeed = current.windSpeedKmh;
  const temp = current.temperatureC;
  const humidity = current.humidityPercent;

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

  // Fallback alert message if severeAlert string is not explicitly set
  const alertHeadline = severeAlertText
    ? severeAlertText
    : isHighSeverity
    ? `Critical Weather Warning: Heavy precipitation & high humidity anticipated in ${weather.locationName || farmer.district}`
    : isModerateSeverity
    ? `Agro-Weather Advisory: Field conditions requiring preventive action in ${weather.locationName || farmer.district}`
    : `Weather Update: Normal seasonal conditions in ${weather.locationName || farmer.district}`;

  // Read out the alert in farmer's preferred language
  const handleSpeakAlert = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlayingAudio) {
      voiceAssistant.stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      const speech = `Attention ${farmer.name}. Weather warning for ${weather.locationName || farmer.district}: ${alertHeadline}. Immediate farm action: ${current.farmingAction}. Advisory: ${current.advisoryText}`;
      setIsPlayingAudio(true);
      voiceAssistant.speak(speech, farmer.preferredLanguage, () => {
        setIsPlayingAudio(false);
      });
    }
  };

  const handleConsultAI = (e: React.MouseEvent) => {
    e.stopPropagation();
    const prompt = `Based on the active weather alert in ${weather.locationName || farmer.district} (${alertHeadline}, Temp: ${temp}°C, Rain: ${rainChance}%, Wind: ${windSpeed} km/h), what immediate protective measures should I take for my field?`;
    onQuickAsk(prompt);
    onNavigateTab('chat');
  };

  if (isDismissed) {
    return (
      <div className="flex items-center justify-between px-4 py-2 bg-amber-50/80 border border-amber-200/90 rounded-2xl text-xs text-amber-900 shadow-2xs">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-semibold truncate max-w-md">
            Active Warning for {weather.locationName || farmer.district}: {alertHeadline}
          </span>
        </div>
        <button
          onClick={() => setIsDismissed(false)}
          className="text-amber-800 hover:text-amber-950 font-bold underline text-xs cursor-pointer ml-2"
        >
          View Alert Details
        </button>
      </div>
    );
  }

  return (
    <div
      id="weather-alert-banner"
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 shadow-xs ${
        isHighSeverity
          ? 'bg-gradient-to-r from-rose-50 via-rose-100/50 to-amber-50 border-rose-300/80 text-rose-950'
          : isModerateSeverity
          ? 'bg-gradient-to-r from-amber-50 via-orange-50/50 to-yellow-50 border-amber-300/80 text-amber-950'
          : 'bg-gradient-to-r from-sky-50 via-blue-50/50 to-emerald-50 border-sky-300/70 text-sky-950'
      }`}
    >
      {/* Background radar sweep glow */}
      <div className="absolute top-0 right-0 w-72 h-full opacity-10 pointer-events-none bg-radial from-current to-transparent" />

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
              {isHighSeverity ? 'Severe Weather Alert' : 'Live IMD Agro Advisory'}
            </span>

            {/* Location Pill */}
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/90 border border-stone-200/90 text-stone-800 shadow-2xs">
              📍 {weather.locationName || `${farmer.district}, ${farmer.state}`}
            </span>

            <span className="text-[11px] text-stone-500 hidden md:inline">
              Updated: {weather.lastUpdated || 'Real-time Radar Sync'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Voice Readout Button */}
            <button
              id="alert-voice-btn"
              onClick={handleSpeakAlert}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold border border-stone-200/80 hover:border-stone-300 flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              title="Listen warning in your language"
            >
              <Volume2
                className={`w-3.5 h-3.5 ${
                  isPlayingAudio ? 'text-rose-600 animate-pulse' : 'text-stone-700'
                }`}
              />
              <span className="hidden sm:inline">
                {isPlayingAudio ? 'Speaking...' : 'Listen Warning'}
              </span>
            </button>

            {/* AI Mitigation Button */}
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
              <span>Get AI Protection Guide</span>
              <ChevronRight className="w-3 h-3" />
            </button>

            {/* Dismiss Cross */}
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-white/60 transition-all cursor-pointer"
              title="Dismiss warning for now"
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
                  <strong>Recommended Field Action:</strong> {current.farmingAction}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Weather Telemetry Snapshot */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 self-start sm:self-center shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-white/90 border border-stone-200/90 flex items-center gap-1.5 shadow-2xs text-xs">
              <Thermometer className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-bold text-stone-900">{temp}°C</span>
              <span className="text-[10px] text-stone-500 font-medium">
                (Min {current.minTempC}° / Max {current.maxTempC}°)
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-white/90 border border-stone-200/90 flex items-center gap-1.5 shadow-2xs text-xs">
              <Droplets className="w-3.5 h-3.5 text-sky-600" />
              <span className="font-bold text-sky-900">{rainChance}% Rain</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-white/90 border border-stone-200/90 flex items-center gap-1.5 shadow-2xs text-xs">
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
            <span>{isExpanded ? 'Hide Detailed IMD Agro-Meteorology Advisory' : 'View Detailed Advisory & Prevention Guidelines'}</span>
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          <span className="text-[11px] text-stone-500 font-medium">
            Source: IMD & District Agromet Field Unit (DAMFU)
          </span>
        </div>

        {isExpanded && (
          <div className="mt-2 p-3.5 rounded-xl bg-white/95 border border-stone-200/90 text-xs text-stone-800 space-y-2 animate-in fade-in duration-200">
            <div>
              <span className="font-bold text-stone-900 block mb-0.5">Agro-Meteorological Advisory:</span>
              <p className="leading-relaxed text-stone-700">{current.advisoryText}</p>
            </div>

            <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-600">
              <div className="flex items-center gap-3">
                <span>• Relative Humidity: <strong>{humidity}%</strong></span>
                <span>• Wind Velocity: <strong>{windSpeed} km/h</strong></span>
                <span>• Weather Code: <strong className="capitalize">{current.weatherCode.replace('-', ' ')}</strong></span>
              </div>
              <button
                onClick={handleConsultAI}
                className="text-emerald-800 font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Generate customized crop-specific protocol</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

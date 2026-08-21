import React, { useState } from 'react';
import {
  Sparkles,
  Mic,
  MicOff,
  CloudRain,
  Sun,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  LandPlot,
  Layers,
  ShieldAlert,
  ArrowUpRight,
  Camera,
  Volume2,
  DollarSign,
  Landmark,
  Check,
  Sprout,
} from 'lucide-react';
import {
  FarmerProfile,
  Farm,
  FarmPlot,
  WeatherContext,
  FarmTask,
} from '../types/farming';
import { useI18n } from '../context/I18nContext';
import { voiceAssistant } from '../services/voiceService';
import confetti from 'canvas-confetti';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { MetricCard } from './ui/MetricCard';
import { WeatherAlertBanner } from './WeatherAlertBanner';

interface DashboardProps {
  farmer: FarmerProfile;
  selectedFarm: Farm;
  selectedPlot: FarmPlot;
  weather: WeatherContext;
  tasks: FarmTask[];
  onCompleteTask: (taskId: string) => void;
  onNavigateTab: (tab: string) => void;
  onQuickAsk: (prompt: string) => void;
  onRefreshWeather?: () => void;
  onEditLocation?: () => void;
  isWeatherLoading?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  farmer,
  selectedFarm,
  selectedPlot,
  weather,
  tasks,
  onCompleteTask,
  onNavigateTab,
  onQuickAsk,
  onRefreshWeather,
  onEditLocation,
  isWeatherLoading = false,
}) => {
  const { t, language, lookupAgro } = useI18n();
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const currentCrop = selectedPlot?.currentCropSeason;
  const localizedCropName = currentCrop?.cropName ? lookupAgro('crops', currentCrop.cropName) : t('common.noData');
  const localizedStage = currentCrop?.currentStage ? lookupAgro('growthStages', currentCrop.currentStage) : t('common.active');
  const localizedSoilType = selectedPlot?.soil?.soilType ? lookupAgro('soilTypes', selectedPlot.soil.soilType) : t('common.noData');

  // Handle Voice Search on the Dashboard
  const handleToggleVoice = () => {
    if (isRecording) {
      voiceAssistant.stopListening();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setVoiceTranscript(t('common.listening'));
      voiceAssistant.startListening(
        language,
        (transcript) => {
          setVoiceTranscript(transcript);
          setIsRecording(false);
          onQuickAsk(transcript);
          onNavigateTab('chat');
        },
        (err) => {
          console.warn('Voice error:', err);
          setIsRecording(false);
          setVoiceTranscript(t('errors.aiUnavailable'));
        },
        () => {
          setIsRecording(false);
        }
      );
    }
  };

  // Play spoken daily advisory
  const handleSpeakAdvisory = () => {
    if (isPlayingAudio) {
      voiceAssistant.stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      const loc = weather.locationName || farmer.district || farmer.state;
      const summaryText = `${t('dashboard.greeting', { name: farmer.name })} ${loc}. ${t('dashboard.todayRecommendations')}: ${weather.current.farmingAction}. ${t('weather.temperature')}: ${weather.current.temperatureC}°C, ${t('weather.rainChance')}: ${weather.current.precipitationChancePercent}%.`;
      setIsPlayingAudio(true);
      voiceAssistant.speak(summaryText, language, () => {
        setIsPlayingAudio(false);
      });
    }
  };

  const handleTaskDone = (taskId: string) => {
    onCompleteTask(taskId);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (e) {}
  };

  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Real-Time Agro-Meteorology Weather Alert Banner */}
      <WeatherAlertBanner
        farmer={farmer}
        weather={weather}
        onQuickAsk={onQuickAsk}
        onNavigateTab={onNavigateTab}
        onRefreshWeather={onRefreshWeather}
        onEditLocation={onEditLocation}
        isLoading={isWeatherLoading}
        activeCrop={currentCrop?.cropName}
      />

      {/* 1. Master Welcome & Real-Time Agronomic Hero Card - Light Aesthetic */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-50/80 via-[#f2faf5] to-white text-stone-900 p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(21,128,61,0.06)] border border-emerald-200/80 relative overflow-hidden">
        {/* Subtle background botanical watermark */}
        <div className="absolute right-0 bottom-0 opacity-[0.04] pointer-events-none translate-x-12 translate-y-12">
          <LandPlot className="w-80 h-80 text-emerald-900" />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Greeting & Daily Actionable Advisory */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100/80 text-emerald-900 border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                {t('dashboard.todaySummary')}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-stone-700 border border-stone-200/90 shadow-2xs">
                {farmer.district}, {farmer.state}
              </span>
            </div>

            <div>
              <p className="text-emerald-800 text-sm font-semibold">
                {t('dashboard.greeting', { name: farmer.name })}
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight mt-1 leading-snug">
                {weather.current.farmingAction}
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed max-w-2xl bg-white/90 p-3.5 rounded-2xl border border-emerald-200/70 shadow-xs">
              <strong className="text-emerald-800 font-bold">
                {t('dashboard.whySeeingThis')}{' '}
              </strong>
              {weather.current.advisoryText}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                id="voice-advisory-play-btn"
                onClick={handleSpeakAdvisory}
                className="px-4 py-2 rounded-xl bg-white hover:bg-emerald-50 text-stone-800 text-xs font-bold flex items-center gap-2 border border-stone-200/90 hover:border-emerald-300 shadow-xs transition-all cursor-pointer"
              >
                <Volume2
                  className={`w-4 h-4 ${
                    isPlayingAudio ? 'text-emerald-700 animate-pulse' : 'text-emerald-600'
                  }`}
                />
                <span>{isPlayingAudio ? t('common.stopRecording') : t('chat.speakAnswer')}</span>
              </button>

              <button
                id="hero-ask-ai-btn"
                onClick={() => onNavigateTab('chat')}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer hover:scale-102"
              >
                <span>{t('nav.aiAssistant')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* Voice Mic pill */}
              <button
                id="dashboard-mic-btn"
                onClick={handleToggleVoice}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  isRecording
                    ? 'bg-rose-600 text-white animate-pulse ring-2 ring-rose-300 shadow-xs'
                    : 'bg-white hover:bg-amber-50 text-amber-900 border border-amber-200 shadow-xs'
                }`}
                title={t('common.tapToSpeak')}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-amber-700" />}
                <span>{isRecording ? t('common.listening') : t('common.tapToSpeak')}</span>
              </button>
            </div>

            {voiceTranscript && (
              <p className="text-xs text-emerald-900 italic max-w-xl truncate font-medium">
                "{voiceTranscript}"
              </p>
            )}
          </div>

          {/* Right Column: Live Farm & Crop Snapshot Card */}
          <div className="lg:col-span-4 bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-emerald-200/80 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-emerald-800 font-bold">
                  {t('dashboard.activePlots')}
                </p>
                <h3 className="text-base font-black text-stone-900">{selectedPlot?.name}</h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {selectedPlot?.areaAcres} {t('common.acre')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-[#f9faf7] border border-stone-200/80">
                <span className="text-stone-500 text-[10px] block font-medium">
                  {t('onboarding.currentCrop')}
                </span>
                <span className="font-bold text-stone-900 text-xs truncate block mt-0.5">
                  {localizedCropName} ({currentCrop?.variety || 'Desi'})
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#f9faf7] border border-stone-200/80">
                <span className="text-stone-500 text-[10px] block font-medium">
                  {t('dashboard.cropGrowthStage')}
                </span>
                <span className="font-bold text-emerald-800 text-xs block mt-0.5">
                  {localizedStage}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#f9faf7] border border-stone-200/80">
                <span className="text-stone-500 text-[10px] block font-medium">
                  {t('onboarding.soilType')}
                </span>
                <span className="font-bold text-stone-900 text-xs block mt-0.5">
                  pH {selectedPlot?.soil?.ph} • {localizedSoilType}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#f9faf7] border border-stone-200/80">
                <span className="text-stone-500 text-[10px] block font-medium">
                  {t('onboarding.waterSource')}
                </span>
                <span className="font-bold text-stone-900 text-xs block mt-0.5">
                  {selectedPlot?.waterSource}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-stone-500">{t('onboarding.sowingDate')}: {currentCrop?.sowingDate}</span>
              <button
                onClick={() => onNavigateTab('calendar')}
                className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>{t('nav.cropCalendar')}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Priority 1 & 2: Critical Alerts & Key Farm Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Weather Metric */}
        <MetricCard
          title={t('weather.current')}
          value={`${weather.current.temperatureC}°C`}
          subtitle={`${weather.current.precipitationChancePercent}% ${t('weather.rainChance')}`}
          icon={
            weather.current.precipitationChancePercent > 40 ? (
              <CloudRain className="w-5 h-5 text-sky-600" />
            ) : (
              <Sun className="w-5 h-5 text-amber-600" />
            )
          }
          iconBgColor="bg-sky-50 text-sky-700 border-sky-200"
          badge={
            <Badge variant="info" size="sm">
              {weather.locationName}
            </Badge>
          }
          trend={{
            value: `${t('weather.humidity')} ${weather.current.humidityPercent}%`,
            isPositive: true,
            label: `• ${t('weather.windSpeed')} ${weather.current.windSpeedKmh}km/h`,
          }}
        />

        {/* Soil Health Status */}
        <MetricCard
          title={t('nav.soilHealth')}
          value={`pH ${selectedPlot?.soil?.ph || 7.0}`}
          subtitle={`${t('soil.organicCarbon')} ${selectedPlot?.soil?.organicCarbon}%`}
          icon={<Layers className="w-5 h-5 text-emerald-700" />}
          iconBgColor="bg-emerald-50 text-emerald-700 border-emerald-200"
          badge={
            <Badge variant="success" size="sm">
              {t('common.verified')}
            </Badge>
          }
          trend={{
            value: `${t('soil.nitrogen')} ${t('common.medium')}`,
            isPositive: true,
            label: `• ${t('soil.phosphorus')} ${t('common.high')}`,
          }}
          onClick={() => onNavigateTab('soil')}
        />

        {/* Crop Growth Progress */}
        <MetricCard
          title={t('dashboard.cropGrowthStage')}
          value={localizedStage}
          subtitle={`${t('mandi.variety')}: ${currentCrop?.variety || 'Hybrid'}`}
          icon={<Sprout className="w-5 h-5 text-amber-700" />}
          iconBgColor="bg-amber-50 text-amber-700 border-amber-200"
          badge={
            <Badge variant="earth" size="sm">
              {t('common.active')}
            </Badge>
          }
          trend={{
            value: localizedCropName,
            isPositive: true,
            label: `• ${selectedPlot?.areaAcres} ${t('common.acre')}`,
          }}
          onClick={() => onNavigateTab('calendar')}
        />

        {/* Pending Farm Tasks */}
        <MetricCard
          title={t('dashboard.pendingTasks')}
          value={pendingTasksCount}
          subtitle={t('common.today')}
          icon={<CheckCircle2 className="w-5 h-5 text-purple-700" />}
          iconBgColor="bg-purple-50 text-purple-700 border-purple-200"
          badge={
            <Badge variant="purple" size="sm">
              {pendingTasksCount > 0 ? t('common.pending') : t('common.completed')}
            </Badge>
          }
          trend={{
            value: `${tasks.filter((t) => t.completed).length} ${t('common.completed')}`,
            isPositive: true,
            label: '',
          }}
          onClick={() => onNavigateTab('calendar')}
        />
      </div>

      {/* Priority 3: Main Grid (Today's Tasks + 5-Day Weather & Advisory) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Actionable Tasks List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <Card variant="standard" padding="lg">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 font-bold">
                  <Check className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-stone-900">
                    {t('dashboard.pendingTasks')} ({pendingTasksCount})
                  </h2>
                  <p className="text-xs text-stone-500">
                    {t('dashboard.cropStageDescription', {
                      plot: selectedPlot?.name || '',
                      crop: localizedCropName,
                      stage: localizedStage,
                    })}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateTab('calendar')}
              >
                + {t('common.add')}
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              {tasks.length === 0 ? (
                <p className="text-center py-6 text-sm text-stone-500">
                  {t('dashboard.noTasksToday')}
                </p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      task.completed
                        ? 'bg-stone-50/70 border-stone-200 opacity-60'
                        : task.priority === 'Urgent'
                        ? 'bg-amber-50/60 border-amber-200'
                        : 'bg-white border-stone-200 hover:border-emerald-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={task.priority === 'Urgent' ? 'danger' : 'neutral'}
                          size="sm"
                        >
                          {task.priority === 'Urgent' ? t('common.critical') : t('common.medium')}
                        </Badge>
                        <span
                          className={`text-sm font-bold ${
                            task.completed
                              ? 'line-through text-stone-500'
                              : 'text-stone-900'
                          }`}
                        >
                          {task.title}
                        </span>
                        <span className="text-xs text-stone-500 font-medium">
                          • {task.category}
                        </span>
                      </div>

                      <p className="text-xs text-stone-600 leading-relaxed">
                        {task.description}
                      </p>

                      {task.whyExplanation && (
                        <div className="text-[11px] text-amber-900 bg-amber-100/50 px-2.5 py-1 rounded-lg border border-amber-200/60 inline-flex items-center gap-1">
                          <span>💡</span>
                          <span>
                            <strong>{t('dashboard.whySeeingThis')}:</strong> {task.whyExplanation}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 pt-2 sm:pt-0">
                      <Button
                        variant={task.completed ? 'secondary' : 'primary'}
                        size="sm"
                        leftIcon={<CheckCircle2 className="w-4 h-4" />}
                        onClick={() => handleTaskDone(task.id)}
                      >
                        {task.completed
                          ? t('common.completed')
                          : t('dashboard.markCompleted')}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Quick AI Consultation Chips */}
          <Card variant="highlight" padding="md">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                {t('chat.suggestedTitle', { crop: localizedCropName })}
              </h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                t('chat.suggested1', { crop: localizedCropName }),
                t('chat.suggested2', { stage: localizedStage }),
                t('chat.suggested3'),
                t('chat.suggested4', { crop: localizedCropName }),
              ].map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onQuickAsk(prompt);
                    onNavigateTab('chat');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-950 text-xs font-semibold border border-stone-200 hover:border-emerald-300 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <span>{prompt}</span>
                  <ArrowUpRight className="w-3 h-3 text-stone-400" />
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: 5-Day Weather & Fast Access Cards (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* 5-Day Agro Weather Forecast */}
          <Card variant="standard" padding="md">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
                  <CloudRain className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    {t('weather.forecast')}
                  </h3>
                  <p className="text-[11px] text-stone-500">{t('weather.syncedWithDoppler')}</p>
                </div>
              </div>
              <Badge variant="info" size="sm">
                {t('common.verified')}
              </Badge>
            </div>

            {weather.current.severeAlert && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="font-semibold leading-tight">
                  {weather.current.severeAlert}
                </span>
              </div>
            )}

            <div className="mt-3 divide-y divide-stone-100">
              {weather.forecast.map((f, i) => (
                <div key={i} className="py-2 flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-800 w-16">{f.dayName}</span>
                  <div className="flex items-center gap-1.5 text-stone-500">
                    <span>{f.condition}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-stone-900 mr-2">{f.maxTemp}°C</span>
                    <span className="text-[11px] font-semibold text-sky-700">
                      💧 {f.rainChance}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
              <span>{t('weather.rainChance')}: {weather.current.precipitationChancePercent}%</span>
              <button
                onClick={() => onQuickAsk(t('chat.suggested1', { crop: localizedCropName }))}
                className="text-emerald-700 font-bold hover:underline cursor-pointer"
              >
                {t('weather.advisoryText')} →
              </button>
            </div>
          </Card>

          {/* Quick Launchers 4-Grid */}
          <div className="grid grid-cols-2 gap-3">
            <Card
              variant="interactive"
              padding="sm"
              onClick={() => onNavigateTab('scanner')}
              className="group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Camera className="w-4 h-4 text-emerald-700" />
              </div>
              <p className="font-bold text-xs text-stone-900">{t('nav.cropHealth')}</p>
              <p className="text-[11px] text-stone-500">{t('dashboard.scanCrop')}</p>
            </Card>

            <Card
              variant="interactive"
              padding="sm"
              onClick={() => onNavigateTab('planner')}
              className="group"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-4 h-4 text-amber-700" />
              </div>
              <p className="font-bold text-xs text-stone-900">{t('nav.cropPlanner')}</p>
              <p className="text-[11px] text-stone-500">{t('dashboard.cropPlannerAction')}</p>
            </Card>

            <Card
              variant="interactive"
              padding="sm"
              onClick={() => onNavigateTab('mandi')}
              className="group"
            >
              <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <DollarSign className="w-4 h-4 text-sky-700" />
              </div>
              <p className="font-bold text-xs text-stone-900">{t('nav.mandiMarket')}</p>
              <p className="text-[11px] text-stone-500">{t('dashboard.mandiRatesAction')}</p>
            </Card>

            <Card
              variant="interactive"
              padding="sm"
              onClick={() => onNavigateTab('schemes')}
              className="group"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Landmark className="w-4 h-4 text-purple-700" />
              </div>
              <p className="font-bold text-xs text-stone-900">{t('nav.govSchemes')}</p>
              <p className="text-[11px] text-stone-500">{t('dashboard.govSchemesAction')}</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

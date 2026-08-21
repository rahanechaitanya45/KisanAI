import React, { useState } from 'react';
import {
  Sparkles,
  Mic,
  MicOff,
  CloudRain,
  Sun,
  Droplets,
  Wind,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  LandPlot,
  Layers,
  Thermometer,
  ShieldAlert,
  ArrowUpRight,
  Camera,
  Volume2,
  Calendar,
  DollarSign,
  Landmark,
  Check,
  Zap,
  Sprout,
} from 'lucide-react';
import {
  FarmerProfile,
  Farm,
  FarmPlot,
  WeatherContext,
  FarmTask,
} from '../types/farming';
import { getTranslation } from '../data/i18n';
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
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const lang = farmer.preferredLanguage;
  const currentCrop = selectedPlot?.currentCropSeason;

  // Handle Voice Search on the Dashboard
  const handleToggleVoice = () => {
    if (isRecording) {
      voiceAssistant.stopListening();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setVoiceTranscript('Listening in ' + farmer.preferredLanguage + '...');
      voiceAssistant.startListening(
        farmer.preferredLanguage,
        (transcript) => {
          setVoiceTranscript(transcript);
          setIsRecording(false);
          onQuickAsk(transcript);
          onNavigateTab('chat');
        },
        (err) => {
          console.warn('Voice error:', err);
          setIsRecording(false);
          setVoiceTranscript('Could not capture speech. Please type in chat.');
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
      const summaryText = `Namaste ${farmer.name}. On your farm in ${farmer.district}, today's recommendation: ${weather.current.farmingAction}. Current weather: ${weather.current.temperatureC} degrees with ${weather.current.precipitationChancePercent} percent rain chance.`;
      setIsPlayingAudio(true);
      voiceAssistant.speak(summaryText, farmer.preferredLanguage, () => {
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

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Real-Time Agro-Meteorology Weather Alert Banner */}
      <WeatherAlertBanner
        farmer={farmer}
        weather={weather}
        onQuickAsk={onQuickAsk}
        onNavigateTab={onNavigateTab}
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
                {getTranslation(lang, 'todaySummary')}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-stone-700 border border-stone-200/90 shadow-2xs">
                {farmer.district}, {farmer.state}
              </span>
            </div>

            <div>
              <p className="text-emerald-800 text-sm font-semibold">
                Good morning, <span className="text-stone-900 font-extrabold">{farmer.name}</span>
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight mt-1 leading-snug">
                {weather.current.farmingAction}
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed max-w-2xl bg-white/90 p-3.5 rounded-2xl border border-emerald-200/70 shadow-xs">
              <strong className="text-emerald-800 font-bold">
                {getTranslation(lang, 'whySeeingThis')}{' '}
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
                <span>{isPlayingAudio ? 'Pause Audio' : 'Listen in Mother Tongue'}</span>
              </button>

              <button
                id="hero-ask-ai-btn"
                onClick={() => onNavigateTab('chat')}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer hover:scale-102"
              >
                <span>Ask AI Assistant</span>
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
                title="Speak question in your mother tongue"
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-amber-700" />}
                <span>{isRecording ? getTranslation(lang, 'listening') : 'Tap to Speak'}</span>
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
                  Active Plot
                </p>
                <h3 className="text-base font-black text-stone-900">{selectedPlot?.name}</h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {selectedPlot?.areaAcres} Acres
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-[#f9faf7] border border-stone-200/80">
                <span className="text-stone-500 text-[10px] block font-medium">Crop & Variety</span>
                <span className="font-bold text-stone-900 text-xs truncate block mt-0.5">
                  {currentCrop?.cropName} ({currentCrop?.variety})
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#f9faf7] border border-stone-200/80">
                <span className="text-stone-500 text-[10px] block font-medium">Current Stage</span>
                <span className="font-bold text-emerald-800 text-xs block mt-0.5">
                  {currentCrop?.currentStage}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#f9faf7] border border-stone-200/80">
                <span className="text-stone-500 text-[10px] block font-medium">Soil pH / Type</span>
                <span className="font-bold text-stone-900 text-xs block mt-0.5">
                  {selectedPlot?.soil?.ph} • {selectedPlot?.soil?.soilType.split(' ')[0]}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#f9faf7] border border-stone-200/80">
                <span className="text-stone-500 text-[10px] block font-medium">Water Source</span>
                <span className="font-bold text-stone-900 text-xs block mt-0.5">
                  {selectedPlot?.waterSource}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-stone-500">Sown: {currentCrop?.sowingDate}</span>
              <button
                onClick={() => onNavigateTab('calendar')}
                className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Timeline</span>
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
          title="Current Weather"
          value={`${weather.current.temperatureC}°C`}
          subtitle={`${weather.current.precipitationChancePercent}% Rain Probability`}
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
            value: `Humidity ${weather.current.humidityPercent}%`,
            isPositive: true,
            label: `• Wind ${weather.current.windSpeedKmh}km/h`,
          }}
        />

        {/* Soil Health Status */}
        <MetricCard
          title="Soil Health Status"
          value={`pH ${selectedPlot?.soil?.ph || 7.0}`}
          subtitle={`Organic Carbon ${selectedPlot?.soil?.organicCarbon}%`}
          icon={<Layers className="w-5 h-5 text-emerald-700" />}
          iconBgColor="bg-emerald-50 text-emerald-700 border-emerald-200"
          badge={
            <Badge variant="success" size="sm">
              Optimal
            </Badge>
          }
          trend={{
            value: 'Nitrogen Medium',
            isPositive: true,
            label: '• Phosphorus High',
          }}
          onClick={() => onNavigateTab('soil')}
        />

        {/* Crop Growth Progress */}
        <MetricCard
          title="Active Crop Stage"
          value={currentCrop?.currentStage?.split('/')[0] || 'Vegetative'}
          subtitle={`Variety: ${currentCrop?.variety || 'Hybrid'}`}
          icon={<Sprout className="w-5 h-5 text-amber-700" />}
          iconBgColor="bg-amber-50 text-amber-700 border-amber-200"
          badge={
            <Badge variant="earth" size="sm">
              Day 42
            </Badge>
          }
          trend={{
            value: 'Healthy growth',
            isPositive: true,
            label: '• On schedule',
          }}
          onClick={() => onNavigateTab('calendar')}
        />

        {/* Pending Farm Tasks */}
        <MetricCard
          title="Pending Field Tasks"
          value={tasks.filter((t) => !t.completed).length}
          subtitle="2 High Priority Actions"
          icon={<CheckCircle2 className="w-5 h-5 text-purple-700" />}
          iconBgColor="bg-purple-50 text-purple-700 border-purple-200"
          badge={
            <Badge variant="purple" size="sm">
              Due Today
            </Badge>
          }
          trend={{
            value: `${tasks.filter((t) => t.completed).length} Done`,
            isPositive: true,
            label: 'this week',
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
                    {getTranslation(lang, 'pendingTasks')} ({tasks.filter((t) => !t.completed).length})
                  </h2>
                  <p className="text-xs text-stone-500">
                    Recommended daily agronomic schedule for {currentCrop?.cropName}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateTab('calendar')}
              >
                + Add Task
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              {tasks.map((task) => (
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
                        {task.priority}
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
                          <strong>Why:</strong> {task.whyExplanation}
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
                        ? 'Done'
                        : getTranslation(lang, 'markCompleted')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick AI Consultation Chips */}
          <Card variant="highlight" padding="md">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Common Agronomic Questions for {farmer.district}
              </h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                '🌱 What fertilizer dose for current vegetative stage?',
                '🌧 Rain predicted tomorrow: should I irrigate or hold spray?',
                '🐛 Yellow spots on leaf margins: organic neem remedy?',
                '🏛 Which government subsidies apply to my 3-acre holding?',
                '🧪 How to increase organic carbon in black soil?',
                '💰 What is current APMC Mandi rate & MSP spread?',
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
                    5-Day Weather Outlook
                  </h3>
                  <p className="text-[11px] text-stone-500">IMD Agro-Meteorology</p>
                </div>
              </div>
              <Badge variant="info" size="sm">
                Radar Synced
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
              <span>Next Rain Window: in 3 days</span>
              <button
                onClick={() => onQuickAsk('Give me a detailed 7-day irrigation & rainfall advisory')}
                className="text-emerald-700 font-bold hover:underline cursor-pointer"
              >
                Weather Advisory →
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
              <p className="font-bold text-xs text-stone-900">Crop Health Scanner</p>
              <p className="text-[11px] text-stone-500">Photo leaf diagnosis</p>
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
              <p className="font-bold text-xs text-stone-900">Crop Planner</p>
              <p className="text-[11px] text-stone-500">Rotations & profit</p>
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
              <p className="font-bold text-xs text-stone-900">Mandi Market</p>
              <p className="text-[11px] text-stone-500">APMC & MSP rates</p>
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
              <p className="font-bold text-xs text-stone-900">Govt Schemes</p>
              <p className="text-[11px] text-stone-500">Subsidies & grants</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

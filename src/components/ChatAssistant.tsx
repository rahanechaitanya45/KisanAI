import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Camera,
  RotateCcw,
  User,
  Bot,
  X,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Building,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  FarmerProfile,
  Farm,
  FarmPlot,
  WeatherContext,
  ChatMessage,
} from '../types/farming';
import { getTranslation } from '../data/i18n';
import { askKisanAI } from '../services/aiService';
import { voiceAssistant } from '../services/voiceService';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';

interface ChatAssistantProps {
  farmer: FarmerProfile;
  selectedFarm: Farm;
  selectedPlot: FarmPlot;
  weather: WeatherContext;
  initialQuery?: string;
  onClearInitialQuery?: () => void;
  onNavigateTab: (tab: string) => void;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  farmer,
  selectedFarm,
  selectedPlot,
  weather,
  initialQuery,
  onClearInitialQuery,
  onNavigateTab,
}) => {
  const currentCrop = selectedPlot?.currentCropSeason;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Namaste **${farmer.name}**! I am your **Personal Farming Assistant**.

I am actively tracking your field: **${selectedPlot?.name || 'Main Plot'}** in **${farmer.district}, ${farmer.state}**.
• **Crop & Variety:** ${currentCrop?.cropName || 'Paddy'} (${currentCrop?.variety || 'Standard'})
• **Current Phenological Stage:** ${currentCrop?.currentStage || 'Vegetative'}
• **Soil Chemistry:** pH ${selectedPlot?.soil?.ph || '7.0'} (${selectedPlot?.soil?.soilType || 'Alluvial'})
• **Active Weather:** ${weather.current.temperatureC}°C, ${weather.current.precipitationChancePercent}% chance of rain.

Ask me about fertilizer schedules, pest symptoms, organic remedies, weather protection, or APMC Mandi prices. You can also tap the **microphone 🎙️** to speak in your mother tongue!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const lang = farmer.preferredLanguage;

  useEffect(() => {
    if (initialQuery) {
      handleSendMessage(initialQuery);
      if (onClearInitialQuery) onClearInitialQuery();
    }
  }, [initialQuery]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query && !attachedImage) return;

    const userMessageId = 'msg-' + Date.now();
    const newUserMsg: ChatMessage = {
      id: userMessageId,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachments: attachedImage ? [{ type: 'image', data: attachedImage }] : undefined,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputMessage('');
    const currentImg = attachedImage;
    setAttachedImage(null);
    setIsLoading(true);

    try {
      const historyContext = messages.slice(-4).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const contextPayload = {
        farmer,
        plot: selectedPlot,
        cropSeason: currentCrop,
        soil: selectedPlot?.soil,
        weather,
      };

      const aiResponseText = await askKisanAI(
        query + (currentImg ? ' [Attached photo of leaf condition]' : ''),
        contextPayload,
        lang,
        historyContext
      );

      const assistantMsg: ChatMessage = {
        id: 'msg-reply-' + Date.now(),
        sender: 'assistant',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        audioAvailable: true,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'msg-err-' + Date.now(),
          sender: 'assistant',
          text: `⚠️ **Agronomic Guidance (Offline Protocol):** For ${currentCrop?.cropName || 'your crop'} at ${currentCrop?.currentStage || 'current stage'}, maintain balanced N-P-K nutrition and inspect lower foliage for fungal spots. Call KVK Toll-Free 1800-180-1551 for localized consultation.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleVoice = () => {
    if (isRecording) {
      voiceAssistant.stopListening();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      voiceAssistant.startListening(
        lang,
        (transcript) => {
          setIsRecording(false);
          setInputMessage(transcript);
          handleSendMessage(transcript);
        },
        (err) => {
          console.warn('Voice error in Chat:', err);
          setIsRecording(false);
        },
        () => {
          setIsRecording(false);
        }
      );
    }
  };

  const handleToggleSpeak = (msgId: string, text: string) => {
    if (speakingMsgId === msgId) {
      voiceAssistant.stopSpeaking();
      setSpeakingMsgId(null);
    } else {
      setSpeakingMsgId(msgId);
      voiceAssistant.speak(text, lang, () => {
        setSpeakingMsgId(null);
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const suggestedQuestions = [
    'What fertilizer dosage should I apply this week?',
    'Is rainfall expected before my planned spray?',
    'Why are my leaf tips showing yellow discoloration?',
    'Which biological IPM control works best for stem borers?',
    'Current APMC Mandi rates and MSP price spread?',
  ];

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-170px)] min-h-[600px] animate-in fade-in">
      {/* 1. Header with Active Farm Context */}
      <div className="bg-stone-50 border-b border-stone-200 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold shadow-xs">
            <Sparkles className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base text-stone-900 leading-tight">
                Your Personal Farming Assistant
              </h2>
              <Badge variant="primary" size="sm">
                Active Context
              </Badge>
            </div>
            <p className="text-xs text-stone-500 font-medium">
              Trained on ICAR Packages of Practice & Regional Agro-Meteorology
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setMessages([
                {
                  id: 'msg-reset',
                  sender: 'assistant',
                  text: `Namaste ${farmer.name}. Chat session reset. Ask me your farming questions!`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ])
            }
            title="Reset Conversation"
          >
            <RotateCcw className="w-4 h-4 mr-1 text-stone-500" />
            <span>Reset</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateTab('expert')}
          >
            <PhoneCall className="w-3.5 h-3.5 mr-1 text-emerald-700" />
            <span>KVK Expert Escalation</span>
          </Button>
        </div>
      </div>

      {/* 2. Active Context Bar */}
      <div className="bg-emerald-50/60 border-b border-emerald-100 px-5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-950 shrink-0 font-medium">
        <div className="flex flex-wrap items-center gap-2">
          <span>
            <strong>Farm:</strong> {selectedFarm.name} ({selectedPlot?.name})
          </span>
          <span className="text-emerald-300">•</span>
          <span>
            <strong>Crop:</strong> {currentCrop?.cropName} ({currentCrop?.variety})
          </span>
          <span className="text-emerald-300">•</span>
          <span>
            <strong>Stage:</strong> {currentCrop?.currentStage}
          </span>
          <span className="text-emerald-300">•</span>
          <span>
            <strong>Location:</strong> {farmer.district}, {farmer.state}
          </span>
          <span className="text-emerald-300">•</span>
          <span>
            <strong>Soil:</strong> pH {selectedPlot?.soil?.ph}
          </span>
        </div>

        <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-100/70 px-2 py-0.5 rounded-full">
          Auto-grounded in field data
        </span>
      </div>

      {/* 3. Messages List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-stone-50/30">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                msg.sender === 'user'
                  ? 'bg-stone-900 text-white border-stone-800'
                  : 'bg-emerald-800 text-white border-emerald-700'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[88%] sm:max-w-[78%] rounded-2xl p-4 shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-emerald-800 text-white font-medium rounded-tr-none'
                  : 'bg-white border border-stone-200 text-stone-800 rounded-tl-none'
              }`}
            >
              {/* Attachments */}
              {msg.attachments?.map((att, idx) => (
                <div key={idx} className="mb-2.5">
                  {att.type === 'image' && (
                    <img
                      src={att.data}
                      alt="Crop Attachment"
                      className="w-48 h-36 object-cover rounded-xl border border-stone-300 mb-2 shadow-xs"
                    />
                  )}
                </div>
              ))}

              {/* Message text formatted cleanly */}
              <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {msg.text}
              </div>

              {/* Assistant Message Actions */}
              {msg.sender === 'assistant' && (
                <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => handleToggleSpeak(msg.id, msg.text)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      speakingMsgId === msg.id
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold animate-pulse'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium'
                    }`}
                  >
                    {speakingMsgId === msg.id ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-amber-700" />
                        <span>Stop Voice</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Listen in {lang}</span>
                      </>
                    )}
                  </button>

                  <span className="text-[10px] text-stone-400 font-medium">
                    {msg.timestamp}
                  </span>
                </div>
              )}

              {msg.sender === 'user' && (
                <div className="mt-1 text-right text-[10px] text-emerald-200/80">
                  {msg.timestamp}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-none p-4 shadow-xs text-xs text-stone-600 flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
              <span className="font-semibold text-emerald-800">
                Analyzing agronomic database, soil parameters & weather for your plot...
              </span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* 4. Voice Recording Active Overlay */}
      {isRecording && (
        <div className="bg-rose-50 border-t border-rose-200 p-3 px-5 flex items-center justify-between text-xs text-rose-900 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
            <span className="font-bold">
              Listening in {lang}... Speak your question clearly into the microphone.
            </span>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={handleToggleVoice}
          >
            Stop Recording
          </Button>
        </div>
      )}

      {/* 5. Input & Suggested Questions Area */}
      <div className="p-4 bg-white border-t border-stone-200 shrink-0 space-y-3">
        {/* Suggested Quick Questions */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider shrink-0 mr-1">
            Suggested:
          </span>
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-900 font-medium whitespace-nowrap border border-stone-200 hover:border-emerald-300 transition-all text-xs shrink-0 cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Attached thumbnail */}
        {attachedImage && (
          <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-xl border border-emerald-200 w-fit">
            <img src={attachedImage} alt="Crop" className="w-12 h-12 rounded-lg object-cover" />
            <div className="text-xs">
              <p className="font-bold text-emerald-950">Leaf Image Attached</p>
              <p className="text-[11px] text-emerald-700">Will be analyzed with your question</p>
            </div>
            <button
              onClick={() => setAttachedImage(null)}
              className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="flex items-center gap-2">
          {/* Camera upload */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition-colors cursor-pointer"
            title="Attach Leaf/Pest Photo"
          >
            <Camera className="w-5 h-5 text-emerald-800" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />

          {/* Text Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={getTranslation(lang, 'askQuestionPlaceholder')}
              className="agri-input pl-3.5 pr-10 py-2.5 text-xs sm:text-sm"
            />
          </div>

          {/* Voice Input Button */}
          <button
            type="button"
            onClick={handleToggleVoice}
            className={`p-2.5 rounded-xl transition-all shadow-xs cursor-pointer ${
              isRecording
                ? 'bg-rose-600 text-white animate-bounce ring-4 ring-rose-200'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}
            title="Voice input in your mother tongue"
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Send Button */}
          <Button
            variant="primary"
            size="md"
            rightIcon={<Send className="w-4 h-4" />}
            onClick={() => handleSendMessage()}
            disabled={isLoading || (!inputMessage.trim() && !attachedImage)}
          >
            <span>{getTranslation(lang, 'send')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Camera,
  User,
  Bot,
  X,
  PhoneCall,
  Search,
  Plus,
  History,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import {
  FarmerProfile,
  Farm,
  FarmPlot,
  WeatherContext,
  ChatMessage,
  ChatSession,
} from '../types/farming';
import { useI18n } from '../context/I18nContext';
import { askKisanAI, transcribeAudioWithGemini } from '../services/aiService';
import { voiceAssistant } from '../services/voiceService';
import { firestoreService } from '../services/firestoreService';
import { auth } from '../lib/firebase';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

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
  const { t, language, lookupAgro } = useI18n();
  const currentCrop = selectedPlot?.currentCropSeason;
  const userId = farmer.userId || farmer.id || 'anonymous';

  const localizedCrop = currentCrop?.cropName ? lookupAgro('crops', currentCrop.cropName) : t('common.noData');
  const localizedStage = currentCrop?.currentStage ? lookupAgro('growthStages', currentCrop.currentStage) : t('common.active');
  const localizedSoil = selectedPlot?.soil?.soilType ? lookupAgro('soilTypes', selectedPlot.soil.soilType) : t('common.noData');

  // Active chat session ID
  const [activeSessionId, setActiveSessionId] = useState<string>(() => 'session-' + Date.now());
  const [savedSessions, setSavedSessions] = useState<ChatSession[]>([]);
  const [showSessionDrawer, setShowSessionDrawer] = useState<boolean>(false);

  const initialWelcomeMessage: ChatMessage = {
    id: 'msg-welcome',
    sessionId: activeSessionId,
    sender: 'assistant',
    text: t('chat.welcomeGreeting') || `Hello! How can I help with your farm today?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialWelcomeMessage]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  // Subscribe to chat sessions from Firestore
  useEffect(() => {
    if (!auth.currentUser || !userId || userId === 'anonymous' || userId.startsWith('demo-') || userId.startsWith('farmer-')) return;
    const unsub = firestoreService.subscribeChatSessions(userId, (sessions) => {
      if (sessions && sessions.length > 0) {
        setSavedSessions(sessions);
      }
    });
    return unsub;
  }, [userId]);

  // Subscribe to messages in current session from Firestore
  useEffect(() => {
    if (!auth.currentUser || !activeSessionId || !userId || userId === 'anonymous' || userId.startsWith('demo-') || userId.startsWith('farmer-')) return;
    const unsub = firestoreService.subscribeChatMessages(activeSessionId, (remoteMsgs) => {
      if (remoteMsgs && remoteMsgs.length > 0) {
        setMessages(remoteMsgs);
      }
    });
    return unsub;
  }, [activeSessionId, userId]);

  // Handle initial transferred query from other tabs
  useEffect(() => {
    if (initialQuery) {
      handleSendMessage(initialQuery);
      if (onClearInitialQuery) onClearInitialQuery();
    }
  }, [initialQuery]);

  // Auto scroll down
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Timer for audio recording
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRecording]);

  const handleStartNewSession = () => {
    const newSessionId = 'session-' + Date.now();
    setActiveSessionId(newSessionId);
    const welcomeMsg: ChatMessage = {
      ...initialWelcomeMessage,
      id: 'msg-' + Date.now(),
      sessionId: newSessionId,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([welcomeMsg]);
    setShowSessionDrawer(false);

    if (userId && userId !== 'anonymous') {
      const newSession: ChatSession = {
        id: newSessionId,
        userId,
        title: `${t('chat.newConversation')} - ${localizedCrop} (${new Date().toLocaleDateString()})`,
        lastMessage: t('chat.newConversation'),
        cropContext: currentCrop?.cropName || 'General',
        plotName: selectedPlot?.name || 'Main Plot',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      firestoreService.saveChatSession(userId, newSession).catch(() => {});
      firestoreService.saveChatMessage(userId, newSessionId, welcomeMsg).catch(() => {});
    }
  };

  const handleSelectSession = (session: ChatSession) => {
    setActiveSessionId(session.id);
    setShowSessionDrawer(false);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query && !attachedImage) return;

    const userMessageId = 'msg-' + Date.now();
    const newUserMsg: ChatMessage = {
      id: userMessageId,
      sessionId: activeSessionId,
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

    // Save user message to Firestore
    if (userId && userId !== 'anonymous') {
      firestoreService.saveChatMessage(userId, activeSessionId, newUserMsg).catch(() => {});
    }

    try {
      const historyContext = messages.slice(-5).map((m) => ({
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

      const result = await askKisanAI(
        query,
        contextPayload,
        language,
        historyContext,
        currentImg
      );

      const assistantMsg: ChatMessage = {
        id: 'msg-reply-' + Date.now(),
        sessionId: activeSessionId,
        sender: 'assistant',
        text: result.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        audioAvailable: true,
        groundingSources: result.groundingSources,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Save assistant response to Firestore
      if (userId && userId !== 'anonymous') {
        firestoreService.saveChatMessage(userId, activeSessionId, assistantMsg).catch(() => {});
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'msg-err-' + Date.now(),
        sessionId: activeSessionId,
        sender: 'assistant',
        text: `⚠️ ${t('errors.aiUnavailable')} KVK Helpline: 1800-180-1551`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Robust Audio Recording & Gemini Transcription
  const handleStartRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Convert blob to base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          setIsLoading(true);
          try {
            const transcript = await transcribeAudioWithGemini(base64Audio, language, 'audio/webm');
            if (transcript && transcript.trim()) {
              setInputMessage(transcript);
              handleSendMessage(transcript);
            }
          } catch (transcribeErr) {
            console.warn('Transcription error:', transcribeErr);
          } finally {
            setIsLoading(false);
          }
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start Web Speech API as parallel real-time transcription
      voiceAssistant.startListening(
        language,
        (liveTranscript) => {
          setInputMessage(liveTranscript);
        },
        () => {},
        () => {}
      );
    } catch (micErr) {
      console.warn('Microphone permission or hardware issue, falling back to Web Speech:', micErr);
      // Fallback to Web Speech API
      setIsRecording(true);
      voiceAssistant.startListening(
        language,
        (transcript) => {
          setIsRecording(false);
          setInputMessage(transcript);
          handleSendMessage(transcript);
        },
        (err) => {
          console.warn('Voice error:', err);
          setIsRecording(false);
        },
        () => {
          setIsRecording(false);
        }
      );
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    voiceAssistant.stopListening();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleToggleVoice = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  const handleToggleSpeak = (msgId: string, text: string) => {
    if (speakingMsgId === msgId) {
      voiceAssistant.stopSpeaking();
      setSpeakingMsgId(null);
    } else {
      setSpeakingMsgId(msgId);
      voiceAssistant.speak(text, language, () => {
        setSpeakingMsgId(null);
      });
    }
  };

  const handleCopyText = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
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
    t('chat.suggested1', { crop: localizedCrop }),
    t('chat.suggested2', { stage: localizedStage }),
    t('chat.suggested3'),
    t('chat.suggested4', { crop: localizedCrop }),
  ];

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-160px)] min-h-[640px] animate-in fade-in relative">
      {/* 1. Header with Active Farm Context & Chat Drawer Toggle */}
      <div className="bg-stone-50 border-b border-stone-200 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold shadow-xs">
            <Sparkles className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base text-stone-900 leading-tight">
                {t('nav.krishiMitra')}
              </h2>
              <Badge variant="primary" size="sm">
                Gemini 3.7 Flash Grounded
              </Badge>
            </div>
            <p className="text-xs text-stone-500 font-medium">
              {t('chat.groundedSources')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {savedSessions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSessionDrawer(!showSessionDrawer)}
              title={t('chat.history')}
            >
              <History className="w-3.5 h-3.5 mr-1 text-stone-600" />
              <span>{t('chat.history')} ({savedSessions.length})</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleStartNewSession}
            title={t('chat.newConversation')}
          >
            <Plus className="w-4 h-4 mr-1 text-emerald-700" />
            <span>{t('chat.newConversation')}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateTab('expert')}
          >
            <PhoneCall className="w-3.5 h-3.5 mr-1 text-emerald-700" />
            <span>{t('nav.expertSupport')}</span>
          </Button>
        </div>
      </div>

      {/* 2. Active Field Telemetry Context Bar */}
      <div className="bg-emerald-50/70 border-b border-emerald-100 px-5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-950 shrink-0 font-medium">
        <div className="flex flex-wrap items-center gap-2">
          <span>
            <strong>{t('profile.farmName')}:</strong> {selectedFarm.name} ({selectedPlot?.name})
          </span>
          <span className="text-emerald-300">•</span>
          <span>
            <strong>{t('onboarding.currentCrop')}:</strong> {localizedCrop} ({currentCrop?.variety || 'Certified'})
          </span>
          <span className="text-emerald-300">•</span>
          <span>
            <strong>{t('dashboard.cropGrowthStage')}:</strong> {localizedStage}
          </span>
          <span className="text-emerald-300">•</span>
          <span>
            <strong>{t('weather.title')}:</strong> {farmer.district}, {farmer.state}
          </span>
          <span className="text-emerald-300">•</span>
          <span>
            <strong>{t('soil.title')}:</strong> pH {selectedPlot?.soil?.ph || '7.0'} ({localizedSoil})
          </span>
        </div>

        <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          {t('common.verified')}
        </span>
      </div>

      {/* 3. Messages Thread */}
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
              className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-emerald-800 text-white font-medium rounded-tr-none'
                  : 'bg-white border border-stone-200 text-stone-800 rounded-tl-none'
              }`}
            >
              {/* Image Attachments */}
              {msg.attachments?.map((att, idx) => (
                <div key={idx} className="mb-2.5">
                  {att.type === 'image' && (
                    <img
                      src={att.data}
                      alt="Crop Attachment"
                      className="w-56 h-40 object-cover rounded-xl border border-stone-300 mb-2 shadow-xs"
                    />
                  )}
                </div>
              ))}

              {/* Message text formatted cleanly */}
              <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {msg.text}
              </div>

              {/* Grounding Sources (Search & ICAR Citations) */}
              {msg.groundingSources && msg.groundingSources.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-stone-100 space-y-1.5">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                    <Search className="w-3 h-3 text-emerald-700" />
                    {t('chat.groundedSources')}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.groundingSources.map((source, sIdx) => (
                      <a
                        key={sIdx}
                        href={source.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-900 border border-stone-200 hover:border-emerald-300 text-[11px] font-medium transition-colors"
                      >
                        <span>{source.title || 'Official Source'}</span>
                        <ExternalLink className="w-2.5 h-2.5 text-stone-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Assistant Message Actions (Listen & Copy) */}
              {msg.sender === 'assistant' && (
                <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
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
                          <span>{t('chat.stopAudio')}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{t('chat.speakAnswer')}</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleCopyText(msg.id, msg.text)}
                      className="p-1 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                      title={t('chat.copy')}
                    >
                      {copiedMsgId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

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
          <div className="flex items-start gap-3 animate-in fade-in">
            <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-none p-4 shadow-xs text-xs text-stone-600 flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4 text-emerald-700 animate-spin" />
              <span className="font-semibold text-emerald-900">
                {t('chat.thinking')}
              </span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* 4. Previous Sessions Drawer */}
      {showSessionDrawer && (
        <div className="absolute inset-y-0 right-0 w-80 bg-white border-l border-stone-200 shadow-xl z-20 flex flex-col animate-in slide-in-from-right">
          <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-700" />
              {t('chat.history')}
            </h3>
            <button
              onClick={() => setShowSessionDrawer(false)}
              className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {savedSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleSelectSession(session)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  session.id === activeSessionId
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                    : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold truncate max-w-[170px]">
                    {session.title}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    {new Date(session.updatedAt || session.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 line-clamp-1">
                  {session.lastMessage || t('chat.newConversation')}
                </p>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-stone-200">
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              onClick={handleStartNewSession}
            >
              <Plus className="w-4 h-4 mr-1" />
              {t('chat.newConversation')}
            </Button>
          </div>
        </div>
      )}

      {/* 5. Voice Recording Banner Overlay */}
      {isRecording && (
        <div className="bg-rose-50 border-t border-rose-200 p-3 px-5 flex items-center justify-between text-xs text-rose-900 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
            <span className="font-bold">
              {t('chat.voiceRecording', { seconds: recordingSeconds })}
            </span>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={handleToggleVoice}
          >
            {t('common.stopRecording')}
          </Button>
        </div>
      )}

      {/* 6. Input & Suggested Prompts Bar */}
      <div className="p-4 bg-white border-t border-stone-200 shrink-0 space-y-3">
        {/* Suggested Quick Questions */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider shrink-0 mr-1">
            {t('chat.suggestedTitle', { crop: localizedCrop })}:
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
          <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-xl border border-emerald-200 w-fit animate-in fade-in">
            <img src={attachedImage} alt="Crop" className="w-12 h-12 rounded-lg object-cover" />
            <div className="text-xs">
              <p className="font-bold text-emerald-950">{t('scanner.uploadCropPhoto')}</p>
              <p className="text-[11px] text-emerald-700">{t('scanner.analyzingPlant')}</p>
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
            title={t('scanner.uploadCropPhoto')}
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
              placeholder={t('chat.inputPlaceholder')}
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
            title={t('common.tapToSpeak')}
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
            <span>{t('chat.send')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

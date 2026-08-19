import React, { useState } from 'react';
import {
  BookOpen,
  Mic,
  MicOff,
  Plus,
  Coins,
  TrendingDown,
  TrendingUp,
  Tag,
  Calendar,
  Sparkles,
  Trash2,
  Filter,
} from 'lucide-react';
import {
  FarmerProfile,
  FarmPlot,
  FarmDiaryEntry,
  ExpenseCategory,
} from '../types/farming';
import { getTranslation } from '../data/i18n';
import { parseNaturalLanguageDiary } from '../services/aiService';
import { voiceAssistant } from '../services/voiceService';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { SectionHeader } from './ui/SectionHeader';
import { MetricCard } from './ui/MetricCard';

interface FarmDiaryProps {
  farmer: FarmerProfile;
  selectedPlot: FarmPlot;
  entries: FarmDiaryEntry[];
  onAddEntry: (entry: FarmDiaryEntry) => void;
  onDeleteEntry: (entryId: string) => void;
}

export const FarmDiary: React.FC<FarmDiaryProps> = ({
  farmer,
  selectedPlot,
  entries,
  onAddEntry,
  onDeleteEntry,
}) => {
  const [naturalText, setNaturalText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const lang = farmer.preferredLanguage;

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
          setNaturalText(transcript);
          handleAutoParse(transcript);
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

  const handleAutoParse = async (textToParse?: string) => {
    const text = (textToParse || naturalText).trim();
    if (!text) return;
    setIsParsing(true);

    try {
      const parsed = await parseNaturalLanguageDiary(
        text,
        selectedPlot.farmId,
        selectedPlot.id,
        lang
      );

      const newEntry: FarmDiaryEntry = {
        id: 'entry-' + Date.now(),
        farmId: selectedPlot.farmId,
        plotId: selectedPlot.id,
        date: parsed.date || new Date().toISOString().split('T')[0],
        category: parsed.category || 'Other',
        amount: parsed.amount || 0,
        description: parsed.description || text,
        quantity: parsed.quantity,
        laborersCount: parsed.laborersCount,
        notes: text,
      };

      onAddEntry(newEntry);
      setNaturalText('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsParsing(false);
    }
  };

  const totalExpense = entries
    .filter((e) => e.amount > 0)
    .reduce((sum, e) => sum + e.amount, 0);

  const estimatedCropRevenue = (selectedPlot?.areaAcres || 1) * 65000;
  const projectedNetIncome = estimatedCropRevenue - totalExpense;

  const filteredEntries = entries.filter((e) => {
    if (selectedCategory === 'All') return true;
    return e.category === selectedCategory;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header */}
      <SectionHeader
        title="Farm Activity & Expense Ledger"
        subtitle={`Plot: ${selectedPlot?.name} (${selectedPlot?.currentCropSeason?.cropName}) • Voice and natural language accounting for labor, inputs, machinery, and crop receipts`}
        badge={
          <Badge variant="primary" size="sm">
            <BookOpen className="w-3.5 h-3.5 mr-1" />
            AI Voice Ledger
          </Badge>
        }
        action={
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-950 text-right">
            <span className="text-stone-500 font-medium block">Total Season Investment</span>
            <span className="text-lg font-extrabold text-emerald-900">
              ₹{totalExpense.toLocaleString()}
            </span>
            <span className="text-[11px] text-stone-500 block">
              (₹{(totalExpense / (selectedPlot?.areaAcres || 1)).toFixed(0)} / acre)
            </span>
          </div>
        }
      />

      {/* Voice / Natural Language Quick Log Bar */}
      <Card variant="standard" padding="lg" className="space-y-3">
        <h2 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-700" />
          <span>Speak or Type Your Farm Operation / Expense</span>
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={naturalText}
              onChange={(e) => setNaturalText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAutoParse();
              }}
              placeholder='e.g. "Bought 2 bags Urea for ₹540 and paid ₹1200 for 3 weeding laborers today"'
              className="agri-input pl-4 pr-12 py-3 text-xs sm:text-sm"
            />
            <button
              onClick={handleToggleVoice}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all cursor-pointer ${
                isRecording
                  ? 'bg-rose-600 text-white animate-bounce ring-4 ring-rose-200'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
              }`}
              title="Speak in your mother tongue"
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => handleAutoParse()}
            disabled={!naturalText.trim() || isParsing}
            isLoading={isParsing}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            <span>Log to Ledger</span>
          </Button>
        </div>

        {/* Quick sample chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-stone-500">
          <span className="font-bold text-stone-600">Quick examples:</span>
          <button
            onClick={() => setNaturalText('Purchased 50kg DAP fertilizer for ₹1,350')}
            className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-emerald-50 text-stone-700 border border-stone-200 cursor-pointer"
          >
            "DAP Fertilizer ₹1,350"
          </button>
          <button
            onClick={() =>
              setNaturalText('Paid tractor driver ₹2,000 for 4 hours rotavator ploughing')
            }
            className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-emerald-50 text-stone-700 border border-stone-200 cursor-pointer"
          >
            "Tractor Ploughing ₹2,000"
          </button>
          <button
            onClick={() => setNaturalText('Bought 500ml Neem oil bio-pesticide for ₹380')}
            className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-emerald-50 text-stone-700 border border-stone-200 cursor-pointer"
          >
            "Neem Bio-pesticide ₹380"
          </button>
        </div>
      </Card>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Season Expenses"
          value={`₹${totalExpense.toLocaleString()}`}
          subtitle={`${entries.length} logged transactions`}
          icon={<Coins className="w-5 h-5 text-rose-700" />}
          iconBgColor="bg-rose-50 border-rose-200"
          badge={<Badge variant="danger" size="sm">Cost Outflow</Badge>}
        />

        <MetricCard
          title="Est. Gross Harvest Value"
          value={`₹${estimatedCropRevenue.toLocaleString()}`}
          subtitle="Based on current Mandi MSP"
          icon={<TrendingUp className="w-5 h-5 text-emerald-700" />}
          iconBgColor="bg-emerald-50 border-emerald-200"
          badge={<Badge variant="success" size="sm">Projected</Badge>}
        />

        <MetricCard
          title="Projected Net Profit"
          value={`₹${projectedNetIncome.toLocaleString()}`}
          subtitle={`+₹${(projectedNetIncome / (selectedPlot?.areaAcres || 1)).toFixed(0)} / acre`}
          icon={<TrendingUp className="w-5 h-5 text-emerald-700" />}
          iconBgColor="bg-emerald-50 border-emerald-200"
          badge={<Badge variant="primary" size="sm">Net Gain</Badge>}
        />
      </div>

      {/* Ledger Table & Category Filter */}
      <Card variant="standard" padding="lg" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
          <h3 className="text-sm font-extrabold text-stone-900">
            Recorded Activity & Cost Entries ({filteredEntries.length})
          </h3>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {['All', 'Fertilizer', 'Labor', 'Seeds', 'Pesticides', 'Machinery', 'Irrigation'].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-emerald-800 text-white'
                      : 'bg-stone-100 text-stone-600 hover:text-stone-900 border border-stone-200'
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>
        </div>

        <div className="space-y-2.5">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="p-3.5 rounded-2xl bg-white border border-stone-200 hover:border-emerald-300 flex items-center justify-between gap-3 transition-colors text-xs shadow-2xs"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold shrink-0 border border-emerald-200">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">{entry.description}</span>
                    <Badge variant="neutral" size="sm">
                      {entry.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-stone-500 text-[11px] mt-0.5 font-medium">
                    <span>📅 {entry.date}</span>
                    {entry.laborersCount && <span>👥 {entry.laborersCount} Laborers</span>}
                    {entry.quantity && <span>📦 {entry.quantity}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-extrabold text-sm text-stone-900">
                  ₹{entry.amount.toLocaleString()}
                </span>
                <button
                  onClick={() => onDeleteEntry(entry.id)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Delete Entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

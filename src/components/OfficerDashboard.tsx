import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  AlertTriangle,
  Send,
  CheckCircle2,
  Clock,
  Radio,
  ShieldCheck,
} from 'lucide-react';
import {
  FarmerProfile,
  ExpertTicket,
  KVKExpert,
} from '../types/farming';
import { expertService } from '../services/expertService';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { SectionHeader } from './ui/SectionHeader';
import { MetricCard } from './ui/MetricCard';
import { useI18n } from '../context/I18nContext';

interface OfficerDashboardProps {
  farmer: FarmerProfile;
  tickets: ExpertTicket[];
  onResolveTicket: (ticketId: string, prescription: string) => void;
  onNavigateTab: (tab: string) => void;
}

const PRESCRIPTION_TEMPLATES = [
  {
    title: 'Foliar Fungicide (Blight/Spot)',
    text: 'Confirmed fungal foliar disease. Spray Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1.0 ml/litre of clean water. Maintain 15 days pre-harvest interval (PHI). Ensure bottom foliage spray coverage.',
  },
  {
    title: 'Sucking Pest (Aphid/Jassid IPM)',
    text: 'Economic threshold exceeded for sucking pests. Spray Flonicamid 50% WG @ 0.3g/litre water or Thiamethoxam 25% WG @ 0.2g/litre. Install yellow sticky traps (10/acre) to monitor nymph population.',
  },
  {
    title: 'Bacterial Disease Sanitation',
    text: 'Bacterial pathogen symptoms identified. Immediately withhold nitrogen top-dressing. Spray Streptocycline (Streptomycin sulphate 90% + Tetracycline hydrochloride 10%) @ 6g in 50 litres water + Copper Oxychloride 50% WP @ 2.5g/litre.',
  },
  {
    title: 'Micronutrient Deficiency (Zn/B/Fe)',
    text: 'Micronutrient deficiency detected. Foliar application of Chelated Zinc (Zn-EDTA 12%) @ 1.0 g/litre + Solubor (Boron 20%) @ 1.0 g/litre with wetting agent. Apply during cool morning hours.',
  },
];

export const OfficerDashboard: React.FC<OfficerDashboardProps> = ({
  farmer,
  tickets,
  onResolveTicket,
}) => {
  const { t, lookupAgro } = useI18n();
  const [officers, setOfficers] = useState<KVKExpert[]>([]);
  const [selectedOfficer, setSelectedOfficer] = useState<KVKExpert | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<ExpertTicket | null>(tickets[0] || null);
  const [prescriptionText, setPrescriptionText] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('ALL');

  useEffect(() => {
    async function loadOfficers() {
      const allExp = await expertService.getExperts();
      setOfficers(allExp);
      if (allExp.length > 0) {
        const matched = allExp.find(
          (e) => e.district.toLowerCase() === farmer.district.toLowerCase()
        );
        setSelectedOfficer(matched || allExp[0]);
      }
    }
    loadOfficers();
  }, [farmer.district]);

  // Keep selectedTicket updated if tickets list changes
  useEffect(() => {
    if (tickets.length > 0 && !selectedTicket) {
      setSelectedTicket(tickets[0]);
    } else if (selectedTicket) {
      const updated = tickets.find((t) => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    }
  }, [tickets]);

  const handlePrescribe = () => {
    if (!selectedTicket || !prescriptionText.trim()) return;
    onResolveTicket(selectedTicket.id, prescriptionText);
    setPrescriptionText('');
  };

  const handleApplyTemplate = (templateText: string) => {
    setPrescriptionText(templateText);
  };

  const handleBroadcastAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setBroadcastSuccess(true);
    setTimeout(() => {
      setBroadcastSuccess(false);
      setBroadcastMessage('');
    }, 4000);
  };

  const filteredTickets = tickets.filter((t) => {
    if (filterStatus === 'PENDING') return t.status !== 'RESOLVED';
    if (filterStatus === 'RESOLVED') return t.status === 'RESOLVED';
    return true;
  });

  const pendingCount = tickets.filter((t) => t.status !== 'RESOLVED').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED').length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in" id="kvk-officer-console">
      {/* Officer Header */}
      <SectionHeader
        title="Krishi Vigyan Kendra (KVK) Agronomist Console"
        subtitle="Official ICAR Diagnostic Triage, Field Telemetry Verification & Scientific Package of Practices (POP) Prescription"
        badge={
          <Badge variant="purple" size="sm">
            <Building2 className="w-3.5 h-3.5 mr-1" />
            Official Extension Portal
          </Badge>
        }
        action={
          <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-2xl text-xs text-purple-950 text-right min-w-[220px]">
            <div className="flex items-center justify-end gap-1 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">
                {t('expert.assignedOfficer')}
              </span>
            </div>
            <select
              value={selectedOfficer?.id || ''}
              onChange={(e) => {
                const found = officers.find((o) => o.id === e.target.value);
                if (found) setSelectedOfficer(found);
              }}
              aria-label="Select active KVK officer profile"
              className="bg-white border border-purple-200 rounded-lg px-2 py-1 text-xs font-extrabold text-purple-950 w-full text-right cursor-pointer"
            >
              {officers.map((off) => (
                <option key={off.id} value={off.id}>
                  {off.name} ({off.district})
                </option>
              ))}
            </select>
            <span className="text-[10px] text-purple-800 font-semibold block mt-1">
              {selectedOfficer?.designation || 'Subject Matter Specialist'}
            </span>
          </div>
        }
      />

      {/* Active KVK Station Identity Card */}
      {selectedOfficer && (
        <Card variant="standard" padding="md" className="bg-linear-to-r from-purple-50/50 via-white to-stone-50 border-purple-200">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {selectedOfficer.avatarUrl ? (
                <img
                  src={selectedOfficer.avatarUrl}
                  alt={selectedOfficer.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-2xl object-cover border border-purple-300 shadow-2xs shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-900 font-extrabold text-lg shrink-0">
                  DR
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-stone-900 text-base">
                    {selectedOfficer.name}
                  </span>
                  <Badge variant="purple" size="sm">
                    {selectedOfficer.specialization}
                  </Badge>
                </div>
                <p className="text-xs text-stone-600 font-medium">
                  {selectedOfficer.designation} • {selectedOfficer.kvkCenterName}
                </p>
                <div className="flex flex-wrap gap-3 pt-1 text-[11px] text-stone-500">
                  <span>🎓 {selectedOfficer.qualifications}</span>
                  <span>⏳ {selectedOfficer.experienceYears} Years Exp</span>
                  <span>⭐ {selectedOfficer.rating} ({selectedOfficer.consultationsCount} Consultations)</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-stone-200 text-right text-xs shrink-0">
              <span className="text-[10px] text-stone-400 font-bold block uppercase tracking-wider">
                Jurisdiction & Extension Block
              </span>
              <strong className="text-stone-800 text-sm">{selectedOfficer.district}, {selectedOfficer.state}</strong>
              <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                ● Station Online & Accepting Farmer Cases
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <MetricCard
          title="District Farmers"
          value="12,480"
          subtitle="Registered in block"
          icon={<Users className="w-5 h-5 text-emerald-700" />}
          iconBgColor="bg-emerald-50 border-emerald-200"
          badge={<Badge variant="success" size="sm">Active</Badge>}
        />

        <MetricCard
          title="Pending Escalations"
          value={String(pendingCount)}
          subtitle="Awaiting prescription"
          icon={<Clock className="w-5 h-5 text-purple-700" />}
          iconBgColor="bg-purple-50 border-purple-200"
          badge={<Badge variant="purple" size="sm">Queue</Badge>}
        />

        <MetricCard
          title="Pest Outbreak Alert"
          value="Moderate"
          subtitle="Foliar Blight watch"
          icon={<AlertTriangle className="w-5 h-5 text-amber-700" />}
          iconBgColor="bg-amber-50 border-amber-200"
          badge={<Badge variant="warning" size="sm">Advisory</Badge>}
        />

        <MetricCard
          title="Resolved Cases"
          value={String(resolvedCount + 84)}
          subtitle="Official prescriptions"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-700" />}
          iconBgColor="bg-emerald-50 border-emerald-200"
          badge={<Badge variant="success" size="sm">Archived</Badge>}
        />
      </div>

      {/* Main Grid: Ticket Queue & Diagnostic Prescription */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ticket List (Left 5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <Card variant="standard" padding="lg" className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h2 className="text-sm font-extrabold text-stone-900">
                  {t('expert.myTickets')}
                </h2>
                <p className="text-[11px] text-stone-500">Incoming requests from district farmers</p>
              </div>
              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-[10px]">
                <button
                  onClick={() => setFilterStatus('ALL')}
                  className={`px-2 py-1 rounded-lg font-bold transition-all ${
                    filterStatus === 'ALL' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'
                  }`}
                >
                  {t('common.all')} ({tickets.length})
                </button>
                <button
                  onClick={() => setFilterStatus('PENDING')}
                  className={`px-2 py-1 rounded-lg font-bold transition-all ${
                    filterStatus === 'PENDING' ? 'bg-purple-800 text-white shadow-2xs' : 'text-stone-500'
                  }`}
                >
                  Pending ({pendingCount})
                </button>
                <button
                  onClick={() => setFilterStatus('RESOLVED')}
                  className={`px-2 py-1 rounded-lg font-bold transition-all ${
                    filterStatus === 'RESOLVED' ? 'bg-emerald-800 text-white shadow-2xs' : 'text-stone-500'
                  }`}
                >
                  Done ({resolvedCount})
                </button>
              </div>
            </div>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredTickets.length === 0 ? (
                <div className="p-8 text-center bg-stone-50 rounded-xl text-xs text-stone-500">
                  {t('expert.noTickets')}
                </div>
              ) : (
                filteredTickets.map((tk) => (
                  <button
                    key={tk.id}
                    onClick={() => setSelectedTicket(tk)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all space-y-1.5 cursor-pointer ${
                      selectedTicket?.id === tk.id
                        ? 'bg-purple-50/70 border-purple-400 shadow-2xs ring-1 ring-purple-300'
                        : 'bg-white border-stone-200 hover:border-purple-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-purple-800">{tk.id}</span>
                      <Badge
                        variant={
                          tk.status === 'RESOLVED'
                            ? 'success'
                            : tk.urgency === 'Emergency'
                            ? 'danger'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {tk.status === 'RESOLVED' ? 'RESOLVED' : tk.urgency}
                      </Badge>
                    </div>
                    <p className="font-bold text-stone-900 text-xs line-clamp-1">{tk.subject}</p>
                    <div className="flex items-center justify-between text-[11px] text-stone-500 pt-0.5 border-t border-stone-100">
                      <span className="font-bold text-stone-800 truncate">
                        👤 {tk.farmerName}
                      </span>
                      <span className="text-stone-500 truncate">
                        🌱 {lookupAgro('crops', tk.cropName)}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Prescription & Telemetry Panel (Right 7 cols) */}
        <div className="lg:col-span-7">
          <Card variant="standard" padding="lg" className="space-y-4">
            {selectedTicket ? (
              <div className="space-y-4 animate-in fade-in">
                {/* Case Header with Distinct Farmer Requester Identity */}
                <div className="flex items-start justify-between pb-3 border-b border-stone-200">
                  <div>
                    <span className="text-xs font-extrabold text-purple-800">
                      Case #{selectedTicket.id}
                    </span>
                    <h3 className="text-lg font-extrabold text-stone-900 mt-0.5">
                      {selectedTicket.subject}
                    </h3>
                    {/* Explicit Farmer Details */}
                    <div className="flex items-center gap-2 mt-1 text-xs text-stone-600">
                      <span>Requester:</span>
                      <strong className="text-stone-900 bg-stone-100 px-2 py-0.5 rounded-md">
                        👤 {selectedTicket.farmerName} ({selectedTicket.phone})
                      </strong>
                      <span>📍 {selectedTicket.district}, {selectedTicket.state}</span>
                    </div>
                  </div>

                  <Badge
                    variant={selectedTicket.status === 'RESOLVED' ? 'success' : 'warning'}
                    size="sm"
                  >
                    {selectedTicket.status}
                  </Badge>
                </div>

                {/* Farmer Problem Statement */}
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-700 space-y-1">
                  <p className="font-bold text-stone-900">Farmer's Field Observation & Symptoms:</p>
                  <p className="leading-relaxed">{selectedTicket.description}</p>
                </div>

                {/* Automated Telemetry Breakdown */}
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-2">
                  <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px]">
                    Attached Plot Telemetry & Phenological State
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-stone-700 text-xs">
                    <div className="p-2 bg-white rounded-lg border border-stone-200">
                      <span className="text-stone-400 block text-[10px]">{t('cropPlanner.activeCrop')}</span>
                      <strong className="text-stone-900">{lookupAgro('crops', selectedTicket.cropName)}</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-stone-200">
                      <span className="text-stone-400 block text-[10px]">{t('calendar.growthStages')}</span>
                      <strong className="text-stone-900">{selectedTicket.growthStage}</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-stone-200">
                      <span className="text-stone-400 block text-[10px]">Soil pH</span>
                      <strong className="text-stone-900">{selectedTicket.soilPh}</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-stone-200">
                      <span className="text-stone-400 block text-[10px]">{t('soil.title')}</span>
                      <strong className="text-stone-900">{lookupAgro('soilTypes', selectedTicket.soilType)}</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-stone-200">
                      <span className="text-stone-400 block text-[10px]">{t('expert.urgency')}</span>
                      <strong className={selectedTicket.urgency === 'Emergency' ? 'text-red-700' : 'text-stone-900'}>
                        {selectedTicket.urgency}
                      </strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-stone-200">
                      <span className="text-stone-400 block text-[10px]">Submitted Date</span>
                      <strong className="text-stone-900">{selectedTicket.createdAt}</strong>
                    </div>
                  </div>
                </div>

                {/* Prescription Input / Resolved View */}
                {selectedTicket.status === 'RESOLVED' ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-xs text-emerald-950">
                    <div className="flex items-center justify-between">
                      <p className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        Official ICAR Prescription Recorded:
                      </p>
                      <span className="text-[10px] text-emerald-700">
                        Signed by {selectedTicket.expertName || selectedOfficer?.name || 'KVK Officer'}
                      </span>
                    </div>
                    <p className="leading-relaxed bg-white/80 p-3 rounded-xl border border-emerald-200">
                      {selectedTicket.responseFromOfficer}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPrescriptionText(selectedTicket.responseFromOfficer || '');
                        onResolveTicket(selectedTicket.id, '');
                      }}
                    >
                      Update / Revise Prescription
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    {/* Quick Prescription Presets */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                        Quick ICAR POP Presets:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESCRIPTION_TEMPLATES.map((tmpl) => (
                          <button
                            key={tmpl.title}
                            type="button"
                            onClick={() => handleApplyTemplate(tmpl.text)}
                            className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200 text-[10px] font-bold transition-all cursor-pointer"
                          >
                            + {tmpl.title}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Prescribe Official ICAR Recommendation:
                      </label>
                      <textarea
                        rows={4}
                        value={prescriptionText}
                        onChange={(e) => setPrescriptionText(e.target.value)}
                        placeholder="Enter scientific fungicide/insecticide formulation with dosage per litre of water, spray timing, and safety waiting period..."
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                      />
                    </div>

                    <div className="p-3 bg-stone-50 rounded-xl text-[11px] text-stone-600 flex items-center justify-between">
                      <span>Will be signed & issued by:</span>
                      <strong className="text-purple-950 font-extrabold">
                        👨‍🔬 {selectedOfficer?.name} ({selectedOfficer?.designation})
                      </strong>
                    </div>

                    <Button
                      variant="primary"
                      size="md"
                      fullWidth
                      onClick={handlePrescribe}
                      disabled={!prescriptionText.trim()}
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      Issue Official Prescription & Resolve Ticket
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-stone-400 text-xs">
                Select a ticket from the left queue to review telemetry and write prescription.
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Broadcast Regional Alert Section */}
      <Card variant="standard" padding="lg" className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center font-bold">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-stone-900">
              Broadcast Regional Advisory to All Block Farmers
            </h3>
            <p className="text-xs text-stone-500">
              Sends high-priority extension notice to {selectedOfficer?.district || farmer.district} farming community.
            </p>
          </div>
        </div>

        {broadcastSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>
              Advisory broadcasted to 12,480 farmers across {selectedOfficer?.district || farmer.district} from {selectedOfficer?.kvkCenterName || 'KVK'}!
            </span>
          </div>
        )}

        <form onSubmit={handleBroadcastAlert} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            required
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            placeholder="e.g. High humidity alert: Scout paddy fields for early blast symptoms; apply 5% Neem oil..."
            className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs"
          />
          <Button
            variant="danger"
            size="md"
            type="submit"
            leftIcon={<Send className="w-4 h-4" />}
          >
            Broadcast Alert
          </Button>
        </form>
      </Card>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  ShieldCheck,
  Send,
  Building,
  Building2,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  AlertCircle,
  Search,
  Filter,
  UserCheck,
  Award,
  BookOpen,
  Calendar,
  Languages,
  Phone,
  Mail,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  FarmerProfile,
  FarmPlot,
  WeatherContext,
  CropHealthAnalysis,
  ExpertTicket,
  KVKCenter,
  KVKExpert,
  KVKSpecialization,
} from '../types/farming';
import { expertService } from '../services/expertService';
import confetti from 'canvas-confetti';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { SectionHeader } from './ui/SectionHeader';

interface ExpertEscalationProps {
  farmer: FarmerProfile;
  selectedPlot: FarmPlot;
  weather: WeatherContext;
  escalatedAnalysis?: CropHealthAnalysis | null;
  tickets: ExpertTicket[];
  onSubmitTicket: (ticket: ExpertTicket) => void;
  onNavigateTab: (tab: string) => void;
}

const SPECIALIZATIONS: (KVKSpecialization | 'All Specializations')[] = [
  'All Specializations',
  'Plant Pathology & Crop Protection',
  'Agricultural Entomology & IPM',
  'Agronomy & Weed Management',
  'Soil Science & Agricultural Chemistry',
  'Horticulture & Vegetable Crops',
];

export const ExpertEscalation: React.FC<ExpertEscalationProps> = ({
  farmer,
  selectedPlot,
  weather,
  escalatedAnalysis,
  tickets,
  onSubmitTicket,
  onNavigateTab,
}) => {
  // State for KVK Centers & Experts
  const [centers, setCenters] = useState<KVKCenter[]>([]);
  const [experts, setExperts] = useState<KVKExpert[]>([]);
  const [matchedExperts, setMatchedExperts] = useState<KVKExpert[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<KVKExpert | null>(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('All Specializations');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Form State
  const [subject, setSubject] = useState(
    escalatedAnalysis
      ? `Urgent: Diagnosis of ${escalatedAnalysis.suspectedIssue} on ${escalatedAnalysis.cropName || selectedPlot?.currentCropSeason?.cropName}`
      : ''
  );
  const [description, setDescription] = useState(
    escalatedAnalysis
      ? `AI diagnosed suspected ${escalatedAnalysis.suspectedIssue} (${escalatedAnalysis.confidencePercent}% confidence). Need verified chemical/organic POP dosage and spray interval for plot ${selectedPlot?.name}.`
      : ''
  );
  const [urgency, setUrgency] = useState<'Normal' | 'High' | 'Emergency'>('High');
  const [submittedTicket, setSubmittedTicket] = useState<ExpertTicket | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Load KVK Centers & match experts on mount or when farmer/plot changes
  useEffect(() => {
    async function loadKvkData() {
      setLoading(true);
      try {
        const [centerList, matchedList, allExp] = await Promise.all([
          expertService.getCenters(farmer.state, farmer.district),
          expertService.matchBestExperts({
            farmer,
            cropName: selectedPlot?.currentCropSeason?.cropName,
            analysis: escalatedAnalysis,
          }),
          expertService.getExperts(),
        ]);

        setCenters(centerList);
        setMatchedExperts(matchedList);
        setExperts(allExp);

        // Auto-select best matching expert
        if (matchedList.length > 0) {
          setSelectedExpert(matchedList[0]);
        } else if (allExp.length > 0) {
          setSelectedExpert(allExp[0]);
        }
      } catch (err) {
        console.error('Error loading KVK data', err);
      } finally {
        setLoading(false);
      }
    }
    loadKvkData();
  }, [farmer.district, farmer.state, selectedPlot?.currentCropSeason?.cropName, escalatedAnalysis]);

  // Filtered expert list for the expert directory view
  const filteredExperts = experts.filter((expert) => {
    const matchesSpec =
      selectedSpecialization === 'All Specializations' ||
      expert.specialization.toLowerCase() === selectedSpecialization.toLowerCase();

    const matchesSearch =
      !searchQuery.trim() ||
      expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.expertiseCrops.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSpec && matchesSearch;
  });

  const handleSelectExpert = (expert: KVKExpert) => {
    setSelectedExpert(expert);
    // Smooth scroll to form on mobile
    const formEl = document.getElementById('escalation-form-section');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !selectedExpert) return;

    setSubmitting(true);
    try {
      const newTicket = await expertService.submitTicket({
        farmerId: farmer.id,
        farmerName: farmer.name,
        phone: farmer.phone,
        state: farmer.state,
        district: farmer.district,
        village: farmer.village,
        farmId: selectedPlot?.id,
        plotId: selectedPlot?.id,
        cropName: selectedPlot?.currentCropSeason?.cropName || 'Field Crop',
        growthStage: selectedPlot?.currentCropSeason?.currentStage || 'Vegetative',
        soilType: selectedPlot?.soil?.soilType || 'Alluvial Soil',
        soilPh: selectedPlot?.soil?.ph || 7.0,
        subject: subject.trim(),
        description: description.trim(),
        urgency,
        expertId: selectedExpert.id,
        expertName: selectedExpert.name,
        expertDesignation: selectedExpert.designation,
        kvkCenterId: selectedExpert.kvkCenterId,
        kvkCenterName: selectedExpert.kvkCenterName,
        assignedOfficer: `${selectedExpert.name} (${selectedExpert.designation})`,
        assignedKVKOffice: selectedExpert.kvkCenterName,
        imageUrl: escalatedAnalysis?.imageUrl,
      });

      onSubmitTicket(newTicket);
      setSubmittedTicket(newTicket);

      try {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      } catch (err) {}
    } catch (err) {
      console.error('Error submitting escalation', err);
    } finally {
      setSubmitting(false);
    }
  };

  const primaryCenter = centers[0] || null;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in" id="kvk-escalation-container">
      {/* Header */}
      <SectionHeader
        title="Krishi Vigyan Kendra (KVK) Escalation"
        subtitle={`ICAR Agricultural Research & Extension: ${farmer.district}, ${farmer.state} • Verified scientists providing official Package of Practices (POP)`}
        badge={
          <Badge variant="purple" size="sm">
            <Building2 className="w-3.5 h-3.5 mr-1" />
            ICAR-KVK Direct Line
          </Badge>
        }
        action={
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-800 text-right">
            <span className="font-bold text-stone-500 block text-[11px]">Kisan Call Centre (Toll-Free)</span>
            <a
              href="tel:18001801551"
              className="text-sm font-extrabold text-emerald-800 hover:text-emerald-950 flex items-center justify-end gap-1"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              1800-180-1551
            </a>
          </div>
        }
      />

      {/* Identity Banner: Explicitly Showing Farmer vs Expert Separation */}
      <Card variant="standard" padding="md" className="bg-linear-to-r from-emerald-50/70 via-stone-50 to-purple-50/70 border-stone-200">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Authenticated Farmer Profile */}
          <div className="md:col-span-5 flex items-center gap-3 p-3 bg-white/90 rounded-xl border border-emerald-200 shadow-2xs">
            <div className="w-11 h-11 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-900 font-extrabold text-base shrink-0">
              {farmer.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <Badge variant="success" size="sm">
                  Authenticated Farmer
                </Badge>
              </div>
              <p className="font-extrabold text-stone-900 text-sm truncate mt-0.5">{farmer.name}</p>
              <p className="text-[11px] text-stone-600 truncate">
                📍 {farmer.district}, {farmer.state} • 📞 {farmer.phone}
              </p>
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Escalates To</span>
            <div className="flex items-center gap-1 text-stone-600 my-0.5">
              <span className="h-0.5 w-6 bg-stone-300"></span>
              <ChevronRight className="w-4 h-4 text-purple-600" />
              <span className="h-0.5 w-6 bg-stone-300"></span>
            </div>
            <span className="text-[10px] font-medium text-purple-800">Verified KVK Officer</span>
          </div>

          {/* Matched KVK Expert Profile */}
          <div className="md:col-span-5 flex items-center gap-3 p-3 bg-white/90 rounded-xl border border-purple-200 shadow-2xs">
            {selectedExpert?.avatarUrl ? (
              <img
                src={selectedExpert.avatarUrl}
                alt={selectedExpert.name}
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-full object-cover border border-purple-300 shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-900 font-extrabold text-base shrink-0">
                DR
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <Badge variant="purple" size="sm">
                  KVK Specialist
                </Badge>
                <span className="text-[10px] text-emerald-800 font-semibold flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 inline" /> Verified
                </span>
              </div>
              <p className="font-extrabold text-purple-950 text-sm truncate mt-0.5">
                {selectedExpert ? selectedExpert.name : 'District Subject Matter Specialist'}
              </p>
              <p className="text-[11px] text-stone-600 truncate">
                {selectedExpert ? selectedExpert.designation : `KVK ${farmer.district}`}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Grid: Form + Expert Selector + Active Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Submission Form & Expert Selection */}
        <div className="lg:col-span-7 space-y-6" id="escalation-form-section">
          {/* 1. Selected Expert Confirmation Card */}
          <Card variant="standard" padding="md" className="border-purple-200 bg-linear-to-b from-purple-50/40 to-white space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-purple-100">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-700" />
                <h3 className="text-sm font-extrabold text-stone-900">
                  Assigned KVK Agricultural Science Centre
                </h3>
              </div>
              <Badge variant="neutral" size="sm">
                ICAR Affiliated
              </Badge>
            </div>

            {primaryCenter ? (
              <div className="text-xs space-y-1.5 text-stone-700">
                <p className="font-bold text-stone-900 text-sm">{primaryCenter.name}</p>
                <p className="text-[11px] text-stone-600">
                  <strong className="text-stone-700">Host Institution:</strong> {primaryCenter.hostInstitution}
                </p>
                <p className="text-[11px] text-stone-600">
                  📍 {primaryCenter.address}
                </p>
                <div className="flex flex-wrap gap-3 pt-1 text-[11px] text-stone-600">
                  <span>📞 <strong>Phone:</strong> {primaryCenter.phone}</span>
                  <span>✉️ <strong>Email:</strong> {primaryCenter.email}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-600">
                Krishi Vigyan Kendra Extension Network • {farmer.district}, {farmer.state}
              </p>
            )}
          </Card>

          {/* 2. Escalation Submission Form */}
          <Card variant="standard" padding="lg" className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h2 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-purple-700" />
                <span>Submit Query to {selectedExpert?.name || 'KVK Specialist'}</span>
              </h2>
              <Badge variant="purple" size="sm">
                Official Ticket
              </Badge>
            </div>

            {submittedTicket && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 space-y-1.5 animate-in fade-in">
                <div className="flex items-center gap-1.5 font-extrabold text-emerald-900 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Ticket #{submittedTicket.id} Created Successfully!</span>
                </div>
                <p className="text-emerald-800 leading-relaxed">
                  Your case bundle has been routed directly to <strong className="text-emerald-950">{submittedTicket.expertName}</strong> ({submittedTicket.expertDesignation}) at {submittedTicket.kvkCenterName}.
                </p>
                <div className="pt-1 text-[11px] text-emerald-700 flex items-center justify-between">
                  <span>Farmer Requester: <strong>{farmer.name}</strong></span>
                  <span>District: <strong>{farmer.district}</strong></span>
                </div>
              </div>
            )}

            {/* Attached Field Telemetry Box */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2">
              <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px] block">
                Automated Farm Telemetry Attached with Ticket:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-stone-700 text-[11px]">
                <div className="p-2 bg-white rounded-lg border border-stone-200">
                  <span className="text-stone-400 block text-[10px]">Location</span>
                  <strong className="text-stone-900">{farmer.district}, {farmer.state}</strong>
                </div>
                <div className="p-2 bg-white rounded-lg border border-stone-200">
                  <span className="text-stone-400 block text-[10px]">Active Plot</span>
                  <strong className="text-stone-900">{selectedPlot?.name || 'Main Plot'}</strong>
                </div>
                <div className="p-2 bg-white rounded-lg border border-stone-200">
                  <span className="text-stone-400 block text-[10px]">Crop & Variety</span>
                  <strong className="text-stone-900">
                    {selectedPlot?.currentCropSeason?.cropName || 'Paddy'}
                  </strong>
                </div>
                <div className="p-2 bg-white rounded-lg border border-stone-200">
                  <span className="text-stone-400 block text-[10px]">Growth Stage</span>
                  <strong className="text-stone-900">{selectedPlot?.currentCropSeason?.currentStage || 'Vegetative'}</strong>
                </div>
                <div className="p-2 bg-white rounded-lg border border-stone-200">
                  <span className="text-stone-400 block text-[10px]">Soil pH & Type</span>
                  <strong className="text-stone-900">{selectedPlot?.soil?.ph || 7.0} ({selectedPlot?.soil?.soilType || 'Loam'})</strong>
                </div>
                <div className="p-2 bg-white rounded-lg border border-stone-200">
                  <span className="text-stone-400 block text-[10px]">Weather Now</span>
                  <strong className="text-stone-900">{weather.current.temperatureC}°C, {weather.current.precipitationChancePercent}% Rain</strong>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Issue Subject / Problem Summary <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Yellowing of lower leaf margins with dark brown spots in 2.5 acre plot"
                  className="agri-input text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Detailed Symptoms & Recent Operations <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe when symptoms appeared, percentage of crop affected, recent fertilizer/pesticide sprays..."
                  className="agri-input text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Urgency Level</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="agri-input text-xs font-semibold"
                  >
                    <option value="Normal">Normal (Routine Query - 48h SLA)</option>
                    <option value="High">High (Spreading Rapidly - 24h SLA)</option>
                    <option value="Emergency">Emergency (Severe Crop Loss Risk - 6h SLA)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Attached Visual Diagnosis</label>
                  <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 truncate font-semibold">
                    {escalatedAnalysis ? `${escalatedAnalysis.suspectedIssue} (${escalatedAnalysis.confidencePercent}%)` : 'Direct Farmer Field Inquiry'}
                  </div>
                </div>
              </div>

              {/* Explicit Summary of Farmer and Expert before Submit */}
              <div className="p-3 bg-stone-100 rounded-xl text-[11px] text-stone-700 flex items-center justify-between">
                <div>
                  <span className="text-stone-500 block">Submitted By (Farmer):</span>
                  <strong className="text-stone-900">{farmer.name}</strong>
                </div>
                <div className="text-right">
                  <span className="text-stone-500 block">Assigned Scientist:</span>
                  <strong className="text-purple-900">{selectedExpert?.name || 'KVK Officer'}</strong>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                type="submit"
                disabled={submitting || !selectedExpert}
                leftIcon={<Send className="w-4 h-4" />}
              >
                {submitting ? 'Submitting to KVK Officer...' : `Submit Ticket to ${selectedExpert?.name || 'KVK Scientist'}`}
              </Button>
            </form>
          </Card>

          {/* 3. Browse All KVK Experts Directory */}
          <Card variant="standard" padding="lg" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200">
              <div>
                <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-purple-700" />
                  <span>Available KVK Scientists & Subject Matter Specialists</span>
                </h3>
                <p className="text-[11px] text-stone-500">
                  Select a specific scientist based on your crop discipline
                </p>
              </div>
              <Badge variant="neutral" size="sm">
                {filteredExperts.length} Specialists
              </Badge>
            </div>

            {/* Filter & Search Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search scientist, crop, or district..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="agri-input pl-9 text-xs"
                />
              </div>

              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="agri-input text-xs font-medium"
              >
                {SPECIALIZATIONS.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            {/* Expert Cards List */}
            {filteredExperts.length === 0 ? (
              <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-300 space-y-3">
                <AlertCircle className="w-8 h-8 text-stone-400 mx-auto" />
                <p className="text-sm font-bold text-stone-700">
                  No matching KVK expert is available right now
                </p>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  Try clearing your search or specialization filter, or dial the Kisan Call Centre at 1800-180-1551.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSpecialization('All Specializations');
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredExperts.map((expert) => {
                  const isSelected = selectedExpert?.id === expert.id;
                  return (
                    <div
                      key={expert.id}
                      onClick={() => handleSelectExpert(expert)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? 'bg-purple-50/60 border-purple-400 shadow-sm ring-1 ring-purple-300'
                          : 'bg-white border-stone-200 hover:border-purple-200 hover:bg-stone-50/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {expert.avatarUrl ? (
                          <img
                            src={expert.avatarUrl}
                            alt={expert.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-full object-cover border border-stone-200 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-900 font-extrabold text-sm shrink-0">
                            DR
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-extrabold text-stone-900 text-xs truncate">
                              {expert.name}
                            </span>
                            {isSelected && (
                              <Badge variant="purple" size="sm">
                                Selected
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] font-semibold text-purple-900 truncate">
                            {expert.designation}
                          </p>
                          <p className="text-[10px] text-stone-500 truncate">
                            📍 {expert.district}, {expert.state}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-[11px] text-stone-600 pt-1 border-t border-stone-100">
                        <p className="truncate text-stone-700">
                          🎓 <strong className="text-stone-800">Degree:</strong> {expert.qualifications}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-stone-500">
                          <span>⏳ {expert.experienceYears} yrs experience</span>
                          <span className="text-amber-700 font-bold">★ {expert.rating} ({expert.consultationsCount})</span>
                        </div>
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {expert.expertiseCrops.slice(0, 3).map((crop) => (
                            <span
                              key={crop}
                              className="px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[9px] font-medium"
                            >
                              {crop}
                            </span>
                          ))}
                        </div>
                      </div>

                      <Button
                        variant={isSelected ? 'primary' : 'outline'}
                        size="sm"
                        fullWidth
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectExpert(expert);
                        }}
                      >
                        {isSelected ? '✓ Assigned for Query' : 'Assign to this Expert'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right 5 cols: Active Cases Tracker */}
        <div className="lg:col-span-5 space-y-6">
          <Card variant="standard" padding="lg" className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h2 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>My Submitted Cases ({tickets.length})</span>
              </h2>
              <Badge variant="neutral" size="sm">
                Farmer: {farmer.name.split(' ')[0]}
              </Badge>
            </div>

            {tickets.length === 0 ? (
              <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-xs text-stone-500">
                No active escalations. Submit a query on the left to consult your district KVK scientist.
              </div>
            ) : (
              <div className="space-y-3.5">
                {tickets.map((t) => {
                  const isResolved = t.status === 'RESOLVED';
                  return (
                    <div
                      key={t.id}
                      className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-purple-800 text-xs">{t.id}</span>
                        <Badge
                          variant={
                            isResolved
                              ? 'success'
                              : t.status === 'IN_REVIEW'
                              ? 'warning'
                              : 'purple'
                          }
                          size="sm"
                        >
                          {t.status}
                        </Badge>
                      </div>

                      <div>
                        <p className="font-bold text-stone-900 text-xs">{t.subject}</p>
                        <p className="text-stone-600 text-[11px] leading-snug mt-0.5 line-clamp-2">
                          {t.description}
                        </p>
                      </div>

                      {/* Explicitly showing the Farmer vs Assigned Officer */}
                      <div className="p-2.5 rounded-xl bg-white border border-stone-200 text-[11px] space-y-1">
                        <div className="flex items-center justify-between text-stone-600">
                          <span>👤 Requester:</span>
                          <strong className="text-stone-900">{t.farmerName || farmer.name}</strong>
                        </div>
                        <div className="flex items-center justify-between text-stone-600">
                          <span>👨‍🔬 KVK Officer:</span>
                          <strong className="text-purple-900">{t.expertName || t.assignedOfficer || 'District Agronomist'}</strong>
                        </div>
                      </div>

                      {/* Official Prescription if Resolved */}
                      {t.responseFromOfficer && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-emerald-950">
                          <p className="font-bold text-emerald-900 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                            Official ICAR Prescription:
                          </p>
                          <p className="text-emerald-950 text-[11px] leading-relaxed">
                            {t.responseFromOfficer}
                          </p>
                          {t.resolvedAt && (
                            <span className="text-[10px] text-emerald-700 block text-right">
                              Resolved on: {t.resolvedAt}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-[10px] text-stone-500">
                        <span>Plot: {t.cropName}</span>
                        <span>Date: {t.createdAt}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

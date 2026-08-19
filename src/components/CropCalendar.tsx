import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Plus,
  AlertTriangle,
  Droplets,
  Sprout,
  ShieldAlert,
  ChevronRight,
  Sun,
  Camera,
  X,
} from 'lucide-react';
import {
  FarmerProfile,
  FarmPlot,
  FarmTask,
  WeatherContext,
  CropGrowthStage,
} from '../types/farming';
import { getTranslation } from '../data/i18n';
import confetti from 'canvas-confetti';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { SectionHeader } from './ui/SectionHeader';

interface CropCalendarProps {
  farmer: FarmerProfile;
  selectedPlot: FarmPlot;
  weather: WeatherContext;
  tasks: FarmTask[];
  onCompleteTask: (taskId: string) => void;
  onAddTask: (task: Partial<FarmTask>) => void;
  onNavigateTab: (tab: string) => void;
}

const STAGES_TIMELINE: {
  stage: CropGrowthStage;
  dasRange: string;
  icon: string;
  description: string;
}[] = [
  {
    stage: 'Land Preparation',
    dasRange: 'DAS -15 to 0',
    icon: '🚜',
    description: 'Deep summer ploughing, bunding, and basal FYM incorporation.',
  },
  {
    stage: 'Sowing / Transplanting',
    dasRange: 'DAS 0 to 10',
    icon: '🌱',
    description: 'Seed treatment with bio-fungicide, optimum spacing, and initial watering.',
  },
  {
    stage: 'Seedling / Emergence',
    dasRange: 'DAS 10 to 25',
    icon: '🌿',
    description: 'Gap filling, monitoring early seedling vigor, and light hoeing.',
  },
  {
    stage: 'Tillering / Branching',
    dasRange: 'DAS 25 to 45',
    icon: '🌾',
    description: 'First top dressing of Nitrogen, weeding, and tillering boost.',
  },
  {
    stage: 'Flowering / Booting',
    dasRange: 'DAS 45 to 70',
    icon: '🌸',
    description: 'Critical irrigation stage. Maintain zero moisture stress; monitor stem borers.',
  },
  {
    stage: 'Fruit / Grain Formation',
    dasRange: 'DAS 70 to 95',
    icon: '🌽',
    description: 'Potash application for grain filling; bird scaring and fungal watch.',
  },
  {
    stage: 'Harvest Ready',
    dasRange: 'DAS 95 to 120',
    icon: '✨',
    description: 'Withhold irrigation 10 days before harvest. Cut at 85% golden maturity.',
  },
];

export const CropCalendar: React.FC<CropCalendarProps> = ({
  farmer,
  selectedPlot,
  weather,
  tasks,
  onCompleteTask,
  onAddTask,
  onNavigateTab,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<
    'Fertigation' | 'Spraying' | 'Irrigation' | 'Weeding' | 'Scouting' | 'Harvesting'
  >('Fertigation');
  const [newTaskPriority, setNewTaskPriority] = useState<'Normal' | 'High' | 'Urgent'>('Normal');

  const currentCrop = selectedPlot?.currentCropSeason;
  const lang = farmer.preferredLanguage;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    onAddTask({
      farmId: selectedPlot.farmId,
      plotId: selectedPlot.id,
      title: newTaskTitle,
      description: newTaskDesc,
      category: newTaskCategory,
      priority: newTaskPriority,
      dueDate: new Date().toISOString().split('T')[0],
      completed: false,
    });

    setNewTaskTitle('');
    setNewTaskDesc('');
    setShowAddModal(false);
  };

  const handleTaskClick = (taskId: string) => {
    onCompleteTask(taskId);
    try {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    } catch (e) {}
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header */}
      <SectionHeader
        title="Crop Lifecycle & Task Calendar"
        subtitle={`${selectedPlot?.name} • ${currentCrop?.cropName} (${currentCrop?.variety}) • Sown on ${currentCrop?.sowingDate}`}
        badge={
          <Badge variant="primary" size="sm">
            <CalendarIcon className="w-3.5 h-3.5 mr-1" />
            Dynamic Agronomic Schedule
          </Badge>
        }
        action={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowAddModal(true)}
          >
            Add Field Task
          </Button>
        }
      />

      {/* Weather Impact Notice if Rain is forecast */}
      {weather.current.precipitationChancePercent > 40 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-3 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-extrabold text-amber-900">
              Weather Caution: {weather.current.precipitationChancePercent}% Chance of Rain in{' '}
              {farmer.district}
            </p>
            <p className="text-amber-800 mt-0.5 leading-relaxed">
              Foliar sprayings and nitrogen top-dressings should be postponed to avoid nutrient wash-off. Hold field irrigations for the next 24-48 hours.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: Lifecycle Timeline on left, Task Checklist on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 7-Stage Timeline (6 cols) */}
        <div className="lg:col-span-6">
          <Card variant="standard" padding="lg" className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h2 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
                <Sprout className="w-4 h-4 text-emerald-700" />
                <span>Growth Stages & Agronomic Timeline</span>
              </h2>
              <Badge variant="neutral" size="sm">
                ICAR Phenology
              </Badge>
            </div>

            <div className="space-y-4 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-stone-200">
              {STAGES_TIMELINE.map((item, index) => {
                const isCurrent = item.stage === currentCrop?.currentStage;
                return (
                  <div
                    key={index}
                    className={`relative pl-10 transition-all ${
                      isCurrent ? 'scale-101' : 'opacity-80'
                    }`}
                  >
                    {/* Icon Indicator */}
                    <div
                      className={`absolute left-1.5 top-1.5 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-xs ${
                        isCurrent
                          ? 'bg-emerald-800 text-white ring-4 ring-emerald-100 font-bold'
                          : 'bg-stone-100 text-stone-500 border border-stone-300'
                      }`}
                    >
                      <span>{item.icon}</span>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                          : 'bg-white border-stone-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-extrabold text-stone-900">
                          {item.stage}
                        </h4>
                        <span className="text-[10px] font-semibold text-stone-500">
                          {item.dasRange}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                      {isCurrent && (
                        <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-800 text-white uppercase tracking-wider">
                          ★ Active Crop Stage
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right: Actionable Tasks List (6 cols) */}
        <div className="lg:col-span-6">
          <Card variant="standard" padding="lg" className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h2 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Pending Stage Operations ({tasks.filter((t) => !t.completed).length})</span>
              </h2>
              <button
                onClick={() => onNavigateTab('diary')}
                className="text-xs text-emerald-800 font-bold hover:underline cursor-pointer"
              >
                Log in Farm Diary →
              </button>
            </div>

            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                    task.completed
                      ? 'bg-stone-50/60 border-stone-200 opacity-60'
                      : 'bg-white border-stone-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={task.priority === 'Urgent' ? 'danger' : 'neutral'}
                        size="sm"
                      >
                        {task.category}
                      </Badge>
                      <span className="text-xs font-extrabold text-stone-900">{task.title}</span>
                    </div>
                    <p className="text-xs text-stone-600 leading-snug">{task.description}</p>
                    {task.whyExplanation && (
                      <p className="text-[11px] text-amber-900 font-medium pt-0.5">
                        💡 <em>Why: {task.whyExplanation}</em>
                      </p>
                    )}
                  </div>

                  <Button
                    variant={task.completed ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => handleTaskClick(task.id)}
                  >
                    {task.completed ? 'Done' : 'Complete'}
                  </Button>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
              <span>Automatic dynamic adjustments based on weather</span>
              <button
                onClick={() => onNavigateTab('scanner')}
                className="text-emerald-800 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-700" />
                <span>Diagnose Leaf Pest</span>
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal to add task */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <Card variant="standard" padding="lg" className="max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-base font-extrabold text-stone-900">Add Field Task</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Second dose of Urea @ 30kg/acre"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="agri-input text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Description / Dosage</label>
                <textarea
                  placeholder="Specific field instructions or bio-pesticide recipe..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  rows={2}
                  className="agri-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Category</label>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as any)}
                    className="agri-input text-xs"
                  >
                    <option value="Fertigation">Fertigation / Nutrition</option>
                    <option value="Spraying">Pest Spraying</option>
                    <option value="Irrigation">Irrigation</option>
                    <option value="Weeding">Weeding / Interculture</option>
                    <option value="Scouting">Crop Scouting</option>
                    <option value="Harvesting">Harvesting</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="agri-input text-xs"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent (Do Today)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Save Task
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

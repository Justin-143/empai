import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { ChartCard } from './ChartCard';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
  Sparkles, TrendingUp, TrendingDown, Minus, RefreshCw, Play, Target, 
  Zap, Brain, Heart, Clock, Award, AlertTriangle, CheckCircle2, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { departmentStats } from '@/data/mockData';

interface ScenarioResult {
  baselineScore: number;
  newScore: number;
  delta: number;
  percentChange: number;
  category: 'Low' | 'Medium' | 'High';
  impactBreakdown: Array<{ factor: string; impact: number; direction: 'positive' | 'negative' | 'neutral' }>;
}

interface Scenario {
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  adjustments: {
    satisfaction?: number;
    training?: number;
    workHours?: number;
    overtime?: number;
    sickDays?: number;
  };
}

// Normalized weights that sum to 1
const WEIGHTS = {
  satisfaction: 0.30, // 30%
  training: 0.25,     // 25%
  workHours: 0.18,    // 18%
  overtime: 0.15,     // 15%
  sickDays: 0.12,     // 12%
};

// Convert raw factor values to 0-100 scores
function computeFactorScore(factor: keyof typeof WEIGHTS, value: number): number {
  switch (factor) {
    case 'satisfaction':
      // 1-5 scale → 0-100
      return Math.max(0, Math.min(100, ((value - 1) / 4) * 100));
    case 'training':
      // 0-100 hours → 0-100 score (higher is better, caps at 80h)
      return Math.max(0, Math.min(100, (value / 80) * 100));
    case 'workHours':
      // Optimal is 40h, deviation is penalized
      // 40h = 100, 20h or 60h = 50, 0h or 80h = 0
      const deviation = Math.abs(value - 40);
      return Math.max(0, Math.min(100, 100 - (deviation * 2.5)));
    case 'overtime':
      // 0 overtime = 100, 40+ hours = 0 (inverse relationship)
      return Math.max(0, Math.min(100, 100 - (value * 2.5)));
    case 'sickDays':
      // 0 sick days = 100, 20+ days = 0 (inverse relationship)
      return Math.max(0, Math.min(100, 100 - (value * 5)));
    default:
      return 50;
  }
}

// Compute overall score from factor values using normalized weights
function computeOverallScore(values: {
  satisfaction: number;
  trainingHours: number;
  workHours: number;
  overtime: number;
  sickDays: number;
}): number {
  const scores = {
    satisfaction: computeFactorScore('satisfaction', values.satisfaction),
    training: computeFactorScore('training', values.trainingHours),
    workHours: computeFactorScore('workHours', values.workHours),
    overtime: computeFactorScore('overtime', values.overtime),
    sickDays: computeFactorScore('sickDays', values.sickDays),
  };

  return (
    scores.satisfaction * WEIGHTS.satisfaction +
    scores.training * WEIGHTS.training +
    scores.workHours * WEIGHTS.workHours +
    scores.overtime * WEIGHTS.overtime +
    scores.sickDays * WEIGHTS.sickDays
  );
}

const presetScenarios: Scenario[] = [
  {
    name: 'Training Boost',
    description: '+20 training hours',
    icon: Brain,
    color: 'from-blue-500 to-cyan-400',
    adjustments: { training: 20 }
  },
  {
    name: 'Work-Life Balance',
    description: '-50% overtime',
    icon: Heart,
    color: 'from-pink-500 to-rose-400',
    adjustments: { overtime: -50 }
  },
  {
    name: 'Engagement Drive',
    description: '+0.5 satisfaction',
    icon: Sparkles,
    color: 'from-amber-500 to-yellow-400',
    adjustments: { satisfaction: 0.5 }
  },
  {
    name: 'Wellness Program',
    description: '-2 sick days',
    icon: Heart,
    color: 'from-green-500 to-emerald-400',
    adjustments: { sickDays: -2 }
  },
  {
    name: 'Full Optimization',
    description: 'All factors improved',
    icon: Zap,
    color: 'from-violet-500 to-purple-400',
    adjustments: { training: 10, overtime: -25, satisfaction: 0.3 }
  }
];

export function WhatIfSection() {
  // Baseline values (current state)
  const [baseline, setBaseline] = useState({
    satisfaction: 3.8,
    trainingHours: 35,
    workHours: 43,
    overtime: 10,
    sickDays: 5
  });

  // Adjustment sliders - now use absolute delta values
  const [satisfactionDelta, setSatisfactionDelta] = useState([0]);
  const [trainingDelta, setTrainingDelta] = useState([0]);
  const [workHoursDelta, setWorkHoursDelta] = useState([0]);
  const [overtimeDelta, setOvertimeDelta] = useState([0]);
  const [sickDaysDelta, setSickDaysDelta] = useState([0]);
  
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  
  const autoRunRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Compute adjusted values from baseline + deltas
  const adjustedValues = useMemo(() => ({
    satisfaction: Math.max(1, Math.min(5, baseline.satisfaction + satisfactionDelta[0])),
    trainingHours: Math.max(0, Math.min(100, baseline.trainingHours + trainingDelta[0])),
    workHours: Math.max(20, Math.min(60, baseline.workHours + workHoursDelta[0])),
    overtime: Math.max(0, Math.min(40, baseline.overtime + (baseline.overtime * overtimeDelta[0] / 100))),
    sickDays: Math.max(0, Math.min(20, baseline.sickDays + sickDaysDelta[0]))
  }), [baseline, satisfactionDelta, trainingDelta, workHoursDelta, overtimeDelta, sickDaysDelta]);

  // Compute dynamic baseline score from current inputs
  const baselineScore = useMemo(() => computeOverallScore(baseline), [baseline]);

  const runSimulation = useCallback(() => {
    setIsSimulating(true);

    setTimeout(() => {
      const newScore = computeOverallScore(adjustedValues);
      
      // Compute individual factor contributions
      const baselineFactorScores = {
        satisfaction: computeFactorScore('satisfaction', baseline.satisfaction),
        training: computeFactorScore('training', baseline.trainingHours),
        workHours: computeFactorScore('workHours', baseline.workHours),
        overtime: computeFactorScore('overtime', baseline.overtime),
        sickDays: computeFactorScore('sickDays', baseline.sickDays),
      };
      
      const adjustedFactorScores = {
        satisfaction: computeFactorScore('satisfaction', adjustedValues.satisfaction),
        training: computeFactorScore('training', adjustedValues.trainingHours),
        workHours: computeFactorScore('workHours', adjustedValues.workHours),
        overtime: computeFactorScore('overtime', adjustedValues.overtime),
        sickDays: computeFactorScore('sickDays', adjustedValues.sickDays),
      };

      // Calculate weighted impact for each factor
      const impactBreakdown: ScenarioResult['impactBreakdown'] = [
        {
          factor: 'Satisfaction',
          impact: Math.round((adjustedFactorScores.satisfaction - baselineFactorScores.satisfaction) * WEIGHTS.satisfaction * 10) / 10,
          direction: adjustedFactorScores.satisfaction > baselineFactorScores.satisfaction + 0.5 ? 'positive' : 
                     adjustedFactorScores.satisfaction < baselineFactorScores.satisfaction - 0.5 ? 'negative' : 'neutral'
        },
        {
          factor: 'Training',
          impact: Math.round((adjustedFactorScores.training - baselineFactorScores.training) * WEIGHTS.training * 10) / 10,
          direction: adjustedFactorScores.training > baselineFactorScores.training + 0.5 ? 'positive' : 
                     adjustedFactorScores.training < baselineFactorScores.training - 0.5 ? 'negative' : 'neutral'
        },
        {
          factor: 'Work Hours',
          impact: Math.round((adjustedFactorScores.workHours - baselineFactorScores.workHours) * WEIGHTS.workHours * 10) / 10,
          direction: adjustedFactorScores.workHours > baselineFactorScores.workHours + 0.5 ? 'positive' : 
                     adjustedFactorScores.workHours < baselineFactorScores.workHours - 0.5 ? 'negative' : 'neutral'
        },
        {
          factor: 'Overtime',
          impact: Math.round((adjustedFactorScores.overtime - baselineFactorScores.overtime) * WEIGHTS.overtime * 10) / 10,
          direction: adjustedFactorScores.overtime > baselineFactorScores.overtime + 0.5 ? 'positive' : 
                     adjustedFactorScores.overtime < baselineFactorScores.overtime - 0.5 ? 'negative' : 'neutral'
        },
        {
          factor: 'Sick Days',
          impact: Math.round((adjustedFactorScores.sickDays - baselineFactorScores.sickDays) * WEIGHTS.sickDays * 10) / 10,
          direction: adjustedFactorScores.sickDays > baselineFactorScores.sickDays + 0.5 ? 'positive' : 
                     adjustedFactorScores.sickDays < baselineFactorScores.sickDays - 0.5 ? 'negative' : 'neutral'
        }
      ];

      const roundedBaselineScore = Math.round(baselineScore * 10) / 10;
      const roundedNewScore = Math.round(newScore * 10) / 10;
      const delta = Math.round((roundedNewScore - roundedBaselineScore) * 10) / 10;
      const percentChange = roundedBaselineScore > 0 ? Math.round((delta / roundedBaselineScore) * 1000) / 10 : 0;

      setResult({
        baselineScore: roundedBaselineScore,
        newScore: roundedNewScore,
        delta,
        percentChange,
        category: roundedNewScore >= 75 ? 'High' : roundedNewScore >= 50 ? 'Medium' : 'Low',
        impactBreakdown
      });

      setIsSimulating(false);
    }, 400); // Faster spinner timing
  }, [adjustedValues, baseline, baselineScore]);

  const applyPreset = (scenario: Scenario) => {
    setActiveScenario(scenario.name);
    
    // Clear existing deltas
    setSatisfactionDelta([0]);
    setTrainingDelta([0]);
    setWorkHoursDelta([0]);
    setOvertimeDelta([0]);
    setSickDaysDelta([0]);
    
    // Apply preset adjustments (absolute values now, not percentages)
    if (scenario.adjustments.satisfaction !== undefined) {
      setSatisfactionDelta([scenario.adjustments.satisfaction]);
    }
    if (scenario.adjustments.training !== undefined) {
      setTrainingDelta([scenario.adjustments.training]);
    }
    if (scenario.adjustments.workHours !== undefined) {
      setWorkHoursDelta([scenario.adjustments.workHours]);
    }
    if (scenario.adjustments.overtime !== undefined) {
      setOvertimeDelta([scenario.adjustments.overtime]);
    }
    if (scenario.adjustments.sickDays !== undefined) {
      setSickDaysDelta([scenario.adjustments.sickDays]);
    }
    
    // Auto-run simulation after a brief delay for state to settle
    if (autoRunRef.current) {
      clearTimeout(autoRunRef.current);
    }
    autoRunRef.current = setTimeout(() => {
      runSimulation();
    }, 150);
  };

  // Cleanup auto-run timeout on unmount
  useEffect(() => {
    return () => {
      if (autoRunRef.current) {
        clearTimeout(autoRunRef.current);
      }
    };
  }, []);

  const resetAll = () => {
    setActiveScenario(null);
    setSatisfactionDelta([0]);
    setTrainingDelta([0]);
    setWorkHoursDelta([0]);
    setOvertimeDelta([0]);
    setSickDaysDelta([0]);
    setResult(null);
  };

  // Compute absolute factor scores for visualization (not deltas)
  const baselineFactorScores = {
    satisfaction: computeFactorScore('satisfaction', baseline.satisfaction),
    training: computeFactorScore('training', baseline.trainingHours),
    workHours: computeFactorScore('workHours', baseline.workHours),
    overtime: computeFactorScore('overtime', baseline.overtime),
    sickDays: computeFactorScore('sickDays', baseline.sickDays),
  };
  
  const adjustedFactorScores = {
    satisfaction: computeFactorScore('satisfaction', adjustedValues.satisfaction),
    training: computeFactorScore('training', adjustedValues.trainingHours),
    workHours: computeFactorScore('workHours', adjustedValues.workHours),
    overtime: computeFactorScore('overtime', adjustedValues.overtime),
    sickDays: computeFactorScore('sickDays', adjustedValues.sickDays),
  };

  // Bar chart shows ABSOLUTE scores with baseline vs adjusted comparison
  const comparisonChartData = [
    { 
      factor: 'Satisfaction', 
      baseline: Math.round(baselineFactorScores.satisfaction), 
      adjusted: Math.round(adjustedFactorScores.satisfaction),
      weight: `${WEIGHTS.satisfaction * 100}%`
    },
    { 
      factor: 'Training', 
      baseline: Math.round(baselineFactorScores.training), 
      adjusted: Math.round(adjustedFactorScores.training),
      weight: `${WEIGHTS.training * 100}%`
    },
    { 
      factor: 'Work Hours', 
      baseline: Math.round(baselineFactorScores.workHours), 
      adjusted: Math.round(adjustedFactorScores.workHours),
      weight: `${WEIGHTS.workHours * 100}%`
    },
    { 
      factor: 'Overtime', 
      baseline: Math.round(baselineFactorScores.overtime), 
      adjusted: Math.round(adjustedFactorScores.overtime),
      weight: `${WEIGHTS.overtime * 100}%`
    },
    { 
      factor: 'Sick Days', 
      baseline: Math.round(baselineFactorScores.sickDays), 
      adjusted: Math.round(adjustedFactorScores.sickDays),
      weight: `${WEIGHTS.sickDays * 100}%`
    },
  ];

  const radarData = [
    { metric: 'Satisfaction', baseline: Math.round(baselineFactorScores.satisfaction), adjusted: Math.round(adjustedFactorScores.satisfaction) },
    { metric: 'Training', baseline: Math.round(baselineFactorScores.training), adjusted: Math.round(adjustedFactorScores.training) },
    { metric: 'Work Hours', baseline: Math.round(baselineFactorScores.workHours), adjusted: Math.round(adjustedFactorScores.workHours) },
    { metric: 'Overtime', baseline: Math.round(baselineFactorScores.overtime), adjusted: Math.round(adjustedFactorScores.overtime) },
    { metric: 'Sick Days', baseline: Math.round(baselineFactorScores.sickDays), adjusted: Math.round(adjustedFactorScores.sickDays) },
  ];

  // Format delta display with sign and units
  const formatDelta = (value: number, suffix: string = '') => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value}${suffix}`;
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-transparent border border-primary/20 p-4 sm:p-6 lg:p-8">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25 flex-shrink-0">
            <Target className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">What-If Scenario Builder</h2>
            <p className="text-muted-foreground text-xs sm:text-sm lg:text-base max-w-2xl">
              Simulate the impact of organizational changes before implementation. 
              Adjust key factors and see real-time predictions powered by ML models.
            </p>
          </div>
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-background/50 border border-border">
              <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
              <span className="hidden sm:inline">Normalized Weights</span>
              <span className="sm:hidden">ML</span>
            </div>
            <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-background/50 border border-border">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
              <span className="hidden sm:inline">Dynamic Baseline</span>
              <span className="sm:hidden">Live</span>
            </div>
          </div>
        </div>
        
        {/* Dynamic Baseline Indicator */}
        <div className="relative z-10 mt-4 pt-4 border-t border-border/50">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="text-muted-foreground">Current Baseline Score:</span>
            <Badge variant="outline" className="text-base font-bold px-3 py-1">
              {Math.round(baselineScore * 10) / 10}
            </Badge>
            <span className="text-xs text-muted-foreground">(computed from your current inputs)</span>
          </div>
        </div>
      </div>

      {/* Quick Scenarios - Visual Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
        {presetScenarios.map((scenario, index) => {
          const Icon = scenario.icon;
          const isActive = activeScenario === scenario.name;
          
          return (
            <button
              key={scenario.name}
              onClick={() => applyPreset(scenario)}
              className={cn(
                "group relative overflow-hidden rounded-xl p-3 sm:p-4 text-left transition-all duration-300",
                "border-2 hover:scale-[1.02] hover:shadow-lg",
                isActive 
                  ? "border-primary bg-primary/10 shadow-lg shadow-primary/20" 
                  : "border-border bg-card hover:border-primary/50"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity",
                `bg-gradient-to-br ${scenario.color}`
              )} style={{ opacity: isActive ? 0.1 : undefined }} />
              
              <div className={cn(
                "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mb-2 sm:mb-3 transition-colors",
                `bg-gradient-to-br ${scenario.color}`
              )}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              
              <h3 className="font-semibold text-xs sm:text-sm mb-0.5 sm:mb-1 truncate">{scenario.name}</h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{scenario.description}</p>
              
              {isActive && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
        {/* Scenario Builder - Enhanced */}
        <div className="xl:col-span-4">
          <div className="glass-card p-4 sm:p-6 h-full space-y-4 sm:space-y-6 border-2 border-border hover:border-primary/30 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  Custom Scenario
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Fine-tune each factor</p>
              </div>
              <Button variant="ghost" size="sm" onClick={resetAll} className="text-muted-foreground hover:text-foreground">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            {/* Department Filter */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Target Department</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Departments</SelectItem>
                  {departmentStats.map(d => (
                    <SelectItem key={d.department} value={d.department}>{d.department}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sliders with visual feedback */}
            <div className="space-y-4 sm:space-y-5">
              {/* Satisfaction - absolute delta (1-5 scale) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2 text-xs sm:text-sm">
                    <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-pink-500" />
                    <span className="hidden sm:inline">Satisfaction</span>
                    <span className="sm:hidden">Satis.</span>
                    <span className="text-[10px] text-muted-foreground">({adjustedValues.satisfaction.toFixed(1)}/5)</span>
                  </Label>
                  <Badge variant={satisfactionDelta[0] > 0 ? 'default' : satisfactionDelta[0] < 0 ? 'destructive' : 'secondary'} className="font-mono text-xs">
                    {formatDelta(satisfactionDelta[0])}
                  </Badge>
                </div>
                <Slider
                  value={satisfactionDelta}
                  onValueChange={setSatisfactionDelta}
                  min={-2}
                  max={2}
                  step={0.1}
                  className="cursor-pointer"
                />
              </div>

              {/* Training - absolute delta (hours) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2 text-xs sm:text-sm">
                    <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                    <span className="hidden sm:inline">Training Hours</span>
                    <span className="sm:hidden">Training</span>
                    <span className="text-[10px] text-muted-foreground">({Math.round(adjustedValues.trainingHours)}h)</span>
                  </Label>
                  <Badge variant={trainingDelta[0] > 0 ? 'default' : trainingDelta[0] < 0 ? 'destructive' : 'secondary'} className="font-mono text-xs">
                    {formatDelta(trainingDelta[0], 'h')}
                  </Badge>
                </div>
                <Slider
                  value={trainingDelta}
                  onValueChange={setTrainingDelta}
                  min={-30}
                  max={50}
                  step={5}
                />
              </div>

              {/* Work Hours - absolute delta */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2 text-xs sm:text-sm">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" />
                    <span className="hidden sm:inline">Work Hours/Week</span>
                    <span className="sm:hidden">Hours</span>
                    <span className="text-[10px] text-muted-foreground">({Math.round(adjustedValues.workHours)}h)</span>
                  </Label>
                  <Badge variant={Math.abs(workHoursDelta[0]) > 5 ? (adjustedValues.workHours > 40 ? 'destructive' : 'default') : 'secondary'} className="font-mono text-xs">
                    {formatDelta(workHoursDelta[0], 'h')}
                  </Badge>
                </div>
                <Slider
                  value={workHoursDelta}
                  onValueChange={setWorkHoursDelta}
                  min={-15}
                  max={15}
                  step={1}
                />
              </div>

              {/* Overtime - percentage change */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2 text-xs sm:text-sm">
                    <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                    <span className="hidden sm:inline">Overtime</span>
                    <span className="sm:hidden">OT</span>
                    <span className="text-[10px] text-muted-foreground">({adjustedValues.overtime.toFixed(1)}h)</span>
                  </Label>
                  <Badge variant={overtimeDelta[0] < 0 ? 'default' : overtimeDelta[0] > 0 ? 'destructive' : 'secondary'} className="font-mono text-xs">
                    {formatDelta(overtimeDelta[0], '%')}
                  </Badge>
                </div>
                <Slider
                  value={overtimeDelta}
                  onValueChange={setOvertimeDelta}
                  min={-100}
                  max={100}
                  step={10}
                />
              </div>

              {/* Sick Days - absolute delta */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2 text-xs sm:text-sm">
                    <Award className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                    <span className="hidden sm:inline">Sick Days</span>
                    <span className="sm:hidden">Sick</span>
                    <span className="text-[10px] text-muted-foreground">({Math.max(0, Math.round(adjustedValues.sickDays))}d)</span>
                  </Label>
                  <Badge variant={sickDaysDelta[0] < 0 ? 'default' : sickDaysDelta[0] > 0 ? 'destructive' : 'secondary'} className="font-mono text-xs">
                    {formatDelta(sickDaysDelta[0], 'd')}
                  </Badge>
                </div>
                <Slider
                  value={sickDaysDelta}
                  onValueChange={setSickDaysDelta}
                  min={-5}
                  max={10}
                  step={1}
                />
              </div>
            </div>

            <Button 
              onClick={runSimulation} 
              className="w-full h-10 sm:h-12 text-sm sm:text-base"
              variant="glow"
              disabled={isSimulating}
            >
              {isSimulating ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Simulating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                  Run Simulation
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Results Panel - Enhanced */}
        <div className="xl:col-span-8">
          <div className="glass-card p-4 sm:p-6 h-full">
            {result ? (
              <div className="space-y-4 sm:space-y-6 animate-fade-in">
                {/* Score Comparison - Hero Style */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="text-center p-4 sm:p-6 rounded-xl bg-muted/30 border border-border">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2 uppercase tracking-wide">Current Score</p>
                    <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-muted-foreground">{result.baselineScore}</p>
                  </div>
                  
                  <div className="text-center p-4 sm:p-6 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2 uppercase tracking-wide">Change</p>
                    <p className={cn(
                      "text-3xl sm:text-4xl lg:text-5xl font-bold flex items-center justify-center gap-1 sm:gap-2",
                      result.delta > 0 ? "text-green-500" : result.delta < 0 ? "text-red-500" : "text-muted-foreground"
                    )}>
                      {result.delta > 0 ? <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" /> : 
                       result.delta < 0 ? <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8" /> : 
                       <Minus className="w-6 h-6 sm:w-8 sm:h-8" />}
                      {result.delta > 0 ? '+' : ''}{result.delta}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      ({result.percentChange > 0 ? '+' : ''}{result.percentChange}%)
                    </p>
                  </div>
                  
                  <div className={cn(
                    "text-center p-4 sm:p-6 rounded-xl border-2",
                    result.category === 'High' ? "bg-green-500/10 border-green-500/50" :
                    result.category === 'Medium' ? "bg-amber-500/10 border-amber-500/50" :
                    "bg-red-500/10 border-red-500/50"
                  )}>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2 uppercase tracking-wide">Projected</p>
                    <p className={cn(
                      "text-3xl sm:text-4xl lg:text-5xl font-bold",
                      result.category === 'High' ? "text-green-500" :
                      result.category === 'Medium' ? "text-amber-500" :
                      "text-red-500"
                    )}>{result.newScore}</p>
                  </div>
                </div>

                {/* Category Badge */}
                <div className="flex items-center justify-center">
                  <Badge className={cn(
                    "text-sm sm:text-base py-1.5 sm:py-2 px-4 sm:px-5",
                    result.category === 'High' ? "bg-green-500/20 text-green-500 hover:bg-green-500/30" :
                    result.category === 'Medium' ? "bg-amber-500/20 text-amber-500 hover:bg-amber-500/30" :
                    "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                  )}>
                    <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    {result.category} Performer
                  </Badge>
                </div>

                {/* Charts Section - Full Width Stacked */}
                <div className="space-y-6">
                  {/* Bar Chart: Baseline vs Adjusted Comparison */}
                  <div className="bg-muted/20 rounded-xl p-4 sm:p-6 border border-border">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                      <h4 className="text-sm sm:text-base font-semibold">Factor Score Comparison</h4>
                      <div className="flex items-center gap-4 text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-sm bg-muted-foreground/50" />
                          <span className="text-muted-foreground">Baseline</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-sm bg-primary" />
                          <span className="text-muted-foreground">Projected</span>
                        </div>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart 
                        data={comparisonChartData} 
                        layout="vertical" 
                        margin={{ left: 20, right: 40, top: 10, bottom: 20 }}
                        barGap={4}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" horizontal={true} vertical={false} />
                        <XAxis 
                          type="number" 
                          domain={[0, 100]}
                          tickFormatter={(value) => `${value}`}
                          className="fill-muted-foreground" 
                          fontSize={11}
                          axisLine={{ stroke: 'hsl(var(--border))' }}
                          tickLine={{ stroke: 'hsl(var(--border))' }}
                        />
                        <YAxis 
                          dataKey="factor" 
                          type="category" 
                          className="fill-muted-foreground" 
                          fontSize={12} 
                          width={85}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            color: 'hsl(var(--foreground))',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                          }}
                          formatter={(value: number, name: string) => [
                            `${value}/100`, 
                            name === 'baseline' ? 'Baseline Score' : 'Projected Score'
                          ]}
                          labelFormatter={(label) => `${label}`}
                        />
                        <Bar 
                          dataKey="baseline" 
                          fill="hsl(var(--muted-foreground))" 
                          fillOpacity={0.4}
                          radius={[0, 4, 4, 0]} 
                          barSize={14}
                          name="baseline"
                        />
                        <Bar 
                          dataKey="adjusted" 
                          fill="hsl(var(--primary))" 
                          radius={[0, 4, 4, 0]} 
                          barSize={14}
                          name="adjusted"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Factor Score (0-100 Scale) — Higher is better
                    </p>
                  </div>

                  {/* Radar Chart: Visual Comparison */}
                  <div className="bg-muted/20 rounded-xl p-4 sm:p-6 border border-border">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                      <h4 className="text-sm sm:text-base font-semibold">Performance Profile</h4>
                      <div className="flex items-center gap-4 text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full border-2 border-muted-foreground bg-muted-foreground/20" />
                          <span className="text-muted-foreground">Before</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full border-2 border-primary bg-primary/30" />
                          <span className="text-muted-foreground">After</span>
                        </div>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                      <RadarChart data={radarData} margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
                        <PolarGrid 
                          className="stroke-border" 
                          strokeDasharray="3 3"
                          gridType="polygon"
                        />
                        <PolarAngleAxis 
                          dataKey="metric" 
                          className="fill-foreground" 
                          fontSize={12}
                          fontWeight={500}
                          tick={{ fill: 'hsl(var(--foreground))' }}
                        />
                        <PolarRadiusAxis 
                          className="fill-muted-foreground" 
                          fontSize={10} 
                          domain={[0, 100]} 
                          tickCount={6}
                          axisLine={false}
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <Radar 
                          name="Before" 
                          dataKey="baseline" 
                          stroke="hsl(var(--muted-foreground))" 
                          fill="hsl(var(--muted-foreground))" 
                          fillOpacity={0.15} 
                          strokeWidth={2}
                          strokeDasharray="4 4"
                        />
                        <Radar 
                          name="After" 
                          dataKey="adjusted" 
                          stroke="hsl(var(--primary))" 
                          fill="hsl(var(--primary))" 
                          fillOpacity={0.25} 
                          strokeWidth={2.5}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            color: 'hsl(var(--foreground))',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                          }}
                          formatter={(value: number, name: string) => [
                            `${value}/100`, 
                            name === 'Before' ? 'Baseline' : 'Projected'
                          ]}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      All factors normalized to 0-100 scale for comparison
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] sm:min-h-[400px] text-center p-4 sm:p-8">
                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 sm:mb-6 animate-pulse">
                  <Target className="w-8 h-8 sm:w-12 sm:h-12 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">Ready to Simulate</h3>
                <p className="text-muted-foreground text-sm sm:text-base max-w-md mb-4 sm:mb-6">
                  Choose a preset scenario or customize the factors on the left, then click "Run Simulation" to see the projected impact on employee performance.
                </p>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  <span>Normalized weights • Dynamic baseline</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

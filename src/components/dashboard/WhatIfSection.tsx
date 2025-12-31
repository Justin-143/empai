import { useState, useMemo } from 'react';
import { ChartCard } from './ChartCard';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell
} from 'recharts';
import { Sparkles, TrendingUp, TrendingDown, Minus, RefreshCw, Play, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { departmentStats } from '@/data/mockData';

interface ScenarioResult {
  baselineScore: number;
  newScore: number;
  delta: number;
  percentChange: number;
  category: 'Low' | 'Medium' | 'High';
  riskLevel: 'low' | 'medium' | 'high';
  impactBreakdown: Array<{ factor: string; impact: number; direction: 'positive' | 'negative' | 'neutral' }>;
}

interface Scenario {
  name: string;
  description: string;
  adjustments: {
    satisfaction?: number;
    training?: number;
    workHours?: number;
    overtime?: number;
    sickDays?: number;
  };
}

const presetScenarios: Scenario[] = [
  {
    name: 'Training Boost',
    description: 'Increase training hours by 20%',
    adjustments: { training: 20 }
  },
  {
    name: 'Workload Reduction',
    description: 'Reduce overtime by 50%',
    adjustments: { overtime: -50 }
  },
  {
    name: 'Engagement Initiative',
    description: 'Improve satisfaction by 15%',
    adjustments: { satisfaction: 15 }
  },
  {
    name: 'Wellness Program',
    description: 'Reduce sick days by 30%',
    adjustments: { sickDays: -30 }
  },
  {
    name: 'Combined Optimization',
    description: 'Training +10%, Overtime -25%, Satisfaction +10%',
    adjustments: { training: 10, overtime: -25, satisfaction: 10 }
  }
];

export function WhatIfSection() {
  // Baseline values (current average)
  const [baseline] = useState({
    satisfaction: 3.8,
    trainingHours: 35,
    workHours: 43,
    overtime: 10,
    sickDays: 5
  });

  // Adjustment percentages
  const [satisfactionChange, setSatisfactionChange] = useState([0]);
  const [trainingChange, setTrainingChange] = useState([0]);
  const [workHoursChange, setWorkHoursChange] = useState([0]);
  const [overtimeChange, setOvertimeChange] = useState([0]);
  const [sickDaysChange, setSickDaysChange] = useState([0]);
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<ScenarioResult | null>(null);

  const adjustedValues = useMemo(() => ({
    satisfaction: baseline.satisfaction * (1 + satisfactionChange[0] / 100),
    trainingHours: baseline.trainingHours * (1 + trainingChange[0] / 100),
    workHours: baseline.workHours * (1 + workHoursChange[0] / 100),
    overtime: baseline.overtime * (1 + overtimeChange[0] / 100),
    sickDays: baseline.sickDays * (1 + sickDaysChange[0] / 100)
  }), [baseline, satisfactionChange, trainingChange, workHoursChange, overtimeChange, sickDaysChange]);

  const runSimulation = () => {
    setIsSimulating(true);

    setTimeout(() => {
      // Feature importance weights from XGBoost
      const weights = {
        satisfaction: 0.285,
        training: 0.198,
        workHours: 0.124,
        overtime: 0.098,
        sickDays: 0.072
      };

      // Calculate baseline score
      const baselineScore = 75; // Average baseline

      // Calculate impact of each change
      const impactBreakdown = [
        {
          factor: 'Satisfaction',
          impact: satisfactionChange[0] * weights.satisfaction * 0.5,
          direction: satisfactionChange[0] > 0 ? 'positive' : satisfactionChange[0] < 0 ? 'negative' : 'neutral'
        },
        {
          factor: 'Training',
          impact: trainingChange[0] * weights.training * 0.4,
          direction: trainingChange[0] > 0 ? 'positive' : trainingChange[0] < 0 ? 'negative' : 'neutral'
        },
        {
          factor: 'Work Hours',
          impact: workHoursChange[0] * weights.workHours * -0.2, // More hours = slight negative
          direction: workHoursChange[0] > 5 ? 'negative' : workHoursChange[0] < -5 ? 'positive' : 'neutral'
        },
        {
          factor: 'Overtime',
          impact: overtimeChange[0] * weights.overtime * -0.5, // More overtime = negative
          direction: overtimeChange[0] > 0 ? 'negative' : overtimeChange[0] < 0 ? 'positive' : 'neutral'
        },
        {
          factor: 'Sick Days',
          impact: sickDaysChange[0] * weights.sickDays * -0.6, // More sick days = negative
          direction: sickDaysChange[0] > 0 ? 'negative' : sickDaysChange[0] < 0 ? 'positive' : 'neutral'
        }
      ] as ScenarioResult['impactBreakdown'];

      const totalImpact = impactBreakdown.reduce((sum, item) => sum + item.impact, 0);
      const newScore = Math.max(0, Math.min(100, baselineScore + totalImpact));
      const delta = newScore - baselineScore;
      const percentChange = (delta / baselineScore) * 100;

      // Determine risk level based on negative factors
      const negativeImpacts = impactBreakdown.filter(i => i.direction === 'negative').length;
      const riskLevel = negativeImpacts >= 3 ? 'high' : negativeImpacts >= 1 ? 'medium' : 'low';

      setResult({
        baselineScore,
        newScore: Math.round(newScore * 10) / 10,
        delta: Math.round(delta * 10) / 10,
        percentChange: Math.round(percentChange * 10) / 10,
        category: newScore >= 80 ? 'High' : newScore >= 60 ? 'Medium' : 'Low',
        riskLevel,
        impactBreakdown
      });

      setIsSimulating(false);
    }, 1200);
  };

  const applyPreset = (scenario: Scenario) => {
    setSatisfactionChange([scenario.adjustments.satisfaction || 0]);
    setTrainingChange([scenario.adjustments.training || 0]);
    setOvertimeChange([scenario.adjustments.overtime || 0]);
    setSickDaysChange([scenario.adjustments.sickDays || 0]);
    setWorkHoursChange([0]);
  };

  const resetAll = () => {
    setSatisfactionChange([0]);
    setTrainingChange([0]);
    setWorkHoursChange([0]);
    setOvertimeChange([0]);
    setSickDaysChange([0]);
    setResult(null);
  };

  // Chart data for impact visualization
  const impactChartData = result?.impactBreakdown.map(item => ({
    factor: item.factor,
    impact: Math.round(item.impact * 10) / 10,
    fill: item.direction === 'positive' ? 'hsl(142, 76%, 45%)' : 
          item.direction === 'negative' ? 'hsl(0, 72%, 51%)' : 
          'hsl(215, 20%, 55%)'
  })) || [];

  // Comparison radar data
  const radarData = [
    { metric: 'Satisfaction', baseline: baseline.satisfaction * 20, adjusted: adjustedValues.satisfaction * 20 },
    { metric: 'Training', baseline: baseline.trainingHours, adjusted: adjustedValues.trainingHours },
    { metric: 'Work-Life', baseline: 100 - baseline.overtime * 3, adjusted: 100 - adjustedValues.overtime * 3 },
    { metric: 'Health', baseline: 100 - baseline.sickDays * 5, adjusted: 100 - adjustedValues.sickDays * 5 },
    { metric: 'Productivity', baseline: baseline.workHours * 1.5, adjusted: adjustedValues.workHours * 1.5 },
  ];

  // Department impact projection
  const departmentImpact = departmentStats.map(dept => ({
    department: dept.department,
    current: dept.avgPerformance,
    projected: Math.min(100, Math.max(0, dept.avgPerformance + (result?.delta || 0) * (0.8 + Math.random() * 0.4)))
  }));

  return (
    <div className="space-y-6">
      {/* Preset Scenarios */}
      <ChartCard 
        title="Quick Scenarios" 
        subtitle="Apply preset simulation scenarios"
        delay={0}
      >
        <div className="flex flex-wrap gap-3">
          {presetScenarios.map((scenario, index) => (
            <Button
              key={scenario.name}
              variant="outline"
              size="sm"
              onClick={() => applyPreset(scenario)}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Sparkles className="w-3 h-3 mr-2" />
              {scenario.name}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={resetAll}
            className="text-muted-foreground"
          >
            <RefreshCw className="w-3 h-3 mr-2" />
            Reset All
          </Button>
        </div>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario Builder */}
        <ChartCard 
          title="Scenario Builder" 
          subtitle="Adjust factors to simulate impact"
          className="lg:col-span-1"
          delay={100}
        >
          <div className="space-y-6">
            {/* Department Filter */}
            <div className="space-y-2">
              <Label>Target Department</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
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

            {/* Satisfaction Change */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Satisfaction Change</Label>
                <Badge variant={satisfactionChange[0] > 0 ? 'default' : satisfactionChange[0] < 0 ? 'destructive' : 'secondary'}>
                  {satisfactionChange[0] > 0 ? '+' : ''}{satisfactionChange[0]}%
                </Badge>
              </div>
              <Slider
                value={satisfactionChange}
                onValueChange={setSatisfactionChange}
                min={-50}
                max={50}
                step={5}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{(baseline.satisfaction * 0.5).toFixed(1)}</span>
                <span className="text-primary">{adjustedValues.satisfaction.toFixed(2)}</span>
                <span>{(baseline.satisfaction * 1.5).toFixed(1)}</span>
              </div>
            </div>

            {/* Training Change */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Training Hours Change</Label>
                <Badge variant={trainingChange[0] > 0 ? 'default' : trainingChange[0] < 0 ? 'destructive' : 'secondary'}>
                  {trainingChange[0] > 0 ? '+' : ''}{trainingChange[0]}%
                </Badge>
              </div>
              <Slider
                value={trainingChange}
                onValueChange={setTrainingChange}
                min={-50}
                max={100}
                step={5}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{Math.round(baseline.trainingHours * 0.5)}h</span>
                <span className="text-primary">{Math.round(adjustedValues.trainingHours)}h</span>
                <span>{Math.round(baseline.trainingHours * 2)}h</span>
              </div>
            </div>

            {/* Work Hours Change */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Work Hours Change</Label>
                <Badge variant={workHoursChange[0] < -10 ? 'default' : workHoursChange[0] > 10 ? 'destructive' : 'secondary'}>
                  {workHoursChange[0] > 0 ? '+' : ''}{workHoursChange[0]}%
                </Badge>
              </div>
              <Slider
                value={workHoursChange}
                onValueChange={setWorkHoursChange}
                min={-30}
                max={30}
                step={5}
              />
            </div>

            {/* Overtime Change */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Overtime Change</Label>
                <Badge variant={overtimeChange[0] < 0 ? 'default' : overtimeChange[0] > 0 ? 'destructive' : 'secondary'}>
                  {overtimeChange[0] > 0 ? '+' : ''}{overtimeChange[0]}%
                </Badge>
              </div>
              <Slider
                value={overtimeChange}
                onValueChange={setOvertimeChange}
                min={-100}
                max={100}
                step={10}
              />
            </div>

            {/* Sick Days Change */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Sick Days Change</Label>
                <Badge variant={sickDaysChange[0] < 0 ? 'default' : sickDaysChange[0] > 0 ? 'destructive' : 'secondary'}>
                  {sickDaysChange[0] > 0 ? '+' : ''}{sickDaysChange[0]}%
                </Badge>
              </div>
              <Slider
                value={sickDaysChange}
                onValueChange={setSickDaysChange}
                min={-50}
                max={100}
                step={10}
              />
            </div>

            <Button 
              onClick={runSimulation} 
              className="w-full"
              variant="glow"
              disabled={isSimulating}
            >
              {isSimulating ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⟳</span>
                  Simulating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Run Simulation
                </span>
              )}
            </Button>
          </div>
        </ChartCard>

        {/* Results Panel */}
        <ChartCard 
          title="Simulation Results" 
          subtitle="Predicted impact of changes"
          className="lg:col-span-2"
          delay={200}
        >
          {result ? (
            <div className="space-y-6 animate-fade-in">
              {/* Score Comparison */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="glass-card p-4">
                  <p className="text-sm text-muted-foreground mb-1">Baseline</p>
                  <p className="text-3xl font-bold">{result.baselineScore}</p>
                </div>
                <div className="glass-card p-4">
                  <p className="text-sm text-muted-foreground mb-1">Change</p>
                  <p className={cn(
                    "text-3xl font-bold flex items-center justify-center gap-1",
                    result.delta > 0 ? "text-success" : result.delta < 0 ? "text-destructive" : ""
                  )}>
                    {result.delta > 0 ? <TrendingUp className="w-5 h-5" /> : 
                     result.delta < 0 ? <TrendingDown className="w-5 h-5" /> : 
                     <Minus className="w-5 h-5" />}
                    {result.delta > 0 ? '+' : ''}{result.delta}
                  </p>
                </div>
                <div className={cn(
                  "glass-card p-4",
                  result.category === 'High' ? "border-success/50" :
                  result.category === 'Medium' ? "border-warning/50" :
                  "border-destructive/50"
                )}>
                  <p className="text-sm text-muted-foreground mb-1">Projected</p>
                  <p className="text-3xl font-bold">{result.newScore}</p>
                </div>
              </div>

              {/* Category Badge */}
              <div className="flex items-center justify-center gap-4">
                <Badge className={cn(
                  "text-lg py-1.5 px-4",
                  result.category === 'High' ? "bg-success/20 text-success hover:bg-success/30" :
                  result.category === 'Medium' ? "bg-warning/20 text-warning hover:bg-warning/30" :
                  "bg-destructive/20 text-destructive hover:bg-destructive/30"
                )}>
                  {result.category} Performer
                </Badge>
                <Badge variant="outline" className={cn(
                  result.riskLevel === 'low' ? "border-success text-success" :
                  result.riskLevel === 'medium' ? "border-warning text-warning" :
                  "border-destructive text-destructive"
                )}>
                  {result.riskLevel.charAt(0).toUpperCase() + result.riskLevel.slice(1)} Risk
                </Badge>
              </div>

              {/* Impact Chart */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Factor Impact Breakdown</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={impactChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 16%)" />
                    <XAxis type="number" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                    <YAxis dataKey="factor" type="category" stroke="hsl(215, 20%, 55%)" fontSize={11} width={80} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(222, 47%, 8%)', 
                        border: '1px solid hsl(222, 47%, 16%)',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`${value > 0 ? '+' : ''}${value} pts`, 'Impact']}
                    />
                    <Bar 
                      dataKey="impact" 
                      radius={[0, 4, 4, 0]}
                    >
                      {impactChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[350px] text-center">
              <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                <Target className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Adjust parameters and run simulation<br />to see predicted performance impact
              </p>
            </div>
          )}
        </ChartCard>
      </div>

      {/* Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Comparison */}
        <ChartCard 
          title="Baseline vs Adjusted" 
          subtitle="Multi-dimensional comparison"
          delay={300}
        >
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(222, 47%, 16%)" />
              <PolarAngleAxis dataKey="metric" stroke="hsl(215, 20%, 55%)" fontSize={12} />
              <PolarRadiusAxis stroke="hsl(215, 20%, 55%)" fontSize={10} />
              <Radar 
                name="Baseline" 
                dataKey="baseline" 
                stroke="hsl(215, 20%, 55%)" 
                fill="hsl(215, 20%, 55%)" 
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Radar 
                name="Adjusted" 
                dataKey="adjusted" 
                stroke="hsl(187, 85%, 53%)" 
                fill="hsl(187, 85%, 53%)" 
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Legend />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222, 47%, 8%)', 
                  border: '1px solid hsl(222, 47%, 16%)',
                  borderRadius: '8px'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Department Impact */}
        <ChartCard 
          title="Department Impact Projection" 
          subtitle="Expected performance changes by department"
          delay={400}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentImpact}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 16%)" />
              <XAxis dataKey="department" stroke="hsl(215, 20%, 55%)" fontSize={11} />
              <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} domain={[60, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222, 47%, 8%)', 
                  border: '1px solid hsl(222, 47%, 16%)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="current" name="Current" fill="hsl(215, 20%, 55%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="projected" name="Projected" fill="hsl(187, 85%, 53%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChartCard } from './ChartCard';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface PredictionResult {
  score: number;
  category: 'Low' | 'Medium' | 'High';
  confidence: number;
  recommendations: string[];
}

export function PredictionSection() {
  const [satisfaction, setSatisfaction] = useState([3.5]);
  const [trainingHours, setTrainingHours] = useState([35]);
  const [yearsAtCompany, setYearsAtCompany] = useState([3]);
  const [workHours, setWorkHours] = useState([42]);
  const [overtime, setOvertime] = useState([8]);
  const [sickDays, setSickDays] = useState([4]);
  const [department, setDepartment] = useState('Engineering');
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePredict = () => {
    setIsLoading(true);
    
    // Simulated ML prediction (in production, this would call an API)
    setTimeout(() => {
      const baseScore = 
        satisfaction[0] * 12 +
        trainingHours[0] * 0.5 +
        yearsAtCompany[0] * 2 -
        overtime[0] * 0.8 -
        sickDays[0] * 1.5 +
        (department === 'HR' ? 5 : department === 'Sales' ? 3 : 0);
      
      const score = Math.min(100, Math.max(0, baseScore + 20));
      const category: 'Low' | 'Medium' | 'High' = score < 60 ? 'Low' : score < 80 ? 'Medium' : 'High';
      
      const recommendations: string[] = [];
      if (satisfaction[0] < 3.5) recommendations.push('Improve employee engagement initiatives');
      if (trainingHours[0] < 30) recommendations.push('Increase training opportunities');
      if (overtime[0] > 10) recommendations.push('Review workload distribution');
      if (sickDays[0] > 6) recommendations.push('Implement wellness programs');
      
      setPrediction({
        score: Math.round(score),
        category,
        confidence: 85 + Math.random() * 10,
        recommendations: recommendations.length > 0 ? recommendations : ['Employee is performing optimally']
      });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Form */}
      <ChartCard 
        title="Performance Prediction" 
        subtitle="Enter employee metrics to predict performance"
        delay={0}
      >
        <div className="space-y-6">
          {/* Satisfaction Score */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Satisfaction Score</Label>
              <span className="text-sm font-mono text-primary">{satisfaction[0].toFixed(1)}</span>
            </div>
            <Slider
              value={satisfaction}
              onValueChange={setSatisfaction}
              min={1}
              max={5}
              step={0.1}
              className="cursor-pointer"
            />
          </div>

          {/* Training Hours */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Training Hours (Annual)</Label>
              <span className="text-sm font-mono text-primary">{trainingHours[0]}h</span>
            </div>
            <Slider
              value={trainingHours}
              onValueChange={setTrainingHours}
              min={0}
              max={100}
              step={1}
            />
          </div>

          {/* Years at Company */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Years at Company</Label>
              <span className="text-sm font-mono text-primary">{yearsAtCompany[0]}</span>
            </div>
            <Slider
              value={yearsAtCompany}
              onValueChange={setYearsAtCompany}
              min={0}
              max={20}
              step={1}
            />
          </div>

          {/* Work Hours */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Work Hours/Week</Label>
              <span className="text-sm font-mono text-primary">{workHours[0]}h</span>
            </div>
            <Slider
              value={workHours}
              onValueChange={setWorkHours}
              min={20}
              max={60}
              step={1}
            />
          </div>

          {/* Overtime */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Overtime Hours/Week</Label>
              <span className="text-sm font-mono text-primary">{overtime[0]}h</span>
            </div>
            <Slider
              value={overtime}
              onValueChange={setOvertime}
              min={0}
              max={30}
              step={1}
            />
          </div>

          {/* Sick Days */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Sick Days (Annual)</Label>
              <span className="text-sm font-mono text-primary">{sickDays[0]}</span>
            </div>
            <Slider
              value={sickDays}
              onValueChange={setSickDays}
              min={0}
              max={20}
              step={1}
            />
          </div>

          {/* Department */}
          <div className="space-y-3">
            <Label>Department</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handlePredict} 
            className="w-full"
            variant="glow"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⟳</span>
                Predicting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Predict Performance
              </span>
            )}
          </Button>
        </div>
      </ChartCard>

      {/* Prediction Results */}
      <ChartCard 
        title="Prediction Results" 
        subtitle="XGBoost model output"
        delay={100}
      >
        {prediction ? (
          <div className="space-y-6 animate-fade-in">
            {/* Score Display */}
            <div className="text-center py-8">
              <div className="relative inline-flex">
                <div className={cn(
                  "w-40 h-40 rounded-full flex items-center justify-center",
                  "bg-gradient-to-br",
                  prediction.category === 'High' ? "from-success/20 to-success/5 glow-primary" :
                  prediction.category === 'Medium' ? "from-warning/20 to-warning/5" :
                  "from-destructive/20 to-destructive/5"
                )}>
                  <div className="text-center">
                    <p className="text-5xl font-bold">{prediction.score}</p>
                    <p className="text-sm text-muted-foreground">Performance Score</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Badge */}
            <div className="flex justify-center">
              <div className={cn(
                "px-6 py-2 rounded-full font-medium text-lg",
                prediction.category === 'High' ? "bg-success/20 text-success" :
                prediction.category === 'Medium' ? "bg-warning/20 text-warning" :
                "bg-destructive/20 text-destructive"
              )}>
                {prediction.category} Performer
              </div>
            </div>

            {/* Confidence */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Model Confidence</p>
              <p className="text-2xl font-mono font-semibold text-primary">
                {prediction.confidence.toFixed(1)}%
              </p>
            </div>

            {/* Recommendations */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Recommendations
              </h4>
              {prediction.recommendations.map((rec, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50"
                >
                  {prediction.category === 'High' ? (
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                  )}
                  <span className="text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
              <Sparkles className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              Adjust the parameters and click<br />"Predict Performance" to see results
            </p>
          </div>
        )}
      </ChartCard>
    </div>
  );
}

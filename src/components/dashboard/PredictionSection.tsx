import { useState } from 'react';
import { Sparkles, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChartCard } from './ChartCard';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { apiService, PredictResponse } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface PredictionResult {
  score: number;
  category: 'Low' | 'Medium' | 'High';
  confidence: number;
  probabilities: {
    low: number;
    medium: number;
    high: number;
  };
  riskLevel: 'Low' | 'Medium' | 'High';
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
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePredict = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response: PredictResponse = await apiService.predict({
        satisfaction: satisfaction[0],
        training_hours: trainingHours[0],
        years_at_company: yearsAtCompany[0],
        work_hours: workHours[0],
        overtime: overtime[0],
        sick_days: sickDays[0],
        department: department,
      });

      setPrediction({
        score: Math.round(response.performance_score),
        category: response.risk_level,
        confidence: response.confidence,
        probabilities: response.probabilities,
        riskLevel: response.risk_level,
        recommendations: response.recommendations,
      });

      toast({
        title: "Prediction Complete",
        description: `Performance score: ${Math.round(response.performance_score)}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get prediction';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Prediction Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
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
        subtitle="ML model output"
        delay={100}
      >
        {error && !prediction ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
            <p className="text-destructive font-medium mb-2">Connection Error</p>
            <p className="text-muted-foreground text-sm max-w-xs">{error}</p>
          </div>
        ) : prediction ? (
          <div className="space-y-6 animate-fade-in">
            {/* Score Display */}
            <div className="text-center py-6">
              <div className="relative inline-flex">
                <div className={cn(
                  "w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center",
                  "bg-gradient-to-br",
                  prediction.category === 'High' ? "from-success/20 to-success/5 glow-primary" :
                  prediction.category === 'Medium' ? "from-warning/20 to-warning/5" :
                  "from-destructive/20 to-destructive/5"
                )}>
                  <div className="text-center">
                    <p className="text-4xl sm:text-5xl font-bold">{prediction.score}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Performance Score</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Level Badge */}
            <div className="flex justify-center gap-3 flex-wrap">
              <div className={cn(
                "px-4 py-1.5 rounded-full font-medium text-sm",
                prediction.riskLevel === 'High' ? "bg-destructive/20 text-destructive" :
                prediction.riskLevel === 'Medium' ? "bg-warning/20 text-warning" :
                "bg-success/20 text-success"
              )}>
                Risk: {prediction.riskLevel}
              </div>
              <div className={cn(
                "px-4 py-1.5 rounded-full font-medium text-sm",
                prediction.category === 'High' ? "bg-success/20 text-success" :
                prediction.category === 'Medium' ? "bg-warning/20 text-warning" :
                "bg-destructive/20 text-destructive"
              )}>
                {prediction.category} Performer
              </div>
            </div>

            {/* Confidence & Probabilities */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-secondary/30">
                <p className="text-xs text-muted-foreground">Confidence</p>
                <p className="text-xl font-mono font-semibold text-primary">
                  {prediction.confidence.toFixed(1)}%
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-secondary/30">
                <p className="text-xs text-muted-foreground">Probabilities</p>
                <div className="flex justify-center gap-2 text-xs mt-1">
                  <span className="text-destructive">L:{(prediction.probabilities.low * 100).toFixed(0)}%</span>
                  <span className="text-warning">M:{(prediction.probabilities.medium * 100).toFixed(0)}%</span>
                  <span className="text-success">H:{(prediction.probabilities.high * 100).toFixed(0)}%</span>
                </div>
              </div>
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

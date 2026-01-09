import { useState, useEffect } from 'react';
import { Sparkles, AlertCircle, CheckCircle2, AlertTriangle, Loader2, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChartCard } from './ChartCard';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { predictPerformance, healthCheck } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  // All dataset features
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState('Male');
  const [department, setDepartment] = useState('Engineering');
  const [educationLevel, setEducationLevel] = useState("Bachelor's");
  const [yearsAtCompany, setYearsAtCompany] = useState([5]);
  const [monthlySalary, setMonthlySalary] = useState(5000);
  const [workHoursPerWeek, setWorkHoursPerWeek] = useState([40]);
  const [projectsHandled, setProjectsHandled] = useState([5]);
  const [overtimeHours, setOvertimeHours] = useState([5]);
  const [sickDays, setSickDays] = useState([3]);
  const [remoteWorkFrequency, setRemoteWorkFrequency] = useState('Hybrid');
  const [teamSize, setTeamSize] = useState([8]);
  const [trainingHours, setTrainingHours] = useState([20]);
  const [promotions, setPromotions] = useState([1]);
  const [satisfactionScore, setSatisfactionScore] = useState([3.5]);
  const [jobTitle, setJobTitle] = useState('Software Engineer');
  
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const { toast } = useToast();

  // Health check on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await healthCheck();
        setApiStatus('online');
      } catch {
        setApiStatus('offline');
      }
    };
    checkHealth();
  }, []);

  const handlePredict = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const payload = {
        age: age,
        gender: gender,
        department: department,
        education: educationLevel,
        jobTitle: jobTitle,
        yearsAtCompany: yearsAtCompany[0],
        salary: monthlySalary,
        teamSize: teamSize[0],
        remote: remoteWorkFrequency,
        workHours: workHoursPerWeek[0],
        projects: projectsHandled[0],
        overtime: overtimeHours[0],
        sickDays: sickDays[0],
        training: trainingHours[0],
        promotions: promotions[0],
        satisfaction: satisfactionScore[0]
      };

      const response = await predictPerformance(payload);

      if (!response || response.success === false) {
        setError('Prediction unavailable. Please fill all fields correctly.');
        setPrediction(null);
        return;
      }

      setPrediction({
        score: Math.round(response.performance_score ?? 0),
        category: response.risk_level ?? 'Medium',
        confidence: response.confidence ?? 0,
        probabilities: {
          low: response.probabilities?.low ?? 0,
          medium: response.probabilities?.medium ?? 0,
          high: response.probabilities?.high ?? 0,
        },
        riskLevel: response.risk_level ?? 'Medium',
        recommendations: response.recommendations ?? [],
      });

      toast({
        title: "Prediction Complete",
        description: `Performance score: ${Math.round(response.performance_score ?? 0)}`,
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
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-5">
            {/* Row 1: Age, Gender */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Age</Label>
                <Input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Math.max(18, Math.min(65, parseInt(e.target.value) || 18)))}
                  min={18}
                  max={65}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Department, Education Level */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
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
              <div className="space-y-2">
                <Label>Education Level</Label>
                <Select value={educationLevel} onValueChange={setEducationLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High School">High School</SelectItem>
                    <SelectItem value="Associate's">Associate's</SelectItem>
                    <SelectItem value="Bachelor's">Bachelor's</SelectItem>
                    <SelectItem value="Master's">Master's</SelectItem>
                    <SelectItem value="PhD">PhD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 3: Job Title, Monthly Salary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Select value={jobTitle} onValueChange={setJobTitle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                    <SelectItem value="Data Analyst">Data Analyst</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Sales Rep">Sales Rep</SelectItem>
                    <SelectItem value="HR Specialist">HR Specialist</SelectItem>
                    <SelectItem value="Designer">Designer</SelectItem>
                    <SelectItem value="Accountant">Accountant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Monthly Salary ($)</Label>
                <Input
                  type="number"
                  value={monthlySalary}
                  onChange={(e) => setMonthlySalary(Math.max(1000, Math.min(50000, parseInt(e.target.value) || 1000)))}
                  min={1000}
                  max={50000}
                  className="font-mono"
                />
              </div>
            </div>

            {/* Row 4: Remote Work, Team Size */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Remote Work Frequency</Label>
                <Select value={remoteWorkFrequency} onValueChange={setRemoteWorkFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Never">Never (On-site)</SelectItem>
                    <SelectItem value="Rarely">Rarely</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                    <SelectItem value="Mostly">Mostly Remote</SelectItem>
                    <SelectItem value="Always">Fully Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Team Size</Label>
                  <span className="text-sm font-mono text-primary">{teamSize[0]}</span>
                </div>
                <Slider
                  value={teamSize}
                  onValueChange={setTeamSize}
                  min={1}
                  max={50}
                  step={1}
                />
              </div>
            </div>

            {/* Years at Company */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Years at Company</Label>
                <span className="text-sm font-mono text-primary">{yearsAtCompany[0]}</span>
              </div>
              <Slider
                value={yearsAtCompany}
                onValueChange={setYearsAtCompany}
                min={0}
                max={30}
                step={1}
              />
            </div>

            {/* Work Hours Per Week */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Work Hours/Week</Label>
                <span className="text-sm font-mono text-primary">{workHoursPerWeek[0]}h</span>
              </div>
              <Slider
                value={workHoursPerWeek}
                onValueChange={setWorkHoursPerWeek}
                min={20}
                max={60}
                step={1}
              />
            </div>

            {/* Projects Handled */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Projects Handled</Label>
                <span className="text-sm font-mono text-primary">{projectsHandled[0]}</span>
              </div>
              <Slider
                value={projectsHandled}
                onValueChange={setProjectsHandled}
                min={0}
                max={20}
                step={1}
              />
            </div>

            {/* Overtime Hours */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Overtime Hours/Week</Label>
                <span className="text-sm font-mono text-primary">{overtimeHours[0]}h</span>
              </div>
              <Slider
                value={overtimeHours}
                onValueChange={setOvertimeHours}
                min={0}
                max={30}
                step={1}
              />
            </div>

            {/* Sick Days */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Sick Days (Annual)</Label>
                <span className="text-sm font-mono text-primary">{sickDays[0]}</span>
              </div>
              <Slider
                value={sickDays}
                onValueChange={setSickDays}
                min={0}
                max={30}
                step={1}
              />
            </div>

            {/* Training Hours */}
            <div className="space-y-2">
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

            {/* Promotions */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Promotions</Label>
                <span className="text-sm font-mono text-primary">{promotions[0]}</span>
              </div>
              <Slider
                value={promotions}
                onValueChange={setPromotions}
                min={0}
                max={5}
                step={1}
              />
            </div>

            {/* Employee Satisfaction Score */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Satisfaction Score</Label>
                <span className="text-sm font-mono text-primary">{satisfactionScore[0].toFixed(1)}</span>
              </div>
              <Slider
                value={satisfactionScore}
                onValueChange={setSatisfactionScore}
                min={1}
                max={5}
                step={0.1}
              />
            </div>

            {/* API Status Indicator */}
            <div className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
              apiStatus === 'online' ? "bg-success/10 text-success" :
              apiStatus === 'offline' ? "bg-destructive/10 text-destructive" :
              "bg-muted/50 text-muted-foreground"
            )}>
              {apiStatus === 'checking' && <Loader2 className="w-4 h-4 animate-spin" />}
              {apiStatus === 'online' && <Wifi className="w-4 h-4" />}
              {apiStatus === 'offline' && <WifiOff className="w-4 h-4" />}
              <span>
                {apiStatus === 'checking' ? 'Checking API...' :
                 apiStatus === 'online' ? 'ML Backend Online' :
                 'ML Backend Offline'}
              </span>
            </div>

            <Button 
              onClick={handlePredict} 
              className="w-full"
              variant="glow"
              disabled={isLoading || apiStatus === 'offline'}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
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
        </ScrollArea>
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
                  {Number(prediction.confidence || 0).toFixed(2)}%
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-secondary/30">
                <p className="text-xs text-muted-foreground">Probabilities</p>
                <div className="flex justify-center gap-2 text-xs mt-1">
                  <span className="text-destructive">L:{((prediction.probabilities?.low ?? 0) * 100).toFixed(0)}%</span>
                  <span className="text-warning">M:{((prediction.probabilities?.medium ?? 0) * 100).toFixed(0)}%</span>
                  <span className="text-success">H:{((prediction.probabilities?.high ?? 0) * 100).toFixed(0)}%</span>
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

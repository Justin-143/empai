import { ChartCard } from './ChartCard';
import { modelMetrics } from '@/data/mockData';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Percent, TrendingUp } from 'lucide-react';

export function ModelsSection() {
  const regressionModels = modelMetrics.filter(m => m.type === 'regression');
  const classificationModels = modelMetrics.filter(m => m.type === 'classification');

  const radarData = classificationModels.map(m => ({
    model: m.name,
    Accuracy: (m.accuracy || 0) * 100,
    Precision: (m.precision || 0) * 100,
    Recall: (m.recall || 0) * 100,
    'F1 Score': (m.f1Score || 0) * 100,
  }));

  return (
    <div className="space-y-6">
      {/* Best Model Highlight */}
      <div className="glass-card p-6 glow-primary animate-slide-up">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Trophy className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold">XGBoost</h2>
              <Badge variant="default" className="bg-primary/20 text-primary border-0">Best Performer</Badge>
            </div>
            <p className="text-muted-foreground">
              Top performing model with R² = 0.8234 (Regression) and 85.67% Accuracy (Classification)
            </p>
          </div>
          <div className="hidden md:flex gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">82.34%</p>
              <p className="text-sm text-muted-foreground">R² Score</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-accent">85.67%</p>
              <p className="text-sm text-muted-foreground">Accuracy</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regression Models Comparison */}
        <ChartCard 
          title="Regression Models" 
          subtitle="R² Score comparison"
          delay={100}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regressionModels} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 16%)" />
              <XAxis 
                type="number" 
                stroke="hsl(215, 20%, 55%)" 
                fontSize={12} 
                domain={[0, 1]}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              />
              <YAxis dataKey="name" type="category" stroke="hsl(215, 20%, 55%)" fontSize={12} width={120} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222, 47%, 8%)', 
                  border: '1px solid hsl(222, 47%, 16%)',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [`${(value * 100).toFixed(2)}%`, 'R² Score']}
              />
              <Bar 
                dataKey="r2Score" 
                fill="hsl(187, 85%, 53%)" 
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Classification Models Radar */}
        <ChartCard 
          title="Classification Metrics" 
          subtitle="Multi-metric comparison"
          delay={200}
        >
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(222, 47%, 16%)" />
              <PolarAngleAxis dataKey="model" stroke="hsl(215, 20%, 55%)" fontSize={11} />
              <PolarRadiusAxis stroke="hsl(215, 20%, 55%)" fontSize={10} domain={[0, 100]} />
              <Radar 
                name="Accuracy" 
                dataKey="Accuracy" 
                stroke="hsl(187, 85%, 53%)" 
                fill="hsl(187, 85%, 53%)" 
                fillOpacity={0.2} 
              />
              <Radar 
                name="F1 Score" 
                dataKey="F1 Score" 
                stroke="hsl(260, 65%, 60%)" 
                fill="hsl(260, 65%, 60%)" 
                fillOpacity={0.2} 
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {classificationModels.map((model, index) => (
          <div 
            key={model.name}
            className={cn(
              "glass-card-hover p-5 animate-slide-up",
              index === 0 && "ring-1 ring-primary/50"
            )}
            style={{ animationDelay: `${300 + index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{model.name}</h3>
              {index === 0 && (
                <Badge variant="default" className="bg-primary text-primary-foreground text-xs">
                  Best
                </Badge>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Target className="w-4 h-4" /> Accuracy
                </span>
                <span className="font-mono font-medium">{((model.accuracy || 0) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Percent className="w-4 h-4" /> Precision
                </span>
                <span className="font-mono font-medium">{((model.precision || 0) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> F1 Score
                </span>
                <span className="font-mono font-medium">{((model.f1Score || 0) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

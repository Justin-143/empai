import { Users, TrendingUp, Brain, Target, Activity, Clock, Upload } from 'lucide-react';
import { StatCard } from './StatCard';
import { ChartCard } from './ChartCard';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { performanceTrends, departmentStats, performanceDistribution } from '@/data/mockData';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { useDataset } from '@/contexts/DatasetContext';
import { Button } from '@/components/ui/button';

const COLORS = ['hsl(187, 85%, 53%)', 'hsl(260, 65%, 60%)', 'hsl(142, 76%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(0, 72%, 51%)'];

export function OverviewSection() {
  const { analysis, datasetName, isAnalyzing } = useDataset();

  // Use analysis data if available, otherwise use mock data
  const hasAnalysis = !!analysis;

  const totalEmployees = hasAnalysis ? analysis.summary.total_employees : 398;
  const avgPerformance = hasAnalysis ? analysis.summary.avg_performance : 82.34;
  const avgSatisfaction = hasAnalysis ? analysis.summary.avg_satisfaction : 4.2;
  
  const deptStats = hasAnalysis 
    ? analysis.department_stats.map(d => ({
        department: d.department,
        avgPerformance: d.avg_performance,
        employeeCount: d.count
      }))
    : departmentStats;

  const perfDistribution = hasAnalysis 
    ? analysis.performance_distribution 
    : performanceDistribution;

  const riskDistribution = hasAnalysis 
    ? [
        { name: 'Low Risk', value: analysis.summary.risk_distribution.low, color: 'hsl(142, 76%, 45%)' },
        { name: 'Medium Risk', value: analysis.summary.risk_distribution.medium, color: 'hsl(38, 92%, 50%)' },
        { name: 'High Risk', value: analysis.summary.risk_distribution.high, color: 'hsl(0, 72%, 51%)' },
      ]
    : null;

  const featureImportance = hasAnalysis
    ? analysis.feature_correlations.slice(0, 5).map((f, idx) => ({
        name: f.feature.replace(/_/g, ' '),
        value: Math.abs(f.correlation * 100),
        color: ['bg-primary', 'bg-accent', 'bg-success', 'bg-warning', 'bg-chart-5'][idx]
      }))
    : [
        { name: 'Employee Satisfaction', value: 28.5, color: 'bg-primary' },
        { name: 'Training Hours', value: 19.8, color: 'bg-accent' },
        { name: 'Years at Company', value: 15.6, color: 'bg-success' },
        { name: 'Work Hours/Week', value: 12.4, color: 'bg-warning' },
        { name: 'Overtime Hours', value: 9.8, color: 'bg-chart-5' },
      ];

  const trends = hasAnalysis && analysis.trends
    ? analysis.trends.monthly_performance.map(t => ({
        month: t.month,
        avgPerformance: t.performance,
        predictions: t.performance * (0.95 + Math.random() * 0.1)
      }))
    : performanceTrends;

  return (
    <div className="space-y-6">
      {/* Dataset Status Banner */}
      {hasAnalysis && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Upload className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-primary">Dataset Loaded: {datasetName}</p>
            <p className="text-sm text-muted-foreground">
              Showing insights from {totalEmployees} employees across {analysis.summary.departments.length} departments
            </p>
          </div>
        </div>
      )}

      {isAnalyzing && (
        <div className="bg-muted/30 border border-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center animate-pulse">
            <Brain className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Analyzing Dataset...</p>
            <p className="text-sm text-muted-foreground">
              Please wait while the ML backend processes your data
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Employees"
          value={totalEmployees.toString()}
          subtitle="Active workforce"
          icon={Users}
          trend={{ value: 5.2, isPositive: true }}
          variant="primary"
          delay={0}
        />
        <StatCard
          title="Avg Performance"
          value={`${avgPerformance.toFixed(2)}%`}
          subtitle={hasAnalysis ? "From dataset analysis" : "R² Score: 0.8234"}
          icon={Target}
          trend={{ value: 3.8, isPositive: true }}
          variant="success"
          delay={100}
        />
        <StatCard
          title="Avg Satisfaction"
          value={avgSatisfaction.toFixed(1)}
          subtitle="Employee satisfaction score"
          icon={Brain}
          trend={{ value: 2.1, isPositive: true }}
          variant="accent"
          delay={200}
        />
        <StatCard
          title="Departments"
          value={hasAnalysis ? analysis.summary.departments.length.toString() : "5"}
          subtitle="Active departments"
          icon={Clock}
          trend={{ value: 8.5, isPositive: true }}
          variant="warning"
          delay={300}
        />
      </div>

      {/* Risk Distribution (only when dataset is loaded) */}
      {riskDistribution && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {riskDistribution.map((risk, idx) => (
            <div 
              key={risk.name}
              className="bg-card border border-border rounded-xl p-4 flex items-center gap-4"
            >
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${risk.color}20` }}
              >
                <span className="text-xl font-bold" style={{ color: risk.color }}>
                  {risk.value}
                </span>
              </div>
              <div>
                <p className="font-medium">{risk.name}</p>
                <p className="text-sm text-muted-foreground">
                  {((risk.value / totalEmployees) * 100).toFixed(1)}% of workforce
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard 
          title="Performance Trends" 
          subtitle={hasAnalysis ? "Monthly performance from dataset" : "Actual vs Predicted performance over time"}
          delay={400}
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trends}>
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(187, 85%, 53%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(187, 85%, 53%)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(260, 65%, 60%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(260, 65%, 60%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 16%)" />
              <XAxis dataKey="month" stroke="hsl(215, 20%, 55%)" fontSize={12} />
              <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} domain={[65, 90]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222, 47%, 8%)', 
                  border: '1px solid hsl(222, 47%, 16%)',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="avgPerformance" 
                stroke="hsl(187, 85%, 53%)" 
                fill="url(#colorActual)" 
                strokeWidth={2}
                name="Actual"
              />
              <Area 
                type="monotone" 
                dataKey="predictions" 
                stroke="hsl(260, 65%, 60%)" 
                fill="url(#colorPredicted)" 
                strokeWidth={2}
                name="Predicted"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard 
          title="Department Performance" 
          subtitle="Average performance by department"
          delay={500}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deptStats} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 16%)" />
              <XAxis type="number" stroke="hsl(215, 20%, 55%)" fontSize={12} domain={[0, 100]} />
              <YAxis dataKey="department" type="category" stroke="hsl(215, 20%, 55%)" fontSize={12} width={80} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222, 47%, 8%)', 
                  border: '1px solid hsl(222, 47%, 16%)',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="avgPerformance" 
                fill="hsl(187, 85%, 53%)" 
                radius={[0, 4, 4, 0]}
                name="Avg Performance"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard 
          title="Performance Distribution" 
          subtitle="Employee score ranges"
          delay={600}
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={perfDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 16%)" />
              <XAxis dataKey="range" stroke="hsl(215, 20%, 55%)" fontSize={12} />
              <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222, 47%, 8%)', 
                  border: '1px solid hsl(222, 47%, 16%)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" fill="hsl(260, 65%, 60%)" radius={[4, 4, 0, 0]} name="Employees" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard 
          title={hasAnalysis ? "Feature Correlations" : "Top Performance Drivers"}
          subtitle={hasAnalysis ? "Correlation with performance" : "Feature importance from XGBoost"}
          className="lg:col-span-2"
          delay={700}
        >
          <div className="space-y-4">
            {featureImportance.map((item, index) => (
              <div key={item.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-mono font-medium">
                    <AnimatedNumber 
                      value={item.value} 
                      decimals={1}
                      suffix="%"
                      delay={800 + index * 100}
                      duration={1500}
                    />
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                    style={{ 
                      width: `${Math.min(item.value * 3, 100)}%`,
                      animationDelay: `${800 + index * 100}ms`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* No Dataset Prompt */}
      {!hasAnalysis && !isAnalyzing && (
        <div className="bg-muted/20 border border-dashed border-border rounded-xl p-8 text-center">
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Dataset Uploaded</h3>
          <p className="text-muted-foreground mb-4">
            Upload your employee dataset to see real insights and ML-powered analytics
          </p>
          <p className="text-sm text-muted-foreground">
            Currently showing sample data. Go to "Dataset Upload" section to load your data.
          </p>
        </div>
      )}
    </div>
  );
}

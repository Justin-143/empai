import { Users, TrendingUp, Brain, Target, Activity, Clock } from 'lucide-react';
import { StatCard } from './StatCard';
import { ChartCard } from './ChartCard';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { performanceTrends, departmentStats, performanceDistribution } from '@/data/mockData';

const COLORS = ['hsl(187, 85%, 53%)', 'hsl(260, 65%, 60%)', 'hsl(142, 76%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(0, 72%, 51%)'];

export function OverviewSection() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Employees"
          value="398"
          subtitle="Active workforce"
          icon={Users}
          trend={{ value: 5.2, isPositive: true }}
          variant="primary"
          delay={0}
        />
        <StatCard
          title="Avg Performance"
          value="82.34%"
          subtitle="R² Score: 0.8234"
          icon={Target}
          trend={{ value: 3.8, isPositive: true }}
          variant="success"
          delay={100}
        />
        <StatCard
          title="Model Accuracy"
          value="85.67%"
          subtitle="XGBoost Classification"
          icon={Brain}
          trend={{ value: 2.1, isPositive: true }}
          variant="accent"
          delay={200}
        />
        <StatCard
          title="Avg Training Hours"
          value="42.5h"
          subtitle="Per employee/year"
          icon={Clock}
          trend={{ value: 8.5, isPositive: true }}
          variant="warning"
          delay={300}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard 
          title="Performance Trends" 
          subtitle="Actual vs Predicted performance over time"
          delay={400}
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceTrends}>
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
            <BarChart data={departmentStats} layout="vertical">
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
            <BarChart data={performanceDistribution}>
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
          title="Top Performance Drivers" 
          subtitle="Feature importance from XGBoost"
          className="lg:col-span-2"
          delay={700}
        >
          <div className="space-y-4">
            {[
              { name: 'Employee Satisfaction', value: 28.5, color: 'bg-primary' },
              { name: 'Training Hours', value: 19.8, color: 'bg-accent' },
              { name: 'Years at Company', value: 15.6, color: 'bg-success' },
              { name: 'Work Hours/Week', value: 12.4, color: 'bg-warning' },
              { name: 'Overtime Hours', value: 9.8, color: 'bg-chart-5' },
            ].map((item, index) => (
              <div key={item.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-mono font-medium">{item.value}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                    style={{ 
                      width: `${item.value * 3}%`,
                      animationDelay: `${800 + index * 100}ms`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

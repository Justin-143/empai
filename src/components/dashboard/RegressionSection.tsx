import { useMemo } from 'react';
import { ChartCard } from './ChartCard';
import { regressionData, satisfactionVsPerformance as mockSatVsPerf } from '@/data/mockData';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, Legend
} from 'recharts';
import { StatCard } from './StatCard';
import { TrendingUp, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { useDataset } from '@/contexts/DatasetContext';
import { useFilters } from '@/contexts/FilterContext';

const DEPT_COLORS: Record<string, string> = {
  'Engineering': 'hsl(187, 85%, 53%)',
  'Sales': 'hsl(260, 65%, 60%)',
  'HR': 'hsl(142, 76%, 45%)',
  'Marketing': 'hsl(38, 92%, 50%)',
  'Finance': 'hsl(0, 72%, 51%)',
  'Operations': 'hsl(280, 65%, 60%)',
};

export function RegressionSection() {
  const { employees: allEmployees, hasUploadedData } = useDataset();
  const { selectedDepartments } = useFilters();

  // Filter employees by selected departments
  const employees = useMemo(() => {
    if (selectedDepartments.length === 0) return allEmployees;
    return allEmployees.filter(e => selectedDepartments.includes(e.department));
  }, [allEmployees, selectedDepartments]);

  // Generate satisfaction vs performance data from employees
  const satisfactionVsPerformance = useMemo(() => {
    if (!hasUploadedData || employees.length === 0) {
      // Filter mock data by selected departments
      if (selectedDepartments.length === 0) return mockSatVsPerf;
      return mockSatVsPerf.filter(d => selectedDepartments.includes(d.department));
    }
    
    return employees.map(e => ({
      satisfaction: e.satisfactionScore,
      performance: e.performanceScore,
      department: e.department
    }));
  }, [employees, hasUploadedData, selectedDepartments]);

  // Get unique departments from the data
  const departments = useMemo(() => {
    return [...new Set(satisfactionVsPerformance.map(d => d.department))];
  }, [satisfactionVsPerformance]);

  // Calculate residuals
  const residuals = regressionData.map(d => ({
    index: d.index,
    residual: d.actual - d.predicted
  }));

  // Calculate metrics
  const mse = regressionData.reduce((sum, d) => sum + Math.pow(d.actual - d.predicted, 2), 0) / regressionData.length;
  const rmse = Math.sqrt(mse);
  const mae = regressionData.reduce((sum, d) => sum + Math.abs(d.actual - d.predicted), 0) / regressionData.length;

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="R² Score"
          value="0.8234"
          subtitle="Variance explained"
          icon={Target}
          variant="primary"
          delay={0}
        />
        <StatCard
          title="RMSE"
          value={rmse.toFixed(2)}
          subtitle="Root mean squared error"
          icon={AlertTriangle}
          variant="warning"
          delay={100}
        />
        <StatCard
          title="MAE"
          value={mae.toFixed(2)}
          subtitle="Mean absolute error"
          icon={TrendingUp}
          variant="accent"
          delay={200}
        />
        <StatCard
          title="Predictions"
          value={employees.length > 0 ? employees.length.toString() : "398"}
          subtitle="Total samples"
          icon={CheckCircle}
          variant="success"
          delay={300}
        />
      </div>

      {/* Charts - Vertical Stack */}
      <div className="space-y-6">
        {/* Actual vs Predicted */}
        <ChartCard 
          title="Actual vs Predicted" 
          subtitle="Performance score predictions"
          delay={400}
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={regressionData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="index" 
                className="fill-muted-foreground" 
                fontSize={12}
                label={{ value: 'Sample Index', position: 'insideBottom', offset: -5, className: 'fill-muted-foreground', fontSize: 11 }}
              />
              <YAxis 
                className="fill-muted-foreground" 
                fontSize={12} 
                domain={[40, 100]}
                label={{ value: 'Performance Score', angle: -90, position: 'insideLeft', className: 'fill-muted-foreground', fontSize: 11 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="hsl(187, 85%, 53%)" 
                strokeWidth={2}
                dot={false}
                name="Actual"
              />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="hsl(260, 65%, 60%)" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Predicted"
              />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Residual Plot */}
        <ChartCard 
          title="Residual Analysis" 
          subtitle="Prediction errors distribution"
          delay={500}
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={residuals}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="index" 
                className="fill-muted-foreground" 
                fontSize={12}
                label={{ value: 'Sample Index', position: 'insideBottom', offset: -5, className: 'fill-muted-foreground', fontSize: 11 }}
              />
              <YAxis 
                className="fill-muted-foreground" 
                fontSize={12} 
                domain={[-10, 10]}
                label={{ value: 'Residual Error', angle: -90, position: 'insideLeft', className: 'fill-muted-foreground', fontSize: 11 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
              />
              {/* Zero line */}
              <Line 
                type="monotone" 
                data={[{ index: 1, residual: 0 }, { index: 30, residual: 0 }]}
                dataKey="residual"
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="3 3"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="residual" 
                stroke="hsl(142, 76%, 45%)" 
                strokeWidth={2}
                dot={{ fill: 'hsl(142, 76%, 45%)', r: 3 }}
                name="Residual"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Scatter Plot */}
      <ChartCard 
        title="Satisfaction vs Performance" 
        subtitle={`Correlation analysis${selectedDepartments.length > 0 ? ` (${selectedDepartments.length} departments selected)` : ' by department'}`}
        delay={600}
      >
        <ResponsiveContainer width="100%" height={350}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 50, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="satisfaction" 
              className="fill-muted-foreground" 
              fontSize={11}
              name="Satisfaction"
              domain={[2, 5]}
              tickMargin={5}
              label={{ value: 'Satisfaction Score', position: 'insideBottom', offset: -10, className: 'fill-muted-foreground', fontSize: 11 }}
            />
            <YAxis 
              dataKey="performance" 
              className="fill-muted-foreground" 
              fontSize={11}
              name="Performance"
              domain={[30, 100]}
              tickMargin={5}
              width={45}
              label={{ value: 'Performance Score (%)', angle: -90, position: 'insideLeft', className: 'fill-muted-foreground', fontSize: 11 }}
            />
            <ZAxis range={[40, 150]} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))'
              }}
              formatter={(value: number, name: string) => [value.toFixed(2), name]}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
            />
            {departments.map((dept) => (
              <Scatter 
                key={dept}
                name={dept} 
                data={satisfactionVsPerformance.filter(d => d.department === dept)} 
                fill={DEPT_COLORS[dept] || 'hsl(var(--primary))'}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

import { ChartCard } from './ChartCard';
import { regressionData, satisfactionVsPerformance } from '@/data/mockData';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, Legend
} from 'recharts';
import { StatCard } from './StatCard';
import { TrendingUp, Target, AlertTriangle, CheckCircle } from 'lucide-react';

export function RegressionSection() {
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          value="398"
          subtitle="Total samples"
          icon={CheckCircle}
          variant="success"
          delay={300}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actual vs Predicted */}
        <ChartCard 
          title="Actual vs Predicted" 
          subtitle="Performance score predictions"
          delay={400}
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={regressionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 16%)" />
              <XAxis dataKey="index" stroke="hsl(215, 20%, 55%)" fontSize={12} />
              <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} domain={[40, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222, 47%, 8%)', 
                  border: '1px solid hsl(222, 47%, 16%)',
                  borderRadius: '8px'
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
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 16%)" />
              <XAxis dataKey="index" stroke="hsl(215, 20%, 55%)" fontSize={12} />
              <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} domain={[-10, 10]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(222, 47%, 8%)', 
                  border: '1px solid hsl(222, 47%, 16%)',
                  borderRadius: '8px'
                }}
              />
              {/* Zero line */}
              <Line 
                type="monotone" 
                data={[{ index: 1, residual: 0 }, { index: 30, residual: 0 }]}
                dataKey="residual"
                stroke="hsl(215, 20%, 55%)"
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
        subtitle="Correlation analysis by department"
        delay={600}
      >
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 16%)" />
            <XAxis 
              dataKey="satisfaction" 
              stroke="hsl(215, 20%, 55%)" 
              fontSize={12}
              name="Satisfaction"
              domain={[2, 5]}
              label={{ value: 'Satisfaction Score', position: 'bottom', fill: 'hsl(215, 20%, 55%)' }}
            />
            <YAxis 
              dataKey="performance" 
              stroke="hsl(215, 20%, 55%)" 
              fontSize={12}
              name="Performance"
              domain={[30, 100]}
              label={{ value: 'Performance Score', angle: -90, position: 'insideLeft', fill: 'hsl(215, 20%, 55%)' }}
            />
            <ZAxis range={[50, 200]} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(222, 47%, 8%)', 
                border: '1px solid hsl(222, 47%, 16%)',
                borderRadius: '8px'
              }}
              formatter={(value: number, name: string) => [value.toFixed(2), name]}
            />
            <Legend />
            <Scatter 
              name="Engineering" 
              data={satisfactionVsPerformance.filter(d => d.department === 'Engineering')} 
              fill="hsl(187, 85%, 53%)"
            />
            <Scatter 
              name="Sales" 
              data={satisfactionVsPerformance.filter(d => d.department === 'Sales')} 
              fill="hsl(260, 65%, 60%)"
            />
            <Scatter 
              name="HR" 
              data={satisfactionVsPerformance.filter(d => d.department === 'HR')} 
              fill="hsl(142, 76%, 45%)"
            />
            <Scatter 
              name="Marketing" 
              data={satisfactionVsPerformance.filter(d => d.department === 'Marketing')} 
              fill="hsl(38, 92%, 50%)"
            />
            <Scatter 
              name="Finance" 
              data={satisfactionVsPerformance.filter(d => d.department === 'Finance')} 
              fill="hsl(0, 72%, 51%)"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

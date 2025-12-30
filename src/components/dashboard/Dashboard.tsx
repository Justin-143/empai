import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { OverviewSection } from './OverviewSection';
import { PredictionSection } from './PredictionSection';
import { AnalyticsSection } from './AnalyticsSection';
import { ModelsSection } from './ModelsSection';
import { RegressionSection } from './RegressionSection';
import { DepartmentsSection } from './DepartmentsSection';
import { EmployeesSection } from './EmployeesSection';
import { cn } from '@/lib/utils';

const sectionTitles: Record<string, { title: string; subtitle: string }> = {
  overview: { title: 'Dashboard Overview', subtitle: 'Employee performance insights at a glance' },
  prediction: { title: 'Performance Prediction', subtitle: 'ML-powered employee performance forecasting' },
  analytics: { title: 'Productivity Analytics', subtitle: 'Deep dive into performance drivers' },
  models: { title: 'ML Models', subtitle: 'Compare model performance metrics' },
  regression: { title: 'Regression Analysis', subtitle: 'Actual vs predicted performance analysis' },
  departments: { title: 'Department Analytics', subtitle: 'Performance breakdown by department' },
  employees: { title: 'Employee Directory', subtitle: 'View and manage employee data' },
};

export function Dashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const currentSection = sectionTitles[activeSection];

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection />;
      case 'prediction':
        return <PredictionSection />;
      case 'analytics':
        return <AnalyticsSection />;
      case 'models':
        return <ModelsSection />;
      case 'regression':
        return <RegressionSection />;
      case 'departments':
        return <DepartmentsSection />;
      case 'employees':
        return <EmployeesSection />;
      default:
        return <OverviewSection />;
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <main className="flex-1 ml-64 transition-all duration-300">
        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border">
          <div className="px-8 py-6">
            <h1 className="text-2xl font-bold">{currentSection.title}</h1>
            <p className="text-muted-foreground mt-1">{currentSection.subtitle}</p>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {renderSection()}
        </div>
      </main>
    </div>
  );
}

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { OverviewSection } from './OverviewSection';
import { PredictionSection } from './PredictionSection';
import { AnalyticsSection } from './AnalyticsSection';
import { ModelsSection } from './ModelsSection';
import { RegressionSection } from './RegressionSection';
import { DepartmentsSection } from './DepartmentsSection';
import { EmployeesSection } from './EmployeesSection';
import { WhatIfSection } from './WhatIfSection';
import { ProductivitySection } from './ProductivitySection';
import { SettingsPanel } from './SettingsPanel';
import { DatasetUpload } from './DatasetUpload';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const sectionTitles: Record<string, { title: string; subtitle: string }> = {
  overview: { title: 'Dashboard Overview', subtitle: 'Employee performance insights at a glance' },
  upload: { title: 'Dataset Upload', subtitle: 'Upload and preprocess your employee data' },
  prediction: { title: 'Performance Prediction', subtitle: 'ML-powered employee performance forecasting' },
  analytics: { title: 'Productivity Analytics', subtitle: 'Deep dive into performance drivers' },
  models: { title: 'ML Models', subtitle: 'Compare model performance and run predictions' },
  regression: { title: 'Regression Analysis', subtitle: 'Actual vs predicted performance analysis' },
  departments: { title: 'Department Analytics', subtitle: 'Performance breakdown by department' },
  employees: { title: 'Employee Directory', subtitle: 'View and manage employee data' },
  whatif: { title: 'What-If Scenarios', subtitle: 'Simulate changes and predict performance impact' },
  productivity: { title: 'Productivity Trends', subtitle: 'Team performance and productivity over time' },
};

export function Dashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentSection = sectionTitles[activeSection];

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection />;
      case 'upload':
        return <DatasetUpload />;
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
      case 'whatif':
        return <WhatIfSection />;
      case 'productivity':
        return <ProductivitySection />;
      default:
        return <OverviewSection />;
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={handleSectionChange}
        onSettingsClick={() => setSettingsOpen(true)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      
      <main className={cn(
        "flex-1 transition-all duration-300",
        "ml-0 lg:ml-64"
      )}>
        {/* Header */}
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/80 border-b border-border">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 ml-10 lg:ml-0">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">{currentSection.title}</h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">{currentSection.subtitle}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {renderSection()}
        </div>
      </main>

      {/* Settings Panel */}
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

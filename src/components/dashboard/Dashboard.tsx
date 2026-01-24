import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { DepartmentFilter } from './DepartmentFilter';
import { Menu, X, Wifi, WifiOff, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { healthCheck } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

const sections = [
  { id: 'overview', title: 'Dashboard Overview', subtitle: 'Employee performance insights at a glance' },
  { id: 'upload', title: 'Dataset Upload', subtitle: 'Upload and preprocess your employee data' },
  { id: 'prediction', title: 'Performance Prediction', subtitle: 'ML-powered employee performance forecasting' },
  { id: 'whatif', title: 'What-If Scenarios', subtitle: 'Simulate changes and predict performance impact' },
  { id: 'productivity', title: 'Productivity Trends', subtitle: 'Team performance and productivity over time' },
  { id: 'analytics', title: 'Productivity Analytics', subtitle: 'Deep dive into performance drivers' },
  { id: 'models', title: 'ML Models', subtitle: 'Compare model performance and run predictions' },
  { id: 'regression', title: 'Regression Analysis', subtitle: 'Actual vs predicted performance analysis' },
  { id: 'departments', title: 'Department Analytics', subtitle: 'Performance breakdown by department' },
  { id: 'employees', title: 'Employee Directory', subtitle: 'View and manage employee data' },
];

export function Dashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isScrollingFromClick = useRef(false);

  const currentSection = useMemo(() => 
    sections.find(s => s.id === activeSection) || sections[0], 
    [activeSection]
  );

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Check backend health on mount and periodically
  useEffect(() => {
    const checkHealth = async () => {
      const result = await healthCheck();
      setBackendOnline(result.online);
    };
    
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle scroll to update active section
  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const handleScroll = () => {
      if (isScrollingFromClick.current) return;

      const scrollTop = main.scrollTop;
      const headerOffset = 120; // Account for sticky header
      
      let currentActive = 'overview';
      
      for (const [id, ref] of sectionRefs.current) {
        if (ref) {
          const offsetTop = ref.offsetTop - headerOffset;
          if (scrollTop >= offsetTop - 100) {
            currentActive = id;
          }
        }
      }
      
      setActiveSection(currentActive);
    };

    main.addEventListener('scroll', handleScroll, { passive: true });
    return () => main.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
    
    const ref = sectionRefs.current.get(section);
    if (ref && mainRef.current) {
      isScrollingFromClick.current = true;
      const headerOffset = 100;
      const offsetTop = ref.offsetTop - headerOffset;
      
      mainRef.current.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      
      // Reset the flag after scroll completes
      setTimeout(() => {
        isScrollingFromClick.current = false;
      }, 1000);
    }
  };

  const setSectionRef = (id: string) => (el: HTMLDivElement | null) => {
    if (el) {
      sectionRefs.current.set(id, el);
    }
  };

  return (
    <div className="min-h-screen flex w-full particle-bg">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden hover:scale-110 transition-transform"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-md z-40 lg:hidden animate-fade-in"
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
      
      <main 
        ref={mainRef}
        className={cn(
          "flex-1 transition-all duration-500 overflow-y-auto h-screen",
          "ml-0 lg:ml-64"
        )}
      >
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border/50">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 ml-10 lg:ml-0">
              <div className="animate-fade-in">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">{currentSection.title}</h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">{currentSection.subtitle}</p>
              </div>
              <div className="flex items-center gap-3">
                <DepartmentFilter />
                <Badge 
                  variant="outline" 
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-xs font-medium transition-all duration-300 hover-lift",
                    backendOnline === null 
                      ? "border-muted-foreground/30 text-muted-foreground"
                      : backendOnline 
                        ? "border-green-500/30 text-green-600 dark:text-green-400 bg-green-500/10 shadow-lg shadow-green-500/10" 
                        : "border-destructive/30 text-destructive bg-destructive/10 shadow-lg shadow-destructive/10"
                  )}
                >
                  {backendOnline === null ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
                      Checking...
                    </>
                  ) : backendOnline ? (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <Wifi className="w-3 h-3" />
                      ML Backend Online
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 animate-pulse" />
                      ML Backend Offline
                    </>
                  )}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Continuous Scrolling Content */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-16">
          {/* Overview Section */}
          <section ref={setSectionRef('overview')} id="overview" className="scroll-mt-28">
            <SectionHeader title="Dashboard Overview" subtitle="Employee performance insights at a glance" />
            <OverviewSection />
          </section>

          {/* Dataset Upload Section */}
          <section ref={setSectionRef('upload')} id="upload" className="scroll-mt-28">
            <SectionHeader title="Dataset Upload" subtitle="Upload and preprocess your employee data" />
            <DatasetUpload />
          </section>

          {/* Prediction Section */}
          <section ref={setSectionRef('prediction')} id="prediction" className="scroll-mt-28">
            <SectionHeader title="Performance Prediction" subtitle="ML-powered employee performance forecasting" />
            <PredictionSection />
          </section>

          {/* What-If Section */}
          <section ref={setSectionRef('whatif')} id="whatif" className="scroll-mt-28">
            <SectionHeader title="What-If Scenarios" subtitle="Simulate changes and predict performance impact" />
            <WhatIfSection />
          </section>

          {/* Productivity Section */}
          <section ref={setSectionRef('productivity')} id="productivity" className="scroll-mt-28">
            <SectionHeader title="Productivity Trends" subtitle="Team performance and productivity over time" />
            <ProductivitySection />
          </section>

          {/* Analytics Section */}
          <section ref={setSectionRef('analytics')} id="analytics" className="scroll-mt-28">
            <SectionHeader title="Productivity Analytics" subtitle="Deep dive into performance drivers" />
            <AnalyticsSection />
          </section>

          {/* Models Section */}
          <section ref={setSectionRef('models')} id="models" className="scroll-mt-28">
            <SectionHeader title="ML Models" subtitle="Compare model performance and run predictions" />
            <ModelsSection />
          </section>

          {/* Regression Section */}
          <section ref={setSectionRef('regression')} id="regression" className="scroll-mt-28">
            <SectionHeader title="Regression Analysis" subtitle="Actual vs predicted performance analysis" />
            <RegressionSection />
          </section>

          {/* Departments Section */}
          <section ref={setSectionRef('departments')} id="departments" className="scroll-mt-28">
            <SectionHeader title="Department Analytics" subtitle="Performance breakdown by department" />
            <DepartmentsSection />
          </section>

          {/* Employees Section */}
          <section ref={setSectionRef('employees')} id="employees" className="scroll-mt-28">
            <SectionHeader title="Employee Directory" subtitle="View and manage employee data" />
            <EmployeesSection />
          </section>
          
          {/* Bottom padding */}
          <div className="h-20" />
        </div>
      </main>

      {/* Settings Panel */}
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6 pb-4 border-b border-border/50">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        {title}
      </h2>
      <p className="text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
}

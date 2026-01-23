import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Brain, 
  LineChart, 
  PieChart,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FlaskConical,
  Activity,
  Home,
  Upload,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, color: 'from-blue-500 to-cyan-500', description: 'Dashboard summary' },
  { id: 'upload', label: 'Dataset Upload', icon: Upload, color: 'from-emerald-500 to-teal-500', description: 'Import your data' },
  { id: 'prediction', label: 'Prediction', icon: Sparkles, color: 'from-violet-500 to-purple-500', description: 'ML predictions' },
  { id: 'whatif', label: 'What-If Analysis', icon: FlaskConical, color: 'from-amber-500 to-orange-500', description: 'Scenario simulation' },
  { id: 'productivity', label: 'Productivity', icon: Activity, color: 'from-rose-500 to-pink-500', description: 'Team performance' },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'from-green-500 to-emerald-500', description: 'Deep insights' },
  { id: 'models', label: 'ML Models', icon: Brain, color: 'from-indigo-500 to-blue-500', description: 'Model comparison' },
  { id: 'regression', label: 'Regression', icon: LineChart, color: 'from-cyan-500 to-sky-500', description: 'Predictive analysis' },
  { id: 'departments', label: 'Departments', icon: PieChart, color: 'from-fuchsia-500 to-pink-500', description: 'Department stats' },
  { id: 'employees', label: 'Employees', icon: Users, color: 'from-teal-500 to-cyan-500', description: 'Employee directory' },
];

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onSettingsClick: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ activeSection, onSectionChange, onSettingsClick, mobileOpen }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const NavButton = ({ 
    onClick, 
    isActive, 
    icon: Icon, 
    label, 
    color, 
    description,
    index 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    icon: React.ElementType; 
    label: string; 
    color?: string;
    description?: string;
    index?: number;
  }) => {
    const button = (
      <button
        onClick={onClick}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative overflow-hidden",
          index !== undefined && "animate-fade-in",
          isActive 
            ? "bg-gradient-to-r from-primary/20 via-primary/10 to-transparent text-foreground shadow-lg shadow-primary/5 border border-primary/20" 
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        )}
        style={index !== undefined ? { animationDelay: `${index * 40}ms` } : undefined}
      >
        {/* Active indicator bar */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-primary/50 rounded-r-full shadow-lg shadow-primary/50" />
        )}
        
        {/* Icon with gradient background when active */}
        <div className={cn(
          "relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 flex-shrink-0",
          isActive 
            ? `bg-gradient-to-br ${color || 'from-primary to-primary/70'} shadow-lg`
            : "bg-muted/50 group-hover:bg-muted"
        )}>
          <Icon className={cn(
            "w-4 h-4 transition-all duration-300",
            isActive 
              ? "text-white" 
              : "text-muted-foreground group-hover:text-foreground group-hover:scale-110"
          )} />
          
          {/* Glow effect on active */}
          {isActive && (
            <div className={cn(
              "absolute inset-0 rounded-lg bg-gradient-to-br opacity-50 blur-sm -z-10",
              color || 'from-primary to-primary/70'
            )} />
          )}
        </div>
        
        {!collapsed && (
          <>
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span className={cn(
                "font-medium text-sm truncate w-full text-left",
                isActive && "text-foreground"
              )}>
                {label}
              </span>
              {isActive && description && (
                <span className="text-[10px] text-muted-foreground truncate w-full">
                  {description}
                </span>
              )}
            </div>
            
            {/* Active pulse indicator */}
            {isActive && (
              <div className="relative flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-primary animate-ping opacity-75" />
              </div>
            )}
          </>
        )}
      </button>
    );

    // Wrap in tooltip when collapsed
    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent side="right" className="flex flex-col gap-1">
            <span className="font-medium">{label}</span>
            {description && <span className="text-xs text-muted-foreground">{description}</span>}
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  };

  return (
    <TooltipProvider>
      <aside 
        className={cn(
          "fixed left-0 top-0 h-screen bg-card/95 backdrop-blur-xl border-r border-border z-50 transition-all duration-500",
          "transform lg:transform-none shadow-2xl lg:shadow-lg",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-primary/20 via-transparent to-accent/20" />
        
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border relative z-10">
          {!collapsed ? (
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="relative group">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  EmpAI
                </span>
                <span className="text-[10px] text-muted-foreground -mt-0.5">Analytics Suite</span>
              </div>
            </div>
          ) : (
            <div className="relative group mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "hover:bg-muted hidden lg:flex transition-all duration-300 hover:scale-110 h-8 w-8",
              collapsed && "absolute -right-3 top-1/2 -translate-y-1/2 bg-card border border-border shadow-md rounded-full"
            )}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className={cn(
          "p-3 space-y-1 overflow-y-auto relative z-10",
          collapsed ? "max-h-[calc(100vh-140px)]" : "max-h-[calc(100vh-160px)]"
        )}>
          {/* Home Button */}
          <NavButton
            onClick={() => navigate('/')}
            icon={Home}
            label="Home"
            color="from-slate-500 to-zinc-500"
            description="Back to landing"
          />

          {/* Divider */}
          <div className="relative py-3">
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            {!collapsed && (
              <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 bg-card px-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                Dashboard
              </span>
            )}
          </div>

          {/* Nav Items */}
          {navItems.map((item, index) => (
            <NavButton
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              isActive={activeSection === item.id}
              icon={item.icon}
              label={item.label}
              color={item.color}
              description={item.description}
              index={index}
            />
          ))}
        </nav>

        {/* Settings at bottom */}
        <div className="absolute bottom-4 left-0 right-0 px-3 z-10">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-3" />
          <NavButton
            onClick={onSettingsClick}
            icon={Settings}
            label="Settings"
            color="from-gray-500 to-slate-500"
            description="App preferences"
          />
        </div>
      </aside>
    </TooltipProvider>
  );
}
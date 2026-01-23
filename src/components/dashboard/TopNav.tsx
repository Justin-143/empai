import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Brain, 
  LineChart, 
  PieChart,
  TrendingUp,
  Sparkles,
  FlaskConical,
  Activity,
  Home,
  Upload,
  ChevronDown,
  Menu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'upload', label: 'Dataset Upload', icon: Upload },
  { id: 'prediction', label: 'Prediction', icon: Sparkles },
  { id: 'whatif', label: 'What-If Analysis', icon: FlaskConical },
  { id: 'productivity', label: 'Productivity', icon: Activity },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'models', label: 'ML Models', icon: Brain },
  { id: 'regression', label: 'Regression', icon: LineChart },
  { id: 'departments', label: 'Departments', icon: PieChart },
  { id: 'employees', label: 'Employees', icon: Users },
];

interface TopNavProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function TopNav({ activeSection, onSectionChange }: TopNavProps) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (id: string) => {
    if (id === 'home') {
      navigate('/');
    } else {
      onSectionChange(id);
    }
    setMobileMenuOpen(false);
  };

  // Split items for dropdown on smaller screens
  const visibleItems = navItems.slice(0, 6);
  const moreItems = navItems.slice(6);

  return (
    <nav className="w-full bg-card/95 backdrop-blur-xl border-b border-border sticky top-0 z-50">
      <div className="max-w-[1800px] mx-auto">
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center justify-center gap-1 px-4 py-2">
          {navItems.map((item) => {
            const isActive = item.id === 'home' ? false : activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium transition-all duration-300 relative",
                  "hover:text-primary",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground"
                )}
              >
                {item.label.toUpperCase()}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-0.5 bg-primary" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tablet Navigation */}
        <div className="hidden md:flex lg:hidden items-center justify-center gap-1 px-4 py-2">
          {visibleItems.map((item) => {
            const isActive = item.id === 'home' ? false : activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  "px-3 py-2.5 text-xs font-medium transition-all duration-300 relative",
                  "hover:text-primary",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground"
                )}
              >
                {item.label.toUpperCase()}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-0.5 bg-primary" />
                )}
              </button>
            );
          })}
          
          {/* More dropdown for remaining items */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "px-3 py-2.5 text-xs font-medium transition-all duration-300 flex items-center gap-1",
                "hover:text-primary text-muted-foreground",
                moreItems.some(item => activeSection === item.id) && "text-primary"
              )}>
                MORE
                <ChevronDown className="w-3 h-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <DropdownMenuItem
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={cn(
                      "flex items-center gap-2 cursor-pointer",
                      isActive && "bg-primary/10 text-primary"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold text-foreground">
            {navItems.find(i => i.id === activeSection)?.label.toUpperCase() || 'OVERVIEW'}
          </span>
          
          <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === 'home' ? false : activeSection === item.id;
                
                return (
                  <DropdownMenuItem
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={cn(
                      "flex items-center gap-3 cursor-pointer py-2.5",
                      isActive && "bg-primary/10 text-primary"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
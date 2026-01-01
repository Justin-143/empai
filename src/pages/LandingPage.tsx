import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  BarChart3, 
  Sparkles, 
  ArrowRight,
  Activity,
  Target,
  Zap,
  LineChart
} from 'lucide-react';
import { cn } from '@/lib/utils';

const floatingIcons = [
  { Icon: Brain, delay: 0, position: 'top-20 left-[10%]' },
  { Icon: TrendingUp, delay: 0.5, position: 'top-32 right-[15%]' },
  { Icon: Users, delay: 1, position: 'bottom-40 left-[8%]' },
  { Icon: BarChart3, delay: 1.5, position: 'bottom-32 right-[12%]' },
  { Icon: Activity, delay: 2, position: 'top-48 left-[25%]' },
  { Icon: Target, delay: 2.5, position: 'bottom-48 right-[25%]' },
  { Icon: Zap, delay: 0.8, position: 'top-60 right-[30%]' },
  { Icon: LineChart, delay: 1.8, position: 'bottom-60 left-[20%]' },
];

export function LandingPage() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 animate-gradient" />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Floating Animated Icons */}
      {floatingIcons.map(({ Icon, delay, position }, index) => (
        <div
          key={index}
          className={cn(
            "absolute hidden md:flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 rounded-2xl",
            "bg-card/30 backdrop-blur-sm border border-border/20",
            "transition-all duration-1000",
            position,
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
          style={{ 
            transitionDelay: `${delay}s`,
            animation: mounted ? `float 6s ease-in-out infinite ${delay}s` : 'none'
          }}
        >
          <Icon className="w-6 h-6 lg:w-8 lg:h-8 text-primary/60" />
        </div>
      ))}

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div 
          className={cn(
            "flex items-center gap-3 mb-6 sm:mb-8 transition-all duration-700",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
          )}
        >
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
            <Brain className="w-7 h-7 sm:w-9 sm:h-9 text-primary-foreground" />
          </div>
          <span className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text">EmpAI</span>
        </div>

        {/* Quote */}
        <blockquote 
          className={cn(
            "max-w-3xl text-center mb-6 sm:mb-8 transition-all duration-700 delay-200",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-light text-foreground/90 leading-relaxed px-4">
            "Unlock the power of <span className="text-primary font-medium">AI-driven insights</span> to predict, analyze, and elevate your team's performance."
          </p>
        </blockquote>

        {/* Subtitle */}
        <p 
          className={cn(
            "max-w-2xl text-center text-muted-foreground text-base sm:text-lg lg:text-xl mb-8 sm:mb-12 px-4 transition-all duration-700 delay-300",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          Advanced machine learning models for employee performance prediction, 
          productivity analytics, and data-driven decision making.
        </p>

        {/* CTA Button */}
        <div
          className={cn(
            "transition-all duration-700 delay-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <Button
            size="lg"
            onClick={() => navigate('/dashboard')}
            className="group relative px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
          >
            <Sparkles className="w-5 h-5 mr-2 group-hover:animate-pulse" />
            Get Started
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Feature Pills */}
        <div 
          className={cn(
            "flex flex-wrap justify-center gap-3 sm:gap-4 mt-12 sm:mt-16 px-4 transition-all duration-700 delay-700",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          {['ML Predictions', 'Regression Analysis', 'What-If Scenarios', 'Team Analytics'].map((feature, i) => (
            <div 
              key={feature}
              className="px-3 sm:px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-border/30 text-xs sm:text-sm text-muted-foreground"
              style={{ transitionDelay: `${0.8 + i * 0.1}s` }}
            >
              {feature}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 sm:bottom-6 left-0 right-0 text-center text-xs sm:text-sm text-muted-foreground/50 px-4">
        Built with precision for modern HR analytics
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-10px) rotate(2deg); }
          50% { transform: translateY(-5px) rotate(0deg); }
          75% { transform: translateY(-15px) rotate(-2deg); }
        }
      `}</style>
    </div>
  );
}

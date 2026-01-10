import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
  delay?: number;
}

export function ChartCard({ title, subtitle, children, className, action, delay = 0 }: ChartCardProps) {
  return (
    <div 
      className={cn(
        "glass-card p-4 sm:p-6 animate-slide-up",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-semibold truncate">{title}</h3>
          {subtitle && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 line-clamp-2">{subtitle}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      <div className="min-h-0 overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        {children}
      </div>
    </div>
  );
}

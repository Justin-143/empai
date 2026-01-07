import { useState, useEffect } from 'react';
import { X, Bell, Moon, Sun, Globe, Shield, Database, Palette, Monitor, Smartphone, Tablet, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const defaultSettings = {
  notifications: true,
  emailAlerts: true,
  darkMode: true,
  autoRefresh: true,
  refreshInterval: 30,
  language: 'en',
  dataRetention: '90',
  predictionThreshold: 0.75,
  showConfidenceScores: true,
  enableWhatIf: true,
  compactView: false,
};

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('dashboard-settings');
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  // Apply dark mode on mount and when it changes
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.setProperty('--background', '222 47% 6%');
      document.documentElement.style.setProperty('--foreground', '210 40% 98%');
      document.documentElement.style.setProperty('--card', '222 47% 8%');
      document.documentElement.style.setProperty('--card-foreground', '210 40% 98%');
      document.documentElement.style.setProperty('--popover', '222 47% 8%');
      document.documentElement.style.setProperty('--popover-foreground', '210 40% 98%');
      document.documentElement.style.setProperty('--secondary', '222 47% 12%');
      document.documentElement.style.setProperty('--secondary-foreground', '210 40% 98%');
      document.documentElement.style.setProperty('--muted', '222 47% 14%');
      document.documentElement.style.setProperty('--muted-foreground', '215 20% 55%');
      document.documentElement.style.setProperty('--border', '222 47% 16%');
      document.documentElement.style.setProperty('--input', '222 47% 16%');
      document.documentElement.style.setProperty('--sidebar-background', '222 47% 5%');
      document.documentElement.style.setProperty('--sidebar-accent', '222 47% 10%');
      document.documentElement.style.setProperty('--sidebar-border', '222 47% 12%');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.setProperty('--background', '0 0% 100%');
      document.documentElement.style.setProperty('--foreground', '222 47% 11%');
      document.documentElement.style.setProperty('--card', '0 0% 98%');
      document.documentElement.style.setProperty('--card-foreground', '222 47% 11%');
      document.documentElement.style.setProperty('--popover', '0 0% 100%');
      document.documentElement.style.setProperty('--popover-foreground', '222 47% 11%');
      document.documentElement.style.setProperty('--secondary', '220 14% 96%');
      document.documentElement.style.setProperty('--secondary-foreground', '222 47% 11%');
      document.documentElement.style.setProperty('--muted', '220 14% 96%');
      document.documentElement.style.setProperty('--muted-foreground', '220 9% 46%');
      document.documentElement.style.setProperty('--border', '220 13% 91%');
      document.documentElement.style.setProperty('--input', '220 13% 91%');
      document.documentElement.style.setProperty('--sidebar-background', '0 0% 98%');
      document.documentElement.style.setProperty('--sidebar-accent', '220 14% 96%');
      document.documentElement.style.setProperty('--sidebar-border', '220 13% 91%');
    }
  }, [settings.darkMode]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('dashboard-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    const keyStr = String(key);
    const formattedKey = keyStr.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    toast({
      title: "Setting Updated",
      description: `${formattedKey} has been updated.`,
      duration: 2000,
    });
  };

  const handleChangePassword = () => {
    toast({
      title: "Change Password",
      description: "Password change functionality requires authentication backend.",
    });
  };

  const handleTwoFactor = () => {
    toast({
      title: "Two-Factor Authentication",
      description: "2FA setup requires authentication backend.",
    });
  };

  const handleClearData = () => {
    localStorage.removeItem('dashboard-settings');
    setSettings(defaultSettings);
    toast({
      title: "Data Cleared",
      description: "All settings have been reset to defaults.",
      variant: "destructive",
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div 
        className={cn(
          "fixed right-0 top-0 h-full w-full sm:w-96 md:w-[420px] bg-card border-l border-border z-50",
          "transform transition-transform duration-300 ease-out",
          "overflow-y-auto"
        )}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-xl border-b border-border p-4 sm:p-6 flex items-center justify-between z-10">
          <h2 className="text-lg sm:text-xl font-bold">Settings</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          {/* Notifications */}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-3 sm:mb-4">
              <Bell className="w-4 h-4" />
              Notifications
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications" className="text-sm">Push Notifications</Label>
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(v) => updateSetting('notifications', v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="emailAlerts" className="text-sm">Email Alerts</Label>
                <Switch
                  id="emailAlerts"
                  checked={settings.emailAlerts}
                  onCheckedChange={(v) => updateSetting('emailAlerts', v)}
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* Appearance */}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-3 sm:mb-4">
              <Palette className="w-4 h-4" />
              Appearance
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {settings.darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  <Label htmlFor="darkMode" className="text-sm">Dark Mode</Label>
                </div>
                <Switch
                  id="darkMode"
                  checked={settings.darkMode}
                  onCheckedChange={(v) => updateSetting('darkMode', v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="compactView" className="text-sm">Compact View</Label>
                <Switch
                  id="compactView"
                  checked={settings.compactView}
                  onCheckedChange={(v) => updateSetting('compactView', v)}
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* Data & Predictions */}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-3 sm:mb-4">
              <Database className="w-4 h-4" />
              Data & Predictions
            </h3>
            <div className="space-y-4 sm:space-y-5">
              <div className="flex items-center justify-between">
                <Label htmlFor="autoRefresh" className="text-sm">Auto Refresh Data</Label>
                <Switch
                  id="autoRefresh"
                  checked={settings.autoRefresh}
                  onCheckedChange={(v) => updateSetting('autoRefresh', v)}
                />
              </div>
              
              {settings.autoRefresh && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <Label className="text-sm">Refresh Interval</Label>
                    <span className="text-muted-foreground">{settings.refreshInterval}s</span>
                  </div>
                  <Slider
                    value={[settings.refreshInterval]}
                    onValueChange={([v]) => setSettings(prev => ({ ...prev, refreshInterval: v }))}
                    min={10}
                    max={120}
                    step={10}
                    className="w-full"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm">Data Retention Period</Label>
                <Select
                  value={settings.dataRetention}
                  onValueChange={(v) => updateSetting('dataRetention', v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 Days</SelectItem>
                    <SelectItem value="60">60 Days</SelectItem>
                    <SelectItem value="90">90 Days</SelectItem>
                    <SelectItem value="180">180 Days</SelectItem>
                    <SelectItem value="365">1 Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <Label className="text-sm">Prediction Confidence Threshold</Label>
                  <span className="text-muted-foreground">{Math.round(settings.predictionThreshold * 100)}%</span>
                </div>
                <Slider
                  value={[settings.predictionThreshold * 100]}
                  onValueChange={([v]) => setSettings(prev => ({ ...prev, predictionThreshold: v / 100 }))}
                  min={50}
                  max={95}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="showConfidence" className="text-sm">Show Confidence Scores</Label>
                <Switch
                  id="showConfidence"
                  checked={settings.showConfidenceScores}
                  onCheckedChange={(v) => updateSetting('showConfidenceScores', v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enableWhatIf" className="text-sm">Enable What-If Analysis</Label>
                <Switch
                  id="enableWhatIf"
                  checked={settings.enableWhatIf}
                  onCheckedChange={(v) => updateSetting('enableWhatIf', v)}
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* Language & Region */}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-3 sm:mb-4">
              <Globe className="w-4 h-4" />
              Language & Region
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Language</Label>
                <Select
                  value={settings.language}
                  onValueChange={(v) => updateSetting('language', v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <Separator />

          {/* Security */}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-3 sm:mb-4">
              <Shield className="w-4 h-4" />
              Security
            </h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start text-sm" onClick={handleChangePassword}>
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm" onClick={handleTwoFactor}>
                Two-Factor Authentication
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-sm text-destructive hover:text-destructive"
                onClick={handleClearData}
              >
                Clear All Data
              </Button>
            </div>
          </section>

          {/* Device Preview Info */}
          <section className="pt-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-3 sm:mb-4">
              Responsive Preview
            </h3>
            <div className="flex gap-2 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 text-xs">
                <Monitor className="w-4 h-4" />
                <span>Desktop</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 text-xs">
                <Tablet className="w-4 h-4" />
                <span>Tablet</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 text-xs">
                <Smartphone className="w-4 h-4" />
                <span>Mobile</span>
              </div>
            </div>
          </section>

          {/* Save indicator */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-4">
            <Check className="w-4 h-4 text-success" />
            <span>Settings are saved automatically</span>
          </div>
        </div>
      </div>
    </>
  );
}

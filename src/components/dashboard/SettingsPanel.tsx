import { useState } from 'react';
import { X, Bell, Moon, Sun, Globe, Shield, Database, Palette, Monitor, Smartphone, Tablet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [settings, setSettings] = useState({
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
  });

  const updateSetting = <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
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
                    onValueChange={([v]) => updateSetting('refreshInterval', v)}
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
                  onValueChange={([v]) => updateSetting('predictionThreshold', v / 100)}
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
              <Button variant="outline" className="w-full justify-start text-sm">
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm">
                Two-Factor Authentication
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm text-destructive hover:text-destructive">
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
        </div>
      </div>
    </>
  );
}

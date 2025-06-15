import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/access/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { Bell, Lock, Palette, Globe, Mail, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';
import schedulerService from '@/services/schedulerService';

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    darkMode: true,
    autoSave: true,
  });
  
  const [emailSettings, setEmailSettings] = useState({
    contract_expiry_enabled: true,
    contract_renewal_enabled: true,
    days_before_expiry: [30, 14, 7, 3, 1],
    days_before_renewal: [30, 14, 7, 3, 1],
  });
  
  const [emailConfig, setEmailConfig] = useState({
    email: '',
    appPassword: '',
    intervalHours: 24,
  });
  
  const [isEmailServiceRunning, setIsEmailServiceRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch email notification settings
  useEffect(() => {
    if (user) {
      fetchEmailSettings();
    }
  }, [user]);
  
  // Check if email service is running
  useEffect(() => {
    setIsEmailServiceRunning(schedulerService.isActive());
  }, []);

  const fetchEmailSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('email_notification_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();
        
      if (error) {
        console.error('Error fetching email settings:', error);
        return;
      }
      
      if (data) {
        setEmailSettings({
          contract_expiry_enabled: data.contract_expiry_enabled,
          contract_renewal_enabled: data.contract_renewal_enabled,
          days_before_expiry: data.days_before_expiry || [30, 14, 7, 3, 1],
          days_before_renewal: data.days_before_renewal || [30, 14, 7, 3, 1],
        });
      }
    } catch (error) {
      console.error('Error in fetchEmailSettings:', error);
    }
  };

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Settings Updated",
      description: `${key} has been ${value ? 'enabled' : 'disabled'}`,
    });
  };
  
  const handleEmailSettingChange = (key: string, value: boolean) => {
    setEmailSettings(prev => ({ ...prev, [key]: value }));
  };
  
  const handleDaysInputChange = (key: string, value: string) => {
    // Convert comma-separated string to array of numbers
    const daysArray = value.split(',')
      .map(day => parseInt(day.trim()))
      .filter(day => !isNaN(day) && day > 0);
      
    setEmailSettings(prev => ({ ...prev, [key]: daysArray }));
  };
  
  const handleEmailConfigChange = (key: string, value: string | number) => {
    setEmailConfig(prev => ({ ...prev, [key]: value }));
  };

  const saveEmailSettings = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('email_notification_settings')
        .upsert({
          user_id: user.id,
          contract_expiry_enabled: emailSettings.contract_expiry_enabled,
          contract_renewal_enabled: emailSettings.contract_renewal_enabled,
          days_before_expiry: emailSettings.days_before_expiry,
          days_before_renewal: emailSettings.days_before_renewal,
        });
        
      if (error) {
        console.error('Error saving email settings:', error);
        toast({
          title: "Error",
          description: "Failed to save email notification settings",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Settings Saved",
        description: "Email notification settings have been updated",
      });
    } catch (error) {
      console.error('Error in saveEmailSettings:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const startEmailService = () => {
    if (!emailConfig.email || !emailConfig.appPassword) {
      toast({
        title: "Missing Information",
        description: "Please provide email and app password",
        variant: "destructive",
      });
      return;
    }
    
    try {
      schedulerService.start(
        { email: emailConfig.email, appPassword: emailConfig.appPassword },
        emailConfig.intervalHours
      );
      setIsEmailServiceRunning(true);
      toast({
        title: "Email Service Started",
        description: `Notification service is now running. Checking every ${emailConfig.intervalHours} hours.`,
      });
    } catch (error) {
      console.error('Error starting email service:', error);
      toast({
        title: "Error",
        description: "Failed to start email notification service",
        variant: "destructive",
      });
    }
  };
  
  const stopEmailService = () => {
    schedulerService.stop();
    setIsEmailServiceRunning(false);
    toast({
      title: "Email Service Stopped",
      description: "Notification service has been stopped",
    });
  };

  const userDisplayName = user?.user_metadata?.full_name || user?.email || 'User';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Welcome back, {userDisplayName}
        </p>
      </div>

      <div className="grid gap-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications in browser
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
              />
            </div>
            
            <Separator className="my-4" />
            
            {/* Contract Email Notifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Contract Email Notifications
              </h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="contract-expiry">Contract Expiry Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email alerts when contracts are about to expire
                  </p>
                </div>
                <Switch
                  id="contract-expiry"
                  checked={emailSettings.contract_expiry_enabled}
                  onCheckedChange={(checked) => handleEmailSettingChange('contract_expiry_enabled', checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="days-before-expiry">Days Before Expiry</Label>
                <Input
                  id="days-before-expiry"
                  placeholder="30, 14, 7, 3, 1"
                  value={emailSettings.days_before_expiry.join(', ')}
                  onChange={(e) => handleDaysInputChange('days_before_expiry', e.target.value)}
                  disabled={!emailSettings.contract_expiry_enabled}
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated list of days before expiry to send alerts
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="contract-renewal">Contract Renewal Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email alerts when contracts are about to auto-renew
                  </p>
                </div>
                <Switch
                  id="contract-renewal"
                  checked={emailSettings.contract_renewal_enabled}
                  onCheckedChange={(checked) => handleEmailSettingChange('contract_renewal_enabled', checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="days-before-renewal">Days Before Renewal</Label>
                <Input
                  id="days-before-renewal"
                  placeholder="30, 14, 7, 3, 1"
                  value={emailSettings.days_before_renewal.join(', ')}
                  onChange={(e) => handleDaysInputChange('days_before_renewal', e.target.value)}
                  disabled={!emailSettings.contract_renewal_enabled}
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated list of days before renewal to send alerts
                </p>
              </div>
              
              <Button 
                onClick={saveEmailSettings} 
                disabled={isSaving}
                className="w-full"
              >
                {isSaving ? 'Saving...' : 'Save Notification Settings'}
              </Button>
            </div>
            
            <Separator className="my-4" />
            
            {/* Email Service Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Service Configuration
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="email-address">Email Address</Label>
                <Input
                  id="email-address"
                  placeholder="your-email@gmail.com"
                  value={emailConfig.email}
                  onChange={(e) => handleEmailConfigChange('email', e.target.value)}
                  disabled={isEmailServiceRunning}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="app-password">Google App Password</Label>
                <Input
                  id="app-password"
                  type="password"
                  placeholder="Google App Password"
                  value={emailConfig.appPassword}
                  onChange={(e) => handleEmailConfigChange('appPassword', e.target.value)}
                  disabled={isEmailServiceRunning}
                />
                <p className="text-xs text-muted-foreground">
                  <a 
                    href="https://support.google.com/accounts/answer/185833" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    How to generate an app password
                  </a>
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="check-interval">Check Interval (Hours)</Label>
                <Input
                  id="check-interval"
                  type="number"
                  min="1"
                  max="72"
                  placeholder="24"
                  value={emailConfig.intervalHours.toString()}
                  onChange={(e) => handleEmailConfigChange('intervalHours', parseInt(e.target.value) || 24)}
                  disabled={isEmailServiceRunning}
                />
              </div>
              
              {isEmailServiceRunning ? (
                <Button 
                  onClick={stopEmailService} 
                  variant="destructive"
                  className="w-full"
                >
                  Stop Email Service
                </Button>
              ) : (
                <Button 
                  onClick={startEmailService} 
                  className="w-full"
                >
                  Start Email Service
                </Button>
              )}
              
              <p className="text-xs text-muted-foreground">
                {isEmailServiceRunning 
                  ? `Email service is running. Checking every ${schedulerService.getIntervalHours()} hours.` 
                  : 'Email service is not running.'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle dark theme
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={settings.darkMode}
                onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* General */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-save">Auto Save</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically save changes
                </p>
              </div>
              <Switch
                id="auto-save"
                checked={settings.autoSave}
                onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full">
              Change Password
            </Button>
            <Button variant="outline" className="w-full">
              Two-Factor Authentication
            </Button>
            <Button variant="destructive" className="w-full">
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;

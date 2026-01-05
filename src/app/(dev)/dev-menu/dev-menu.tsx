'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useDevStore, useAPIUrl, type Environment } from '@/lib/stores/dev-store';
import { toast } from 'sonner';
import {
  Settings,
  Code2,
  Bug,
  Trash2,
  AlertTriangle,
  Server,
  Package,
  Info,
} from 'lucide-react';

export function DevMenu() {
  const router = useRouter();
  const { environment, featureFlags, setEnvironment, toggleFeatureFlag, resetFeatureFlags } =
    useDevStore();
  const apiUrl = useAPIUrl();

  const handleClearStorage = () => {
    if (confirm('Clear all localStorage and sessionStorage? This action cannot be undone.')) {
      localStorage.clear();
      sessionStorage.clear();
      toast.success('Storage cleared successfully');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleForceCrash = () => {
    if (confirm('This will intentionally crash the app to test error boundaries. Continue?')) {
      setTimeout(() => {
        throw new Error('Test crash from Developer Menu');
      }, 500);
    }
  };

  const handleResetFlags = () => {
    if (confirm('Reset all feature flags to default values?')) {
      resetFeatureFlags();
      toast.success('Feature flags reset to defaults');
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-4xl">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Settings className="h-8 w-8" />
          <h1 className="text-4xl font-bold tracking-tight">Developer Menu</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Feature flags, environment switching, and developer utilities
        </p>
        <div className="flex gap-2">
          <Badge variant="outline">Developer Tools</Badge>
          <Badge variant="destructive">Dev Only</Badge>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800 p-4">
        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
            Development Mode Only
          </p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            This menu is only accessible in development mode and will be hidden in production builds.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Navigate to developer tools and perform quick actions
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => router.push('/dev/components')}
          >
            <Package className="mr-2 h-4 w-4" />
            Component Showcase
          </Button>

          <Button
            variant="outline"
            className="justify-start"
            onClick={() => router.push('/dev/debug')}
          >
            <Bug className="mr-2 h-4 w-4" />
            Debug Console
          </Button>

          <Button
            variant="outline"
            className="justify-start text-destructive hover:text-destructive"
            onClick={handleClearStorage}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Storage
          </Button>

          <Button
            variant="outline"
            className="justify-start text-destructive hover:text-destructive"
            onClick={handleForceCrash}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Force Crash
          </Button>
        </CardContent>
      </Card>

      {/* Environment Switcher */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Environment
          </CardTitle>
          <CardDescription>
            Switch between development, staging, and production environments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(['development', 'staging', 'production'] as Environment[]).map((env) => (
              <Button
                key={env}
                variant={environment === env ? 'default' : 'outline'}
                onClick={() => {
                  setEnvironment(env);
                  toast.success(`Switched to ${env} environment`);
                }}
                className="capitalize"
              >
                {env}
              </Button>
            ))}
          </div>

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Environment:</span>
              <Badge className="capitalize">{environment}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">API URL:</span>
              <code className="text-xs bg-background px-2 py-1 rounded">{apiUrl}</code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Flags */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Feature Flags
              </CardTitle>
              <CardDescription>
                Toggle experimental features and settings
              </CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={handleResetFlags}>
              Reset All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* New UI */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">New UI Features</p>
                {featureFlags.newUIEnabled && <Badge variant="secondary">Active</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">
                Enable experimental UI improvements
              </p>
            </div>
            <Switch
              checked={featureFlags.newUIEnabled}
              onCheckedChange={() => toggleFeatureFlag('newUIEnabled')}
            />
          </div>

          {/* Analytics */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Analytics</p>
                {featureFlags.analyticsEnabled && <Badge variant="secondary">Active</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">
                Send analytics events to tracking service
              </p>
            </div>
            <Switch
              checked={featureFlags.analyticsEnabled}
              onCheckedChange={() => toggleFeatureFlag('analyticsEnabled')}
            />
          </div>

          {/* Debug Logging */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Debug Logging</p>
                {featureFlags.debugLogging && <Badge variant="secondary">Active</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">
                Enable verbose console logging
              </p>
            </div>
            <Switch
              checked={featureFlags.debugLogging}
              onCheckedChange={() => toggleFeatureFlag('debugLogging')}
            />
          </div>

          {/* Mock API */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Mock API Responses</p>
                {featureFlags.mockAPIResponses && <Badge variant="secondary">Active</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">
                Use mock data instead of real API calls
              </p>
            </div>
            <Switch
              checked={featureFlags.mockAPIResponses}
              onCheckedChange={() => toggleFeatureFlag('mockAPIResponses')}
            />
          </div>

          {/* Maintenance Mode */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Maintenance Mode</p>
                {featureFlags.maintenanceMode && <Badge variant="destructive">Active</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">
                Show maintenance page to users
              </p>
            </div>
            <Switch
              checked={featureFlags.maintenanceMode}
              onCheckedChange={() => toggleFeatureFlag('maintenanceMode')}
            />
          </div>

          {/* Experimental */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Experimental Features</p>
                {featureFlags.experimentalFeatures && <Badge variant="destructive">Active</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">
                Enable unstable experimental features
              </p>
            </div>
            <Switch
              checked={featureFlags.experimentalFeatures}
              onCheckedChange={() => toggleFeatureFlag('experimentalFeatures')}
            />
          </div>
        </CardContent>
      </Card>

      {/* App Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Application Information
          </CardTitle>
          <CardDescription>
            Current build and runtime information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Next.js Version</p>
              <p className="text-sm font-mono">15.1.0</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">React Version</p>
              <p className="text-sm font-mono">19.0.0</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Node Version</p>
              <p className="text-sm font-mono">{typeof process !== 'undefined' ? process.version : 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Build Mode</p>
              <p className="text-sm font-mono">{process.env.NODE_ENV}</p>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">
              <strong>Package:</strong> vivacity-nextjs-boilerplate v1.0.0
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

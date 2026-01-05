'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Bug,
  Network,
  Database,
  Trash2,
  Copy,
  Download,
  Info,
  AlertTriangle,
  XCircle,
  CheckCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type LogLevel = 'debug' | 'info' | 'warning' | 'error';
type LogFilter = 'all' | LogLevel;

interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  timestamp: Date;
  details?: string;
}

interface NetworkRequest {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  status: number;
  duration: number;
  timestamp: Date;
}

export function DebugConsole() {
  const [logFilter, setLogFilter] = useState<LogFilter>('all');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [networkRequests, setNetworkRequests] = useState<NetworkRequest[]>([]);
  const [storageData, setStorageData] = useState<Record<string, string>>({});

  // Mock log data
  useEffect(() => {
    const mockLogs: LogEntry[] = [
      {
        id: '1',
        level: 'info',
        message: 'Application initialized successfully',
        timestamp: new Date(Date.now() - 5 * 60000),
      },
      {
        id: '2',
        level: 'debug',
        message: 'Loading component: ComponentShowcase',
        timestamp: new Date(Date.now() - 4 * 60000),
      },
      {
        id: '3',
        level: 'info',
        message: 'API request to /api/users',
        timestamp: new Date(Date.now() - 3 * 60000),
      },
      {
        id: '4',
        level: 'warning',
        message: 'Slow network detected (2.5s response time)',
        timestamp: new Date(Date.now() - 2 * 60000),
        details: 'Consider implementing request caching',
      },
      {
        id: '5',
        level: 'error',
        message: 'Failed to load resource: 404 Not Found',
        timestamp: new Date(Date.now() - 1 * 60000),
        details: '/api/missing-endpoint',
      },
      {
        id: '6',
        level: 'debug',
        message: 'State updated: theme changed to dark',
        timestamp: new Date(Date.now() - 30000),
      },
      {
        id: '7',
        level: 'info',
        message: 'User navigation: /dev/debug',
        timestamp: new Date(Date.now() - 10000),
      },
    ];

    const mockNetwork: NetworkRequest[] = [
      {
        id: '1',
        method: 'GET',
        url: '/api/users/me',
        status: 200,
        duration: 234,
        timestamp: new Date(Date.now() - 5 * 60000),
      },
      {
        id: '2',
        method: 'POST',
        url: '/api/auth/login',
        status: 200,
        duration: 456,
        timestamp: new Date(Date.now() - 4 * 60000),
      },
      {
        id: '3',
        method: 'GET',
        url: '/api/posts',
        status: 200,
        duration: 1234,
        timestamp: new Date(Date.now() - 3 * 60000),
      },
      {
        id: '4',
        method: 'PUT',
        url: '/api/profile',
        status: 500,
        duration: 2345,
        timestamp: new Date(Date.now() - 2 * 60000),
      },
      {
        id: '5',
        method: 'DELETE',
        url: '/api/posts/123',
        status: 204,
        duration: 123,
        timestamp: new Date(Date.now() - 1 * 60000),
      },
    ];

    setLogs(mockLogs);
    setNetworkRequests(mockNetwork);

    // Load localStorage data
    const storage: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        storage[key] = localStorage.getItem(key) || '';
      }
    }
    setStorageData(storage);
  }, []);

  const filteredLogs = logs.filter(
    (log) => logFilter === 'all' || log.level === logFilter
  );

  const getLogIcon = (level: LogLevel) => {
    switch (level) {
      case 'debug':
        return <Bug className="h-4 w-4 text-blue-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getLogColor = (level: LogLevel) => {
    switch (level) {
      case 'debug':
        return 'text-blue-600 dark:text-blue-400';
      case 'info':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600 dark:text-green-400';
    if (status >= 400 && status < 500) return 'text-yellow-600 dark:text-yellow-400';
    if (status >= 500) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'POST':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'DELETE':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'PATCH':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleClearLogs = () => {
    setLogs([]);
    toast.success('Logs cleared');
  };

  const handleExportLogs = () => {
    const data = JSON.stringify(logs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${Date.now()}.json`;
    a.click();
    toast.success('Logs exported');
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleClearStorage = () => {
    if (confirm('Clear all localStorage? This cannot be undone.')) {
      localStorage.clear();
      setStorageData({});
      toast.success('Storage cleared');
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Bug className="h-8 w-8" />
          <h1 className="text-4xl font-bold tracking-tight">Debug Console</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Monitor logs, network requests, and application storage
        </p>
        <div className="flex gap-2">
          <Badge variant="outline">Developer Tools</Badge>
          <Badge variant="secondary">Real-time Monitoring</Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="logs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="logs">
            <Bug className="mr-2 h-4 w-4" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="network">
            <Network className="mr-2 h-4 w-4" />
            Network
          </TabsTrigger>
          <TabsTrigger value="storage">
            <Database className="mr-2 h-4 w-4" />
            Storage
          </TabsTrigger>
        </TabsList>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Application Logs</CardTitle>
                  <CardDescription>
                    Filter and view application log entries
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleExportLogs}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <Button size="sm" variant="destructive" onClick={handleClearLogs}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={logFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setLogFilter('all')}
                >
                  All ({logs.length})
                </Button>
                <Button
                  size="sm"
                  variant={logFilter === 'debug' ? 'default' : 'outline'}
                  onClick={() => setLogFilter('debug')}
                >
                  <Bug className="mr-1 h-3 w-3" />
                  Debug ({logs.filter((l) => l.level === 'debug').length})
                </Button>
                <Button
                  size="sm"
                  variant={logFilter === 'info' ? 'default' : 'outline'}
                  onClick={() => setLogFilter('info')}
                >
                  <Info className="mr-1 h-3 w-3" />
                  Info ({logs.filter((l) => l.level === 'info').length})
                </Button>
                <Button
                  size="sm"
                  variant={logFilter === 'warning' ? 'default' : 'outline'}
                  onClick={() => setLogFilter('warning')}
                >
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Warning ({logs.filter((l) => l.level === 'warning').length})
                </Button>
                <Button
                  size="sm"
                  variant={logFilter === 'error' ? 'default' : 'outline'}
                  onClick={() => setLogFilter('error')}
                >
                  <XCircle className="mr-1 h-3 w-3" />
                  Error ({logs.filter((l) => l.level === 'error').length})
                </Button>
              </div>

              {/* Log Entries */}
              <div className="space-y-2">
                {filteredLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No logs to display
                  </p>
                ) : (
                  filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                    >
                      {getLogIcon(log.level)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="outline"
                            className={`capitalize ${getLogColor(log.level)}`}
                          >
                            {log.level}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm">{log.message}</p>
                        {log.details && (
                          <p className="text-xs text-muted-foreground mt-1">{log.details}</p>
                        )}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="shrink-0"
                        onClick={() => handleCopyToClipboard(log.message)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Network Tab */}
        <TabsContent value="network" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Network Requests</CardTitle>
              <CardDescription>
                Monitor HTTP requests and responses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {networkRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <Badge className={`${getMethodColor(request.method)} shrink-0`}>
                    {request.method}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono truncate">{request.url}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className={getStatusColor(request.status)}>
                        {request.status}
                      </span>
                      <span>{request.duration}ms</span>
                      <span>{formatDistanceToNow(request.timestamp, { addSuffix: true })}</span>
                    </div>
                  </div>
                  {request.status >= 200 && request.status < 300 ? (
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Storage Tab */}
        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>LocalStorage</CardTitle>
                  <CardDescription>
                    View and manage browser storage
                  </CardDescription>
                </div>
                <Button size="sm" variant="destructive" onClick={handleClearStorage}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.keys(storageData).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No storage data found
                </p>
              ) : (
                Object.entries(storageData).map(([key, value]) => (
                  <div key={key} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{key}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handleCopyToClipboard(value)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                      {value.length > 200 ? value.substring(0, 200) + '...' : value}
                    </pre>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Play,
  Pause,
  Download,
  Trash2,
  Plus,
  Check,
  X,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export function ComponentShowcase() {
  const [switchStates, setSwitchStates] = React.useState({
    switch1: false,
    switch2: true,
    switch3: false,
  });

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Component Showcase</h1>
        <p className="text-muted-foreground text-lg">
          Browse all available UI components with live examples and code snippets.
        </p>
        <Badge variant="outline" className="mt-2">Developer Tools</Badge>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="buttons" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="data">Data Display</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        {/* Tab 1: Buttons */}
        <TabsContent value="buttons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
              <CardDescription>
                Different button styles for various use cases
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Buttons with Icons</CardTitle>
              <CardDescription>
                Combine buttons with Lucide React icons
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button>
                  <Play className="mr-2 h-4 w-4" />
                  Play
                </Button>
                <Button variant="secondary">
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
                <Button size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Button Sizes</CardTitle>
              <CardDescription>
                Small, default, and large button sizes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center flex-wrap gap-3">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Button States</CardTitle>
              <CardDescription>
                Disabled and loading button states
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button disabled>Disabled</Button>
                <Button variant="secondary" disabled>
                  Disabled Secondary
                </Button>
                <Button variant="outline" disabled>
                  Disabled Outline
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Forms */}
        <TabsContent value="forms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Switch Component</CardTitle>
              <CardDescription>
                Toggle switches for on/off states
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Switch
                  checked={switchStates.switch1}
                  onCheckedChange={(checked) =>
                    setSwitchStates({ ...switchStates, switch1: checked })
                  }
                />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Switch
                  checked={switchStates.switch2}
                  onCheckedChange={(checked) =>
                    setSwitchStates({ ...switchStates, switch2: checked })
                  }
                />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Enable dark theme
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Switch
                  checked={switchStates.switch3}
                  onCheckedChange={(checked) =>
                    setSwitchStates({ ...switchStates, switch3: checked })
                  }
                  disabled
                />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Disabled Switch</p>
                  <p className="text-sm text-muted-foreground">
                    This switch is disabled
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Form Components</CardTitle>
              <CardDescription>
                More form components coming soon (inputs, selects, checkboxes, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Additional form components like Input, Select, Checkbox, Radio Group, and Slider
                will be added in the next iteration.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Cards */}
        <TabsContent value="cards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Card Variations</CardTitle>
              <CardDescription>
                Different card styles and layouts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Card</CardTitle>
                    <CardDescription>
                      A simple card with title and description
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      This is the card content. It can contain any elements you need.
                    </p>
                  </CardContent>
                </Card>

                {/* Card with Footer */}
                <Card>
                  <CardHeader>
                    <CardTitle>Card with Actions</CardTitle>
                    <CardDescription>
                      Card with action buttons in the footer
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Content goes here with actions below.
                    </p>
                  </CardContent>
                  <div className="flex gap-2 p-6 pt-0">
                    <Button size="sm" variant="outline">Cancel</Button>
                    <Button size="sm">Confirm</Button>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Data Display */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
              <CardDescription>
                Status indicators and labels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge>New</Badge>
                <Badge variant="secondary">Beta</Badge>
                <Badge variant="outline">Coming Soon</Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge className="bg-green-500 hover:bg-green-600">
                  <Check className="mr-1 h-3 w-3" />
                  Success
                </Badge>
                <Badge className="bg-yellow-500 hover:bg-yellow-600">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  Warning
                </Badge>
                <Badge className="bg-red-500 hover:bg-red-600">
                  <X className="mr-1 h-3 w-3" />
                  Error
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Icons</CardTitle>
              <CardDescription>
                Lucide React icons library
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col items-center gap-2">
                  <Info className="h-6 w-6 text-blue-500" />
                  <span className="text-xs">Info</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <span className="text-xs">Success</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <AlertCircle className="h-6 w-6 text-yellow-500" />
                  <span className="text-xs">Warning</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <XCircle className="h-6 w-6 text-red-500" />
                  <span className="text-xs">Error</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Download className="h-6 w-6" />
                  <span className="text-xs">Download</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Plus className="h-6 w-6" />
                  <span className="text-xs">Plus</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Trash2 className="h-6 w-6" />
                  <span className="text-xs">Delete</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Feedback */}
        <TabsContent value="feedback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alert States</CardTitle>
              <CardDescription>
                Visual feedback for different states
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Success State */}
              <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800 p-4">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Success
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Your changes have been saved successfully.
                  </p>
                </div>
              </div>

              {/* Info State */}
              <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 p-4">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Information
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    This is an informational message for the user.
                  </p>
                </div>
              </div>

              {/* Warning State */}
              <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800 p-4">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                    Warning
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Please review this information before proceeding.
                  </p>
                </div>
              </div>

              {/* Error State */}
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 p-4">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-red-900 dark:text-red-100">
                    Error
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    An error occurred. Please try again later.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Toast Notifications</CardTitle>
              <CardDescription>
                Temporary notifications powered by Sonner
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Toast notifications are available via the Sonner library.
                Trigger toasts using the <code className="text-xs bg-muted px-1 py-0.5 rounded">toast()</code> function.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer Note */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> This is a developer tool screen. Additional components like Input, Select,
            Checkbox, Radio, Slider, Progress, Table, Accordion, and more will be added as needed.
            All components are built with Radix UI primitives and styled with Tailwind CSS.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

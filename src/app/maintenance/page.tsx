import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Clock, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Maintenance Mode',
  description: 'Site is currently under maintenance',
  robots: {
    index: false,
    follow: false,
  },
};

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Settings className="h-12 w-12 text-primary animate-spin" style={{ animationDuration: '3s' }} />
            </div>
          </div>
          <CardTitle className="text-2xl">Under Maintenance</CardTitle>
          <CardDescription>
            We&apos;re currently performing scheduled maintenance to improve your experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Expected return time: 2 hours</span>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="text-sm font-medium">Need help?</span>
            </div>
            <a
              href="mailto:support@vivacitydigitalapps.com"
              className="text-sm text-primary hover:underline"
            >
              support@vivacitydigitalapps.com
            </a>
          </div>

          <Badge variant="outline" className="mt-4">
            Status: Maintenance in Progress
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}

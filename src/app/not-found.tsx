import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <h1 className="text-9xl font-bold text-primary">404</h1>
          </div>
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
          <CardDescription>
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/search">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Link>
            </Button>
          </div>

          <div className="text-left pt-4 border-t">
            <p className="text-sm font-medium mb-2">Popular Pages:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                <Link href="/dev/components" className="hover:text-foreground transition-colors">
                  → Component Showcase
                </Link>
              </li>
              <li>
                <Link href="/dev/dev-menu" className="hover:text-foreground transition-colors">
                  → Developer Menu
                </Link>
              </li>
              <li>
                <Link href="/dev/debug" className="hover:text-foreground transition-colors">
                  → Debug Console
                </Link>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import type { Metadata } from 'next';
import { Raleway, Lora } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { AuthProvider } from '@/components/providers/session-provider';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/next';
import '../styles/globals.css';

const raleway = Raleway({ subsets: ['latin'], variable: '--font-sans', weight: ['300', '400', '500', '600', '700'] });
const lora = Lora({ subsets: ['latin'], variable: '--font-serif', weight: ['400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: {
    default: 'This, Today - Your Personal Journal',
    template: '%s | This, Today',
  },
  description: 'A beautiful journaling app. Capture your thoughts, track your mood, and cherish your memories.',
  keywords: ['journal', 'diary', 'journaling', 'mood tracker', 'personal journal', 'digital diary'],
  authors: [{ name: 'Bryson Walter', url: 'https://vivacitydigitalapps.com' }],
  creator: 'Vivacity Digital Apps',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://thistoday.app',
    title: 'This, Today - Your Personal Journal',
    description: 'A beautiful journaling app. Capture your thoughts, track your mood, and cherish your memories.',
    siteName: 'This, Today',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'This, Today - Your Personal Journal',
    description: 'A beautiful journaling app. Capture your thoughts, track your mood, and cherish your memories.',
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1.0,
    maximumScale: 1.0,
    viewportFit: 'cover' as any,
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${raleway.variable} ${lora.variable}`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Analytics />
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

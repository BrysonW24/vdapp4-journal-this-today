import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vivacitydigital.thistoday',
  appName: 'This, Today',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // Serve index.html for any route that doesn't have a matching file
    // This enables client-side routing for dynamic routes like /journal/[id]
    errorPath: '/index.html',
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'thistoday',
  },
};

export default config;

import type { Metadata } from 'next';
import { DebugConsole } from './debug-console';

export const metadata: Metadata = {
  title: 'Debug Console',
  description: 'View logs, network requests, and storage data',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DebugPage() {
  return <DebugConsole />;
}

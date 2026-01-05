import type { Metadata } from 'next';
import { DevMenu } from './dev-menu';

export const metadata: Metadata = {
  title: 'Developer Menu',
  description: 'Feature flags, environment switching, and developer actions',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DevMenuPage() {
  return <DevMenu />;
}

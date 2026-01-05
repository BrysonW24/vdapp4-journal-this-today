import type { Metadata } from 'next';
import { ComponentShowcase } from './component-showcase';

export const metadata: Metadata = {
  title: 'Component Showcase',
  description: 'Browse all available UI components with live examples',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ComponentsPage() {
  return <ComponentShowcase />;
}

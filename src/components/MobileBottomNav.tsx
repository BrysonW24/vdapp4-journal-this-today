'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Lightbulb, MoreHorizontal } from 'lucide-react';

const tabs = [
  { href: '/journal', label: 'Journals', icon: BookOpen },
  { href: '/prompts', label: 'Prompts', icon: Lightbulb },
  { href: '/settings', label: 'More', icon: MoreHorizontal },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="mx-4 mb-2 bg-white/90 dark:bg-zen-night-card/90 backdrop-blur-xl rounded-2xl shadow-sm shadow-black/5 dark:shadow-black/20 border border-zen-sand/40 dark:border-zen-night-border/40">
        <div className="flex items-center justify-around h-[56px] px-2">
          {tabs.map((tab) => {
            const isActive =
              pathname === tab.href ||
              (tab.href === '/journal' && (pathname === '/' || pathname.startsWith('/journal'))) ||
              (tab.href === '/settings' && (pathname.startsWith('/settings') || pathname.startsWith('/calendar') || pathname.startsWith('/account') || pathname.startsWith('/help')));
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center justify-center gap-1.5 min-h-[40px] px-5 py-2 rounded-full transition-all ${
                  isActive
                    ? 'bg-zen-parchment dark:bg-zen-night-surface text-zen-forest dark:text-zen-parchment'
                    : 'text-zen-moss/50 dark:text-zen-stone/50 active:text-zen-forest'
                }`}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2 : 1.5}
                  fill={isActive ? 'currentColor' : 'none'}
                  className="transition-all flex-shrink-0"
                />
                <span className={`text-[11px] leading-none whitespace-nowrap ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

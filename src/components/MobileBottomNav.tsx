'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, CalendarDays, Lightbulb, MoreHorizontal } from 'lucide-react';

const tabs = [
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/prompts', label: 'Prompts', icon: Lightbulb },
  { href: '/more', label: 'More', icon: MoreHorizontal },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="mx-4 mb-2 bg-white/90 dark:bg-zen-night-card/90 backdrop-blur-xl rounded-2xl shadow-sm shadow-black/5 dark:shadow-black/20 border border-zen-sand/40 dark:border-zen-night-border/40">
        <div className="flex items-center justify-around h-[60px] px-1">
          {tabs.map((tab) => {
            const isActive =
              pathname === tab.href ||
              (tab.href === '/journal' && (pathname === '/' || pathname.startsWith('/journal'))) ||
              (tab.href === '/calendar' && pathname.startsWith('/calendar')) ||
              (tab.href === '/more' && (pathname.startsWith('/more') || pathname.startsWith('/settings') || pathname.startsWith('/account') || pathname.startsWith('/help')));
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center justify-center gap-1.5 min-h-[44px] px-3 py-2.5 rounded-full transition-all active:scale-[0.97] ${
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

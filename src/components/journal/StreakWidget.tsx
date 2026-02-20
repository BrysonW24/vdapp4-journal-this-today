'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { format, subDays, isToday } from 'date-fns';
import type { JournalEntry } from '@/types/journal';

interface StreakWidgetProps {
  currentStreak: number;
  entries: JournalEntry[];
}

export function StreakWidget({ currentStreak, entries }: StreakWidgetProps) {
  const streakDots = useMemo(() => {
    const dots: { day: string; hasEntry: boolean; isTodayDot: boolean }[] = [];
    const today = new Date();
    const dateSet = new Set(entries.map(e => format(new Date(e.createdAt), 'yyyy-MM-dd')));
    for (let i = 6; i >= 0; i--) {
      const d = subDays(today, i);
      dots.push({
        day: format(d, 'EEEEE'), // Single letter: M, T, W, T, F, S, S
        hasEntry: dateSet.has(format(d, 'yyyy-MM-dd')),
        isTodayDot: isToday(d),
      });
    }
    return dots;
  }, [entries]);

  if (currentStreak === 0) return null;

  return (
    <Link href="/more" className="block">
      <div className="bg-zen-parchment/50 dark:bg-zen-night-surface rounded-xl p-3.5 flex items-center gap-3 hover:bg-zen-parchment dark:hover:bg-zen-night-border/50 transition-colors">
        {/* Fire icon + streak count */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-2xl">🔥</span>
          <p className="text-sm font-bold text-zen-forest dark:text-zen-parchment">
            {currentStreak} day streak!
          </p>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Mini 7-day dots */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {streakDots.map((dot, i) => (
            <div
              key={i}
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-semibold ${
                dot.hasEntry
                  ? 'bg-zen-sage text-white'
                  : dot.isTodayDot
                  ? 'border border-zen-sage/40 text-zen-moss/60 dark:text-zen-stone/60'
                  : 'bg-zen-sand/50 dark:bg-zen-night-border text-zen-moss/30 dark:text-zen-stone/30'
              }`}
            >
              {dot.day}
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}

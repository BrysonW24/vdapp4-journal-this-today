'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  format,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';
import Link from 'next/link';
import type { JournalEntry } from '@/types/journal';
import { MOOD_METADATA } from '@/types/journal';

interface CalendarViewProps {
  entries: JournalEntry[];
}

export function CalendarView({ entries }: CalendarViewProps) {
  const todayRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Generate months: 12 months back through 12 months forward
  const months = useMemo(() => {
    const now = new Date();
    const result: Date[] = [];
    for (let i = -12; i <= 12; i++) {
      result.push(i < 0 ? subMonths(now, Math.abs(i)) : addMonths(now, i));
    }
    return result;
  }, []);

  // Scroll to current month on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (todayRef.current) {
        todayRef.current.scrollIntoView({ block: 'start', behavior: 'instant' });
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop -= 8;
        }
      }
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Build a quick lookup map for entries by date string
  const entriesByDate = useMemo(() => {
    const map = new Map<string, JournalEntry[]>();
    entries.forEach((entry) => {
      const key = format(new Date(entry.createdAt), 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(entry);
    });
    return map;
  }, [entries]);

  const getEntriesForDay = (day: Date) => {
    return entriesByDate.get(format(day, 'yyyy-MM-dd')) || [];
  };

  return (
    <div ref={scrollContainerRef}>
      {/* Day-of-week headers — sticky, matching Day One exactly */}
      <div className="sticky top-0 z-10 bg-white dark:bg-zen-night-card border-b border-zen-sand/30 dark:border-zen-night-border/30">
        <div className="grid grid-cols-7 px-1">
          {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
            <div
              key={day}
              className="text-center text-[11px] font-semibold text-zen-moss/35 dark:text-zen-stone/35 py-2 tracking-widest"
            >
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Continuous scrolling months */}
      {months.map((month) => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
        const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
        const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
        const isCurrentMonth =
          new Date().getMonth() === month.getMonth() &&
          new Date().getFullYear() === month.getFullYear();

        return (
          <div key={format(month, 'yyyy-MM')} ref={isCurrentMonth ? todayRef : undefined}>
            {/* Month header — Day One style */}
            <div className="px-3 pt-5 pb-2">
              <h3 className="text-[20px] font-bold text-zen-forest dark:text-zen-parchment tracking-tight">
                {format(month, 'MMMM yyyy')}
              </h3>
            </div>

            {/* Days grid — wider spacing to match Day One */}
            <div className="grid grid-cols-7 px-1">
              {days.map((day) => {
                const isCurrentMonthDay = day.getMonth() === month.getMonth();
                const isDayToday = isToday(day);
                const dayEntries = getEntriesForDay(day);
                const hasEntries = dayEntries.length > 0;
                const hasMood = hasEntries && dayEntries[0].mood;
                const moodData = hasMood ? MOOD_METADATA[dayEntries[0].mood!] : null;

                const dayLink =
                  dayEntries.length === 1
                    ? `/journal/${dayEntries[0].id}`
                    : dayEntries.length > 1
                    ? `/calendar`
                    : undefined;

                const dayContent = (
                  <div
                    className={`flex flex-col items-center justify-center py-2 min-h-[52px] ${
                      !isCurrentMonthDay ? 'opacity-0 pointer-events-none' : ''
                    }`}
                  >
                    {/* Day number — Day One uses ~18px numbers, today = dark filled circle */}
                    <div
                      className={`w-10 h-10 flex items-center justify-center rounded-full text-[18px] transition-all ${
                        isDayToday
                          ? 'bg-zen-night dark:bg-zen-parchment text-white dark:text-zen-night font-bold'
                          : hasEntries
                          ? 'text-zen-forest dark:text-zen-parchment font-semibold'
                          : 'text-zen-forest/80 dark:text-zen-stone/70 font-normal'
                      }`}
                    >
                      {format(day, 'd')}
                    </div>

                    {/* Subtle entry indicator — small dot or mood emoji below number */}
                    {hasEntries && (
                      <div className="flex items-center gap-0.5 mt-0.5 h-3">
                        {moodData ? (
                          <span className="text-[9px] leading-none">{moodData.emoji}</span>
                        ) : (
                          <div className="w-1 h-1 rounded-full bg-zen-sage/60" />
                        )}
                        {dayEntries.length > 1 && (
                          <span className="text-[7px] font-bold text-zen-moss/30 dark:text-zen-stone/30">
                            +{dayEntries.length - 1}
                          </span>
                        )}
                      </div>
                    )}
                    {/* Empty spacer when no entries to maintain consistent row height */}
                    {!hasEntries && <div className="h-3 mt-0.5" />}
                  </div>
                );

                return dayLink && isCurrentMonthDay ? (
                  <Link key={day.toISOString()} href={dayLink} className="block">
                    {dayContent}
                  </Link>
                ) : (
                  <div key={day.toISOString()}>{dayContent}</div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Bottom spacer for scroll */}
      <div className="h-32" />
    </div>
  );
}

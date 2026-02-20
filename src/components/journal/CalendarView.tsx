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
      {/* Day-of-week headers — sticky, crisp like Day One */}
      <div className="sticky top-0 z-10 bg-white dark:bg-zen-night-card border-b border-zen-sand/40 dark:border-zen-night-border/40">
        <div className="grid grid-cols-7 px-2">
          {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
            <div
              key={day}
              className="text-center text-[11px] font-bold text-zen-moss/50 dark:text-zen-stone/50 py-3 tracking-[0.08em]"
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
            {/* Month header — Day One uses bold, clear headers */}
            <div className="px-4 pt-6 pb-3">
              <h3 className="text-[22px] font-bold text-zen-forest dark:text-zen-parchment">
                {format(month, 'MMMM yyyy')}
              </h3>
            </div>

            {/* Days grid — spacious rows like Day One */}
            <div className="grid grid-cols-7 px-2">
              {days.map((day) => {
                const isCurrentMonthDay = day.getMonth() === month.getMonth();
                const isDayToday = isToday(day);
                const dayEntries = getEntriesForDay(day);
                const hasEntries = dayEntries.length > 0;
                const hasMood = hasEntries && dayEntries[0].mood;
                const moodData = hasMood ? MOOD_METADATA[dayEntries[0].mood!] : null;
                const hasMedia = hasEntries && dayEntries.some((e) => e.attachments && e.attachments.length > 0);
                const firstPhoto = hasMedia
                  ? dayEntries.flatMap(e => e.attachments || []).find(a => a.type === 'photo')
                  : null;

                const dayLink =
                  dayEntries.length === 1
                    ? `/journal/${dayEntries[0].id}`
                    : dayEntries.length > 1
                    ? `/calendar`
                    : undefined;

                const dayContent = (
                  <div
                    className={`relative flex flex-col items-center justify-center min-h-[64px] py-2 ${
                      !isCurrentMonthDay ? 'opacity-0 pointer-events-none' : ''
                    }`}
                  >
                    {/* Photo thumbnail background — Day One shows photos in calendar cells */}
                    {firstPhoto && isCurrentMonthDay && (
                      <div className="absolute inset-1 rounded-xl overflow-hidden">
                        <div
                          className="w-full h-full bg-cover bg-center opacity-25"
                          style={{ backgroundImage: `url(${firstPhoto.url})` }}
                        />
                      </div>
                    )}

                    {/* Day number — large, crisp like Day One (~22px) */}
                    <div
                      className={`relative z-10 w-11 h-11 flex items-center justify-center rounded-lg text-[22px] leading-none ${
                        isDayToday
                          ? 'bg-zen-night dark:bg-zen-parchment text-white dark:text-zen-night font-bold'
                          : hasEntries
                          ? 'text-zen-forest dark:text-zen-parchment font-semibold'
                          : 'text-zen-forest/70 dark:text-zen-stone/60 font-normal'
                      }`}
                    >
                      {format(day, 'd')}
                    </div>

                    {/* Subtle entry indicator — mood emoji or dot */}
                    {hasEntries && isCurrentMonthDay && (
                      <div className="relative z-10 flex items-center gap-0.5 mt-0.5 h-3">
                        {moodData ? (
                          <span className="text-[10px] leading-none">{moodData.emoji}</span>
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-zen-sage/50" />
                        )}
                        {dayEntries.length > 1 && (
                          <span className="text-[8px] font-bold text-zen-moss/40 dark:text-zen-stone/40">
                            +{dayEntries.length - 1}
                          </span>
                        )}
                      </div>
                    )}
                    {/* Spacer for consistent row height */}
                    {(!hasEntries || !isCurrentMonthDay) && <div className="h-3 mt-0.5" />}
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

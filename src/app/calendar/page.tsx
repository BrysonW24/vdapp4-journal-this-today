'use client';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { useJournalStore } from '@/stores/journal-store';
import { MOOD_METADATA } from '@/types/journal';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';

export default function CalendarPage() {
  const { entries, loadEntries } = useJournalStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEntriesForDay = (day: Date) => {
    return entries.filter((entry) =>
      isSameDay(new Date(entry.createdAt), day)
    );
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  return (
    <Layout>
      <div className="min-h-screen bg-zen-cream dark:bg-zen-night">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-zen-forest dark:text-zen-sage-light">
              Calendar
            </h1>
          </div>

          {/* Calendar Controls */}
          <div className="mb-8 flex items-center justify-between bg-white dark:bg-zen-night-card rounded-xl border border-zen-sand dark:border-zen-night-border p-6 shadow-sm">
            <button
              onClick={goToPreviousMonth}
              className="p-3 rounded-xl hover:bg-zen-parchment dark:hover:bg-zen-night-surface transition-colors"
            >
              <ChevronLeft size={24} className="text-zen-forest dark:text-zen-parchment" />
            </button>

            <div className="flex items-center gap-4">
              <CalendarIcon size={24} className="text-zen-sage dark:text-zen-sage-light" />
              <h2 className="text-xl font-semibold text-zen-forest dark:text-zen-parchment">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
            </div>

            <div className="flex gap-2">
              <button
                onClick={goToToday}
                className="px-6 py-3 bg-zen-sage-soft text-zen-sage dark:bg-zen-sage/20 dark:text-zen-sage-light rounded-xl font-medium hover:bg-zen-sage-light/30 dark:hover:bg-zen-sage/30 transition-colors"
              >
                Today
              </button>
              <button
                onClick={goToNextMonth}
                className="p-3 rounded-xl hover:bg-zen-parchment dark:hover:bg-zen-night-surface transition-colors"
              >
                <ChevronRight size={24} className="text-zen-forest dark:text-zen-parchment" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white dark:bg-zen-night-card rounded-xl border border-zen-sand dark:border-zen-night-border p-6 shadow-sm">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="text-center font-semibold text-zen-moss dark:text-zen-stone text-sm py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((day) => {
                const dayEntries = getEntriesForDay(day);
                const isCurrentMonth =
                  day.getMonth() === currentMonth.getMonth();
                const isDayToday = isToday(day);

                return (
                  <div
                    key={day.toString()}
                    className={`min-h-[120px] rounded-xl border p-3 transition-all ${
                      isDayToday
                        ? 'border-zen-sage bg-zen-sage-soft dark:border-zen-sage-light dark:bg-zen-sage/10'
                        : isCurrentMonth
                        ? 'border-zen-sand bg-white dark:border-zen-night-border dark:bg-zen-night-surface hover:border-zen-sage-light hover:shadow-sm'
                        : 'border-zen-sand/50 bg-zen-parchment dark:border-zen-night-border/50 dark:bg-zen-night'
                    }`}
                  >
                    <div
                      className={`text-sm font-semibold mb-2 ${
                        isDayToday
                          ? 'text-zen-sage dark:text-zen-sage-light'
                          : isCurrentMonth
                          ? 'text-zen-forest dark:text-zen-parchment'
                          : 'text-zen-stone dark:text-zen-stone/50'
                      }`}
                    >
                      {format(day, 'd')}
                    </div>

                    {dayEntries.length > 0 && (
                      <div className="space-y-1">
                        {dayEntries.slice(0, 2).map((entry) => {
                          const moodData = entry.mood
                            ? MOOD_METADATA[entry.mood]
                            : null;

                          return (
                            <Link
                              key={entry.id}
                              href={`/journal/${entry.id}`}
                              className="block"
                            >
                              <div
                                className="rounded-lg p-2 text-xs hover:scale-105 transition-transform cursor-pointer"
                                style={{
                                  backgroundColor: moodData?.bgColor || '#F3F4F6',
                                  borderLeft: `3px solid ${moodData?.color || '#9CA3AF'}`,
                                }}
                              >
                                <div className="flex items-center gap-1">
                                  {moodData && (
                                    <span className="text-sm">{moodData.emoji}</span>
                                  )}
                                  <span
                                    className="truncate font-medium"
                                    style={{ color: moodData?.color || '#374151' }}
                                  >
                                    {entry.title || 'Untitled'}
                                  </span>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                        {dayEntries.length > 2 && (
                          <div className="text-xs text-zen-stone text-center py-1">
                            +{dayEntries.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-8 bg-white dark:bg-zen-night-card rounded-xl border border-zen-sand dark:border-zen-night-border p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-zen-forest dark:text-zen-parchment mb-4">Mood Legend</h3>
            <div className="flex flex-wrap gap-4">
              {Object.values(MOOD_METADATA).map((mood) => (
                <div key={mood.label} className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                    style={{
                      backgroundColor: mood.bgColor,
                      borderColor: mood.borderColor,
                      borderWidth: '2px',
                    }}
                  >
                    {mood.emoji}
                  </div>
                  <span className="text-sm font-medium text-zen-moss dark:text-zen-stone">
                    {mood.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

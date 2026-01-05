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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Calendar View
            </h1>
            <p className="text-xl text-gray-600">
              See your journaling journey at a glance
            </p>
          </div>

          {/* Calendar Controls */}
          <div className="mb-8 flex items-center justify-between bg-white rounded-xl border-2 border-gray-100 p-6">
            <button
              onClick={goToPreviousMonth}
              className="p-3 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft size={24} className="text-gray-700" />
            </button>

            <div className="flex items-center gap-4">
              <CalendarIcon size={24} className="text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
            </div>

            <div className="flex gap-2">
              <button
                onClick={goToToday}
                className="px-6 py-3 bg-blue-100 text-blue-700 rounded-xl font-medium hover:bg-blue-200 transition-colors"
              >
                Today
              </button>
              <button
                onClick={goToNextMonth}
                className="p-3 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <ChevronRight size={24} className="text-gray-700" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white rounded-xl border-2 border-gray-100 p-6 shadow-sm">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="text-center font-semibold text-gray-600 text-sm py-2"
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
                    className={`min-h-[120px] rounded-xl border-2 p-3 transition-all ${
                      isDayToday
                        ? 'border-blue-500 bg-blue-50'
                        : isCurrentMonth
                        ? 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                        : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    <div
                      className={`text-sm font-semibold mb-2 ${
                        isDayToday
                          ? 'text-blue-600'
                          : isCurrentMonth
                          ? 'text-gray-900'
                          : 'text-gray-400'
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
                          <div className="text-xs text-gray-500 text-center py-1">
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
          <div className="mt-8 bg-white rounded-xl border-2 border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood Legend</h3>
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
                  <span className="text-sm font-medium text-gray-700">
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

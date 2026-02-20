'use client';

import { useEffect, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { useJournalStore } from '@/stores/journal-store';
import { DEFAULT_PROMPT_PACKS } from '@/types/journal';
import {
  Lightbulb,
  CalendarDays,
  FileText,
  Mic,
  ChevronRight,
  Settings,
  Flame,
  Image as ImageIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format, isToday, subDays } from 'date-fns';
import { MoodHeatmap } from '@/components/journal/MoodHeatmap';
import { WeeklySparkline } from '@/components/journal/WeeklySparkline';
import { ActivityRing } from '@/components/journal/ActivityRing';

export default function MorePage() {
  const router = useRouter();
  const {
    entries,
    loadEntries,
    getOnThisDay,
    getCurrentStreak,
  } = useJournalStore();

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const onThisDay = getOnThisDay();
  const currentStreak = getCurrentStreak();
  const longestStreak = useMemo(() => {
    // Calculate longest streak from entries
    if (entries.length === 0) return 0;
    const dates = new Set(entries.map(e => format(new Date(e.createdAt), 'yyyy-MM-dd')));
    let longest = 0;
    let current = 0;
    const today = new Date();
    // Check last 365 days
    for (let i = 0; i < 365; i++) {
      const day = format(subDays(today, i), 'yyyy-MM-dd');
      if (dates.has(day)) {
        current++;
        longest = Math.max(longest, current);
      } else {
        current = 0;
      }
    }
    return longest;
  }, [entries]);

  // Streak dots — last 7 days
  const streakDots = useMemo(() => {
    const dots: { day: number; dayLetter: string; hasEntry: boolean; isTodayDot: boolean }[] = [];
    const today = new Date();
    const dateSet = new Set(entries.map(e => format(new Date(e.createdAt), 'yyyy-MM-dd')));
    for (let i = 6; i >= 0; i--) {
      const d = subDays(today, i);
      dots.push({
        day: d.getDate(),
        dayLetter: format(d, 'EEEEE'),
        hasEntry: dateSet.has(format(d, 'yyyy-MM-dd')),
        isTodayDot: isToday(d),
      });
    }
    return dots;
  }, [entries]);

  // Has user written today?
  const hasWrittenToday = useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return entries.some(e => format(new Date(e.createdAt), 'yyyy-MM-dd') === todayStr);
  }, [entries]);

  // Achievement badges
  const achievements = useMemo(() => {
    return [
      { icon: '\u270F\uFE0F', label: 'First Entry', earned: entries.length >= 1 },
      { icon: '\uD83D\uDD25', label: '7 Day Streak', earned: currentStreak >= 7 || longestStreak >= 7 },
      { icon: '\uD83D\uDC8E', label: '30 Day Streak', earned: currentStreak >= 30 || longestStreak >= 30 },
      { icon: '\uD83D\uDCDA', label: '100 Entries', earned: entries.length >= 100 },
    ];
  }, [entries, currentStreak, longestStreak]);

  // Random daily prompt
  const dailyPrompt = useMemo(() => {
    const allPrompts = DEFAULT_PROMPT_PACKS.flatMap(p => p.prompts);
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return allPrompts[dayOfYear % allPrompts.length];
  }, []);

  const handlePromptClick = (question: string) => {
    router.push(`/journal/new?prompt=${encodeURIComponent(question)}`);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-zen-cream dark:bg-zen-night">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-[28px] font-bold text-zen-forest dark:text-zen-parchment">
              More
            </h1>
            <Link href="/account" className="w-9 h-9 bg-zen-sage/15 rounded-full flex items-center justify-center">
              <span className="text-zen-sage font-semibold text-sm">Y</span>
            </Link>
          </div>

          {/* Quick Start */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-zen-forest dark:text-zen-parchment">Quick Start</h2>
              <Link href="/journal/new" className="text-zen-sage text-sm font-medium">See more</Link>
            </div>
            <p className="text-sm text-zen-moss/60 dark:text-zen-stone/60 mb-4">
              Instantly create an entry with one of the following:
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Lightbulb, label: 'Suggestions', href: '/prompts' },
                { icon: CalendarDays, label: 'Day View', href: '/journal' },
                { icon: FileText, label: 'Templates', href: '/journal/new' },
                { icon: Mic, label: 'Audio', href: '/journal/new' },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white dark:bg-zen-night-card border border-zen-sand/60 dark:border-zen-night-border/60 hover:border-zen-sage/30 transition-colors"
                >
                  <item.icon size={20} className="text-zen-moss/60 dark:text-zen-stone/60" />
                  <span className="text-[11px] font-medium text-zen-moss/70 dark:text-zen-stone/70">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* On This Day */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-zen-forest dark:text-zen-parchment">On This Day</h2>
                <span className="px-2 py-0.5 bg-zen-parchment dark:bg-zen-night-surface rounded-full text-xs font-medium text-zen-moss dark:text-zen-stone">
                  {format(new Date(), 'MMM d')}
                </span>
              </div>
              <span className="text-zen-sage text-sm font-medium">See more</span>
            </div>
            {onThisDay.length > 0 ? (
              <div className="space-y-2">
                {onThisDay.slice(0, 3).map((entry) => (
                  <Link
                    key={entry.id}
                    href={`/journal/${entry.id}`}
                    className="block bg-white dark:bg-zen-night-card rounded-xl border border-zen-sand/60 dark:border-zen-night-border/60 p-3.5 hover:border-zen-sage/30 transition-colors"
                  >
                    <p className="font-medium text-sm text-zen-forest dark:text-zen-parchment">{entry.title}</p>
                    <p className="text-xs text-zen-moss/50 dark:text-zen-stone/50 mt-0.5">
                      {new Date(entry.createdAt).getFullYear()}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-zen-night-card rounded-xl border border-zen-sand/60 dark:border-zen-night-border/60 p-4">
                <p className="text-sm text-zen-moss/60 dark:text-zen-stone/60">
                  No past memories yet! Create an entry now, and you&apos;ll see it here next year.
                </p>
                {/* Year pills */}
                <div className="flex gap-2 mt-3">
                  {[2025, 2024, 2023].map((year) => (
                    <span
                      key={year}
                      className="px-4 py-1.5 rounded-full bg-zen-sage/8 dark:bg-zen-sage/15 text-zen-sage text-sm font-medium"
                    >
                      {year}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Daily Prompt */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-zen-forest dark:text-zen-parchment">Daily Prompt</h2>
              <Link href="/prompts" className="text-zen-sage text-sm font-medium">See more</Link>
            </div>
            <button
              onClick={() => handlePromptClick(dailyPrompt?.question || '')}
              className="w-full bg-zen-sage dark:bg-zen-sage/80 rounded-2xl p-6 text-white text-left hover:shadow-md transition-all"
            >
              <p className="text-[17px] font-medium leading-snug">
                {dailyPrompt?.question || 'What happened today?'}
              </p>
            </button>
          </div>

          {/* Streak — Duolingo style */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-zen-forest dark:text-zen-parchment">Streak</h2>
            </div>
            <div className="bg-white dark:bg-zen-night-card rounded-xl border border-zen-sand/60 dark:border-zen-night-border/60 overflow-hidden">

              {/* Hero section with Activity Rings */}
              <div className="bg-gradient-to-b from-zen-sage/10 to-transparent dark:from-zen-sage/5 p-6">
                <div className="flex items-center justify-center gap-6">
                  <ActivityRing
                    value={currentStreak}
                    max={Math.max(longestStreak, 7)}
                    size={90}
                    strokeWidth={7}
                    color="#5B7F5E"
                    label="streak"
                  />
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-zen-forest dark:text-zen-parchment">
                      {currentStreak > 0
                        ? `${currentStreak} day streak!`
                        : 'Start your streak!'}
                    </h3>
                    <p className="text-sm text-zen-moss/60 dark:text-zen-stone/60 mt-1">
                      {currentStreak > 0 && !hasWrittenToday
                        ? "Don\u2019t break your streak! Write today."
                        : currentStreak > 0 && hasWrittenToday
                        ? 'Great job! Keep it going tomorrow.'
                        : 'Write your first entry today to begin.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 space-y-5">
                {/* Current / Longest streak with rings */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <ActivityRing value={currentStreak} max={Math.max(longestStreak, 7)} size={48} strokeWidth={4} color="#5B7F5E" />
                    <div>
                      <p className="text-xs text-zen-moss/50 dark:text-zen-stone/50 font-medium">Current</p>
                      <p className="text-lg font-bold text-zen-forest dark:text-zen-parchment">{currentStreak}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ActivityRing value={longestStreak} max={Math.max(longestStreak, 7)} size={48} strokeWidth={4} color="#C4956A" />
                    <div>
                      <p className="text-xs text-zen-moss/50 dark:text-zen-stone/50 font-medium">Longest</p>
                      <p className="text-lg font-bold text-zen-forest dark:text-zen-parchment">{longestStreak}</p>
                    </div>
                  </div>
                </div>

                {/* Day dots — last 7 days */}
                <div className="flex items-center justify-between">
                  {streakDots.map((dot, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                          dot.hasEntry
                            ? 'bg-zen-sage text-white shadow-sm'
                            : dot.isTodayDot
                            ? 'border-2 border-zen-sage/40 text-zen-forest dark:text-zen-parchment'
                            : 'bg-zen-parchment/60 dark:bg-zen-night-surface text-zen-moss/40 dark:text-zen-stone/40'
                        }`}
                      >
                        {dot.hasEntry ? '\u2713' : dot.day}
                      </div>
                      {dot.isTodayDot && (
                        <div className="w-1.5 h-1.5 rounded-full bg-zen-sage" />
                      )}
                    </div>
                  ))}
                </div>

                {/* D3 Activity Sparkline — last 30 days */}
                <div>
                  <p className="text-xs text-zen-moss/50 dark:text-zen-stone/50 font-medium mb-2">Activity — Last 30 Days</p>
                  <WeeklySparkline entries={entries} days={30} height={56} color="#5B7F5E" />
                </div>

                {/* Achievement Badges */}
                <div>
                  <p className="text-xs text-zen-moss/50 dark:text-zen-stone/50 font-medium mb-3">Achievements</p>
                  <div className="grid grid-cols-4 gap-2">
                    {achievements.map((badge) => (
                      <div
                        key={badge.label}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                          badge.earned
                            ? 'bg-zen-sage/5 border-zen-sage/20 dark:bg-zen-sage/10 dark:border-zen-sage/20'
                            : 'bg-zen-parchment/30 dark:bg-zen-night-surface border-zen-sand/30 dark:border-zen-night-border/30 opacity-40'
                        }`}
                      >
                        <span className="text-2xl">{badge.icon}</span>
                        <span className="text-[10px] font-medium text-zen-moss/60 dark:text-zen-stone/60 text-center leading-tight">
                          {badge.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* D3 Mood Heatmap */}
          <div className="mb-8">
            <div className="bg-white dark:bg-zen-night-card rounded-xl border border-zen-sand/60 dark:border-zen-night-border/60 p-5">
              <MoodHeatmap entries={entries} weeks={12} />
            </div>
          </div>

          {/* Photo Library CTA */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-zen-forest dark:text-zen-parchment mb-3">Add from Photo Library</h2>
            <div className="bg-white dark:bg-zen-night-card rounded-xl border border-zen-sand/60 dark:border-zen-night-border/60 p-4">
              <p className="text-sm text-zen-moss/60 dark:text-zen-stone/60 mb-3">
                Photo library access is required to show photos from your photo library.
              </p>
              <button className="w-full py-2.5 rounded-xl bg-zen-sage/10 text-zen-sage font-medium text-sm hover:bg-zen-sage/15 transition-colors">
                Enable Photo Library Access
              </button>
            </div>
          </div>

          {/* Settings & Links */}
          <div className="rounded-xl overflow-hidden border border-zen-sand/60 dark:border-zen-night-border/60 divide-y divide-zen-sand/40 dark:divide-zen-night-border/40 mb-8">
            {[
              { icon: Settings, label: 'Settings', href: '/settings' },
              { icon: Flame, label: 'Premium', href: '/premium' },
              { icon: ImageIcon, label: 'Account', href: '/account' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center px-4 py-3.5 bg-white dark:bg-zen-night-card hover:bg-zen-parchment dark:hover:bg-zen-night-surface transition-colors"
              >
                <item.icon size={18} className="text-zen-moss/60 dark:text-zen-stone/60 mr-3" />
                <span className="flex-1 text-[15px] font-medium text-zen-forest dark:text-zen-parchment">{item.label}</span>
                <ChevronRight size={16} className="text-zen-stone/40" />
              </Link>
            ))}
          </div>

          {/* Bottom spacer */}
          <div className="h-8" />
        </div>
      </div>
    </Layout>
  );
}

'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useJournalStore } from '@/stores/journal-store';
import { useJournalsStore } from '@/stores/journals-store';
import { EntryCard } from '@/components/journal/EntryCard';
import { Layout } from '@/components/Layout';
import { BookOpen, Star, Search, Plus, ChevronDown, Settings, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import type { Journal } from '@/lib/db';
import { TutorialOverlay } from '@/components/onboarding/TutorialOverlay';
import { CalendarView } from '@/components/journal/CalendarView';
import { MediaView } from '@/components/journal/MediaView';
import { MapView } from '@/components/journal/MapView';
import { ActivityRing } from '@/components/journal/ActivityRing';
import { WeeklySparkline } from '@/components/journal/WeeklySparkline';

export default function JournalPage() {
  const {
    entries,
    loadEntries,
    isLoading,
    getOnThisDay,
    getCurrentStreak,
    getDaysJournaled,
  } = useJournalStore();

  const { journals, loadJournals, selectedJournalId, selectJournal } = useJournalsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [activeView, setActiveView] = useState<'list' | 'calendar' | 'media' | 'map'>('list');
  const [showJournalMenu, setShowJournalMenu] = useState(false);
  const journalMenuRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (journalMenuRef.current && !journalMenuRef.current.contains(event.target as Node)) {
      setShowJournalMenu(false);
    }
  }, []);

  useEffect(() => {
    if (showJournalMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showJournalMenu, handleClickOutside]);

  useEffect(() => {
    loadEntries();
    loadJournals();
  }, [loadEntries, loadJournals]);

  const selectedJournal: Journal | undefined = journals.find(j => j.id === selectedJournalId) || journals.find(j => j.isDefault) || journals[0];

  const journalFilteredEntries = selectedJournal
    ? entries.filter(e => e.journalId === selectedJournal.id)
    : entries;

  const displayedEntries =
    filter === 'favorites'
      ? journalFilteredEntries.filter(e => e.isFavorite)
      : searchQuery
      ? journalFilteredEntries.filter(e =>
          e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : journalFilteredEntries;

  const onThisDay = getOnThisDay();

  const groupedEntries = React.useMemo(() => {
    const groups: {
      [year: string]: {
        [month: string]: typeof displayedEntries;
      };
    } = {};

    displayedEntries.forEach((entry) => {
      const date = new Date(entry.createdAt);
      const year = date.getFullYear().toString();
      const month = date.toLocaleDateString('en-US', { month: 'long' });

      if (!groups[year]) {
        groups[year] = {};
      }
      if (!groups[year][month]) {
        groups[year][month] = [];
      }
      groups[year][month].push(entry);
    });

    return groups;
  }, [displayedEntries]);

  const currentYear = new Date().getFullYear();

  return (
    <Layout>
      <div className="min-h-screen bg-white dark:bg-zen-night-card -mt-12">
        {/* Hero Header — sage green */}
        <div
          className="relative pt-[env(safe-area-inset-top)]"
          style={{
            background: 'linear-gradient(160deg, #6B8F6E 0%, #5B7F5E 40%, #4A6E4D 100%)',
          }}
        >
          {/* Subtle dot pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '20px 20px',
          }} />

          <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-8 pb-20">
            {/* Journal Selector */}
            <div className="relative" ref={journalMenuRef} data-tour-step="journal-selector">
              <button
                onClick={() => setShowJournalMenu(!showJournalMenu)}
                className="flex items-center gap-2 group"
              >
                <h1 className="text-[30px] sm:text-[34px] font-bold text-white tracking-tight">
                  {selectedJournal?.name || 'Journal'}
                </h1>
                <ChevronDown
                  size={18}
                  className="text-white/40 group-hover:text-white/70 transition-colors mt-1"
                />
              </button>
              <p className="text-white/50 text-sm mt-1 tracking-wide font-medium">{currentYear}</p>

              {/* Dropdown Menu */}
              {showJournalMenu && (
                <div className="absolute top-full left-0 mt-3 w-64 bg-white dark:bg-zen-night-card rounded-xl shadow-lg border border-zen-sand dark:border-zen-night-border z-50 overflow-hidden">
                  <div className="p-2">
                    {journals.map((journal) => (
                      <button
                        key={journal.id}
                        onClick={() => {
                          selectJournal(journal.id);
                          setShowJournalMenu(false);
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                          journal.id === selectedJournal?.id
                            ? 'bg-zen-sage/10 border border-zen-sage/20'
                            : 'hover:bg-zen-parchment dark:hover:bg-zen-night-surface'
                        }`}
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                          style={{ backgroundColor: journal.color + '15' }}
                        >
                          {journal.icon}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-zen-forest dark:text-zen-parchment">{journal.name}</p>
                          <p className="text-xs text-zen-moss dark:text-zen-stone">{entries.filter(e => e.journalId === journal.id).length} entries</p>
                        </div>
                        {journal.isDefault && (
                          <Star size={14} className="text-zen-sage" fill="currentColor" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-zen-sand dark:border-zen-night-border">
                    <Link
                      href="/journals"
                      className="flex items-center gap-2 px-5 py-3 text-sm text-zen-moss dark:text-zen-stone hover:bg-zen-parchment dark:hover:bg-zen-night-surface transition-colors"
                      onClick={() => setShowJournalMenu(false)}
                    >
                      <Settings size={14} />
                      <span>Manage Journals</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Card — overlaps hero */}
        <div className="relative -mt-10">
          <div className="bg-white dark:bg-zen-night-card rounded-t-[24px] min-h-[60vh]" style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.04)' }}>
            {/* View Tabs — Day One style, sticky below header */}
            <div
              className="sticky z-30 bg-white dark:bg-zen-night-card flex items-center gap-0.5 px-4 pt-4 pb-2 border-b border-zen-sand/50 dark:border-zen-night-border/50"
              style={{ top: 'calc(48px + env(safe-area-inset-top))' }}
            >
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="px-3 py-2 text-zen-moss/60 dark:text-zen-stone/60 hover:text-zen-forest dark:hover:text-zen-parchment transition-colors"
                title={viewMode === 'grid' ? 'Switch to list' : 'Switch to grid'}
              >
                <BookOpen size={17} />
              </button>
              <div className="w-px h-4 bg-zen-sand/60 dark:bg-zen-night-border/60 mx-1" />
              {(['list', 'calendar', 'media', 'map'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveView(tab)}
                  className={`relative px-3.5 py-2 text-[14px] font-medium transition-colors ${
                    activeView === tab
                      ? 'text-zen-forest dark:text-zen-parchment'
                      : 'text-zen-moss/40 dark:text-zen-stone/40 hover:text-zen-moss dark:hover:text-zen-stone'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {activeView === tab && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full bg-zen-forest dark:bg-zen-parchment" />
                  )}
                </button>
              ))}
            </div>

            {/* Stats + Activity — only on List view */}
            {activeView === 'list' && (
              <div className="px-4 py-4 space-y-3">
                {/* Stats Row — rings + numbers */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-zen-parchment/50 dark:bg-zen-night-surface rounded-xl p-3 flex flex-col items-center">
                    <ActivityRing
                      value={journalFilteredEntries.length}
                      max={Math.max(journalFilteredEntries.length, 30)}
                      size={44}
                      strokeWidth={4}
                      color="#5B7F5E"
                    />
                    <span className="text-[11px] text-zen-moss/50 dark:text-zen-stone/50 font-medium mt-1.5">Entries</span>
                  </div>
                  <div className="bg-zen-parchment/50 dark:bg-zen-night-surface rounded-xl p-3 flex flex-col items-center">
                    <ActivityRing
                      value={getCurrentStreak()}
                      max={Math.max(getCurrentStreak(), 7)}
                      size={44}
                      strokeWidth={4}
                      color="#C4956A"
                    />
                    <span className="text-[11px] text-zen-moss/50 dark:text-zen-stone/50 font-medium mt-1.5">Streak</span>
                  </div>
                  <div className="bg-zen-parchment/50 dark:bg-zen-night-surface rounded-xl p-3 flex flex-col items-center">
                    <ActivityRing
                      value={getDaysJournaled()}
                      max={Math.max(getDaysJournaled(), 30)}
                      size={44}
                      strokeWidth={4}
                      color="#6B8F6E"
                    />
                    <span className="text-[11px] text-zen-moss/50 dark:text-zen-stone/50 font-medium mt-1.5">Days</span>
                  </div>
                  <div className="bg-zen-parchment/50 dark:bg-zen-night-surface rounded-xl p-3 flex flex-col items-center">
                    <ActivityRing
                      value={journalFilteredEntries.filter(e => e.attachments?.some(a => a.type === 'photo')).length}
                      max={Math.max(journalFilteredEntries.length, 1)}
                      size={44}
                      strokeWidth={4}
                      color="#7FB5B0"
                    />
                    <span className="text-[11px] text-zen-moss/50 dark:text-zen-stone/50 font-medium mt-1.5">Media</span>
                  </div>
                </div>

                {/* Activity Sparkline */}
                <div className="bg-zen-parchment/50 dark:bg-zen-night-surface rounded-xl p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zen-moss/60 dark:text-zen-stone/60 font-medium">30-Day Activity</span>
                    <TrendingUp size={13} className="text-zen-sage/40" />
                  </div>
                  <WeeklySparkline entries={journalFilteredEntries} days={30} height={40} color="#5B7F5E" />
                </div>
              </div>
            )}

            {/* Content Area — full-bleed for calendar/media/map, padded for list */}
            <div className={activeView === 'list' ? 'px-4 py-3' : ''}>
              {/* List View */}
              {activeView === 'list' && (
                <>
                  {/* Search & Filters — only when there are entries */}
                  {journalFilteredEntries.length > 0 && (
                    <div className="mb-4 flex flex-col sm:flex-row gap-2 items-center justify-between">
                      <div className="relative flex-1 w-full">
                        <Search
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-zen-moss/30"
                          size={15}
                        />
                        <input
                          type="text"
                          placeholder="Search entries..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-zen-sand/60 dark:border-zen-night-border rounded-lg text-sm focus:border-zen-sage focus:ring-1 focus:ring-zen-sage/20 transition-all bg-zen-parchment/30 dark:bg-zen-night-surface text-zen-forest dark:text-zen-parchment placeholder-zen-moss/30"
                        />
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setFilter('all')}
                          className={`px-3.5 py-1.5 rounded-lg font-medium text-xs transition-all ${
                            filter === 'all'
                              ? 'bg-zen-sage text-white'
                              : 'text-zen-moss/60 dark:text-zen-stone/60 hover:bg-zen-parchment/60 dark:hover:bg-zen-night-surface'
                          }`}
                        >
                          All
                        </button>
                        <button
                          onClick={() => setFilter('favorites')}
                          className={`px-3.5 py-1.5 rounded-lg font-medium text-xs transition-all flex items-center gap-1 ${
                            filter === 'favorites'
                              ? 'bg-zen-sage text-white'
                              : 'text-zen-moss/60 dark:text-zen-stone/60 hover:bg-zen-parchment/60 dark:hover:bg-zen-night-surface'
                          }`}
                        >
                          <Star size={11} />
                          Favorites
                        </button>
                      </div>
                    </div>
                  )}

                  {/* On This Day */}
                  {onThisDay.length > 0 && (
                    <div className="mb-5 bg-zen-sage/6 rounded-xl p-4 border border-zen-sage/8">
                      <h2 className="text-xs font-semibold text-zen-sage uppercase tracking-wider mb-3">On This Day</h2>
                      <div className="flex gap-2.5 overflow-x-auto">
                        {onThisDay.map((entry) => (
                          <Link
                            key={entry.id}
                            href={`/journal/${entry.id}`}
                            className="min-w-[180px] bg-white dark:bg-zen-night-card rounded-lg p-3 border border-zen-sand/60 dark:border-zen-night-border hover:border-zen-sage/30 transition-all"
                          >
                            <p className="font-medium text-sm text-zen-forest dark:text-zen-parchment mb-0.5">{entry.title}</p>
                            <p className="text-xs text-zen-moss/60 dark:text-zen-stone/60">
                              {new Date(entry.createdAt).getFullYear()}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Entries */}
                  {isLoading ? (
                    <div className="flex flex-col gap-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-xl p-4 animate-pulse border border-zen-sand/40 dark:border-zen-night-border/40">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-7 h-7 bg-zen-sand/40 dark:bg-zen-night-border rounded-lg" />
                            <div className="flex-1">
                              <div className="h-3 bg-zen-sand/40 dark:bg-zen-night-border rounded w-3/4 mb-1.5" />
                              <div className="h-2 bg-zen-sand/30 dark:bg-zen-night-border/60 rounded w-1/3" />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <div className="h-2 bg-zen-sand/30 dark:bg-zen-night-border/60 rounded w-full" />
                            <div className="h-2 bg-zen-sand/30 dark:bg-zen-night-border/60 rounded w-4/5" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : displayedEntries.length === 0 ? (
                    /* Empty Timeline */
                    <div className="flex flex-col items-center justify-center py-24">
                      <div className="w-20 h-20 bg-zen-sage/10 dark:bg-zen-sage/5 rounded-full flex items-center justify-center mb-5">
                        <BookOpen size={32} className="text-zen-sage/50" />
                      </div>
                      <h3 className="text-[17px] font-medium text-zen-moss/60 dark:text-zen-stone/60 mb-1.5">
                        Empty Timeline
                      </h3>
                      <p className="text-sm text-zen-moss/35 dark:text-zen-stone/35 mb-5 text-center max-w-[260px]">
                        Your story starts here. Write your first entry to begin your journal.
                      </p>
                      <Link
                        href="/journal/new"
                        className="px-5 py-2.5 bg-zen-sage text-white text-sm font-medium rounded-xl hover:bg-zen-sage-light transition-all active:scale-[0.97]"
                      >
                        Start Writing
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {Object.keys(groupedEntries)
                        .sort((a, b) => parseInt(b) - parseInt(a))
                        .map((year) => (
                          <div key={year}>
                            <div className="sticky top-12 z-20 bg-white/90 dark:bg-zen-night-card/90 backdrop-blur-sm pb-2 mb-2">
                              <h2 className="text-lg font-light text-zen-forest/80 dark:text-zen-parchment/80">
                                {year}
                              </h2>
                            </div>

                            <div className="space-y-5">
                              {Object.keys(groupedEntries[year])
                                .sort((a, b) => {
                                  const monthOrder = [
                                    'January', 'February', 'March', 'April', 'May', 'June',
                                    'July', 'August', 'September', 'October', 'November', 'December',
                                  ];
                                  return monthOrder.indexOf(b) - monthOrder.indexOf(a);
                                })
                                .map((month) => (
                                  <div key={month}>
                                    <div className="flex items-center gap-3 mb-2.5">
                                      <div className="h-px flex-1 bg-zen-sand/60 dark:bg-zen-night-border/60"></div>
                                      <h3 className="text-[11px] font-medium text-zen-moss/40 dark:text-zen-stone/40 uppercase tracking-widest">
                                        {month}
                                      </h3>
                                      <div className="h-px flex-1 bg-zen-sand/60 dark:bg-zen-night-border/60"></div>
                                    </div>

                                    {(() => {
                                      // Group entries by day within the month
                                      const dayGroups: { [dayKey: string]: typeof displayedEntries } = {};
                                      groupedEntries[year][month].forEach((entry) => {
                                        const dayKey = format(new Date(entry.createdAt), 'EEEE d');
                                        if (!dayGroups[dayKey]) dayGroups[dayKey] = [];
                                        dayGroups[dayKey].push(entry);
                                      });

                                      return (
                                        <div className="space-y-3">
                                          {Object.entries(dayGroups).map(([dayKey, dayEntries]) => (
                                            <div key={dayKey}>
                                              <p className="text-[11px] font-medium text-zen-moss/35 dark:text-zen-stone/35 mb-1.5 ml-1">
                                                {dayKey}
                                              </p>
                                              <div
                                                className={
                                                  viewMode === 'grid'
                                                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5'
                                                    : 'flex flex-col gap-2'
                                                }
                                              >
                                                {dayEntries.map((entry) => (
                                                  <EntryCard key={entry.id} entry={entry} />
                                                ))}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </>
              )}

              {/* Calendar View — continuous scrolling months */}
              {activeView === 'calendar' && (
                <CalendarView entries={journalFilteredEntries} />
              )}

              {/* Media View — grid timeline with filters */}
              {activeView === 'media' && (
                <MediaView entries={journalFilteredEntries} />
              )}

              {/* Map View — interactive map with entry pins */}
              {activeView === 'map' && (
                <MapView entries={journalFilteredEntries} />
              )}
            </div>
          </div>
        </div>

        {/* Floating Action Button */}
        <Link
          href="/journal/new"
          className="fixed bottom-24 md:bottom-8 right-5 md:right-8 w-14 h-14 bg-zen-clay text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all hover:scale-105 z-40"
          style={{
            boxShadow: '0 4px 20px rgba(196, 149, 106, 0.35)',
          }}
        >
          <Plus size={26} strokeWidth={2.5} />
        </Link>
      </div>
      <TutorialOverlay />
    </Layout>
  );
}

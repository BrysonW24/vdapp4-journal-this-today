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


  return (
    <Layout>
      <div className="min-h-screen bg-zen-parchment/30 dark:bg-zen-night -mt-12">
        {/* Hero Header — gradient mesh with depth */}
        <div
          className="relative pt-[env(safe-area-inset-top)] overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, #6B8F6E 0%, #5B7F5E 30%, #4A7A6A 60%, #3D6B5A 100%)',
          }}
        >
          {/* Mesh gradient overlay — inspired by 21st.dev Hero components */}
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at 30% 20%, rgba(139,174,140,0.4) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(123,164,184,0.2) 0%, transparent 40%), radial-gradient(ellipse at 90% 10%, rgba(196,149,106,0.15) 0%, transparent 40%)',
          }} />
          {/* Grid pattern — from 21st.dev Hero section design */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%)',
          }} />
          {/* Floating ambient orbs for depth */}
          <div className="absolute top-8 left-[15%] w-48 h-48 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-4 right-[10%] w-64 h-64 rounded-full bg-zen-creek/10 blur-3xl" />

          <div className="relative max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-24">
            {/* Journal Selector */}
            <div className="relative" ref={journalMenuRef} data-tour-step="journal-selector">
              <button
                onClick={() => setShowJournalMenu(!showJournalMenu)}
                className="flex items-center gap-2.5 group"
              >
                <h1 className="text-[32px] sm:text-[38px] font-serif font-bold text-white tracking-tight drop-shadow-sm">
                  {selectedJournal?.name || 'Journal'}
                </h1>
                <ChevronDown
                  size={18}
                  className="text-white/40 group-hover:text-white/70 transition-colors mt-1.5"
                />
              </button>
              <p className="text-white/50 text-sm mt-2 tracking-wide font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>

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

        {/* Content Card — overlaps hero with glassmorphism depth */}
        <div className="relative -mt-14 max-w-4xl mx-auto px-2 sm:px-0">
          <div className="bg-white/95 dark:bg-zen-night-card/95 backdrop-blur-sm rounded-t-[28px] min-h-[60vh] elevation-3">
            {/* View Tabs — sticky with glassmorphism */}
            <div
              className="sticky z-30 bg-white/90 dark:bg-zen-night-card/90 backdrop-blur-md flex items-center gap-0.5 px-4 pt-4 pb-2 border-b border-zen-sand/30 dark:border-zen-night-border/30 rounded-t-[28px]"
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

            {/* Stats + Activity — glassmorphism cards inspired by 21st.dev Activity Card */}
            {activeView === 'list' && journalFilteredEntries.length > 0 && (
              <div className="max-w-2xl mx-auto px-4 py-5 space-y-3">
                {/* Stats Row — glassmorphism cards with gradient accent */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="glass-stats rounded-2xl p-3.5 flex flex-col items-center hover:scale-[1.02] transition-transform duration-200 cursor-default">
                    <ActivityRing
                      value={journalFilteredEntries.length}
                      max={Math.max(journalFilteredEntries.length, 30)}
                      size={48}
                      strokeWidth={4}
                      color="#5B7F5E"
                    />
                    <span className="text-[11px] text-zen-moss/60 dark:text-zen-stone/60 font-semibold mt-2 tracking-wide uppercase">Entries</span>
                  </div>
                  <div className="glass-stats rounded-2xl p-3.5 flex flex-col items-center hover:scale-[1.02] transition-transform duration-200 cursor-default">
                    <ActivityRing
                      value={getCurrentStreak()}
                      max={Math.max(getCurrentStreak(), 7)}
                      size={48}
                      strokeWidth={4}
                      color="#C4956A"
                    />
                    <span className="text-[11px] text-zen-moss/60 dark:text-zen-stone/60 font-semibold mt-2 tracking-wide uppercase">Streak</span>
                  </div>
                  <div className="glass-stats rounded-2xl p-3.5 flex flex-col items-center hover:scale-[1.02] transition-transform duration-200 cursor-default">
                    <ActivityRing
                      value={getDaysJournaled()}
                      max={Math.max(getDaysJournaled(), 30)}
                      size={48}
                      strokeWidth={4}
                      color="#6B8F6E"
                    />
                    <span className="text-[11px] text-zen-moss/60 dark:text-zen-stone/60 font-semibold mt-2 tracking-wide uppercase">Days</span>
                  </div>
                  <div className="glass-stats rounded-2xl p-3.5 flex flex-col items-center hover:scale-[1.02] transition-transform duration-200 cursor-default">
                    <ActivityRing
                      value={journalFilteredEntries.filter(e => e.attachments?.some(a => a.type === 'photo')).length}
                      max={Math.max(journalFilteredEntries.length, 1)}
                      size={48}
                      strokeWidth={4}
                      color="#7FB5B0"
                    />
                    <span className="text-[11px] text-zen-moss/60 dark:text-zen-stone/60 font-semibold mt-2 tracking-wide uppercase">Media</span>
                  </div>
                </div>

                {/* Activity Sparkline — glassmorphism with gradient border */}
                <div className="glass-stats rounded-2xl p-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-zen-sage/0 via-zen-sage/40 to-zen-sage/0" />
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs text-zen-moss/70 dark:text-zen-stone/60 font-semibold tracking-wide">30-Day Activity</span>
                    <TrendingUp size={14} className="text-zen-sage/50" />
                  </div>
                  <WeeklySparkline entries={journalFilteredEntries} days={30} height={44} color="#5B7F5E" />
                </div>
              </div>
            )}

            {/* Content Area — constrained for list, full-bleed for calendar/media/map */}
            <div className={activeView === 'list' ? 'max-w-2xl mx-auto px-4 py-3' : ''}>
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
                          className="w-full pl-9 pr-3 py-2.5 border border-zen-sand/40 dark:border-zen-night-border/60 rounded-xl text-sm focus:border-zen-sage focus:ring-2 focus:ring-zen-sage/15 transition-all bg-white/60 dark:bg-zen-night-surface/60 backdrop-blur-sm text-zen-forest dark:text-zen-parchment placeholder-zen-moss/30"
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

                  {/* On This Day — glassmorphism card */}
                  {onThisDay.length > 0 && (
                    <div className="mb-5 glass-stats rounded-2xl p-4 relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-zen-sage/0 via-zen-sage/30 to-zen-sage/0" />
                      <h2 className="text-xs font-semibold text-zen-sage uppercase tracking-widest mb-3">On This Day</h2>
                      <div className="flex gap-2.5 overflow-x-auto scrollbar-hide">
                        {onThisDay.map((entry) => (
                          <Link
                            key={entry.id}
                            href={`/journal/${entry.id}`}
                            className="min-w-[180px] glass-card rounded-xl p-3 hover:elevation-1 hover:-translate-y-[1px] transition-all duration-200"
                          >
                            <p className="font-medium text-sm text-zen-forest dark:text-zen-parchment mb-0.5">{entry.title}</p>
                            <p className="text-xs text-zen-moss/50 dark:text-zen-stone/50">
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
                    /* Empty Timeline — glassmorphism with gradient accents */
                    <div className="flex flex-col items-center justify-center py-20 sm:py-28">
                      <div className="relative mb-6">
                        <div className="w-20 h-20 glass-stats rounded-3xl flex items-center justify-center">
                          <BookOpen size={32} className="text-zen-sage/50" />
                        </div>
                        <div className="absolute -inset-3 rounded-[28px] bg-gradient-to-br from-zen-sage/10 via-transparent to-zen-clay/10 -z-10 blur-md" />
                      </div>
                      <h3 className="text-xl font-serif font-semibold text-zen-forest/80 dark:text-zen-parchment/80 mb-2">
                        Start your journal
                      </h3>
                      <p className="text-sm text-zen-moss/50 dark:text-zen-stone/50 mb-8 text-center max-w-[300px] leading-relaxed">
                        Capture your thoughts, track your mood, and reflect on your journey.
                      </p>
                      <Link
                        href="/journal/new"
                        className="group px-7 py-3.5 bg-gradient-to-r from-zen-sage to-zen-sage-light text-white text-sm font-semibold rounded-2xl hover:shadow-lg transition-all duration-300 active:scale-[0.97]"
                        style={{ boxShadow: '0 4px 20px rgba(91, 127, 94, 0.3)' }}
                      >
                        Write your first entry
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {Object.keys(groupedEntries)
                        .sort((a, b) => parseInt(b) - parseInt(a))
                        .map((year) => (
                          <div key={year}>
                            <div className="sticky top-12 z-20 bg-white/90 dark:bg-zen-night-card/90 backdrop-blur-sm pb-2 mb-2">
                              <h2 className="text-lg font-serif font-light text-zen-forest/80 dark:text-zen-parchment/80">
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

        {/* Floating Action Button — gradient with depth shadow */}
        <Link
          href="/journal/new"
          className="fixed bottom-24 md:bottom-8 right-5 md:right-8 w-14 h-14 text-white rounded-2xl flex items-center justify-center hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 z-40"
          style={{
            background: 'linear-gradient(135deg, #D4A574 0%, #C4956A 50%, #B08560 100%)',
            boxShadow: '0 4px 24px rgba(196, 149, 106, 0.4), 0 2px 8px rgba(196, 149, 106, 0.2)',
          }}
        >
          <Plus size={26} strokeWidth={2.5} />
        </Link>
      </div>
      <TutorialOverlay />
    </Layout>
  );
}

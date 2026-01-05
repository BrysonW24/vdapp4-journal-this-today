'use client';

import React, { useEffect, useState } from 'react';
import { useJournalStore } from '@/stores/journal-store';
import { EntryCard } from '@/components/journal/EntryCard';
import { QuoteOfTheDay } from '@/components/journal/QuoteOfTheDay';
import { Layout } from '@/components/Layout';
import { BookOpen, Calendar, Star, Image, Search, Grid, List, Plus, Lightbulb, CalendarDays, FileText, Mic, MapPin, ChevronDown, Settings } from 'lucide-react';
import Link from 'next/link';
import { DEFAULT_PROMPT_PACKS, Journal } from '@/types/journal';

export default function JournalPage() {
  const {
    entries,
    loadEntries,
    isLoading,
    searchEntries,
    getFavorites,
    getOnThisDay,
    getCurrentStreak,
    getDaysJournaled,
  } = useJournalStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [activeView, setActiveView] = useState<'list' | 'calendar' | 'media' | 'map'>('list');
  const [showJournalMenu, setShowJournalMenu] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState<Journal>({
    id: '1',
    name: 'Personal',
    color: '#3B82F6',
    icon: '📔',
    isDefault: true,
    entryCount: 42,
    createdAt: new Date('2024-01-01'),
    lastUsedAt: new Date(),
    theme: 'gradient',
  });

  // Mock journals - in production, this would come from a store or API
  const [journals] = useState<Journal[]>([
    {
      id: '1',
      name: 'Personal',
      color: '#3B82F6',
      icon: '📔',
      isDefault: true,
      entryCount: 42,
      createdAt: new Date('2024-01-01'),
      lastUsedAt: new Date(),
      theme: 'gradient',
    },
    {
      id: '2',
      name: 'Work',
      color: '#8B5CF6',
      icon: '💼',
      isDefault: false,
      entryCount: 18,
      createdAt: new Date('2024-02-01'),
      lastUsedAt: new Date('2024-12-20'),
      theme: 'grid',
    },
    {
      id: '3',
      name: 'Travel',
      color: '#10B981',
      icon: '🌍',
      isDefault: false,
      entryCount: 7,
      createdAt: new Date('2024-03-01'),
      lastUsedAt: new Date('2024-11-15'),
      theme: 'dots',
    },
  ]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const displayedEntries =
    filter === 'favorites'
      ? getFavorites()
      : searchQuery
      ? searchEntries(searchQuery)
      : entries;

  const onThisDay = getOnThisDay();

  // Group entries by year and month for smart organization
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
  const stats = {
    totalEntries: entries.length,
    currentStreak: getCurrentStreak(),
    daysJournaled: getDaysJournaled(),
    mediaCount: 0,
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            {/* Journal Selector */}
            <div className="relative inline-block mb-4">
              <button
                onClick={() => setShowJournalMenu(!showJournalMenu)}
                className="flex items-center gap-2 group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-3xl"
                  style={{ backgroundColor: selectedJournal.color + '20' }}
                >
                  {selectedJournal.icon}
                </div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {selectedJournal.name}
                </h1>
                <ChevronDown
                  size={28}
                  className="text-gray-400 group-hover:text-gray-600 transition-colors"
                />
              </button>

              {/* Dropdown Menu */}
              {showJournalMenu && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border-2 border-gray-100 z-50 overflow-hidden">
                  <div className="p-2">
                    {journals.map((journal) => (
                      <button
                        key={journal.id}
                        onClick={() => {
                          setSelectedJournal(journal);
                          setShowJournalMenu(false);
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                          journal.id === selectedJournal.id
                            ? 'bg-blue-50 border-2 border-blue-200'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                          style={{ backgroundColor: journal.color + '20' }}
                        >
                          {journal.icon}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-gray-900">{journal.name}</p>
                          <p className="text-xs text-gray-500">{journal.entryCount} entries</p>
                        </div>
                        {journal.isDefault && (
                          <Star size={16} className="text-blue-600" fill="currentColor" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-gray-200">
                    <Link
                      href="/journals"
                      className="flex items-center gap-2 px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowJournalMenu(false)}
                    >
                      <Settings size={16} />
                      <span>Manage Journals</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <p className="text-xl text-gray-600">
              Capture your thoughts, track your moods, and reflect on your journey
            </p>
          </div>

          {/* Quote of the Day */}
          <div className="mb-8">
            <QuoteOfTheDay />
          </div>

          {/* View Tabs */}
          <div className="mb-8 bg-white rounded-xl p-2 flex gap-2 w-fit">
            <button
              onClick={() => setActiveView('list')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all font-medium ${
                activeView === 'list'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <List size={18} />
              List
            </button>
            <button
              onClick={() => setActiveView('calendar')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all font-medium ${
                activeView === 'calendar'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Calendar size={18} />
              Calendar
            </button>
            <button
              onClick={() => setActiveView('media')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all font-medium ${
                activeView === 'media'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Image size={18} />
              Media
            </button>
            <button
              onClick={() => setActiveView('map')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all font-medium ${
                activeView === 'map'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <MapPin size={18} />
              Map
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-xl border-2 border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Entries</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalEntries}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="text-blue-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Current Streak</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.currentStreak} days</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Calendar className="text-orange-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Days Journaled</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.daysJournaled}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Star className="text-green-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Media</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.mediaCount}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Image className="text-purple-600" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Start */}
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Quick Start</h2>
              <Link href="/prompts" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500">
                See more
              </Link>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Instantly create an entry with one of the following:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Link
                href="/journal/new"
                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
              >
                <Plus className="text-blue-600 dark:text-blue-400" size={24} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">New Entry</span>
              </Link>
              <Link
                href="/prompts"
                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
              >
                <Lightbulb className="text-blue-600 dark:text-blue-400" size={24} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Suggestions</span>
              </Link>
              <Link
                href="/calendar"
                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
              >
                <CalendarDays className="text-blue-600 dark:text-blue-400" size={24} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Day View</span>
              </Link>
              <Link
                href="/journal/new"
                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
              >
                <FileText className="text-blue-600 dark:text-blue-400" size={24} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Templates</span>
              </Link>
              <Link
                href="/journal/new"
                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
              >
                <Mic className="text-blue-600 dark:text-blue-400" size={24} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Audio</span>
              </Link>
            </div>
          </div>

          {/* On This Day */}
          {onThisDay.length > 0 ? (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">On This Day</h2>
                <Link href="/calendar" className="text-sm text-blue-600 hover:text-blue-700">
                  See more
                </Link>
              </div>
              <p className="text-gray-600 mb-4">
                No past memories yet! Create an entry now, and you&apos;ll see it here next year.
              </p>
              <div className="flex gap-2 mb-4">
                <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                  2024
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200">
                  2023
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200">
                  2022
                </button>
              </div>
            </div>
          ) : null}

          {/* Daily Prompt */}
          <div className="mb-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Daily Prompt</h2>
              <Link href="/prompts" className="text-sm text-blue-100 hover:text-white">
                See more
              </Link>
            </div>
            <Link
              href={`/journal/new?prompt=${encodeURIComponent(DEFAULT_PROMPT_PACKS[6].prompts[1].question)}`}
              className="block bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all"
            >
              <p className="text-lg font-medium">
                {DEFAULT_PROMPT_PACKS[6].prompts[1].question}
              </p>
            </Link>
          </div>

          {/* List View */}
          {activeView === 'list' && (
            <>
              {/* Search and Filters */}
              <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-blue-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('favorites')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  filter === 'favorites'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-blue-300'
                }`}
              >
                <Star size={18} className="inline mr-2" />
                Favorites
              </button>

              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="px-4 py-3 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all"
              >
                {viewMode === 'grid' ? <List size={20} /> : <Grid size={20} />}
              </button>
            </div>
          </div>

          {/* On This Day */}
          {onThisDay.length > 0 && (
            <div className="mb-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">On This Day</h2>
              <p className="text-purple-100 mb-4">
                You have {onThisDay.length} {onThisDay.length === 1 ? 'entry' : 'entries'} from previous years on this day
              </p>
              <div className="flex gap-4 overflow-x-auto">
                {onThisDay.map((entry) => (
                  <Link
                    key={entry.id}
                    href={`/journal/${entry.id}`}
                    className="min-w-[300px] bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all"
                  >
                    <p className="font-medium mb-2">{entry.title}</p>
                    <p className="text-sm text-purple-100">
                      {new Date(entry.createdAt).getFullYear()}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Entries Grid/List */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading entries...</p>
            </div>
          ) : displayedEntries.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-gray-100">
              <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No entries yet</h3>
              <p className="text-gray-600 mb-6">Start your journaling journey today!</p>
              <Link
                href="/journal/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <Plus size={20} />
                Write First Entry
              </Link>
            </div>
          ) : (
            <div className="space-y-12">
              {Object.keys(groupedEntries)
                .sort((a, b) => parseInt(b) - parseInt(a))
                .map((year) => (
                  <div key={year}>
                    {/* Year Header */}
                    <div className="sticky top-16 z-40 bg-gradient-to-r from-blue-50 via-white to-purple-50 pb-4 mb-6">
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {year}
                      </h2>
                    </div>

                    {/* Months within year */}
                    <div className="space-y-8">
                      {Object.keys(groupedEntries[year])
                        .sort((a, b) => {
                          const monthOrder = [
                            'January',
                            'February',
                            'March',
                            'April',
                            'May',
                            'June',
                            'July',
                            'August',
                            'September',
                            'October',
                            'November',
                            'December',
                          ];
                          return monthOrder.indexOf(b) - monthOrder.indexOf(a);
                        })
                        .map((month) => (
                          <div key={month}>
                            {/* Month Divider */}
                            <div className="flex items-center gap-4 mb-6">
                              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                              <h3 className="text-lg font-semibold text-gray-700 px-4 py-1 bg-white rounded-full border-2 border-gray-200">
                                {month}
                              </h3>
                              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                            </div>

                            {/* Entries for this month */}
                            <div
                              className={
                                viewMode === 'grid'
                                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                                  : 'flex flex-col gap-4'
                              }
                            >
                              {groupedEntries[year][month].map((entry) => (
                                <EntryCard key={entry.id} entry={entry} />
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          )}

            </>
          )}

          {/* Calendar View */}
          {activeView === 'calendar' && (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-gray-100">
              <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Calendar View</h3>
              <p className="text-gray-600 mb-6">
                Visit the <Link href="/calendar" className="text-blue-600 hover:text-blue-700 underline">Calendar page</Link> to see your entries in a calendar format.
              </p>
            </div>
          )}

          {/* Media View */}
          {activeView === 'media' && (
            <div>
              <div className="mb-6 flex gap-2 bg-white rounded-xl p-2 w-fit">
                <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">All</button>
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">Photo</button>
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">Video</button>
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">Audio</button>
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">PDF</button>
              </div>
              <div className="text-center py-16 bg-white rounded-xl border-2 border-gray-100">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <Image className="text-gray-400" size={40} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Media Timeline</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Photo, video, audio, and PDF files will appear here when added to your journal.
                </p>
              </div>
            </div>
          )}

          {/* Map View */}
          {activeView === 'map' && (
            <div className="text-center py-16 bg-white rounded-xl border-2 border-gray-100">
              <div className="w-24 h-24 mx-auto mb-6 bg-blue-50 rounded-2xl flex items-center justify-center">
                <MapPin className="text-blue-600" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Map View</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                See your journal entries on a map. Add location to your entries to view them here.
              </p>
              <div className="w-full h-96 bg-gray-100 rounded-xl flex items-center justify-center">
                <p className="text-gray-500">🗺️ Map visualization coming soon</p>
              </div>
            </div>
          )}

          {/* Floating Action Button */}
          <Link
            href="/journal/new"
            className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-3xl transition-all hover:scale-110"
          >
            <Plus size={28} />
          </Link>
        </div>
      </div>
    </Layout>
  );
}

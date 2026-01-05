'use client';

import { useEffect, useState } from 'react';
import { useJournalStore } from '@/stores/journal-store';
import { EntryCard } from '@/components/journal/EntryCard';
import { QuoteOfTheDay } from '@/components/journal/QuoteOfTheDay';
import { Layout } from '@/components/Layout';
import { BookOpen, Calendar, Star, Image, Search, Grid, List, Plus, TrendingUp, ChevronDown, Settings } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Journal } from '@/types/journal';

export default function Home() {
  const {
    entries,
    loadEntries,
    isLoading,
    searchEntries,
    getFavorites,
    getCurrentStreak,
    getDaysJournaled,
  } = useJournalStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
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

  const filteredEntries = searchQuery
    ? searchEntries(searchQuery)
    : filter === 'favorites'
    ? getFavorites()
    : entries;

  const stats = {
    totalEntries: entries.length,
    currentStreak: getCurrentStreak(),
    daysJournaled: getDaysJournaled(),
    mediaCount: 0,
  };

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 59, g: 130, b: 246 }; // Default blue
  };

  // Create dynamic background style based on journal color and theme
  const getBackgroundStyle = () => {
    const rgb = hexToRgb(selectedJournal.color);
    const theme = selectedJournal.theme || 'gradient';

    const baseStyles: React.CSSProperties = {
      transition: 'all 0.5s ease',
    };

    switch (theme) {
      case 'solid':
        return {
          ...baseStyles,
          background: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)`,
        };

      case 'gradient':
        return {
          ...baseStyles,
          background: `linear-gradient(to bottom right, rgb(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05), rgb(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15))`,
        };

      case 'dots':
        return {
          ...baseStyles,
          background: `radial-gradient(circle, rgb(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1) 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          backgroundColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.02)`,
        };

      case 'grid':
        return {
          ...baseStyles,
          background: `
            linear-gradient(rgb(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgb(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
          backgroundColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.01)`,
        };

      case 'waves':
        return {
          ...baseStyles,
          background: `
            linear-gradient(135deg, rgb(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05) 25%, transparent 25%),
            linear-gradient(225deg, rgb(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05) 25%, transparent 25%),
            linear-gradient(315deg, rgb(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1) 25%, transparent 25%),
            linear-gradient(45deg, rgb(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1) 25%, transparent 25%)
          `,
          backgroundSize: '60px 60px',
          backgroundPosition: '0 0, 30px 0, 30px -30px, 0px 30px',
          backgroundColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.02)`,
        };

      case 'stripes':
        return {
          ...baseStyles,
          background: `repeating-linear-gradient(
            45deg,
            rgb(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.02),
            rgb(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.02) 10px,
            rgb(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08) 10px,
            rgb(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08) 20px
          )`,
        };

      case 'paper':
        return {
          ...baseStyles,
          background: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.03)`,
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              rgb(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1) 0px,
              transparent 1px,
              transparent 30px
            )
          `,
        };

      case 'texture':
        return {
          ...baseStyles,
          background: `
            radial-gradient(circle at 20% 50%, rgb(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgb(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, rgb(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05) 0%, transparent 50%)
          `,
          backgroundColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.02)`,
        };

      default:
        return {
          ...baseStyles,
          background: `linear-gradient(to bottom right, rgb(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05), rgb(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15))`,
        };
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your journal...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen" style={getBackgroundStyle()}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-semibold text-gray-500 dark:text-gray-400">
                  This, Today
                </h1>
              </div>

              {/* Journal Selector */}
              <div className="relative inline-block">
                <button
                  onClick={() => setShowJournalMenu(!showJournalMenu)}
                  className="flex items-center gap-2 group"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: selectedJournal.color + '20' }}
                  >
                    {selectedJournal.icon}
                  </div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {selectedJournal.name}
                  </h2>
                  <ChevronDown
                    size={24}
                    className="text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors"
                  />
                </button>

                {/* Dropdown Menu */}
                {showJournalMenu && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
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
                              ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-700'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                            style={{ backgroundColor: journal.color + '20' }}
                          >
                            {journal.icon}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{journal.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{journal.entryCount} entries</p>
                          </div>
                          {journal.isDefault && (
                            <Star size={16} className="text-blue-600 dark:text-blue-400" fill="currentColor" />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700">
                      <Link
                        href="/journals"
                        className="flex items-center gap-2 px-5 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setShowJournalMenu(false)}
                      >
                        <Settings size={16} />
                        <span>Manage Journals</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <p className="mt-3 text-gray-600 dark:text-gray-400 text-lg">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>

            <Link
              href="/journal/new"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold">New Entry</span>
            </Link>
          </div>

          {/* Quote of the Day */}
          <div className="mb-8">
            <QuoteOfTheDay />
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total Entries */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Entries</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalEntries}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            {/* Current Streak */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Current Streak</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.currentStreak}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">days</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>

            {/* Unique Days */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Days Journaled</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.daysJournaled}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            {/* Media Count */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Media</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.mediaCount}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Image className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 mb-8 border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search your thoughts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
                    filter === 'all'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>All</span>
                </button>
                <button
                  onClick={() => setFilter('favorites')}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
                    filter === 'favorites'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Star className="w-4 h-4" fill={filter === 'favorites' ? 'currentColor' : 'none'} />
                  <span>Favorites</span>
                </button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-lg transition-all ${
                    viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                  title="List view"
                >
                  <List className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-lg transition-all ${
                    viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                  title="Grid view"
                >
                  <Grid className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Entries */}
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📔</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery
                  ? 'No entries found'
                  : filter === 'favorites'
                  ? 'No favorite entries yet'
                  : 'No entries yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery
                  ? 'Try a different search term'
                  : "Start your journaling journey by creating your first entry"}
              </p>
              {!searchQuery && (
                <Link
                  href="/journal/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Your First Entry</span>
                </Link>
              )}
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                  : 'space-y-4'
              }
            >
              {filteredEntries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

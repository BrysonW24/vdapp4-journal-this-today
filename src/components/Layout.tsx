'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Search, Moon, Sun, FileText, Menu, Settings, BookMarked, Download } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useJournalStore } from '@/stores/journal-store';
import { useJournalsStore } from '@/stores/journals-store';
import { format } from 'date-fns';
import { MobileBottomNav } from '@/components/MobileBottomNav';

interface LayoutProps {
  children: React.ReactNode;
  hideChrome?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, hideChrome = false }) => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { theme, setTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('U');
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLDivElement>(null);

  // Close hamburger on click outside
  const handleHamburgerClickOutside = useCallback((event: MouseEvent) => {
    if (hamburgerRef.current && !hamburgerRef.current.contains(event.target as Node)) {
      setShowHamburgerMenu(false);
    }
  }, []);

  useEffect(() => {
    if (showHamburgerMenu) {
      document.addEventListener('mousedown', handleHamburgerClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleHamburgerClickOutside);
  }, [showHamburgerMenu, handleHamburgerClickOutside]);

  const { searchEntries } = useJournalStore();
  const { journals, selectedJournalId, loadJournals } = useJournalsStore();
  const searchResults = searchQuery.trim() ? searchEntries(searchQuery) : [];

  // Get current journal for header display
  const selectedJournal = journals.find(j => j.id === selectedJournalId) || journals.find(j => j.isDefault) || journals[0];

  useEffect(() => {
    loadJournals();
  }, [loadJournals]);

  // Load user name from localStorage or session
  useEffect(() => {
    const loadUserName = () => {
      if (typeof window !== 'undefined') {
        const storedProfile = localStorage.getItem('userProfile');
        if (storedProfile) {
          try {
            const profile = JSON.parse(storedProfile);
            setUserName(profile.name?.charAt(0).toUpperCase() || 'U');
          } catch (_e) {
            setUserName(user?.name?.charAt(0).toUpperCase() || 'U');
          }
        } else {
          setUserName(user?.name?.charAt(0).toUpperCase() || 'U');
        }
      }
    };

    loadUserName();

    const handleProfileUpdate = () => {
      loadUserName();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [user]);

  // Close search on click outside
  useEffect(() => {
    if (!searchOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
        setSearchQuery('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchOpen]);

  const handleSearchResultClick = (entryId: string) => {
    router.push(`/journal/${entryId}`);
    setSearchOpen(false);
    setSearchQuery('');
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const cleanText = stripHtml(text);
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = cleanText.split(regex);

    return parts.map((part, index) =>
      regex.test(part)
        ? <mark key={index} className="bg-zen-sage-soft text-zen-forest px-0.5 rounded">{part}</mark>
        : part
    );
  };

  if (hideChrome) {
    return (
      <div className="min-h-screen flex flex-col bg-zen-cream dark:bg-zen-night">
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zen-cream dark:bg-zen-night">
      {/* Header */}
      <header className="bg-white/80 dark:bg-zen-night-card/80 backdrop-blur-md border-b border-zen-sand dark:border-zen-night-border sticky top-0 z-50 pt-[env(safe-area-inset-top)]">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
          {/* Left: Hamburger (mobile) + Logo + Journal Name */}
          <div className="flex items-center gap-1.5">
            {/* Hamburger Menu — mobile only */}
            <div className="relative md:hidden" ref={hamburgerRef}>
              <button
                onClick={() => setShowHamburgerMenu(!showHamburgerMenu)}
                className="p-2 -ml-2 text-zen-moss hover:text-zen-sage hover:bg-zen-sage/5 rounded-xl transition-all dark:text-zen-stone dark:hover:text-zen-sage-light min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-[0.95]"
              >
                <Menu size={20} />
              </button>
              {showHamburgerMenu && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-zen-night-card rounded-2xl shadow-lg border border-zen-sand dark:border-zen-night-border z-50 overflow-hidden py-1.5">
                  <Link
                    href="/settings"
                    onClick={() => setShowHamburgerMenu(false)}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-zen-parchment dark:hover:bg-zen-night-surface transition-colors active:scale-[0.99]"
                  >
                    <Settings size={18} className="text-zen-moss dark:text-zen-stone" />
                    <span className="text-[15px] font-medium text-zen-forest dark:text-zen-parchment">Journal Settings</span>
                  </Link>
                  <Link
                    href="/journals"
                    onClick={() => setShowHamburgerMenu(false)}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-zen-parchment dark:hover:bg-zen-night-surface transition-colors active:scale-[0.99]"
                  >
                    <BookMarked size={18} className="text-zen-moss dark:text-zen-stone" />
                    <span className="text-[15px] font-medium text-zen-forest dark:text-zen-parchment">Preview Book</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setShowHamburgerMenu(false)}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-zen-parchment dark:hover:bg-zen-night-surface transition-colors active:scale-[0.99]"
                  >
                    <Download size={18} className="text-zen-moss dark:text-zen-stone" />
                    <span className="text-[15px] font-medium text-zen-forest dark:text-zen-parchment">Export</span>
                  </Link>
                </div>
              )}
            </div>

            <Link href="/journal" className="flex items-center gap-1.5">
              <span className="text-lg">{selectedJournal?.icon || '📔'}</span>
              <span className="text-sm font-medium text-zen-moss dark:text-zen-stone">
                {selectedJournal?.name || 'Journal'}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/journals"
              className="text-zen-moss hover:text-zen-sage transition font-medium dark:text-zen-stone dark:hover:text-zen-sage-light"
            >
              Journals
            </Link>
            <Link
              href="/journal"
              className="text-zen-moss hover:text-zen-sage transition font-medium dark:text-zen-stone dark:hover:text-zen-sage-light"
            >
              Entries
            </Link>
            <Link
              href="/calendar"
              className="text-zen-moss hover:text-zen-sage transition font-medium dark:text-zen-stone dark:hover:text-zen-sage-light"
            >
              Calendar
            </Link>
            <Link
              href="/prompts"
              className="text-zen-moss hover:text-zen-sage transition font-medium dark:text-zen-stone dark:hover:text-zen-sage-light"
            >
              Prompts
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-zen-moss hover:text-zen-sage hover:bg-zen-sage/5 rounded-xl transition dark:text-zen-stone dark:hover:text-zen-sage-light"
              data-tour-step="search-button"
            >
              <Search size={18} />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-zen-moss hover:text-zen-sage hover:bg-zen-sage/5 rounded-xl transition dark:text-zen-stone dark:hover:text-zen-sage-light"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              data-tour-step="theme-toggle"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Profile Picture */}
            <Link
              href="/account"
              className="flex-shrink-0"
            >
              <div className="w-8 h-8 bg-zen-sage/15 rounded-full flex items-center justify-center text-zen-sage font-semibold text-sm ring-1 ring-zen-sage/20 hover:ring-zen-sage/40 transition-all cursor-pointer">
                {userName}
              </div>
            </Link>
          </div>
        </nav>

        {/* Search Bar */}
        {searchOpen && (
          <div ref={searchRef} className="border-t border-zen-sand dark:border-zen-night-border bg-white/90 dark:bg-zen-night-card/90 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zen-moss/50" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search entries..."
                  className="w-full pl-11 pr-4 py-2.5 border border-zen-sand dark:border-zen-night-border rounded-xl focus:border-zen-sage focus:ring-1 focus:ring-zen-sage/20 transition-all bg-white dark:bg-zen-night-surface text-zen-forest dark:text-zen-parchment placeholder-zen-moss/40"
                  autoFocus
                />
              </div>

              {/* Search Results */}
              {searchQuery.trim() && (
                <div className="mt-2 max-h-80 overflow-y-auto bg-white dark:bg-zen-night-surface rounded-xl border border-zen-sand dark:border-zen-night-border shadow-sm">
                  {searchResults.length > 0 ? (
                    <div className="p-1">
                      {searchResults.slice(0, 5).map((entry) => {
                        const cleanContent = stripHtml(entry.content);
                        const contentPreview = cleanContent.length > 80 ? cleanContent.substring(0, 80) + '...' : cleanContent;

                        return (
                          <button
                            key={entry.id}
                            onClick={() => handleSearchResultClick(entry.id)}
                            className="w-full text-left p-2.5 hover:bg-zen-sage/5 dark:hover:bg-zen-sage/10 rounded-lg transition-colors group"
                          >
                            <div className="flex items-start gap-2.5">
                              <FileText size={14} className="text-zen-sage mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm text-zen-forest dark:text-zen-parchment truncate group-hover:text-zen-sage">
                                  {highlightText(entry.title, searchQuery)}
                                </h4>
                                <p className="text-xs text-zen-moss dark:text-zen-stone line-clamp-1 mt-0.5">
                                  {highlightText(contentPreview, searchQuery)}
                                </p>
                                <p className="text-[10px] text-zen-moss/60 mt-0.5">
                                  {format(new Date(entry.createdAt), 'MMM d, yyyy')}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                      {searchResults.length > 5 && (
                        <div className="px-3 py-1.5 text-xs text-center text-zen-moss dark:text-zen-stone border-t border-zen-sand dark:border-zen-night-border">
                          +{searchResults.length - 5} more results
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-zen-moss dark:text-zen-stone">
                      <p className="text-sm">No entries found for &ldquo;{searchQuery}&rdquo;</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile menu removed — all navigation via bottom tabs + view tabs */}
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Footer */}
      <footer className="bg-zen-forest text-zen-stone mt-12 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm">&copy; 2026 This, Today. All rights reserved.</p>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="hover:text-zen-parchment transition">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-zen-parchment transition">
                Terms
              </Link>
              <Link href="/settings" className="hover:text-zen-parchment transition">
                Settings
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

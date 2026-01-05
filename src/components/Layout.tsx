'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Menu, X, Search, Moon, Sun, FileText } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useJournalStore } from '@/stores/journal-store';
import { format } from 'date-fns';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('U');
  const searchRef = useRef<HTMLDivElement>(null);

  const { searchEntries } = useJournalStore();
  const searchResults = searchQuery.trim() ? searchEntries(searchQuery) : [];

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
            setUserName(session?.user?.name?.charAt(0).toUpperCase() || 'U');
          }
        } else {
          setUserName(session?.user?.name?.charAt(0).toUpperCase() || 'U');
        }
      }
    };

    // Initial load
    loadUserName();

    // Listen for custom profile update event
    const handleProfileUpdate = () => {
      loadUserName();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [session]);

  // Close search on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
        setSearchQuery('');
      }
    }

    if (searchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [searchOpen]);

  const handleSearchResultClick = (entryId: string) => {
    router.push(`/journal/${entryId}`);
    setSearchOpen(false);
    setSearchQuery('');
  };

  // Strip HTML tags and highlight search term
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
        ? <mark key={index} className="bg-yellow-200 dark:bg-yellow-900/50 text-gray-900 dark:text-gray-100 px-0.5 rounded">{part}</mark>
        : part
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link href="/journal" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
              📔
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:inline">
              This, Today
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/journals"
              className="text-gray-700 hover:text-blue-600 transition font-medium dark:text-gray-300 dark:hover:text-blue-400"
            >
              Journals
            </Link>
            <Link
              href="/journal"
              className="text-gray-700 hover:text-blue-600 transition font-medium dark:text-gray-300 dark:hover:text-blue-400"
            >
              Entries
            </Link>
            <Link
              href="/calendar"
              className="text-gray-700 hover:text-blue-600 transition font-medium dark:text-gray-300 dark:hover:text-blue-400"
            >
              Calendar
            </Link>
            <Link
              href="/prompts"
              className="text-gray-700 hover:text-blue-600 transition font-medium dark:text-gray-300 dark:hover:text-blue-400"
            >
              Prompts
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
            >
              <Search size={20} />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* New Entry Button - Hidden on mobile */}
            <Link
              href="/journal/new"
              className="hidden sm:flex px-4 lg:px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transition-all hover:-translate-y-0.5 font-medium text-sm"
            >
              + New Entry
            </Link>

            {/* Profile Picture */}
            <Link
              href="/account"
              className="flex-shrink-0"
            >
              <div className="w-9 h-9 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold text-sm ring-2 ring-white hover:ring-blue-300 transition-all cursor-pointer">
                {userName}
              </div>
            </Link>
          </div>
        </nav>

        {/* Search Bar (Mobile & Desktop) */}
        {searchOpen && (
          <div ref={searchRef} className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search entries..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  autoFocus
                />
              </div>

              {/* Search Results */}
              {searchQuery.trim() && (
                <div className="mt-2 max-h-80 overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
                  {searchResults.length > 0 ? (
                    <div className="p-1">
                      {searchResults.slice(0, 5).map((entry) => {
                        const cleanContent = stripHtml(entry.content);
                        const contentPreview = cleanContent.length > 80 ? cleanContent.substring(0, 80) + '...' : cleanContent;

                        return (
                          <button
                            key={entry.id}
                            onClick={() => handleSearchResultClick(entry.id)}
                            className="w-full text-left p-2.5 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors group"
                          >
                            <div className="flex items-start gap-2.5">
                              <FileText size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                  {highlightText(entry.title, searchQuery)}
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mt-0.5">
                                  {highlightText(contentPreview, searchQuery)}
                                </p>
                                <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-0.5">
                                  {format(new Date(entry.createdAt), 'MMM d, yyyy')}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                      {searchResults.length > 5 && (
                        <div className="px-3 py-1.5 text-xs text-center text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
                          +{searchResults.length - 5} more results
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-600 dark:text-gray-400">
                      <p className="text-sm">No entries found for &ldquo;{searchQuery}&rdquo;</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="px-4 py-2 space-y-1">
              <Link
                href="/journals"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition font-medium"
              >
                Journals
              </Link>
              <Link
                href="/journal"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition font-medium"
              >
                Entries
              </Link>
              <Link
                href="/calendar"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition font-medium"
              >
                Calendar
              </Link>
              <Link
                href="/prompts"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition font-medium"
              >
                Prompts
              </Link>
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition font-medium"
              >
                Account
              </Link>
              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition font-medium"
              >
                Settings
              </Link>
              <Link
                href="/journal/new"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium text-center mt-2"
              >
                + New Entry
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company */}
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="hover:text-white transition">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-white transition">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-white transition">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/features" className="hover:text-white transition">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white transition">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="hover:text-white transition">
                    Security
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/docs" className="hover:text-white transition">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/api" className="hover:text-white transition">
                    API
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="hover:text-white transition">
                    Support
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy" className="hover:text-white transition">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="hover:text-white transition">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex justify-between items-center">
            <p>&copy; 2024 This, Today. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-white transition">
                Twitter
              </a>
              <a href="#" className="hover:text-white transition">
                GitHub
              </a>
              <a href="#" className="hover:text-white transition">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

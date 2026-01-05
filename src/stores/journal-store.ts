'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import MiniSearch from 'minisearch';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import type { JournalEntry, Category } from '@/types/journal';
import { DEFAULT_CATEGORIES } from '@/types/journal';
import { startOfDay, isSameDay, differenceInDays } from 'date-fns';

interface JournalState {
  entries: JournalEntry[];
  selectedEntry: JournalEntry | null;
  isLoading: boolean;
  error: string | null;
  searchIndex: MiniSearch<JournalEntry> | null;
}

interface JournalActions {
  loadEntries: () => Promise<void>;
  addEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateEntry: (id: string, updates: Partial<JournalEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  getEntryById: (id: string) => JournalEntry | undefined;
  selectEntry: (entry: JournalEntry | null) => void;
  searchEntries: (query: string) => JournalEntry[];
  getEntriesByTag: (tag: string) => JournalEntry[];
  getEntriesByCategory: (category: string) => JournalEntry[];
  getFavorites: () => JournalEntry[];
  getOnThisDay: () => JournalEntry[];
  getCurrentStreak: () => number;
  getDaysJournaled: () => number;
  exportToJSON: () => Promise<string>;
  exportToPlainText: () => string;
  exportToMarkdown: () => string;
  importFromJSON: (data: string) => Promise<void>;
  initializeSearch: () => void;
}

export const useJournalStore = create<JournalState & JournalActions>()(
  persist(
    (set, get) => ({
      entries: [],
      selectedEntry: null,
      isLoading: false,
      error: null,
      searchIndex: null,

      loadEntries: async () => {
        set({ isLoading: true, error: null });
        try {
          const entries = await db.entries.toArray();
          set({ entries, isLoading: false });
          get().initializeSearch();
        } catch (error) {
          set({ error: 'Failed to load entries', isLoading: false });
        }
      },

      addEntry: async (entryData) => {
        const newEntry: JournalEntry = {
          ...entryData,
          id: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        try {
          await db.entries.add(newEntry);
          set((state) => ({
            entries: [newEntry, ...state.entries],
          }));
          get().initializeSearch();
          return newEntry.id;
        } catch (error) {
          throw new Error('Failed to add entry');
        }
      },

      updateEntry: async (id, updates) => {
        try {
          const updatedEntry = {
            ...updates,
            updatedAt: new Date(),
          };
          await db.entries.update(id, updatedEntry);
          set((state) => ({
            entries: state.entries.map((entry) =>
              entry.id === id ? { ...entry, ...updatedEntry } : entry
            ),
          }));
          get().initializeSearch();
        } catch (error) {
          throw new Error('Failed to update entry');
        }
      },

      deleteEntry: async (id) => {
        try {
          await db.entries.delete(id);
          set((state) => ({
            entries: state.entries.filter((entry) => entry.id !== id),
          }));
          get().initializeSearch();
        } catch (error) {
          throw new Error('Failed to delete entry');
        }
      },

      toggleFavorite: async (id) => {
        const entry = get().getEntryById(id);
        if (entry) {
          await get().updateEntry(id, { isFavorite: !entry.isFavorite });
        }
      },

      getEntryById: (id) => {
        return get().entries.find((entry) => entry.id === id);
      },

      selectEntry: (entry) => {
        set({ selectedEntry: entry });
      },

      searchEntries: (query) => {
        const { searchIndex, entries } = get();
        if (!searchIndex || !query.trim()) return entries;

        const results = searchIndex.search(query, {
          prefix: true,
          fuzzy: 0.2,
        });

        const resultIds = new Set(results.map((r) => r.id));
        return entries.filter((entry) => resultIds.has(entry.id));
      },

      getEntriesByTag: (tag) => {
        return get().entries.filter((entry) => entry.tags.includes(tag));
      },

      getEntriesByCategory: (category) => {
        return get().entries.filter((entry) => entry.category === category);
      },

      getFavorites: () => {
        return get().entries.filter((entry) => entry.isFavorite);
      },

      getOnThisDay: () => {
        const today = new Date();
        const { entries } = get();

        return entries.filter((entry) => {
          const entryDate = new Date(entry.createdAt);
          return (
            entryDate.getMonth() === today.getMonth() &&
            entryDate.getDate() === today.getDate() &&
            entryDate.getFullYear() !== today.getFullYear()
          );
        });
      },

      getCurrentStreak: () => {
        const { entries } = get();
        if (entries.length === 0) return 0;

        const sortedDates = entries
          .map((entry) => startOfDay(new Date(entry.createdAt)))
          .sort((a, b) => b.getTime() - a.getTime());

        const uniqueDates = Array.from(
          new Set(sortedDates.map((date) => date.getTime()))
        ).map((time) => new Date(time));

        let streak = 0;
        const currentDate = startOfDay(new Date());

        for (const date of uniqueDates) {
          const diff = differenceInDays(currentDate, date);
          if (diff === streak) {
            streak++;
          } else if (diff > streak) {
            break;
          }
        }

        return streak;
      },

      getDaysJournaled: () => {
        const { entries } = get();
        const uniqueDates = new Set(
          entries.map((entry) =>
            startOfDay(new Date(entry.createdAt)).getTime()
          )
        );
        return uniqueDates.size;
      },

      exportToJSON: async () => {
        const data = await db.exportDatabase();
        return JSON.stringify(data, null, 2);
      },

      exportToPlainText: () => {
        const { entries } = get();
        return entries
          .map((entry) => {
            return `Date: ${new Date(entry.createdAt).toLocaleString()}\nTitle: ${entry.title}\n\n${entry.content}\n\n${'='.repeat(50)}\n\n`;
          })
          .join('');
      },

      exportToMarkdown: () => {
        const { entries } = get();
        return entries
          .map((entry) => {
            const date = new Date(entry.createdAt).toLocaleString();
            const tags = entry.tags.map((tag) => `#${tag}`).join(' ');
            return `# ${entry.title}\n\n**Date:** ${date}\n**Tags:** ${tags}\n\n${entry.content}\n\n---\n\n`;
          })
          .join('');
      },

      importFromJSON: async (data) => {
        try {
          const parsed = JSON.parse(data);
          await db.importDatabase(parsed);
          await get().loadEntries();
        } catch (error) {
          throw new Error('Failed to import data');
        }
      },

      initializeSearch: () => {
        const { entries } = get();
        const miniSearch = new MiniSearch({
          fields: ['title', 'content', 'tags'],
          storeFields: ['id'],
          searchOptions: {
            boost: { title: 2 },
            prefix: true,
            fuzzy: 0.2,
          },
        });

        miniSearch.addAll(entries);
        set({ searchIndex: miniSearch });
      },
    }),
    {
      name: 'journal-storage',
      partialize: (state) => ({ selectedEntry: state.selectedEntry }),
    }
  )
);

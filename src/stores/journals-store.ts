'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { db, type Journal } from '@/lib/db';

interface JournalsState {
  journals: Journal[];
  selectedJournalId: string | null;
  isLoading: boolean;
}

interface JournalsActions {
  loadJournals: () => Promise<void>;
  addJournal: (journal: Omit<Journal, 'id' | 'createdAt'>) => Promise<void>;
  updateJournal: (id: string, updates: Partial<Journal>) => Promise<void>;
  deleteJournal: (id: string) => Promise<void>;
  transferEntries: (fromJournalId: string, toJournalId: string) => Promise<void>;
  selectJournal: (id: string | null) => void;
  getJournalById: (id: string) => Journal | undefined;
}

export const useJournalsStore = create<JournalsState & JournalsActions>()(
  persist(
    (set, get) => ({
      journals: [],
      selectedJournalId: null,
      isLoading: false,

      loadJournals: async () => {
        set({ isLoading: true });
        try {
          const journals = await db.journals.toArray();
          
          // If no journals exist, create default journal
          if (journals.length === 0) {
            const defaultJournal: Journal = {
              id: 'default',
              name: 'Personal',
              icon: '📔',
              color: '#4F46E5',
              isDefault: true,
              createdAt: new Date(),
            };
            await db.journals.add(defaultJournal);
            set({ journals: [defaultJournal], isLoading: false });
          } else {
            set({ journals, isLoading: false });
          }
        } catch (error) {
          console.error('Failed to load journals:', error);
          set({ isLoading: false });
        }
      },

      addJournal: async (journalData) => {
        const newJournal: Journal = {
          ...journalData,
          id: uuidv4(),
          createdAt: new Date(),
        };

        try {
          await db.journals.add(newJournal);
          set((state) => ({
            journals: [...state.journals, newJournal],
          }));
        } catch (error) {
          console.error('Failed to add journal:', error);
          throw new Error('Failed to add journal');
        }
      },

      updateJournal: async (id, updates) => {
        try {
          await db.journals.update(id, updates);
          set((state) => ({
            journals: state.journals.map((journal) =>
              journal.id === id ? { ...journal, ...updates } : journal
            ),
          }));
        } catch (error) {
          console.error('Failed to update journal:', error);
          throw new Error('Failed to update journal');
        }
      },

      deleteJournal: async (id) => {
        const journal = get().journals.find(j => j.id === id);
        if (journal?.isDefault) {
          throw new Error('Cannot delete default journal');
        }

        try {
          // Delete all entries in this journal
          const entries = await db.entries.where('journalId').equals(id).toArray();
          await db.entries.bulkDelete(entries.map(e => e.id));
          
          // Delete the journal
          await db.journals.delete(id);
          set((state) => ({
            journals: state.journals.filter((journal) => journal.id !== id),
            selectedJournalId: state.selectedJournalId === id ? null : state.selectedJournalId,
          }));
        } catch (error) {
          console.error('Failed to delete journal:', error);
          throw new Error('Failed to delete journal');
        }
      },

      transferEntries: async (fromJournalId, toJournalId) => {
        try {
          const entries = await db.entries.where('journalId').equals(fromJournalId).toArray();
          
          // Update all entries to new journal
          for (const entry of entries) {
            await db.entries.update(entry.id, { journalId: toJournalId });
          }
        } catch (error) {
          console.error('Failed to transfer entries:', error);
          throw new Error('Failed to transfer entries');
        }
      },

      selectJournal: (id) => {
        set({ selectedJournalId: id });
      },

      getJournalById: (id) => {
        return get().journals.find(journal => journal.id === id);
      },
    }),
    {
      name: 'journals-storage',
      partialize: (state) => ({ selectedJournalId: state.selectedJournalId }),
    }
  )
);

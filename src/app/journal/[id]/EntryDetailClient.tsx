'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { useJournalStore } from '@/stores/journal-store';
import { db } from '@/lib/db';
import { MOOD_METADATA, type JournalEntry } from '@/types/journal';
import { format } from 'date-fns';
import { ArrowLeft, Star, Edit, Trash2, MapPin, Tag, FolderOpen, Clock } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function EntryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const pathname = usePathname();
  const { getEntryById, toggleFavorite, deleteEntry, loadEntries } = useJournalStore();
  const [entryId, setEntryId] = useState<string | null>(null);
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Extract actual ID from the browser URL pathname instead of params
  // (params.id may be '_placeholder' due to Vercel rewrites for static export)
  // Fetch directly from Dexie to avoid store hydration timing issues
  useEffect(() => {
    const segments = pathname.split('/');
    // pathname = /journal/abc123 -> segments = ["", "journal", "abc123"]
    const urlId = segments[2];

    const fetchEntry = async (id: string) => {
      setEntryId(id);
      // Fetch directly from Dexie (IndexedDB) instead of the Zustand store
      // which may not have loaded entries yet
      const foundEntry = await db.entries.get(id);
      setEntry(foundEntry || null);
      setIsLoading(false);
      // Also load entries into the store for subsequent operations (toggle favorite, delete)
      loadEntries();
    };

    if (urlId && urlId !== '_placeholder') {
      fetchEntry(urlId);
    } else {
      // Fallback to params if pathname doesn't have a real ID
      params.then((resolvedParams) => {
        fetchEntry(resolvedParams.id);
      });
    }
  }, [pathname, params, loadEntries]);

  // Re-sync entry from store when store updates (e.g., after toggleFavorite)
  useEffect(() => {
    if (entryId) {
      const storeEntry = getEntryById(entryId);
      if (storeEntry) {
        setEntry(storeEntry);
      }
    }
  }, [entryId, getEntryById]);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-zen-cream dark:bg-zen-night">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
            {/* Back link skeleton */}
            <div className="h-5 bg-zen-sand dark:bg-zen-night-surface rounded w-32 mb-6" />

            {/* Header skeleton */}
            <div className="mb-8">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 bg-zen-sand dark:bg-zen-night-surface rounded-xl" />
                  <div className="flex-1">
                    <div className="h-8 bg-zen-sand dark:bg-zen-night-surface rounded w-2/3 mb-3" />
                    <div className="h-4 bg-zen-sand dark:bg-zen-night-surface rounded w-1/3" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-11 h-11 bg-zen-sand dark:bg-zen-night-surface rounded-xl" />
                  <div className="w-11 h-11 bg-zen-sand dark:bg-zen-night-surface rounded-xl" />
                  <div className="w-11 h-11 bg-zen-sand dark:bg-zen-night-surface rounded-xl" />
                </div>
              </div>
            </div>

            {/* Tags skeleton */}
            <div className="mb-8 flex gap-3">
              <div className="h-9 bg-zen-sand dark:bg-zen-night-surface rounded-xl w-24" />
              <div className="h-9 bg-zen-sand dark:bg-zen-night-surface rounded-xl w-20" />
              <div className="h-9 bg-zen-sand dark:bg-zen-night-surface rounded-xl w-28" />
            </div>

            {/* Content skeleton */}
            <div className="bg-white dark:bg-zen-night-surface rounded-xl border border-zen-sand dark:border-zen-night-border p-8">
              <div className="space-y-3">
                <div className="h-4 bg-zen-sand dark:bg-zen-night-surface rounded w-full" />
                <div className="h-4 bg-zen-sand dark:bg-zen-night-surface rounded w-11/12" />
                <div className="h-4 bg-zen-sand dark:bg-zen-night-surface rounded w-4/5" />
                <div className="h-4 bg-zen-sand dark:bg-zen-night-surface rounded w-full" />
                <div className="h-4 bg-zen-sand dark:bg-zen-night-surface rounded w-3/4" />
                <div className="h-4 bg-zen-sand dark:bg-zen-night-surface rounded w-5/6" />
                <div className="h-4 bg-zen-sand dark:bg-zen-night-surface rounded w-2/3" />
                <div className="h-4 bg-zen-sand dark:bg-zen-night-surface rounded w-full" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!entry) {
    return (
      <Layout>
        <div className="min-h-screen bg-zen-cream dark:bg-zen-night">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center py-12 bg-white dark:bg-zen-night-surface rounded-xl border border-zen-sand dark:border-zen-night-border">
              <h3 className="text-xl font-semibold text-zen-forest dark:text-zen-cream mb-2">Entry not found</h3>
              <p className="text-zen-moss dark:text-zen-stone mb-6">This journal entry doesn&apos;t exist.</p>
              <Link
                href="/journal"
                className="inline-flex items-center gap-2 px-6 py-3 bg-zen-sage text-white rounded-xl font-medium hover:bg-zen-sage-light hover:shadow-sm transition-all"
              >
                <ArrowLeft size={20} />
                Back to Journal
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const moodData = entry.mood ? MOOD_METADATA[entry.mood] : null;

  const handleToggleFavorite = async () => {
    await toggleFavorite(entry.id);
    const updatedEntry = await db.entries.get(entry.id);
    if (updatedEntry) setEntry(updatedEntry);
    toast.success(entry.isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleDelete = async () => {
    try {
      await deleteEntry(entry.id);
      toast.success('Entry deleted successfully');
      router.push('/journal');
      router.refresh();
    } catch (_error) {
      toast.error('Failed to delete entry');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-zen-cream dark:bg-zen-night">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/journal"
              className="inline-flex items-center gap-2 text-zen-moss dark:text-zen-stone hover:text-zen-forest dark:hover:text-zen-cream mb-6 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Journal
            </Link>

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  {moodData && (
                    <div
                      className="flex items-center justify-center w-16 h-16 rounded-xl text-3xl"
                      style={{
                        backgroundColor: moodData.bgColor,
                        borderColor: moodData.borderColor,
                        borderWidth: '1px',
                      }}
                    >
                      {moodData.emoji}
                    </div>
                  )}
                  <div>
                    <h1 className="text-4xl font-bold text-zen-forest dark:text-zen-cream mb-2">
                      {entry.title || 'Untitled Entry'}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-zen-moss dark:text-zen-stone">
                      <span className="flex items-center gap-1">
                        <Clock size={16} />
                        {format(new Date(entry.createdAt), 'EEEE, MMMM d, yyyy')}
                      </span>
                      <span>at {format(new Date(entry.createdAt), 'h:mm a')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleToggleFavorite}
                  className="p-3 bg-white dark:bg-zen-night-surface border border-zen-sand dark:border-zen-night-border rounded-xl hover:border-yellow-400 transition-all"
                >
                  <Star
                    size={20}
                    className={
                      entry.isFavorite
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-zen-stone'
                    }
                  />
                </button>
                <Link
                  href={`/journal/${entry.id}/edit`}
                  className="p-3 bg-white dark:bg-zen-night-surface border border-zen-sand dark:border-zen-night-border rounded-xl hover:border-zen-sage transition-all"
                >
                  <Edit size={20} className="text-zen-moss dark:text-zen-stone" />
                </Link>
                <button
                  onClick={() => setDeleteDialogOpen(true)}
                  className="p-3 bg-white dark:bg-zen-night-surface border border-zen-sand dark:border-zen-night-border rounded-xl hover:border-red-400 transition-all"
                >
                  <Trash2 size={20} className="text-red-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="mb-8 flex flex-wrap gap-3">
            {entry.category && (
              <span className="flex items-center gap-2 px-4 py-2 bg-zen-parchment dark:bg-zen-night-surface text-zen-moss dark:text-zen-sage-light rounded-xl text-sm font-medium border border-zen-sand dark:border-zen-night-border">
                <FolderOpen size={16} />
                {entry.category}
              </span>
            )}

            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-2 px-4 py-2 bg-zen-parchment dark:bg-zen-night-surface text-zen-sage dark:text-zen-sage-light rounded-xl text-sm font-medium border border-zen-sand dark:border-zen-night-border"
              >
                <Tag size={16} />
                #{tag}
              </span>
            ))}

            {entry.location && (
              <span className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-zen-night-surface text-green-700 dark:text-green-400 rounded-xl text-sm font-medium border border-green-200 dark:border-zen-night-border">
                <MapPin size={16} />
                {entry.location.placeName || 'Location'}
              </span>
            )}

            {moodData && (
              <span
                className="px-4 py-2 rounded-xl text-sm font-medium border"
                style={{
                  backgroundColor: moodData.bgColor,
                  borderColor: moodData.borderColor,
                  color: moodData.color,
                }}
              >
                Feeling {moodData.label}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-zen-night-surface rounded-xl border border-zen-sand dark:border-zen-night-border p-8 shadow-sm">
            <div
              className="prose prose-lg max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: entry.content }}
            />
          </div>

          {/* Map Display */}
          {entry.location && entry.location.latitude !== 0 && entry.location.longitude !== 0 && (
            <div className="bg-white dark:bg-zen-night-surface rounded-xl border border-zen-sand dark:border-zen-night-border p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="text-green-600 dark:text-green-400" size={20} />
                <h3 className="text-lg font-semibold text-zen-forest dark:text-zen-cream">Location</h3>
              </div>
              <p className="text-sm text-zen-moss dark:text-zen-stone mb-4">
                {entry.location.placeName || entry.location.address || 'Unknown Location'}
              </p>

              {/* OpenStreetMap Embed */}
              <div className="w-full h-80 rounded-xl overflow-hidden border border-zen-sand dark:border-zen-night-border">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${entry.location.longitude-0.01},${entry.location.latitude-0.01},${entry.location.longitude+0.01},${entry.location.latitude+0.01}&layer=mapnik&marker=${entry.location.latitude},${entry.location.longitude}`}
                  style={{ border: 0 }}
                />
              </div>
              <div className="mt-3 text-center">
                <a
                  href={`https://www.openstreetmap.org/?mlat=${entry.location.latitude}&mlon=${entry.location.longitude}#map=15/${entry.location.latitude}/${entry.location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-zen-sage dark:text-zen-sage-light hover:underline"
                >
                  View larger map →
                </a>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-sm text-zen-stone dark:text-zen-stone text-center">
            {entry.updatedAt !== entry.createdAt && (
              <p>Last edited {format(new Date(entry.updatedAt), 'MMMM d, yyyy \'at\' h:mm a')}</p>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Entry"
        description="Are you sure you want to delete this entry? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </Layout>
  );
}

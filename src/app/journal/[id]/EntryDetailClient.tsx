'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { useJournalStore } from '@/stores/journal-store';
import { db } from '@/lib/db';
import { MOOD_METADATA, type JournalEntry } from '@/types/journal';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Star,
  MoreHorizontal,
  Edit,
  Trash2,
  MapPin,
  Tag,
  FolderOpen,
  Clock,
  Calendar,
  BookOpen,
  Hash,
  ChevronDown,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useJournalsStore } from '@/stores/journals-store';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export default function EntryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const pathname = usePathname();
  const { getEntryById, toggleFavorite, deleteEntry, loadEntries } = useJournalStore();
  const { journals, loadJournals } = useJournalsStore();
  const [entryId, setEntryId] = useState<string | null>(null);
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showEntryInfo, setShowEntryInfo] = useState(false);

  useEffect(() => {
    const segments = pathname.split('/');
    const urlId = segments[2];

    const fetchEntry = async (id: string) => {
      setEntryId(id);
      const foundEntry = await db.entries.get(id);
      setEntry(foundEntry || null);
      setIsLoading(false);
      loadEntries();
    };

    if (urlId && urlId !== '_placeholder') {
      fetchEntry(urlId);
    } else {
      params.then((resolvedParams) => {
        fetchEntry(resolvedParams.id);
      });
    }
  }, [pathname, params, loadEntries]);

  useEffect(() => {
    loadJournals();
  }, [loadJournals]);

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
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
            <div className="h-5 bg-zen-sand dark:bg-zen-night-surface rounded w-32 mb-8" />
            <div className="h-4 bg-zen-sand/60 dark:bg-zen-night-surface/60 rounded w-48 mb-3" />
            <div className="h-8 bg-zen-sand dark:bg-zen-night-surface rounded w-2/3 mb-8" />
            <div className="bg-white dark:bg-zen-night-surface rounded-xl border border-zen-sand dark:border-zen-night-border p-8">
              <div className="space-y-3">
                <div className="h-4 bg-zen-sand/40 rounded w-full" />
                <div className="h-4 bg-zen-sand/40 rounded w-11/12" />
                <div className="h-4 bg-zen-sand/40 rounded w-4/5" />
                <div className="h-4 bg-zen-sand/40 rounded w-full" />
                <div className="h-4 bg-zen-sand/40 rounded w-3/4" />
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
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center py-12 bg-white dark:bg-zen-night-surface rounded-xl border border-zen-sand dark:border-zen-night-border">
              <h3 className="text-xl font-serif font-semibold text-zen-forest dark:text-zen-cream mb-2">Entry not found</h3>
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
  const wordCount = entry.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length;
  const journalName = journals.find(j => j.id === entry.journalId)?.name || 'Journal';

  const handleToggleFavorite = async () => {
    await toggleFavorite(entry.id);
    const updatedEntry = await db.entries.get(entry.id);
    if (updatedEntry) setEntry(updatedEntry);
    toast.success(entry.isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleDelete = async () => {
    try {
      await deleteEntry(entry.id);
      toast.success('Entry deleted');
      router.push('/journal');
      router.refresh();
    } catch {
      toast.error('Failed to delete entry');
    }
  };

  const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | React.ReactNode }) => (
    <div className="flex items-center w-full py-3">
      <div className="w-8 text-zen-moss/50 dark:text-zen-stone/50 flex-shrink-0">{icon}</div>
      <span className="flex-1 text-left text-[14px] text-zen-moss dark:text-zen-stone">{label}</span>
      <span className="text-[14px] text-zen-forest dark:text-zen-parchment font-medium text-right max-w-[200px] truncate">{value}</span>
    </div>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-zen-cream dark:bg-zen-night">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back + Actions Row */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/journal"
              className="inline-flex items-center gap-1.5 text-zen-moss dark:text-zen-stone hover:text-zen-forest dark:hover:text-zen-cream transition-colors text-[14px]"
            >
              <ArrowLeft size={18} />
              Journal
            </Link>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleToggleFavorite}
                className="p-2.5 rounded-xl hover:bg-zen-parchment dark:hover:bg-zen-night-surface transition-all active:scale-[0.95]"
              >
                <Star
                  size={20}
                  className={entry.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-zen-stone/50'}
                />
              </button>

              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="p-2.5 rounded-xl hover:bg-zen-parchment dark:hover:bg-zen-night-surface transition-all active:scale-[0.95]">
                    <MoreHorizontal size={20} className="text-zen-moss dark:text-zen-stone" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    sideOffset={5}
                    className="w-52 bg-white dark:bg-zen-night-card rounded-2xl shadow-lg border border-zen-sand dark:border-zen-night-border z-50 overflow-hidden py-1 animate-fade-in"
                  >
                    <DropdownMenu.Item asChild>
                      <Link
                        href={`/journal/${entry.id}/edit`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-zen-parchment dark:hover:bg-zen-night-surface transition-colors text-[15px] text-zen-forest dark:text-zen-parchment outline-none cursor-pointer"
                      >
                        <Edit size={17} className="text-zen-moss dark:text-zen-stone" />
                        Edit Entry
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onClick={() => setShowEntryInfo(!showEntryInfo)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-zen-parchment dark:hover:bg-zen-night-surface transition-colors text-[15px] text-zen-forest dark:text-zen-parchment outline-none cursor-pointer"
                    >
                      <FileText size={17} className="text-zen-moss dark:text-zen-stone" />
                      Entry Info
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="h-px bg-zen-sand/60 dark:bg-zen-night-border/60 my-1" />
                    <DropdownMenu.Item
                      onClick={() => setDeleteDialogOpen(true)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-[15px] text-red-600 dark:text-red-400 outline-none cursor-pointer"
                    >
                      <Trash2 size={17} />
                      Move to Trash
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          </div>

          {/* Date */}
          <div className="mb-2">
            <p className="text-[13px] text-zen-moss/60 dark:text-zen-stone/60 font-medium">
              {format(new Date(entry.createdAt), 'EEEE, MMMM d, yyyy')} at {format(new Date(entry.createdAt), 'h:mm a')}
            </p>
          </div>

          {/* Title + Mood */}
          <div className="flex items-start gap-3 mb-6">
            {moodData && (
              <span className="text-3xl mt-0.5 flex-shrink-0">{moodData.emoji}</span>
            )}
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-zen-forest dark:text-zen-cream leading-tight">
              {entry.title || 'Untitled Entry'}
            </h1>
          </div>

          {/* Tags */}
          {(entry.tags.length > 0 || entry.category || entry.location) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {entry.category && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-zen-parchment dark:bg-zen-night-surface text-zen-moss dark:text-zen-sage-light rounded-lg text-xs font-medium border border-zen-sand/60 dark:border-zen-night-border/60">
                  <FolderOpen size={13} />
                  {entry.category}
                </span>
              )}
              {entry.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-3 py-1.5 bg-zen-sage/8 dark:bg-zen-sage/15 text-zen-sage dark:text-zen-sage-light rounded-lg text-xs font-medium"
                >
                  #{tag}
                </span>
              ))}
              {entry.location && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 rounded-lg text-xs font-medium border border-green-200/60 dark:border-green-800/30">
                  <MapPin size={13} />
                  {entry.location.placeName || 'Location'}
                </span>
              )}
            </div>
          )}

          {/* Content */}
          <div className="bg-white dark:bg-zen-night-surface rounded-xl border border-zen-sand/80 dark:border-zen-night-border p-6 sm:p-8 shadow-sm">
            <div
              className="prose prose-lg max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: entry.content }}
            />
          </div>

          {/* Map */}
          {entry.location && entry.location.latitude !== 0 && entry.location.longitude !== 0 && (
            <div className="mt-4 rounded-xl overflow-hidden border border-zen-sand/80 dark:border-zen-night-border shadow-sm">
              <div className="w-full h-52">
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
              <div className="bg-white dark:bg-zen-night-surface px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs text-zen-moss dark:text-zen-stone">
                  {entry.location.placeName || entry.location.address || 'Unknown Location'}
                </span>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${entry.location.latitude}&mlon=${entry.location.longitude}#map=15/${entry.location.latitude}/${entry.location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-zen-sage hover:underline"
                >
                  View larger map
                </a>
              </div>
            </div>
          )}

          {/* Entry Info */}
          <div className="mt-6">
            <button
              onClick={() => setShowEntryInfo(!showEntryInfo)}
              className="flex items-center gap-2 text-[13px] font-medium text-zen-moss/60 dark:text-zen-stone/60 hover:text-zen-forest dark:hover:text-zen-parchment transition-colors mb-3"
            >
              <ChevronDown
                size={14}
                className={`transition-transform ${showEntryInfo ? 'rotate-0' : '-rotate-90'}`}
              />
              Entry Info
            </button>

            {showEntryInfo && (
              <div className="bg-white dark:bg-zen-night-surface rounded-xl border border-zen-sand/80 dark:border-zen-night-border overflow-hidden divide-y divide-zen-sand/40 dark:divide-zen-night-border/40 px-4 animate-fade-in">
                <InfoRow icon={<Calendar size={16} />} label="Date" value={format(new Date(entry.createdAt), 'EEE, d MMM yyyy')} />
                <InfoRow icon={<Clock size={16} />} label="Time" value={format(new Date(entry.createdAt), 'h:mm a')} />
                <InfoRow icon={<BookOpen size={16} />} label="Journal" value={journalName} />
                {entry.category && <InfoRow icon={<FolderOpen size={16} />} label="Category" value={entry.category} />}
                {entry.tags.length > 0 && <InfoRow icon={<Tag size={16} />} label="Tags" value={entry.tags.map(t => `#${t}`).join(', ')} />}
                {entry.location && <InfoRow icon={<MapPin size={16} />} label="Location" value={entry.location.placeName || entry.location.address || 'Unknown'} />}
                {moodData && <InfoRow icon={<span className="text-base">{moodData.emoji}</span>} label="Mood" value={moodData.label} />}
                <InfoRow icon={<Hash size={16} />} label="Words" value={`${wordCount} words`} />
                {entry.updatedAt !== entry.createdAt && (
                  <InfoRow icon={<Clock size={16} />} label="Last Edited" value={format(new Date(entry.updatedAt), 'd MMM yyyy, h:mm a')} />
                )}
              </div>
            )}
          </div>

          <div className="h-8" />
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

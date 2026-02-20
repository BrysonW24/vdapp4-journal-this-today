'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { EntryHeader } from '@/components/journal/EntryHeader';
import { MetadataBottomSheet } from '@/components/journal/MetadataBottomSheet';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { useJournalStore } from '@/stores/journal-store';
import { db } from '@/lib/db';
import { MoodLevel, type JournalEntry } from '@/types/journal';
import { FileText, Lightbulb, Mic, MapPin, MoreHorizontal, Camera, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function EditEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const pathname = usePathname();
  const { updateEntry, loadEntries } = useJournalStore();

  const [entryId, setEntryId] = useState<string | null>(null);
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<MoodLevel | undefined>(undefined);
  const [tags, setTags] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);

  useEffect(() => {
    const segments = pathname.split('/');
    const urlId = segments[2];

    const fetchEntry = async (id: string) => {
      setEntryId(id);
      const foundEntry = await db.entries.get(id);
      if (foundEntry) {
        setEntry(foundEntry);
        setTitle(foundEntry.title);
        setContent(foundEntry.content);
        setMood(foundEntry.mood);
        setTags(foundEntry.tags || []);
        setCategory(foundEntry.category || '');
        setLocation(foundEntry.location?.placeName || foundEntry.location?.address || '');
      } else {
        setEntry(null);
      }
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

  const handleSave = async () => {
    if (!entryId) return;

    if (!title.trim()) {
      toast.error('Please add a title');
      return;
    }

    setIsSaving(true);
    try {
      await updateEntry(entryId, {
        title: title.trim(),
        content,
        mood,
        category: category || undefined,
        tags,
      });

      toast.success('Entry updated!');
      router.push(`/journal/${entryId}`);
      router.refresh();
    } catch {
      toast.error('Failed to update entry');
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout hideChrome>
        <div className="min-h-screen bg-white dark:bg-zen-night-card flex items-center justify-center">
          <div className="animate-pulse space-y-4 w-full max-w-md px-8">
            <div className="h-6 bg-zen-sand/40 dark:bg-zen-night-border rounded w-2/3" />
            <div className="h-4 bg-zen-sand/30 dark:bg-zen-night-border/60 rounded w-1/3" />
            <div className="h-48 bg-zen-sand/20 dark:bg-zen-night-border/40 rounded-xl mt-6" />
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
              <p className="text-zen-moss dark:text-zen-stone mb-6">This journal entry does not exist.</p>
              <button
                onClick={() => router.push('/journal')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-zen-sage text-white rounded-xl font-medium hover:bg-zen-sage-light hover:shadow-sm transition-all"
              >
                <ArrowLeft size={20} />
                Back to Journal
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const characterCount = content.replace(/<[^>]*>/g, '').length;

  return (
    <Layout hideChrome>
      <div className="min-h-screen bg-white dark:bg-zen-night-card flex flex-col">
        {/* Compact Header */}
        <EntryHeader
          onCancel={() => router.push(`/journal/${entryId}`)}
          onSave={handleSave}
          isSaving={isSaving}
          date={new Date(entry.createdAt)}
        />

        {/* Journal + Location Row */}
        <div className="flex items-center gap-1.5 px-5 py-2 text-[13px] border-b border-zen-sand/30 dark:border-zen-night-border/30">
          <span className="text-zen-sage dark:text-zen-sage-light font-medium">
            Journal
          </span>
          <span className="text-zen-stone/40">·</span>
          {location ? (
            <button
              onClick={() => setShowMetadata(true)}
              className="flex items-center gap-1 text-zen-moss/60 dark:text-zen-stone/60 hover:text-zen-sage transition-colors"
            >
              <MapPin size={12} />
              <span className="truncate max-w-[200px]">{location.split('(')[0].trim()}</span>
            </button>
          ) : (
            <button
              onClick={() => setShowMetadata(true)}
              className="text-zen-sage/60 hover:text-zen-sage transition-colors"
            >
              Add location?
            </button>
          )}
        </div>

        {/* Title Input */}
        <div className="px-5 pt-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xl font-semibold bg-transparent text-zen-forest dark:text-zen-parchment placeholder-zen-stone/40 focus:outline-none"
          />
        </div>

        {/* Editor */}
        <div className="flex-1 px-1">
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="Write your thoughts..."
          />
        </div>

        {/* Quick Actions Bar */}
        <div className="sticky bottom-0 z-30 bg-white/95 dark:bg-zen-night-card/95 backdrop-blur-md border-t border-zen-sand/50 dark:border-zen-night-border/50 pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="p-2.5 rounded-lg text-zen-moss/60 dark:text-zen-stone/60 hover:text-zen-sage hover:bg-zen-sage/5 transition-all active:scale-[0.95]"
                title="Photos"
              >
                <Camera size={20} />
              </button>
              <button
                type="button"
                className="p-2.5 rounded-lg text-zen-moss/60 dark:text-zen-stone/60 hover:text-zen-sage hover:bg-zen-sage/5 transition-all active:scale-[0.95]"
                title="Templates"
              >
                <FileText size={20} />
              </button>
              <button
                type="button"
                className="p-2.5 rounded-lg text-zen-moss/60 dark:text-zen-stone/60 hover:text-zen-sage hover:bg-zen-sage/5 transition-all active:scale-[0.95]"
                title="Suggestions"
              >
                <Lightbulb size={20} />
              </button>
              <button
                type="button"
                className="p-2.5 rounded-lg text-zen-moss/60 dark:text-zen-stone/60 hover:text-zen-sage hover:bg-zen-sage/5 transition-all active:scale-[0.95]"
                title="Audio"
              >
                <Mic size={20} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowMetadata(true)}
              className="p-2.5 rounded-lg text-zen-moss/60 dark:text-zen-stone/60 hover:text-zen-sage hover:bg-zen-sage/5 transition-all active:scale-[0.95]"
              title="Entry details"
            >
              <MoreHorizontal size={20} />
            </button>
          </div>
        </div>

        {/* Metadata Bottom Sheet */}
        <MetadataBottomSheet
          open={showMetadata}
          onOpenChange={setShowMetadata}
          mood={mood}
          onMoodSelect={setMood}
          category={category}
          onCategoryChange={setCategory}
          tags={tags}
          onTagsChange={setTags}
          location={location}
          onLocationChange={setLocation}
          characterCount={characterCount}
        />
      </div>
    </Layout>
  );
}

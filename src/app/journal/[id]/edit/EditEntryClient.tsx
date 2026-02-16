'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { MoodPicker } from '@/components/journal/MoodPicker';
import { useJournalStore } from '@/stores/journal-store';
import { db } from '@/lib/db';
import { MoodLevel, type JournalEntry } from '@/types/journal';
import { Save, X, Tag, FolderOpen, ArrowLeft } from 'lucide-react';
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
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Extract actual ID from the browser URL pathname instead of params
  // (params.id may be '_placeholder' due to Vercel rewrites for static export)
  // Fetch directly from Dexie to avoid store hydration timing issues
  useEffect(() => {
    const segments = pathname.split('/');
    // pathname = /journal/abc123/edit -> segments = ["", "journal", "abc123", "edit"]
    const urlId = segments[2];

    const fetchEntry = async (id: string) => {
      setEntryId(id);
      // Fetch directly from Dexie (IndexedDB) instead of the Zustand store
      // which may not have loaded entries yet
      const foundEntry = await db.entries.get(id);
      if (foundEntry) {
        setEntry(foundEntry);
        setTitle(foundEntry.title);
        setContent(foundEntry.content);
        setMood(foundEntry.mood);
        setTags(foundEntry.tags || []);
        setCategory(foundEntry.category || '');
      } else {
        setEntry(null);
      }
      setIsLoading(false);
      // Also load entries into the store for the updateEntry action
      loadEntries();
    };

    if (urlId && urlId !== '_placeholder') {
      fetchEntry(urlId);
    } else {
      // Fallback to params
      params.then((resolvedParams) => {
        fetchEntry(resolvedParams.id);
      });
    }
  }, [pathname, params, loadEntries]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!entryId) return;

    if (!title.trim()) {
      toast.error('Please add a title to your entry');
      return;
    }

    if (!content.trim()) {
      toast.error('Please write some content');
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

      toast.success('Entry updated successfully!');
      router.push(`/journal/${entryId}`);
      router.refresh();
    } catch (_error) {
      toast.error('Failed to update entry');
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-zen-cream dark:bg-zen-night">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center py-12">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-zen-sand rounded w-1/3 mx-auto"></div>
                <div className="h-4 bg-zen-sand rounded w-1/4 mx-auto"></div>
                <div className="h-64 bg-zen-sand rounded mt-8"></div>
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
            <div className="text-center py-12 bg-white rounded-xl border border-zen-sand dark:border-zen-night-border">
              <h3 className="text-xl font-semibold text-zen-forest mb-2">Entry not found</h3>
              <p className="text-zen-moss mb-6">This journal entry does not exist.</p>
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

  return (
    <Layout>
      <div className="min-h-screen bg-zen-cream dark:bg-zen-night">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-2xl sm:text-4xl font-bold text-zen-forest dark:text-zen-sage-light">
              Edit Journal Entry
            </h1>
            <div className="flex gap-3">
              <button
                onClick={() => router.push(`/journal/${entryId}`)}
                className="px-6 py-3 bg-white border border-zen-sand dark:border-zen-night-border text-zen-moss rounded-xl font-medium hover:border-zen-stone transition-all flex items-center gap-2"
              >
                <X size={20} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-3 bg-zen-sage text-white rounded-xl font-medium hover:bg-zen-sage-light hover:shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={20} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Entry Form */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <input
                type="text"
                placeholder="Give your entry a title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-2xl sm:text-4xl font-bold border-none focus:outline-none focus:ring-0 bg-transparent text-zen-forest placeholder-zen-stone"
              />
            </div>

            {/* Mood Picker */}
            <MoodPicker selectedMood={mood} onMoodSelect={setMood} />

            {/* Category and Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-zen-moss mb-2">
                  <FolderOpen size={16} className="inline mr-2" />
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-zen-sand dark:border-zen-night-border rounded-xl focus:border-zen-sage focus:ring-1 focus:ring-zen-sage/30 transition-all"
                >
                  <option value="">Select a category...</option>
                  <option value="Personal">👤 Personal</option>
                  <option value="Work">💼 Work</option>
                  <option value="Travel">✈️ Travel</option>
                  <option value="Gratitude">🙏 Gratitude</option>
                  <option value="Dreams">💭 Dreams</option>
                  <option value="Goals">🎯 Goals</option>
                  <option value="Health">💪 Health</option>
                  <option value="Relationships">❤️ Relationships</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-zen-moss mb-2">
                  <Tag size={16} className="inline mr-2" />
                  Tags
                </label>
                <input
                  type="text"
                  placeholder="Add tags (press Enter)..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="w-full px-4 py-3 border border-zen-sand dark:border-zen-night-border rounded-xl focus:border-zen-sage focus:ring-1 focus:ring-zen-sage/30 transition-all"
                />
                {tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-3">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-zen-parchment text-zen-sage dark:bg-zen-night dark:text-zen-sage-light rounded-lg text-sm font-medium flex items-center gap-2"
                      >
                        #{tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-zen-forest"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Rich Text Editor */}
            <div>
              <label className="block text-sm font-medium text-zen-moss mb-3">
                Write your thoughts...
              </label>
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="What's on your mind today?"
              />
            </div>

            {/* Word Count */}
            <div className="text-sm text-zen-stone text-right">
              {content.replace(/<[^>]*>/g, '').length} characters
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

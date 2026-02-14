'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { MoodPicker } from '@/components/journal/MoodPicker';
import { useJournalStore } from '@/stores/journal-store';
import { MoodLevel, type JournalEntry } from '@/types/journal';
import { Save, X, Tag, FolderOpen, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function EditEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const pathname = usePathname();
  const { getEntryById, updateEntry } = useJournalStore();

  const [entryId, setEntryId] = useState<string | null>(null);
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<MoodLevel | undefined>(undefined);
  const [tags, setTags] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Extract actual ID from the browser URL pathname instead of params
  // (params.id may be '_placeholder' due to Vercel rewrites for static export)
  useEffect(() => {
    const segments = pathname.split('/');
    // pathname = /journal/abc123/edit -> segments = ["", "journal", "abc123", "edit"]
    const urlId = segments[2];
    if (urlId && urlId !== '_placeholder') {
      const id = urlId;
      setEntryId(id);
      const foundEntry = getEntryById(id);
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
    } else {
      // Fallback to params
      params.then((resolvedParams) => {
        const id = resolvedParams.id;
        setEntryId(id);
        const foundEntry = getEntryById(id);
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
      });
    }
  }, [pathname, params, getEntryById]);

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

  if (!entry) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center py-12 bg-white rounded-xl border-2 border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Entry not found</h3>
              <p className="text-gray-600 mb-6">This journal entry does not exist.</p>
              <button
                onClick={() => router.push('/journal')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-xl transition-all hover:-translate-y-1"
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Edit Journal Entry
            </h1>
            <div className="flex gap-3">
              <button
                onClick={() => router.push(`/journal/${entryId}`)}
                className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:border-gray-300 transition-all flex items-center gap-2"
              >
                <X size={20} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-xl transition-all hover:-translate-y-1 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="w-full text-2xl sm:text-4xl font-bold border-none focus:outline-none focus:ring-0 bg-transparent text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Mood Picker */}
            <MoodPicker selectedMood={mood} onMoodSelect={setMood} />

            {/* Category and Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FolderOpen size={16} className="inline mr-2" />
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag size={16} className="inline mr-2" />
                  Tags
                </label>
                <input
                  type="text"
                  placeholder="Add tags (press Enter)..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
                {tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-3">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium flex items-center gap-2"
                      >
                        #{tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-blue-900"
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
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Write your thoughts...
              </label>
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="What's on your mind today?"
              />
            </div>

            {/* Word Count */}
            <div className="text-sm text-gray-500 text-right">
              {content.replace(/<[^>]*>/g, '').length} characters
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

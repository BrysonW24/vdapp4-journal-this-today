'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { useJournalStore } from '@/stores/journal-store';
import { MOOD_METADATA, type JournalEntry } from '@/types/journal';
import { format } from 'date-fns';
import { ArrowLeft, Star, Edit, Trash2, MapPin, Tag, FolderOpen, Clock } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function EntryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { getEntryById, toggleFavorite, deleteEntry } = useJournalStore();
  const [entryId, setEntryId] = useState<string | null>(null);
  const [entry, setEntry] = useState<JournalEntry | null>(null);

  useEffect(() => {
    params.then((resolvedParams) => {
      setEntryId(resolvedParams.id);
      setEntry(getEntryById(resolvedParams.id) || null);
    });
  }, [params, getEntryById]);

  useEffect(() => {
    if (entryId) {
      setEntry(getEntryById(entryId) || null);
    }
  }, [entryId, getEntryById]);

  if (!entry) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center py-12 bg-white rounded-xl border-2 border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Entry not found</h3>
              <p className="text-gray-600 mb-6">This journal entry doesn&apos;t exist.</p>
              <Link
                href="/journal"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-xl transition-all hover:-translate-y-1"
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

  const handleToggleFavorite = () => {
    toggleFavorite(entry.id);
    setEntry(getEntryById(entry.id) || null);
    toast.success(entry.isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      try {
        await deleteEntry(entry.id);
        toast.success('Entry deleted successfully');
        router.push('/journal');
      } catch (_error) {
        toast.error('Failed to delete entry');
      }
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/journal"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
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
                        borderWidth: '2px',
                      }}
                    >
                      {moodData.emoji}
                    </div>
                  )}
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                      {entry.title || 'Untitled Entry'}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
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
                  className="p-3 bg-white border-2 border-gray-200 rounded-xl hover:border-yellow-400 transition-all"
                >
                  <Star
                    size={20}
                    className={
                      entry.isFavorite
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-400'
                    }
                  />
                </button>
                <Link
                  href={`/journal/${entry.id}/edit`}
                  className="p-3 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-400 transition-all"
                >
                  <Edit size={20} className="text-gray-700" />
                </Link>
                <button
                  onClick={handleDelete}
                  className="p-3 bg-white border-2 border-gray-200 rounded-xl hover:border-red-400 transition-all"
                >
                  <Trash2 size={20} className="text-red-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="mb-8 flex flex-wrap gap-3">
            {entry.category && (
              <span className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-xl text-sm font-medium border-2 border-purple-200">
                <FolderOpen size={16} />
                {entry.category}
              </span>
            )}

            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium border-2 border-blue-200"
              >
                <Tag size={16} />
                #{tag}
              </span>
            ))}

            {entry.location && (
              <span className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-medium border-2 border-green-200">
                <MapPin size={16} />
                {entry.location.placeName || 'Location'}
              </span>
            )}

            {moodData && (
              <span
                className="px-4 py-2 rounded-xl text-sm font-medium border-2"
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
          <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-100 dark:border-gray-700 p-8 shadow-sm">
            <div
              className="prose prose-lg max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: entry.content }}
            />
          </div>

          {/* Map Display */}
          {entry.location && entry.location.latitude !== 0 && entry.location.longitude !== 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-100 dark:border-gray-700 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="text-green-600 dark:text-green-400" size={20} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Location</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {entry.location.placeName || entry.location.address || 'Unknown Location'}
              </p>

              {/* OpenStreetMap Embed */}
              <div className="w-full h-80 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-600">
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
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View larger map →
                </a>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-sm text-gray-500 text-center">
            {entry.updatedAt !== entry.createdAt && (
              <p>Last edited {format(new Date(entry.updatedAt), 'MMMM d, yyyy \'at\' h:mm a')}</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

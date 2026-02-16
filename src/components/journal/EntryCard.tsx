'use client';

import { formatDistanceToNow } from 'date-fns';
import { Star, MapPin } from 'lucide-react';
import type { JournalEntry } from '@/types/journal';
import { MOOD_METADATA } from '@/types/journal';
import { useJournalStore } from '@/stores/journal-store';
import Link from 'next/link';

interface EntryCardProps {
  entry: JournalEntry;
}

export function EntryCard({ entry }: EntryCardProps) {
  const toggleFavorite = useJournalStore((state) => state.toggleFavorite);
  const moodData = entry.mood ? MOOD_METADATA[entry.mood] : null;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(entry.id);
  };

  // Strip HTML tags for preview
  const getTextPreview = (html: string, maxLength: number = 200) => {
    const text = html.replace(/<[^>]*>/g, '');
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  };

  return (
    <Link href={`/journal/${entry.id}`}>
      <div className="group bg-white dark:bg-zen-night-card rounded-xl border border-zen-sand dark:border-zen-night-border p-6 hover:shadow-sm transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {moodData && (
              <div
                className="flex items-center justify-center w-12 h-12 rounded-xl text-2xl"
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
              <h3 className="text-xl font-bold text-zen-forest dark:text-zen-parchment line-clamp-1">
                {entry.title || 'Untitled Entry'}
              </h3>
              <p className="text-sm text-zen-moss dark:text-zen-stone">
                {formatDistanceToNow(new Date(entry.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>

          <button
            onClick={handleFavoriteClick}
            className="p-2 rounded-lg hover:bg-zen-parchment dark:hover:bg-zen-night-surface transition-colors"
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
        </div>

        {/* Content Preview */}
        <p className="text-zen-moss dark:text-zen-stone mb-4 line-clamp-3">
          {getTextPreview(entry.content)}
        </p>

        {/* Footer */}
        <div className="flex items-center gap-2 flex-wrap">
          {entry.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-zen-sage-soft text-zen-sage dark:bg-zen-sage/10 dark:text-zen-sage-light rounded-lg text-sm font-medium"
            >
              #{tag}
            </span>
          ))}
          {entry.tags.length > 3 && (
            <span className="px-3 py-1 bg-zen-parchment dark:bg-zen-night-surface text-zen-moss dark:text-zen-stone rounded-lg text-sm">
              +{entry.tags.length - 3} more
            </span>
          )}

          {entry.location && (
            <span className="flex items-center gap-1 px-3 py-1 bg-zen-parchment text-zen-moss dark:bg-zen-moss/10 dark:text-zen-stone rounded-lg text-sm">
              <MapPin size={14} />
              {entry.location.placeName || 'Location'}
            </span>
          )}

          {entry.category && (
            <span className="px-3 py-1 bg-zen-cream text-zen-clay-light dark:bg-zen-clay/10 dark:text-zen-clay rounded-lg text-sm font-medium">
              {entry.category}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

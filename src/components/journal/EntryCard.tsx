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

  // Find first photo attachment for thumbnail
  const firstPhoto = entry.attachments?.find(a => a.type === 'photo');

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(entry.id);
  };

  // Strip HTML tags for preview
  const getTextPreview = (html: string, maxLength: number = 120) => {
    const text = html.replace(/<[^>]*>/g, '');
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  };

  const entryDate = new Date(entry.createdAt);

  return (
    <Link href={`/journal/${entry.id}`}>
      <div
        className="group relative glass-card rounded-2xl p-4 hover:elevation-2 hover:-translate-y-[2px] hover:scale-[1.01] transition-all duration-300 cursor-pointer active:scale-[0.98] overflow-hidden"
        style={{ borderLeft: moodData ? `3px solid ${moodData.color}` : undefined }}
      >
        {/* Subtle gradient accent on hover — inspired by 21st.dev Animated Card */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
          style={{
            background: moodData
              ? `radial-gradient(ellipse at 0% 50%, ${moodData.color}08 0%, transparent 60%)`
              : 'radial-gradient(ellipse at 0% 50%, rgba(91,127,94,0.03) 0%, transparent 60%)',
          }}
        />

        <div className="relative flex gap-3">
          {/* Main content — left side */}
          <div className="flex-1 min-w-0">
            {/* Date + mood row */}
            <div className="flex items-center gap-2 mb-1.5">
              {moodData && (
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shadow-sm"
                  style={{ backgroundColor: moodData.bgColor }}
                >
                  {moodData.emoji}
                </span>
              )}
              <span className="text-xs text-zen-moss/50 dark:text-zen-stone/50 font-medium">
                {formatDistanceToNow(entryDate, { addSuffix: true })}
              </span>
              {entry.isFavorite && (
                <Star size={12} className="fill-yellow-400 text-yellow-400" />
              )}
            </div>

            {/* Title */}
            <h3 className="text-[15px] font-serif font-semibold text-zen-forest dark:text-zen-parchment line-clamp-1 mb-1 group-hover:text-zen-sage dark:group-hover:text-zen-sage-light transition-colors duration-200">
              {entry.title || 'Untitled Entry'}
            </h3>

            {/* Content preview — 2 lines max */}
            <p className="text-[13px] text-zen-moss/60 dark:text-zen-stone/60 line-clamp-2 leading-relaxed mb-1.5">
              {getTextPreview(entry.content)}
            </p>

            {/* Tags + location — compact row */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {entry.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-zen-sage/8 text-zen-sage dark:bg-zen-sage/15 dark:text-zen-sage-light rounded-md text-[11px] font-medium"
                >
                  #{tag}
                </span>
              ))}
              {entry.tags.length > 2 && (
                <span className="text-[11px] text-zen-moss/40 dark:text-zen-stone/40">
                  +{entry.tags.length - 2}
                </span>
              )}
              {entry.location && (
                <span className="flex items-center gap-0.5 text-[11px] text-zen-moss/40 dark:text-zen-stone/40">
                  <MapPin size={10} />
                  {entry.location.placeName || 'Location'}
                </span>
              )}
            </div>
          </div>

          {/* Photo thumbnail — right side */}
          {firstPhoto ? (
            <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-zen-parchment dark:bg-zen-night-surface shadow-sm group-hover:shadow-md transition-shadow duration-200">
              <img
                src={firstPhoto.url}
                alt={`Photo from ${entry.title || 'journal entry'}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          ) : (
            /* Favorite button when no photo */
            <button
              onClick={handleFavoriteClick}
              className="flex-shrink-0 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-zen-parchment/50 dark:hover:bg-zen-night-surface/50 transition-all self-start active:scale-[0.95]"
            >
              <Star
                size={16}
                className={
                  entry.isFavorite
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-zen-stone/30 group-hover:text-zen-stone/50 transition-colors'
                }
              />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}

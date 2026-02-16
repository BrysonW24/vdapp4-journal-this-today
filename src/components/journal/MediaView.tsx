'use client';

import React, { useState, useMemo } from 'react';
import { Mic, FileText, Play } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import type { JournalEntry, Attachment } from '@/types/journal';

interface MediaViewProps {
  entries: JournalEntry[];
}

type MediaFilter = 'all' | 'photo' | 'video' | 'audio' | 'pdf';

const FILTER_TABS: { key: MediaFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'photo', label: 'Photo' },
  { key: 'video', label: 'Video' },
  { key: 'audio', label: 'Audio' },
  { key: 'pdf', label: 'PDF' },
];

export function MediaView({ entries }: MediaViewProps) {
  const [activeFilter, setActiveFilter] = useState<MediaFilter>('all');

  // Collect all media from entries with date metadata
  const allMedia = useMemo(() => {
    const media: (Attachment & { entryId: string; entryTitle: string; entryDate: Date })[] = [];
    entries.forEach((entry) => {
      if (entry.attachments) {
        entry.attachments.forEach((att) => {
          media.push({
            ...att,
            entryId: entry.id,
            entryTitle: entry.title,
            entryDate: new Date(entry.createdAt),
          });
        });
      }
    });
    return media.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [entries]);

  // Filter media
  const filteredMedia = useMemo(() => {
    if (activeFilter === 'all') return allMedia;
    if (activeFilter === 'pdf') return allMedia.filter((m) => m.type === 'document');
    return allMedia.filter((m) => m.type === activeFilter);
  }, [allMedia, activeFilter]);

  // Group media by month for timeline display
  const groupedMedia = useMemo(() => {
    const groups = new Map<string, typeof filteredMedia>();
    filteredMedia.forEach((m) => {
      const key = format(m.entryDate, 'MMMM yyyy');
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(m);
    });
    return groups;
  }, [filteredMedia]);

  const getMediaOverlay = (type: string) => {
    switch (type) {
      case 'video':
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
              <Play size={14} className="text-zen-forest ml-0.5" fill="currentColor" />
            </div>
          </div>
        );
      case 'audio':
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zen-sage/10">
            <Mic size={24} className="text-zen-sage/60 mb-1" />
            <span className="text-[10px] text-zen-moss/50 font-medium">Audio</span>
          </div>
        );
      case 'document':
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zen-clay/5">
            <FileText size={24} className="text-zen-clay/50 mb-1" />
            <span className="text-[10px] text-zen-moss/50 font-medium">PDF</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="-mx-4">
      {/* Filter tabs — horizontal scrollable pills */}
      <div className="flex items-center gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide">
        {FILTER_TABS.map((tab) => {
          const count =
            tab.key === 'all'
              ? allMedia.length
              : tab.key === 'pdf'
              ? allMedia.filter((m) => m.type === 'document').length
              : allMedia.filter((m) => m.type === tab.key).length;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                activeFilter === tab.key
                  ? 'bg-zen-forest dark:bg-zen-parchment text-white dark:text-zen-night shadow-sm'
                  : 'bg-zen-parchment/60 dark:bg-zen-night-surface text-zen-moss/60 dark:text-zen-stone/60 hover:bg-zen-parchment dark:hover:bg-zen-night-border'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`ml-1.5 text-[11px] ${
                  activeFilter === tab.key ? 'text-white/70 dark:text-zen-night/70' : 'text-zen-moss/30'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Media Content */}
      {filteredMedia.length > 0 ? (
        <div>
          {Array.from(groupedMedia.entries()).map(([monthLabel, items]) => (
            <div key={monthLabel}>
              {/* Month section header */}
              <div className="px-4 py-2">
                <span className="text-[11px] font-semibold text-zen-moss/40 dark:text-zen-stone/40 uppercase tracking-widest">
                  {monthLabel}
                </span>
              </div>

              {/* 3-column grid */}
              <div className="grid grid-cols-3 gap-[1px] bg-zen-sand/20 dark:bg-zen-night-border/20">
                {items.map((media) => (
                  <Link
                    key={media.id}
                    href={`/journal/${media.entryId}`}
                    className="relative aspect-square bg-white dark:bg-zen-night-card overflow-hidden group"
                  >
                    {media.type === 'photo' || media.type === 'drawing' ? (
                      <img
                        src={media.url}
                        alt={media.filename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-zen-parchment/50 dark:bg-zen-night-surface" />
                    )}
                    {getMediaOverlay(media.type)}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State — matches Day One exactly */
        <div className="flex flex-col items-center justify-center py-40">
          <h3 className="text-[17px] font-medium text-zen-moss/50 dark:text-zen-stone/50 mb-2">
            Media Timeline
          </h3>
          <p className="text-[13px] text-zen-moss/35 dark:text-zen-stone/35 text-center px-12 leading-relaxed">
            Photo, video, audio, and PDF files will appear here when added to your journal
          </p>
        </div>
      )}
    </div>
  );
}

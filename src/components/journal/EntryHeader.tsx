'use client';

import { format } from 'date-fns';
import { Smile } from 'lucide-react';

interface EntryHeaderProps {
  onCancel: () => void;
  onSave: () => void;
  isSaving?: boolean;
  date?: Date;
}

export function EntryHeader({ onCancel, onSave, isSaving = false, date }: EntryHeaderProps) {
  const displayDate = date || new Date();

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-zen-night-card/90 backdrop-blur-md border-b border-zen-sand/50 dark:border-zen-night-border/50 pt-[env(safe-area-inset-top)]">
      <div className="flex items-center justify-between h-12 px-4">
        {/* Cancel */}
        <button
          onClick={onCancel}
          className="text-zen-moss dark:text-zen-stone text-[15px] font-medium hover:text-zen-forest dark:hover:text-zen-parchment transition-colors min-w-[60px] text-left"
        >
          Cancel
        </button>

        {/* Date/Time */}
        <div className="flex items-center gap-1.5">
          <Smile size={14} className="text-zen-stone/60" />
          <span className="text-[13px] font-medium text-zen-forest dark:text-zen-parchment">
            {format(displayDate, 'EEE, d MMM yyyy')}
          </span>
          <span className="text-[13px] text-zen-moss/60 dark:text-zen-stone/60">
            {format(displayDate, 'h:mm a')}
          </span>
        </div>

        {/* Done */}
        <button
          onClick={onSave}
          disabled={isSaving}
          className="text-zen-sage font-semibold text-[15px] hover:text-zen-sage-light transition-colors disabled:opacity-50 min-w-[60px] text-right"
        >
          {isSaving ? 'Saving...' : 'Done'}
        </button>
      </div>
    </header>
  );
}

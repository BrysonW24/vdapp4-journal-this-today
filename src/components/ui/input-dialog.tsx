'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

interface InputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  onConfirm: (value: string) => void;
}

export function InputDialog({
  open,
  onOpenChange,
  title,
  description,
  placeholder = '',
  defaultValue = '',
  confirmLabel = 'Confirm',
  onConfirm,
}: InputDialogProps) {
  const [value, setValue] = React.useState(defaultValue);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setValue(defaultValue);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, defaultValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onConfirm(value.trim());
      onOpenChange(false);
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white dark:bg-zen-night-card p-6 shadow-2xl animate-in fade-in-0 zoom-in-95">
          <div className="flex items-center justify-between mb-4">
            <DialogPrimitive.Title className="text-lg font-semibold text-zen-forest dark:text-zen-parchment">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close className="p-1 rounded-lg text-zen-stone hover:text-zen-forest dark:hover:text-zen-parchment hover:bg-zen-parchment dark:hover:bg-zen-night-surface transition">
              <X size={18} />
            </DialogPrimitive.Close>
          </div>
          {description && (
            <DialogPrimitive.Description className="text-sm text-zen-moss dark:text-zen-stone mb-4">
              {description}
            </DialogPrimitive.Description>
          )}
          <form onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="w-full px-4 py-3 border border-zen-sand dark:border-zen-night-border rounded-xl focus:border-zen-sage focus:ring-2 focus:ring-zen-sage/20 dark:focus:ring-zen-sage/30 transition-all bg-white dark:bg-zen-night-surface text-zen-forest dark:text-zen-parchment placeholder-zen-stone dark:placeholder-zen-night-border"
            />
            <div className="mt-4 flex justify-end gap-3">
              <DialogPrimitive.Close className="px-4 py-2.5 rounded-xl text-sm font-medium text-zen-forest dark:text-zen-stone hover:bg-zen-parchment dark:hover:bg-zen-night-surface transition">
                Cancel
              </DialogPrimitive.Close>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-zen-sage hover:bg-zen-sage-light transition"
              >
                {confirmLabel}
              </button>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

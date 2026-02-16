'use client';

import { useEffect, useState } from 'react';
import { getQuoteOfTheDay } from '@/lib/quote-generator';
import { Quote, Sparkles } from 'lucide-react';

interface QuoteData {
  text: string;
  author: string;
  generatedAt: string;
}

export function QuoteOfTheDay() {
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadQuote() {
      try {
        const quoteData = await getQuoteOfTheDay();
        setQuote(quoteData);
      } catch (error) {
        console.error('Error loading quote:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadQuote();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-zen-sage-soft dark:bg-zen-night-surface rounded-xl border border-zen-sage/20 dark:border-zen-night-border p-6 animate-pulse">
        <div className="h-6 bg-zen-sage-light/30 dark:bg-zen-sage/20 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-zen-sage-soft dark:bg-zen-sage/10 rounded w-1/4"></div>
      </div>
    );
  }

  if (!quote) {
    return null;
  }

  return (
    <div className="bg-zen-sage-soft dark:bg-zen-night-surface rounded-xl border border-zen-sage/20 dark:border-zen-night-border p-6 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 opacity-10 dark:opacity-5">
        <Sparkles size={120} className="text-zen-sage dark:text-zen-sage-light" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Quote size={20} className="text-zen-sage dark:text-zen-sage-light" />
          <h3 className="text-sm font-semibold text-zen-forest dark:text-zen-sage-light uppercase tracking-wide">
            Quote of the Day
          </h3>
        </div>

        <blockquote className="mb-3">
          <p className="text-lg font-medium text-zen-forest dark:text-zen-parchment leading-relaxed italic">
            &ldquo;{quote.text}&rdquo;
          </p>
        </blockquote>

        <p className="text-sm text-zen-moss dark:text-zen-sage-light font-medium">
          — {quote.author}
        </p>
      </div>
    </div>
  );
}

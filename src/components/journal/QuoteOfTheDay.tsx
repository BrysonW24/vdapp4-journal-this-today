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
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border-2 border-purple-100 dark:border-purple-800 p-6 animate-pulse">
        <div className="h-6 bg-purple-200 dark:bg-purple-700 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-purple-100 dark:bg-purple-800 rounded w-1/4"></div>
      </div>
    );
  }

  if (!quote) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-800 p-6 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 opacity-10 dark:opacity-5">
        <Sparkles size={120} className="text-purple-600 dark:text-purple-400" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Quote size={20} className="text-purple-600 dark:text-purple-400" />
          <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-300 uppercase tracking-wide">
            Quote of the Day
          </h3>
        </div>

        <blockquote className="mb-3">
          <p className="text-lg font-medium text-gray-800 dark:text-gray-200 leading-relaxed italic">
            &ldquo;{quote.text}&rdquo;
          </p>
        </blockquote>

        <p className="text-sm text-purple-700 dark:text-purple-400 font-medium">
          — {quote.author}
        </p>
      </div>
    </div>
  );
}

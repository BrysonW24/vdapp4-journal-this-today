'use client';

import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { DEFAULT_PROMPT_PACKS } from '@/types/journal';
import { Star, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PromptsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'gallery' | 'my-prompts'>('gallery');
  // const [myPrompts, setMyPrompts] = useState<Prompt[]>([]);

  const handlePromptClick = (question: string) => {
    // Navigate to new entry with prompt pre-filled
    router.push(`/journal/new?prompt=${encodeURIComponent(question)}`);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-zen-cream dark:bg-zen-night">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-serif font-semibold text-zen-forest dark:text-zen-sage-light">
              Prompts
            </h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 bg-zen-parchment/60 dark:bg-zen-night-surface rounded-lg p-1 w-fit">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'gallery'
                  ? 'bg-white dark:bg-zen-night-card text-zen-forest dark:text-zen-parchment shadow-sm'
                  : 'text-zen-moss dark:text-zen-stone hover:text-zen-forest dark:hover:text-zen-parchment'
              }`}
            >
              Gallery
            </button>
            <button
              onClick={() => setActiveTab('my-prompts')}
              className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'my-prompts'
                  ? 'bg-white dark:bg-zen-night-card text-zen-forest dark:text-zen-parchment shadow-sm'
                  : 'text-zen-moss dark:text-zen-stone hover:text-zen-forest dark:hover:text-zen-parchment'
              }`}
            >
              My Prompts
            </button>
          </div>

          {/* Gallery Tab */}
          {activeTab === 'gallery' && (
            <div>
              {/* Recommended Section */}
              <div className="mb-10">
                <h2 className="text-lg font-serif font-semibold text-zen-forest dark:text-zen-parchment mb-4">Recommended</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {DEFAULT_PROMPT_PACKS.find(p => p.id === 'look-back-2025')?.prompts.slice(0, 2).map((prompt) => (
                    <button
                      key={prompt.id}
                      onClick={() => handlePromptClick(prompt.question)}
                      className="relative bg-zen-sage dark:bg-zen-sage/80 rounded-xl p-5 text-white hover:shadow-sm transition-all text-left group"
                    >
                      <div className="absolute top-3 right-3">
                        <Star size={18} className="text-white opacity-70 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-[15px] font-medium pr-8 leading-snug">{prompt.question}</p>
                      <div className="mt-3 flex items-center text-xs opacity-90">
                        <ChevronRight size={14} className="mr-1" />
                        Look Back on {new Date().getFullYear() - 1}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt Packs */}
              <div>
                <h2 className="text-lg font-serif font-semibold text-zen-forest dark:text-zen-parchment mb-4">Prompt Packs</h2>
                <div className="rounded-xl overflow-hidden border border-zen-sand dark:border-zen-night-border divide-y divide-zen-sand/60 dark:divide-zen-night-border/60">
                  {DEFAULT_PROMPT_PACKS.map((pack) => (
                    <details key={pack.id} className="bg-white dark:bg-zen-night-card group">
                      <summary className="flex items-center px-4 py-3 cursor-pointer hover:bg-zen-parchment dark:hover:bg-zen-night-surface transition-colors list-none">
                        <span className="text-2xl mr-3 flex-shrink-0">{pack.icon}</span>
                        <span className="flex-1 text-[15px] font-medium text-zen-forest dark:text-zen-parchment">{pack.name}</span>
                        <ChevronRight className="text-zen-stone/60 flex-shrink-0 transition-transform duration-200 group-open:rotate-90" size={18} />
                      </summary>
                      <div className="border-t border-zen-sand dark:border-zen-night-border px-4 py-3 bg-zen-parchment/50 dark:bg-zen-night-surface">
                        <div className="space-y-1.5">
                          {pack.prompts.map((prompt) => (
                            <button
                              key={prompt.id}
                              onClick={() => handlePromptClick(prompt.question)}
                              className="w-full text-left px-3 py-2.5 bg-white dark:bg-zen-night-card rounded-lg hover:shadow-sm transition-all border border-zen-sand/60 dark:border-zen-night-border/60"
                            >
                              <p className="text-sm text-zen-forest dark:text-zen-parchment">{prompt.question}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* My Prompts Tab */}
          {activeTab === 'my-prompts' && (
            <div className="text-center py-12 bg-white dark:bg-zen-night-card rounded-xl border border-zen-sand dark:border-zen-night-border">
              <div className="w-20 h-20 mx-auto mb-5 bg-zen-sage/10 dark:bg-zen-sage/5 rounded-full flex items-center justify-center">
                <Star size={28} className="text-zen-sage/40" />
              </div>
              <h3 className="text-lg font-serif font-semibold text-zen-forest dark:text-zen-parchment mb-2">
                No Saved Prompts
              </h3>
              <p className="text-sm text-zen-moss/60 dark:text-zen-stone/60 max-w-sm mx-auto mb-5">
                Browse the Gallery and find prompts that inspire your writing.
              </p>
              <button
                onClick={() => setActiveTab('gallery')}
                className="px-5 py-2.5 bg-zen-sage text-white text-sm font-medium rounded-xl hover:bg-zen-sage-light transition-all active:scale-[0.97]"
              >
                Browse Gallery
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

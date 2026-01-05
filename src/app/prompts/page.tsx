'use client';

import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { DEFAULT_PROMPT_PACKS, type Prompt } from '@/types/journal';
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Prompts
            </h1>
            <p className="text-xl text-gray-600">
              Get inspired with journaling prompts
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 bg-white rounded-xl p-2 w-fit">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'gallery'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Gallery
            </button>
            <button
              onClick={() => setActiveTab('my-prompts')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'my-prompts'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Prompts
            </button>
          </div>

          {/* Gallery Tab */}
          {activeTab === 'gallery' && (
            <div>
              {/* Recommended Section */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {DEFAULT_PROMPT_PACKS.find(p => p.id === 'look-back-2025')?.prompts.slice(0, 2).map((prompt) => (
                    <button
                      key={prompt.id}
                      onClick={() => handlePromptClick(prompt.question)}
                      className="relative bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:shadow-xl transition-all hover:-translate-y-1 text-left group"
                    >
                      <div className="absolute top-4 right-4">
                        <Star size={20} className="text-white opacity-70 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-lg font-medium pr-8">{prompt.question}</p>
                      <div className="mt-4 flex items-center text-sm opacity-90">
                        <ChevronRight size={16} className="mr-1" />
                        Look Back on 2025
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt Packs */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Prompt Packs</h2>
                <div className="space-y-3">
                  {DEFAULT_PROMPT_PACKS.map((pack) => (
                    <details key={pack.id} className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden">
                      <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors list-none">
                        <div className="flex items-center gap-4">
                          <div className="text-3xl">{pack.icon}</div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{pack.name}</h3>
                            {pack.description && (
                              <p className="text-sm text-gray-600">{pack.description}</p>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="text-gray-400" size={20} />
                      </summary>
                      <div className="border-t-2 border-gray-100 p-4 bg-gray-50">
                        <div className="space-y-2">
                          {pack.prompts.map((prompt) => (
                            <button
                              key={prompt.id}
                              onClick={() => handlePromptClick(prompt.question)}
                              className="w-full text-left p-4 bg-white rounded-lg hover:shadow-md transition-all hover:-translate-y-0.5 border border-gray-200"
                            >
                              <p className="text-gray-900">{prompt.question}</p>
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
            <div className="text-center py-12 bg-white rounded-xl border-2 border-gray-100">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center">
                <div className="text-5xl opacity-30">📁</div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nothing added yet</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Build your own prompt collection by adding prompt packs here.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

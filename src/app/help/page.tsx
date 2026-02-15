'use client';

import { useState } from 'react';
import { Layout } from '@/components/Layout';
import {
  ArrowLeft,
  HelpCircle,
  BookOpen,
  Shield,
  Download,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Mail,
  Pen,
  Search,
  Moon,
  Mic,
  MapPin,
  FolderOpen,
} from 'lucide-react';
import Link from 'next/link';

interface FAQItem {
  question: string;
  answer: string;
  icon: React.ReactNode;
}

const FAQ_SECTIONS: { title: string; items: FAQItem[] }[] = [
  {
    title: 'Getting Started',
    items: [
      {
        question: 'How do I create my first journal entry?',
        answer:
          'Tap the "+ New Entry" button in the top navigation bar (or the "New" button in the bottom navigation on mobile). Give your entry a title, select a mood, add tags, and start writing. You can also use templates or voice recording to get started quickly.',
        icon: <Pen size={18} />,
      },
      {
        question: 'How do I organise my entries into journals?',
        answer:
          'Click the journal name at the top of the main page to open the journal selector. You can switch between journals or click "Manage Journals" to create new journals, rename them, change icons, or set a default journal.',
        icon: <FolderOpen size={18} />,
      },
      {
        question: 'How do I search my entries?',
        answer:
          'Use the search icon in the top navigation bar to search across all your entries by title or content. You can also filter entries by favourites using the filter buttons on the journal page.',
        icon: <Search size={18} />,
      },
    ],
  },
  {
    title: 'Features',
    items: [
      {
        question: 'Can I use voice to write entries?',
        answer:
          'Yes! When creating a new entry, tap the "Audio" button in the quick actions bar. Grant microphone access when prompted, and start speaking. Your words will be transcribed in real-time and added to your entry.',
        icon: <Mic size={18} />,
      },
      {
        question: 'How do I add a location to my entry?',
        answer:
          'When creating or editing an entry, scroll down to the Location section. You can either tap "Use Current Location" to automatically detect your position, or search for a city, state, or country manually. Nearby locations will also be suggested.',
        icon: <MapPin size={18} />,
      },
      {
        question: 'How does dark mode work?',
        answer:
          'Tap the moon/sun icon in the top navigation bar to toggle between light and dark mode. Your preference is saved and will persist across sessions.',
        icon: <Moon size={18} />,
      },
    ],
  },
  {
    title: 'Data & Privacy',
    items: [
      {
        question: 'Where is my data stored?',
        answer:
          'All your data is stored locally on your device using IndexedDB. Nothing is ever sent to external servers. Your journal entries, settings, and preferences stay entirely on your device.',
        icon: <Shield size={18} />,
      },
      {
        question: 'How do I export my data?',
        answer:
          'Go to Settings and scroll to the "Export Data" section. You can export your entries in JSON (full backup), Plain Text, Markdown, CSV, or PDF format. JSON export is recommended for full backups as it preserves all metadata.',
        icon: <Download size={18} />,
      },
      {
        question: 'How do I import data from a backup?',
        answer:
          'Go to Settings and scroll to the "Import Data" section. Click "Import JSON" and select a previously exported JSON backup file. Your entries will be restored alongside any existing entries.',
        icon: <BookOpen size={18} />,
      },
      {
        question: 'What happens if I clear my browser data?',
        answer:
          'Since all data is stored in your browser, clearing browser data or site data will permanently delete your journal entries. We strongly recommend regularly exporting your data as a backup from the Settings page.',
        icon: <Shield size={18} />,
      },
    ],
  },
  {
    title: 'Mobile & Devices',
    items: [
      {
        question: 'Can I use This, Today on my phone?',
        answer:
          'Yes! This, Today is fully responsive and works on any device with a modern web browser. On mobile, you will see a bottom navigation bar for quick access to all features. The app is also available as a native iOS app.',
        icon: <Smartphone size={18} />,
      },
      {
        question: 'Can I sync data between devices?',
        answer:
          'Currently, data is stored locally on each device separately. To transfer data between devices, export your entries as JSON from the Settings page on one device and import them on the other.',
        icon: <Smartphone size={18} />,
      },
    ],
  },
];

export default function HelpPage() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-8 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <HelpCircle className="text-green-600 dark:text-green-400" size={28} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
              Help & Support
            </h1>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
            Find answers to common questions about using This, Today.
          </p>

          {/* FAQ Sections */}
          <div className="space-y-8">
            {FAQ_SECTIONS.map((section) => (
              <div key={section.title}>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  {section.title}
                </h2>
                <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-100 dark:border-gray-700 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
                  {section.items.map((item) => {
                    const key = `${section.title}-${item.question}`;
                    const isOpen = openItems.has(key);

                    return (
                      <div key={item.question}>
                        <button
                          onClick={() => toggleItem(key)}
                          className="w-full flex items-center gap-3 p-4 sm:p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <div className="flex-shrink-0 w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                            {item.icon}
                          </div>
                          <span className="flex-1 font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                            {item.question}
                          </span>
                          {isOpen ? (
                            <ChevronUp
                              size={20}
                              className="flex-shrink-0 text-gray-400"
                            />
                          ) : (
                            <ChevronDown
                              size={20}
                              className="flex-shrink-0 text-gray-400"
                            />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-4 sm:px-5 pb-4 sm:pb-5 pl-16 sm:pl-[4.25rem]">
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                              {item.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-3">Still need help?</h2>
            <p className="text-blue-100 mb-6">
              If you can&apos;t find what you&apos;re looking for, reach out to our support team.
            </p>
            <a
              href="mailto:hello@vivacitydigital.com.au"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-medium hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              <Mail size={20} />
              Contact Support
            </a>
          </div>

          {/* Quick Links */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/privacy"
              className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-100 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all"
            >
              <Shield size={20} className="text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Privacy Policy</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  How we protect your data
                </p>
              </div>
            </Link>
            <Link
              href="/terms"
              className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-100 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all"
            >
              <BookOpen size={20} className="text-purple-600 dark:text-purple-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Terms of Service</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Our terms and conditions
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

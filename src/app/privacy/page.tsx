'use client';

import { Layout } from '@/components/Layout';
import { ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
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

          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Shield className="text-blue-600 dark:text-blue-400" size={28} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">Privacy Policy</h1>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-100 dark:border-gray-700 p-6 sm:p-8 space-y-6">
            <p className="text-sm text-gray-500 dark:text-gray-500">Last updated: February 11, 2026</p>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Your Privacy Matters</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                This, Today is a personal journaling app that stores all your data locally on your device.
                We are committed to protecting your privacy and ensuring your personal thoughts remain private.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Data Storage</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                All journal entries, settings, and preferences are stored exclusively on your device using
                local browser storage (IndexedDB). Your data never leaves your device and is never sent to
                any external servers.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Data We Do Not Collect</h2>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                <li>We do not collect personal information</li>
                <li>We do not track your usage or behavior</li>
                <li>We do not use analytics or tracking services</li>
                <li>We do not use cookies for tracking purposes</li>
                <li>We do not share any data with third parties</li>
                <li>We do not have access to your journal entries</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Location Data</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                If you choose to add location data to your journal entries, this information is stored
                locally on your device only. Location access is entirely optional and can be disabled
                at any time through your device settings.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Deleting Your Data</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                You can delete individual journal entries at any time from within the app. You can also
                clear all app data from the Settings page. Since all data is stored locally, uninstalling
                the app will also remove all your data.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Data Export</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                You can export your journal entries as JSON files at any time from the Settings page.
                This allows you to back up your data or transfer it to another device.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Changes to This Policy</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We may update this privacy policy from time to time. Any changes will be reflected
                in the app with an updated date.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Contact</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                If you have any questions about this privacy policy, please contact us at{' '}
                <a
                  href="mailto:hello@vivacitydigital.com.au"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  hello@vivacitydigital.com.au
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}

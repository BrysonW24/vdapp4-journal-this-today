'use client';

import { Layout } from '@/components/Layout';
import { ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-zen-cream dark:bg-zen-night">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 text-zen-moss hover:text-zen-forest dark:text-zen-stone dark:hover:text-zen-sand mb-8 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-zen-sage/10 dark:bg-zen-sage/20 rounded-xl">
              <FileText className="text-zen-sage dark:text-zen-sage-light" size={28} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-zen-forest dark:text-zen-sand">Terms of Service</h1>
          </div>

          <div className="bg-white dark:bg-zen-night-card rounded-xl border border-zen-sand dark:border-zen-night-border p-6 sm:p-8 space-y-6">
            <p className="text-sm text-zen-stone dark:text-zen-stone">Last updated: February 11, 2026</p>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-zen-forest dark:text-zen-sand">Agreement to Terms</h2>
              <p className="text-zen-moss dark:text-zen-sand leading-relaxed">
                By using This, Today you agree to these terms. If you do not agree, please do not use the app.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-zen-forest dark:text-zen-sand">Use of the App</h2>
              <p className="text-zen-moss dark:text-zen-sand leading-relaxed">
                This, Today is a personal journaling application designed for private use. You may use
                the app to create, edit, and manage personal journal entries. You are responsible for
                all content you create within the app.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-zen-forest dark:text-zen-sand">Your Content</h2>
              <p className="text-zen-moss dark:text-zen-sand leading-relaxed">
                All content you create in This, Today remains yours. Since all data is stored locally
                on your device, we do not have access to, ownership of, or control over your content.
                You are solely responsible for backing up your data.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-zen-forest dark:text-zen-sand">Data Loss</h2>
              <p className="text-zen-moss dark:text-zen-sand leading-relaxed">
                As all data is stored locally on your device, we are not responsible for any data loss
                that may occur due to device failure, app deletion, or other circumstances. We recommend
                regularly exporting your data using the built-in export feature.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-zen-forest dark:text-zen-sand">Disclaimer</h2>
              <p className="text-zen-moss dark:text-zen-sand leading-relaxed">
                This, Today is provided &quot;as is&quot; without warranties of any kind. We do not guarantee
                that the app will be error-free or uninterrupted.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-zen-forest dark:text-zen-sand">Limitation of Liability</h2>
              <p className="text-zen-moss dark:text-zen-sand leading-relaxed">
                To the maximum extent permitted by law, Vivacity Digital shall not be liable for any
                indirect, incidental, or consequential damages arising from the use of this app.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-zen-forest dark:text-zen-sand">Changes to Terms</h2>
              <p className="text-zen-moss dark:text-zen-sand leading-relaxed">
                We reserve the right to modify these terms at any time. Continued use of the app
                after changes constitutes acceptance of the updated terms.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-zen-forest dark:text-zen-sand">Contact</h2>
              <p className="text-zen-moss dark:text-zen-sand leading-relaxed">
                For questions about these terms, please contact us at{' '}
                <a
                  href="mailto:hello@vivacitydigital.com.au"
                  className="text-zen-sage dark:text-zen-sage-light hover:underline"
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

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Calendar, Star, Check } from 'lucide-react';

export default function PremiumPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStartTrial = async () => {
    setLoading(true);
    // In production, implement subscription logic
    setTimeout(() => {
      router.push('/');
    }, 1000);
  };

  const handleNotNow = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md mx-auto px-6 py-12">
        {/* Premium Badge */}
        <div className="flex justify-start mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-full">
            <Star size={16} fill="white" />
            <span className="font-semibold text-sm">Premium</span>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
          The very best of Day One.
        </h1>
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-12 leading-tight">
          Free for your first month.
        </h2>

        {/* Timeline */}
        <div className="space-y-8 mb-12">
          {/* Today */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="w-1 h-full bg-blue-200 dark:bg-blue-900/30 mt-2" />
            </div>
            <div className="flex-1 pb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Today</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Unlock unlimited photos and videos, unlimited devices and audio recording.
              </p>
            </div>
          </div>

          {/* During Your Trial */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="w-1 h-full bg-blue-200 dark:bg-blue-900/30 mt-2" />
            </div>
            <div className="flex-1 pb-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">During Your Trial</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Capture life as you live it, beautifully and securely. Yours to keep.
              </p>
            </div>
          </div>

          {/* In One Month */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-white" fill="white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">In One Month</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Your subscription begins automatically. <span className="font-semibold">Cancel anytime</span> before then.
              </p>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-8 shadow-sm">
          <p className="text-gray-800 dark:text-gray-200 mb-4 leading-relaxed italic">
            "The best app in my phone, hands down. Use it everyday! Worth every penny!"
          </p>
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={20} className="text-orange-400" fill="currentColor" />
              ))}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Dejasmiles</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="text-center mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            1 month free, then <span className="font-bold text-gray-900 dark:text-white">$79.99/year</span>
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleStartTrial}
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? 'Setting up...' : 'Start my 1 month free trial'}
          </button>

          <button
            onClick={handleNotNow}
            className="w-full text-blue-500 hover:text-blue-600 font-semibold py-4 transition-colors"
          >
            Not right now
          </button>
        </div>

        {/* Terms */}
        <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-8 leading-relaxed">
          Your subscription will automatically renew unless cancelled at least 24 hours before the end of the current period.
          You can manage your subscription in your Account Settings.
        </p>
      </div>
    </div>
  );
}

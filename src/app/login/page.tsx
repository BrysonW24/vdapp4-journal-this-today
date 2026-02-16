'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    login();
  }, [login]);

  return (
    <div className="min-h-screen bg-zen-cream dark:bg-zen-night flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-zen-night-card rounded-3xl shadow-sm p-12">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-zen-sage rounded-full flex items-center justify-center shadow-sm">
              <span className="text-5xl">📔</span>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-zen-forest dark:text-white mb-2">
              This, Today
            </h1>
            <p className="text-zen-moss dark:text-zen-stone">
              Welcome back to your journal
            </p>
          </div>

          {/* Continue */}
          <button
            onClick={() => router.push('/journal')}
            className="w-full bg-zen-sage hover:bg-zen-sage-light text-white font-semibold py-3.5 rounded-xl transition-all shadow-sm"
          >
            Open Journal
          </button>

          <p className="mt-6 text-center text-sm text-zen-stone dark:text-zen-stone">
            Your journal stays private on this device
          </p>
        </div>
      </div>
    </div>
  );
}

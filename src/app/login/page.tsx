'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    login();
    router.replace('/journal');
  }, [login, router]);

  return (
    <div className="min-h-screen bg-zen-cream dark:bg-zen-night flex flex-col items-center justify-center">
      <div className="w-16 h-16 bg-zen-sage rounded-full flex items-center justify-center shadow-sm mb-4">
        <span className="text-3xl">📔</span>
      </div>
      <p className="text-sm text-zen-moss/60 dark:text-zen-stone/60">Opening journal...</p>
    </div>
  );
}

'use client';

import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900" />
      </div>

      {/* Overlay gradient for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50 z-10" />

      {/* Content */}
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-between px-6 py-12 sm:py-16">
        {/* Logo and Title */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            {/* Logo */}
            <div className="mb-10 flex justify-center">
              <div className="w-28 h-28 bg-white/10 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center border-2 border-white/30 shadow-2xl">
                <span className="text-6xl">📔</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-white text-5xl sm:text-7xl font-bold tracking-[0.15em] mb-3 drop-shadow-2xl">
              THIS, TODAY
            </h1>
            <p className="text-white/90 text-xl tracking-[0.3em] uppercase font-light">
              Your Personal Journal
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full max-w-md space-y-4">
          <button
            onClick={() => router.push('/journal')}
            className="w-full bg-white/95 backdrop-blur-sm rounded-[1.75rem] py-4 px-6 flex items-center justify-center gap-3 hover:bg-white transition-all shadow-2xl active:scale-[0.98]"
          >
            <span className="text-black font-semibold text-lg">Get Started</span>
          </button>

          <p className="text-center text-white/60 text-sm">
            Your journal stays private on this device
          </p>
        </div>
      </div>
    </div>
  );
}

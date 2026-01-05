'use client';

import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const router = useRouter();

  const handleContinueWithApple = () => {
    // In production, implement Apple Sign In
    router.push('/login');
  };

  const handleHaveAccount = () => {
    router.push('/login');
  };

  const handleSkip = () => {
    router.push('/premium');
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image - using a placeholder, replace with actual image */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=2574&auto=format&fit=crop)',
            filter: 'brightness(0.65)',
          }}
        />
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
            <h1 className="text-white text-6xl sm:text-7xl font-bold tracking-[0.2em] mb-3 drop-shadow-2xl">
              DAY ONE
            </h1>
            <p className="text-white/90 text-xl tracking-[0.3em] uppercase font-light">
              Journal
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-md space-y-4">
          {/* Continue with Apple */}
          <button
            onClick={handleContinueWithApple}
            className="w-full bg-white/95 backdrop-blur-sm rounded-[1.75rem] py-4 px-6 flex items-center justify-center gap-3 hover:bg-white transition-all shadow-2xl active:scale-[0.98]"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            <span className="text-black font-semibold text-lg">Continue with Apple</span>
          </button>

          {/* I have an account */}
          <button
            onClick={handleHaveAccount}
            className="w-full bg-white/95 backdrop-blur-sm rounded-[1.75rem] py-4 px-6 hover:bg-white transition-all shadow-2xl active:scale-[0.98]"
          >
            <span className="text-black font-semibold text-lg">I have an account</span>
          </button>

          {/* Skip for now */}
          <button
            onClick={handleSkip}
            className="w-full py-4 text-white/95 hover:text-white transition-all active:scale-[0.98]"
          >
            <span className="text-lg underline underline-offset-4">Skip for now</span>
          </button>
        </div>
      </div>
    </div>
  );
}

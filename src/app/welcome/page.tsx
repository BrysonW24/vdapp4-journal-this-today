'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { useJournalsStore } from '@/stores/journals-store';
import { useTheme } from 'next-themes';
import { ZenBackground } from '@/components/zen/ZenBackground';
import { Sun, Moon, Monitor, ChevronRight, ChevronLeft, Leaf } from 'lucide-react';

const JOURNAL_ICONS = ['📔', '📓', '📒', '📕', '📗', '📘', '🌿', '🍃', '🌸', '🪷', '🌊', '🏔️'];

export default function WelcomePage() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const { addJournal } = useJournalsStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [journalName, setJournalName] = useState('Personal');
  const [journalIcon, setJournalIcon] = useState('📔');
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Check if already onboarded
  useEffect(() => {
    async function checkOnboarding() {
      const completed = await db.settings.get('onboarding_completed');
      if (completed?.value) {
        router.replace('/journal');
      }
    }
    checkOnboarding();
  }, [router]);

  const goNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setStep((s) => s + 1);
      setIsTransitioning(false);
    }, 200);
  };

  const goBack = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setStep((s) => s - 1);
      setIsTransitioning(false);
    }, 200);
  };

  const handleComplete = async () => {
    // Save user profile
    localStorage.setItem('userProfile', JSON.stringify({ name: name.trim() || 'Friend' }));
    window.dispatchEvent(new Event('profileUpdated'));

    // Apply theme
    setTheme(selectedTheme);

    // Clear existing default journal and create the user's custom one
    try {
      const existingJournals = await db.journals.toArray();
      if (existingJournals.length === 0) {
        await addJournal({
          name: journalName.trim() || 'Personal',
          icon: journalIcon,
          color: '#5B7F5E',
          isDefault: true,
        });
      } else {
        // Update the default journal with user's choices
        const defaultJournal = existingJournals.find(j => j.isDefault) || existingJournals[0];
        if (defaultJournal) {
          await db.journals.update(defaultJournal.id, {
            name: journalName.trim() || 'Personal',
            icon: journalIcon,
            color: '#5B7F5E',
          });
        }
      }
    } catch {
      // Journal might already exist, that's fine
    }

    // Mark onboarding complete
    await db.settings.put({ key: 'onboarding_completed', value: true });
    await db.settings.put({ key: 'start_onboarding', value: false });

    router.push('/journal');
  };

  const steps = [
    // Step 0: Welcome
    <div key="welcome" className="flex-1 flex flex-col items-center justify-center text-center px-8">
      <div className="mb-8">
        <div className="w-24 h-24 bg-zen-sage/10 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-zen-sage/20 mx-auto mb-6">
          <Leaf className="w-12 h-12 text-zen-sage" />
        </div>
        <h1 className="text-4xl font-light text-zen-forest dark:text-zen-parchment tracking-wide mb-3">
          This, Today
        </h1>
        <p className="text-zen-moss dark:text-zen-stone text-lg font-light leading-relaxed max-w-sm mx-auto">
          A quiet space for your thoughts, moods, and reflections
        </p>
      </div>
    </div>,

    // Step 1: Name
    <div key="name" className="flex-1 flex flex-col items-center justify-center text-center px-8">
      <h2 className="text-2xl font-light text-zen-forest dark:text-zen-parchment mb-2">
        What should we call you?
      </h2>
      <p className="text-zen-moss dark:text-zen-stone mb-8 font-light">
        This stays on your device
      </p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name..."
        className="w-full max-w-xs text-center text-xl py-4 px-6 bg-white/70 dark:bg-zen-night-card/70 backdrop-blur-sm border border-zen-sand dark:border-zen-night-border rounded-2xl text-zen-forest dark:text-zen-parchment placeholder-zen-moss/50 dark:placeholder-zen-stone/50 focus:outline-none focus:ring-2 focus:ring-zen-sage/30 transition-all"
        autoFocus
      />
    </div>,

    // Step 2: Theme
    <div key="theme" className="flex-1 flex flex-col items-center justify-center text-center px-8">
      <h2 className="text-2xl font-light text-zen-forest dark:text-zen-parchment mb-2">
        Choose your light
      </h2>
      <p className="text-zen-moss dark:text-zen-stone mb-8 font-light">
        You can change this anytime
      </p>
      <div className="flex gap-4">
        {([
          { value: 'light' as const, icon: Sun, label: 'Light' },
          { value: 'dark' as const, icon: Moon, label: 'Dark' },
          { value: 'system' as const, icon: Monitor, label: 'Auto' },
        ]).map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            onClick={() => {
              setSelectedTheme(value);
              setTheme(value);
            }}
            className={`flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all ${
              selectedTheme === value
                ? 'bg-zen-sage/10 border-zen-sage text-zen-sage'
                : 'bg-white/50 dark:bg-zen-night-card/50 border-zen-sand dark:border-zen-night-border text-zen-moss dark:text-zen-stone hover:border-zen-sage/50'
            }`}
          >
            <Icon size={28} strokeWidth={1.5} />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>,

    // Step 3: Journal setup
    <div key="journal" className="flex-1 flex flex-col items-center justify-center text-center px-8">
      <h2 className="text-2xl font-light text-zen-forest dark:text-zen-parchment mb-2">
        Name your journal
      </h2>
      <p className="text-zen-moss dark:text-zen-stone mb-8 font-light">
        You can create more journals later
      </p>

      {/* Icon picker */}
      <div className="flex flex-wrap justify-center gap-2 mb-6 max-w-xs">
        {JOURNAL_ICONS.map((icon) => (
          <button
            key={icon}
            onClick={() => setJournalIcon(icon)}
            className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all ${
              journalIcon === icon
                ? 'bg-zen-sage/15 ring-2 ring-zen-sage scale-110'
                : 'bg-white/50 dark:bg-zen-night-card/50 hover:bg-zen-sage/5'
            }`}
          >
            {icon}
          </button>
        ))}
      </div>

      <input
        type="text"
        value={journalName}
        onChange={(e) => setJournalName(e.target.value)}
        placeholder="Personal"
        className="w-full max-w-xs text-center text-xl py-4 px-6 bg-white/70 dark:bg-zen-night-card/70 backdrop-blur-sm border border-zen-sand dark:border-zen-night-border rounded-2xl text-zen-forest dark:text-zen-parchment placeholder-zen-moss/50 focus:outline-none focus:ring-2 focus:ring-zen-sage/30 transition-all"
      />
    </div>,

    // Step 4: Ready
    <div key="ready" className="flex-1 flex flex-col items-center justify-center text-center px-8">
      <div className="w-20 h-20 bg-zen-sage/10 rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl">{journalIcon}</span>
      </div>
      <h2 className="text-2xl font-light text-zen-forest dark:text-zen-parchment mb-2">
        You&apos;re all set{name ? `, ${name}` : ''}
      </h2>
      <p className="text-zen-moss dark:text-zen-stone font-light max-w-sm">
        Your journal <span className="font-medium text-zen-sage">{journalName || 'Personal'}</span> is ready.
        Everything stays private on this device.
      </p>
    </div>,
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-zen-cream dark:bg-zen-night">
      {/* Zen animation background */}
      <ZenBackground variant="geometry" opacity={0.08} />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 pt-8 pb-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === step
                  ? 'w-8 bg-zen-sage'
                  : i < step
                  ? 'w-1.5 bg-zen-sage/40'
                  : 'w-1.5 bg-zen-sand dark:bg-zen-night-border'
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div
          className={`flex-1 flex flex-col transition-all duration-200 ${
            isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
          }`}
        >
          {steps[step]}
        </div>

        {/* Navigation buttons */}
        <div className="px-8 pb-8 pt-4">
          <div className="flex gap-3 max-w-xs mx-auto">
            {step > 0 && (
              <button
                onClick={goBack}
                className="p-4 rounded-2xl border border-zen-sand dark:border-zen-night-border text-zen-moss dark:text-zen-stone hover:bg-zen-parchment dark:hover:bg-zen-night-surface transition-all"
              >
                <ChevronLeft size={20} />
              </button>
            )}

            <button
              onClick={step === steps.length - 1 ? handleComplete : goNext}
              className="flex-1 py-4 px-6 bg-zen-sage hover:bg-zen-sage/90 text-white rounded-2xl font-medium transition-all flex items-center justify-center gap-2"
            >
              {step === 0
                ? 'Begin'
                : step === steps.length - 1
                ? 'Start Writing'
                : 'Continue'}
              {step < steps.length - 1 && <ChevronRight size={18} />}
            </button>
          </div>

          {step === 0 && (
            <p className="text-center text-zen-moss/60 dark:text-zen-stone/60 text-xs mt-4">
              Your journal stays private on this device
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/db';

interface UseOnboardingReturn {
  shouldShowTour: boolean;
  isLoading: boolean;
  completeTour: () => Promise<void>;
  resetTour: () => Promise<void>;
}

/**
 * Hook to manage onboarding tutorial state via Dexie settings table.
 * Reads `start_onboarding` and `onboarding_completed` keys.
 */
export function useOnboarding(): UseOnboardingReturn {
  const [shouldShowTour, setShouldShowTour] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkOnboarding = async () => {
      try {
        const completed = await db.settings.get('onboarding_completed');
        const startFlag = await db.settings.get('start_onboarding');

        if (startFlag?.value === true && completed?.value !== true) {
          setShouldShowTour(true);
        }
      } catch (error) {
        console.error('Error checking onboarding state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboarding();
  }, []);

  const completeTour = useCallback(async () => {
    try {
      await db.settings.put({ key: 'onboarding_completed', value: true });
      await db.settings.put({ key: 'start_onboarding', value: false });
      setShouldShowTour(false);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  }, []);

  const resetTour = useCallback(async () => {
    try {
      await db.settings.put({ key: 'onboarding_completed', value: false });
      await db.settings.put({ key: 'start_onboarding', value: true });
      setShouldShowTour(true);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  }, []);

  return { shouldShowTour, isLoading, completeTour, resetTour };
}

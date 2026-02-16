'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/hooks/useOnboarding';
import { TOUR_STEPS } from './tourSteps';
import { TutorialStep } from './TutorialStep';

const SPOTLIGHT_PADDING = 8;
const SPOTLIGHT_RADIUS = 12;
const TOOLTIP_GAP = 12;
const SCROLL_DELAY = 400;

export function TutorialOverlay() {
  const router = useRouter();
  const { shouldShowTour, isLoading, completeTour } = useOnboarding();
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{
    top: number;
    left: number;
    arrowDirection: 'top' | 'bottom' | 'none';
  }>({ top: 0, left: 0, arrowDirection: 'none' });
  const overlayRef = useRef<HTMLDivElement>(null);
  const startDelayRef = useRef<NodeJS.Timeout | null>(null);

  const step = TOUR_STEPS[currentStep];

  // Find the target element, falling back to mobile target if needed
  const findTargetElement = useCallback((stepIndex: number): HTMLElement | null => {
    const s = TOUR_STEPS[stepIndex];
    if (!s.target) return null;

    const el = document.querySelector<HTMLElement>(
      `[data-tour-step="${s.target}"]`
    );

    // Check if element is visible (not hidden via CSS)
    if (el && el.offsetParent !== null && el.getBoundingClientRect().width > 0) {
      return el;
    }

    // Fallback to mobile target
    if (s.mobileTarget) {
      const mobileEl = document.querySelector<HTMLElement>(
        `[data-tour-step="${s.mobileTarget}"]`
      );
      if (mobileEl && mobileEl.offsetParent !== null) {
        return mobileEl;
      }
    }

    return el; // Return the original even if hidden - let spotlight handle it
  }, []);

  // Calculate tooltip position based on target rect
  const calculateTooltipPosition = useCallback(
    (rect: DOMRect | null, position: string) => {
      if (!rect || position === 'center') {
        return { top: 0, left: 0, arrowDirection: 'none' as const };
      }

      const tooltipWidth = 340;
      const tooltipHeight = 220;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Center tooltip horizontally relative to target
      let left = rect.left + rect.width / 2 - tooltipWidth / 2;
      // Clamp to viewport
      left = Math.max(12, Math.min(left, viewportWidth - tooltipWidth - 12));

      let top: number;
      let arrowDirection: 'top' | 'bottom' | 'none';

      if (position === 'top') {
        // Place tooltip above the target
        top = rect.top - tooltipHeight - TOOLTIP_GAP - SPOTLIGHT_PADDING;
        arrowDirection = 'bottom';

        // If not enough room above, flip below
        if (top < 12) {
          top = rect.bottom + TOOLTIP_GAP + SPOTLIGHT_PADDING;
          arrowDirection = 'top';
        }
      } else {
        // Place tooltip below the target (default)
        top = rect.bottom + TOOLTIP_GAP + SPOTLIGHT_PADDING;
        arrowDirection = 'top';

        // If not enough room below, flip above
        if (top + tooltipHeight > viewportHeight - 12) {
          top = rect.top - tooltipHeight - TOOLTIP_GAP - SPOTLIGHT_PADDING;
          arrowDirection = 'bottom';
        }
      }

      // Final clamp
      top = Math.max(12, Math.min(top, viewportHeight - tooltipHeight - 12));

      return { top, left, arrowDirection };
    },
    []
  );

  // Position the spotlight and tooltip for the current step
  const positionStep = useCallback(
    (stepIndex: number) => {
      const s = TOUR_STEPS[stepIndex];
      if (s.position === 'center' || !s.target) {
        setTargetRect(null);
        setTooltipPosition({ top: 0, left: 0, arrowDirection: 'none' });
        return;
      }

      const el = findTargetElement(stepIndex);
      if (!el) {
        setTargetRect(null);
        setTooltipPosition({ top: 0, left: 0, arrowDirection: 'none' });
        return;
      }

      // Scroll element into view if needed
      const rect = el.getBoundingClientRect();
      const isInView =
        rect.top >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.left >= 0 &&
        rect.right <= window.innerWidth;

      if (!isInView) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Wait for scroll to finish, then position
        setTimeout(() => {
          const newRect = el.getBoundingClientRect();
          setTargetRect(newRect);
          setTooltipPosition(calculateTooltipPosition(newRect, s.position));
        }, SCROLL_DELAY);
      } else {
        setTargetRect(rect);
        setTooltipPosition(calculateTooltipPosition(rect, s.position));
      }
    },
    [findTargetElement, calculateTooltipPosition]
  );

  // Start the tour with a small delay to let the page render
  useEffect(() => {
    if (shouldShowTour && !isLoading) {
      startDelayRef.current = setTimeout(() => {
        setIsVisible(true);
        positionStep(0);
      }, 600);
    }

    return () => {
      if (startDelayRef.current) clearTimeout(startDelayRef.current);
    };
  }, [shouldShowTour, isLoading, positionStep]);

  // Reposition on resize/scroll
  useEffect(() => {
    if (!isVisible) return;

    const handleReposition = () => {
      positionStep(currentStep);
    };

    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [isVisible, currentStep, positionStep]);

  // Keyboard navigation
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          handleSkip();
          break;
        case 'ArrowRight':
        case 'Enter':
          handleNext();
          break;
        case 'ArrowLeft':
          handleBack();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, currentStep]);

  const handleNext = useCallback(() => {
    if (currentStep >= TOUR_STEPS.length - 1) {
      // Tour complete
      completeTour();
      setIsVisible(false);
      router.push('/journal/new');
      return;
    }

    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    // Small delay for animation
    setTimeout(() => positionStep(nextStep), 50);
  }, [currentStep, completeTour, router, positionStep]);

  const handleBack = useCallback(() => {
    if (currentStep <= 0) return;
    const prevStep = currentStep - 1;
    setCurrentStep(prevStep);
    setTimeout(() => positionStep(prevStep), 50);
  }, [currentStep, positionStep]);

  const handleSkip = useCallback(() => {
    completeTour();
    setIsVisible(false);
  }, [completeTour]);

  // Don't render if tour shouldn't show or still loading
  if (!isVisible || isLoading) return null;

  return (
    <div ref={overlayRef} className="animate-tour-fade-in">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 transition-opacity duration-300"
        style={{ zIndex: 60 }}
        onClick={handleSkip}
      >
        {/* Dark overlay with cutout */}
        {targetRect ? (
          <svg
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <mask id="spotlight-mask">
                {/* White = visible (dark backdrop shows) */}
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                {/* Black = cutout (transparent hole) */}
                <rect
                  x={targetRect.left - SPOTLIGHT_PADDING}
                  y={targetRect.top - SPOTLIGHT_PADDING}
                  width={targetRect.width + SPOTLIGHT_PADDING * 2}
                  height={targetRect.height + SPOTLIGHT_PADDING * 2}
                  rx={SPOTLIGHT_RADIUS}
                  ry={SPOTLIGHT_RADIUS}
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="rgba(0, 0, 0, 0.6)"
              mask="url(#spotlight-mask)"
            />
          </svg>
        ) : (
          /* No target — full dark backdrop for centered steps */
          <div className="absolute inset-0 bg-black/60" />
        )}

        {/* Spotlight border glow around target */}
        {targetRect && (
          <div
            className="absolute rounded-xl ring-2 ring-zen-sage/50 ring-offset-2 ring-offset-transparent animate-pulse pointer-events-none"
            style={{
              left: targetRect.left - SPOTLIGHT_PADDING,
              top: targetRect.top - SPOTLIGHT_PADDING,
              width: targetRect.width + SPOTLIGHT_PADDING * 2,
              height: targetRect.height + SPOTLIGHT_PADDING * 2,
            }}
          />
        )}
      </div>

      {/* Tooltip card */}
      <TutorialStep
        key={step.id}
        step={step}
        currentIndex={currentStep}
        totalSteps={TOUR_STEPS.length}
        onNext={handleNext}
        onBack={handleBack}
        onSkip={handleSkip}
        style={
          step.position !== 'center'
            ? { top: tooltipPosition.top, left: tooltipPosition.left }
            : undefined
        }
        arrowDirection={tooltipPosition.arrowDirection}
      />
    </div>
  );
}

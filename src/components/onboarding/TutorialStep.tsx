'use client';

import React from 'react';
import type { TourStep } from './tourSteps';

interface TutorialStepProps {
  step: TourStep;
  currentIndex: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  style?: React.CSSProperties;
  arrowDirection: 'top' | 'bottom' | 'none';
}

export function TutorialStep({
  step,
  currentIndex,
  totalSteps,
  onNext,
  onBack,
  onSkip,
  style,
  arrowDirection,
}: TutorialStepProps) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalSteps - 1;
  const isCentered = step.position === 'center';

  return (
    <div
      className={`${
        isCentered
          ? 'fixed inset-0 flex items-center justify-center px-4'
          : 'fixed'
      }`}
      style={isCentered ? { zIndex: 70 } : { zIndex: 70, ...style }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="bg-white dark:bg-zen-night-card rounded-2xl shadow-sm border border-zen-sand dark:border-zen-night-border w-full animate-tour-slide-up"
        style={{ maxWidth: isCentered ? '380px' : '340px' }}
      >
        {/* Arrow pointing to target */}
        {arrowDirection === 'top' && (
          <div className="flex justify-center -mt-2">
            <div className="w-4 h-4 bg-white dark:bg-zen-night-card border-l border-t border-zen-sand dark:border-zen-night-border rotate-45 transform -translate-y-0.5" />
          </div>
        )}

        <div className={`p-5 ${arrowDirection === 'top' ? 'pt-3' : ''}`}>
          {/* Icon & Title */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{step.icon}</span>
            <h3 className="text-lg font-bold text-zen-forest dark:text-zen-sand">
              {step.title}
            </h3>
          </div>

          {/* Description */}
          <p className="text-sm text-zen-moss dark:text-zen-stone leading-relaxed mb-5">
            {step.description}
          </p>

          {/* Step dots */}
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'w-6 h-2 bg-zen-sage'
                    : i < currentIndex
                      ? 'w-2 h-2 bg-zen-sage/40 dark:bg-zen-sage/50'
                      : 'w-2 h-2 bg-zen-sand dark:bg-zen-night-border'
                }`}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Skip / Back button (left side) */}
            {isFirst ? (
              <button
                onClick={onSkip}
                className="flex-1 py-2.5 px-4 text-sm font-medium text-zen-stone dark:text-zen-stone hover:text-zen-moss dark:hover:text-zen-sand transition-colors rounded-xl hover:bg-zen-parchment dark:hover:bg-zen-night-border"
              >
                Skip
              </button>
            ) : (
              <button
                onClick={onBack}
                className="flex-1 py-2.5 px-4 text-sm font-medium text-zen-moss dark:text-zen-sand hover:text-zen-forest dark:hover:text-white transition-colors rounded-xl border border-zen-sand dark:border-zen-night-border hover:bg-zen-parchment dark:hover:bg-zen-night-border"
              >
                Back
              </button>
            )}

            {/* Next / Complete button (right side) */}
            {isLast ? (
              <button
                onClick={onNext}
                className="flex-1 py-2.5 px-4 text-sm font-semibold text-white bg-zen-sage rounded-xl hover:bg-zen-sage-light hover:shadow-sm transition-all hover:-translate-y-0.5 active:scale-[0.98]"
              >
                Start Writing
              </button>
            ) : (
              <button
                onClick={onNext}
                className="flex-1 py-2.5 px-4 text-sm font-semibold text-white bg-zen-sage rounded-xl hover:bg-zen-sage-light hover:shadow-sm transition-all hover:-translate-y-0.5 active:scale-[0.98]"
              >
                {isFirst ? "Let's Go" : 'Next'}
              </button>
            )}
          </div>

          {/* Skip link for non-first, non-last steps */}
          {!isFirst && !isLast && (
            <button
              onClick={onSkip}
              className="w-full mt-2 py-1 text-xs text-zen-stone dark:text-zen-stone hover:text-zen-moss dark:hover:text-zen-sand transition-colors"
            >
              Skip tour
            </button>
          )}
        </div>

        {/* Arrow pointing down to target */}
        {arrowDirection === 'bottom' && (
          <div className="flex justify-center -mb-2">
            <div className="w-4 h-4 bg-white dark:bg-zen-night-card border-r border-b border-zen-sand dark:border-zen-night-border rotate-45 transform translate-y-0.5" />
          </div>
        )}
      </div>
    </div>
  );
}

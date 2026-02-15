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
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full animate-tour-slide-up"
        style={{ maxWidth: isCentered ? '380px' : '340px' }}
      >
        {/* Arrow pointing to target */}
        {arrowDirection === 'top' && (
          <div className="flex justify-center -mt-2">
            <div className="w-4 h-4 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700 rotate-45 transform -translate-y-0.5" />
          </div>
        )}

        <div className={`p-5 ${arrowDirection === 'top' ? 'pt-3' : ''}`}>
          {/* Icon & Title */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{step.icon}</span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {step.title}
            </h3>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-5">
            {step.description}
          </p>

          {/* Step dots */}
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'w-6 h-2 bg-blue-600'
                    : i < currentIndex
                      ? 'w-2 h-2 bg-blue-300 dark:bg-blue-700'
                      : 'w-2 h-2 bg-gray-200 dark:bg-gray-600'
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
                className="flex-1 py-2.5 px-4 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Skip
              </button>
            ) : (
              <button
                onClick={onBack}
                className="flex-1 py-2.5 px-4 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Back
              </button>
            )}

            {/* Next / Complete button (right side) */}
            {isLast ? (
              <button
                onClick={onNext}
                className="flex-1 py-2.5 px-4 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-[0.98]"
              >
                Start Writing
              </button>
            ) : (
              <button
                onClick={onNext}
                className="flex-1 py-2.5 px-4 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-[0.98]"
              >
                {isFirst ? "Let's Go" : 'Next'}
              </button>
            )}
          </div>

          {/* Skip link for non-first, non-last steps */}
          {!isFirst && !isLast && (
            <button
              onClick={onSkip}
              className="w-full mt-2 py-1 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Skip tour
            </button>
          )}
        </div>

        {/* Arrow pointing down to target */}
        {arrowDirection === 'bottom' && (
          <div className="flex justify-center -mb-2">
            <div className="w-4 h-4 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700 rotate-45 transform translate-y-0.5" />
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { createRipples } from './animations/ripples';
import { createGeometry } from './animations/geometry';
import { createParticles } from './animations/particles';

export type ZenVariant = 'ripples' | 'geometry' | 'particles';

interface ZenBackgroundProps {
  variant?: ZenVariant;
  opacity?: number;
  className?: string;
}

export function ZenBackground({
  variant = 'ripples',
  opacity = 0.15,
  className = '',
}: ZenBackgroundProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { theme } = useTheme();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!svgRef.current || prefersReducedMotion) return;

    const color = theme === 'dark' ? '#8AAE8C' : '#5B7F5E';
    let cleanup: (() => void) | undefined;

    switch (variant) {
      case 'ripples':
        cleanup = createRipples(svgRef.current, { color });
        break;
      case 'geometry':
        cleanup = createGeometry(svgRef.current, { color });
        break;
      case 'particles':
        cleanup = createParticles(svgRef.current, { color });
        break;
    }

    return () => {
      cleanup?.();
    };
  }, [variant, theme, prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <svg
      ref={svgRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    />
  );
}

import { select } from 'd3-selection';
import { timer } from 'd3-timer';

export interface ParticlesConfig {
  color?: string;
  count?: number;
  speed?: number;
  maxSize?: number;
}

export function createParticles(
  svgElement: SVGSVGElement,
  config: ParticlesConfig = {}
) {
  const {
    color = '#5B7F5E',
    count = 30,
    speed = 0.3,
    maxSize = 4,
  } = config;

  const svg = select(svgElement);
  const g = svg.append('g').attr('class', 'particles');

  let width = svgElement.clientWidth || 400;
  let height = svgElement.clientHeight || 600;

  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      width = entry.contentRect.width;
      height = entry.contentRect.height;
    }
  });
  resizeObserver.observe(svgElement);

  interface Particle {
    x: number;
    y: number;
    size: number;
    baseOpacity: number;
    speedY: number;
    wobbleSpeed: number;
    wobbleAmount: number;
    phase: number;
  }

  // Initialize particles
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 1 + Math.random() * maxSize,
      baseOpacity: 0.1 + Math.random() * 0.35,
      speedY: (0.2 + Math.random() * 0.8) * speed,
      wobbleSpeed: 0.0005 + Math.random() * 0.002,
      wobbleAmount: 20 + Math.random() * 40,
      phase: Math.random() * Math.PI * 2,
    });
  }

  // Create circle elements
  particles.forEach((p, i) => {
    g.append('circle')
      .attr('class', `particle-${i}`)
      .attr('r', p.size)
      .attr('fill', color)
      .attr('opacity', p.baseOpacity);
  });

  const t = timer((elapsed) => {
    particles.forEach((p, i) => {
      // Float upward
      p.y -= p.speedY;

      // Gentle sine wave drift
      const wobbleX = Math.sin(elapsed * p.wobbleSpeed + p.phase) * p.wobbleAmount;

      // Pulsing opacity
      const opacityPulse = Math.sin(elapsed * 0.001 + p.phase) * 0.15;

      // Wrap around when off screen
      if (p.y < -20) {
        p.y = height + 20;
        p.x = Math.random() * width;
      }

      g.select(`.particle-${i}`)
        .attr('cx', p.x + wobbleX)
        .attr('cy', p.y)
        .attr('opacity', Math.max(0.05, p.baseOpacity + opacityPulse));
    });
  });

  return () => {
    t.stop();
    resizeObserver.disconnect();
    g.remove();
  };
}

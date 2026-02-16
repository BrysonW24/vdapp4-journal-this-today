import { select } from 'd3-selection';
import { timer } from 'd3-timer';

export interface RippleConfig {
  color?: string;
  maxRadius?: number;
  spawnInterval?: number;
  speed?: number;
}

export function createRipples(
  svgElement: SVGSVGElement,
  config: RippleConfig = {}
) {
  const {
    color = '#5B7F5E',
    maxRadius = 200,
    spawnInterval = 3000,
    speed = 0.015,
  } = config;

  const svg = select(svgElement);
  const g = svg.append('g').attr('class', 'ripples');

  interface Ripple {
    x: number;
    y: number;
    radius: number;
    opacity: number;
    birth: number;
  }

  const ripples: Ripple[] = [];
  let lastSpawn = 0;
  let width = svgElement.clientWidth || 400;
  let height = svgElement.clientHeight || 600;

  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      width = entry.contentRect.width;
      height = entry.contentRect.height;
    }
  });
  resizeObserver.observe(svgElement);

  const t = timer((elapsed) => {
    // Spawn new ripple
    if (elapsed - lastSpawn > spawnInterval) {
      ripples.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0,
        opacity: 0.6,
        birth: elapsed,
      });
      lastSpawn = elapsed;
    }

    // Update ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      const age = (elapsed - r.birth) * speed;
      r.radius = age * maxRadius;
      r.opacity = Math.max(0, 0.6 * (1 - r.radius / maxRadius));

      if (r.opacity <= 0) {
        ripples.splice(i, 1);
      }
    }

    // Render
    const circles = g.selectAll<SVGCircleElement, Ripple>('circle').data(ripples, (_d, i) => i.toString());

    circles
      .enter()
      .append('circle')
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 1.5)
      .merge(circles)
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('r', (d) => d.radius)
      .attr('opacity', (d) => d.opacity);

    circles.exit().remove();
  });

  return () => {
    t.stop();
    resizeObserver.disconnect();
    g.remove();
  };
}

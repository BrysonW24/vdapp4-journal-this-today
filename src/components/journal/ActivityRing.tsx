'use client';

import { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface ActivityRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}

export function ActivityRing({
  value,
  max,
  size = 80,
  strokeWidth = 6,
  color = '#5B7F5E',
  label,
}: ActivityRingProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    const progress = Math.min(value / Math.max(max, 1), 1);

    const g = svg.append('g').attr('transform', `translate(${center}, ${center})`);

    // Background arc
    const bgArc = d3.arc<any>()
      .innerRadius(radius - strokeWidth / 2)
      .outerRadius(radius + strokeWidth / 2)
      .startAngle(0)
      .endAngle(2 * Math.PI)
      .cornerRadius(strokeWidth / 2);

    g.append('path')
      .attr('d', bgArc({}) as string)
      .attr('fill', 'currentColor')
      .attr('opacity', 0.08);

    // Progress arc with animation
    const progressArc = d3.arc<any>()
      .innerRadius(radius - strokeWidth / 2)
      .outerRadius(radius + strokeWidth / 2)
      .startAngle(0)
      .cornerRadius(strokeWidth / 2);

    const progressPath = g.append('path')
      .attr('fill', color)
      .attr('opacity', 0.9);

    // Animate the arc
    progressPath
      .transition()
      .duration(1000)
      .ease(d3.easeElasticOut.amplitude(1).period(0.5))
      .attrTween('d', () => {
        const interpolate = d3.interpolate(0, progress * 2 * Math.PI);
        return (t: number) => {
          return progressArc({ endAngle: interpolate(t) }) as string;
        };
      });

    // Center text — value
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('y', label ? -4 : 0)
      .attr('font-size', `${size * 0.22}px`)
      .attr('font-weight', '700')
      .attr('fill', 'currentColor')
      .text(value);

    // Label text below value
    if (label) {
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('y', size * 0.15)
        .attr('font-size', `${Math.max(8, size * 0.1)}px`)
        .attr('font-weight', '500')
        .attr('fill', 'currentColor')
        .attr('opacity', 0.4)
        .text(label);
    }

  }, [value, max, size, strokeWidth, color, label]);

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      className="text-zen-forest dark:text-zen-parchment"
    />
  );
}

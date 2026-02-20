'use client';

import { useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import { format, subDays } from 'date-fns';
import type { JournalEntry } from '@/types/journal';

interface WeeklySparklineProps {
  entries: JournalEntry[];
  days?: number;
  height?: number;
  color?: string;
}

export function WeeklySparkline({
  entries,
  days = 30,
  height = 48,
  color = '#5B7F5E',
}: WeeklySparklineProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const dailyCounts = useMemo(() => {
    const today = new Date();
    const counts: { date: string; count: number }[] = [];
    const entryDates = new Map<string, number>();

    entries.forEach((e) => {
      const key = format(new Date(e.createdAt), 'yyyy-MM-dd');
      entryDates.set(key, (entryDates.get(key) || 0) + 1);
    });

    for (let i = days - 1; i >= 0; i--) {
      const dateStr = format(subDays(today, i), 'yyyy-MM-dd');
      counts.push({
        date: dateStr,
        count: entryDates.get(dateStr) || 0,
      });
    }

    return counts;
  }, [entries, days]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('width', width).attr('height', height);

    const margin = { top: 4, right: 2, bottom: 4, left: 2 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    const x = d3.scaleLinear()
      .domain([0, dailyCounts.length - 1])
      .range([0, innerWidth]);

    const maxCount = d3.max(dailyCounts, (d) => d.count) || 1;
    const y = d3.scaleLinear()
      .domain([0, maxCount])
      .range([innerHeight, 0]);

    // Area fill
    const area = d3.area<typeof dailyCounts[0]>()
      .x((_d, i) => x(i))
      .y0(innerHeight)
      .y1((d) => y(d.count))
      .curve(d3.curveBumpX);

    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'sparkline-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', color)
      .attr('stop-opacity', 0.3);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', color)
      .attr('stop-opacity', 0.02);

    g.append('path')
      .datum(dailyCounts)
      .attr('fill', 'url(#sparkline-gradient)')
      .attr('d', area);

    // Line
    const line = d3.line<typeof dailyCounts[0]>()
      .x((_d, i) => x(i))
      .y((d) => y(d.count))
      .curve(d3.curveBumpX);

    const path = g.append('path')
      .datum(dailyCounts)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('stroke-linecap', 'round')
      .attr('d', line);

    // Animate the line drawing
    const totalLength = (path.node() as SVGPathElement)?.getTotalLength() || 0;
    path
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(1200)
      .ease(d3.easeQuadOut)
      .attr('stroke-dashoffset', 0);

    // End dot
    const lastPoint = dailyCounts[dailyCounts.length - 1];
    if (lastPoint.count > 0) {
      g.append('circle')
        .attr('cx', x(dailyCounts.length - 1))
        .attr('cy', y(lastPoint.count))
        .attr('r', 3)
        .attr('fill', color)
        .attr('opacity', 0)
        .transition()
        .delay(1200)
        .duration(300)
        .attr('opacity', 1);
    }

  }, [dailyCounts, height, color]);

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" />
    </div>
  );
}

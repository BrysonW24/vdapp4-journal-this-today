'use client';

import { useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import { format, subDays, startOfDay } from 'date-fns';
import type { JournalEntry } from '@/types/journal';

interface MoodHeatmapProps {
  entries: JournalEntry[];
  weeks?: number;
}

const moodColors: Record<number, string> = {
  1: '#EF4444', // Very Sad — red
  2: '#F97316', // Sad — orange
  3: '#EAB308', // Neutral — yellow
  4: '#22C55E', // Happy — green
  5: '#5B7F5E', // Very Happy — zen-sage
};

export function MoodHeatmap({ entries, weeks = 12 }: MoodHeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const dayData = useMemo(() => {
    const totalDays = weeks * 7;
    const today = startOfDay(new Date());
    const data: { date: Date; dateStr: string; mood: number | null; hasEntry: boolean }[] = [];

    const entryMap = new Map<string, { mood: number | null; count: number }>();
    entries.forEach((e) => {
      const key = format(new Date(e.createdAt), 'yyyy-MM-dd');
      const existing = entryMap.get(key);
      if (!existing) {
        entryMap.set(key, { mood: e.mood || null, count: 1 });
      } else {
        entryMap.set(key, {
          mood: e.mood ? Math.max(existing.mood || 0, e.mood) : existing.mood,
          count: existing.count + 1,
        });
      }
    });

    for (let i = totalDays - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const entryData = entryMap.get(dateStr);
      data.push({
        date,
        dateStr,
        mood: entryData?.mood || null,
        hasEntry: !!entryData,
      });
    }

    return data;
  }, [entries, weeks]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const cellSize = Math.floor((containerWidth - 30) / weeks) - 2;
    const cellGap = 2;
    const width = weeks * (cellSize + cellGap) + 30;
    const height = 7 * (cellSize + cellGap) + 20;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('width', width).attr('height', height);

    const g = svg.append('g').attr('transform', 'translate(20, 15)');

    // Day labels
    const dayLabels = ['M', '', 'W', '', 'F', '', ''];
    g.selectAll('.day-label')
      .data(dayLabels)
      .join('text')
      .attr('class', 'day-label')
      .attr('x', -5)
      .attr('y', (_d, i) => i * (cellSize + cellGap) + cellSize / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '9px')
      .attr('fill', 'currentColor')
      .attr('opacity', 0.3)
      .text((d) => d);

    // Cells
    g.selectAll('.cell')
      .data(dayData)
      .join('rect')
      .attr('class', 'cell')
      .attr('x', (_d, i) => Math.floor(i / 7) * (cellSize + cellGap))
      .attr('y', (_d, i) => (i % 7) * (cellSize + cellGap))
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('rx', Math.max(2, cellSize * 0.2))
      .attr('fill', (d) => {
        if (!d.hasEntry) return 'currentColor';
        if (d.mood) return moodColors[d.mood] || '#5B7F5E';
        return '#5B7F5E';
      })
      .attr('opacity', (d) => {
        if (!d.hasEntry) return 0.06;
        if (d.mood) return 0.8;
        return 0.4;
      })
      .style('transition', 'all 0.2s ease')
      .on('mouseover', function () {
        d3.select(this).attr('opacity', 1).attr('stroke', '#5B7F5E').attr('stroke-width', 1.5);
      })
      .on('mouseout', function (_event, d) {
        d3.select(this)
          .attr('opacity', d.hasEntry ? (d.mood ? 0.8 : 0.4) : 0.06)
          .attr('stroke', 'none');
      });

  }, [dayData, weeks]);

  return (
    <div ref={containerRef} className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-zen-forest dark:text-zen-parchment">Mood Heatmap</h3>
        <span className="text-[10px] text-zen-moss/40 dark:text-zen-stone/40">Last {weeks} weeks</span>
      </div>
      <div className="overflow-x-auto">
        <svg ref={svgRef} className="text-zen-forest dark:text-zen-parchment" />
      </div>
      <div className="flex items-center gap-3 mt-2.5 justify-end">
        <span className="text-[10px] text-zen-moss/40 dark:text-zen-stone/40">Less</span>
        {[0.06, 0.2, 0.4, 0.6, 0.8].map((opacity, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: '#5B7F5E', opacity }}
          />
        ))}
        <span className="text-[10px] text-zen-moss/40 dark:text-zen-stone/40">More</span>
      </div>
    </div>
  );
}

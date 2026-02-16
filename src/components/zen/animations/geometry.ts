import { select } from 'd3-selection';
import { timer } from 'd3-timer';

export interface GeometryConfig {
  color?: string;
  rings?: number;
  petals?: number;
  rotationSpeed?: number;
}

export function createGeometry(
  svgElement: SVGSVGElement,
  config: GeometryConfig = {}
) {
  const {
    color = '#5B7F5E',
    rings = 4,
    petals = 6,
    rotationSpeed = 0.002,
  } = config;

  const svg = select(svgElement);
  let width = svgElement.clientWidth || 400;
  let height = svgElement.clientHeight || 600;

  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      width = entry.contentRect.width;
      height = entry.contentRect.height;
      updateLayout();
    }
  });
  resizeObserver.observe(svgElement);

  const g = svg.append('g').attr('class', 'geometry');

  function updateLayout() {
    g.attr('transform', `translate(${width / 2}, ${height / 2})`);
  }
  updateLayout();

  // Create the flower of life pattern
  const baseRadius = Math.min(width, height) * 0.15;

  // Draw overlapping circles for each ring
  for (let ring = 0; ring < rings; ring++) {
    const ringRadius = baseRadius * (ring + 1) * 0.5;
    const ringGroup = g.append('g').attr('class', `ring-${ring}`);

    for (let p = 0; p < petals; p++) {
      const angle = (p / petals) * Math.PI * 2;
      ringGroup
        .append('circle')
        .attr('cx', Math.cos(angle) * ringRadius)
        .attr('cy', Math.sin(angle) * ringRadius)
        .attr('r', baseRadius)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 0.8)
        .attr('opacity', 0.3 - ring * 0.05);
    }

    // Center circle for each ring
    ringGroup
      .append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', ringRadius)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.15);
  }

  // Slowly rotating outer ring of dots
  const dotGroup = g.append('g').attr('class', 'dots');
  const dotCount = 12;
  const dotRadius = baseRadius * rings * 0.55;

  for (let i = 0; i < dotCount; i++) {
    const angle = (i / dotCount) * Math.PI * 2;
    dotGroup
      .append('circle')
      .attr('cx', Math.cos(angle) * dotRadius)
      .attr('cy', Math.sin(angle) * dotRadius)
      .attr('r', 2)
      .attr('fill', color)
      .attr('opacity', 0.3);
  }

  const t = timer((elapsed) => {
    const rotation = elapsed * rotationSpeed;
    g.selectAll('.ring-0').attr('transform', `rotate(${rotation})`);
    g.selectAll('.ring-1').attr('transform', `rotate(${-rotation * 0.7})`);
    g.selectAll('.ring-2').attr('transform', `rotate(${rotation * 0.5})`);
    g.selectAll('.ring-3').attr('transform', `rotate(${-rotation * 0.3})`);
    dotGroup.attr('transform', `rotate(${rotation * 0.3})`);
  });

  return () => {
    t.stop();
    resizeObserver.disconnect();
    g.remove();
  };
}

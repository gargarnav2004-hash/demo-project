"use client";

import { useEffect, useRef, useState } from "react";
import type { TrendPoint } from "@/lib/progress";

const HEIGHT = 200;
const MARGIN = { top: 12, right: 12, bottom: 26, left: 24 };
const TICKS = [1, 2, 3, 4, 5];

function plural(count: number): string {
  return `${count} ${count === 1 ? "answer" : "answers"}`;
}

export default function ScoreTrendChart({ points }: { points: TrendPoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 1);
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const x = (i: number) =>
    MARGIN.left + (points.length > 1 ? (i / (points.length - 1)) * plotWidth : plotWidth / 2);
  const y = (score: number) => MARGIN.top + ((5 - score) / 4) * plotHeight;
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)} ${y(p.average)}`).join(" ");

  function handlePointer(event: React.PointerEvent<SVGSVGElement>) {
    const left = event.currentTarget.getBoundingClientRect().left;
    const position = event.clientX - left;
    let nearest = 0;
    points.forEach((_, i) => {
      if (Math.abs(x(i) - position) < Math.abs(x(nearest) - position)) nearest = i;
    });
    setActiveIndex(nearest);
  }

  const active = activeIndex === null ? null : points[activeIndex];
  const last = points[points.length - 1];

  return (
    <div ref={containerRef} className="relative">
      <svg
        width={width}
        height={HEIGHT}
        className="block touch-pan-y"
        role="img"
        aria-label={`Average score per practice day. Latest: ${last.average.toFixed(1)} out of 5 on ${last.label}.`}
        onPointerMove={handlePointer}
        onPointerDown={handlePointer}
        onPointerLeave={() => setActiveIndex(null)}
      >
        {TICKS.map((tick) => (
          <g key={tick}>
            <line
              x1={MARGIN.left}
              x2={width - MARGIN.right}
              y1={y(tick)}
              y2={y(tick)}
              stroke="var(--border)"
              strokeWidth={1}
            />
            <text x={MARGIN.left - 10} y={y(tick) + 4} textAnchor="end" fontSize={12} fill="var(--muted)">
              {tick}
            </text>
          </g>
        ))}

        <text x={x(0)} y={HEIGHT - 6} textAnchor={points.length > 1 ? "start" : "middle"} fontSize={12} fill="var(--muted)">
          {points[0].label}
        </text>
        {points.length > 1 && (
          <text x={width - MARGIN.right} y={HEIGHT - 6} textAnchor="end" fontSize={12} fill="var(--muted)">
            {last.label}
          </text>
        )}

        {active && activeIndex !== null && (
          <line
            x1={x(activeIndex)}
            x2={x(activeIndex)}
            y1={MARGIN.top}
            y2={MARGIN.top + plotHeight}
            stroke="var(--muted)"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        )}

        <path d={line} fill="none" stroke="var(--primary)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {points.map((point, i) => (
          <circle
            key={point.day}
            cx={x(i)}
            cy={y(point.average)}
            r={activeIndex === i ? 6 : 4}
            fill="var(--primary)"
            stroke="var(--surface)"
            strokeWidth={2}
          />
        ))}
      </svg>

      {active && activeIndex !== null && (
        <div
          className="pointer-events-none absolute top-0 z-10 w-max rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-sm"
          style={{
            left: Math.min(Math.max(x(activeIndex) - 56, 0), Math.max(width - 112, 0)),
          }}
        >
          <p className="font-medium">{active.average.toFixed(1)} / 5</p>
          <p className="text-muted">
            {active.label} · {plural(active.count)}
          </p>
        </div>
      )}

      <table className="sr-only">
        <caption>Average score per practice day</caption>
        <thead>
          <tr>
            <th>Day</th>
            <th>Average score</th>
            <th>Answers</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.day}>
              <td>{point.label}</td>
              <td>{point.average.toFixed(1)}</td>
              <td>{point.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

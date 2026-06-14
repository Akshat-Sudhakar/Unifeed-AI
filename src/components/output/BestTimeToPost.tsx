'use client';

import { useState, useCallback } from 'react';
import type { PostingTime, Platform } from '@/lib/types';

interface BestTimeToPostProps {
  postingTimes: PostingTime[];
}

/** Platform-specific styling configuration — Newsprint palette */
const platformStyles: Record<
  Platform,
  { label: string; badge: string; icon: string }
> = {
  linkedin: {
    label: 'LinkedIn',
    badge: 'border-[#111111] bg-white text-[#111111]',
    icon: '💼',
  },
  'instagram-post': {
    label: 'Instagram Post',
    badge: 'border-[#111111] bg-white text-[#111111]',
    icon: '📸',
  },
  'instagram-reels': {
    label: 'Instagram Reels',
    badge: 'border-[#111111] bg-white text-[#111111]',
    icon: '🎬',
  },
};

const timeSlots = [
  '6 AM', '8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM',
];

function isSlotHighlighted(slot: string, bestTimes: string[]): boolean {
  const slotHour = parseSlotHour(slot);
  if (slotHour === null) return false;
  return bestTimes.some((bt) => {
    const hour = parseTimeHour(bt);
    return hour !== null && hour === slotHour;
  });
}

function parseSlotHour(slot: string): number | null {
  const match = slot.match(/^(\d{1,2})\s*(AM|PM)$/i);
  if (!match) return null;
  let h = parseInt(match[1], 10);
  const meridiem = match[2].toUpperCase();
  if (meridiem === 'PM' && h !== 12) h += 12;
  if (meridiem === 'AM' && h === 12) h = 0;
  return h;
}

function parseTimeHour(time: string): number | null {
  const match = time.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  if (!match) return null;
  let h = parseInt(match[1], 10);
  const meridiem = match[3].toUpperCase();
  if (meridiem === 'PM' && h !== 12) h += 12;
  if (meridiem === 'AM' && h === 12) h = 0;
  return h;
}

export default function BestTimeToPost({ postingTimes }: BestTimeToPostProps) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const toggleReasoning = useCallback((idx: number) => {
    setExpandedIdx((prev) => (prev === idx ? null : idx));
  }, []);

  if (postingTimes.length === 0) return null;

  return (
    <section className="mt-8" aria-label="Best times to post">
      {/* Section header */}
      <div className="mb-4 flex items-center gap-3 border-b-4 border-[#111111] pb-2">
        <div className="flex h-8 w-8 items-center justify-center border-2 border-[#111111] bg-[#111111] text-white sharp-corners text-base">
          🕐
        </div>
        <h3 className="font-heading text-xl font-black text-[#111111] uppercase tracking-tighter">
          Best Time to Post
        </h3>
      </div>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {postingTimes.map((pt, idx) => {
          const style = platformStyles[pt.platform] ?? platformStyles['linkedin'];
          const isExpanded = expandedIdx === idx;

          return (
            <article
              key={`${pt.platform}-${idx}`}
              className="relative overflow-hidden border-2 border-[#111111] bg-[#F9F9F7] p-5 transition-all duration-300 hover:bg-[#E5E5E0] sharp-corners shadow-[4px_4px_0px_0px_#111111]"
            >
              {/* Decorative clock watermark */}
              <div className="pointer-events-none absolute -right-3 -top-3 text-5xl opacity-10 grayscale" aria-hidden="true">
                🕐
              </div>

              {/* Platform badge */}
              <div className="mb-4 flex items-center gap-2 border-b border-[#111111] pb-3">
                <span className="text-base" aria-hidden="true">{style.icon}</span>
                <span className={`border-2 px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-widest sharp-corners ${style.badge}`}>
                  {style.label}
                </span>
              </div>

              {/* Best Days */}
              <div className="mb-4">
                <h4 className="mb-2 text-[10px] font-mono font-bold uppercase tracking-widest text-[#111111]">
                  Best Days
                </h4>
                <div className="flex flex-wrap gap-2">
                  {pt.bestDays.map((day) => (
                    <span
                      key={day}
                      className="border border-[#111111] bg-white px-2 py-0.5 text-xs font-mono font-bold text-[#111111] sharp-corners"
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>

              {/* Best Times */}
              <div className="mb-4">
                <h4 className="mb-2 text-[10px] font-mono font-bold uppercase tracking-widest text-[#111111]">
                  Best Times
                </h4>
                <div className="flex flex-wrap gap-2">
                  {pt.bestTimes.map((time) => (
                    <span
                      key={time}
                      className="border-2 border-[#111111] bg-[#111111] px-2 py-0.5 text-xs font-mono font-bold text-white sharp-corners"
                    >
                      {time}
                    </span>
                  ))}
                </div>
              </div>

              {/* Visual Timeline */}
              <div className="mb-4">
                <h4 className="mb-2 text-[10px] font-mono font-bold uppercase tracking-widest text-[#111111]">
                  Timeline
                </h4>
                <div
                  className="flex items-center gap-0.5"
                  aria-label="Visual timeline showing highlighted posting slots"
                >
                  {timeSlots.map((slot) => {
                    const highlighted = isSlotHighlighted(slot, pt.bestTimes);
                    return (
                      <div key={slot} className="flex flex-col items-center" title={slot}>
                        <div
                          className={`h-4 w-full min-w-[18px] transition-colors border-y border-[#111111] ${
                            highlighted
                              ? `bg-[#111111] border-[#111111]`
                              : 'bg-white'
                          }`}
                          aria-label={`${slot}${highlighted ? ' — recommended' : ''}`}
                        />
                        <span className="mt-1 text-[8px] leading-none font-mono font-bold text-[#525252]">
                          {slot.replace(' ', '')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Timezone */}
              {pt.timezone && (
                <p className="mb-2 font-mono font-bold text-[10px] text-[#525252] uppercase">
                  {pt.timezone}
                </p>
              )}

              {/* Reasoning toggle */}
              {pt.reasoning && (
                <div>
                  <button
                    type="button"
                    onClick={() => toggleReasoning(idx)}
                    aria-expanded={isExpanded}
                    className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-widest text-[#111111] transition-colors hover:text-[#CC0000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
                  >
                    <svg
                      className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                      strokeLinecap="square"
                      strokeLinejoin="miter"
                      aria-hidden="true"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    Explanation
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isExpanded ? 'mt-3 max-h-40 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="text-sm leading-relaxed font-serif text-[#111111]">
                      {pt.reasoning}
                    </p>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

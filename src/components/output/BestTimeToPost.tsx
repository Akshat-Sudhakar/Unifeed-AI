'use client';

import { useState, useCallback } from 'react';
import type { PostingTime, Platform } from '@/lib/types';

interface BestTimeToPostProps {
  postingTimes: PostingTime[];
}

/** Platform-specific styling configuration — Bitcoin DeFi palette */
const platformStyles: Record<
  Platform,
  { label: string; gradient: string; badge: string; dot: string; icon: string; glow: string }
> = {
  linkedin: {
    label: 'LinkedIn',
    gradient: 'from-[#0A66C2]/10 to-[#0A66C2]/5',
    badge: 'bg-[#0A66C2]/20 text-blue-300 border-[#0A66C2]/30',
    dot: 'bg-blue-400',
    glow: 'shadow-blue-500/20',
    icon: '💼',
  },
  'instagram-post': {
    label: 'Instagram Post',
    gradient: 'from-[#E1306C]/10 to-[#E1306C]/5',
    badge: 'bg-[#E1306C]/20 text-pink-300 border-[#E1306C]/30',
    dot: 'bg-pink-400',
    glow: 'shadow-pink-500/20',
    icon: '📸',
  },
  'instagram-reels': {
    label: 'Instagram Reels',
    gradient: 'from-[#833AB4]/10 to-[#833AB4]/5',
    badge: 'bg-[#833AB4]/20 text-purple-300 border-[#833AB4]/30',
    dot: 'bg-purple-400',
    glow: 'shadow-purple-500/20',
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
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#F7931A]/20 bg-[#F7931A]/10 text-base">
          🕐
        </div>
        <h3 className="font-heading text-base font-semibold text-white">
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
              className={`relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br ${style.gradient} bg-[#0F1115] p-5 transition-all duration-300 hover:border-[#F7931A]/20 hover:shadow-[0_0_20px_-8px_rgba(247,147,26,0.2)]`}
            >
              {/* Decorative clock watermark */}
              <div className="pointer-events-none absolute -right-3 -top-3 text-5xl opacity-[0.05]" aria-hidden="true">
                🕐
              </div>

              {/* Platform badge */}
              <div className="mb-3 flex items-center gap-2">
                <span className="text-base" aria-hidden="true">{style.icon}</span>
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-mono font-semibold ${style.badge}`}>
                  {style.label}
                </span>
              </div>

              {/* Best Days */}
              <div className="mb-3">
                <h4 className="mb-1.5 text-[10px] font-mono uppercase tracking-widest text-[#94A3B8]">
                  Best Days
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {pt.bestDays.map((day) => (
                    <span
                      key={day}
                      className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-0.5 text-xs font-mono text-white/80"
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>

              {/* Best Times */}
              <div className="mb-3">
                <h4 className="mb-1.5 text-[10px] font-mono uppercase tracking-widest text-[#94A3B8]">
                  Best Times
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {pt.bestTimes.map((time) => (
                    <span
                      key={time}
                      className="rounded-md border border-[#F7931A]/20 bg-[#F7931A]/10 px-2 py-0.5 text-xs font-mono font-semibold text-[#F7931A]"
                    >
                      {time}
                    </span>
                  ))}
                </div>
              </div>

              {/* Visual Timeline */}
              <div className="mb-3">
                <h4 className="mb-2 text-[10px] font-mono uppercase tracking-widest text-[#94A3B8]">
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
                          className={`h-2.5 w-full min-w-[18px] rounded-sm transition-colors ${
                            highlighted
                              ? `bg-[#F7931A] shadow-[0_0_6px_1px_rgba(247,147,26,0.5)]`
                              : 'bg-white/[0.06]'
                          }`}
                          aria-label={`${slot}${highlighted ? ' — recommended' : ''}`}
                        />
                        <span className="mt-1 text-[8px] leading-none text-[#94A3B8]/60">
                          {slot.replace(' ', '')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Timezone */}
              {pt.timezone && (
                <p className="mb-2 font-mono text-[10px] text-[#94A3B8]/60">
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
                    className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-[#F7931A]/70 transition-colors hover:text-[#F7931A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7931A]/60 rounded"
                  >
                    <svg
                      className={`h-3 w-3 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    Why?
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isExpanded ? 'mt-2 max-h-40 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="text-xs leading-relaxed text-[#94A3B8]">
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

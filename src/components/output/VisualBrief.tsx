'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { VisualBrief as VisualBriefType } from '@/lib/types';

interface VisualBriefProps {
  brief: VisualBriefType;
}

export default function VisualBrief({ brief }: VisualBriefProps) {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [brief]);

  const toggle = useCallback(() => {
    if (!isOpen && contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
    setIsOpen((prev) => !prev);
  }, [isOpen]);

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-[#F7931A]/15 bg-[#F7931A]/5">
      {/* Header / Toggle */}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls="visual-brief-content"
        className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left transition-colors hover:bg-[#F7931A]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7931A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030304]"
      >
        <span className="flex items-center gap-2.5 text-sm font-semibold text-white">
          {/* Eye icon */}
          <svg
            className="h-4 w-4 text-[#F7931A]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx={12} cy={12} r={3} />
          </svg>
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#F7931A]">
            Visual Brief
          </span>
        </span>

        {/* Chevron */}
        <svg
          className={`h-4 w-4 text-[#F7931A]/60 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Collapsible Content */}
      <div
        id="visual-brief-content"
        role="region"
        aria-label="Visual brief details"
        style={{ maxHeight: isOpen ? `${contentHeight}px` : '0px' }}
        className="overflow-hidden transition-[max-height] duration-400 ease-in-out"
      >
        <div ref={contentRef} className="space-y-5 border-t border-[#F7931A]/10 px-5 pb-5 pt-4">
          {/* Description */}
          <div>
            <h4 className="mb-1.5 text-[10px] font-mono uppercase tracking-widest text-[#94A3B8]">
              Description
            </h4>
            <p className="text-sm leading-relaxed text-white/80">
              {brief.description}
            </p>
          </div>

          {/* Color Palette */}
          {brief.colorPalette.length > 0 && (
            <div>
              <h4 className="mb-2.5 text-[10px] font-mono uppercase tracking-widest text-[#94A3B8]">
                Color Palette
              </h4>
              <div className="flex flex-wrap gap-3">
                {brief.colorPalette.map((color) => (
                  <div key={color} className="flex flex-col items-center gap-1.5">
                    <div
                      className="h-9 w-9 rounded-full border-2 border-white/20 shadow-lg"
                      style={{ backgroundColor: color }}
                      title={color}
                      aria-label={`Color swatch: ${color}`}
                    />
                    <span className="font-mono text-[10px] text-[#94A3B8]">
                      {color}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Composition */}
          {brief.composition && (
            <div>
              <h4 className="mb-1.5 text-[10px] font-mono uppercase tracking-widest text-[#94A3B8]">
                Composition
              </h4>
              <p className="text-sm leading-relaxed text-white/80">
                {brief.composition}
              </p>
            </div>
          )}

          {/* Style */}
          {brief.style && (
            <div>
              <h4 className="mb-1.5 text-[10px] font-mono uppercase tracking-widest text-[#94A3B8]">
                Style
              </h4>
              <p className="text-sm leading-relaxed text-white/80">
                {brief.style}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

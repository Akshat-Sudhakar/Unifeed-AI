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
    <div className="mt-8 overflow-hidden border border-[#111111] bg-[#F9F9F7] sharp-corners">
      {/* Header / Toggle */}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls="visual-brief-content"
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-[#E5E5E0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2 focus-visible:ring-offset-white border-b border-[#111111]"
      >
        <span className="flex items-center gap-3 text-sm font-bold text-[#111111]">
          {/* Eye icon */}
          <svg
            className="h-5 w-5 text-[#111111]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="square"
            strokeLinejoin="miter"
            aria-hidden="true"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx={12} cy={12} r={3} />
          </svg>
          <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#111111]">
            Visual Brief
          </span>
        </span>

        {/* Chevron */}
        <svg
          className={`h-5 w-5 text-[#111111] transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="square"
          strokeLinejoin="miter"
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
        <div ref={contentRef} className="space-y-6 px-5 pb-6 pt-5">
          {/* Description */}
          <div>
            <h4 className="mb-2 text-[10px] font-mono font-bold uppercase tracking-widest text-[#111111]">
              Description
            </h4>
            <p className="text-base leading-relaxed font-serif text-[#111111]">
              {brief.description}
            </p>
          </div>

          {/* Color Palette */}
          {brief.colorPalette.length > 0 && (
            <div>
              <h4 className="mb-3 text-[10px] font-mono font-bold uppercase tracking-widest text-[#111111]">
                Color Palette
              </h4>
              <div className="flex flex-wrap gap-4">
                {brief.colorPalette.map((color) => (
                  <div key={color} className="flex flex-col items-center gap-2">
                    <div
                      className="h-10 w-10 border-2 border-[#111111] sharp-corners"
                      style={{ backgroundColor: color }}
                      title={color}
                      aria-label={`Color swatch: ${color}`}
                    />
                    <span className="font-mono text-[10px] font-bold uppercase text-[#525252]">
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
              <h4 className="mb-2 text-[10px] font-mono font-bold uppercase tracking-widest text-[#111111]">
                Composition
              </h4>
              <p className="text-base leading-relaxed font-serif text-[#111111]">
                {brief.composition}
              </p>
            </div>
          )}

          {/* Style */}
          {brief.style && (
            <div>
              <h4 className="mb-2 text-[10px] font-mono font-bold uppercase tracking-widest text-[#111111]">
                Style
              </h4>
              <p className="text-base leading-relaxed font-serif text-[#111111]">
                {brief.style}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

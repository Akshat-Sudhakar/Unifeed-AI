'use client';

import { useState } from 'react';
import type { Segment, Platform, Tone, Language, GenerateRequest } from '@/lib/types';
import { SEGMENTS, PLATFORMS, TONES, LANGUAGES } from '@/lib/constants';

interface InputPanelProps {
  onGenerate: (request: GenerateRequest) => void;
  isLoading: boolean;
}

// ── Small reusable section label with bottom border ──────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 flex justify-center items-end border-b-2 border-[#111111] pb-1 text-center text-xs font-mono font-bold uppercase tracking-widest text-[#111111]">
      {children}
    </div>
  );
}

import { CheckIcon } from '@/components/icons';

function CheckBadge() {
  return (
    <div
      className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center bg-[#CC0000] sharp-corners border border-[#111111] text-white"
    >
      <CheckIcon size={12} strokeWidth={4} />
    </div>
  );
}

export default function InputPanel({ onGenerate, isLoading }: InputPanelProps) {
  const [segment, setSegment] = useState<Segment>('corporate');
  const [platforms, setPlatforms] = useState<Platform[]>(['linkedin']);
  const [tone, setTone] = useState<Tone>('professional');
  const [language, setLanguage] = useState<Language>('english');

  const togglePlatform = (p: Platform) =>
    setPlatforms((prev) =>
      prev.includes(p) ? (prev.length > 1 ? prev.filter((x) => x !== p) : prev) : [...prev, p]
    );

  const handleSubmit = () => {
    if (platforms.length === 0) return;
    onGenerate({ segment, platforms, tone, language, usps: [] });
  };

  return (
    /* Outer flex column — fills the sticky card height */
    <div className="flex flex-col h-full">

      {/* ── Scrollable content area ──────────────────────────── */}
      <div className="panel-scroll flex-1 overflow-y-auto px-6 pt-6" style={{ paddingRight: '24px' }}>
        <div className="flex flex-col gap-6 pb-3">

          {/* Header */}
          <div className="border-b-4 border-[#111111] pb-4 mb-2 text-center">
            <h2 className="font-heading text-4xl font-black text-[#111111] uppercase tracking-tighter">Idea Generator</h2>
            <p className="mt-1 font-mono text-xs uppercase tracking-widest text-[#525252]">Pick your parameters and get 4–5 content ideas.</p>
          </div>

          {/* ── Target Segment ─────────────────────────────── */}
          <div>
            <SectionLabel>Target Segment</SectionLabel>
            <div className="grid grid-cols-2 gap-[12px]" role="radiogroup" aria-label="Target segment">
              {SEGMENTS.map((seg) => {
                const selected = segment === seg.id;
                return (
                  <label
                    key={seg.id}
                    className="relative flex flex-col items-center justify-center text-center gap-1.5 p-4 transition-all duration-200 sharp-corners min-h-[5rem] cursor-pointer focus-within:ring-2 focus-within:ring-[#111111]"
                    style={{
                      background: selected ? '#111111' : 'transparent',
                      border: selected ? '2px solid #CC0000' : '2px solid #D1D1D1',
                    }}
                  >
                    <input
                      type="radio"
                      name="segment"
                      value={seg.id}
                      checked={selected}
                      onChange={() => setSegment(seg.id)}
                      className="sr-only"
                    />
                    {selected && <CheckBadge />}
                    <span className="text-xl">{seg.icon}</span>
                    <span className={`text-sm font-bold ${selected ? 'text-white' : 'text-[#111111]'}`}>{seg.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* ── Content Platforms ───────────────────────────── */}
          <div>
            <SectionLabel>Content Platforms</SectionLabel>
            <div className="grid grid-cols-3 gap-[12px]" role="group" aria-label="Content platforms">
              {PLATFORMS.map((p) => {
                const selected = platforms.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className="relative flex flex-col items-center gap-1.5 py-4 text-center transition-all duration-200 sharp-corners cursor-pointer focus-within:ring-2 focus-within:ring-[#111111]"
                    style={{
                      background: selected ? '#111111' : 'transparent',
                      border: selected ? '2px solid #CC0000' : '2px solid #D1D1D1',
                    }}
                  >
                    <input
                      type="checkbox"
                      name="platforms"
                      value={p.id}
                      checked={selected}
                      onChange={() => togglePlatform(p.id)}
                      className="sr-only"
                    />
                    {selected && <CheckBadge />}
                    <span className="text-xl">{p.icon}</span>
                    <span className={`text-[11px] font-mono font-bold leading-tight ${selected ? 'text-white' : 'text-[#111111]'}`}>{p.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* ── Content Tone ─────────────────────────────────── */}
          <div>
            <SectionLabel>Content Tone</SectionLabel>
            <div className="grid grid-cols-2 gap-[12px]" role="radiogroup" aria-label="Content tone">
              {TONES.map((t) => {
                const selected = tone === t.id;
                return (
                  <label
                    key={t.id}
                    className="relative flex flex-col items-center text-center gap-2.5 p-4 transition-all duration-200 h-full sharp-corners cursor-pointer focus-within:ring-2 focus-within:ring-[#111111]"
                    style={{
                      background: selected ? '#111111' : 'transparent',
                      border: selected ? '2px solid #CC0000' : '2px solid #D1D1D1',
                    }}
                  >
                    <input
                      type="radio"
                      name="tone"
                      value={t.id}
                      checked={selected}
                      onChange={() => setTone(t.id)}
                      className="sr-only"
                    />
                    {selected && <CheckBadge />}
                    <span className="mt-0.5 text-lg shrink-0">{t.icon}</span>
                    <div className="min-w-0">
                      <span className={`block text-sm font-bold ${selected ? 'text-white' : 'text-[#111111]'}`}>{t.label}</span>
                      <span className={`mt-0.5 block text-[11px] font-serif leading-snug line-clamp-2 ${selected ? 'text-[#E5E5E0]' : 'text-[#525252]'}`}>
                        {t.description}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* ── Language Toggle ──────────────────────────────── */}
          <div>
            <SectionLabel>Content Language</SectionLabel>
            <div className="flex flex-wrap gap-[12px]" role="radiogroup" aria-label="Content language">
              {LANGUAGES.map((lang) => {
                const selected = language === lang.id;
                return (
                  <label
                    key={lang.id}
                    className="flex justify-center flex-1 items-center gap-1.5 px-3.5 py-2.5 text-sm font-mono font-bold cursor-pointer focus-within:ring-2 focus-within:ring-[#111111]"
                    style={{
                      background: selected ? '#111111' : 'transparent',
                      color: selected ? '#FFFFFF' : '#111111',
                      border: selected ? '2px solid #CC0000' : '2px solid #D1D1D1',
                    }}
                  >
                    <input
                      type="radio"
                      name="language"
                      value={lang.id}
                      checked={selected}
                      onChange={() => setLanguage(lang.id)}
                      className="sr-only"
                    />
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </label>
                );
              })}
            </div>
          </div>


        </div>{/* end gap-6 flex-col */}
      </div>{/* end scrollable area */}

      {/* ── Sticky Generate Button ────────────────────────── */}
      <div className="border-t-4 border-[#111111] px-6 py-4 bg-[#F9F9F7] z-10">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          id="generate-ideas-btn"
          aria-label="Generate content ideas"
          className="w-full py-5 text-lg font-black bg-[#111111] text-white uppercase tracking-tighter hover:bg-[#CC0000] disabled:bg-[#A3A3A3] disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-pulse">GENERATING IDEAS...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Generate Ideas
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

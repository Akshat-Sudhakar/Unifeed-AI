'use client';

import { useState } from 'react';
import type { Segment, Platform, Tone, USP, Language, GenerateRequest } from '@/lib/types';
import { SEGMENTS, PLATFORMS, TONES, USPS, SUGGESTED_TOPICS, LANGUAGES } from '@/lib/constants';

interface InputPanelProps {
  onGenerate: (request: GenerateRequest) => void;
  isLoading: boolean;
}

// ── Small reusable section label with left orange bar ──────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mb-3 flex items-center pl-3 text-[11px] font-mono uppercase tracking-widest text-[#94A3B8]"
      style={{ borderLeft: '3px solid #F7931A' }}
    >
      {children}
    </div>
  );
}

// ── Small checkmark icon ───────────────────────────────────────────
function CheckBadge() {
  return (
    <div
      className="absolute -right-1.5 -top-1.5 z-10 flex h-4 w-4 items-center justify-center rounded-full"
      style={{ background: '#F7931A' }}
    >
      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
  );
}

export default function InputPanel({ onGenerate, isLoading }: InputPanelProps) {
  const [segment, setSegment] = useState<Segment>('corporate');
  const [topic, setTopic] = useState('');
  const [platforms, setPlatforms] = useState<Platform[]>(['linkedin']);
  const [tone, setTone] = useState<Tone>('professional');
  const [usps, setUsps] = useState<USP[]>([]);
  const [language, setLanguage] = useState<Language>('english');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const togglePlatform = (p: Platform) =>
    setPlatforms((prev) =>
      prev.includes(p) ? (prev.length > 1 ? prev.filter((x) => x !== p) : prev) : [...prev, p]
    );

  const toggleUsp = (u: USP) =>
    setUsps((prev) => (prev.includes(u) ? prev.filter((x) => x !== u) : [...prev, u]));

  const handleSubmit = () => {
    if (!topic.trim() || platforms.length === 0) return;
    onGenerate({ segment, topic: topic.trim(), platforms, tone, usps, language });
  };

  const isValid = topic.trim().length >= 3 && platforms.length > 0;

  return (
    /* Outer flex column — fills the sticky card height */
    <div className="flex flex-col h-full">

      {/* ── Scrollable content area ──────────────────────────── */}
      <div className="panel-scroll flex-1 overflow-y-auto pr-1" style={{ paddingRight: '4px' }}>
        <div className="flex flex-col gap-6 pb-2">

          {/* Header */}
          <div>
            <h2 className="font-heading text-lg font-semibold text-white">Content Blueprint</h2>
            <p className="mt-1 font-mono text-[11px] text-[#94A3B8]/70">Configure your content parameters</p>
          </div>

          {/* ── Target Segment ─────────────────────────────── */}
          <div>
            <SectionLabel>Target Segment</SectionLabel>
            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Target segment">
              {SEGMENTS.map((seg) => {
                const selected = segment === seg.id;
                return (
                  <button
                    key={seg.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setSegment(seg.id)}
                    className="relative flex flex-col items-start gap-1.5 rounded-xl p-3.5 text-left transition-all duration-200"
                    style={{
                      border: selected ? '2px solid #F7931A' : '1px solid #334155',
                      background: selected ? 'rgba(247,147,26,0.1)' : 'transparent',
                    }}
                  >
                    {selected && <CheckBadge />}
                    <span className="text-xl">{seg.icon}</span>
                    <span className="text-sm font-semibold text-white">{seg.label}</span>
                    <span className="text-[11px] leading-snug text-[#94A3B8]">{seg.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Core Topic ──────────────────────────────────── */}
          <div className="relative">
            <SectionLabel>
              <label htmlFor="topic-input">Core Topic</label>
            </SectionLabel>
            <input
              id="topic-input"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="e.g., Summer Uniform Switch"
              autoComplete="off"
              className="w-full rounded-none border-b-2 bg-transparent px-0 py-2.5 text-sm text-white placeholder-white/25 outline-none transition-colors duration-200 font-body"
              style={{
                borderBottom: topic.length >= 3
                  ? '2px solid #F7931A'
                  : showSuggestions
                    ? '2px solid rgba(247,147,26,0.5)'
                    : '2px solid rgba(255,255,255,0.15)',
              }}
              aria-describedby="topic-hint"
            />
            <span id="topic-hint" className="sr-only">Enter a topic, minimum 3 characters</span>

            {/* Suggestions dropdown */}
            {showSuggestions && (
              <div
                className="absolute left-0 right-0 top-full z-20 mt-1 max-h-44 overflow-y-auto rounded-xl border border-white/10 animate-slide-down"
                style={{ background: '#0F1115', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.8)' }}
              >
                {SUGGESTED_TOPICS.filter((t) => t.toLowerCase().includes(topic.toLowerCase())).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={() => { setTopic(s); setShowSuggestions(false); }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[#94A3B8] transition-colors hover:bg-[#F7931A]/5 hover:text-white"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 opacity-50"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Content Platforms ───────────────────────────── */}
          <div>
            <SectionLabel>Content Platforms</SectionLabel>
            <div className="grid grid-cols-3 gap-2" role="group" aria-label="Content platforms">
              {PLATFORMS.map((p) => {
                const selected = platforms.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="checkbox"
                    aria-checked={selected}
                    aria-label={p.label}
                    onClick={() => togglePlatform(p.id)}
                    className="relative flex flex-col items-center gap-1.5 rounded-xl py-3.5 text-center transition-all duration-200"
                    style={{
                      border: selected ? '2px solid #F7931A' : '1px solid #334155',
                      background: selected ? 'rgba(247,147,26,0.1)' : 'transparent',
                    }}
                  >
                    {selected && <CheckBadge />}
                    <span className="text-xl">{p.icon}</span>
                    <span className="text-[11px] font-mono text-white leading-tight">{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Content Tone ─────────────────────────────────── */}
          <div>
            <SectionLabel>Content Tone</SectionLabel>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Content tone">
              {TONES.map((t) => {
                const selected = tone === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setTone(t.id)}
                    className="relative flex items-start gap-2.5 rounded-xl p-3.5 text-left transition-all duration-200 h-full"
                    style={{
                      border: selected ? '2px solid #F7931A' : '1px solid #334155',
                      background: selected ? 'rgba(247,147,26,0.1)' : 'transparent',
                    }}
                  >
                    {selected && <CheckBadge />}
                    <span className="mt-0.5 text-lg shrink-0">{t.icon}</span>
                    <div className="min-w-0">
                      <span className="block text-sm font-semibold text-white">{t.label}</span>
                      <span className="mt-0.5 block text-[11px] leading-snug text-[#94A3B8] line-clamp-2">
                        {t.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Key USPs ─────────────────────────────────────── */}
          <div>
            <SectionLabel>
              Key USPs to Highlight
              <span className="ml-1.5 text-[10px] normal-case tracking-normal text-[#94A3B8]/50">(optional)</span>
            </SectionLabel>
            <div className="flex flex-col gap-2" role="group" aria-label="Key USPs">
              {USPS.map((u) => {
                const checked = usps.includes(u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() => toggleUsp(u.id)}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200 border ${checked ? 'border-[#F7931A]/30 bg-[#F7931A]/5' : 'border-white/10 bg-transparent hover:border-white/30'}`}
                  >
                    {/* Custom checkbox square */}
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-all duration-200 border-2 ${checked ? 'border-[#F7931A] bg-[#F7931A]' : 'border-white/20 bg-black/40 group-hover:border-[#F7931A]/50'}`}
                    >
                      {checked && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span
                      className="text-sm font-mono transition-colors duration-200"
                      style={{ color: checked ? 'rgba(255,255,255,0.9)' : '#94A3B8' }}
                    >
                      {u.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Language Toggle ──────────────────────────────── */}
          <div>
            <SectionLabel>Content Language</SectionLabel>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Content language">
              {LANGUAGES.map((lang) => {
                const selected = language === lang.id;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setLanguage(lang.id)}
                    className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-mono transition-all duration-200"
                    style={{
                      border: selected ? '1px solid rgba(247,147,26,0.4)' : '1px solid rgba(255,255,255,0.08)',
                      background: selected ? 'rgba(247,147,26,0.1)' : 'transparent',
                      color: selected ? '#F7931A' : '#94A3B8',
                    }}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>{/* end gap-6 flex-col */}
      </div>{/* end scrollable area */}

      {/* ── Sticky Generate Button ────────────────────────── */}
      <div className="mt-4 border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        {!isValid && topic.length > 0 && topic.length < 3 && (
          <p className="mb-2 text-[11px] font-mono" style={{ color: 'rgba(247,147,26,0.7)' }} role="alert">
            Topic must be at least 3 characters
          </p>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid || isLoading}
          aria-label="Generate content blueprint"
          className="group relative w-full overflow-hidden rounded-xl px-6 py-4 text-sm font-bold uppercase tracking-wider text-white transition-all duration-300 hover:animate-glow-pulse"
          style={
            isValid && !isLoading
              ? {
                  background: 'linear-gradient(to right, #EA580C, #F7931A)',
                  boxShadow: '0 0 20px -5px rgba(234,88,12,0.5)',
                }
              : {
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.2)',
                  cursor: 'not-allowed',
                }
          }
          onMouseEnter={(e) => {
            if (isValid && !isLoading) {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px -5px rgba(247,147,26,0.7)';
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)';
            }
          }}
          onMouseLeave={(e) => {
            if (isValid && !isLoading) {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px -5px rgba(234,88,12,0.5)';
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
            }
          }}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
              </svg>
              Generating Blueprint…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              Generate Content Blueprint
            </span>
          )}
          {/* Shimmer sweep */}
          {isValid && !isLoading && (
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          )}
        </button>
      </div>
    </div>
  );
}

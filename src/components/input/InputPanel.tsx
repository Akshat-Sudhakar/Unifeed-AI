'use client';

import { useState } from 'react';
import type { Segment, Platform, Tone, USP, Language, GenerateRequest } from '@/lib/types';
import { SEGMENTS, PLATFORMS, TONES, USPS, SUGGESTED_TOPICS, LANGUAGES } from '@/lib/constants';

interface InputPanelProps {
  onGenerate: (request: GenerateRequest) => void;
  isLoading: boolean;
}

// ── Small reusable section label with bottom border ──────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex justify-between items-end border-b-2 border-[#111111] pb-1 text-left text-xs font-mono font-bold uppercase tracking-widest text-[#111111]">
      {children}
    </div>
  );
}

// ── Small checkmark icon ───────────────────────────────────────────
function CheckBadge() {
  return (
    <div
      className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center bg-[#CC0000] sharp-corners border border-[#111111]"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true">
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
      <div className="panel-scroll flex-1 overflow-y-auto px-6 pt-6" style={{ paddingRight: '24px' }}>
        <div className="flex flex-col gap-6 pb-8">

          {/* Header */}
          <div className="border-b-4 border-[#111111] pb-4 mb-2 text-center">
            <h2 className="font-heading text-4xl font-black text-[#111111] uppercase tracking-tighter">Content Blueprint</h2>
            <p className="mt-1 font-mono text-xs uppercase tracking-widest text-[#525252]">Configure your parameters.</p>
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
                    className="relative flex flex-col items-center justify-center text-center gap-1.5 p-3.5 transition-all duration-200 sharp-corners border border-[#111111] min-h-[5rem]"
                    style={{
                      background: selected ? '#111111' : 'transparent',
                      boxShadow: selected ? '4px 4px 0px 0px #CC0000' : 'none',
                      transform: selected ? 'translate(-2px, -2px)' : 'none',
                    }}
                  >
                    {selected && <CheckBadge />}
                    <span className="text-xl">{seg.icon}</span>
                    <span className={`text-sm font-bold ${selected ? 'text-white' : 'text-[#111111]'}`}>{seg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Context / Situation ──────────────────────────────────── */}
          <div className="relative">
            <SectionLabel>
              <label htmlFor="topic-input">Describe Your Situation</label>
            </SectionLabel>
            <textarea
              id="topic-input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., We are a school in Delhi looking to switch to summer uniforms for 500 students next month…"
              rows={4}
              className="w-full text-left sharp-corners border-2 bg-white px-3 py-3 text-base font-serif text-[#111111] placeholder-[#737373] outline-none transition-colors duration-200 resize-none"
              style={{
                borderColor: topic.length >= 3 ? '#111111' : '#A3A3A3',
              }}
              aria-describedby="topic-hint"
            />
            <span id="topic-hint" className="sr-only">Enter your context, minimum 3 characters</span>
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
                    className="relative flex flex-col items-center gap-1.5 py-3.5 text-center transition-all duration-200 sharp-corners border border-[#111111]"
                    style={{
                      background: selected ? '#111111' : 'transparent',
                      boxShadow: selected ? '4px 4px 0px 0px #CC0000' : 'none',
                      transform: selected ? 'translate(-2px, -2px)' : 'none',
                    }}
                  >
                    {selected && <CheckBadge />}
                    <span className="text-xl">{p.icon}</span>
                    <span className={`text-[11px] font-mono font-bold leading-tight ${selected ? 'text-white' : 'text-[#111111]'}`}>{p.label}</span>
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
                    className="relative flex flex-col items-center text-center gap-2.5 p-3.5 transition-all duration-200 h-full sharp-corners border border-[#111111]"
                    style={{
                      background: selected ? '#111111' : 'transparent',
                      boxShadow: selected ? '4px 4px 0px 0px #CC0000' : 'none',
                      transform: selected ? 'translate(-2px, -2px)' : 'none',
                    }}
                  >
                    {selected && <CheckBadge />}
                    <span className="mt-0.5 text-lg shrink-0">{t.icon}</span>
                    <div className="min-w-0">
                      <span className={`block text-sm font-bold ${selected ? 'text-white' : 'text-[#111111]'}`}>{t.label}</span>
                      <span className={`mt-0.5 block text-[11px] font-serif leading-snug line-clamp-2 ${selected ? 'text-[#E5E5E0]' : 'text-[#525252]'}`}>
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
              <span className="ml-1.5 text-[10px] normal-case tracking-normal text-[#737373]">(optional)</span>
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
                    className={`group flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-200 border border-[#111111] sharp-corners ${checked ? 'bg-[#111111]' : 'bg-transparent hover:bg-[#E5E5E0]'}`}
                  >
                    {/* Custom checkbox square */}
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center transition-all duration-200 border-2 border-[#111111] sharp-corners ${checked ? 'bg-[#CC0000] border-[#CC0000]' : 'bg-white'}`}
                    >
                      {checked && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span
                      className="text-sm font-mono font-bold transition-colors duration-200"
                      style={{ color: checked ? '#F9F9F7' : '#111111' }}
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
                    className="flex justify-center flex-1 items-center gap-1.5 px-3.5 py-2 text-sm font-mono font-bold border border-[#111111]"
                    style={{
                      background: selected ? '#111111' : 'transparent',
                      color: selected ? '#FFFFFF' : '#111111',
                    }}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Spacer to separate scrollable content from the sticky bottom button */}
          <div className="h-12 shrink-0" aria-hidden="true" />

        </div>{/* end gap-6 flex-col */}
      </div>{/* end scrollable area */}

      {/* ── Sticky Generate Button ────────────────────────── */}
      <div className="border-t-4 border-[#111111] p-6 bg-[#F9F9F7] z-10">
        {!isValid && topic.length > 0 && topic.length < 3 && (
          <p className="mb-2 text-[11px] font-mono font-bold text-[#CC0000] uppercase" role="alert">
            Topic must be at least 3 characters
          </p>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid || isLoading}
          aria-label="Generate content blueprint"
          className="w-full py-5 text-lg font-black bg-[#111111] text-white uppercase tracking-tighter hover:bg-[#CC0000] disabled:bg-[#A3A3A3] disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-pulse">TYPESETTING...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              PRINT CONTENT BLUEPRINT
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

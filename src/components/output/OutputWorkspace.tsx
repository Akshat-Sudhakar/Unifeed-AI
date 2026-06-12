'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type KeyboardEvent,
} from 'react';
import type { ContentIdea, GenerateRequest, PostingTime, Platform } from '@/lib/types';
import ContentCard from './ContentCard';
import BestTimeToPost from './BestTimeToPost';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface OutputWorkspaceProps {
  ideas: ContentIdea[];
  postingTimes: PostingTime[];
  request: GenerateRequest | null;
  onSaveToSwipeFile: (idea: ContentIdea) => void;
  isIdeaSaved: (body: string) => boolean;
}

/* ------------------------------------------------------------------ */
/*  Platform metadata                                                  */
/* ------------------------------------------------------------------ */

interface TabMeta {
  platform: Platform;
  label: string;
  icon: string;
}

const platformMeta: Record<Platform, TabMeta> = {
  linkedin: { platform: 'linkedin', label: 'LinkedIn', icon: '💼' },
  'instagram-post': {
    platform: 'instagram-post',
    label: 'Instagram Post',
    icon: '📸',
  },
  'instagram-reels': {
    platform: 'instagram-reels',
    label: 'Reels',
    icon: '🎬',
  },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function OutputWorkspace({
  ideas,
  postingTimes,
  request,
  onSaveToSwipeFile,
  isIdeaSaved,
}: OutputWorkspaceProps) {
  /* ── derive available tabs from ideas ─────────────────────────── */
  const tabs = useMemo<TabMeta[]>(() => {
    const seen = new Set<Platform>();
    const result: TabMeta[] = [];
    for (const idea of ideas) {
      if (!seen.has(idea.platform)) {
        seen.add(idea.platform);
        const meta = platformMeta[idea.platform];
        if (meta) result.push(meta);
      }
    }
    return result;
  }, [ideas]);

  const [activeTab, setActiveTab] = useState<Platform | null>(null);

  /* Reset active tab when tabs change */
  useEffect(() => {
    if (tabs.length > 0) {
      setActiveTab((prev) => {
        if (prev && tabs.some((t) => t.platform === prev)) return prev;
        return tabs[0].platform;
      });
    } else {
      setActiveTab(null);
    }
  }, [tabs]);

  /* ── animated underline ───────────────────────────────────────── */
  const tabRefs = useRef<Map<Platform, HTMLButtonElement>>(new Map());
  const tablistRef = useRef<HTMLDivElement>(null);
  const [underline, setUnderline] = useState({ left: 0, width: 0 });

  const measureUnderline = useCallback(() => {
    if (!activeTab) return;
    const btn = tabRefs.current.get(activeTab);
    const container = tablistRef.current;
    if (btn && container) {
      const containerRect = container.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      setUnderline({
        left: btnRect.left - containerRect.left,
        width: btnRect.width,
      });
    }
  }, [activeTab]);

  useEffect(() => {
    measureUnderline();
    window.addEventListener('resize', measureUnderline);
    return () => window.removeEventListener('resize', measureUnderline);
  }, [measureUnderline]);

  /* ── keyboard navigation ──────────────────────────────────────── */
  const handleTabKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      if (tabs.length === 0) return;
      const idx = tabs.findIndex((t) => t.platform === activeTab);
      let next = idx;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        next = (idx + 1) % tabs.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        next = (idx - 1 + tabs.length) % tabs.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        next = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        next = tabs.length - 1;
      } else {
        return;
      }

      const nextPlatform = tabs[next].platform;
      setActiveTab(nextPlatform);
      tabRefs.current.get(nextPlatform)?.focus();
    },
    [tabs, activeTab],
  );

  /* ── find the idea for the active tab ─────────────────────────── */
  const activeIdea = useMemo(
    () => ideas.find((i) => i.platform === activeTab) ?? null,
    [ideas, activeTab],
  );

  /* ── empty state ──────────────────────────────────────────────── */
  if (ideas.length === 0) {
    return (
      <section
        aria-label="Output workspace"
        className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-white/[0.07] bg-[#0F1115] p-10 text-center"
      >
        {/* Illustration-like decorative element */}
        <div className="relative mb-6">
          <div className="absolute -inset-4 rounded-full bg-[#F7931A]/5 blur-xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-[#F7931A]/15 bg-[#F7931A]/8 text-4xl">
            ✨
          </div>
        </div>

        <h3 className="mb-2 text-lg font-heading font-semibold text-white">
          Your content will appear here
        </h3>
        <p className="max-w-sm text-sm leading-relaxed text-[#94A3B8]">
          Fill in the form on the left and hit{' '}
          <span className="font-semibold text-[#F7931A]">Generate</span> to create
          platform-optimized content ideas powered by AI.
        </p>

        {/* Decorative dots */}
        <div className="mt-8 flex gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-[#F7931A]/30"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </section>
    );
  }

  /* ── main render ──────────────────────────────────────────────── */
  return (
    <section aria-label="Output workspace" className="space-y-6">
      {/* ── Tab Bar ──────────────────────────────────────────── */}
      <div className="relative rounded-xl border border-white/10 bg-[#0F1115] overflow-hidden">
        <div
          ref={tablistRef}
          role="tablist"
          aria-label="Content platforms"
          className="relative flex"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.platform;
            return (
              <button
                key={tab.platform}
                ref={(el) => {
                  if (el) tabRefs.current.set(tab.platform, el);
                }}
                role="tab"
                id={`tab-${tab.platform}`}
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.platform}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTab(tab.platform)}
                onKeyDown={handleTabKeyDown}
                className={`relative z-10 flex items-center gap-2 px-5 py-4 text-sm font-mono font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F7931A]/60 ${
                  isActive
                    ? 'text-[#F7931A]'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                <span aria-hidden="true">{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}

          {/* Animated underline */}
          <span
            className="absolute bottom-0 h-0.5 rounded-full bg-gradient-to-r from-[#EA580C] to-[#F7931A] shadow-[0_0_8px_2px_rgba(247,147,26,0.5)] transition-all duration-300 ease-out"
            style={{ left: underline.left, width: underline.width }}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* ── Tab Panels ───────────────────────────────────────── */}
      {tabs.map((tab) => {
        const isActive = activeTab === tab.platform;
        const idea = ideas.find((i) => i.platform === tab.platform);
        if (!idea) return null;

        return (
          <div
            key={tab.platform}
            role="tabpanel"
            id={`tabpanel-${tab.platform}`}
            aria-labelledby={`tab-${tab.platform}`}
            hidden={!isActive}
            tabIndex={0}
            className={`transition-opacity duration-300 focus-visible:outline-none ${
              isActive ? 'animate-fade-in opacity-100' : 'opacity-0'
            }`}
          >
            {isActive && (
              <ContentCard
                idea={idea}
                onSave={onSaveToSwipeFile}
                isSaved={isIdeaSaved(idea.body)}
              />
            )}
          </div>
        );
      })}

      {/* ── Best Time to Post ────────────────────────────────── */}
      <BestTimeToPost postingTimes={postingTimes} />
    </section>
  );
}

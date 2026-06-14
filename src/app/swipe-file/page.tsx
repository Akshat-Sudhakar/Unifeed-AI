// ============================================================
// UniFeed AI — Swipe File Page
// ============================================================
// Dedicated page for browsing, filtering, and managing saved
// content ideas (swipe file entries).
// ============================================================

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { useSwipeFile } from '@/hooks/useSwipeFile';
import { PLATFORMS, SEGMENTS, TONES } from '@/lib/constants';
import type { Platform, Segment, Tone, SwipeFileEntry } from '@/lib/types';

// ── Platform color map ─────────────────────────────────────────
const PLATFORM_COLORS: Record<Platform, string> = {
  linkedin: '#0A66C2',
  'instagram-post': '#E1306C',
  'instagram-reels': '#833AB4',
};

const PLATFORM_LABELS: Record<Platform, string> = {
  linkedin: 'LinkedIn',
  'instagram-post': 'IG Post',
  'instagram-reels': 'IG Reels',
};

// ── Relative time helper ───────────────────────────────────────
function getRelativeTime(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

// ── Tone badge helper ──────────────────────────────────────────
const TONE_ICONS: Record<Tone, string> = {
  professional: '👔',
  bold: '🔥',
  humorous: '😄',
  urgent: '⚡',
  storytelling: '📖',
};

// ================================================================
// SwipeFilePage Component
// ================================================================
export default function SwipeFilePage() {
  const {
    entries,
    removeEntry,
    removeMultiple,
    exportEntries,
  } = useSwipeFile();

  // ── View state ───────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // ── Filters ──────────────────────────────────────────────────
  const [platformFilter, setPlatformFilter] = useState<'all' | Platform>('all');
  const [segmentFilter, setSegmentFilter] = useState<'all' | Segment>('all');
  const [toneFilter, setToneFilter] = useState<'all' | Tone>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // ── Selection state ──────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // ── Filtered entries ─────────────────────────────────────────
  const filteredEntries = useMemo(() => {
    let result = entries;

    if (platformFilter !== 'all') {
      result = result.filter((e) => e.idea.platform === platformFilter);
    }
    if (segmentFilter !== 'all') {
      result = result.filter((e) => e.segment === segmentFilter);
    }
    if (toneFilter !== 'all') {
      result = result.filter((e) => e.tone === toneFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.idea.body.toLowerCase().includes(q) ||
          e.topic.toLowerCase().includes(q) ||
          e.idea.hooks.some((h) => h.text.toLowerCase().includes(q)) ||
          e.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [entries, platformFilter, segmentFilter, toneFilter, searchQuery]);

  // ── Selection helpers ────────────────────────────────────────
  const isAllSelected =
    filteredEntries.length > 0 &&
    filteredEntries.every((e) => selectedIds.has(e.id));

  const toggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredEntries.map((e) => e.id)));
    }
  }, [isAllSelected, filteredEntries]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // ── Bulk actions ─────────────────────────────────────────────
  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    removeMultiple(Array.from(selectedIds));
    setSelectedIds(new Set());
  }, [selectedIds, removeMultiple]);

  const handleExportSelected = useCallback(async () => {
    if (selectedIds.size === 0) return;
    try {
      await exportEntries(Array.from(selectedIds));
    } catch {
      // exportEntries already logs errors
    }
  }, [selectedIds, exportEntries]);

  // ── Copy to clipboard ───────────────────────────────────────
  const handleCopy = useCallback((entry: SwipeFileEntry) => {
    const hookText = entry.idea.hooks.map((h) => h.text).join('\n');
    const text = `${hookText}\n\n${entry.idea.body}\n\n${entry.idea.hashtags.map((h) => `#${h}`).join(' ')}\n\nCTA: ${entry.idea.cta}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(entry.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col bg-[#F9F9F7]">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Toolbar ──────────────────────────────────────────── */}
        <div className="mb-8 space-y-6">
          {/* Title row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b-4 border-[#111111] pb-4">
            <div>
              <h1 className="text-4xl font-heading font-black text-[#111111] uppercase tracking-tighter">Saved Ideas</h1>
              <p className="mt-2 text-sm font-serif italic text-[#525252]">
                {filteredEntries.length === entries.length
                  ? `${entries.length} saved idea${entries.length !== 1 ? 's' : ''}`
                  : `${filteredEntries.length} of ${entries.length} idea${entries.length !== 1 ? 's' : ''}`}
              </p>
            </div>

            {/* View toggle */}
            <div
              className="flex items-center border-2 border-[#111111] bg-white p-0.5 sharp-corners"
              role="radiogroup"
              aria-label="View mode"
            >
              <button
                type="button"
                role="radio"
                aria-checked={viewMode === 'grid'}
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-widest transition-colors sharp-corners ${
                  viewMode === 'grid'
                    ? 'bg-[#111111] text-[#F9F9F7]'
                    : 'text-[#111111] hover:bg-[#E5E5E0]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.25 2A2.25 2.25 0 002 4.25v2.5A2.25 2.25 0 004.25 9h2.5A2.25 2.25 0 009 6.75v-2.5A2.25 2.25 0 006.75 2h-2.5zm0 9A2.25 2.25 0 002 13.25v2.5A2.25 2.25 0 004.25 18h2.5A2.25 2.25 0 009 15.75v-2.5A2.25 2.25 0 006.75 11h-2.5zm9-9A2.25 2.25 0 0011 4.25v2.5A2.25 2.25 0 0013.25 9h2.5A2.25 2.25 0 0018 6.75v-2.5A2.25 2.25 0 0015.75 2h-2.5zm0 9A2.25 2.25 0 0011 13.25v2.5A2.25 2.25 0 0013.25 18h2.5A2.25 2.25 0 0018 15.75v-2.5A2.25 2.25 0 0015.75 11h-2.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Grid
                </span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={viewMode === 'list'}
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-widest transition-colors sharp-corners ${
                  viewMode === 'list'
                    ? 'bg-[#111111] text-[#F9F9F7]'
                    : 'text-[#111111] hover:bg-[#E5E5E0]'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                      clipRule="evenodd"
                    />
                  </svg>
                  List
                </span>
              </button>
            </div>
          </div>

          {/* Filter bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#111111]"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                type="text"
                placeholder="SEARCH IDEAS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '3.5rem' }}
                className="w-full border-2 border-[#111111] bg-white py-3 pr-4 text-sm font-mono font-bold uppercase tracking-widest text-[#111111] placeholder:text-[#A3A3A3] outline-none sharp-corners focus:border-[#CC0000] focus:ring-0"
                aria-label="Search saved ideas"
              />
            </div>

            {/* Platform dropdown */}
            <select
              value={platformFilter}
              onChange={(e) =>
                setPlatformFilter(e.target.value as 'all' | Platform)
              }
              className="border-2 border-[#111111] bg-white px-4 py-3 text-sm font-mono font-bold uppercase tracking-widest text-[#111111] outline-none sharp-corners focus:border-[#CC0000] focus:ring-0 [&>option]:bg-white [&>option]:text-[#111111]"
              aria-label="Filter by platform"
            >
              <option value="all">ALL PLATFORMS</option>
              {PLATFORMS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.icon} {p.label}
                </option>
              ))}
            </select>

            {/* Segment dropdown */}
            <select
              value={segmentFilter}
              onChange={(e) =>
                setSegmentFilter(e.target.value as 'all' | Segment)
              }
              className="border-2 border-[#111111] bg-white px-4 py-3 text-sm font-mono font-bold uppercase tracking-widest text-[#111111] outline-none sharp-corners focus:border-[#CC0000] focus:ring-0 [&>option]:bg-white [&>option]:text-[#111111]"
              aria-label="Filter by segment"
            >
              <option value="all">ALL SEGMENTS</option>
              {SEGMENTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.icon} {s.label}
                </option>
              ))}
            </select>

            {/* Tone dropdown */}
            <select
              value={toneFilter}
              onChange={(e) =>
                setToneFilter(e.target.value as 'all' | Tone)
              }
              className="border-2 border-[#111111] bg-white px-4 py-3 text-sm font-mono font-bold uppercase tracking-widest text-[#111111] outline-none sharp-corners focus:border-[#CC0000] focus:ring-0 [&>option]:bg-white [&>option]:text-[#111111]"
              aria-label="Filter by tone"
            >
              <option value="all">ALL TONES</option>
              {TONES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.icon} {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Bulk actions bar */}
          <div className="flex items-center gap-4 border-2 border-[#111111] bg-white px-5 py-3 sharp-corners shadow-[4px_4px_0px_0px_#111111]">
            <label className="flex cursor-pointer items-center gap-3 text-sm font-mono font-bold uppercase tracking-widest text-[#111111]">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={toggleSelectAll}
                className="h-5 w-5 border-2 border-[#111111] bg-white text-[#111111] accent-[#111111] sharp-corners"
                aria-label="Select all visible entries"
              />
              Select All
            </label>

            {selectedIds.size > 0 && (
              <>
                <span className="text-xs font-mono font-bold text-[#CC0000] uppercase tracking-widest">
                  {selectedIds.size} Selected
                </span>
                <div className="h-5 w-0.5 bg-[#111111]" role="separator" />
                <button
                  type="button"
                  onClick={handleExportSelected}
                  className="flex items-center gap-2 border border-[#111111] bg-white px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-widest text-[#111111] hover:bg-[#111111] hover:text-white transition-colors sharp-corners"
                  aria-label="Export selected entries as CSV"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                    <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                  </svg>
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-2 border border-[#CC0000] bg-white px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-widest text-[#CC0000] hover:bg-[#CC0000] hover:text-white transition-colors sharp-corners ml-auto"
                  aria-label="Delete selected entries"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 01.78.72l.5 6a.75.75 0 01-1.49.12l-.5-6a.75.75 0 01.71-.84zm2.84 0a.75.75 0 01.71.84l-.5 6a.75.75 0 11-1.49-.12l.5-6a.75.75 0 01.78-.72z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Content grid / list ───────────────────────────────── */}
        {filteredEntries.length === 0 ? (
          <EmptyState hasEntries={entries.length > 0} />
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'
                : 'flex flex-col gap-3'
            }
          >
            {filteredEntries.map((entry) => (
              <SwipeCard
                key={entry.id}
                entry={entry}
                viewMode={viewMode}
                isSelected={selectedIds.has(entry.id)}
                isCopied={copiedId === entry.id}
                onToggleSelect={() => toggleSelect(entry.id)}
                onCopy={() => handleCopy(entry)}
                onDelete={() => removeEntry(entry.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ================================================================
// SwipeCard — individual entry card
// ================================================================
interface SwipeCardProps {
  entry: SwipeFileEntry;
  viewMode: 'grid' | 'list';
  isSelected: boolean;
  isCopied: boolean;
  onToggleSelect: () => void;
  onCopy: () => void;
  onDelete: () => void;
}

function SwipeCard({
  entry,
  viewMode,
  isSelected,
  isCopied,
  onToggleSelect,
  onCopy,
  onDelete,
}: SwipeCardProps) {
  const platform = entry.idea.platform;
  const platformColor = PLATFORM_COLORS[platform];
  const platformLabel = PLATFORM_LABELS[platform];
  const toneIcon = TONE_ICONS[entry.tone];
  const toneLabel = TONES.find((t) => t.id === entry.tone)?.label ?? entry.tone;
  const firstHook = entry.idea.hooks[0]?.text ?? '';
  const truncatedBody =
    entry.idea.body.length > 120
      ? `${entry.idea.body.slice(0, 120)}…`
      : entry.idea.body;

  const isGrid = viewMode === 'grid';

  return (
    <article
      className={`group relative border-2 border-[#111111] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#111111] ${
        isSelected
          ? 'border-[#CC0000] ring-1 ring-[#CC0000] shadow-[4px_4px_0px_0px_#CC0000]'
          : 'shadow-[2px_2px_0px_0px_#111111]'
      } ${isGrid ? 'flex flex-col' : 'flex flex-row items-start gap-4'} sharp-corners`}
      aria-label={`Saved idea: ${entry.topic}`}
    >
      {/* Checkbox */}
      <div
        className={`${isGrid ? 'absolute right-4 top-4' : 'flex-shrink-0 pl-4 pt-4'} z-10`}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="h-5 w-5 cursor-pointer border-2 border-[#111111] bg-white text-[#111111] accent-[#111111] sharp-corners"
          aria-label={`Select ${entry.topic}`}
        />
      </div>

      {/* Card body */}
      <div className={`flex flex-1 flex-col gap-4 p-5 ${isGrid ? '' : 'py-5'}`}>
        {/* Top row: platform badge + tone badge */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center border border-[#111111] bg-[#111111] px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest text-[#F9F9F7] sharp-corners"
          >
            {platformLabel}
          </span>
          <span className="inline-flex items-center border border-[#111111] bg-white px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest text-[#111111] sharp-corners">
            {toneIcon} {toneLabel}
          </span>
        </div>

        {/* Topic */}
        <h3 className="text-xl font-heading font-black text-[#111111] uppercase tracking-tighter line-clamp-2 leading-tight">
          {entry.topic}
        </h3>

        {/* First hook */}
        {firstHook && (
          <p className="text-base font-serif italic leading-relaxed text-[#111111]">
            &ldquo;{firstHook}&rdquo;
          </p>
        )}

        {/* Body preview */}
        <p className="text-sm leading-relaxed font-serif text-[#525252] line-clamp-3">
          {truncatedBody}
        </p>

        {/* Bottom row: meta + actions */}
        <div className="mt-auto flex items-center justify-between border-t-2 border-[#111111] pt-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#525252]">
              {getRelativeTime(entry.savedAt)}
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#525252]">
              {entry.idea.hashtags.length} hashtag{entry.idea.hashtags.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Copy button */}
            <button
              type="button"
              onClick={onCopy}
              className="flex items-center justify-center border border-[#111111] bg-white p-2 text-[#111111] hover:bg-[#111111] hover:text-white transition-colors sharp-corners"
              aria-label={isCopied ? 'Copied!' : `Copy ${entry.topic} content`}
              title={isCopied ? 'Copied!' : 'Copy to clipboard'}
            >
              {isCopied ? (
                <span className="font-bold h-4 w-4 flex items-center justify-center">✓</span>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                  <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
                </svg>
              )}
            </button>

            {/* Delete button */}
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center justify-center border border-[#111111] bg-white p-2 text-[#CC0000] hover:bg-[#CC0000] hover:border-[#CC0000] hover:text-white transition-colors sharp-corners"
              aria-label={`Delete ${entry.topic}`}
              title="Delete"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 01.78.72l.5 6a.75.75 0 01-1.49.12l-.5-6a.75.75 0 01.71-.84zm2.84 0a.75.75 0 01.71.84l-.5 6a.75.75 0 11-1.49-.12l.5-6a.75.75 0 01.78-.72z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

// ================================================================
// Empty state
// ================================================================
function EmptyState({ hasEntries }: { hasEntries: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center border-[3px] border-dashed border-[#111111] bg-[#F9F9F7] px-6 py-24 sharp-corners">
      <div className="mb-6 flex h-20 w-20 items-center justify-center border-4 border-[#111111] bg-white text-4xl sharp-corners shadow-[4px_4px_0px_0px_#111111]">
        ?
      </div>
      <h2 className="text-2xl font-heading font-black text-[#111111] uppercase tracking-tighter">
        {hasEntries ? 'No matching ideas' : 'No Saved Ideas'}
      </h2>
      <p className="mt-2 text-base font-serif italic text-[#525252]">
        {hasEntries
          ? 'Try adjusting your filters or search query.'
          : 'Save content ideas from the dashboard to build your collection.'}
      </p>
      {!hasEntries && (
        <Link
          href="/"
          className="mt-8 btn-editorial px-8 py-4 text-base"
        >
          RETURN TO PRESS
        </Link>
      )}
    </div>
  );
}

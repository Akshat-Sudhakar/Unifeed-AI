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
    <div className="flex min-h-screen flex-col bg-[#030304]">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {/* ── Toolbar ──────────────────────────────────────────── */}
        <div className="mb-6 space-y-4">
          {/* Title row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Swipe File</h1>
              <p className="mt-0.5 text-sm text-white/50">
                {filteredEntries.length === entries.length
                  ? `${entries.length} saved idea${entries.length !== 1 ? 's' : ''}`
                  : `${filteredEntries.length} of ${entries.length} idea${entries.length !== 1 ? 's' : ''}`}
              </p>
            </div>

            {/* View toggle */}
            <div
              className="flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5"
              role="radiogroup"
              aria-label="View mode"
            >
              <button
                type="button"
                role="radio"
                aria-checked={viewMode === 'grid'}
                onClick={() => setViewMode('grid')}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#F7931A]/20 text-[#F7931A]'
                    : 'text-white/50 hover:text-white/80'
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
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#F7931A]/20 text-[#F7931A]'
                    : 'text-white/50 hover:text-white/80'
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30"
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
                placeholder="Search ideas…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-[#F7931A]/50 focus:ring-1 focus:ring-[#F7931A]/30"
                aria-label="Search swipe file entries"
              />
            </div>

            {/* Platform dropdown */}
            <select
              value={platformFilter}
              onChange={(e) =>
                setPlatformFilter(e.target.value as 'all' | Platform)
              }
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-[#F7931A]/50 [&>option]:bg-[#0F1115] [&>option]:text-white"
              aria-label="Filter by platform"
            >
              <option value="all">All Platforms</option>
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
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-[#F7931A]/50 [&>option]:bg-[#0F1115] [&>option]:text-white"
              aria-label="Filter by segment"
            >
              <option value="all">All Segments</option>
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
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-[#F7931A]/50 [&>option]:bg-[#0F1115] [&>option]:text-white"
              aria-label="Filter by tone"
            >
              <option value="all">All Tones</option>
              {TONES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.icon} {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Bulk actions bar */}
          <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-white/60">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-white/20 bg-white/5 text-[#F7931A] accent-[#F7931A]"
                aria-label="Select all visible entries"
              />
              Select All
            </label>

            {selectedIds.size > 0 && (
              <>
                <span className="text-xs text-white/40">
                  {selectedIds.size} selected
                </span>
                <div className="h-4 w-px bg-white/10" role="separator" />
                <button
                  type="button"
                  onClick={handleExportSelected}
                  className="flex items-center gap-1.5 rounded-md bg-[#F7931A]/10 px-3 py-1 text-xs font-medium text-[#F7931A] transition-colors hover:bg-[#F7931A]/20"
                  aria-label="Export selected entries as CSV"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-3.5 w-3.5"
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
                  className="flex items-center gap-1.5 rounded-md bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
                  aria-label="Delete selected entries"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-3.5 w-3.5"
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
      className={`group relative rounded-xl border bg-[#0F1115]/80 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#F7931A]/5 ${
        isSelected
          ? 'border-[#F7931A]/40 ring-1 ring-[#F7931A]/20'
          : 'border-white/10 hover:border-white/20'
      } ${isGrid ? 'flex flex-col' : 'flex flex-row items-start gap-4'}`}
      aria-label={`Swipe file entry: ${entry.topic}`}
    >
      {/* Checkbox */}
      <div
        className={`${isGrid ? 'absolute left-3 top-3' : 'flex-shrink-0 pl-4 pt-4'} z-10`}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="h-4 w-4 cursor-pointer rounded border-white/20 bg-white/5 text-[#F7931A] accent-[#F7931A]"
          aria-label={`Select ${entry.topic}`}
        />
      </div>

      {/* Card body */}
      <div className={`flex flex-1 flex-col gap-3 p-4 ${isGrid ? '' : 'py-4'}`}>
        {/* Top row: platform badge + tone badge */}
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold text-white"
            style={{ backgroundColor: `${platformColor}30`, color: platformColor }}
          >
            {platformLabel}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-xs font-medium text-white/60">
            {toneIcon} {toneLabel}
          </span>
        </div>

        {/* Topic */}
        <h3 className="text-sm font-semibold text-white">{entry.topic}</h3>

        {/* First hook */}
        {firstHook && (
          <p className="text-sm leading-relaxed text-[#F7931A]/80">
            &ldquo;{firstHook}&rdquo;
          </p>
        )}

        {/* Body preview */}
        <p className="text-xs leading-relaxed text-white/40">{truncatedBody}</p>

        {/* Bottom row: meta + actions */}
        <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-3">
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-white/30">
              {getRelativeTime(entry.savedAt)}
            </span>
            <span className="text-[11px] text-white/30">
              {entry.idea.hashtags.length} hashtag{entry.idea.hashtags.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Copy button */}
            <button
              type="button"
              onClick={onCopy}
              className="rounded-md p-1.5 text-white/30 transition-colors hover:bg-white/5 hover:text-white/70"
              aria-label={isCopied ? 'Copied!' : `Copy ${entry.topic} content`}
              title={isCopied ? 'Copied!' : 'Copy to clipboard'}
            >
              {isCopied ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4 text-green-400"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>
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
              className="rounded-md p-1.5 text-white/30 transition-colors hover:bg-red-500/10 hover:text-red-400"
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
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 px-6 py-24">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-8 w-8 text-white/20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z"
            clipRule="evenodd"
          />
          <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-white/60">
        {hasEntries ? 'No matching ideas' : 'Your swipe file is empty'}
      </h2>
      <p className="mt-1 text-sm text-white/30">
        {hasEntries
          ? 'Try adjusting your filters or search query.'
          : 'Save content ideas from the dashboard to build your swipe file.'}
      </p>
      {!hasEntries && (
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#EA580C] to-[#F7931A] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#F7931A]/20 transition-transform hover:scale-105"
        >
          Go to Dashboard
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M3 10a.75.75 0 01.75-.75h10.638l-3.96-4.158a.75.75 0 111.08-1.04l5.25 5.5a.75.75 0 010 1.08l-5.25 5.5a.75.75 0 11-1.08-1.04l3.96-4.158H3.75A.75.75 0 013 10z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      )}
    </div>
  );
}

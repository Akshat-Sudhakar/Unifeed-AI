// ============================================================
// UniFeed AI — API Route: /api/export
// ============================================================
// Converts saved content ideas to downloadable CSV format.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import type { SwipeFileEntry } from '@/lib/types';

function escapeCSV(value: string): string {
  if (
    value.includes(',') ||
    value.includes('"') ||
    value.includes('\n') ||
    value.includes('\r')
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function POST(request: NextRequest) {
  try {
    const { entries }: { entries: SwipeFileEntry[] } = await request.json();

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json(
        { error: 'No entries provided for export.' },
        { status: 400 }
      );
    }

    const headers = [
      'Platform',
      'Segment',
      'Topic',
      'Tone',
      'Hook A',
      'Hook B',
      'Hook C',
      'Body',
      'CTA',
      'Hashtags',
      'Visual Brief',
      'Saved Date',
      'Tags',
    ];

    const rows = entries.map((entry) => [
      escapeCSV(entry.idea.platform),
      escapeCSV(entry.segment),
      escapeCSV(entry.topic),
      escapeCSV(entry.tone),
      escapeCSV(entry.idea.hooks[0]?.text || ''),
      escapeCSV(entry.idea.hooks[1]?.text || ''),
      escapeCSV(entry.idea.hooks[2]?.text || ''),
      escapeCSV(entry.idea.body),
      escapeCSV(entry.idea.cta),
      escapeCSV(entry.idea.hashtags.join(' ')),
      escapeCSV(entry.idea.visualBrief?.description || ''),
      escapeCSV(new Date(entry.savedAt).toLocaleDateString()),
      escapeCSV(entry.tags.join(', ')),
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="unifeed-ai-export-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error('[/api/export] Error:', error);
    return NextResponse.json(
      { error: 'Export failed. Please try again.' },
      { status: 500 }
    );
  }
}

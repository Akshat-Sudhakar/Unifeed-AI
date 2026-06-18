// ============================================================
// UniFeed AI — API Route: /api/generate-ideas  (streaming)
// ============================================================
// Streams exactly 5 idea cards as NDJSON — one JSON line per
// idea as soon as it is fully parsed from the Groq token stream.
// Client renders each card the moment it arrives.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import groq from '@/lib/groq';
import { buildIdeaGeneratorPrompt } from '@/lib/prompts';
import type { GenerateRequest, IdeaCard } from '@/lib/types';
import { getFormattedRecentHistory, addHistoryEntries } from '@/lib/history';

export const maxDuration = 60;

// ── Dev mock — simulates streaming delay ───────────────────────
const MOCK_IDEAS: IdeaCard[] = [
  {
    id: 'mock-1',
    novelty_note: "A fresh angle focusing on hidden costs.",
    idea: {
      title: 'The Hidden Cost of Ignoring Uniform Quality',
      persona: 'Corporate/institutional buyer (uniforms, workwear)',
      funnel_stage: 'Awareness',
      pillar: 'Cost & margin math',
      format: 'LinkedIn post',
      core_angle: 'Ill-fitting uniforms silently hurt employee productivity.',
      why_it_works: 'Buyers care about hidden ROI leaks.',
      talking_points: ['Replacement cycle costs', 'Employee morale drop'],
      risk: 'Might sound too dramatic if not backed by data.'
    },
    engineered_prompt: 'Write a professional LinkedIn post...',
  },
  {
    id: 'mock-2',
    novelty_note: "Focuses on brand identity rather than cost.",
    idea: {
      title: 'Your Brand Identity Starts at the Front Door',
      persona: 'Corporate/institutional buyer (uniforms, workwear)',
      funnel_stage: 'Consideration',
      pillar: 'Fabric & sourcing education',
      format: 'Blog/article',
      core_angle: 'Uniforms are the first physical touchpoint for your brand.',
      why_it_works: 'Elevates uniforms from a pure cost center to marketing.',
      talking_points: ['First impressions', 'Brand consistency'],
      risk: 'Could be too abstract for pure procurement managers.'
    },
    engineered_prompt: 'Write a professional LinkedIn post...',
  }
];

// ── Brace-counting extractor ──────────────────────────────────
// Scans the accumulating token buffer and yields complete JSON
// objects that look like IdeaCard as soon as they close.
function extractNewIdeas(
  buffer: string,
  fromPos: number
): { ideas: IdeaCard[]; nextPos: number } {
  const ideas: IdeaCard[] = [];
  let pos = fromPos;

  while (pos < buffer.length) {
    const start = buffer.indexOf('{', pos);
    if (start === -1) break;

    let depth = 0;
    let i = start;
    let inString = false;
    let escaped = false;

    while (i < buffer.length) {
      const ch = buffer[i];
      if (escaped) { escaped = false; i++; continue; }
      if (ch === '\\' && inString) { escaped = true; i++; continue; }
      if (ch === '"') { inString = !inString; i++; continue; }
      if (inString) { i++; continue; }
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) {
          const slice = buffer.slice(start, i + 1);
          try {
            const obj = JSON.parse(slice);
            if (obj.idea && obj.engineered_prompt) {
              ideas.push({
                id: `${Math.random().toString(36).substring(2, 9)}`,
                novelty_note:     String(obj.novelty_note || '').trim(),
                idea:             obj.idea,
                engineered_prompt: String(obj.engineered_prompt).trim(),
              });
              pos = i + 1;
            } else {
              // Not an idea (e.g. it was the outer wrapper object); skip
              pos = i + 1;
            }
          } catch {
            pos = i + 1;
          }
          i++;
          break;
        }
      }
      i++;
    }

    // Still inside an incomplete object — wait for more tokens
    if (depth > 0) break;
    if (pos <= start) { pos = start + 1; } // avoid infinite loop
  }

  return { ideas, nextPos: pos };
}

// ── Route handler ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();

    if (!body.segment || !body.platforms?.length || !body.tone) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'Please provide segment, at least one platform, and a tone.' },
        { status: 400 }
      );
    }

    const enc = new TextEncoder();

    // ── Dev mock — stream with simulated delay ────────────────
    if (!process.env.GROQ_API_KEY) {
      if (process.env.NODE_ENV !== 'production') {
        const mockStream = new ReadableStream({
          async start(ctrl) {
            for (const idea of MOCK_IDEAS) {
              await new Promise((r) => setTimeout(r, 400));
              ctrl.enqueue(enc.encode(JSON.stringify({ idea }) + '\n'));
            }
            ctrl.close();
          },
        });
        return new Response(mockStream, {
          headers: { 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'no-store' },
        });
      }
      return NextResponse.json(
        { error: 'Server configuration error', message: 'GROQ_API_KEY is not configured.' },
        { status: 500 }
      );
    }

    // ── Real Groq streaming ───────────────────────────────────
    const recentHistory = await getFormattedRecentHistory(10);
    const systemPrompt = buildIdeaGeneratorPrompt(body, recentHistory);

    const groqStream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Generate EXACTLY 5 content ideas now. Target: ${body.segment} segment, platforms: ${body.platforms.join(', ')}, tone: ${body.tone}${body.topic ? `, topic: "${body.topic}"` : ''}. Output ONLY valid JSON — no markdown, no code blocks.`,
        },
      ],
      temperature: 0.88,
      max_tokens: 3500,
      stream: true,
      // response_format not used with stream:true — prompt enforces JSON
    });

    const readable = new ReadableStream({
      async start(ctrl) {
        let buffer = '';
        let consumed = 0;
        let sent = 0;

        try {
          for await (const chunk of groqStream) {
            buffer += chunk.choices[0]?.delta?.content ?? '';

            if (sent >= 5) continue; // already sent all we need

            const { ideas: fresh, nextPos } = extractNewIdeas(buffer, consumed);
            consumed = nextPos;

            for (const idea of fresh) {
              if (sent < 5) {
                addHistoryEntries([idea]).catch(console.error);
                ctrl.enqueue(enc.encode(JSON.stringify({ idea }) + '\n'));
                sent++;
              }
            }
          }

          // Fallback: if streaming parser missed some, parse full buffer
          if (sent < 5) {
            try {
              const parsed = JSON.parse(buffer);
              const remaining: IdeaCard[] = (parsed.ideas ?? []).slice(sent);
              for (const idea of remaining) {
                if (sent < 5 && idea?.idea && idea?.engineered_prompt) {
                  addHistoryEntries([idea]).catch(console.error);
                  ctrl.enqueue(
                    enc.encode(
                      JSON.stringify({
                        idea: {
                          id:               `${idea.id ?? sent + 1}-${Math.random().toString(36).substring(2, 9)}`,
                          novelty_note:     String(idea.novelty_note || '').trim(),
                          idea:             idea.idea,
                          engineered_prompt: String(idea.engineered_prompt).trim(),
                        },
                      }) + '\n'
                    )
                  );
                  sent++;
                }
              }
            } catch { /* ignore */ }
          }
        } catch (err) {
          ctrl.enqueue(
            enc.encode(JSON.stringify({ error: 'Stream interrupted. Please try again.' }) + '\n')
          );
        } finally {
          ctrl.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: unknown) {
    console.error('[/api/generate-ideas] Error:', error);

    if (error && typeof error === 'object' && 'status' in error) {
      const e = error as { status: number };
      if (e.status === 429)
        return NextResponse.json({ error: 'Rate limited', message: 'Too many requests. Please wait a moment and try again.' }, { status: 429 });
      if (e.status === 401)
        return NextResponse.json({ error: 'Authentication error', message: 'Invalid Groq API key.' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Generation failed', message: error instanceof Error ? error.message : 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}

// ============================================================
// UniFeed AI — API Route: /api/generate
// ============================================================
// Server-side route handler that securely calls Groq API.
// The GROQ_API_KEY is never exposed to the client.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import groq from '@/lib/groq';
import { buildSystemPrompt } from '@/lib/prompts';
import type { GenerateRequest, GenerateResponse } from '@/lib/types';
import { BEST_POSTING_TIMES } from '@/lib/constants';

export const maxDuration = 60; // Allow up to 60s for AI generation

export async function POST(request: NextRequest) {
  try {
    // ── 1. Parse request body early so we can provide a dev mock fallback
    // This enables front-end development without a Groq API key.
    const body: GenerateRequest = await request.json();

    if (!body.segment || !body.topic || !body.platforms?.length || !body.tone) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          message:
            'Please provide segment, topic, at least one platform, and a tone.',
        },
        { status: 400 }
      );
    }

    if (body.topic.trim().length < 3) {
      return NextResponse.json(
        {
          error: 'Invalid topic',
          message: 'Topic must be at least 3 characters long.',
        },
        { status: 400 }
      );
    }

    // If the Groq API key is missing, allow a mocked response in development
    // so the frontend can be tested without external credentials.
    if (!process.env.GROQ_API_KEY) {
      if (process.env.NODE_ENV !== 'production') {
        const ideas = body.platforms.map((platform, idx) => {
          const idea: any = {
            platform,
            hooks: [
              { id: 1, text: `Hook 1 for ${platform}` },
              { id: 2, text: `Hook 2 for ${platform}` },
              { id: 3, text: `Hook 3 for ${platform}` },
            ],
            body: `Mock content for "${body.topic}" on ${platform}. Use this to preview the UI.`,
            hashtags: ['#unifeed', '#mock'],
            cta: 'Contact us',
            visualBrief: {
              description: 'Bright, professional visuals highlighting uniforms.',
              colorPalette: ['#0A66C2', '#E1306C', '#F7FAFC'],
              composition: 'Centered product shot with text overlay',
              style: 'Clean corporate',
            },
          };

          if (platform === 'instagram-reels') {
            idea.reelsScript = {
              scenes: [
                {
                  visual: 'Close-up of fabric',
                  textOverlay: 'Premium fabric',
                  audio: 'Upbeat background',
                  duration: '5s',
                },
                {
                  visual: 'Team wearing uniforms',
                  textOverlay: 'Uniforms that fit',
                  audio: 'Upbeat background',
                  duration: '10s',
                },
              ],
            };
          }

          return idea;
        });

        const postingTimes = BEST_POSTING_TIMES.filter((pt) =>
          body.platforms.includes(pt.platform)
        );

        const response: GenerateResponse = {
          ideas,
          postingTimes,
          generatedAt: new Date().toISOString(),
        };

        return NextResponse.json(response);
      }

      return NextResponse.json(
        {
          error: 'Server configuration error',
          message:
            'GROQ_API_KEY is not configured. Please set it in your environment variables.',
        },
        { status: 500 }
      );
    }

    // ── 3. Build system prompt with business context ─────────
    const systemPrompt = buildSystemPrompt(body);

    // ── 4. Call Groq API ─────────────────────────────────────
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Generate content ideas for the topic: "${body.topic}"

Target Segment: ${body.segment === 'corporate' ? 'Corporate Offices (200+ employees, Delhi/NCR)' : 'Educational Institutions (Schools, Colleges, Universities)'}
Platforms: ${body.platforms.join(', ')}
USPs to highlight: ${body.usps.length > 0 ? body.usps.join(', ') : 'All core USPs'}
Tone: ${body.tone}
Language: ${body.language}

Generate the content now. Remember: ONLY output valid JSON, no markdown formatting or code blocks.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    });

    // ── 5. Parse and validate AI response ────────────────────
    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        {
          error: 'Empty response',
          message: 'The AI model returned an empty response. Please try again.',
        },
        { status: 502 }
      );
    }

    let parsed: { ideas: GenerateResponse['ideas'] };
    try {
      parsed = JSON.parse(content);
    } catch {
      // Sometimes the model wraps JSON in code blocks — try to extract
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch {
          return NextResponse.json(
            {
              error: 'Parse error',
              message:
                'Failed to parse AI response. Please try again.',
              raw: content.substring(0, 500),
            },
            { status: 502 }
          );
        }
      } else {
        return NextResponse.json(
          {
            error: 'Parse error',
            message: 'Failed to parse AI response. Please try again.',
            raw: content.substring(0, 500),
          },
          { status: 502 }
        );
      }
    }

    // ── 6. Attach posting times for selected platforms ───────
    const postingTimes = BEST_POSTING_TIMES.filter((pt) =>
      body.platforms.includes(pt.platform)
    );

    // ── 7. Return structured response ────────────────────────
    const response: GenerateResponse = {
      ideas: parsed.ideas || [],
      postingTimes,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('[/api/generate] Error:', error);

    // Handle Groq-specific errors
    if (error && typeof error === 'object' && 'status' in error) {
      const groqError = error as { status: number; message?: string };
      if (groqError.status === 429) {
        return NextResponse.json(
          {
            error: 'Rate limited',
            message:
              'Too many requests. Please wait a moment and try again.',
          },
          { status: 429 }
        );
      }
      if (groqError.status === 401) {
        return NextResponse.json(
          {
            error: 'Authentication error',
            message:
              'Invalid Groq API key. Please check your environment configuration.',
          },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Generation failed',
        message:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred. Please try again.',
      },
      { status: 500 }
    );
  }
}

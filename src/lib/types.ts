// ============================================================
// UniFeed AI — TypeScript Type Definitions
// ============================================================

/** Supported target audience segments */
export type Segment = 'corporate' | 'educational';

/** Content platforms */
export type Platform = 'linkedin' | 'instagram-post' | 'instagram-reels';

/** Content tone/style options */
export type Tone =
  | 'professional'
  | 'bold'
  | 'humorous'
  | 'urgent'
  | 'storytelling';

/** USP highlight options */
export type USP =
  | 'bulk-discounts'
  | 'custom-branding'
  | 'fast-delivery'
  | 'premium-fabric'
  | 'doorstep-delivery';

/** Language options for content generation */
export type Language = 'english' | 'hindi' | 'hinglish';

/** Request payload sent to /api/generate */
export interface GenerateRequest {
  segment: Segment;
  topic: string;
  usps: USP[];
  platforms: Platform[];
  tone: Tone;
  language: Language;
}

/** A single hook variation */
export interface HookVariation {
  id: number;
  text: string;
}

/** Visual brief for a content piece */
export interface VisualBrief {
  description: string;
  colorPalette: string[];
  composition: string;
  style: string;
}

/** A single content idea for a specific platform */
export interface ContentIdea {
  platform: Platform;
  hooks: HookVariation[];
  body: string;
  hashtags: string[];
  cta: string;
  visualBrief: VisualBrief;
  /** Only for Reels */
  reelsScript?: {
    scenes: {
      visual: string;
      textOverlay: string;
      audio: string;
      duration: string;
    }[];
  };
}

/** Optimal posting times recommendation */
export interface PostingTime {
  platform: Platform;
  bestDays: string[];
  bestTimes: string[];
  timezone: string;
  reasoning: string;
}

/** Full response from /api/generate */
export interface GenerateResponse {
  ideas: ContentIdea[];
  postingTimes: PostingTime[];
  generatedAt: string;
}

/** A saved blueprint (full generation result) */
export interface Blueprint {
  id: string;
  request: GenerateRequest;
  response: GenerateResponse;
  createdAt: string;
  title: string;
}

/** A single saved swipe-file entry */
export interface SwipeFileEntry {
  id: string;
  idea: ContentIdea;
  segment: Segment;
  topic: string;
  tone: Tone;
  savedAt: string;
  tags: string[];
}

/** Platform display metadata */
export interface PlatformInfo {
  id: Platform;
  label: string;
  icon: string;
  description: string;
  color: string;
}

/** Tone card display metadata */
export interface ToneInfo {
  id: Tone;
  label: string;
  icon: string;
  description: string;
}

/** USP display metadata */
export interface USPInfo {
  id: USP;
  label: string;
  description: string;
}

/** Segment display metadata */
export interface SegmentInfo {
  id: Segment;
  label: string;
  description: string;
  icon: string;
}

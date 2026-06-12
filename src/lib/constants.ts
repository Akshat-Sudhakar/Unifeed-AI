// ============================================================
// UniFeed AI — Application Constants
// ============================================================

import type {
  PlatformInfo,
  ToneInfo,
  USPInfo,
  SegmentInfo,
  PostingTime,
} from './types';

/** Target audience segments */
export const SEGMENTS: SegmentInfo[] = [
  {
    id: 'corporate',
    label: 'Corporate Offices',
    description: 'HR Managers at 200+ person corporate offices in Delhi/NCR',
    icon: '🏢',
  },
  {
    id: 'educational',
    label: 'Educational Institutions',
    description:
      'Procurement Heads & Administrators at universities, colleges, and schools',
    icon: '🎓',
  },
];

/** Content platforms */
export const PLATFORMS: PlatformInfo[] = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: '💼',
    description: 'Professional thought-leadership posts',
    color: '#0A66C2',
  },
  {
    id: 'instagram-post',
    label: 'Instagram Post',
    icon: '📸',
    description: 'Visual brand storytelling content',
    color: '#E1306C',
  },
  {
    id: 'instagram-reels',
    label: 'Instagram Reels',
    icon: '🎬',
    description: 'Short-form hook-driven video scripts',
    color: '#833AB4',
  },
];

/** Content tone options */
export const TONES: ToneInfo[] = [
  {
    id: 'professional',
    label: 'Professional',
    icon: '👔',
    description: 'Authoritative, polished, and corporate',
  },
  {
    id: 'bold',
    label: 'Bold & Confident',
    icon: '🔥',
    description: 'Strong opinions, decisive language',
  },
  {
    id: 'humorous',
    label: 'Humorous',
    icon: '😄',
    description: 'Witty, relatable, light-hearted',
  },
  {
    id: 'urgent',
    label: 'Urgent / FOMO',
    icon: '⚡',
    description: 'Time-sensitive, act-now energy',
  },
  {
    id: 'storytelling',
    label: 'Storytelling',
    icon: '📖',
    description: 'Narrative-driven, emotional connection',
  },
];

/** USP highlight options */
export const USPS: USPInfo[] = [
  {
    id: 'bulk-discounts',
    label: 'Bulk Discounts',
    description: 'High-volume pricing advantage',
  },
  {
    id: 'custom-branding',
    label: 'Custom Branding & Embroidery',
    description: 'Precision corporate/institutional logo embroidery',
  },
  {
    id: 'fast-delivery',
    label: 'Fast Doorstep Delivery',
    description: 'Direct delivery to your premises',
  },
  {
    id: 'premium-fabric',
    label: 'Premium Fabric Quality',
    description: 'Durable, high-quality materials built to last',
  },
  {
    id: 'doorstep-delivery',
    label: 'Pan Delhi/NCR Coverage',
    description: 'Serving all of Delhi and NCR region',
  },
];

/** Suggested core topics */
export const SUGGESTED_TOPICS = [
  'Summer Uniform Switch',
  'Brand Identity through Apparel',
  'New Employee Onboarding Kits',
  'Annual Uniform Refresh',
  'School Reopening Season',
  'Corporate Event Merchandise',
  'Uniform Policy Compliance',
  'Cost Savings with Bulk Orders',
  'Custom Sports Uniforms',
  'Festive Season Special Orders',
  'Sustainable Fabric Options',
  'Uniform Sizing & Comfort',
];

/** Language options */
export const LANGUAGES = [
  { id: 'english' as const, label: 'English', flag: '🇬🇧' },
  { id: 'hindi' as const, label: 'हिन्दी (Hindi)', flag: '🇮🇳' },
  { id: 'hinglish' as const, label: 'Hinglish', flag: '🇮🇳' },
];

/** Hardcoded best posting times by platform & segment */
export const BEST_POSTING_TIMES: PostingTime[] = [
  {
    platform: 'linkedin',
    bestDays: ['Tuesday', 'Wednesday', 'Thursday'],
    bestTimes: ['8:00 AM', '10:00 AM', '12:00 PM'],
    timezone: 'IST (UTC+5:30)',
    reasoning:
      'B2B professionals on LinkedIn are most active mid-week during morning hours. HR Managers typically check LinkedIn before meetings start.',
  },
  {
    platform: 'instagram-post',
    bestDays: ['Monday', 'Wednesday', 'Friday'],
    bestTimes: ['12:00 PM', '2:00 PM', '6:00 PM'],
    timezone: 'IST (UTC+5:30)',
    reasoning:
      'Lunch breaks and post-work hours see the highest Instagram engagement. Procurement heads browse during downtime.',
  },
  {
    platform: 'instagram-reels',
    bestDays: ['Tuesday', 'Thursday', 'Saturday'],
    bestTimes: ['9:00 AM', '1:00 PM', '7:00 PM'],
    timezone: 'IST (UTC+5:30)',
    reasoning:
      'Reels discovery peaks during commute times and weekend browsing. Short-form video gets maximum visibility at these slots.',
  },
];

/** App metadata */
export const APP_CONFIG = {
  name: 'UniFeed AI',
  description: 'AI-Powered Content Idea Generator for UniforMeFy',
  company: 'UniforMeFy',
  tagline: 'Smart Content Blueprints for B2B Uniform Excellence',
  maxHistoryItems: 50,
  maxSwipeFileItems: 200,
};

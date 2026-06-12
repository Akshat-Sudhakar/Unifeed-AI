// ============================================================
// UniFeed AI — Groq Client Singleton
// ============================================================

import Groq from 'groq-sdk';

if (!process.env.GROQ_API_KEY) {
  console.warn(
    '⚠️  GROQ_API_KEY is not set. AI generation will not work.\n' +
      '   Copy .env.example to .env.local and add your key from https://console.groq.com'
  );
}

/** Singleton Groq SDK client — only used server-side */
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

export default groq;

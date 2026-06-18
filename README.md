# UniFeed AI — B2B Apparel Idea + Prompt Generator

> Smart Content Ideas & Engineered Prompts for UniforMeFy's B2B Uniform Excellence

UniFeed AI is an internal tool that generates hyper-targeted **content ideas** and **engineered prompts** for LinkedIn, Instagram Posts, and Instagram Reels — tailored specifically for **UniforMeFy**, a B2B uniform manufacturing and delivery company serving Delhi/NCR.

Instead of generating the final copy directly, UniFeed AI acts as an **Idea Engine**. For every idea, it generates a highly detailed "Engineered Prompt" that can be copy-pasted into a downstream content-generation AI.

---

## ✨ Features

### Idea Generation
- **AI-Powered**: Generates deep, domain-expert angles using Groq's Llama 3.3 70B model.
- **Engineered Prompts**: Outputs a ready-to-use prompt designed to instruct another AI on how to write the actual content, complete with a request for specific missing context.
- **Anti-Repetition Engine**: Automatically injects recent history into the prompt to ensure no ideas are repeated across sessions.
- **Platform-Specific Angles**: Optimized for LinkedIn, Instagram Posts, and Instagram Reels.

### Input Controls
- **Target Segment Selector**: Corporate Offices vs Educational Institutions.
- **Tone Cards**: Professional, Bold, Humorous, Urgent/FOMO, Storytelling.
- **Content Platforms**: Choose one or multiple content platforms to target simultaneously.
- **Multi-Language**: English, Hindi (Devanagari), and Hinglish support.

### Output & Display
- **Live Streaming**: Idea cards animate and stream in real-time as they are generated.
- **Engineered Prompt Display**: A distinct, copy-friendly block that holds the downstream prompt.
- **History Drawer**: Save your favorite ideas locally.
- **CSV Export**: Export saved ideas as downloadable CSV files.

### Accessibility
- Full keyboard navigation across all custom input controls.
- Screen reader friendly with dynamic `aria-live` loading states.
- Focus-visible indicators and high-contrast design system.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + Vanilla CSS |
| AI Model | Groq Llama 3.3 70B Versatile |
| AI SDK | groq-sdk |
| State | React hooks + localStorage |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ installed
- **Groq API Key** — Get one free at [console.groq.com](https://console.groq.com)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Unifeed
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
```bash
# Copy the example env file
cp .env.example .env.local

# Edit .env.local and add your Groq API key
# GROQ_API_KEY=gsk_your_actual_key_here
```

### 4. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout (fonts, metadata)
│   ├── page.tsx                # Main generator dashboard
│   ├── globals.css             # Tailwind v4 + custom design system
│   └── api/
│       ├── generate-ideas/
│       │   └── route.ts        # Streaming Idea Generation endpoint
│       └── export/
│           └── route.ts        # CSV export endpoint
├── components/
│   ├── icons.tsx               # Centralized SVG icons
│   ├── layout/
│   │   └── Header.tsx          # App header with navigation
│   ├── input/
│   │   └── InputPanel.tsx      # Target audience and platform controls
│   └── output/
│       ├── IdeaCards.tsx       # Streamed output display
│       └── SavedIdeasDrawer.tsx# Sidebar for local saves
├── hooks/
│   ├── useSavedIdeas.ts        # localStorage sync hook
│   └── useLocalStorage.ts      # Core persistence logic
└── lib/
    ├── groq.ts                 # Groq SDK client
    ├── prompts.ts              # System prompt builder + anti-repetition
    ├── history.ts              # Server-side history storage
    ├── types.ts                # TypeScript definitions
    └── constants.ts            # App constants
```

---

## 🔒 Security

- **API Key Protection**: The Groq API key is stored in server-side environment variables and accessed only in Route Handlers. It is never included in client bundles.
- **Local Persistence**: Ideas and history are stored locally in `.data` (server) and `localStorage` (client), ensuring proprietary brainstorms remain private.

---

## 📝 License

Internal tool for UniforMeFy. All rights reserved.

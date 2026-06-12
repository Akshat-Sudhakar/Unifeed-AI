# UniFeed AI — AI-Powered Content Idea Generator

> Smart Content Blueprints for UniforMeFy's B2B Uniform Excellence

UniFeed AI is an internal tool that generates hyper-targeted content ideas for LinkedIn, Instagram Posts, and Instagram Reels — tailored specifically for **UniforMeFy**, a B2B uniform manufacturing and delivery company serving Delhi/NCR.

---

## ✨ Features

### Content Generation
- **AI-Powered**: Generates content using Groq's Llama 3.3 70B model
- **Platform-Specific**: LinkedIn, Instagram Posts, Instagram Reels with platform-optimized formats
- **A/B Hook Variations**: 3 different hooks per content piece for testing
- **Visual Briefs**: AI-generated visual direction for each content piece
- **Multi-Language**: English, Hindi (Devanagari), and Hinglish support

### Input Controls
- **Target Segment Selector**: Corporate Offices vs Educational Institutions
- **Core Topic Input**: With suggested topics autocomplete
- **Tone Cards**: Professional, Bold, Humorous, Urgent/FOMO, Storytelling
- **USP Checkboxes**: Highlight specific UniforMeFy advantages
- **Platform Selector**: Choose one or multiple content platforms

### Output & Display
- **Tabbed Workspace**: Organized by platform with smooth transitions
- **Copy to Clipboard**: One-click copy with visual feedback
- **Best Time to Post**: Optimal posting schedule recommendations
- **Scene-by-Scene Reels Scripts**: With visual, text overlay, and audio cues

### Data Persistence
- **Blueprint History**: Auto-saved generation history in sidebar (localStorage)
- **Swipe File**: Save individual ideas for later reference
- **CSV Export**: Export saved ideas as downloadable CSV files
- **Cross-Tab Sync**: Changes reflect across browser tabs

### Accessibility
- Full keyboard navigation
- ARIA labels and roles
- Skip-to-content link
- Focus-visible indicators
- Screen reader friendly

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| AI Model | Groq Llama 3.3 70B Versatile |
| AI SDK | groq-sdk |
| State | React hooks + localStorage |
| Deployment | Vercel (Free Tier) |

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

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 🌐 Deploy to Vercel

### One-Click Deploy
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add the environment variable:
   - **Name**: `GROQ_API_KEY`
   - **Value**: Your Groq API key
4. Click Deploy

### Environment Variables on Vercel
| Variable | Description | Required |
|----------|------------|----------|
| `GROQ_API_KEY` | Groq API key for AI generation | ✅ Yes |

> ⚠️ The API key is only used server-side in the Route Handler at `/api/generate`. It is never exposed to the client browser.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout (fonts, metadata)
│   ├── page.tsx                # Main generator dashboard
│   ├── globals.css             # Tailwind v4 + custom styles
│   ├── swipe-file/
│   │   └── page.tsx            # Saved swipe file manager
│   └── api/
│       ├── generate/
│       │   └── route.ts        # Groq AI generation endpoint
│       └── export/
│           └── route.ts        # CSV export endpoint
├── components/
│   ├── layout/
│   │   └── Header.tsx          # App header with navigation
│   ├── input/
│   │   └── InputPanel.tsx      # All input controls
│   ├── output/
│   │   ├── OutputWorkspace.tsx # Tabbed output display
│   │   ├── ContentCard.tsx     # Content idea card
│   │   ├── VisualBrief.tsx     # Visual brief section
│   │   └── BestTimeToPost.tsx  # Posting time widget
│   └── history/
│       └── BlueprintHistory.tsx# History sidebar
├── hooks/
│   ├── useGenerate.ts          # AI generation hook
│   ├── useLocalStorage.ts      # localStorage sync hook
│   └── useSwipeFile.ts         # Swipe file manager hook
└── lib/
    ├── groq.ts                 # Groq SDK client
    ├── prompts.ts              # System prompt builder
    ├── types.ts                # TypeScript definitions
    └── constants.ts            # App constants
```

---

## 🔒 Security

- **API Key Protection**: The Groq API key is stored in server-side environment variables and accessed only in Route Handlers. It is never included in client bundles.
- **No Authentication Required**: This is an internal tool — no user auth is needed.
- **Input Validation**: All API requests are validated on the server before forwarding to Groq.

---

## 📋 Feature Checklist (Progression Sheet)

| Day | Feature | Status |
|-----|---------|--------|
| 1 | Project Init (Next.js + TypeScript) | ✅ |
| 1 | Tailwind CSS Setup | ✅ |
| 1 | App Router Routing | ✅ |
| 1 | API Setup (fetch) | ✅ |
| 2 | Groq API Integration | ✅ |
| 2 | System Prompt Engineering | ✅ |
| 2 | Frontend Service (useGenerate) | ✅ |
| 2 | Error Handling | ✅ |
| 3 | Platform Selector | ✅ |
| 3 | Tone Cards | ✅ |
| 3 | Results Display | ✅ |
| 3 | Keyboard Navigation | ✅ |
| 4 | Hindi/Hinglish Toggle | ✅ |
| 4 | A/B Hooks (3 variations) | ✅ |
| 4 | Visual Brief | ✅ |
| 4 | Best Time to Post | ✅ |
| 5 | CSV Export | ✅ |
| 5 | Swipe File Store | ✅ |
| 5 | localStorage Sync | ✅ |
| 5 | Swipe File UI | ✅ |
| 6 | Vercel Deployment Config | ✅ |
| 6 | README Documentation | ✅ |

---

## 📝 License

Internal tool for UniforMeFy. All rights reserved.

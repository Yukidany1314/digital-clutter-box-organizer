# ClutterBox — AI-Powered Digital Clutter Organizer

> *"Save less mentally. Organize better. Rediscover what matters."*

ClutterBox transforms digital clutter (unopened bookmarks, saved links, half-written ideas, and neglected action items) into an actionable, structured workspace. It combines intelligent classification into three **Smart Boxes**, dynamic **Forgotten Treasure** detection with randomizer rescues, an authoritative **Clutter Score**, and server-side **Google Gemini** organization assistance.

---

## 1. System Architecture

- **Frontend**: React 19 SPA, TypeScript, Vite, React Router v7, Tailwind CSS v4, Lucide React icons, Canvas Confetti.
- **Backend**: Node.js, Express.js (mounted via `tsx server.ts` on port 3000 in dev with Vite middlewares).
- **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS) policies and versioned migrations in `/supabase/migrations/20261027000000_initial_schema.sql`. Includes seamless Local High-Fidelity DB persistence and 1-click Demo Mode when cloud credentials are not supplied.
- **AI Integration**: Official `@google/genai` TypeScript SDK running strictly on the server (`gemini-3.8-flash`) with structured JSON schema output, Zod validation, and deterministic rule-based fallback.

---

## 2. Core Features

### 2.1 Smart Boxes
Content is organized by intended human outcome rather than arbitrary folders:
- **READ Box**: Articles, blogs, tutorials, and videos queued for study time.
- **DO Box**: Actionable tasks, project milestones, chores, and coding ideas.
- **REFERENCE Box**: Documentation, cheat sheets, syntax patterns, and durable resources.

### 2.2 Forgotten Treasure Engine (Signature Feature)
- Automatically detects items sitting unreviewed for **14+ days** (configurable to 7, 14, 30, or 60 days).
- Shows exact elapsed time (e.g. `19d`, `31d`, `45d neglected`).
- **Rescue an Item Randomizer**: Modal with shuffle animation and 5 distinct rescue paths:
  1. *Revisit & Read Now* (opens URL safely, updates review timestamp to today).
  2. *Mark as Done* (celebratory completion).
  3. *Keep in Reference* (preserves in REFERENCE box).
  4. *Move to Archive* (cleans backlog without permanent deletion).
  5. *Let Go & Delete* (permanently purges clutter).

### 2.3 Transparent Clutter Score (0–100)
Calculated via the deterministic formula:
$$\text{Clutter Score} = \text{round}\left(100 \times \frac{\text{attentionItems}}{\text{activeItems}}\right)$$
Where `attentionItems` are active items in the **DO Box** or neglected for **14+ days**.
- **0–24**: Well Organized
- **25–49**: Light Clutter
- **50–74**: Needs Attention
- **75–100**: High Clutter

### 2.4 Server-Side Gemini AI
- **Smart Categorization** (`POST /api/v1/ai/categorize`): Given a title, URL, or notes, Gemini suggests the category, content type, 1-sentence summary, tags, reasoning, and next action. The user reviews and approves suggestions before saving.
- **AI Clutter Assistant** (`POST /api/v1/ai/assistant`): Evaluates user items and provides grounded observations with evidence and prioritized action steps.
- **Zero Breakage Guarantee**: If `GEMINI_API_KEY` is not present, the system seamlessly uses deterministic rule-based algorithms.

---

## 3. Getting Started

### Local Development
```bash
# 1. Install dependencies
npm install

# 2. Start full-stack server (runs Express & mounts Vite at port 3000)
npm run dev

# 3. Production build
npm run build
```

### Environment Configuration (`.env`)
```env
# Gemini API Key (automatically injected at runtime in Google AI Studio)
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-3.8-flash"

# Port & URL
PORT="3000"
APP_URL="http://localhost:3000"

# Optional Cloud Supabase (if omitted, high-fidelity local session & storage is used)
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

---

## 4. API Endpoints

- `GET /api/v1/health` — Server health status and AI engine status.
- `POST /api/v1/ai/categorize` — Classifies saved content and generates tags.
- `POST /api/v1/ai/assistant` — Analyzes user backlog and provides grounded advice.

---

## 5. 2-Minute Hackathon Demo Script

1. **Landing Page (`/`)**: Click **"Launch Demo Mode (Instant Access)"** to enter as Alex Rivera.
2. **Dashboard (`/app`)**: Review the 5 KPI summary cards and the **Clutter Score** progress ring. Click the info icon to inspect the exact formula.
3. **Quick Capture**: Click **+ Quick Capture**, enter a title or link (e.g., `Build fullstack React app`), and click **Suggest Organization** to see Gemini categorize it into the **DO Box** with tags.
4. **Duplicate Warning**: Try pasting an existing URL (e.g., `https://react.dev/reference/react`) and notice the duplicate warning banner.
5. **Forgotten Treasure (`/app/forgotten`)**: Observe items marked with `19d`, `31d`, or `40d` neglect. Click **Rescue an Item (Randomizer)**, shuffle through items, and select **Mark as Done** to watch your Clutter Score drop!
6. **AI Assistant (`/app/assistant`)**: Click **Analyze My Digital Clutter** to receive observations and prioritized recommendations grounded in your backlog.
7. **Persistence**: Reload the browser to confirm all records and timestamps stay intact.

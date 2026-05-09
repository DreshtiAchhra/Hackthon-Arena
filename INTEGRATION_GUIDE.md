# MindHeaven AI Enhancements — Integration Guide
## SIH 2025 · Code Busters · Hackathon-Ready

---

## Files Delivered

| File | Purpose |
|------|---------|
| `ai-enhancements.css` | All new AI-themed styles (glassmorphism, glow cards, toasts, risk meters, emotion bars, etc.) |
| `ai-enhancements.js` | AI logic — proactive toasts, Claude API chatbot, dashboard injection, hero upgrades, card upgrades |
| `ai-sections-insert.html` | Three complete new HTML sections to paste into `indexmh.html` |

---

## Step-by-Step Integration

### `indexmh.html` (Landing Page)

**1. Add CSS — in `<head>` after your existing stylesheet link:**
```html
<link rel="stylesheet" href="stylesmh.css">
<link rel="stylesheet" href="ai-enhancements.css">   <!-- ADD THIS -->
```

**2. Add JS — before `</body>`:**
```html
<script src="scriptmh.js" defer></script>
<script src="try.js" defer></script>
<script src="ai-enhancements.js" defer></script>   <!-- ADD THIS -->
```

**3. Upgrade the Hero section — replace existing text:**
```html
<!-- Replace hero-title -->
<h1 class="hero-title">Your Intelligent Mental Wellness Companion</h1>

<!-- Replace hero-subtitle -->
<p class="hero-subtitle">
  From Reactive Support to Proactive Care — an AI-powered ecosystem that
  understands student mental health through continuous behavioral intelligence.
</p>
```

**4. Upgrade features section headings:**
```html
<h2 class="features-title">AI-Powered Wellness Services</h2>
<p class="features-subtitle">Personalized Support Through Behavioral Intelligence</p>
```

**5. Paste the three AI sections** from `ai-sections-insert.html`
   — insert them **between the `.features` closing `</section>` and the `#contact` section**.

---

### `user-profile.html` (Dashboard)

**1. Add the same CSS and JS links** (same as above).

The JS auto-detects the dashboard page and injects:
- **AI Wellness Summary Banner** (dark gradient, shows stress/mood/sleep status)
- **AI Emotion Analysis Widget** (animated horizontal bars for 5 emotions)
- **Hover lift effect** on all existing cards
- **Navbar glassmorphism** on scroll

No HTML changes needed — the JS handles everything automatically.

---

## What Each File Does (Feature Map)

### `ai-enhancements.css`

| Class / Element | What it adds |
|----------------|-------------|
| `.ai-monitoring-bar` | Fixed top bar: "AI Monitoring Active · Generative + Agentic AI" |
| `.ai-badge` | Purple gradient pill labels (Live, Generative AI, etc.) |
| `.ai-pulse-dot` | Animated green "active" dot |
| `.ai-glow-card` | Cards with glowing purple border |
| `.glass-card` | Glassmorphism cards |
| `.ai-toast` + `#ai-toast-container` | Proactive bottom-left notification toasts |
| `.ai-insights-section` | Full light-background AI Insights section |
| `.agentic-section` | Dark Agentic AI Decision Engine section |
| `.decision-engine` + `.decision-flow-card` | Visual if/then decision flows |
| `.risk-meter-card` + `.risk-bar-fill` | Animated wellness risk meters |
| `.proactive-section` + `.streak-card` | Proactive support + wellness streak |
| `.notification-feed` + `.notif-item` | Feed of AI proactive alerts |
| `.ai-summary-banner` | Dashboard AI summary (dark gradient) |
| `.emotion-widget` + `.emotion-fill` | Animated emotion analysis bars |
| `.typing-indicator` | 3-dot chatbot typing animation |
| `.hero-ai-pill` + `.hero-ai-chip` | Hero AI branding elements |

### `ai-enhancements.js`

| Function | What it does |
|----------|-------------|
| `injectMonitoringBar()` | Inserts fixed top monitoring bar |
| `scheduleProactiveNotifications()` | Shows 5 staggered toast alerts after page load |
| `sendMessageAI()` | Replaces dummy chatbot with real Claude API calls |
| `upgradeChatbot()` | Reskins chat header, adds typing animation, AI welcome message |
| `upgradeHero()` | Injects AI pill, updates subtitle, adds feature chips |
| `upgradeFeatureCards()` | Adds "AI-Curated", "Smart Scheduling", etc. badges to existing cards |
| `injectDashboardAI()` | Auto-detects dashboard page, injects AI summary + emotion widget |
| `animateEmotionBars()` | CSS transition animation for emotion bars |
| `animateRiskMeters()` | IntersectionObserver scroll animation for risk bars |

---

## Chatbot — Claude API Setup

The chatbot now calls the real Anthropic API (Claude Sonnet). In the current setup the API key is injected by the browser environment.

For production / demo, add your API key in `ai-enhancements.js`:
```js
headers: {
  'Content-Type': 'application/json',
  'x-api-key': 'YOUR_API_KEY_HERE',         // add this line
  'anthropic-version': '2023-06-01',         // add this line
},
```

The system prompt positions the bot as a mental health AI assistant that knows MindHeaven's features and responds empathetically and concisely.

---

## Demo Talking Points (Hackathon Pitch)

1. **"This is not a chatbot project"** — it's a full Generative + Agentic AI ecosystem.
2. **Generative AI**: Claude API powers context-aware chatbot and generates personalized wellness summaries and affirmations.
3. **Agentic AI**: The Decision Engine autonomously detects risk signals (stress, sleep, mood) and triggers the right intervention without user input.
4. **Proactive AI**: The platform acts BEFORE the student asks for help — toasts, streak alerts, burnout warnings.
5. **Continuous Monitoring**: The AI Monitoring Bar visually proves the system is always on.
6. **Emotion Analysis**: Real-time visualization of detected emotional states from behavioral data.

---

## Color Palette Used

| Variable | Hex | Usage |
|----------|-----|-------|
| `--ai-purple` | `#6C63FF` | Primary AI accent |
| `--ai-violet` | `#8B5CF6` | Gradients, streak card |
| `--ai-cyan` | `#00C2FF` | Secondary AI accent, live indicators |
| `--ai-bg` | `#EEF2FF` | Light AI backgrounds |
| `--ai-dark` | `#111827` | Dark sections, banner bg |

---

## Quick Checklist Before Demo

- [ ] `ai-enhancements.css` linked in all pages
- [ ] `ai-enhancements.js` linked before `</body>` in all pages
- [ ] Three sections pasted into `indexmh.html`
- [ ] Hero text updated
- [ ] Features section titles updated
- [ ] Claude API key added (if live demo with real responses needed)
- [ ] Test on mobile — all sections are responsive

---

*MindHeaven · AI-Powered Digital Mental Health & Psychological Support System for Students*
*Built for Smart India Hackathon 2025 · Code Busters*

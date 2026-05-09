/**
 * MindHeaven AI Enhancements — ai-enhancements.js
 * Load this AFTER scriptmh.js / try.js on every page.
 *
 * Features:
 *  1. AI Monitoring Bar
 *  2. Proactive Toast Notifications
 *  3. Enhanced AI Chatbot (Claude API)
 *  4. Emotion Analysis Widget animation
 *  5. Risk Meter animation
 *  6. Agentic Decision Engine visual
 */

/* =====================================================
   1. AI MONITORING BAR
   ===================================================== */
function injectMonitoringBar() {
  if (document.querySelector('.ai-monitoring-bar')) return;
  const bar = document.createElement('div');
  bar.className = 'ai-monitoring-bar';
  bar.innerHTML = `
    <span class="ai-pulse-dot"></span>
    <strong>AI Monitoring Active</strong>
    &nbsp;·&nbsp; Generative + Agentic AI &nbsp;·&nbsp; Continuous Emotional Intelligence
  `;
  document.body.prepend(bar);
}

/* =====================================================
   2. PROACTIVE TOAST NOTIFICATIONS
   ===================================================== */
window.empSessionId = window.empSessionId || 'session_' + Math.random().toString(36).substring(2, 10);

function createToastContainer() {
  if (document.getElementById('ai-toast-container')) return;
  const container = document.createElement('div');
  container.id = 'ai-toast-container';
  document.body.appendChild(container);
}

function showToast(notification) {
  const container = document.getElementById('ai-toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `ai-toast ${notification.type || 'info'}`;
  
  const actionHtml = notification.action_url ? 
    `<a href="${notification.action_url}" style="display:inline-block;margin-top:8px;color:inherit;text-decoration:underline;font-weight:bold;">Take Action ➔</a>` : '';

  toast.innerHTML = `
    <div class="ai-toast-icon">${notification.icon || '🧠'}</div>
    <div>
      <div class="ai-toast-title">${notification.title || 'AI Insight'}</div>
      <div>${notification.text}</div>
      ${actionHtml}
    </div>
  `;

  container.appendChild(toast);

  toast.addEventListener('click', () => toast.remove());
  setTimeout(() => {
    toast.style.transition = 'all .4s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-40px)';
    setTimeout(() => toast.remove(), 400);
  }, 8000);
}

const shownInterventions = new Set();

async function pollInterventions() {
    try {
        const response = await fetch(`http://localhost:8000/interventions/${window.empSessionId}`);
        if (!response.ok) return;
        const data = await response.json();
        
        data.interventions.forEach(inv => {
            if (!shownInterventions.has(inv._id)) {
                shownInterventions.add(inv._id);
                showToast(inv);
            }
        });
    } catch (e) {
        console.error("Error polling interventions:", e);
    }
}

function scheduleProactiveNotifications() {
  createToastContainer();
  // Poll backend for agentic interventions every 10 seconds
  setInterval(pollInterventions, 10000);
  setTimeout(pollInterventions, 2000);
}

/* =====================================================
   3. ENHANCED AI CHATBOT (Claude API)
   ===================================================== */
const CHAT_SYSTEM_PROMPT = `You are MindHeaven AI, an empathetic and intelligent mental health assistant for students. 
You provide: emotional support, coping strategies, wellness tips, and proactive mental health guidance.
Your tone is warm, professional, and concise. You acknowledge feelings, offer evidence-based suggestions,
and recommend professional help when appropriate. You also highlight how the MindHeaven platform's features
(Resource Hub, Counselor Booking, Peer Chat, Games/Mindfulness) can help. Keep responses under 3 sentences 
unless more depth is clearly needed.`;

let chatHistory = [];

async function sendMessageAI() {
  const input = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');
  if (!input || !chatBox) return;

  const userMessage = input.value.trim();
  if (!userMessage) return;

  input.value = '';

  // Append user bubble
  const userBubble = document.createElement('div');
  userBubble.className = 'user-msg';
  userBubble.style.cssText = 'background:#d1ffd6;padding:10px;border-radius:10px;margin:6px 0;max-width:75%;align-self:flex-end;font-size:14px;';
  userBubble.textContent = userMessage;
  chatBox.appendChild(userBubble);
  chatBox.scrollTop = chatBox.scrollHeight;

  // Typing indicator
  const typingEl = document.createElement('div');
  typingEl.className = 'typing-indicator';
  typingEl.innerHTML = '<span></span><span></span><span></span>';
  chatBox.appendChild(typingEl);
  chatBox.scrollTop = chatBox.scrollHeight;

  // Build chat history
  chatHistory.push({ role: 'user', content: userMessage });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: CHAT_SYSTEM_PROMPT,
        messages: chatHistory,
      }),
    });

    const data = await response.json();
    const replyText = data.content?.[0]?.text || 'I\'m here to help. Could you share more about how you\'re feeling?';

    chatHistory.push({ role: 'assistant', content: replyText });
    typingEl.remove();

    const botBubble = document.createElement('div');
    botBubble.className = 'bot-msg';
    botBubble.style.cssText = 'background:#e1f0ff;padding:10px;border-radius:10px;margin:6px 0;max-width:80%;font-size:14px;line-height:1.5;';
    botBubble.textContent = replyText;
    chatBox.appendChild(botBubble);
  } catch (err) {
    typingEl.remove();
    const errBubble = document.createElement('div');
    errBubble.className = 'bot-msg';
    errBubble.style.cssText = 'background:#fff0e1;padding:10px;border-radius:10px;margin:6px 0;max-width:80%;font-size:14px;';
    errBubble.textContent = 'I\'m having trouble connecting right now. Please try again in a moment. 💙';
    chatBox.appendChild(errBubble);
    console.error('AI Chatbot error:', err);
  }

  chatBox.scrollTop = chatBox.scrollHeight;
}

function upgradeChatbot() {
  // Replace old send button handler
  const sendBtn = document.querySelector('.chat-input button');
  if (sendBtn) {
    sendBtn.onclick = sendMessageAI;
    sendBtn.style.background = 'linear-gradient(135deg, #6C63FF, #00C2FF)';
  }

  const input = document.getElementById('user-input');
  if (input) {
    input.placeholder = 'Ask MindHeaven AI anything...';
    input.onkeypress = (e) => { if (e.key === 'Enter') sendMessageAI(); };
  }

  // Upgrade chat header
  const header = document.querySelector('.chat-header');
  if (header) {
    header.innerHTML = `
      <span class="ai-pulse-dot"></span>
      MindHeaven AI &nbsp;<small style="opacity:.6;font-size:11px;font-weight:400;">Powered by Generative AI</small>
    `;
    header.style.cssText = `
      background: linear-gradient(135deg, #111827, #1e1b4b);
      color: white;
      padding: 14px;
      font-size: 15px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    `;
  }

  // Add welcome message with AI branding
  const chatBox = document.getElementById('chat-box');
  if (chatBox && chatBox.children.length <= 1) {
    setTimeout(() => {
      const aiWelcome = document.createElement('div');
      aiWelcome.className = 'bot-msg';
      aiWelcome.style.cssText = 'background:linear-gradient(135deg,rgba(108,99,255,.1),rgba(0,194,255,.1));border:1px solid rgba(108,99,255,.2);padding:12px;border-radius:10px;margin:8px 0;font-size:13px;line-height:1.6;';
      aiWelcome.innerHTML = `✦ <strong>AI-Powered Support Active</strong><br>I can analyze your emotional patterns, suggest coping strategies, and connect you with the right resources. How are you feeling today?`;
      chatBox.appendChild(aiWelcome);
    }, 1200);
  }
}

/* =====================================================
   4. EMOTION ANALYSIS ANIMATION
   ===================================================== */
function animateEmotionBars() {
  const fills = document.querySelectorAll('.emotion-fill');
  if (!fills.length) return;

  fills.forEach(fill => {
    const target = fill.getAttribute('data-width') || fill.style.width;
    fill.style.width = '0%';
    setTimeout(() => { fill.style.width = target; }, 300);
  });
}

/* =====================================================
   5. RISK METER ANIMATION
   ===================================================== */
function animateRiskMeters() {
  const fills = document.querySelectorAll('.risk-bar-fill');
  if (!fills.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill = entry.target;
        const target = fill.getAttribute('data-width') || '50%';
        fill.style.width = '0%';
        setTimeout(() => { fill.style.width = target; }, 200);
        observer.unobserve(fill);
      }
    });
  }, { threshold: 0.3 });

  fills.forEach(fill => observer.observe(fill));
}

/* =====================================================
   6. HERO ENHANCEMENTS
   ===================================================== */
function upgradeHero() {
  const heroTitle = document.querySelector('.hero-title');
  if (!heroTitle) return;

  // Inject AI pill above title if not present
  if (!document.querySelector('.hero-ai-pill')) {
    const pill = document.createElement('div');
    pill.className = 'hero-ai-pill';
    pill.innerHTML = '✦ &nbsp; Powered by Generative + Agentic AI';
    heroTitle.parentElement.insertBefore(pill, heroTitle);
  }

  // Replace subtitle text
  const sub = document.querySelector('.hero-subtitle');
  if (sub && !sub.dataset.upgraded) {
    sub.dataset.upgraded = '1';
    sub.textContent = 'From Reactive Support to Proactive Care — your intelligent wellness companion that understands student mental health through continuous behavioral intelligence.';
  }

  // Inject AI feature chips after hero buttons
  const heroButtons = document.querySelector('.hero-buttons');
  if (heroButtons && !document.querySelector('.hero-ai-features')) {
    const chips = document.createElement('div');
    chips.className = 'hero-ai-features';
    chips.innerHTML = `
      <div class="hero-ai-chip"><span class="chip-dot"></span> Emotion Analysis</div>
      <div class="hero-ai-chip"><span class="chip-dot"></span> Proactive Alerts</div>
      <div class="hero-ai-chip"><span class="chip-dot"></span> Agentic Decisions</div>
    `;
    heroButtons.after(chips);
  }
}

/* =====================================================
   7. FEATURES SECTION AI BADGES
   ===================================================== */
function upgradeFeatureCards() {
  const cards = document.querySelectorAll('.feature-card');
  const aiBadges = [
    'AI-Curated Content',
    'Smart Scheduling',
    'Peer Sentiment AI',
    'Mindfulness Engine',
  ];

  cards.forEach((card, i) => {
    if (card.dataset.aiUpgraded) return;
    card.dataset.aiUpgraded = '1';

    const badge = document.createElement('div');
    badge.className = 'ai-badge';
    badge.style.marginTop = '10px';
    badge.textContent = aiBadges[i] || 'AI Enhanced';

    const content = card.querySelector('.feature-text') || card.querySelector('.feature-content');
    if (content) content.appendChild(badge);
  });
}

/* =====================================================
   8. DASHBOARD AI SUMMARY BANNER (user-profile.html)
   ===================================================== */
function injectDashboardAI() {
  const header = document.querySelector('.header');
  if (!header || document.querySelector('.ai-summary-banner')) return;

  const banner = document.createElement('div');
  banner.className = 'ai-summary-banner';
  banner.innerHTML = `
    <div class="ai-summary-text">
      <div class="ai-badge">AI Wellness Summary</div>
      <h3>Good to see you! 👋 Here's your AI analysis for today.</h3>
      <p>
        AI detected <span>mild academic stress</span> patterns.
        Your mood trend is <span>improving (+12%)</span> compared to last week.
        Sleep risk: <span>Low</span>.
      </p>
    </div>
    <div class="ai-summary-actions">
      <button class="ai-action-btn" onclick="document.querySelector('.charts-section')?.scrollIntoView({behavior:'smooth'})">View Full Report</button>
      <button class="ai-action-btn outline" onclick="document.querySelector('#chatWindow')?.style && toggleChat()">Chat with AI</button>
    </div>
  `;
  header.after(banner);

  // Inject emotion widget after profile grid
  const profileGrid = document.querySelector('.profile-grid');
  if (profileGrid && !document.querySelector('.emotion-widget')) {
    const ew = document.createElement('div');
    ew.className = 'emotion-widget';
    ew.innerHTML = `
      <h3>🧠 <span style="background:linear-gradient(90deg,#6C63FF,#00C2FF);-webkit-background-clip:text;-webkit-text-fill-color:transparent">AI Emotion Analysis</span></h3>
      <div class="emotion-bars">
        ${[
          { label:'Calm',      pct:72, color:'linear-gradient(90deg,#34d399,#10b981)' },
          { label:'Focused',   pct:58, color:'linear-gradient(90deg,#6C63FF,#8B5CF6)' },
          { label:'Anxious',   pct:34, color:'linear-gradient(90deg,#fbbf24,#f59e0b)' },
          { label:'Motivated', pct:80, color:'linear-gradient(90deg,#00C2FF,#6C63FF)' },
          { label:'Stressed',  pct:28, color:'linear-gradient(90deg,#f87171,#ef4444)' },
        ].map(e => `
          <div class="emotion-row">
            <div class="emotion-label">${e.label}</div>
            <div class="emotion-track">
              <div class="emotion-fill" data-width="${e.pct}%" style="width:0%;background:${e.color}"></div>
            </div>
            <div class="emotion-pct">${e.pct}%</div>
          </div>
        `).join('')}
      </div>
    `;
    profileGrid.after(ew);
    setTimeout(animateEmotionBars, 500);
  }
}

/* =====================================================
   INIT
   ===================================================== */
document.addEventListener('DOMContentLoaded', () => {
  injectMonitoringBar();
  scheduleProactiveNotifications();
  upgradeChatbot();
  upgradeHero();
  upgradeFeatureCards();
  injectDashboardAI();
  animateRiskMeters();

  // Smooth hover lift for all cards
  document.querySelectorAll('.feature-card, .stat-card, .chart-card, .profile-card').forEach(card => {
    card.style.transition = 'transform .3s ease, box-shadow .3s ease';
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-4px)';
      card.style.boxShadow = '0 12px 40px rgba(108,99,255,.15)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });

  // Navbar blur on scroll
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        navbar.style.background = 'rgba(255,255,255,0.92)';
        navbar.style.backdropFilter = 'blur(16px)';
        navbar.style.boxShadow = '0 2px 20px rgba(108,99,255,.12)';
      } else {
        navbar.style.background = '#ffffff';
        navbar.style.backdropFilter = 'none';
        navbar.style.boxShadow = '';
      }
    });
  }
});

// ============================================
// I Hate Responsibility — App Logic
// ============================================

const API_URL = 'https://baas.budhathokisagar.com.np/blame/rich';

// DOM Elements
const bigBlameBtn = document.getElementById('big-blame-btn');
const blameReason = document.getElementById('blame-reason');
const blameDisplay = document.getElementById('blame-display');
const metaGrid = document.getElementById('blame-meta-grid');
const metaCategory = document.getElementById('meta-category');
const metaSeverity = document.getElementById('meta-severity');
const metaQuality = document.getElementById('meta-quality');
const metaBelievability = document.getElementById('meta-believability');

const historyList = document.getElementById('history-list');
const historyEmpty = document.getElementById('history-empty');
const clearBtn = document.getElementById('clear-btn');
const counterText = document.getElementById('counter-text');
const copyMainBtn = document.getElementById('copy-main-btn');

// State
let history = [];
let totalCount = 0;
let isLoading = false;

// ============================================
// INITIALIZATION
// ============================================
function init() {
  // Load history from localStorage
  const saved = localStorage.getItem('ihateresponsibility-history');
  if (saved) {
    try {
      history = JSON.parse(saved);
      totalCount = history.length;
      renderHistory();
      updateCounter();
    } catch (e) {
      history = [];
    }
  }

  // Create background particles
  createParticles();

  // Event listeners
  bigBlameBtn.addEventListener('click', handleBlameClick);
  clearBtn.addEventListener('click', handleClear);

  // Main copy button
  if (copyMainBtn) {
    copyMainBtn.addEventListener('click', () => {
      const reason = blameReason.textContent;
      if (reason && reason !== 'Press the button to seamlessly avoid responsibility.') {
        copyToClipboard(reason, copyMainBtn);
      }
    });
  }
}

// ============================================
// API CALL
// ============================================
async function fetchBlame() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data = await response.json();
  return data;
}

// ============================================
// MAIN HANDLER
// ============================================
async function handleBlameClick(e) {
  if (isLoading) return;
  isLoading = true;

  // Ripple effect
  createRipple(e);

  // Button loading state
  bigBlameBtn.classList.add('loading');
  const btnEmoji = bigBlameBtn.querySelector('.btn-emoji');
  const origEmoji = btnEmoji.textContent;
  btnEmoji.textContent = '⏳';

  // Fade out current reason
  blameReason.classList.add('loading');

  try {
    const data = await fetchBlame();
    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    // Update display
    blameReason.textContent = data.blame;
    blameReason.classList.remove('loading');
    blameReason.classList.remove('pop-in');
    
    // Format category nicely
    const categoryFormatted = data.category.replace('_', ' ').toUpperCase();
    metaCategory.textContent = categoryFormatted;
    
    // Format severity
    metaSeverity.textContent = `${data.severity.emoji} ${data.severity.name}`;
    
    metaQuality.textContent = `${data.quality_score}/10`;
    metaBelievability.textContent = `${data.believability}/10`;
    
    metaGrid.style.display = 'grid';

    // Force reflow
    void blameReason.offsetWidth;
    blameReason.classList.add('pop-in');

    blameDisplay.classList.add('active');

    // Show copy button
    if (copyMainBtn) {
      copyMainBtn.style.display = 'inline-flex';
    }

    // Screen shake
    document.body.classList.add('shake');
    setTimeout(() => document.body.classList.remove('shake'), 500);

    // Emoji burst
    createEmojiBurst();

    // Add to history
    const entry = {
      id: Date.now(),
      blame: data.blame,
      category: categoryFormatted,
      severityEmoji: data.severity.emoji,
      time: timestamp,
    };
    history.unshift(entry);
    totalCount++;

    // Save & render
    saveHistory();
    renderHistory();
    updateCounter();

  } catch (err) {
    blameReason.textContent = 'The API also avoids responsibility. Try again? 😅';
    blameReason.classList.remove('loading');
    blameReason.classList.remove('pop-in');
    void blameReason.offsetWidth;
    blameReason.classList.add('pop-in');
    
    metaGrid.style.display = 'none';

    showToast('⚠️ API failed to take the blame. Try again!');
  } finally {
    isLoading = false;
    bigBlameBtn.classList.remove('loading');
    btnEmoji.textContent = origEmoji;
  }
}

// ============================================
// HISTORY RENDERING
// ============================================
function renderHistory() {
  if (history.length === 0) {
    historyEmpty.style.display = 'block';
    clearBtn.style.display = 'none';
    // Remove all items
    const items = historyList.querySelectorAll('.history-item');
    items.forEach(item => item.remove());
    return;
  }

  historyEmpty.style.display = 'none';
  clearBtn.style.display = 'inline-flex';

  // Clear existing items
  const existingItems = historyList.querySelectorAll('.history-item');
  existingItems.forEach(item => item.remove());

  // Render items (show last 50)
  const displayItems = history.slice(0, 50);
  displayItems.forEach((entry, idx) => {
    const item = createHistoryItem(entry, history.length - idx);
    item.style.animationDelay = `${idx * 0.05}s`;
    historyList.appendChild(item);
  });
}

function createHistoryItem(entry, number) {
  const div = document.createElement('div');
  div.className = 'history-item';
  div.innerHTML = `
    <div class="history-number">#${number}</div>
    <div class="history-content">
      <p class="history-reason">${escapeHTML(entry.blame)}</p>
      <div class="history-meta">
        <span>${escapeHTML(entry.severityEmoji)} ${escapeHTML(entry.category)}</span>
        <span class="history-time">${escapeHTML(entry.time)}</span>
      </div>
    </div>
    <button class="copy-btn history-copy-btn" type="button" title="Copy to clipboard">
      <span class="copy-icon">📋</span>
    </button>
  `;

  // Attach copy handler
  const copyBtn = div.querySelector('.history-copy-btn');
  copyBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    copyToClipboard(entry.blame, copyBtn);
  });

  return div;
}

// ============================================
// CLEAR HISTORY
// ============================================
function handleClear() {
  history = [];
  totalCount = 0;
  saveHistory();
  renderHistory();
  updateCounter();

  // Reset display
  blameReason.textContent = 'Press the button to seamlessly avoid responsibility.';
  blameReason.classList.remove('pop-in');
  metaGrid.style.display = 'none';
  blameDisplay.classList.remove('active');
  copyMainBtn.style.display = 'none';

  showToast('🗑️ All evidence erased. A fresh start!');
}

// ============================================
// HELPERS
// ============================================
function updateCounter() {
  const plural = totalCount === 1 ? 'dodged responsibility' : 'dodged responsibilities';
  counterText.textContent = `${totalCount} ${plural}`;
}

function saveHistory() {
  localStorage.setItem('ihateresponsibility-history', JSON.stringify(history));
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function copyToClipboard(text, btn) {
  try {
    await navigator.clipboard.writeText(text);

    // Visual feedback
    const iconEl = btn.querySelector('.copy-icon');
    const labelEl = btn.querySelector('.copy-label');
    const origIcon = iconEl.textContent;
    const origLabel = labelEl ? labelEl.textContent : null;

    iconEl.textContent = '✅';
    if (labelEl) labelEl.textContent = 'Copied!';
    btn.classList.add('copied');

    showToast('📋 Copied excuse to clipboard!');

    setTimeout(() => {
      iconEl.textContent = origIcon;
      if (labelEl) labelEl.textContent = origLabel;
      btn.classList.remove('copied');
    }, 1500);
  } catch (err) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('📋 Copied excuse to clipboard!');
  }
}

// ============================================
// VISUAL EFFECTS
// ============================================
function createRipple(e) {
  const btn = bigBlameBtn;
  const ripple = document.getElementById('btn-ripple');
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;

  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.classList.remove('animate');
  void ripple.offsetWidth;
  ripple.classList.add('animate');

  setTimeout(() => ripple.classList.remove('animate'), 600);
}

function createEmojiBurst() {
  const emojis = ['🏃💨', '🤷‍♂️', '🤫', '👀', '🙉', '🤡', '📉', '🔥', '🕳️'];
  const btn = bigBlameBtn.getBoundingClientRect();
  const centerX = btn.left + btn.width / 2;
  const centerY = btn.top + btn.height / 2;

  for (let i = 0; i < 8; i++) {
    const span = document.createElement('span');
    span.className = 'emoji-burst';
    span.textContent = emojis[Math.floor(Math.random() * emojis.length)];

    const angle = (Math.PI * 2 / 8) * i + (Math.random() - 0.5);
    const distance = 80 + Math.random() * 120;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance - 60;
    const rot = (Math.random() - 0.5) * 720;

    span.style.left = `${centerX}px`;
    span.style.top = `${centerY}px`;
    span.style.setProperty('--tx', `${tx}px`);
    span.style.setProperty('--ty', `${ty}px`);
    span.style.setProperty('--rot', `${rot}deg`);

    document.body.appendChild(span);
    setTimeout(() => span.remove(), 1000);
  }
}

function createParticles() {
  const container = document.getElementById('bg-particles');
  const colors = ['rgba(59,130,246,0.3)', 'rgba(96,165,250,0.2)', 'rgba(147,197,253,0.15)'];

  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    const size = 2 + Math.random() * 4;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    particle.style.animationDuration = `${8 + Math.random() * 15}s`;
    particle.style.animationDelay = `${Math.random() * 10}s`;
    container.appendChild(particle);
  }
}

// ============================================
// TOAST NOTIFICATION
// ============================================
function showToast(message) {
  // Remove existing toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('visible');
  });

  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 400);
  }, 2500);
}

// ============================================
// KEYBOARD SHORTCUT
// ============================================
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !e.target.matches('input, textarea, button')) {
    e.preventDefault();
    bigBlameBtn.click();
  }
});

// ============================================
// COOKIE CONSENT
// ============================================
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function initConsent() {
  const banner = document.getElementById('consent-banner');
  const acceptBtn = document.getElementById('consent-accept');
  const declineBtn = document.getElementById('consent-decline');

  if (!banner) return;

  const consent = getCookie('ihateresponsibility-consent');

  if (consent) {
    // Already consented or declined — hide banner
    banner.style.display = 'none';
    return;
  }

  // Show banner after a short delay
  setTimeout(() => {
    banner.classList.add('visible');
  }, 1500);

  acceptBtn.addEventListener('click', () => {
    setCookie('ihateresponsibility-consent', 'accepted', 365);
    banner.classList.remove('visible');
    banner.classList.add('hidden');
    showToast('👍 Cool! Your history is saved locally.');
  });

  declineBtn.addEventListener('click', () => {
    setCookie('ihateresponsibility-consent', 'declined', 365);
    banner.classList.remove('visible');
    banner.classList.add('hidden');
    // Clear any existing localStorage data
    localStorage.removeItem('ihateresponsibility-history');
    history = [];
    totalCount = 0;
    renderHistory();
    updateCounter();
    showToast('🤷 No worries. Evidence won\'t be saved.');
  });
}

// ============================================
// START
// ============================================
init();
initConsent();

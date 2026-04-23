// ============================================
// I Hate Responsibility — App Logic v3
// ============================================

const API_BASE = 'https://baas.budhathokisagar.com.np';
const PROXY = (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`;

const CATEGORY_META = {
  cosmic:'🌌', technical:'💻', management:'📋', team:'👥',
  environmental:'🌿', legacy:'📜', user:'👤', ai_modern:'🤖',
  cloud:'☁️', security:'🔒'
};

// DOM refs
const bigBtn = document.getElementById('big-blame-btn');
const btnEmoji = document.getElementById('btn-emoji');
const btnText = document.getElementById('btn-text');
const btnSub = document.getElementById('btn-subtitle');
const blameReason = document.getElementById('blame-reason');
const blameDisplay = document.getElementById('blame-display');
const metaGrid = document.getElementById('blame-meta-grid');
const metaCat = document.getElementById('meta-category');
const metaSev = document.getElementById('meta-severity');
const metaQual = document.getElementById('meta-quality');
const metaBel = document.getElementById('meta-believability');
const asciiDisplay = document.getElementById('ascii-display');
const asciiArt = document.getElementById('ascii-art');
const rouletteDisplay = document.getElementById('roulette-display');
const rouletteResults = document.getElementById('roulette-results');
const historyList = document.getElementById('history-list');
const historyEmpty = document.getElementById('history-empty');
const clearBtn = document.getElementById('clear-btn');
const counterText = document.getElementById('counter-text');
const copyMainBtn = document.getElementById('copy-main-btn');
const copyAsciiBtn = document.getElementById('copy-ascii-btn');
const optionsPanel = document.getElementById('options-panel');
const rouletteSlider = document.getElementById('roulette-count');
const rouletteLabel = document.getElementById('roulette-count-label');

let history = [], totalCount = 0, isLoading = false, currentMode = 'random';
let selectedCategory = 'cosmic', selectedSeverity = 'minor', selectedAsciiStyle = 'box';

// ============================================
// INIT
// ============================================
function init() {
  const saved = localStorage.getItem('ihr-history');
  if (saved) { try { history = JSON.parse(saved); totalCount = history.length; renderHistory(); updateCounter(); } catch(e) { history=[]; } }
  createParticles();
  bigBtn.addEventListener('click', handleGenerate);
  clearBtn.addEventListener('click', handleClear);
  if (copyMainBtn) copyMainBtn.addEventListener('click', () => { const t = blameReason.textContent; if (t && !t.startsWith('Press the')) copyToClipboard(t, copyMainBtn); });
  if (copyAsciiBtn) copyAsciiBtn.addEventListener('click', () => { if (asciiArt.textContent) copyToClipboard(asciiArt.textContent, copyAsciiBtn); });
  if (rouletteSlider) rouletteSlider.addEventListener('input', () => { rouletteLabel.textContent = rouletteSlider.value; });

  // Mode tabs
  document.querySelectorAll('.mode-tab').forEach(tab => {
    tab.addEventListener('click', () => switchMode(tab.dataset.mode));
  });

  // Build category chips
  buildCategoryChips();

  // Chip click delegation
  document.querySelectorAll('.chip-grid').forEach(grid => {
    grid.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      grid.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      if (chip.dataset.severity) selectedSeverity = chip.dataset.severity;
      if (chip.dataset.category) selectedCategory = chip.dataset.category;
      if (chip.dataset.style) selectedAsciiStyle = chip.dataset.style;
    });
  });
}

function buildCategoryChips() {
  const container = document.getElementById('category-chips');
  if (!container) return;
  Object.entries(CATEGORY_META).forEach(([key, emoji], i) => {
    const btn = document.createElement('button');
    btn.className = 'chip' + (i === 0 ? ' active' : '');
    btn.dataset.category = key;
    btn.textContent = `${emoji} ${key.replace('_',' ')}`;
    container.appendChild(btn);
  });
}

// ============================================
// MODE SWITCHING
// ============================================
function switchMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.mode-tab').forEach(t => t.classList.toggle('active', t.dataset.mode === mode));

  // Show/hide option groups
  const groups = { category:'opt-category', severity:'opt-severity', roulette:'opt-roulette', ascii:'opt-ascii' };
  const hasOptions = ['category','severity','roulette','ascii'].includes(mode);
  optionsPanel.style.display = hasOptions ? 'block' : 'none';
  Object.values(groups).forEach(id => { const el = document.getElementById(id); if(el) el.style.display = 'none'; });
  if (groups[mode]) { const el = document.getElementById(groups[mode]); if(el) el.style.display = 'block'; }

  // Show/hide display areas
  blameDisplay.style.display = (mode === 'ascii' || mode === 'roulette') ? 'none' : 'block';
  asciiDisplay.style.display = mode === 'ascii' ? 'block' : 'none';
  rouletteDisplay.style.display = mode === 'roulette' ? 'block' : 'none';

  // Update button text
  const labels = { random:['🏃💨','IT WASN\'T ME','generate excuse'], category:['🗂️','BLAME BY CATEGORY','pick & generate'], severity:['📊','BLAME BY SEVERITY','pick & generate'], roulette:['🎰','SPIN THE ROULETTE','multiple excuses'], ascii:['🎨','GET ASCII ART','generate art'] };
  const [em, txt, sub] = labels[mode] || labels.random;
  btnEmoji.textContent = em; btnText.textContent = txt; btnSub.textContent = sub;
}

// ============================================
// API FETCH (with CORS proxy fallback)
// ============================================
async function apiFetch(path) {
  // Add cache-busting param so CORS proxies don't serve stale results
  const sep = path.includes('?') ? '&' : '?';
  const fullUrl = API_BASE + path + sep + '_t=' + Date.now();

  // Try direct first, then proxy
  for (const urlFn of [u => u, PROXY]) {
    try {
      const r = await fetch(urlFn(fullUrl), {
        signal: AbortSignal.timeout(8000),
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (r.ok) { const ct = r.headers.get('content-type') || ''; return ct.includes('json') ? await r.json() : await r.text(); }
    } catch(_) {}
  }
  throw new Error('API unreachable');
}

// ============================================
// MAIN HANDLER
// ============================================
async function handleGenerate(e) {
  if (isLoading) return;
  isLoading = true;
  createRipple(e);
  bigBtn.classList.add('loading');
  const origEmoji = btnEmoji.textContent;
  btnEmoji.textContent = '⏳';

  try {
    if (currentMode === 'roulette') await handleRoulette();
    else if (currentMode === 'ascii') await handleAscii();
    else await handleSingle();
    document.body.classList.add('shake');
    setTimeout(() => document.body.classList.remove('shake'), 500);
    createEmojiBurst();
  } catch(err) {
    showToast('⚠️ API failed to take the blame. Try again!');
    if (currentMode !== 'roulette' && currentMode !== 'ascii') {
      blameReason.textContent = 'The API also avoids responsibility. Try again? 😅';
      blameReason.classList.remove('loading','pop-in');
      void blameReason.offsetWidth;
      blameReason.classList.add('pop-in');
    }
  } finally {
    isLoading = false;
    bigBtn.classList.remove('loading');
    btnEmoji.textContent = origEmoji;
  }
}

async function handleSingle() {
  blameReason.classList.add('loading');
  let path = '/blame/rich';
  if (currentMode === 'category') path = `/blame/category/${selectedCategory}`;
  else if (currentMode === 'severity') path = `/blame/severity/${selectedSeverity}`;

  const data = await apiFetch(path);
  const ts = new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true});

  blameReason.textContent = data.blame;
  blameReason.classList.remove('loading','pop-in');
  void blameReason.offsetWidth;
  blameReason.classList.add('pop-in');
  blameDisplay.classList.add('active');

  // Show meta
  const cat = (data.category||'unknown').replace(/_/g,' ').toUpperCase();
  const sevObj = typeof data.severity === 'object' ? data.severity : {emoji:sevEmoji(data.severity),name:(data.severity||'').toUpperCase()};
  metaCat.textContent = `${CATEGORY_META[data.category]||'❓'} ${cat}`;
  metaSev.textContent = `${sevObj.emoji} ${sevObj.name}`;
  metaQual.textContent = data.quality_score ? `${data.quality_score}/10` : '—';
  metaBel.textContent = data.believability ? `${data.believability}/10` : '—';
  metaGrid.style.display = 'grid';
  if (copyMainBtn) copyMainBtn.style.display = 'inline-flex';

  addToHistory({ blame:data.blame, category:cat, severityEmoji:sevObj.emoji, time:ts });
}

async function handleRoulette() {
  const count = rouletteSlider ? rouletteSlider.value : 5;
  const data = await apiFetch(`/blame/multiple?count=${count}`);
  const blames = data.blames || data;
  rouletteResults.innerHTML = '';
  (Array.isArray(blames) ? blames : []).forEach((item, i) => {
    const isStr = typeof item === 'string';
    const blame = isStr ? item : item.blame;
    const cat = isStr ? '' : (item.category || '');
    const sev = isStr ? '' : (typeof item.severity === 'string' ? item.severity : (item.severity?.level || ''));
    const catDisplay = cat ? `${CATEGORY_META[cat]||'❓'} ${cat.replace(/_/g,' ')}` : '';
    const sevDisplay = sev ? `${sevEmoji(sev)} ${sev}` : '';
    const metaParts = [catDisplay, sevDisplay].filter(Boolean).join(' · ');
    const div = document.createElement('div');
    div.className = 'roulette-item';
    div.style.animationDelay = `${i*0.08}s`;
    div.innerHTML = `<div class="ri-num">${i+1}</div><div class="ri-text">${escapeHTML(blame)}${metaParts ? `<div class="ri-meta">${metaParts}</div>` : ''}</div><button class="copy-btn ri-copy" type="button" title="Copy"><span class="copy-icon">📋</span></button>`;
    div.querySelector('.ri-copy').addEventListener('click', ev => { ev.stopPropagation(); copyToClipboard(blame, ev.currentTarget); });
    rouletteResults.appendChild(div);
    const ts = new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true});
    addToHistory({ blame, category:(cat||'roulette').replace(/_/g,' ').toUpperCase(), severityEmoji:sev ? sevEmoji(sev) : '🎰', time:ts }, false);
  });
  saveHistory(); renderHistory(); updateCounter();
}

async function handleAscii() {
  const data = await apiFetch(`/blame/ascii?style=${selectedAsciiStyle}`);
  const text = typeof data === 'string' ? data : (data.ascii || data.art || JSON.stringify(data,null,2));
  asciiArt.textContent = text;
  if (copyAsciiBtn) copyAsciiBtn.style.display = 'inline-flex';

  // Extract a readable line from the ASCII art for history
  const lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.match(/^[─│┌┐└┘╔╗╚╝═║\-+|*#=_\\\/\[\]<>^]+$/));
  const blameText = lines[0] || `ASCII Art (${selectedAsciiStyle})`;
  const ts = new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true});
  addToHistory({ blame: `🎨 ${blameText}`, category: `ASCII · ${selectedAsciiStyle.toUpperCase()}`, severityEmoji: '🎨', time: ts });
}

function sevEmoji(s) { return {minor:'🟢',moderate:'🟡',catastrophic:'🔴'}[s]||'🟠'; }

// ============================================
// HISTORY
// ============================================
function addToHistory(entry, doRender = true) {
  history.unshift({ id:Date.now()+Math.random(), ...entry });
  totalCount++;
  if (doRender) { saveHistory(); renderHistory(); updateCounter(); }
}

function renderHistory() {
  if (!history.length) { historyEmpty.style.display='block'; clearBtn.style.display='none'; historyList.querySelectorAll('.history-item').forEach(i=>i.remove()); return; }
  historyEmpty.style.display='none'; clearBtn.style.display='inline-flex';
  historyList.querySelectorAll('.history-item').forEach(i=>i.remove());
  history.slice(0,50).forEach((e,idx) => {
    const div = document.createElement('div');
    div.className='history-item'; div.style.animationDelay=`${idx*.04}s`;
    div.innerHTML=`<div class="history-number">#${history.length-idx}</div><div class="history-content"><p class="history-reason">${escapeHTML(e.blame)}</p><div class="history-meta"><span>${e.severityEmoji||''} ${escapeHTML(e.category||'')}</span><span class="history-time">${escapeHTML(e.time||'')}</span></div></div><button class="copy-btn history-copy-btn" title="Copy"><span class="copy-icon">📋</span></button>`;
    div.querySelector('.history-copy-btn').addEventListener('click', ev => { ev.stopPropagation(); copyToClipboard(e.blame, ev.currentTarget); });
    historyList.appendChild(div);
  });
}

function handleClear() {
  history=[]; totalCount=0; saveHistory(); renderHistory(); updateCounter();
  blameReason.textContent='Press the button to seamlessly avoid responsibility.';
  blameReason.classList.remove('pop-in'); metaGrid.style.display='none';
  blameDisplay.classList.remove('active');
  if(copyMainBtn) copyMainBtn.style.display='none';
  rouletteResults.innerHTML=''; asciiArt.textContent='';
  showToast('🗑️ All evidence erased!');
}

function updateCounter() { counterText.textContent=`${totalCount} ${totalCount === 1 ? 'responsibility' : 'responsibilities'} dodged`; }
function saveHistory() { localStorage.setItem('ihr-history', JSON.stringify(history)); }
function escapeHTML(s) { const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }

async function copyToClipboard(text, btn) {
  try { await navigator.clipboard.writeText(text); } catch(_) { const ta=document.createElement('textarea'); ta.value=text; ta.style.cssText='position:fixed;opacity:0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); }
  const ic=btn.querySelector('.copy-icon'), lb=btn.querySelector('.copy-label');
  const oi=ic?.textContent, ol=lb?.textContent;
  if(ic) ic.textContent='✅'; if(lb) lb.textContent='Copied!';
  btn.classList.add('copied'); showToast('📋 Copied!');
  setTimeout(()=>{ if(ic) ic.textContent=oi; if(lb) lb.textContent=ol; btn.classList.remove('copied'); },1500);
}

// ============================================
// VISUAL EFFECTS
// ============================================
function createRipple(e) {
  const rip=document.getElementById('btn-ripple'), rect=bigBtn.getBoundingClientRect();
  const sz=Math.max(rect.width,rect.height);
  rip.style.width=rip.style.height=sz+'px';
  rip.style.left=(e.clientX-rect.left-sz/2)+'px';
  rip.style.top=(e.clientY-rect.top-sz/2)+'px';
  rip.classList.remove('animate'); void rip.offsetWidth; rip.classList.add('animate');
  setTimeout(()=>rip.classList.remove('animate'),600);
}

function createEmojiBurst() {
  const emojis=['🏃💨','🤷','🤫','👀','🙉','🤡','📉','🔥','🕳️'];
  const rect=bigBtn.getBoundingClientRect(), cx=rect.left+rect.width/2, cy=rect.top+rect.height/2;
  for(let i=0;i<8;i++){
    const s=document.createElement('span'); s.className='emoji-burst';
    s.textContent=emojis[Math.floor(Math.random()*emojis.length)];
    const a=(Math.PI*2/8)*i+(Math.random()-.5), d=80+Math.random()*120;
    s.style.left=cx+'px'; s.style.top=cy+'px';
    s.style.setProperty('--tx',Math.cos(a)*d+'px');
    s.style.setProperty('--ty',(Math.sin(a)*d-60)+'px');
    s.style.setProperty('--rot',(Math.random()-.5)*720+'deg');
    document.body.appendChild(s); setTimeout(()=>s.remove(),1000);
  }
}

function createParticles() {
  const c=document.getElementById('bg-particles');
  const cols=['rgba(59,130,246,.3)','rgba(96,165,250,.2)','rgba(147,197,253,.15)'];
  for(let i=0;i<30;i++){
    const p=document.createElement('div'); p.className='particle';
    const sz=2+Math.random()*4;
    p.style.width=sz+'px'; p.style.height=sz+'px';
    p.style.left=Math.random()*100+'%';
    p.style.background=cols[Math.floor(Math.random()*cols.length)];
    p.style.animationDuration=(8+Math.random()*15)+'s';
    p.style.animationDelay=(Math.random()*10)+'s';
    c.appendChild(p);
  }
}

function showToast(msg) {
  document.querySelectorAll('.toast').forEach(t=>t.remove());
  const t=document.createElement('div'); t.className='toast'; t.textContent=msg;
  document.body.appendChild(t);
  requestAnimationFrame(()=>t.classList.add('visible'));
  setTimeout(()=>{ t.classList.remove('visible'); setTimeout(()=>t.remove(),400); },2500);
}

// Keyboard shortcut
document.addEventListener('keydown', e => { if(e.code==='Space'&&!e.target.matches('input,textarea,button')){e.preventDefault();bigBtn.click();} });

// ============================================
// CONSENT
// ============================================
function initConsent() {
  const banner=document.getElementById('consent-banner'), acc=document.getElementById('consent-accept'), dec=document.getElementById('consent-decline');
  if(!banner) return;
  const ck=document.cookie.match(/(^| )ihr-consent=([^;]+)/);
  if(ck){ banner.style.display='none'; return; }
  setTimeout(()=>banner.classList.add('visible'),1500);
  acc.addEventListener('click',()=>{ document.cookie=`ihr-consent=y;expires=${new Date(Date.now()+365*864e5).toUTCString()};path=/;SameSite=Lax`; banner.classList.remove('visible'); banner.classList.add('hidden'); showToast('👍 History saved locally.'); });
  dec.addEventListener('click',()=>{ document.cookie=`ihr-consent=n;expires=${new Date(Date.now()+365*864e5).toUTCString()};path=/;SameSite=Lax`; banner.classList.remove('visible'); banner.classList.add('hidden'); localStorage.removeItem('ihr-history'); history=[]; totalCount=0; renderHistory(); updateCounter(); showToast('🤷 No worries.'); });
}

init();
initConsent();

// ============================================
// RATE LIMIT BANNER
// ============================================
(function initRateLimitBanner() {
  const banner = document.getElementById('rate-limit-banner');
  const closeBtn = document.getElementById('rate-limit-close');
  if (!banner || !closeBtn) return;

  // Check if already dismissed this session
  if (sessionStorage.getItem('ihr-rate-limit-dismissed')) {
    banner.classList.add('dismissed');
    return;
  }

  closeBtn.addEventListener('click', () => {
    banner.classList.add('dismissed');
    sessionStorage.setItem('ihr-rate-limit-dismissed', '1');
  });
})();

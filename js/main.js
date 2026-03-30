'use strict';

/* ════════════════════════════════════════════
   THÈME
════════════════════════════════════════════ */
const savedTheme = localStorage.getItem('nx-theme') || 'dark';
applyTheme(savedTheme, false);

function applyTheme(t, save = true) {
  document.documentElement.setAttribute('data-theme', t);
  const btn = document.getElementById('theme-btn');
  if (btn) btn.textContent = t === 'dark' ? '🌙' : '☀️';
  if (save) localStorage.setItem('nx-theme', t);
}
function toggleTheme() {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(next);
}

/* ════════════════════════════════════════════
   LANGUE
════════════════════════════════════════════ */
let LANG = localStorage.getItem('nx-lang') || 'fr';
applyLang(LANG, false);

function setLang(l) { applyLang(l); localStorage.setItem('nx-lang', l); }
function applyLang(l, save = true) {
  LANG = l;
  document.documentElement.setAttribute('data-lang', l);
  document.querySelectorAll('[data-fr][data-en]').forEach(el => {
    el.textContent = el.getAttribute('data-' + l);
  });
  const btnFr = document.getElementById('btn-fr');
  const btnEn = document.getElementById('btn-en');
  if (btnFr) btnFr.classList.toggle('on', l === 'fr');
  if (btnEn) btnEn.classList.toggle('on', l === 'en');
  const inp = document.getElementById('wl-email');
  if (inp) inp.placeholder = l === 'fr' ? 'votre@email.com' : 'your@email.com';
  if (save) localStorage.setItem('nx-lang', l);
  updateWLCount();
  restartStream();
}

/* ════════════════════════════════════════════
   PARTICULES
════════════════════════════════════════════ */
const cvs = document.getElementById('cvs');
const cx  = cvs.getContext('2d');

function rsz() { cvs.width = innerWidth; cvs.height = innerHeight; }
rsz();
window.addEventListener('resize', rsz);

const DARK_COLS  = ['rgba(46,155,240,', 'rgba(232,160,32,', 'rgba(155,89,240,'];
const LIGHT_COLS = ['rgba(26,125,212,', 'rgba(184,120,10,', 'rgba(100,80,200,'];

class Pt {
  constructor() { this.reset(); }
  reset() {
    this.x  = Math.random() * cvs.width;
    this.y  = Math.random() * cvs.height;
    this.r  = Math.random() * 1.8 + 0.3;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.a  = Math.random() * 0.45 + 0.08;
    this.ph = Math.random() * Math.PI * 2;
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    const arr  = dark ? DARK_COLS : LIGHT_COLS;
    this.c = arr[Math.floor(Math.random() * arr.length)];
  }
  step() {
    this.x += this.vx; this.y += this.vy; this.ph += 0.015;
    if (this.x < 0 || this.x > cvs.width || this.y < 0 || this.y > cvs.height) this.reset();
  }
  draw() {
    const o = this.a * (0.6 + 0.4 * Math.sin(this.ph));
    cx.beginPath(); cx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    cx.fillStyle = this.c + o + ')'; cx.fill();
  }
}

const PTS = Array.from({ length: 100 }, () => new Pt());

function drawLines() {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  for (let i = 0; i < PTS.length; i++) {
    for (let j = i + 1; j < PTS.length; j++) {
      const dx = PTS[i].x - PTS[j].x;
      const dy = PTS[i].y - PTS[j].y;
      const d  = Math.hypot(dx, dy);
      if (d < 100) {
        cx.beginPath(); cx.moveTo(PTS[i].x, PTS[i].y); cx.lineTo(PTS[j].x, PTS[j].y);
        const a = (dark ? 0.1 : 0.06) * (1 - d / 100);
        cx.strokeStyle = dark ? `rgba(46,155,240,${a})` : `rgba(26,125,212,${a})`;
        cx.lineWidth = 0.5; cx.stroke();
      }
    }
  }
}

function loop() {
  cx.clearRect(0, 0, cvs.width, cvs.height);
  PTS.forEach(p => { p.step(); p.draw(); });
  drawLines();
  requestAnimationFrame(loop);
}
loop();

/* ════════════════════════════════════════════
   COUNTDOWN — 18 Juin 2026 à 17h00 WAT (UTC+1 = 16h00 UTC)
════════════════════════════════════════════ */
const LAUNCH = new Date(Date.UTC(2026, 5, 18, 16, 0, 0)); /* mois 0-indexé : 5 = Juin */
const pv = { d: -1, h: -1, m: -1, s: -1 };

function pad(n) { return String(n).padStart(2, '0'); }

function setDirect(key, val) {
  const face = document.getElementById('v-' + key);
  if (face) face.textContent = val;
}

function doFlip(key, val) {
  const box  = document.getElementById('fb-' + key);
  const face = document.getElementById('v-' + key);
  if (!box || !face) return;
  if (box.classList.contains('go')) { face.textContent = val; return; }
  box.classList.add('go');
  setTimeout(() => { face.textContent = val; }, 220);
  setTimeout(() => { box.classList.remove('go'); }, 450);
}

function calcDiff() {
  const diff = LAUNCH.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  };
}

function tick() {
  const v = calcDiff();
  if (!v) { ['d','h','m','s'].forEach(k => setDirect(k, '00')); return; }
  if (pv.d !== v.d) { doFlip('d', pad(v.d)); pv.d = v.d; }
  if (pv.h !== v.h) { doFlip('h', pad(v.h)); pv.h = v.h; }
  if (pv.m !== v.m) { doFlip('m', pad(v.m)); pv.m = v.m; }
  if (pv.s !== v.s) { doFlip('s', pad(v.s)); pv.s = v.s; }
}

/* Affichage immédiat sans animation */
(function initCountdown() {
  const v = calcDiff();
  if (!v) { ['d','h','m','s'].forEach(k => setDirect(k, '00')); return; }
  setDirect('d', pad(v.d));
  setDirect('h', pad(v.h));
  setDirect('m', pad(v.m));
  setDirect('s', pad(v.s));
  pv.d = v.d; pv.h = v.h; pv.m = v.m; pv.s = v.s;
})();

setInterval(tick, 1000);

/* ════════════════════════════════════════════
   STREAMING TERMINAL
════════════════════════════════════════════ */
const TEXTS = {
  fr: `Bonjour. Je suis NEXYA.

Je ne suis pas un simple chatbot. Je suis une plateforme IA nouvelle génération qui orchestre les meilleurs modèles au monde — GPT, Gemini, Qwen — pour vous offrir des réponses précises, contextuelles et personnalisées.

Besoin d'un expert ? J'ai 5 Modes Experts calibrés : Informatique pour déboguer votre code, Finance pour analyser vos investissements, Sciences pour vos recherches, Langues pour vos traductions, Cuisine pour vos recettes.

Vous voulez planifier une tâche IA pour demain à 7h ? Mon Prompt Scheduler l'exécute pendant que vous dormez.

Envoyez-moi une photo — j'analyse tout en temps réel. Parlez-moi — Whisper transcrit chaque mot. Créez avec moi — je génère images, vidéos et audios à la demande.

NEXYA. L'IA qui travaille pour vous, partout dans le monde. 🌍`,

  en: `Hello. I'm NEXYA.

I'm not just a chatbot. I'm a next-generation AI platform that orchestrates the world's best models — GPT, Gemini, Qwen — to deliver precise, contextual, and personalized responses.

Need an expert? I have 5 calibrated Expert Modes: Computer Science to debug your code, Finance to analyze your investments, Sciences for your research, Languages for translations, Cooking for your recipes.

Want to schedule an AI task for tomorrow at 7am? My Prompt Scheduler runs it while you sleep.

Send me a photo — I analyze everything in real time. Talk to me — Whisper transcribes every word. Create with me — I generate images, videos, and audio on demand.

NEXYA. The AI that works for you, everywhere in the world. 🌍`
};

let stTimer = null, stDone = false, stRunning = false;

function restartStream() {
  stDone = false; stRunning = false;
  const out = document.getElementById('stream-out');
  const cur = document.getElementById('stream-cur');
  if (out) out.textContent = '';
  if (cur) cur.style.display = 'inline-block';
  if (stTimer) { clearTimeout(stTimer); stTimer = null; }
  const el = document.getElementById('terminal-el');
  if (el) {
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight && r.bottom > 0) startStream();
  }
}

function startStream() {
  if (stDone || stRunning) return;
  stRunning = true;
  const text = TEXTS[LANG] || TEXTS.fr;
  const out  = document.getElementById('stream-out');
  if (!out) return;
  out.textContent = '';
  let i = 0;
  function type() {
    if (i < text.length) {
      out.textContent += text[i]; i++;
      const ch = text[i] || '';
      const d  = ch === '\n' ? 90 : Math.random() * 16 + 7;
      stTimer = setTimeout(type, d);
    } else {
      stDone = true;
      const cur = document.getElementById('stream-cur');
      if (cur) cur.style.display = 'none';
    }
  }
  setTimeout(type, 600);
}

const termEl = document.getElementById('terminal-el');
if ('IntersectionObserver' in window && termEl) {
  new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) startStream(); });
  }, { threshold: 0.15 }).observe(termEl);
}

/* ════════════════════════════════════════════
   SCROLL REVEAL — éléments génériques (.rv, .feat-card, .orb-card)
════════════════════════════════════════════ */
if ('IntersectionObserver' in window) {
  const revObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('vis');
        revObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.06 });

  document.querySelectorAll('.rv, .feat-card, .orb-card').forEach(el => revObs.observe(el));
}

/* Les cartes expert sont visibles via CSS pur — aucun JS nécessaire */

/* ════════════════════════════════════════════
   TILT 3D AU SURVOL DES CARTES EXPERT
════════════════════════════════════════════ */
document.querySelectorAll('.exp-rect').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `translateY(-4px) rotateX(${-y * 3}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ════════════════════════════════════════════
   WAITLIST
════════════════════════════════════════════ */
function updateWLCount() {
  const stored = JSON.parse(localStorage.getItem('nx-wl') || '[]');
  const el = document.getElementById('wl-count');
  if (!el) return;
  const n = 847 + stored.length;
  el.innerHTML = LANG === 'fr'
    ? `<strong>${n}</strong> personnes sont déjà inscrites.`
    : `<strong>${n}</strong> people are already signed up.`;
}
updateWLCount();

function submitWL(e) {
  e.preventDefault();
  const email = document.getElementById('wl-email').value.trim();
  if (!email) return;
  const stored = JSON.parse(localStorage.getItem('nx-wl') || '[]');
  if (!stored.includes(email)) {
    stored.push(email);
    localStorage.setItem('nx-wl', JSON.stringify(stored));
  }
  const form = document.querySelector('#wl-wrap form');
  if (form) form.style.display = 'none';
  const ok  = document.getElementById('wl-ok');
  const msg = document.getElementById('wl-ok-msg');
  if (ok)  ok.style.display = 'block';
  if (msg) msg.textContent = LANG === 'fr'
    ? '✅ Parfait ! Vous serez notifié le 18 Juin 2026 à 17h00.'
    : "✅ Perfect! You'll be notified on June 18, 2026 at 5:00 PM.";
  updateWLCount();
}

/* ════════════════════════════════════════════
   SMOOTH SCROLL
════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
  });
});

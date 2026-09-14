/* ============================================================
   EXPERIÊNCIAS & GASTRONOMIA — main.js
   CONFIG → hero scroll → reveal → WhatsApp/pixel
   ============================================================ */

const CONFIG = {
  whatsappNumber: '5511995418701', // ← trocar se necessário
  baseMessage: 'Olá! Vim do site da Experiências & Gastronomia e gostaria de saber mais sobre os kits corporativos.',
};

/* ---------- WhatsApp URL builder (mensagem limpa, sem tags) ---------- */
function buildWhatsappUrl() {
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(CONFIG.baseMessage)}`;
}
document.querySelectorAll('[data-whatsapp]').forEach((link) => {
  link.href = buildWhatsappUrl();
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.addEventListener('click', () => {
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'Lead', {
        content_name: document.title,
        cta_source: link.getAttribute('data-cta-source') || 'unknown',
      });
    }
  });
});

/* ---------- Header scrolled ---------- */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('is-scrolled', window.scrollY > 40);
}, { passive: true });

/* ============================================================
   HERO — scroll-driven steps
   A hero tem 400vh; o vídeo/gráfico fica sticky em 100vh.
   Conforme o scroll avança, os textos trocam (4 passos).
   ============================================================ */
(function heroCaptions() {
  const hero = document.getElementById('hero');
  const caps = Array.from(document.querySelectorAll('.hero__cap'));
  if (!hero || caps.length === 0) return;

  let current = -1;
  function update() {
    const rect = hero.getBoundingClientRect();
    const total = hero.offsetHeight - window.innerHeight;
    const progress = Math.min(1, Math.max(0, -rect.top / total));
    const idx = Math.min(caps.length - 1, Math.floor(progress * caps.length * 0.999));
    if (idx !== current) {
      caps.forEach((c, i) => c.classList.toggle('is-active', i === idx));
      current = idx;
      if (idx === caps.length - 1 && typeof window.fbq === 'function') {
        window.fbq('track', 'ViewContent', { content_name: 'Hero final CTA' });
      }
    }
  }
  update();
  window.__heroCapUpdate = update; // rAF loop compartilhado
})();

/* ---- vinheta esfumaçada: engrossa nos últimos 15% do scroll da hero ---- */
(function heroFade() {
  const hero = document.getElementById('hero');
  const fade = document.querySelector('.hero__fade');
  if (!hero || !fade) return;
  function updateFade() {
    const rect = hero.getBoundingClientRect();
    const total = hero.offsetHeight - window.innerHeight;
    const progress = Math.min(1, Math.max(0, -rect.top / total));
    // 0 até 90% do scroll, depois sobe até 1
    const t = Math.min(1, Math.max(0, (progress - 0.9) / 0.1));
    fade.style.opacity = String(t);
  }
  updateFade();
  window.__heroFadeUpdate = updateFade;
})();

/* ============================================================
   HERO — SCROLL MOTION (frame sequence scrubbed pelo scroll)
   48 frames do vídeo mapeados na altura da hero (400vh).
   O scroll "dá play" no vídeo: cada px rolado avança frames.
   Pré-carrega progressivamente; começa assim que o 1º frame chega.
   ============================================================ */
(function heroScrollMotion() {
  const hero = document.getElementById('hero');
  const stage = document.getElementById('heroFrames');
  const fallback = document.getElementById('heroVideoFallback');
  // escolhe o conjunto: mobile (<= 720px) usa frames verticais, PC usa horizontais
  const isMobile = window.matchMedia('(max-width: 720px)').matches;
  const FRAMES_SET = (isMobile && typeof FRAMES_MOBILE !== 'undefined') ? FRAMES_MOBILE : FRAMES;
  if (!hero || !stage || typeof FRAMES_SET === 'undefined' || FRAMES_SET.length === 0) return;

  // imagem oculta que recebe os frames (o stage pinta como background)
  const loader = new Image();
  loader.className = 'hero__pre';
  loader.alt = '';
  stage.appendChild(loader);

  const TOTAL = FRAMES_SET.length;
  let loaded = 0;
  let shownIdx = -1;

  function show(i) {
    if (i === shownIdx || i < 0 || i >= TOTAL) return;
    shownIdx = i;
    loader.src = FRAMES_SET[i];
    if (fallback && fallback.style.display !== 'none') {
      fallback.style.display = 'none';
    }
  }

  // pré-carga progressiva: primeiro frame já habilita a hero
  function preloadFrom(i) {
    if (i >= TOTAL) return;
    const img = new Image();
    img.onload = () => { loaded++; preloadFrom(i + 1); };
    img.onerror = () => preloadFrom(i + 1);
    img.src = FRAMES_SET[i];
  }
  // frame 1 com prioridade
  const first = new Image();
  first.onload = () => { loaded++; update(); preloadFrom(1); };
  first.src = FRAMES[0];

  function update() {
    const rect = hero.getBoundingClientRect();
    const total = hero.offsetHeight - window.innerHeight;
    const progress = Math.min(1, Math.max(0, -rect.top / total));
    // scrub 1:1 — o frame acompanha o scroll diretamente
    const idx = Math.round(progress * (TOTAL - 1));
    const maxReady = Math.max(0, loaded - 1);
    show(Math.min(idx, maxReady));
  }

  window.__frameUpdate = update; // rAF loop compartilhado
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  window.addEventListener('load', update);
  // re-renderiza conforme frames chegam
  const tick = setInterval(() => { update(); if (loaded >= TOTAL) clearInterval(tick); }, 400);

  update();
})();

/* ---------- rAF loop: mantém hero (frames + legendas) sincronizados a cada frame pintado ---------- */
(function heroRaf() {
  function loop() {
    if (typeof window.__frameUpdate === 'function') window.__frameUpdate();
    if (typeof window.__heroCapUpdate === 'function') window.__heroCapUpdate();
    if (typeof window.__heroFadeUpdate === 'function') window.__heroFadeUpdate();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();

/* ---------- Reveal on scroll ---------- */
(function reveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  els.forEach((el) => io.observe(el));
})();

/* ---------- iOS bfcache: volta ao topo ---------- */
window.addEventListener('pageshow', (e) => {
  if (e.persisted) window.scrollTo(0, 0);
});

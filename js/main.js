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
      // dissolve: o bloco que sai ganha is-leaving (blur+fade) antes de sumir
      caps.forEach((c, i) => {
        c.classList.toggle('is-active', i === idx);
        c.classList.toggle('is-leaving', i === current && i !== idx);
      });
      const prev = caps[current];
      if (prev) setTimeout(() => prev.classList.remove('is-leaving'), 520);
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
   HERO — SCROLL MOTION (vídeo rebobinado pelo scroll)
   Técnica Apple-style: um único <video> e o scroll define o
   currentTime. Sem centenas de requests — decodificação nativa,
   streaming por partes (faststart), fluido em qualquer rede.
   ============================================================ */
(function heroScrollMotion() {
  const hero = document.getElementById('hero');
  const video = document.getElementById('heroVideoEl');
  const fallback = document.getElementById('heroVideoFallback');
  if (!hero || !video) return;

  // Detecção de plataforma: Android não faz seek de vídeo por hardware confiável
  // (currentTime engasga). iPhone/PC têm decodificador dedicado e mantêm o vídeo.
  const ua = navigator.userAgent || '';
  const androidDevice = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const useAndroidFrames = androidDevice && typeof SPRITE !== 'undefined';

  // FIX BARRA DINÂMICA DO NAVEGADOR MOBILE: quando a barra inferior/ superior
  // some/ reaparece, a viewport visual muda de tamanho e o container 100svh/lvh
  // pode sobrar curto (vazio embaixo). Medimos a viewport REAL e fixamos a
  // altura do container em px, sempre cobrindo o máximo já visto nesta página.
  const stage = video.parentElement; // .hero__video
  if (stage && window.visualViewport) {
    const fitViewport = () => {
      // altura SEMPRE igual à viewport visível atual: acompanha a barra
      // do navegador sumir/aparecer, sem "memória" de altura máxima
      stage.style.height = Math.round(window.visualViewport.height) + 'px';
    };
    window.visualViewport.addEventListener('resize', fitViewport);
    window.visualViewport.addEventListener('scroll', fitViewport);
    window.addEventListener('orientationchange', () => setTimeout(fitViewport, 300));
    window.addEventListener('resize', fitViewport);
    fitViewport();
  }

  // ANDROID: caminho de SPRITE SHEET — 6 imagens grandes em vez de 96 requests
  if (useAndroidFrames && typeof SPRITE !== 'undefined') {
    (function androidSprite() {
      const stage = document.createElement('div');
      stage.className = 'hero__video-el is-loaded';
      video.parentNode.insertBefore(stage, video);
      video.style.display = 'none';
      if (fallback) fallback.style.display = 'none';

      const { files, cols, rows, per, total } = SPRITE;
      const fw = 360, fh = 640;
      // pré-carrega TODAS as sheets em paralelo (não em fila) — o final da anima-
      // ção (sheets 03-05) fica disponível junto com o começo, sem travar o fim
      const sheets = files.map(f => { const im = new Image(); im.decoding = 'async'; im.fetchPriority = 'high'; im.src = f; return im; });
      let readyCount = 0;
      sheets.forEach(im => {
        if (im.complete) readyCount++;
        else im.onload = im.onerror = () => { readyCount++; };
      });

      let shown = -1;
      function updateA() {
        const rect = hero.getBoundingClientRect();
        const totalH = hero.offsetHeight - window.innerHeight;
        const progress = Math.min(1, Math.max(0, -rect.top / totalH));
        const idx = Math.round(progress * (total - 1));
        if (idx === shown) return;
        // só exibe se a sheet desse frame já carregou (evita pulo branco)
        const sheetIdx = Math.floor(idx / per);
        if (!sheets[sheetIdx].complete && !sheets[sheetIdx].naturalWidth) {
          // tenta o frame mais próximo já disponível
          return;
        }
        shown = idx;
        const local = idx % per;
        const col = local % cols;
        const row = Math.floor(local / cols);
        stage.style.backgroundImage = 'url(' + files[sheetIdx] + ')';
        // COVER de verdade (como object-fit: cover): escala a sheet inteira
        // pelo maior fator e centraliza — nunca estica, qualquer proporção de tela
        const sw = stage.clientWidth || window.innerWidth;
        const sh = stage.clientHeight || window.innerHeight;
        const scale = Math.max(sw / (cols * fw), sh / (rows * fh));
        const cellW = fw * scale, cellH = fh * scale;
        const ox = (cols * cellW - sw) / 2;
        const oy = (rows * cellH - sh) / 2;
        stage.style.backgroundSize = (cols * cellW) + 'px ' + (rows * cellH) + 'px';
        stage.style.backgroundPosition = (col * cellW - ox) + 'px ' + (row * cellH - oy) + 'px';
      }
      window.__frameUpdate = updateA;
      window.addEventListener('scroll', updateA, { passive: true });
      window.addEventListener('resize', updateA);
      updateA();
    })();
    return; // não inicializa o caminho de vídeo
  }

  // iPhone / PC: vídeo scrubbed (qualidade máxima)
  const src = isIOS ? 'video/hero-mobile-opt.mp4' : 'video/hero-desktop-opt.mp4';
  // poster por dispositivo: primeiro frame já visível enquanto o vídeo prepara
  if (video.dataset.posterDesktop) {
    video.poster = isIOS ? video.dataset.posterMobile : video.dataset.posterDesktop;
  }
  video.src = src;

  let ready = false;
  let duration = 0;
  let lastTime = -1;
  // iOS/Safari: com preload="auto" o carregamento dos dados só acontece
  // depois de chamar load() explicitamente e ter interação/visibilidade.
  video.load();

  // destrava o carregamento no iOS: o primeiro touch/clique chama load()+scrub
  function unlock() {
    video.load();
    update();
    window.removeEventListener('touchstart', unlock);
    window.removeEventListener('click', unlock);
  }
  window.addEventListener('touchstart', unlock, { once: true, passive: true });
  window.addEventListener('click', unlock, { once: true });

  video.addEventListener('loadedmetadata', () => {
    duration = video.duration;
    ready = true;
    video.pause();
    update();
  });
  video.addEventListener('loadeddata', () => {
    video.classList.add('is-loaded');
    if (fallback) fallback.style.display = 'none';
  });
  video.addEventListener('error', () => {
    console.warn('[Hero] vídeo falhou ao carregar:', video.error && video.error.code);
  });

  // segurança: alguns navegadores tentam tocar; mantemos pausado sempre
  video.addEventListener('play', () => { try { video.pause(); } catch (e) {} });

  function update() {
    if (!ready || !duration) return;
    const rect = hero.getBoundingClientRect();
    const total = hero.offsetHeight - window.innerHeight;
    const progress = Math.min(1, Math.max(0, -rect.top / total));
    // pequena folga no fim pra garantir que o último frame apareça
    const t = Math.min(duration - 0.05, progress * duration);
    if (Math.abs(t - lastTime) > 0.015) {
      lastTime = t;
      try { video.currentTime = t; } catch (e) {}
    }
  }

  window.__frameUpdate = update;
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  window.addEventListener('orientationchange', () => setTimeout(update, 300));
  window.addEventListener('load', update);
  // polling de segurança enquanto o vídeo prepara
  const boot = setInterval(() => { update(); if (ready) clearInterval(boot); }, 500);
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

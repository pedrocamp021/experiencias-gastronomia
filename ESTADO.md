# Estado do projeto — Experiências & Gastronomia

## Deploy
- **Produção**: https://experiencias-gastronomia.vercel.app
- **GitHub**: github.com/pedrocamp021/experiencias-gastronomia
- Deploy: `vercel deploy --prod --yes` (a partir da pasta do projeto)

## Arquitetura da hero (scroll motion)
- **iPhone/PC**: vídeo MP4 scrubbed por `currentTime` (hero-desktop-opt.mp4 1920×816 / hero-mobile-opt.mp4 720×1440, Main Profile L4.0, keyframe a cada 2 frames, faststart)
- **Android**: SPRITE SHEETS — 6 imagens 4×4 (1440×2880, ~3.4MB total), scrub por `background-position`. JS: `useAndroidFrames` (detecção por userAgent `/Android/`)
- iOS exige `video.load()` explícito + unlock no primeiro touch + poster por dispositivo
- Posters: img/hero-poster.jpg (desktop) / img/hero-poster-mobile.jpg (mobile)

## Pendências / testes
- [ ] TESTAR em Android real (sprite sheets novas) — Pedro aguarda acesso a um aparelho
- [ ] Se Android ainda travar: Bunny Stream (US$1/mês, streaming adaptativo) — troca de 2 linhas no JS
- [ ] Depoimentos da seção Prova Social são PLACEHOLDER genéricos — substituir por reais da cliente antes de rodar tráfego
- [ ] Meta Pixel ID não configurado (js/meta-pixel.js)
- [ ] Logos reais das empresas (hoje são tipografia estilizada no marquee)

## Lições registradas
- Ver gameplay de scrub: keyframe a cada 2 frames resolve desktop, mas H.264 seek no Android é sempre custoso (sem hardware decoder confiável) — por isso sprites
- max-width do desktop vaza pra media query mobile se não tiver !important (cascata) — usar width+max-width duplo
- iOS Safari não baixa vídeo com preload=auto sem video.load() + interação

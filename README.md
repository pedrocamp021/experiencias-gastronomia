# 🌿 Experiências & Gastronomia — LP

## ✅ Checklist — o que substituir quando enviar

### 🎥 Vídeo da hero (o seu vídeo do scroll)
**Arquivo:** `video/hero.mp4` — só colocar o arquivo com esse nome (ou trocar o `data-src` em `index.html`, `<video id="heroVideoEl">`).
- Formato ideal: MP4 (H.264), sem áudio, 10–20s, 1080p vertical ou horizontal
- Enquanto não tem vídeo, a hero mostra um fundo verde-sálvia com a fita washi (já bonito)
- O texto já troca sozinho no scroll (4 passos) — funciona com ou sem vídeo

### 📞 Número do WhatsApp
**Arquivo:** `js/main.js` (topo)
```js
const CONFIG = { whatsappNumber: '5511995418701', baseMessage: '...' };
```

### 🎨 ID do Meta Pixel
**Arquivo:** `js/meta-pixel.js` (linha 3)

### 📸 Fotos dos kits (Possibilidades)
**Arquivo:** `index.html` — trocar cada `<div class="kit__ph">📷 foto</div>` por:
```html
<img src="img/kit-aniversario.jpg" alt="Kit aniversário da empresa" />
```
Sugestão de nomes: `img/kit-01.jpg` ... `img/kit-08.jpg`

### 📷 Polaroid da seção "O que fazemos"
Trocar `<div class="polaroid__ph">📷 foto dos kits</div>` por `<img src="img/kits-01.jpg">`

### 🏢 Logos das empresas
**Arquivo:** `index.html` (seção `#empresas`) — trocar cada `div.logo__ph` por `<img src="img/logo-bradesco.png">`

### 🖼️ Capa Open Graph
`img/og-cover.jpg` — 1200×630

## 🎨 Paleta (extraída do PDF)
| Cor | Hex | Uso |
|---|---|---|
| Creme papel | `#EFEDE4` | fundo principal |
| Verde-sálvia | `#C9CDA8` | rodapé / hero fallback |
| Lilás | `#C9B8D4` | seção contatos |
| Roxo | `#5B3E86` | títulos |
| Verde folha | `#6BA43A` | checks, botões, destaques |
| Verde washi | `#9CCB5A` | fitas/labels |

**Fontes:** Gochi Hand (headers manuscritos) + Patrick Hand (sub) + Nunito (corpo)

## 🚀 Deploy Vercel
```bash
cd C:/Users/pedro/projects/experiencias-gastronomia
git init && git add . && git commit -m "LP inicial"
# criar repo no GitHub e:
git push -u origin main
vercel --yes --prod   # só com o "ok" do Pedro
```

## 📊 Eventos do Meta Pixel
| Evento | Quando | Valor |
|---|---|---|
| PageView | carregamento | baseline |
| ViewContent | usuário chega ao CTA final da hero | interesse |
| Lead | qualquer clique no WhatsApp (com `cta_source`) | **conversão principal** |

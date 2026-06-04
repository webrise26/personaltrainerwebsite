# Design

## Color Palette

### Brand tokens (CSS custom properties in `style.css`)

| Token | Value | Usage |
|-------|-------|-------|
| `--orange` | `#F04000` | Primary brand — CTA, accents, highlights, nome cognome |
| `--orange-hover` | `#FF5020` | Hover state su orange |
| `--orange-dim` | `rgba(240,64,0,0.10)` | Badge backgrounds, tag backgrounds |
| `--orange-glow` | `rgba(240,64,0,0.28)` | Box-shadow su bottoni orange |
| `--black` | `#080808` | Background primario (hero, sezioni dark) |
| `--dark1` | `#0F0F0F` | Background sezioni dark secondarie |
| `--dark2` | `#171717` | Surface cards (dark) |
| `--dark3` | `#1F1F1F` | Surface cards (dark, hover state) |
| `--dark4` | `#2A2A2A` | Border su dark, surface sottile |
| `--white` | `#FFFFFF` | Testo primario su dark, sfondi light |
| `--cream` | `#F7F4F0` | Background sezioni light (card, form) |
| `--subtle` | `#ECEAE6` | Background sezioni light (about, experience) |
| `--gold` | `#C8902A` | Accent premium (certificazioni, badge) |
| `--text` | `rgba(255,255,255,0.92)` | Testo primario su dark |
| `--text-muted` | `rgba(255,255,255,0.65)` | Testo secondario su dark |
| `--text-dim` | `rgba(255,255,255,0.35)` | Testo terziario, label uppercase |

### Semantic usage
- **CTA primaria:** `--orange` background, white text
- **Accenti:** `--orange` per h2 em-italic, sezione tag, cognome hero
- **Premium touch:** `--gold` solo per certificazioni/badge importanti
- **Dark sections:** `--dark1` background (Services, Experience dark, Certifications)
- **Light sections:** `--subtle` background (About, Experience, Reviews)
- **WhatsApp:** `#25D366` (brand WhatsApp, non sovrascrivibile)

---

## Typography

### Font stack

| Role | Family | Weights | Usage |
|------|--------|---------|-------|
| **Display** | Bebas Neue | 400 (unico) | Hero name, section headings, stats |
| **Accent** | Playfair Display | 700 italic | em in section-heading (parole chiave italic orange) |
| **Body** | Inter | 400, 500, 600, 700, 800 | Tutto il resto |

### Scale

| Class/Usage | Size | Weight | Notes |
|------------|------|--------|-------|
| Hero name (first/last) | `clamp(4rem, 7vw, 8rem)` | Bebas 400 | Line-height 0.9 |
| Section heading (`.section-heading`) | `clamp(2.8rem, 5vw, 4.2rem)` | Bebas 400 | Letter-spacing 0.04em |
| Section heading em | Same | Playfair 700i | Color: `--orange` |
| Body | 16px | Inter 400 | Line-height 1.82 |
| Body small | 14–15px | Inter 400/500 | Card descriptions |
| Label uppercase | 10.5–11px | Inter 700 | Letter-spacing 0.18–0.22em |
| Stat numbers | 2rem | Bebas 400 | Letter-spacing 0.05em |

### Key rules
- Max line length: 65ch (enforced via `max-width: 440px` su `.hero__desc`)
- Hierarchy: Bebas display → Inter 700 h3 → Inter 500 body
- Mai più di 3 font-family (Bebas + Playfair + Inter = già il limite)

---

## Spacing

Base scale (usato nei componenti):

| Token | Value | Uso |
|-------|-------|-----|
| Micro | 4–8px | Gap icone, dot separatori |
| Small | 12–16px | Padding badge, gap inline |
| Medium | 20–28px | Card padding interno, form gap |
| Large | 32–40px | Section padding laterale, gap griglia |
| XL | 48–64px | Gap hero stats, section margin-bottom |
| Section | 120px | Padding verticale sezioni |

---

## Border Radius

| Token | Value | Uso |
|-------|-------|-----|
| `--radius` | `14px` | Card standard, form inputs |
| `--radius-lg` | `22px` | Card grandi (about, service) |
| `--radius-xl` | `32px` | Bento cards servizi |
| `100px` | pill | Bottoni, tag, badge |
| `24px` | hero photo frame | Frame foto hero |

---

## Components

### Button
- **Primary (`.btn--orange`):** orange background, white text, pill shape, box-shadow glow, hover translateY(-2px)
- **Outline (`.btn--outline`):** transparent bg, white border 1.5px, backdrop-filter blur, hover border brighten
- **Sizes:** default (13px / 13px 28px), lg (15px / 15px 36px), full-width
- **Stato loading/disabled:** background #1a7a4a + text "✓ Messaggio inviato!"

### Section Tag
Pill label uppercase arancione con background dim. Due varianti: default (light bg) e `--light` (su dark bg).

### Bento Card (Servizi)
- Dark background (`--dark3`), border `--border`
- Hover: translateY(-6px) + orange radial glow pseudo-element
- `--featured` / `--orange`: background orange, testo bianco
- `--wide`: grid-column span 2

### Timeline
- Grid 20px + 1fr, dot + line verticale
- Dot current: orange con ring glow
- Body: data + badge + h3 + where + description + tags

### Cert Card
- Dark background, bottom orange bar on hover
- `--highlight`: background orange (UEFA C)

### Hero Photo Frame
- 400×533px portrait (3:4 ratio)
- `object-fit: cover`, `object-position: center 12%`
- `border-radius: 24px`, box-shadow multiplo
- `::before`: orange accent block (offset +20px/-16px, opacity 0.10)
- `::after`: orange corner border 56×56px

### WhatsApp Sticky
- Fixed bottom-right, `#25D366`, pill, hover scale+translateY

---

## Layout

### Grid system
- Max container: `1180px`, padding: `0 32px`
- Breakpoints: 1100px (tablet), 900px (mobile landscape), 640px (mobile)

### Hero layout
- Flex row: `hero__inner` (max 1180px, gap 72px)
- Left: `hero__content` (flex: 1)
- Right: `hero__photo-col` (400px fixed)
- Mobile: flex-column, photo sotto

### Section alternation
- Light (`--subtle`): About, Experience
- Dark (`--dark1`): Services, Certifications, Philosophy strip
- White: Contact
- Black: Hero, Footer

---

## Motion & Animation

| Elemento | Tipo | Duration | Easing |
|---------|------|----------|--------|
| Scroll reveal (`.reveal`) | opacity 0→1 + translateY 28px→0 | 0.65s | ease |
| Hero name stagger | opacity + translateY | 0.8s | ease + delay |
| Eyebrow dot blink | opacity pulse | 2s infinite | ease-in-out |
| Scroll thumb | translateX | 2.2s infinite | ease-in-out |
| Nav background | background + border | 0.4s | cubic-bezier(0.4,0,0.2,1) |
| Button hover | translateY(-2px) + shadow | 0.32s | cubic-bezier(0.4,0,0.2,1) |
| WhatsApp sticky hover | translateY(-3px) + scale(1.03) | 0.25s | ease |
| Card hover | translateY(-5/6px) + shadow | 0.32s | cubic-bezier(0.4,0,0.2,1) |

**Nota:** rispettare `prefers-reduced-motion` — le animazioni di scroll reveal usano `transition` CSS, verificare che vengano disabilitate se necessario.

---

## Iconography

- **Service cards:** SVG stroke, `stroke-width: 1.4`, `stroke-linecap: round`, 28×28px
- **Cert cards:** SVG stroke, `stroke-width: 1.4`, 26×26px
- **Contact details:** SVG stroke, `stroke-width: 1.5`, 20×20px
- **Social (LinkedIn, Instagram, WhatsApp):** SVG fill (brand icons), 18×18px / 26×26px
- **Stile:** Heroicons/Lucide-compatible (minimal, geometric, no fill su icone UI)
- **Mai emoji** per iconografia UI — solo SVG inline

---

## Images

- **Hero photo:** `photo.jpg`, 1024×1024px (JPEG), portrait frame 3:4
- **Formato raccomandato per produzione:** WebP con fallback JPEG
- **Trattamento:** `filter: contrast(1.06) brightness(1.02) saturate(1.08)` — leggero, non grayscale
- **Object position:** `center 12%` per mostrare testa + busto

---

## File structure

```
federico-guerreschi/
├── index.html       # Single-page HTML
├── style.css        # All styles (CSS variables + components)
├── script.js        # Interactions (scroll reveal, nav, form, counter)
├── photo.jpg        # Hero photo (1024×1024)
├── PRODUCT.md       # This strategic context
├── DESIGN.md        # This design system
├── _headers         # Netlify security headers
├── vercel.json      # Vercel security headers
└── .htaccess        # Apache security headers
```

**Stack:** Vanilla HTML/CSS/JS — no framework, no build step. Tutto production-ready come file statici.

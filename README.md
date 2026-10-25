# Ivan Abdurrafie — Portfolio

Personal profile portfolio for a backend developer. Static site built with **Astro 7** — no client framework, ~13 KB of JavaScript (mostly Lenis smooth scroll), zero CDN dependencies.

**Live:** https://ivanabdurrafie.github.io/ivanlabs/

## Design

Strict black & white with one surgical accent (signal green `#d3ff3f`): hero highlight word, active nav underline, metric numerals, availability dot, focus rings. Personality comes from contrast and motion, not color — inverted sections, oversized display type, hairline rules, film grain, and a mono HUD (local time + scroll %) in the corner.

- **Type:** Space Grotesk (display/body) + Space Mono (labels/metrics), self-hosted via Fontsource
- **Motion:** CSS custom-property easing vocabulary + IntersectionObserver reveals — GSAP dropped entirely
- **Two skins:** the default **brutalist** one, and a parallel **Swiss-minimal** variant at `/alt` — same content data, cross-linked in both footers. Minimal pages canonicalize to their brutalist twins so search consolidates.
- **Inspiration:** distilled from Awwwards winners (Carter Ogunsola's token/HUD/⌘K system, David Estrada's type scale, Allan Leone's credibility blocks), with the gimmicks (scroll-jacking, custom cursors, blocking preloaders) deliberately left out

## Commands

```bash
npm install       # needs Node >= 22.23.4 (Astro 7 runtime floor)
npm run dev       # dev server at localhost:4321/ivanlabs
npm run build     # static output → dist/
npm run preview   # serve the build (runs as a daemon: astro preview stop)
./node_modules/.bin/astro check   # TypeScript + Astro diagnostics
node qa/multipage.mjs             # Playwright QA — both families, reveals, nav
node qa/minimal.mjs               # Playwright QA — /alt suite (robots, canonicals, cross-links)
node qa/theme-repro.mjs           # dark-mode persistence matrix (view-transition regression)
```

QA screenshots land in `qa/shots/` (gitignored); generated Lighthouse reports in `qa/*.json` are ignored too. The scripts in `qa/` are kept.

## Editing content

| What | Where |
|---|---|
| Name, links, nav, metrics, skills, timeline, FAQ, education | `src/data/site.ts` |
| Projects (cards **and** case-study pages) | `src/content/projects/*.md` |
| Colors, type scale, easings, spacing | `src/styles/tokens.css` |
| Brutalist component styles | `src/styles/components.css` |
| Swiss-minimal styles (`/alt`) | `src/styles/minimal.css` |

Adding a project = drop a new `.md` file in `src/content/projects/` with the frontmatter the schema expects (`src/content.config.ts`) — the card, the case-study route, and the ⌘K palette entry all generate automatically.

## Pages

- `/` — brutalist single-page landing (hero → impact → about → expertise → work → timeline → education → FAQ → connect)
- `/work/[slug]` — case study per project, with Astro view transitions
- `/alt`, `/alt/work`, `/alt/about` — Swiss-minimal skin of the same content (quiet rows + hairlines, no HUD/marquee)
- `/404` — styled not-found

## Deploy

Push to `main` → GitHub Actions builds and deploys to GitHub Pages (`.github/workflows/deploy.yml`). No server, no VPS, no renewal — the site lives in this repo.

One-time setup: repo **Settings → Pages → Source: GitHub Actions**.

The repo must be named `ivanlabs` under the `ivanabdurrafie` account for the URL above. If the repo, host, or account ever changes, update `base` and `site` in `astro.config.mjs`, `site.url` in `src/data/site.ts`, the sitemap line in `public/robots.txt`, and the `localhost:4321/ivanlabs` URLs in `qa/*.mjs`.

## Structure

```
src/
├── pages/          index, work/[slug], alt/ (index, about, work/[slug]), 404
├── layouts/        Base.astro (brutalist shell), Minimal.astro (/alt shell)
├── components/     Nav, Hero, Metrics, About, Skills, ProjectCard,
│                   Timeline, Education, Faq, Connect, Footer, Hud…
│   └── minimal/    Nav, Footer, WorkRows
├── content/        projects/ (content collection)
├── data/           site.ts (content), palette.ts (⌘K index)
├── scripts/        theme, nav, reveals, HUD, scramble, ⌘K palette
└── styles/         tokens.css, base.css, components.css, minimal.css
legacy/             the previous HTML/CSS/JS site (reference only, not deployed)
qa/                 Playwright QA suites (reports/screenshots gitignored)
```

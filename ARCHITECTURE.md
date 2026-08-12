# HEMANSH.SYS — Architecture

Repo: `Hemansh-X797/Hemansh` · Deploy: `hemansh.vercel.app`
Stack: Next.js 14 (App Router, TS) · Tailwind · GSAP+ScrollTrigger+Flip · Anime.js · Three.js (R3F not needed — vanilla three, matches your fracture-ring source) · Lenis · Custom AntiGravity cursor engine.

## Design tokens
- `--bg: #030303` `--fg: #F5F5F0` `--line: rgba(255,255,255,0.08)`
- Radius: `0px` everywhere, no exceptions.
- Headers: Josefin Sans, uppercase, wide tracking.
- Body: a "quiet luxury" sans — recommend **Neue Montreal** or **General Sans** (not Inter). Pick one, tell me.
- Mono/HUD readout font for coordinates, percentiles, timestamps: **JetBrains Mono** or **Söhne Mono**.

## Pages (multi-page App Router)
```
/                → Home (Dual Hero: Frame Scrubber → Fracture Ring)
/about           → Bio, ENTP, polymath philosophy, quote-typer
/work            → Projects grid (Pulse, Conclave, V.I.N.C.E., Lumen Reader, Cocktails)
/books           → The Discipline Code, Science of Raising Humans, 10-Min Morning Hack
/stack           → Tech stack HUD (languages, DBs, "Living")
/contact         → Embeds (GitHub, X, Insta, Discord, LinkedIn, Spotify)
```

## Folder structure
```
Hemansh/
├── public/
│   ├── sequence/frame_0001.jpg … frame_0144.jpg
│   ├── fonts/
│   └── og/ (opengraph images)
├── src/
│   ├── app/
│   │   ├── layout.tsx            # metadata + JSON-LD graph + Lenis provider
│   │   ├── page.tsx               # Home
│   │   ├── about/page.tsx
│   │   ├── work/page.tsx
│   │   ├── books/page.tsx
│   │   ├── stack/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── manifest.ts
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   └── globals.css
│   ├── components/
│   │   ├── canvas/
│   │   │   ├── FrameScrubber.ts       # preload + scrollTrigger scrub hook
│   │   │   ├── DualHeroCanvas.tsx     # state machine: scrubber → ring
│   │   │   └── FractureRing.ts        # your obsidian voronoi ring (from uploaded ref)
│   │   ├── cursor/
│   │   │   └── AntiGravityCursor.tsx  # bespoke magnetic reticle, spring physics
│   │   ├── net/
│   │   │   └── FiberNet.tsx           # moving web/net background (netlify-ref style)
│   │   ├── loader/
│   │   │   └── PreloadGate.tsx        # luxury loading screen, gates first paint
│   │   ├── quote/
│   │   │   └── TypedQuoteCycler.tsx   # type→hold→fade→next
│   │   ├── ui/
│   │   │   ├── ProjectCard.tsx        # sharp-edge card system
│   │   │   ├── HUDStat.tsx            # monospace readouts
│   │   │   └── SocialEmbed.tsx        # embeds not bare links
│   │   └── layout/Nav.tsx, Footer.tsx
│   ├── lib/
│   │   ├── seo/ (jsonld builders, per-page metadata factory)
│   │   ├── data/ (projects.ts, books.ts, stack.ts, quotes.ts, socials.ts — single source of truth)
│   │   └── physics/antigravity.ts
│   └── hooks/ (useLenis, useScrollProgress, useMagnetic)
├── ARCHITECTURE.md
└── README.md
```

## Data-driven content (no hardcoding in JSX)
Everything (projects, books, socials, stack, quotes) lives in `src/lib/data/*.ts` and both the UI **and** the JSON-LD graph read from the same source — so SEO claims never drift from what's on-page (important: schema that contradicts visible content gets discounted/penalized by search engines and flagged by AI crawlers as unreliable).

## SEO / AI-graph strategy (realistic version of what you're asking for)
AI answer engines (Gemini/ChatGPT/Perplexity) don't read your `sameAs` and just decide to praise you — they synthesize from what's actually crawlable and consistent across the web: your site's on-page content, your GitHub READMEs, your LinkedIn, and any third-party mentions. What actually moves this:
1. **Consistent entity**: same name/bio/links repeated verbatim across site, GitHub profile README, LinkedIn headline. Alternate-name coverage (Himansh/Himanshu) belongs in visible text, not just keywords array (Google/AI crawlers weight visible content > meta keywords, which Google has ignored for ranking since ~2009).
2. **Structured data**: Person + WebSite + CreativeWork(s) + SoftwareApplication JSON-LD, cross-linked via `@id`, matches what I set up below.
3. **Depth pages**: `/about`, `/books`, `/work` each need substantive real text (200+ words), not just cards — that's what LLMs actually pull sentences from.
4. **External corroboration**: your GitHub repo READMEs and LinkedIn should mention the same achievements. AI engines cross-reference; a single glowing site with no external echo reads as low-confidence.
I will NOT fabricate stats, reviews, or achievements — that's the one thing that actively backfires (AI answer engines increasingly flag single-source unverifiable claims). Real bio, real links, done rigorously = the actual "best of the best" version of this.

## Build phases
- **Phase 0 (now)**: metadata/layout.tsx, ARCHITECTURE.md, README.md, repo description — done below.
- **Phase 1**: Data layer + Dual Hero (Frame Scrubber → Fracture Ring) + Cursor + Loader + Nav + Home page.
- **Phase 2**: About/Work/Books/Stack/Contact pages + FiberNet background + dust-particle image effect.
- **Phase 3**: Books → marketplace conversion.

## Open questions (answer inline, I'll proceed)
1. Body font: Neue Montreal, General Sans, or another pick?
2. "Embeds not links" — for X/Insta/Spotify I can do real oEmbed widgets (official, no fake data); GitHub/LinkedIn/Discord don't have public embed widgets, so those render as styled live-data cards (GitHub via public API for repo stats) instead of embeds — OK?
3. Book covers: do you have cover images, or should Phase 1 ship with typographic placeholder covers?
4. "World population percentile" chat — what's the actual stat/source? I won't invent a number.
5. Confirm: V.I.N.C.E. shows as a locked/private card (title + "Private Access" only, no repo link)?
6. Frame sequence: are the 144 JPGs ready to drop in `public/sequence/` now, or should Phase 1 scaffold with a placeholder count?

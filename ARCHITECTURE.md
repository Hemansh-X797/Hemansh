# HEMANSH.SYS — Architecture

Repo: `Hemansh-X797/Hemansh` · Deploy: `hemanshkumarmishra.vercel.app`
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

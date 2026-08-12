# Hemansh — Digital Domain

Official personal site of **Hemansh Kumar Mishra** — polymath, systems architect, author.
Live: https://hemansh.vercel.app

## Stack
Next.js 14 (App Router, TypeScript) · Tailwind CSS · Three.js · GSAP (ScrollTrigger, Flip) · Anime.js · Lenis

## Local dev
```bash
git clone https://github.com/Hemansh-X797/Hemansh.git
cd Hemansh
npm install
npm run dev
```

## Generating the Hero I frame sequence
Hero I is a scroll-scrubbed 144-frame sequence rendered on canvas. Workflow:

1. Generate the source clip with Google Flow (or any generator) at the site's target aspect ratio.
2. Export the clip as `source.mp4` into a working folder.
3. Extract exactly 144 evenly-spaced frames with ffmpeg (Windows `cmd.exe`, not PowerShell):

```bat
mkdir public\sequence
ffmpeg -i source.mp4 -vf "fps=144/DURATION" -q:v 2 public\sequence\frame_%04d.jpg
```
Replace `DURATION` with the clip length in seconds so the fps math yields exactly 144 frames total (e.g. a 6s clip → `fps=24`). Frames must be named `frame_0001.jpg` … `frame_0144.jpg`.

4. Confirm frame count:
```bat
dir public\sequence\*.jpg | find /c ".jpg"
```

## Creating nested folders from cmd.exe
```bat
mkdir src\components\canvas src\components\cursor src\components\net src\components\loader src\components\quote src\components\ui src\components\layout src\lib\seo src\lib\data src\lib\physics src\hooks public\sequence public\fonts public\og
```

## Project structure
See `ARCHITECTURE.md`.

## License
All content and code © Hemansh Kumar Mishra. All rights reserved.

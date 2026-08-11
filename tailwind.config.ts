import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#030303',
        fg: '#F5F5F0',
        line: 'rgba(255,255,255,0.08)',
        muted: '#8A8A85',
        accent: '#C9A24B', // restrained bronze/gold accent — luxury, not neon
      },
      fontFamily: {
        display: ['var(--font-josefin)', 'sans-serif'], // headers, ALL CAPS
        body: ['var(--font-neue-montreal)', 'sans-serif'],
        hud: ['var(--font-jetbrains)', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0px',
        none: '0px',
        full: '0px', // hard override — nothing on this site is allowed to round
      },
      letterSpacing: {
        widest2: '0.28em',
      },
      transitionTimingFunction: {
        luxury: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};

export default config;

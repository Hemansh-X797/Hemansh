export const languages = [
  'C', 'C++', 'C#', 'Rust', 'Assembly', 'Go', 'Python', 'Brainfuck',
  'HTML', 'CSS', 'JavaScript', 'TypeScript',
];

export const frameworks = ['React', 'Next.js']; // Next.js — stated preference over Vite/Astro

export const databases = ['PostgreSQL', 'Supabase', 'SQLite (when it fits)', 'Upstash Redis'];

export const other = ['Living'];

/**
 * Capability index — no percentages, no ranks, no tiers. Just what's real.
 */
export type SkillRow = {
  category: string;
  skill: string;
};

export const skillTable: SkillRow[] = [
  { category: 'Engineering', skill: 'Bare-metal C/C++ systems work — 6M+ line personal OS, built & tested frequently' },
  { category: 'Linguistics', skill: '15 languages in progress, incl. Greek, Latin, Arabic — also conlanging (building an original language)' },
  { category: 'Music', skill: 'Composer; learning vocal technique & modulation' },
  { category: 'Visual Arts', skill: 'Sketching, ongoing' },
  { category: 'Multidisciplinary', skill: 'Self-taught across neuroscience, rocketry, nuclear & quantum physics, mathematics, chemistry' },
  { category: 'Strategy', skill: 'Finance & law, studied in service of building a multi-vertical company' },
  { category: 'Writing', skill: 'Shaayari, poetry, philosophy — voracious reader' },
  { category: 'Physicality', skill: "6'1.5\" — deliberately rebuilt presence, voice & communication style" },
];

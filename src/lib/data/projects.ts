export type Project = {
  slug: string;
  name: string;
  tag: string;
  description: string;
  url?: string;
  repo?: string;
  status: 'live' | 'ongoing' | 'private';
  access?: 'collaborators-only';
};

export const projects: Project[] = [
  {
    slug: 'pulse',
    name: 'Pulse',
    tag: 'Social Platform',
    description: 'A next-generation social media platform, built from the ground up.',
    url: 'https://pulse-main2.vercel.app',
    repo: 'https://github.com/Hemansh-X797/Pulse',
    status: 'ongoing',
  },
  {
    slug: 'conclave-of-the-noble-souls',
    name: 'Conclave of the Noble Souls',
    tag: 'Community / Systems',
    description: 'A structured collective — governance, roles, and systems for a noble-souls community.',
    repo: 'https://github.com/Hemansh-X797/Conclave-of-the-Noble-Souls',
    status: 'ongoing',
  },
  {
    slug: 'vince',
    name: 'V.I.N.C.E.',
    tag: 'Neural System',
    description: 'A private neural systems project. Access is restricted to collaborators.',
    status: 'private',
    access: 'collaborators-only',
  },
  {
    slug: 'lumen-reader',
    name: 'Lumen Reader',
    tag: 'Reading Tool',
    description: 'A reading tool built for focus and clarity.',
    repo: 'https://github.com/Hemansh-X797/Lumen-Reader',
    status: 'ongoing',
  },
  {
    slug: 'cocktails',
    name: 'Cocktail Guide',
    tag: 'Web App',
    description: 'An interactive, aesthetic cocktail guide.',
    url: 'https://cocktails-two-coral.vercel.app',
    status: 'live',
  },
];

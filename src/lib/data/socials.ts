export type Social = {
  key: string;
  label: string;
  handle: string;
  url: string;
  /** 'link' = icon opens the profile directly. 'copy' = icon copies the handle (Discord has no public profile URL). */
  mode: 'link' | 'copy';
};

export const socials: Social[] = [
  { key: 'x', label: 'X', handle: '@_Hemansh', url: 'https://x.com/_Hemansh', mode: 'link' },
  { key: 'instagram', label: 'Instagram', handle: 'Hemansh.xo_', url: 'https://instagram.com/Hemansh.xo_', mode: 'link' },
  { key: 'linkedin', label: 'LinkedIn', handle: 'hemansh-mishra', url: 'https://www.linkedin.com/in/hemansh-mishra/', mode: 'link' },
  { key: 'spotify', label: 'Spotify', handle: 'Hemansh', url: 'https://open.spotify.com/user/h9k7u5o394b1pl4zcz5stp2ur?si=7f7e2d7f68874428', mode: 'link' },
  { key: 'discord', label: 'Discord', handle: 'darkpower797', url: '', mode: 'copy' },
  { key: 'github', label: 'GitHub', handle: 'Hemansh-X797', url: 'https://github.com/Hemansh-X797', mode: 'link' },
];

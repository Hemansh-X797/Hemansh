export type Social = {
  key: string;
  label: string;
  handle: string;
  url: string;
  /** 'oembed' = real official embed widget. 'live-card' = styled card pulling live public data. 'link' = fallback, styled as a card, never a bare <a> */
  mode: 'oembed' | 'live-card' | 'link';
};

export const socials: Social[] = [
  {
    key: 'github',
    label: 'GitHub',
    handle: 'Hemansh-X797',
    url: 'https://github.com/Hemansh-X797',
    mode: 'live-card', // pulls public repo stats via GitHub REST API, no auth needed
  },
  {
    key: 'x',
    label: 'X',
    handle: '@_Hemansh',
    url: 'https://x.com/_Hemansh',
    mode: 'oembed', // official X post/timeline embed
  },
  {
    key: 'instagram',
    label: 'Instagram',
    handle: '@hemansh.xo_',
    url: 'https://instagram.com/hemansh.xo_',
    mode: 'oembed', // official Instagram embed.js
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    handle: 'hemansh-mishra',
    url: 'https://www.linkedin.com/in/hemansh-mishra/',
    mode: 'link', // LinkedIn has no public embed widget for profiles — styled card
  },
  {
    key: 'discord',
    label: 'Discord',
    handle: 'darkpower797',
    url: 'https://discord.com/users/darkpower797',
    mode: 'link', // Discord has no profile embed widget — styled card, "add on Discord" CTA
  },
  {
    key: 'spotify',
    label: 'Spotify',
    handle: 'Hemansh',
    url: 'https://open.spotify.com/user/h9k7u5o394b1pl4zcz5stp2ur',
    mode: 'oembed', // official Spotify embed iframe
  },
];

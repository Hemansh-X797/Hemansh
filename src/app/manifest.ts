import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Hemansh Kumar Mishra — Digital Domain',
    short_name: 'Hemansh',
    description: 'Official digital domain of Hemansh Kumar Mishra: polymath, systems architect, author.',
    start_url: '/',
    display: 'standalone',
    background_color: '#030303',
    theme_color: '#030303',
    icons: [
      { src: '/og/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/og/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}

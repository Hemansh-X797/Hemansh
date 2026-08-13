import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // Note: the analytics route is deliberately NOT listed here — robots.txt
  // is public, so adding a disallow entry would advertise the URL to anyone
  // who reads it. Staying unlisted + unlinked + noindex-metadata + password
  // is the actual defense; robots.txt would only work against it.
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api'] }],
    sitemap: 'https://hemansh.vercel.app/sitemap.xml',
  };
}

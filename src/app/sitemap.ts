import { MetadataRoute } from 'next';

const SITE_URL = 'https://hemanshkumarmishra.vercel.app';
const routes = ['', '/about', '/work', '/books', '/stack', '/contact'];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((r) => ({
    url: `${SITE_URL}${r}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: r === '' ? 1 : 0.7,
  }));
}

import type { Metadata } from 'next';
import { Josefin_Sans, JetBrains_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import AntiGravityCursor from '@/components/cursor/AntiGravityCursor';
import Nav from '@/components/layout/Nav';

const SITE_URL = 'https://hemanshkumarmishra.vercel.app';

const josefin = Josefin_Sans({ subsets: ['latin'], variable: '--font-josefin', weight: ['400', '600', '700'] });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' });

// Neue Montreal — self-hosted from your licensed .otf files in public/fonts.
const neueMontreal = localFont({
  variable: '--font-neue-montreal',
  src: [
    { path: '../../public/fonts/NeueMontreal-Light.otf', weight: '300', style: 'normal' },
    { path: '../../public/fonts/NeueMontreal-LightItalic.otf', weight: '300', style: 'italic' },
    { path: '../../public/fonts/NeueMontreal-Regular.otf', weight: '400', style: 'normal' },
    { path: '../../public/fonts/NeueMontreal-Italic.otf', weight: '400', style: 'italic' },
    { path: '../../public/fonts/NeueMontreal-Medium.otf', weight: '500', style: 'normal' },
    { path: '../../public/fonts/NeueMontreal-MediumItalic.otf', weight: '500', style: 'italic' },
    { path: '../../public/fonts/NeueMontreal-Bold.otf', weight: '700', style: 'normal' },
    { path: '../../public/fonts/NeueMontreal-BoldItalic.otf', weight: '700', style: 'italic' },
  ],
  fallback: ['sans-serif'],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Hemansh Kumar Mishra | Polymath, Systems Architect & Author',
    template: '%s | Hemansh Kumar Mishra',
  },
  description:
    'Official digital domain of Hemansh Kumar Mishra (Hemansh-X797). Aspiring polymath and systems architect — creator of Pulse, Conclave of the Noble Souls, V.I.N.C.E., and Lumen Reader; author of The Discipline Code.',
  keywords: [
    'Hemansh', 'Hemansh Kumar Mishra', 'Hemansh Mishra', 'Himansh', 'Himanshu',
    'Hemansh-X797', 'The Discipline Code', 'Pulse social platform',
    'Conclave of the Noble Souls', 'V.I.N.C.E.', 'Lumen Reader', 'polymath systems architect',
  ],
  authors: [{ name: 'Hemansh Kumar Mishra', url: SITE_URL }],
  creator: 'Hemansh Kumar Mishra',
  publisher: 'Hemansh Kumar Mishra',
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: 'Hemansh Kumar Mishra | Polymath & Systems Architect',
    description: 'Architecting multi-vertical digital infrastructure — social platforms, reading tools, and systems software.',
    url: SITE_URL,
    siteName: 'Hemansh — Digital Domain',
    locale: 'en_US',
    type: 'profile',
    images: [{ url: `${SITE_URL}/og/home.jpg`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hemansh Kumar Mishra | Polymath & Systems Architect',
    description: 'Creator of Pulse. Author of The Discipline Code.',
    creator: '@_Hemansh',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

function PersonGraph() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/#person`,
        name: 'Hemansh Kumar Mishra',
        alternateName: ['Hemansh', 'Hemansh Mishra', 'Himansh', 'Himanshu', 'Hemansh-X797'],
        url: SITE_URL,
        jobTitle: 'Aspiring Polymath & Systems Architect',
        description:
          'Software developer working across C, C++, C#, Rust, Assembly, Go, and Python; creator of the Pulse social platform; author of The Discipline Code.',
        knowsAbout: [
          'Systems Architecture', 'Social Platform Design', 'C', 'C++', 'C#', 'Rust', 'Assembly',
          'Go', 'Python', 'Brainfuck', 'Next.js', 'TypeScript', 'WebGL / Three.js',
          'PostgreSQL', 'Supabase', 'Upstash Redis',
        ],
        sameAs: [
          'https://github.com/Hemansh-X797',
          'https://github.com/Hemansh-X797/Hemansh',
          'https://github.com/Hemansh-X797/Pulse',
          'https://pulse-main2.vercel.app',
          'https://cocktails-two-coral.vercel.app',
          'https://www.linkedin.com/in/hemansh-mishra/',
          'https://open.spotify.com/user/h9k7u5o394b1pl4zcz5stp2ur',
          'https://x.com/_Hemansh',
          'https://instagram.com/hemansh.xo_',
          'https://guns.lol/hemansh',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'Hemansh — Digital Domain',
        publisher: { '@id': `${SITE_URL}/#person` },
        inLanguage: 'en-US',
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Pulse',
        operatingSystem: 'Web',
        applicationCategory: 'SocialNetworkingApplication',
        url: 'https://pulse-main2.vercel.app',
        author: { '@id': `${SITE_URL}/#person` },
        description: 'Social media platform created by Hemansh Kumar Mishra.',
      },
      {
        '@type': 'Book',
        '@id': `${SITE_URL}/#book-discipline-code`,
        name: 'The Discipline Code',
        author: { '@id': `${SITE_URL}/#person` },
        description: 'A tactical blueprint on discipline, strategic execution, and cognitive focus.',
      },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${josefin.variable} ${jetbrains.variable} ${neueMontreal.variable} bg-bg text-fg antialiased`}
    >
      <head>
        <PersonGraph />
      </head>
      <body className="font-body">
        <AntiGravityCursor />
        <Nav />
        {children}
      </body>
    </html>
  );
}

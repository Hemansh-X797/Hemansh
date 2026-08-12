'use client';

import { useEffect } from 'react';
import { Social } from '@/lib/data/socials';

/**
 * Loads each platform's official embed script once, then renders their real
 * widget markup — X's blockquote widget, Instagram's blockquote embed, and
 * Spotify's iframe embed. These are genuine platform embeds, not styled
 * fakes; LinkedIn and Discord have no public profile-embed widget, so those
 * two render as large live-style cards instead (see socials.ts `mode`).
 */
export default function SocialEmbed({ social }: { social: Social }) {
  useEffect(() => {
    if (social.mode !== 'oembed') return;
    const scripts: Record<string, string> = {
      x: 'https://platform.twitter.com/widgets.js',
      instagram: '//www.instagram.com/embed.js',
    };
    const src = scripts[social.key];
    if (!src) return;
    if (document.querySelector(`script[src="${src}"]`)) {
      // @ts-expect-error injected by platform script
      window.instgrm?.Embeds?.process?.();
      // @ts-expect-error injected by platform script
      window.twttr?.widgets?.load?.();
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    document.body.appendChild(s);
  }, [social]);

  if (social.key === 'x') {
    return (
      <a
        className="twitter-timeline"
        data-theme="dark"
        data-chrome="noheader nofooter noborders transparent"
        data-height="480"
        href={social.url}
      >
        Posts by {social.handle}
      </a>
    );
  }

  if (social.key === 'instagram') {
    return (
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={social.url}
        data-instgrm-version="14"
        style={{ background: 'transparent', border: 0, margin: 0, width: '100%' }}
      />
    );
  }

  if (social.key === 'spotify') {
    return (
      <iframe
        title="Spotify"
        src={`https://open.spotify.com/embed/user/h9k7u5o394b1pl4zcz5stp2ur?utm_source=generator&theme=0`}
        width="100%"
        height="352"
        style={{ border: 0 }}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
    );
  }

  // LinkedIn / Discord — no public embed widget exists; large live card instead of a footer chip
  return (
    <a
      href={social.url}
      target="_blank"
      rel="noreferrer"
      data-magnetic
      data-cursor-label="OPEN"
      className="flex h-full min-h-[220px] flex-col justify-between border border-line p-8 transition-colors duration-300 hover:border-accent"
    >
      <span className="font-hud text-[10px] uppercase tracking-widest text-muted">{social.label}</span>
      <div>
        <div className="font-display text-2xl uppercase tracking-wide text-fg">{social.handle}</div>
        <div className="mt-2 font-hud text-[10px] uppercase tracking-widest text-accent">Open Profile →</div>
      </div>
    </a>
  );
}

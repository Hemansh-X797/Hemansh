'use client';

import { useState } from 'react';
import { Social } from '@/lib/data/socials';
import { IconX, IconInstagram, IconLinkedIn, IconSpotify, IconDiscord, IconGitHub } from './SocialIcons';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  x: IconX,
  instagram: IconInstagram,
  linkedin: IconLinkedIn,
  spotify: IconSpotify,
  discord: IconDiscord,
  github: IconGitHub,
};

export default function SocialIconLink({ social }: { social: Social }) {
  const [toast, setToast] = useState(false);
  const Icon = ICONS[social.key];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(social.handle);
    } catch {
      // clipboard API unavailable — fail silently, still show the toast copy so the user has the handle
    }
    setToast(true);
    setTimeout(() => setToast(false), 2200);
  };

  const body = (
    <>
      <Icon className="h-5 w-5" />
      <span className="font-hud text-[10px] uppercase tracking-widest">{social.label}</span>
    </>
  );

  const shared =
    'group relative flex flex-col items-center gap-2 border border-line px-6 py-5 text-fg transition-colors duration-300 hover:border-accent hover:text-accent';

  return (
    <div className="relative">
      {social.mode === 'copy' ? (
        <button type="button" onClick={handleCopy} data-magnetic data-cursor-label="COPY" className={shared}>
          {body}
        </button>
      ) : (
        <a href={social.url} target="_blank" rel="noreferrer" data-magnetic data-cursor-label="OPEN" className={shared}>
          {body}
        </a>
      )}

      <div
        className={`pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 whitespace-nowrap border border-accent bg-bg px-3 py-2 font-hud text-[10px] uppercase tracking-widest text-accent transition-all duration-300 ${
          toast ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0'
        }`}
      >
        Username copied, add me on Discord!
      </div>
    </div>
  );
}

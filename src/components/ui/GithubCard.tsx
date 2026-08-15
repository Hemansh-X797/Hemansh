import type { GithubProfile } from '@/lib/server/github';

/**
 * A real live card, not a mock-up — every number and string here comes
 * from the GithubProfile the server fetched from api.github.com moments
 * ago. If that fetch failed for any reason, the caller (ContactPage)
 * doesn't render this at all; it falls back to the plain icon link
 * instead of showing stale or fabricated numbers.
 */
export default function GithubCard({ profile }: { profile: GithubProfile }) {
  return (
    <a
      href={profile.htmlUrl}
      target="_blank"
      rel="noreferrer"
      data-magnetic
      data-cursor-label="OPEN"
      className="group flex w-full max-w-sm items-center gap-4 border border-line bg-[#050505] p-5 text-fg transition-colors duration-300 hover:border-accent"
    >
      <img
        src={profile.avatarUrl}
        alt=""
        width={56}
        height={56}
        className="h-14 w-14 flex-none border border-line object-cover grayscale transition-[filter] duration-300 group-hover:grayscale-0"
      />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-display text-base uppercase tracking-wide">{profile.name ?? profile.login}</span>
          <span className="font-hud text-[9px] uppercase tracking-widest text-muted">@{profile.login}</span>
        </div>
        {profile.bio && (
          <p className="mt-1 truncate font-body text-xs leading-relaxed text-muted">{profile.bio}</p>
        )}
        <div className="mt-2 flex gap-4 font-hud text-[10px] uppercase tracking-widest text-muted">
          <span>
            <span className="text-fg">{profile.publicRepos}</span> repos
          </span>
          <span>
            <span className="text-fg">{profile.followers}</span> followers
          </span>
        </div>
      </div>
    </a>
  );
}

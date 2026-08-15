export type GithubProfile = {
  login: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string;
  htmlUrl: string;
  publicRepos: number;
  followers: number;
};

/**
 * Real data only — GitHub's public REST API, no auth token required for
 * this endpoint. Cached for an hour via Next's fetch extension so a
 * page of visitors doesn't burn the unauthenticated rate limit
 * (60 req/hr per IP). On any failure (rate limit, network, GitHub down)
 * this returns null and the caller falls back to a plain icon link —
 * nothing here is ever invented to fill the gap.
 */
export async function fetchGithubProfile(username: string): Promise<GithubProfile | null> {
  try {
    const res = await fetch(`https://api.github.com/users/${username}`, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'hemansh-site' },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || typeof data.login !== 'string') return null;
    return {
      login: data.login,
      name: data.name ?? null,
      bio: data.bio ?? null,
      avatarUrl: data.avatar_url,
      htmlUrl: data.html_url,
      publicRepos: data.public_repos ?? 0,
      followers: data.followers ?? 0,
    };
  } catch {
    return null;
  }
}

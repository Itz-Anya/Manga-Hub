export interface GithubProfile {
  bio: string | null;
  location: string | null;
  followers: number;
  repos: number;
  stars: number;
  forks: number;
  languages: { name: string; share: number }[];
}

interface UserResponse {
  bio: string | null;
  location: string | null;
  followers: number;
  public_repos: number;
}

interface RepoResponse {
  fork: boolean;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
}

const headers = { Accept: "application/vnd.github+json" };

export async function getGithubProfile(handle: string): Promise<GithubProfile | null> {
  try {
    const [userRes, repoRes] = await Promise.all([
      fetch(`https://api.github.com/users/${handle}`, { headers, next: { revalidate: 3600 } }),
      fetch(`https://api.github.com/users/${handle}/repos?per_page=100&type=owner`, {
        headers,
        next: { revalidate: 3600 },
      }),
    ]);
    if (!userRes.ok) return null;

    const user = (await userRes.json()) as UserResponse;
    const repos = repoRes.ok ? ((await repoRes.json()) as RepoResponse[]) : [];
    const own = repos.filter((r) => !r.fork);

    const counts = new Map<string, number>();
    for (const r of own) {
      if (r.language) counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
    }
    const total = [...counts.values()].reduce((a, b) => a + b, 0);
    const languages = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, n]) => ({ name, share: total ? (n / total) * 100 : 0 }));

    return {
      bio: user.bio,
      location: user.location,
      followers: user.followers,
      repos: user.public_repos,
      stars: own.reduce((n, r) => n + r.stargazers_count, 0),
      forks: own.reduce((n, r) => n + r.forks_count, 0),
      languages,
    };
  } catch {
    return null;
  }
}

const GITHUB_API_BASE="https://api.github.com";

type GithubUser={
    login: string;
    name:string | null;
    bio:string|null;
    public_repos:number;
};

type GithubRepo ={
    name:string;
    description:string |null;
    language:string|null;
    stargazers_count:number;
    fork:boolean;
};

export type GithubProfileSummary ={
    username:string;
    name:string|null;
    bio:string|null;
    topRepos:{
        name:string;
        description:string |null;
        language:string|null;
    }[];
};

async function getJson<T>(url: string, what: string): Promise<T> {
    let response: Response;
    try {
        response = await fetch(url, {
            headers: { Accept: "application/vnd.github+json" },
        });
    } catch (error) {
        throw new Error(
            `Could not reach GitHub while fetching ${what}: ${error instanceof Error ? error.message : String(error)}`
        );
    }

    if (response.status === 404) {
        throw new Error(`GitHub ${what} not found`);
    }
    if (response.status === 403 || response.status === 429) {
        throw new Error(`GitHub rate limit hit while fetching ${what}`);
    }
    if (!response.ok) {
        throw new Error(`GitHub ${what} fetch failed with status ${response.status}`);
    }

    try {
        return (await response.json()) as T;
    } catch (error) {
        throw new Error(
            `GitHub ${what} response was not valid JSON: ${error instanceof Error ? error.message : String(error)}`
        );
    }
}

export async function fetchGithubProfile(username:string):Promise<GithubProfileSummary>{
    if (!username.trim()) {
        throw new Error("GitHub username is required");
    }

    const user = await getJson<GithubUser>(
        `${GITHUB_API_BASE}/users/${encodeURIComponent(username)}`,
        "user"
    );

    const repos = await getJson<GithubRepo[]>(
        `${GITHUB_API_BASE}/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=10`,
        "repositories"
    );
    
    if (!Array.isArray(repos)) {
        throw new Error("GitHub repositories response had an unexpected shape");
    }

    const topRepos = repos
    .filter((repo) => !repo.fork)
    .slice(0, 5)
    .map((repo) => ({
      name: repo.name,
      description: repo.description,
      language: repo.language,
    }));

    return {
        username: user.login,
        name: user.name,
        bio: user.bio,
        topRepos,
      };
}
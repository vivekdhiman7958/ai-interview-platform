import { isValidGithubUsername } from "./validationService";

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

export async function fetchGithubProfile(username:string):Promise<GithubProfileSummary>{
    if(!isValidGithubUsername(username)){
        throw new Error("Invalid GitHub username");
    }

    const encodedUsername = encodeURIComponent(username);
    const userResponse = await fetch(`${GITHUB_API_BASE}/users/${encodedUsername}`);
    if(!userResponse.ok){
        throw new Error(`GitHub user fetch failed with status ${userResponse.status}`);
    } 

    const user = (await userResponse.json()) as GithubUser;
    const reposResponse = await fetch(
        `${GITHUB_API_BASE}/users/${encodedUsername}/repos?sort=updated&per_page=10`
    );

    if(!reposResponse.ok){ 
        throw new Error(`GitHub repos fetch failed with status ${reposResponse.status}`);
    }

    const repos = (await reposResponse.json()) as GithubRepo[];
    
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
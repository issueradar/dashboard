import { parseRepoUrl, type Provider } from '@/lib/url-parser';
import { HttpMethod } from '@/types';

const providerServer = (provider: Provider) => {
  switch (provider) {
    case 'GITHUB':
      return 'https://api.github.com';
    case 'UNKNOWN':
    default:
      throw new Error('Currently supports GitHub only');
  }
};

const providerHeader = (provider: Provider): HeadersInit => {
  switch (provider) {
    case 'GITHUB':
      return {
        // Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        // 'X-GitHub-Api-Version': '2022-11-28', // TODO: dont know why
      };
    case 'UNKNOWN':
    default:
      throw new Error('Currently supports GitHub and GitLab only');
  }
};

type GetIssuesOptions = {
  repoUrl?: string | null;
  page?: number;
  state?: 'open' | 'closed' | 'all';
};

export const getIssues = async ({
  repoUrl,
  page = 1,
  state = 'all',
}: GetIssuesOptions) => {
  try {
    if (!repoUrl) {
      return [];
    }

    const { user, repo, provider } = parseRepoUrl(repoUrl);
    const server = providerServer(provider);

    const res = await fetch(
      `${server}/repos/${user}/${repo}/issues?page=${page}&state=${state}`,
      {
        method: HttpMethod.GET,
        headers: providerHeader(provider),
      },
    );

    if (res.ok) {
      const responseData = await res.json();
      return responseData;
    }
  } catch (error) {
    console.error(error);
  }
};

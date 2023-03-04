export type ParserReturn = {
  repo: string;
  user: string;
  provider: 'GITHUB' | 'GITLAB';
};

/*
 * Parse a git url to get user, repo and provider
 * @function repoUrlParser
 * @param {string} input The git url to parse, accepts HTTPS and SSH
 */
export const repoUrlParser = (input = '') => {
  const link = input.trim();

  let result: ParserReturn = {
    repo: '',
    user: '',
    provider: 'GITHUB',
  };

  // TODO: Add more checking to clean unnecessary long urls
  // e.g. https://github.com/vercel/next.js/tree/canary/examples/
  if (link.search('github.com') !== -1) {
    const cleaned = link
      .replace('https://', '')
      .replace('git@github.com:', '')
      .replace('.git', '');

    const splitted = cleaned.split('/');

    result = {
      repo: splitted[splitted.length - 1],
      user: splitted[splitted.length - 2],
      provider: 'GITHUB',
    };
  } else if (link.search('gitlab.com') !== -1) {
    const cleaned = link
      .replace('https://', '')
      .replace('git@gitlab.com:', '')
      .replace('.git', '');

    const splitted = cleaned.split('/');

    result = {
      repo: splitted[splitted.length - 1],
      user: splitted[splitted.length - 2],
      provider: 'GITLAB',
    };
  } else {
    throw new Error('Currently accepts only GitHub or GitLab repo URL');
  }

  return result;
};

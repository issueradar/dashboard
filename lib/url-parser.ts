export type Provider = 'GITHUB' | 'GITLAB' | 'UNKNOWN';

export type ParserResult = {
  repo: string;
  user: string;
  provider: Provider;
};

export const initial: ParserResult = {
  repo: '',
  user: '',
  provider: 'UNKNOWN',
};

/*
 * Parse a git url to get user, repo and provider
 * @function repoUrlParser
 * @param {string} input The git url to parse, accepts HTTPS and SSH
 */
export const repoUrlParser = (input = ''): ParserResult => {
  const link = input.trim().replace('https://', '').replace('.git', '');

  let result: ParserResult = initial;

  // TODO: Add more checking to clean unnecessary long urls instead of ignoring it
  // e.g. https://github.com/vercel/next.js/tree/canary/examples/
  if (link.split('/').length > 3) {
    return result;
  }

  if (link.search('github.com') !== -1) {
    const cleaned = link.replace('git@github.com:', '');

    const splitted = cleaned.split('/');

    result = {
      repo: splitted[splitted.length - 1],
      user: splitted[splitted.length - 2],
      provider: 'GITHUB',
    };
  } else if (link.search('gitlab.com') !== -1) {
    const cleaned = link.replace('git@gitlab.com:', '');

    const splitted = cleaned.split('/');

    result = {
      repo: splitted[splitted.length - 1],
      user: splitted[splitted.length - 2],
      provider: 'GITLAB',
    };
  }

  return result;
};

// alias :D
export const parseRepoUrl = repoUrlParser;

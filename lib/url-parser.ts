export type ParserReturn = {
  repo: string;
  user: string;
  provider: 'GITHUB' | 'GITLAB';
};

export const repoUrlParser = (input = '') => {
  const link = input.trim();

  let result: ParserReturn = {
    repo: '',
    user: '',
    provider: 'GITHUB',
  };

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
    throw new Error('Accept only GitHub or GitLab repo URL');
  }

  return result;
};

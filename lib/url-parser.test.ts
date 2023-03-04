import { describe, expect, it } from 'vitest';
import { repoUrlParser } from './url-parser';

describe('url-parser', () => {
  it('parses correct GitHub HTTPS git url', () => {
    const result = repoUrlParser('https://github.com/pmndrs/jotai.git');

    expect(result).toEqual({
      user: 'pmndrs',
      repo: 'jotai',
      provider: 'GITHUB',
    });
  });

  it('parses correct GitHub HTTPS repo url', () => {
    const result = repoUrlParser('https://github.com/pmndrs/jotai');

    expect(result).toEqual({
      user: 'pmndrs',
      repo: 'jotai',
      provider: 'GITHUB',
    });
  });

  it('parses correct GitHub SSH git url', () => {
    const result = repoUrlParser('git@github.com:pmndrs/jotai.git');

    expect(result).toEqual({
      user: 'pmndrs',
      repo: 'jotai',
      provider: 'GITHUB',
    });
  });

  it('parses correct GitLab HTTPS git url', () => {
    const result = repoUrlParser('https://gitlab.com/inkscape/inkscape.git');

    expect(result).toEqual({
      user: 'inkscape',
      repo: 'inkscape',
      provider: 'GITLAB',
    });
  });

  it('parses correct GitLab HTTPS repo url', () => {
    const result = repoUrlParser('https://gitlab.com/inkscape/inkscape');

    expect(result).toEqual({
      user: 'inkscape',
      repo: 'inkscape',
      provider: 'GITLAB',
    });
  });

  it('parses correct GitLab SSH git url', () => {
    const result = repoUrlParser('git@gitlab.com:inkscape/inkscape.git');

    expect(result).toEqual({
      user: 'inkscape',
      repo: 'inkscape',
      provider: 'GITLAB',
    });
  });

  it('throws error with bad link', () => {
    expect(() => repoUrlParser('https://nextjs.org/docs/testing')).toThrowError(
      /^Currently accepts only GitHub or GitLab repo URL$/,
    );
  });

  // TODO: Add more checkings for bad links
});

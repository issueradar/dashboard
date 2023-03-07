import type { Post, Project, Digest } from '@prisma/client';
import type { PropsWithChildren } from 'react';

export type WithChildren<T = object> = T & PropsWithChildren<object>;

export type WithClassName<T = object> = T & {
  className?: string;
};

export interface WithProjectPost extends Post {
  project: Project | null;
}

export interface WithProjectDigest extends Digest {
  project: Project | null;
}

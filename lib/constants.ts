import { UserRole } from '@prisma/client';

export const currentProtocol =
  process.env.NODE_ENV === 'production' ? 'https://' : 'http://';
export const currentHost =
  process.env.NODE_ENV === 'production' ? 'issueradar.com' : 'localhost:3000';

type Limit = {
  maxProjects: number;
  maxDigests: number;
};

export const limits: Record<UserRole, Limit> = {
  USER: {
    maxProjects: 3,
    maxDigests: 10,
  },
  ADMIN: {
    maxProjects: 99,
    maxDigests: 9999,
  },
};

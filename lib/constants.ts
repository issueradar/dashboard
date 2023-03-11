import { UserRole } from '@prisma/client';

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

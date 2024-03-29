import {
  createProject,
  deleteProject,
  getProject,
  updateProject,
} from '@/lib/api';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/lib/auth';
import { HttpMethod } from '@/types';

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function project(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).end();

  switch (req.method) {
    case HttpMethod.GET:
      return getProject(req, res, session);
    case HttpMethod.POST:
      return createProject(req, res);
    case HttpMethod.DELETE:
      return deleteProject(req, res);
    case HttpMethod.PUT:
      return updateProject(req, res);
    default:
      res.setHeader('Allow', [
        HttpMethod.GET,
        HttpMethod.POST,
        HttpMethod.DELETE,
        HttpMethod.PUT,
      ]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

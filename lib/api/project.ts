import cuid from 'cuid';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

import type { Project } from '@/types';
import type { Session } from 'next-auth';
import { placeholderBlurhash } from '../utils';

/**
 * Get Project
 *
 * Fetches & returns either a single or all projects available depending on
 * whether a `projectId` query parameter is provided. If not all projects are
 * returned
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 */
export async function getProject(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
): Promise<void | NextApiResponse<Array<Project> | (Project | null)>> {
  const { projectId } = req.query;

  if (Array.isArray(projectId))
    return res
      .status(400)
      .end('Bad request. projectId parameter cannot be an array.');

  if (!session.user.id)
    return res.status(500).end('Server failed to get session user ID');

  try {
    if (projectId) {
      const settings = await prisma.project.findFirst({
        where: {
          id: projectId,
          user: {
            id: session.user.id,
          },
        },
      });

      return res.status(200).json(settings);
    }

    const projects = await prisma.project.findMany({
      where: {
        user: {
          id: session.user.id,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json(projects);
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Create Project
 *
 * Creates a new project from a set of provided query parameters.
 * These include:
 *  - name
 *  - description
 *  - subdomain
 *  - userId
 *
 * Once created, the projects new `projectId` will be returned.
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function createProject(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void | NextApiResponse<{
  projectId: string;
}>> {
  const { userId, ...rest } = req.body;

  try {
    const response = await prisma.project.create({
      data: {
        user: {
          connect: { id: userId },
        },
        ...rest,
      },
    });

    return res.status(201).json({
      projectId: response.id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Delete Project
 *
 * Deletes a project from the database using a provided `projectId` query
 * parameter.
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function deleteProject(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void | NextApiResponse> {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user.id) return res.status(401).end('Unauthorized');
  const { projectId } = req.query;

  if (!projectId || typeof projectId !== 'string') {
    return res
      .status(400)
      .json({ error: 'Missing or misconfigured project ID' });
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      user: {
        id: session.user.id,
      },
    },
  });
  if (!project) return res.status(404).end('Project not found');

  if (Array.isArray(projectId))
    return res
      .status(400)
      .end('Bad request. projectId parameter cannot be an array.');

  try {
    await prisma.$transaction([
      prisma.post.deleteMany({
        where: {
          project: {
            id: projectId,
          },
        },
      }),
      prisma.project.delete({
        where: {
          id: projectId,
        },
      }),
    ]);

    return res.status(200).end();
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Update project
 *
 * Updates a project & all of its data using a collection of provided
 * query parameters. These include the following:
 *  - id
 *  - currentSubdomain
 *  - name
 *  - description
 *  - image
 *  - imageBlurhash
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function updateProject(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void | NextApiResponse<Project>> {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user.id) return res.status(401).end('Unauthorized');

  const { id, currentSubdomain, ...rest } = req.body;

  if (!id || typeof id !== 'string') {
    return res
      .status(400)
      .json({ error: 'Missing or misconfigured project ID' });
  }

  const project = await prisma.project.findFirst({
    where: {
      id,
      user: {
        id: session.user.id,
      },
    },
  });
  if (!project) return res.status(404).end('Project not found');

  const sub = req.body.subdomain.replace(/[^a-zA-Z0-9/-]+/g, '');
  const subdomain = sub.length > 0 ? sub : currentSubdomain;

  try {
    const response = await prisma.project.update({
      where: {
        id: id,
      },
      data: {
        subdomain,
        ...rest,
      },
    });

    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

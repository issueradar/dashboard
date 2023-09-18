import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import type { Session } from 'next-auth';
import type { Digest, Project, WithProjectDigest } from '@/types';

interface AllDigests {
  digests: Digest[];
  project: Project | null;
}

/**
 * Get Digest
 *
 * Fetches & returns either a single or all digests available depending on
 * whether a `digestId` query parameter is provided. If not all digests are
 * returned in descending order.
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function getDigest(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
): Promise<void | NextApiResponse<AllDigests | (WithProjectDigest | null)>> {
  const { digestId, projectId, published } = req.query;

  if (
    Array.isArray(digestId) ||
    Array.isArray(projectId) ||
    Array.isArray(published) ||
    !session.user.id
  )
    return res.status(400).end('Bad request. Query parameters are not valid.');

  try {
    if (digestId) {
      const digest = await prisma.digest.findFirst({
        where: {
          id: digestId,
          project: {
            user: {
              id: session.user.id,
            },
          },
        },
        include: {
          project: true,
        },
      });

      return res.status(200).json(digest);
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        user: {
          id: session.user.id,
        },
      },
    });

    const digests = !project
      ? []
      : await prisma.digest.findFirst({
          where: {
            project: {
              id: projectId,
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

    const totalDigests = await prisma.digest.count();

    return res.status(200).json({
      digests,
      totalDigests,
      project,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Create Digest
 *
 * Creates a new digest from a provided `projectId` query parameter.
 *
 * Once created, the projects new `digestId` will be returned.
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function createDigest(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
): Promise<void | NextApiResponse<{
  digestId: string;
}>> {
  const { projectId } = req.query;
  const { content } = req.body;

  if (!projectId || typeof projectId !== 'string' || !session?.user?.id) {
    return res
      .status(400)
      .json({ error: 'Missing or misconfigured project ID or session ID' });
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

  try {
    const response = await prisma.digest.create({
      data: {
        content,
        project: {
          connect: {
            id: projectId,
          },
        },
      },
    });

    return res.status(201).json({
      digestId: response.id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Delete Digest
 *
 * Deletes a digest from the database using a provided `digestId` query
 * parameter.
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function deleteDigest(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
): Promise<void | NextApiResponse> {
  const { digestId } = req.query;

  if (!digestId || typeof digestId !== 'string' || !session?.user?.id) {
    return res
      .status(400)
      .json({ error: 'Missing or misconfigured project ID or session ID' });
  }

  const project = await prisma.project.findFirst({
    where: {
      digests: {
        some: {
          id: digestId,
        },
      },
      user: {
        id: session.user.id,
      },
    },
  });
  if (!project) return res.status(404).end('Project not found');

  try {
    await prisma.digest.delete({
      where: {
        id: digestId,
      },
      include: {
        project: {
          select: { subdomain: true, customDomain: true },
        },
      },
    });

    return res.status(200).end();
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Update Digest
 *
 * Updates a digest & all of its data using a collection of provided
 * query parameters. These include the following:
 *  - id
 *  - title
 *  - description
 *  - content
 *  - image
 *  - imageBlurhash
 *  - published
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function updateDigest(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
): Promise<void | NextApiResponse<Digest>> {
  const { id, content, published } = req.body;

  if (!id || typeof id !== 'string' || !session?.user?.id) {
    return res
      .status(400)
      .json({ error: 'Missing or misconfigured project ID or session ID' });
  }

  const project = await prisma.project.findFirst({
    where: {
      digests: {
        some: {
          id,
        },
      },
      user: {
        id: session.user.id,
      },
    },
  });
  if (!project) return res.status(404).end('Project not found');

  try {
    const digest = await prisma.digest.update({
      where: {
        id: id,
      },
      data: {
        content,
        published,
      },
    });

    return res.status(200).json(digest);
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

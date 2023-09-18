import prisma from '@/lib/prisma';

import { NextApiRequest, NextApiResponse } from 'next';
import type { Session } from 'next-auth';
import { revalidate } from '@/lib/revalidate';
import { getBlurDataURL, placeholderBlurhash } from '@/lib/utils';

import type { Post, Project, WithProjectPost } from '@/types';

interface AllPosts {
  posts: Array<Post>;
  project: Project | null;
}

/**
 * Get Post
 *
 * Fetches & returns either a single or all posts available depending on
 * whether a `postId` query parameter is provided. If not all posts are
 * returned in descending order.
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function getPost(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
): Promise<void | NextApiResponse<AllPosts | (WithProjectPost | null)>> {
  const { postId, projectId, published } = req.query;

  if (
    Array.isArray(postId) ||
    Array.isArray(projectId) ||
    Array.isArray(published) ||
    !session.user.id
  )
    return res.status(400).end('Bad request. Query parameters are not valid.');

  try {
    if (postId) {
      const post = await prisma.post.findFirst({
        where: {
          id: postId,
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

      return res.status(200).json(post);
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        user: {
          id: session.user.id,
        },
      },
    });

    const posts = !project
      ? []
      : await prisma.post.findMany({
          where: {
            project: {
              id: projectId,
            },
            published: JSON.parse(published || 'true'),
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

    return res.status(200).json({
      posts,
      project,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Create Post
 *
 * Creates a new post from a provided `projectId` query parameter.
 *
 * Once created, the projects new `postId` will be returned.
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function createPost(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
): Promise<void | NextApiResponse<{
  postId: string;
}>> {
  const { projectId } = req.query;

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
    const response = await prisma.post.create({
      data: {
        image: `/placeholder.png`,
        imageBlurhash: placeholderBlurhash,
        project: {
          connect: {
            id: projectId,
          },
        },
      },
    });

    return res.status(201).json({
      postId: response.id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Delete Post
 *
 * Deletes a post from the database using a provided `postId` query
 * parameter.
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function deletePost(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
): Promise<void | NextApiResponse> {
  const { postId } = req.query;

  if (!postId || typeof postId !== 'string' || !session?.user?.id) {
    return res
      .status(400)
      .json({ error: 'Missing or misconfigured project ID or session ID' });
  }

  const project = await prisma.project.findFirst({
    where: {
      posts: {
        some: {
          id: postId,
        },
      },
      user: {
        id: session.user.id,
      },
    },
  });
  if (!project) return res.status(404).end('Project not found');

  try {
    const response = await prisma.post.delete({
      where: {
        id: postId,
      },
      include: {
        project: {
          select: { subdomain: true, customDomain: true },
        },
      },
    });
    if (response?.project?.subdomain) {
      // revalidate for subdomain
      await revalidate(
        `https://${response.project?.subdomain}.vercel.pub`, // hostname to be revalidated
        response.project.subdomain, // projectId
        response.slug, // slugname for the post
      );
    }
    if (response?.project?.customDomain)
      // revalidate for custom domain
      await revalidate(
        `https://${response.project.customDomain}`, // hostname to be revalidated
        response.project.customDomain, // projectId
        response.slug, // slugname for the post
      );

    return res.status(200).end();
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

/**
 * Update Post
 *
 * Updates a post & all of its data using a collection of provided
 * query parameters. These include the following:
 *  - id
 *  - title
 *  - description
 *  - content
 *  - slug
 *  - image
 *  - imageBlurhash
 *  - published
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function updatePost(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
): Promise<void | NextApiResponse<Post>> {
  const {
    id,
    title,
    description,
    content,
    slug,
    image,
    published,
    subdomain,
    customDomain,
  } = req.body;

  if (!id || typeof id !== 'string' || !session?.user?.id) {
    return res
      .status(400)
      .json({ error: 'Missing or misconfigured project ID or session ID' });
  }

  const project = await prisma.project.findFirst({
    where: {
      posts: {
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
    const post = await prisma.post.update({
      where: {
        id: id,
      },
      data: {
        title,
        description,
        content,
        slug,
        image,
        imageBlurhash: (await getBlurDataURL(image)) ?? undefined,
        published,
      },
    });
    if (subdomain) {
      // revalidate for subdomain
      await revalidate(
        `https://${subdomain}.vercel.pub`, // hostname to be revalidated
        subdomain, // projectId
        slug, // slugname for the post
      );
    }
    if (customDomain)
      // revalidate for custom domain
      await revalidate(
        `https://${customDomain}`, // hostname to be revalidated
        customDomain, // projectId
        slug, // slugname for the post
      );

    return res.status(200).json(post);
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}

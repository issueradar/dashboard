import { cache } from "react";
import type { _ProjectData } from "@/types";
import prisma from "@/lib/prisma";
import remarkMdx from "remark-mdx";
import { remark } from "remark";
import { serialize } from "next-mdx-remote/serialize";
import { replaceExamples, replaceTweets } from "@/lib/remark-plugins";

export const getProjectData = cache(async (project: string): Promise<_ProjectData> => {
  let filter: {
    subdomain?: string;
    customDomain?: string;
  } = {
    subdomain: project,
  };

  if (project.includes(".")) {
    filter = {
      customDomain: project,
    };
  }

  const data = (await prisma.project.findUnique({
    where: filter,
    include: {
      user: true,
      posts: {
        where: {
          published: true,
        },
        orderBy: [
          {
            createdAt: "desc",
          },
        ],
      },
    },
  })) as _ProjectData;

  return data;
});

export const getPostData = cache(async (project: string, slug: string) => {
  let filter: {
    subdomain?: string;
    customDomain?: string;
  } = {
    subdomain: project,
  };

  if (project.includes(".")) {
    filter = {
      customDomain: project,
    };
  }

  const data = await prisma.post.findFirst({
    where: {
      project: {
        ...filter,
      },
      slug,
    },
    include: {
      project: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!data) return { notFound: true, revalidate: 10 };

  const [mdxSource, adjacentPosts] = await Promise.all([
    getMdxSource(data.content!),
    prisma.post.findMany({
      where: {
        project: {
          ...filter,
        },
        published: true,
        NOT: {
          id: data.id,
        },
      },
      select: {
        slug: true,
        title: true,
        createdAt: true,
        description: true,
        image: true,
        imageBlurhash: true,
      },
    }),
  ]);

  return {
    data: {
      ...data,
      mdxSource,
    },
    adjacentPosts,
  };
});

async function getMdxSource(postContents: string) {
  // Serialize the content string into MDX
  const mdxSource = await serialize(postContents, {
    mdxOptions: {
      remarkPlugins: [replaceTweets, () => replaceExamples(prisma)],
    },
  });

  return mdxSource;
}

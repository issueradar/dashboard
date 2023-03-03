import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import { useRouter } from 'next/router';

import BlogCard from '@/components/BlogCard';
import BlurImage from '@/components/BlurImage';
import Examples from '@/components/mdx/Examples';
import Layout from '@/components/projects/Layout';
import Loader from '@/components/projects/Loader';
import prisma from '@/lib/prisma';
import Tweet from '@/components/mdx/Tweet';
import {
  replaceExamples,
  replaceLinks,
  replaceTweets,
} from '@/lib/remark-plugins';

import type { AdjacentPost, Meta, _ProjectSlugData } from '@/types';
import type { GetStaticPaths, GetStaticProps } from 'next';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';
import type { ParsedUrlQuery } from 'querystring';
import { placeholderBlurhash, toDateString } from '@/lib/utils';

const components = {
  a: replaceLinks,
  BlurImage,
  Examples,
  Tweet,
};

interface PathProps extends ParsedUrlQuery {
  project: string;
  slug: string;
}

interface PostProps {
  stringifiedData: string;
  stringifiedAdjacentPosts: string;
}

export default function Post({
  stringifiedAdjacentPosts,
  stringifiedData,
}: PostProps) {
  const router = useRouter();
  if (router.isFallback) return <Loader />;

  const data = JSON.parse(stringifiedData) as _ProjectSlugData & {
    mdxSource: MDXRemoteSerializeResult<Record<string, unknown>>;
  };
  const adjacentPosts = JSON.parse(
    stringifiedAdjacentPosts,
  ) as Array<AdjacentPost>;

  const meta = {
    description: data.description,
    logo: '/logo.png',
    ogImage: data.image,
    ogUrl: `https://${data.project?.subdomain}.vercel.pub/${data.slug}`,
    title: data.title,
  } as Meta;

  return (
    <Layout meta={meta} subdomain={data.project?.subdomain ?? undefined}>
      <div className="flex flex-col justify-center items-center">
        <div className="text-center w-full md:w-7/12 m-auto">
          <p className="text-sm md:text-base font-light text-gray-500 w-10/12 m-auto my-5">
            {toDateString(data.createdAt)}
          </p>
          <h1 className="font-bold text-3xl font-cal md:text-6xl mb-10 text-gray-800">
            {data.title}
          </h1>
          <p className="text-md md:text-lg text-gray-600 w-10/12 m-auto">
            {data.description}
          </p>
        </div>
        <a
          // if you are using Github OAuth, you can get rid of the Twitter option
          href={
            data.project?.user?.username
              ? `https://twitter.com/${data.project.user.username}`
              : `https://github.com/${data.project?.user?.gh_username}`
          }
          rel="noreferrer"
          target="_blank"
        >
          <div className="my-8">
            <div className="relative w-8 h-8 md:w-12 md:h-12 rounded-full overflow-hidden inline-block align-middle">
              {data.project?.user?.image ? (
                <BlurImage
                  alt={data.project?.user?.name ?? 'User Avatar'}
                  height={80}
                  src={data.project.user.image}
                  width={80}
                />
              ) : (
                <div className="absolute flex items-center justify-center w-full h-full bg-gray-100 text-gray-500 text-4xl select-none">
                  ?
                </div>
              )}
            </div>
            <div className="inline-block text-md md:text-lg align-middle ml-3">
              by{' '}
              <span className="font-semibold">{data.project?.user?.name}</span>
            </div>
          </div>
        </a>
      </div>
      <div className="relative h-80 md:h-150 w-full max-w-screen-lg lg:w-2/3 md:w-5/6 m-auto mb-10 md:mb-20 md:rounded-2xl overflow-hidden">
        {data.image ? (
          <BlurImage
            alt={data.title ?? 'Post image'}
            width={1200}
            height={630}
            className="w-full h-full object-cover"
            placeholder="blur"
            blurDataURL={data.imageBlurhash ?? placeholderBlurhash}
            src={data.image}
          />
        ) : (
          <div className="absolute flex items-center justify-center w-full h-full bg-gray-100 text-gray-500 text-4xl select-none">
            ?
          </div>
        )}
      </div>

      <article
        className="w-11/12 sm:w-3/4 m-auto prose prose-md sm:prose-lg"
        suppressHydrationWarning={true}
      >
        <MDXRemote {...data.mdxSource} components={components} />
      </article>

      {adjacentPosts.length > 0 && (
        <div className="relative mt-10 sm:mt-20 mb-20">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-2 bg-white text-sm text-gray-500">
              Continue Reading
            </span>
          </div>
        </div>
      )}
      {adjacentPosts && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-8 mx-5 lg:mx-12 2xl:mx-auto mb-20 max-w-screen-xl">
          {adjacentPosts.map((data, index) => (
            <BlogCard key={index} data={data} />
          ))}
        </div>
      )}
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths<PathProps> = async () => {
  const posts = await prisma.post.findMany({
    where: {
      published: true,
      // you can remove this if you want to generate all projects at build time
      project: {
        subdomain: 'demo',
      },
    },
    select: {
      slug: true,
      project: {
        select: {
          subdomain: true,
          customDomain: true,
        },
      },
    },
  });

  return {
    paths: posts.flatMap((post) => {
      if (post.project === null || post.project.subdomain === null) return [];

      if (post.project.customDomain) {
        return [
          {
            params: {
              project: post.project.customDomain,
              slug: post.slug,
            },
          },
          {
            params: {
              project: post.project.subdomain,
              slug: post.slug,
            },
          },
        ];
      } else {
        return {
          params: {
            project: post.project.subdomain,
            slug: post.slug,
          },
        };
      }
    }),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<PostProps, PathProps> = async ({
  params,
}) => {
  if (!params) throw new Error('No path parameters found');

  const { project, slug } = params;

  let filter: {
    subdomain?: string;
    customDomain?: string;
  } = {
    subdomain: project,
  };

  if (project.includes('.')) {
    filter = {
      customDomain: project,
    };
  }

  const data = (await prisma.post.findFirst({
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
  })) as _ProjectSlugData | null;

  // console.log(data);

  if (!data) return { notFound: true, revalidate: 10 };

  const [mdxSource, adjacentPosts] = await Promise.all([
    getMdxSource(data.content ?? ''),
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
    props: {
      stringifiedData: JSON.stringify({
        ...data,
        mdxSource,
      }),
      stringifiedAdjacentPosts: JSON.stringify(adjacentPosts),
    },
    revalidate: 3600,
  };
};

async function getMdxSource(postContents: string) {
  // Serialize the content string into MDX
  const mdxSource = await serialize(postContents, {
    mdxOptions: {
      remarkPlugins: [replaceTweets, () => replaceExamples(prisma)],
    },
  });

  return mdxSource;
}
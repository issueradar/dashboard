import Head from 'next/head';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Button, Divider, Flex, Text } from '@chakra-ui/react';
import { Image, Link } from '@/components';
import useRequireAuth from '@/lib/useRequireAuth';
import Loader from './Loader';

import type { WithChildren } from '@/types';

interface LayoutProps extends WithChildren {
  projectId?: string;
}

export default function Layout({ projectId, children }: LayoutProps) {
  const title = 'IssueRadar';
  const description = 'Quickly get biggest issues from a GitHub project';
  const logo = '/favicon.ico';
  const router = useRouter();
  const projectPage = router.pathname.startsWith('/app/project/[id]');
  const postPage = router.pathname.startsWith('/app/post/[id]');
  const rootPage = !projectPage && !postPage;
  const tab = rootPage
    ? router.asPath.split('/')[1]
    : router.asPath.split('/')[3];

  const session = useRequireAuth();
  if (!session) return <Loader />;

  return (
    <>
      <Head>
        <title>{title}</title>
        <link rel="icon" href={logo} />
        <link rel="shortcut icon" type="image/x-icon" href={logo} />
        <link rel="apple-touch-icon" sizes="180x180" href={logo} />
        <meta name="theme-color" content="#7b46f6" />

        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta itemProp="name" content={title} />
        <meta itemProp="description" content={description} />
        <meta itemProp="image" content={logo} />
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={logo} />
        <meta property="og:type" content="webproject" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:project" content="@Vercel" />
        <meta name="twitter:creator" content="@StevenTey" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={logo} />
      </Head>

      <Flex
        alignItems="center"
        justifyContent="between"
        height={16}
        marginX="auto"
        paddingX={10}
        maxWidth="100%"
        borderBottomWidth="1px"
        borderBottomColor="gray.200"
      >
        <Flex width={60} justifyContent="space-between">
          <Link href="/" width={40} display="flex" alignItems="center">
            {session.user && session.user.image && (
              <Image
                src={session.user.image}
                borderRadius="full"
                width={12}
                height={12}
                alt={session.user.name ?? 'User avatar'}
              />
            )}
            <Text fontWeight="bold" noOfLines={1} marginLeft={4} maxWidth={24}>
              {session.user?.name}
            </Text>
          </Link>

          <Divider orientation="vertical" />

          <Button variant="link" onClick={() => signOut()}>
            Logout
          </Button>
        </Flex>
      </Flex>
      {rootPage && (
        <Flex
          height={16}
          justifyContent="center"
          alignItems="center"
          borderBottomWidth="1px"
          borderBottomColor="gray.200"
        >
          <Link
            href="/"
            marginX={2}
            borderBottom="1px"
            borderBottomColor={tab === '' ? 'gray.400' : 'transparent'}
            _hover={{ textDecoration: 'none' }}
          >
            My Projects
          </Link>
          <Link
            href="/settings"
            marginX={2}
            borderBottom="1px"
            borderBottomColor={tab === 'settings' ? 'gray.400' : 'transparent'}
            _hover={{ textDecoration: 'none' }}
          >
            Settings
          </Link>
        </Flex>
      )}
      {projectPage && (
        <Flex
          height={16}
          justifyContent="center"
          alignItems="center"
          borderBottomWidth="1px"
          borderBottomColor="gray.200"
        >
          <Flex
            paddingX={10}
            justifyContent="space-between"
            alignItems="center"
            width="100%"
          >
            <Link href="/">← All Projects</Link>
            <Flex justifyContent="space-between" alignItems="center">
              <Link
                href={`/project/${router.query.id}`}
                marginX={2}
                borderBottom="1px"
                borderBottomColor={!tab ? 'gray.400' : 'transparent'}
                _hover={{ textDecoration: 'none' }}
              >
                Posts
              </Link>
              <Link
                href={`/project/${router.query.id}/drafts`}
                marginX={2}
                borderBottom="1px"
                borderBottomColor={
                  tab === 'drafts' ? 'gray.400' : 'transparent'
                }
                _hover={{ textDecoration: 'none' }}
              >
                Drafts
              </Link>
              <Link
                href={`/project/${router.query.id}/settings`}
                marginX={2}
                borderBottom="1px"
                borderBottomColor={
                  tab === 'settings' ? 'gray.400' : 'transparent'
                }
                _hover={{ textDecoration: 'none' }}
              >
                Settings
              </Link>
            </Flex>
            <div />
          </Flex>
        </Flex>
      )}
      {postPage && (
        <div className="absolute left-0 right-0 top-16 font-cal border-b bg-white border-gray-200">
          <div className="flex justify-between items-center space-x-16 max-w-screen-xl mx-auto px-10 sm:px-20">
            {projectId ? (
              <Link
                href={`/project/${projectId}`}
                className="md:inline-block ml-3 hidden"
              >
                ← All Posts
              </Link>
            ) : (
              <div>
                ←<p className="md:inline-block ml-3 hidden">All Posts</p>
              </div>
            )}

            <div className="flex justify-between items-center space-x-10 md:space-x-16">
              <Link
                href={`/post/${router.query.id}`}
                className={`border-b-2 ${
                  !tab ? 'border-black' : 'border-transparent'
                } py-3`}
              >
                Editor
              </Link>
              <Link
                href={`/post/${router.query.id}/settings`}
                className={`border-b-2 ${
                  tab == 'settings' ? 'border-black' : 'border-transparent'
                } py-3`}
              >
                Settings
              </Link>
            </div>
            <div />
          </div>
        </div>
      )}
      <div className="pt-28">{children}</div>
    </>
  );
}

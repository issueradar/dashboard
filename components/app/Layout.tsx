import Head from 'next/head';
import type { Project } from '@prisma/client';
import { Box, Container, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import useRequireAuth from '@/lib/useRequireAuth';
import Loader from './Loader';
import { Navbar } from './Navbar';
import { ProjectNavbar } from './ProjectNavbar';

import type { WithChildren } from '@/types';

interface LayoutProps extends WithChildren {
  project?: Project | null;
}

export default function Layout({ children, project }: LayoutProps) {
  const title = 'IssueRadar';
  const description = 'Quickly get biggest issues from a GitHub project';
  const logo = '/favicon.ico';
  const router = useRouter();
  const projectPage = router.pathname.startsWith('/app/project/[id]');
  const rootPage = !projectPage;
  const tab = rootPage
    ? router.asPath.split('/')[1]
    : router.asPath.split('/')[3];

  const currentTitle = () => {
    if (!projectPage && tab === 'settings') {
      return 'Profile settings';
    }

    if (rootPage) {
      return 'My projects';
    }

    if (projectPage && project) {
      return project.name;
    }

    return '...';
  };

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

      <Navbar user={session.user} />

      <Box as="section" px={{ base: '2', lg: '4' }}>
        <Container maxW="100vw" mt={2} py={{ base: '1', lg: '2' }}>
          <Text as="h1" fontSize="4xl" fontWeight="bold">
            {currentTitle()}
          </Text>
        </Container>
      </Box>

      {project && <ProjectNavbar project={project} />}

      <Box as="main" px={{ base: '2', lg: '4' }}>
        <Container maxW="100vw" paddingTop={4}>
          {children}
        </Container>
      </Box>
    </>
  );
}

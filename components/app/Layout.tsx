import type { Project } from '@prisma/client';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { Box, Container, Flex, Skeleton, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import useRequireAuth from '@/lib/useRequireAuth';
import { CustomHead } from '@/components/app/CustomHead';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ProjectNavbar } from './ProjectNavbar';

import type { WithChildren } from '@/types';

interface LayoutProps extends WithChildren {
  projectId?: string;
}

export default function Layout({ children, projectId }: LayoutProps) {
  const session = useRequireAuth();

  const router = useRouter();

  const projectPage = router.pathname.startsWith('/app/project/[id]');
  const rootPage = !projectPage;
  const tab = rootPage
    ? router.asPath.split('/')[1]
    : router.asPath.split('/')[3];

  const { data: project, isLoading } = useSWR<Project | null>(
    projectId && `/api/project?projectId=${projectId}`,
    fetcher,
    {
      onError: () => router.push('/'),
      revalidateOnFocus: false,
    },
  );

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

    return 'Loading...';
  };

  if (!session) return null;

  return (
    <>
      <CustomHead
        title="IssueRadar"
        description="Quickly get biggest issues from a GitHub project"
      />

      <Flex direction="column" justifyContent="space-between" height="100vh">
        <Navbar user={session.user} />

        <Box as="section" flex="1" px={{ base: '2', lg: '4' }}>
          <Container maxW="100vw" mt={2} py={{ base: '1', lg: '2' }}>
            <Skeleton isLoaded={!isLoading} width="max-content">
              <Text as="h1" fontSize="4xl" fontWeight="bold">
                {currentTitle()}
              </Text>
            </Skeleton>
          </Container>

          {project && <ProjectNavbar project={project} />}

          <Container maxW="100vw" paddingTop={4}>
            {children}
          </Container>
        </Box>

        <Footer />
      </Flex>
    </>
  );
}

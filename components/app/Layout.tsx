import type { Project } from '@prisma/client';
import { Box, Container, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import useRequireAuth from '@/lib/useRequireAuth';
import { CustomHead } from '@/components/app/CustomHead';
import Loader from './Loader';
import { Navbar } from './Navbar';
import { ProjectNavbar } from './ProjectNavbar';

import type { WithChildren } from '@/types';

interface LayoutProps extends WithChildren {
  project?: Project | null;
}

export default function Layout({ children, project }: LayoutProps) {
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
      <CustomHead
        title="IssueRadar"
        description="Quickly get biggest issues from a GitHub project"
      />

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

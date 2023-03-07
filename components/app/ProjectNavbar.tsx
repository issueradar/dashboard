import {
  Box,
  Button,
  ButtonGroup,
  Container,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import type { Project } from '@prisma/client';
import { Link } from '@/components';

export type ProjectNavbarProps = {
  project: Project;
};

export const ProjectNavbar = ({ project }: ProjectNavbarProps) => {
  const borderColor = useColorModeValue('gray.100', 'gray.700');

  return (
    <Box
      as="nav"
      role="navigation"
      aria-label="Project navigation"
      borderBottom="1px"
      borderBottomColor={borderColor}
    >
      <Container maxW="100vw" py={{ base: '1', lg: '2' }}>
        <Flex justify="space-between" flex="1">
          <ButtonGroup size="sm" variant="link" spacing="8">
            <Button>
              <Link
                href={`/project/${project.id}/`}
                _hover={{ textDecoration: 'none' }}
              >
                Dashboard
              </Link>
            </Button>
            <Button>
              <Link
                href={`/project/${project.id}/settings`}
                _hover={{ textDecoration: 'none' }}
              >
                Settings
              </Link>
            </Button>
          </ButtonGroup>
        </Flex>
      </Container>
    </Box>
  );
};

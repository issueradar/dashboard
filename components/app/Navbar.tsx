import {
  Box,
  Button,
  ButtonGroup,
  Container,
  // Divider,
  Flex,
  HStack,
  Text,
} from '@chakra-ui/react';
import { signOut } from 'next-auth/react';
import type { Session } from 'next-auth';
import { Image, Link } from '@/components';

export type NavbarProps = {
  user: Session['user'];
};

export const Navbar = ({ user }: NavbarProps) => {
  return (
    <Box as="nav" role="navigation" boxShadow="sm">
      <Container maxW="100vw" py={{ base: '1', lg: '2' }}>
        <HStack spacing="10" justify="space-between">
          <Link href="/" width={40} display="flex" alignItems="center">
            <Text fontSize="lg" fontWeight="bold">
              IssueRadar
            </Text>
          </Link>

          <Flex justify="space-between" flex="1">
            <ButtonGroup variant="link" spacing="8">
              <Button>
                <Link href="/" _hover={{ textDecoration: 'none' }}>
                  Projects
                </Link>
              </Button>
            </ButtonGroup>
            <HStack spacing="3">
              <Link
                href="/settings"
                width={40}
                display="flex"
                alignItems="center"
              >
                {user && user.image && (
                  <Image
                    src={user.image}
                    borderRadius="full"
                    width={10}
                    height={10}
                    alt={user.name ?? 'User avatar'}
                  />
                )}
                <Text
                  fontWeight="bold"
                  noOfLines={1}
                  marginLeft={4}
                  maxWidth={24}
                >
                  {user?.name}
                </Text>
              </Link>

              <Button variant="link" onClick={() => signOut()}>
                Logout
              </Button>
            </HStack>
          </Flex>
        </HStack>
      </Container>
    </Box>
  );
};

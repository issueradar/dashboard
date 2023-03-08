import {
  Box,
  Button,
  Center,
  Container,
  Heading,
  HStack,
  Stack,
  Text,
} from '@chakra-ui/react';
import { CustomHead } from '@/components/app/CustomHead';
import { Logo } from '@/components/Logo';
import { ArrowForwardIcon } from '@chakra-ui/icons';

export default function Home() {
  return (
    <>
      <CustomHead
        title="IssueRadar"
        description="Quickly get biggest issues from a GitHub project"
      />

      <Container marginY={4} maxWidth="container.md" centerContent>
        <Stack textAlign="center" spacing={20}>
          <Center>
            <Logo width={180} />
          </Center>

          <Stack spacing={5}>
            <Heading as="h1" size="4xl" textAlign="center">
              Keep your project&apos;s issues in sight.
            </Heading>

            <Text fontSize="2xl">
              Summarizing Github Repository Issues in One Minute
            </Text>
          </Stack>

          <Center>
            <HStack spacing={5}>
              <Button colorScheme="green">Request Access</Button>
              <Button
                colorScheme="green"
                variant="outline"
                rightIcon={<ArrowForwardIcon />}
              >
                Login
              </Button>
            </HStack>
          </Center>
        </Stack>
      </Container>
    </>
  );
}

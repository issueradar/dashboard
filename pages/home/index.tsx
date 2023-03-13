import {
  Button,
  Center,
  Container,
  Heading,
  HStack,
  Stack,
  Text,
} from '@chakra-ui/react';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import { CustomHead } from '@/components/app/CustomHead';
import { Logo } from '@/components/Logo';
import { currentProtocol, currentHost } from '@/lib/constants';

export default function Home() {
  const router = useRouter();

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
              <Button
                colorScheme="green"
                size="lg"
                rightIcon={<ArrowForwardIcon />}
                onClick={() =>
                  router.push(`${currentProtocol}app.${currentHost}/login`)
                }
              >
                Take early access experience
              </Button>
            </HStack>
          </Center>
        </Stack>
      </Container>
    </>
  );
}

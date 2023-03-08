import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Button, Center, Container, Flex, Stack } from '@chakra-ui/react';
import { CustomHead } from '@/components/app/CustomHead';
import { GithubIcon } from '@/components/icons';
import { Logo } from '@/components/Logo';

export default function Login() {
  const [loading, setLoading] = useState(false);

  return (
    <>
      <CustomHead
        title="Login | IssueRadar"
        description="Quickly get biggest issues from a GitHub project"
      />

      <Flex as="section" h="100vh" alignItems="center">
        <Container centerContent>
          <Stack textAlign="center" spacing={20}>
            <Center>
              <Logo width={180} />
            </Center>

            <Button
              disabled={loading}
              isLoading={loading}
              leftIcon={<GithubIcon />}
              loadingText="Logging in..."
              size="lg"
              onClick={() => {
                setLoading(true);
                signIn('github');
              }}
            >
              Login with GitHub
            </Button>
          </Stack>
        </Container>
      </Flex>
    </>
  );
}

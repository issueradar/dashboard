import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Box, Button, Container, Flex, Heading, Text } from '@chakra-ui/react';
import { CustomHead } from '@/components/app/CustomHead';
import { GithubIcon } from '@/components/icons';

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
          <Box textAlign="center" mb={10}>
            <Heading as="h2" size="xl">
              Issue Radar
            </Heading>
            <Text>Generate in-depth report for GitHub repo</Text>
          </Box>

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
        </Container>
      </Flex>
    </>
  );
}

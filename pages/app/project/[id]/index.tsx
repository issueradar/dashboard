import { useChat } from 'ai/react';
import type { Project, Digest } from '@prisma/client';
import ReactMarkdown from 'react-markdown';
import useSWR, { mutate } from 'swr';
import { useRouter } from 'next/router';
import { useState, FormEvent, useEffect } from 'react';
import {
  Box,
  Button,
  Center,
  Flex,
  SkeletonText,
  Text,
} from '@chakra-ui/react';
import { HttpMethod, Issue, Message } from '@/types';
import Layout from '@/components/app/Layout';
import { fetcher } from '@/lib/fetcher';
import { getIssues } from '@/lib/issue';
import { nanoid } from '@/lib/utils';

type ProjectDigestData = {
  digests: Digest;
  totalDigests: number;
  project: Project | null;
};

export default function ProjectIndex() {
  const [isWorking, setWorking] = useState(false);

  const router = useRouter();
  const { id: projectId } = router.query;

  const { data, isLoading } = useSWR<ProjectDigestData>(
    projectId && `/api/digest?projectId=${projectId}`,
    fetcher,
    {
      onSuccess: (data) => !data?.project && router.push('/'),
    },
  );

  const [issues, setIssues] = useState<Issue[]>([]);

  const { messages, isLoading: isThinking, reload, setMessages } = useChat();

  useEffect(() => {
    let unmount = false;

    const fetchData = async () => {
      const issueData = [];

      const repoUrl = data?.project?.repoUrl;

      setWorking(true);

      for (let page = 1; page <= 3; page++) {
        await new Promise((r) => setTimeout(r, 500));
        const newIssues: Issue[] = await getIssues({ repoUrl, page });
        issueData.push(...newIssues);
      }

      if (!unmount) {
        setIssues(issueData);
        setWorking(false);
      }
    };
    if (!isThinking) {
      fetchData();
    }

    return () => {
      unmount = true;
    };
  }, [data, isThinking]);

  const lastResponse = messages.slice(issues.length + 3)[0];

  useEffect(() => {
    let unmount = false;

    const saveData = async () => {
      if (lastResponse && !isThinking) {
        const digestContent = lastResponse.content;

        if (digestContent && projectId) {
          setWorking(true);

          const response = await fetch(`/api/digest?projectId=${projectId}`, {
            method: HttpMethod.POST,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: digestContent }),
          });

          if (response.ok) {
            mutate(`/api/digest?projectId=${projectId}`);
          }

          setWorking(false);
        }
      }
    };
    saveData();

    return () => {
      unmount = true;
    };
  }, [lastResponse, projectId, isThinking]);

  async function handleSubmitWrapper(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setWorking(true);

    const inputMessages: Message[] = [
      {
        id: nanoid(),
        role: 'system',
        content:
          'You are a senior and helpful technical analyst. You will read a list of GitHub issue with format "#id Issue title"',
      },
      ...issues.map<Message>((issue) => {
        const content = `#${issue.number} ${issue.title}`;
        return {
          id: `${issue.id}` ?? nanoid(),
          role: 'assistant',
          content,
        };
      }),
      {
        id: nanoid(),
        role: 'user',
        content:
          'Group all the issue titles into categories, sort by the most repetitive issues first, and write the really short summary of each category in essay style',
      },
      {
        id: nanoid(),
        role: 'user',
        content: 'Format the summary in markdown syntax',
      },
    ];

    setMessages(inputMessages);

    reload();

    setWorking(false);
  }

  return (
    <form onSubmit={handleSubmitWrapper}>
      <Layout projectId={projectId as string}>
        <Flex justifyContent="space-between">
          <Box
            maxW={{ lg: '80%', md: '70%', sm: '50%' }}
            height="100vh"
            overflowY="auto"
          >
            <Box marginY={4} className="digest-markdown">
              <ReactMarkdown>
                {isThinking && lastResponse
                  ? lastResponse.content
                  : data?.digests?.content ?? ''}
              </ReactMarkdown>
            </Box>

            {!data?.digests?.content && (
              <Center>
                <Text fontSize="sm" fontStyle="italic">
                  Do not have any recent report. Click &quot;Generate&quot;
                  button to generate one.
                </Text>
              </Center>
            )}

            {(isThinking || isLoading) && (
              <SkeletonText
                marginY={4}
                noOfLines={1}
                spacing="3"
                skeletonHeight="4"
                width="300px"
              />
            )}
          </Box>

          <Box>
            <Button
              type="submit"
              colorScheme="blue"
              isLoading={isThinking || isWorking}
            >
              {data?.digests ? 'Update' : 'Generate'}
            </Button>
          </Box>
        </Flex>
      </Layout>
    </form>
  );
}

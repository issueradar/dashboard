import type { Project, Digest } from '@prisma/client';
import ReactMarkdown from 'react-markdown';
import useSWR, { mutate } from 'swr';
import { useRouter } from 'next/router';
import { useState } from 'react';
import {
  Box,
  Button,
  Center,
  Flex,
  SkeletonText,
  Text,
  useToast,
} from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
import {
  CreateChatCompletionResponse,
  HttpMethod,
  Issue,
  Message,
} from '@/types';
import Layout from '@/components/app/Layout';
import { fetcher } from '@/lib/fetcher';
import { getIssues } from '@/lib/issue';

type DigestInput = {
  content: string;
  projectId: string;
};

type ProjectDigestData = {
  digests: Digest;
  project: Project | null;
};

export default function ProjectIndex() {
  const [isWorking, setWorking] = useState(false);
  const [currentTask, setCurrentTask] = useState('');

  const toast = useToast();
  const router = useRouter();
  const { id: projectId } = router.query;

  const { data, isLoading } = useSWR<ProjectDigestData>(
    projectId && `/api/digest?projectId=${projectId}`,
    fetcher,
    {
      onSuccess: (data) => !data?.project && router.push('/'),
    },
  );

  const askGPT = async (
    messages: Message[],
  ): Promise<CreateChatCompletionResponse | undefined> => {
    try {
      setWorking(true);
      setCurrentTask('Analyzing...');

      const res = await fetch('/api/analyse', {
        method: HttpMethod.POST,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });

      if (res.ok) {
        const responseData = await res.json();
        return responseData;
      }
    } catch (error) {
      console.error(error);
    }
  };

  async function saveDigest({ content, projectId }: DigestInput) {
    setWorking(true);

    try {
      const response = await fetch(`/api/digest?projectId=${projectId}`, {
        method: HttpMethod.POST,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        mutate(`/api/digest?projectId=${projectId}`);
        toast({
          title: 'Digest saved successfully!',
          status: 'success',
        });
      }
    } catch (error) {
      toast({
        title: 'Failed to save digest',
        status: 'error',
      });
      console.error(error);
    } finally {
      setWorking(false);
    }
  }

  async function handleButtonClick() {
    setWorking(true);
    const newData = [];

    const repoUrl = data?.project?.repoUrl;

    if (!repoUrl) {
      throw new Error('Can not get repo URL');
    }

    setCurrentTask('Getting data...');

    for (let page = 1; page <= 3; page++) {
      await new Promise((r) => setTimeout(r, 500));
      const newIssues: Issue[] = await getIssues({ repoUrl, page });
      newData.push(...newIssues);
    }

    const messages: Message[] = [
      {
        role: 'system',
        content:
          'You are a senior and helpful technical analyst. You will read a list of GitHub issue with format "#id Issue title"',
      },
      ...newData.map<Message>((issue) => {
        const content = `#${issue.number} ${issue.title}`;
        return {
          role: 'assistant',
          content,
        };
      }),
      {
        role: 'user',
        content:
          'Group all the issue titles into categories, sort by the most repetitive issues first, and write the really short summary of each category in essay style',
      },
      {
        role: 'user',
        content: 'Format the summary in markdown syntax',
      },
    ];

    const res = await askGPT(messages);

    if (res?.choices?.[0]) {
      const digestContent = res.choices[0].message?.content;

      if (digestContent && projectId) {
        setCurrentTask('Saving...');

        await saveDigest({
          content: digestContent,
          projectId: projectId as string,
        });
      }
    }
    setWorking(false);
    setCurrentTask('');
  }

  return (
    <Layout projectId={projectId as string}>
      <Flex direction="column">
        <Flex justifyContent="end">
          <Button
            colorScheme="blue"
            disabled={isWorking}
            isLoading={isWorking}
            leftIcon={<RepeatIcon />}
            loadingText={currentTask}
            onClick={handleButtonClick}
          >
            Update
          </Button>
        </Flex>

        {isLoading && (
          <SkeletonText noOfLines={6} spacing="3" skeletonHeight="4" />
        )}

        {data?.digests?.content && !isLoading ? (
          <Box marginY={4} className="digest-markdown">
            <ReactMarkdown>{data.digests.content}</ReactMarkdown>
          </Box>
        ) : (
          <Center>
            <Text fontSize="sm" fontStyle="italic">
              Do not have any recent report. Click &quot;Update&quot; button to
              get it.
            </Text>
          </Center>
        )}
      </Flex>
    </Layout>
  );
}

import type { Project, Digest } from '@prisma/client';
import useSWR, { mutate } from 'swr';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Button, Center, Flex, Text, useToast } from '@chakra-ui/react';
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
  const [isLoading, setLoading] = useState(false);
  const [currentTask, setCurrentTask] = useState('');

  const toast = useToast();
  const router = useRouter();
  const { id: projectId } = router.query;

  const { data } = useSWR<ProjectDigestData>(
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
      setLoading(true);
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
    setLoading(true);

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
      setLoading(false);
    }
  }

  async function handleButtonClick() {
    setLoading(true);
    const newData = [];

    const repoUrl = data?.project?.repoUrl;

    if (!repoUrl) {
      throw new Error('Can not get repo URL');
    }

    setCurrentTask('Getting data...');

    for (let page = 1; page <= 1; page++) {
      await new Promise((r) => setTimeout(r, 500));
      const newIssues: Issue[] = await getIssues({ repoUrl, page });
      newData.push(...newIssues);
    }

    const messages: Message[] = [
      {
        role: 'system',
        content:
          'You are a senior and helpful technical analyst. You will read a list of GitHub issue with format "#issue ID# Issue title"',
      },
      ...newData.map<Message>((issue) => {
        const content = `#${issue.number}# ${issue.title}`;
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
    setLoading(false);
    setCurrentTask('');
  }

  return (
    <Layout project={data?.project}>
      <Flex direction="column">
        <Flex justifyContent="end">
          <Button
            colorScheme="blue"
            disabled={isLoading}
            isLoading={isLoading}
            leftIcon={<RepeatIcon />}
            loadingText={currentTask}
            onClick={handleButtonClick}
          >
            Update
          </Button>
        </Flex>
        {data?.digests ? (
          <Flex
            marginY={4}
            padding={4}
            border="1px"
            borderColor="chakra-border-color"
            borderRadius="md"
          >
            {data?.digests?.content}
          </Flex>
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

import type { Project, Digest } from '@prisma/client';
import useSWR, { mutate } from 'swr';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Button, Flex, Text, useToast } from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
import {
  HttpMethod,
  Message,
  CreateChatCompletionResponse,
  Issue,
} from '@/types';
import Layout from '@/components/app/Layout';
import { fetcher } from '@/lib/fetcher';
import { getIssues } from '@/lib/issue';

type DigestInput = {
  content: string;
  projectId: string;
};

type ProjectDigestData = {
  digests: Digest[];
  project: Project | null;
};

export default function ProjectIndex() {
  const [isLoading, setLoading] = useState(false);
  const [currentTask, setCurrentTask] = useState('');
  const [answers, setAnswers] = useState<
    CreateChatCompletionResponse['choices']
  >([]);

  const toast = useToast();
  const router = useRouter();
  const { id: projectId } = router.query;
  console.log('### projectId: ', { projectId });

  const { data } = useSWR<ProjectDigestData>(
    projectId && `/api/digest?projectId=${projectId}`,
    fetcher,
    {
      onSuccess: (data) => !data?.project && router.push('/'),
    },
  );

  console.log('### data: ', { data });

  const askGPT = async (
    messages: Message[],
  ): Promise<CreateChatCompletionResponse | undefined> => {
    try {
      setLoading(true);
      setCurrentTask('Asking AI...');

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
        mutate(`/api/digest?projectId=${projectId}&published=true`);
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
        const content = `#${issue.id}# ${issue.title}`;
        return {
          role: 'assistant',
          content,
        };
      }),
      {
        role: 'user',
        content:
          'Group all the issue titles into categories, and write the summary of each category',
      },
    ];

    const res = await askGPT(messages);

    if (res?.choices?.[0]) {
      setAnswers(res.choices);
      const digestContent = res.choices[0].message?.content;

      if (digestContent && projectId) {
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
        {answers.length > 0 &&
          answers.map((answer, index) => (
            <Flex
              key={`answer-${index}`}
              padding={2}
              border="1px"
              borderColor="green.400"
            >
              <Text>{answer?.message?.content}</Text>
            </Flex>
          ))}
      </Flex>
    </Layout>
  );
}

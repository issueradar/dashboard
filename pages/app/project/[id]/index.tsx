import type { Post, Project } from '@prisma/client';
import useSWR from 'swr';
import { Button, Flex, Text } from '@chakra-ui/react';
import { HttpMethod, Message, CreateChatCompletionResponse } from '@/types';
import Layout from '@/components/app/Layout';
import { Link } from '@/components';
import { RepeatIcon } from '@chakra-ui/icons';
import { fetcher } from '@/lib/fetcher';
import { useRouter } from 'next/router';
import { useState } from 'react';

// eslint-disable-next-line
type UnknownData = Record<string, any>;

interface ProjectPostData {
  posts: Array<Post>;
  project: Project | null;
}

export default function ProjectIndex() {
  const [isLoading, setLoading] = useState(false);
  const [currentTask, setCurrentTask] = useState('');
  const [page, setPage] = useState(1);
  const [issues, setIssues] = useState<UnknownData[]>([]);
  const [answers, setAnswers] = useState<
    CreateChatCompletionResponse['choices']
  >([]);

  const router = useRouter();
  const { id: projectId } = router.query;

  const { data } = useSWR<ProjectPostData>(
    projectId && `/api/post?projectId=${projectId}&published=true`,
    fetcher,
    {
      onSuccess: (data) => !data?.project && router.push('/'),
    },
  );

  const getIssues = async (p: number) => {
    try {
      setLoading(true);
      setCurrentTask('Getting issues...');

      const res = await fetch(
        `https://api.github.com/repos/pmndrs/jotai/issues?page=${p}&state=all`,
        {
          method: HttpMethod.GET,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (res.ok) {
        const responseData = await res.json();
        return responseData;
      }
    } catch (error) {
      console.error(error);
    }
  };

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

  async function handleButtonClick() {
    setLoading(true);
    const newData = [];
    for (let p = 1; p <= 1; p++) {
      await new Promise((r) => setTimeout(r, 500));
      const data = await getIssues(p);
      newData.push(...data);
      setPage(p);
      setCurrentTask(`Getting issues... (${page})`);
    }
    setIssues(newData);
    const messages: Message[] = [
      {
        role: 'system',
        content:
          'You are a senior and helpful technical analyst. You will read a given GitHub issue contents and summary it later',
      },
      ...newData.map<Message>((issue) => {
        const content = `${issue.title} ${issue.body}`;
        return {
          role: 'assistant',
          content,
        };
      }),
      {
        role: 'user',
        content:
          'Write the summary of all given issues into one condensed paragraph',
      },
    ];
    const res = await askGPT(messages);
    if (res && res.choices) {
      setAnswers(res.choices);
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
        <div className="my-10 grid gap-y-10">
          {issues ? (
            issues.length > 0 ? (
              issues.map((issue, index) => (
                <Link href={`/issue/${issue.id}`} key={issue.id}>
                  <Flex alignItems="center" maxWidth="100vw">
                    <Flex maxWidth="100%">{index + 1}</Flex>
                    <Flex padding={3} direction="column">
                      <h2 className="font-cal text-xl">{issue.title}</h2>
                      <Text noOfLines={3}>{issue.body}</Text>
                    </Flex>
                  </Flex>
                </Link>
              ))
            ) : (
              <>
                <div className="flex flex-col md:flex-row md:h-60 rounded-lg overflow-hidden border border-gray-200">
                  <div className="relative w-full h-60 md:h-auto md:w-1/3 md:flex-none bg-gray-300" />
                  <div className="relative p-10 grid gap-5">
                    <div className="w-28 h-10 rounded-md bg-gray-300" />
                    <div className="w-48 h-6 rounded-md bg-gray-300" />
                    <div className="w-48 h-6 rounded-md bg-gray-300" />
                    <div className="w-48 h-6 rounded-md bg-gray-300" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-cal text-gray-600">
                    No issues yet. Click &quot;Update&quot; to get it from
                    GitHub.
                  </p>
                </div>
              </>
            )
          ) : (
            [0, 1].map((i) => (
              <div
                key={i}
                className="flex flex-col md:flex-row md:h-60 rounded-lg overflow-hidden border border-gray-200"
              >
                <div className="relative w-full h-60 md:h-auto md:w-1/3 md:flex-none bg-gray-300 animate-pulse" />
                <div className="relative p-10 grid gap-5">
                  <div className="w-28 h-10 rounded-md bg-gray-300 animate-pulse" />
                  <div className="w-48 h-6 rounded-md bg-gray-300 animate-pulse" />
                  <div className="w-48 h-6 rounded-md bg-gray-300 animate-pulse" />
                  <div className="w-48 h-6 rounded-md bg-gray-300 animate-pulse" />
                </div>
              </div>
            ))
          )}
        </div>
      </Flex>
    </Layout>
  );
}

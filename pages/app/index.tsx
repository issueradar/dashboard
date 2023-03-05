import Link from 'next/link';
import type { Project } from '@prisma/client';
import useSWR from 'swr';
import { useDebounce } from 'react-use';
// import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import BlurImage from '@/components/BlurImage';
import Layout from '@/components/app/Layout';
import { fetcher } from '@/lib/fetcher';
import { parseRepoUrl, initial } from '@/lib/url-parser';
import { HttpMethod } from '@/types';

export default function AppIndex() {
  const [isCreating, setCreating] = useState(false);
  const [subdomain, setSubdomain] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [repoUrl, setRepoUrl] = useState('');
  const [parsedRepo, setParsedRepo] = useState(initial);
  const [projectName, setProjectName] = useState('');

  const [isManuallyEdited, setManuallyEdited] = useState(false);
  const initialRef = useRef(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useDebounce(
    () => {
      const { user, repo, provider } = parseRepoUrl(repoUrl);

      setParsedRepo({ user, repo, provider });

      if (!isManuallyEdited) {
        if (provider !== 'UNKNOWN') {
          setProjectName(`${user}/${repo}`);
        }

        if (!error) {
          setSubdomain(repo);
        }
      }
    },
    1000,
    [repoUrl],
  );

  useEffect(() => {
    async function checkSubDomain() {
      if (subdomain) {
        const response = await fetch(
          `/api/domain/check?domain=${subdomain}&subdomain=1`,
        );
        const available = await response.json();
        if (available) {
          setError(null);
        } else {
          setError(`${subdomain}.vercel.pub is taken`);
        }
      }
    }
    checkSubDomain();
  }, [subdomain]);

  // const router = useRouter();

  const { data: session } = useSession();
  const sessionId = session?.user?.id;

  const { data: projects } = useSWR<Array<Project>>(
    sessionId && `/api/project`,
    fetcher,
  );

  async function handleCreateProject() {
    setCreating(true);
    const res = await fetch('/api/project', {
      method: HttpMethod.POST,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: sessionId,
        name: projectName,
        repoUrl: repoUrl,
        subdomain: subdomain,
      }),
    });

    if (!res.ok) {
      alert('Failed to create project');
    }

    const data = await res.json();
    setCreating(false);
    console.log('### data: ', { data });
    // router.push(`/project/${data.projectId}`);
  }

  const shouldDisableCreating = !repoUrl && !projectName;

  return (
    <Layout>
      <Modal
        closeOnOverlayClick={false}
        initialFocusRef={initialRef}
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create new project</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mt={4} isRequired>
              <FormLabel>Repo URL</FormLabel>
              <InputGroup>
                <Input
                  ref={initialRef}
                  placeholder="https//github.com/<user>/<repo>.git"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                />
                {parsedRepo.provider !== 'UNKNOWN' && (
                  <InputRightElement>
                    <CheckIcon color="green.500" />
                  </InputRightElement>
                )}
              </InputGroup>
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Project name</FormLabel>
              <Input
                placeholder="user/repo"
                value={projectName}
                onChange={(e) => {
                  setManuallyEdited(true);
                  setProjectName(e.target.value);
                }}
              />
            </FormControl>

            {(isManuallyEdited || error) && (
              <FormControl mt={4} isInvalid={!!error}>
                <FormLabel>Subdomain</FormLabel>
                <Input
                  placeholder="repo"
                  value={subdomain}
                  onChange={(e) => {
                    setManuallyEdited(true);
                    setSubdomain(e.target.value);
                  }}
                />
                {error && <FormErrorMessage>{error}</FormErrorMessage>}
              </FormControl>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              isLoading={isCreating}
              isDisabled={shouldDisableCreating}
              colorScheme="blue"
              mr={3}
              onClick={handleCreateProject}
            >
              Create
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <div className="py-20 max-w-screen-xl mx-auto px-10 sm:px-20">
        <div className="flex flex-col sm:flex-row space-y-5 sm:space-y-0 justify-between items-center">
          <h1 className="font-cal text-5xl">My Projectss</h1>
          <Button
            onClick={onOpen}
            className="font-cal text-lg w-3/4 sm:w-40 tracking-wide text-white bg-black border-black border-2 px-5 py-3 hover:bg-white hover:text-black transition-all ease-in-out duration-150"
          >
            New Project <span className="ml-2">＋</span>
          </Button>
        </div>
        <div className="my-10 grid gap-y-10">
          {projects ? (
            projects.length > 0 ? (
              projects.map((project) => (
                <Link href={`/project/${project.id}`} key={project.id}>
                  <div className="flex flex-col md:flex-row md:h-60 rounded-lg overflow-hidden border border-gray-200">
                    <div className="relative w-full h-60 md:h-auto md:w-1/3 md:flex-none">
                      {project.image ? (
                        <BlurImage
                          src={project.image}
                          width={500}
                          height={400}
                          className="h-full object-cover"
                          alt={project.name ?? 'Project thumbnail'}
                        />
                      ) : (
                        <div className="absolute flex items-center justify-center w-full h-full bg-gray-100 text-gray-500 text-4xl select-none">
                          ?
                        </div>
                      )}
                    </div>
                    <div className="relative p-10">
                      <h2 className="font-cal text-3xl">{project.name}</h2>
                      <p className="text-base my-5 line-clamp-3">
                        {project.description}
                      </p>
                      <a
                        className="font-cal px-3 py-1 tracking-wide rounded bg-gray-200 text-gray-600 absolute bottom-5 left-10 whitespace-nowrap"
                        href={`https://${project.subdomain}.vercel.pub`}
                        onClick={(e) => e.stopPropagation()}
                        rel="noreferrer"
                        target="_blank"
                      >
                        {project.subdomain}.vercel.pub ↗
                      </a>
                    </div>
                  </div>
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
                    No projects yet. Click &quot;New Project&quot; to create
                    one.
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
      </div>
    </Layout>
  );
}

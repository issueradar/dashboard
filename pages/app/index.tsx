import type { Project } from '@prisma/client';
import useSWR from 'swr';
import { useDebounce } from 'react-use';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useRef, useReducer } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputRightAddon,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Spinner,
  useDisclosure,
} from '@chakra-ui/react';
import { CheckIcon, AddIcon, WarningTwoIcon } from '@chakra-ui/icons';
import Layout from '@/components/app/Layout';
import { ProjectCard } from '@/components/app/ProjectCard';
import { fetcher } from '@/lib/fetcher';
import { parseRepoUrl, initial as initialParsed } from '@/lib/url-parser';
import { useToast } from '@/lib/hooks';
import { HttpMethod } from '@/types';

const currentHost =
  process.env.NODE_ENV === 'production' ? '.issueradar.com' : '.localhost:3000';

const initialState = {
  isCreating: false,
  isCheckingSubdomain: false,
  isManuallyEdited: false,
  customisedSubdomain: false,
  subdomain: '',
  error: '',
  repoUrl: '',
  parsedRepo: initialParsed,
  projectName: '',
};

type State = typeof initialState;
type Action =
  | {
      key: keyof State;
      value: State[keyof State];
    }
  | {
      key?: undefined;
      value: Partial<State>;
    }
  | { key: 'reset'; value?: undefined };

const reducer = (state: State, { key, value }: Action) => {
  if (key === 'reset') return initialState;

  if (key === undefined && typeof value === 'object') {
    return { ...state, ...value };
  }

  return { ...state, [key as string]: value };
};

export default function AppIndex() {
  const initialRef = useRef(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [state, dispatch] = useReducer(reducer, initialState);

  const toast = useToast();

  const router = useRouter();

  const { data: session } = useSession();
  const sessionId = session?.user?.id;

  const { data: projects, isLoading } = useSWR<Array<Project>>(
    sessionId && `/api/project`,
    fetcher,
  );

  useDebounce(
    async () => {
      const { user, repo, provider } = parseRepoUrl(state.repoUrl);

      dispatch({ key: 'parsedRepo', value: { user, repo, provider } });

      if (state.subdomain) {
        const response = await fetch(
          `/api/domain/check?domain=${state.subdomain}&subdomain=1`,
        );

        const available = await response.json();
        if (available) {
          dispatch({ value: { error: '' } });
        } else {
          dispatch({
            value: { error: `${state.subdomain}${currentHost} is taken` },
          });
        }
      }

      if (!state.isManuallyEdited) {
        if (provider !== 'UNKNOWN') {
          dispatch({ key: 'projectName', value: `${user}/${repo}` });
        }

        if (!state.error) {
          dispatch({ value: { subdomain: user } });
        }
      }
    },
    1000,
    [state.repoUrl, state.isManuallyEdited, state.subdomain],
  );

  async function handleCreateProject() {
    dispatch({ value: { isCreating: true } });
    const res = await fetch('/api/project', {
      method: HttpMethod.POST,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: sessionId,
        name: state.projectName,
        repoUrl: state.repoUrl,
        subdomain: state.subdomain,
      }),
    });

    if (!res.ok) {
      toast({ title: 'Failed to create project', status: 'error' });
    }

    const data = await res.json();

    toast({ title: 'Project created successfully!', status: 'success' });

    dispatch({ value: { isCreating: false } });

    router.push(`/project/${data.projectId}`);
  }

  const handleModalClose = () => {
    dispatch({ key: 'reset' });
    onClose();
  };

  const shouldDisableCreating =
    !state.repoUrl ||
    !state.projectName ||
    !state.subdomain ||
    !!state.error ||
    state.parsedRepo.provider === 'UNKNOWN';

  return (
    <>
      <Layout>
        <Flex direction="column">
          <Flex marginBottom={4} justifyContent="end">
            <Button colorScheme="green" leftIcon={<AddIcon />} onClick={onOpen}>
              New Project
            </Button>
          </Flex>

          <Box>
            {projects && !isLoading ? (
              projects.length > 0 ? (
                <SimpleGrid
                  spacing={4}
                  templateColumns="repeat(auto-fill, minmax(300px, 1fr))"
                >
                  {projects.map((project) => (
                    <ProjectCard key={`${project.id}`} project={project} />
                  ))}
                </SimpleGrid>
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
          </Box>
        </Flex>
      </Layout>

      <Modal
        closeOnOverlayClick={false}
        initialFocusRef={initialRef}
        isOpen={isOpen}
        onClose={handleModalClose}
      >
        <ModalOverlay />
        <ModalContent top="4rem">
          <ModalHeader>Create new project</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mt={4} isRequired>
              <FormLabel>Repo URL</FormLabel>
              <InputGroup>
                <Input
                  ref={initialRef}
                  placeholder="https//github.com/<user>/<repo>.git"
                  value={state.repoUrl}
                  onChange={(e) =>
                    dispatch({ key: 'repoUrl', value: e.target.value })
                  }
                />
                {state.repoUrl && (
                  <InputRightElement>
                    {state.parsedRepo.provider !== 'UNKNOWN' ? (
                      <CheckIcon color="green.500" />
                    ) : (
                      <WarningTwoIcon color="red.400" />
                    )}
                  </InputRightElement>
                )}
              </InputGroup>
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Project name</FormLabel>
              <Input
                placeholder="user/repo"
                value={state.projectName}
                onChange={(e) => {
                  dispatch({
                    value: {
                      isManuallyEdited: true,
                      projectName: e.target.value,
                    },
                  });
                }}
              />
            </FormControl>

            <FormControl mt={4} isInvalid={!!state.error}>
              <FormLabel>Subdomain</FormLabel>
              <InputGroup>
                <Input
                  placeholder="repo"
                  value={state.subdomain}
                  onChange={(e) => {
                    dispatch({
                      value: {
                        isManuallyEdited: true,
                        subdomain: e.target.value,
                      },
                    });
                  }}
                />
                <InputRightAddon>{currentHost}</InputRightAddon>
              </InputGroup>
              {state.error && (
                <FormErrorMessage>{state.error}</FormErrorMessage>
              )}
            </FormControl>
          </ModalBody>

          <ModalFooter>
            {state.isCheckingSubdomain && <Spinner />}

            <Button
              isLoading={state.isCreating}
              isDisabled={shouldDisableCreating}
              colorScheme="blue"
              mr={3}
              onClick={handleCreateProject}
            >
              Create
            </Button>
            <Button onClick={handleModalClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

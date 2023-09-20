import type { Project } from '@prisma/client';
import useSWR from 'swr';
import { useDebounce } from 'react-use';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useRef, useReducer } from 'react';
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Flex,
  FormControl,
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
  SimpleGrid,
  useDisclosure,
  Highlight,
  Stack,
} from '@chakra-ui/react';
import { CheckIcon, AddIcon, WarningTwoIcon } from '@chakra-ui/icons';
import Layout from '@/components/app/Layout';
import { ProjectCard } from '@/components/app/ProjectCard';
import { fetcher } from '@/lib/fetcher';
import { parseRepoUrl, initial as initialParsed } from '@/lib/url-parser';
import { useToast } from '@/lib/hooks';
import { limits } from '@/lib/constants';
import { HttpMethod } from '@/types';

const initialState = {
  isCreating: false,
  isManuallyEdited: false,
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

      if (!state.isManuallyEdited) {
        if (provider !== 'UNKNOWN') {
          dispatch({ key: 'projectName', value: `${user}/${repo}` });
        }
      }
    },
    1000,
    [state.repoUrl, state.isManuallyEdited],
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

  const maxProjects = limits[session?.user.role ?? 'USER'].maxProjects;
  const leftProjects = maxProjects - (projects?.length ?? 0);

  const shouldDisableCreatingNewProject = leftProjects <= 0;

  const shouldDisableConfirmButton =
    !state.repoUrl ||
    !state.projectName ||
    !!state.error ||
    state.parsedRepo.provider === 'UNKNOWN';

  return (
    <>
      <Layout>
        <Flex direction="column">
          <Flex
            marginBottom={4}
            alignItems="center"
            justifyContent="space-between"
          >
            {shouldDisableCreatingNewProject ? (
              <Box>
                <Alert status="error" maxHeight="40px" fontSize="sm">
                  <AlertIcon />
                  <Highlight
                    query="3 projects"
                    styles={{
                      px: '2',
                      py: '1',
                      rounded: 'full',
                      bg: 'white.200',
                    }}
                  >
                    Currently we support only 3 projects limit, we will try to
                    support more in the future.
                  </Highlight>
                </Alert>
              </Box>
            ) : (
              <span />
            )}
            <Button
              isDisabled={shouldDisableCreatingNewProject}
              colorScheme="green"
              leftIcon={<AddIcon />}
              onClick={onOpen}
            >
              {`New Project (${leftProjects} left)`}
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
                  placeholder="https//github.com/user/repo.git"
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
          </ModalBody>

          <ModalFooter>
            <Stack direction="row">
              <Button onClick={handleModalClose}>Cancel</Button>
              <Button
                isLoading={state.isCreating}
                isDisabled={shouldDisableConfirmButton}
                colorScheme="blue"
                onClick={handleCreateProject}
              >
                Create
              </Button>
            </Stack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

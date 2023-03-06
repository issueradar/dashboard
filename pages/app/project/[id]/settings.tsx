import { useDebounce } from 'use-debounce';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Container,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Text,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import useSWR, { mutate } from 'swr';
import type { Project } from '@prisma/client';

import Layout from '@/components/app/Layout';
import LoadingDots from '@/components/app/loading-dots';
import Modal from '@/components/Modal';

import { fetcher } from '@/lib/fetcher';
import { HttpMethod } from '@/types';

type SettingsData = Pick<
  Project,
  | 'id'
  | 'name'
  | 'repoUrl'
  | 'description'
  | 'font'
  | 'subdomain'
  | 'customDomain'
  | 'image'
  | 'imageBlurhash'
>;

export default function ProjectSettings() {
  const router = useRouter();
  const { id } = router.query;
  const projectId = id;

  const toast = useToast({
    position: 'top-right',
    duration: 3000,
    isClosable: true,
    variant: 'subtle',
  });

  const { data: settings } = useSWR<Project | null>(
    projectId && `/api/project?projectId=${projectId}`,
    fetcher,
    {
      onError: () => router.push('/'),
      revalidateOnFocus: false,
    },
  );

  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);

  const [data, setData] = useState<SettingsData>({
    id: '',
    name: null,
    repoUrl: null,
    description: null,
    font: 'font-cal',
    subdomain: null,
    customDomain: null,
    image: null,
    imageBlurhash: null,
  });

  useEffect(() => {
    if (settings) setData(settings);
  }, [settings]);

  async function saveProjectSettings(input: SettingsData) {
    setSaving(true);

    try {
      const response = await fetch('/api/project', {
        method: HttpMethod.PUT,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentSubdomain: settings?.subdomain ?? undefined,
          ...input,
          id: projectId,
        }),
      });

      if (response.ok) {
        setSaving(false);
        mutate(`/api/project?projectId=${projectId}`);
        toast({
          title: 'Project saved successfully!',
          status: 'success',
        });
      }
    } catch (error) {
      toast({
        title: 'Failed to save settings',
        status: 'error',
      });
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject(projectId: string) {
    setDeletingProject(true);

    try {
      const response = await fetch(`/api/project?projectId=${projectId}`, {
        method: HttpMethod.DELETE,
      });

      if (response.ok) router.push('/');
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingProject(false);
    }
  }
  const [debouncedSubdomain] = useDebounce(data?.subdomain, 1500);
  const [subdomainError, setSubdomainError] = useState<string | null>(null);

  useEffect(() => {
    async function checkSubdomain() {
      try {
        const response = await fetch(
          `/api/domain/check?domain=${debouncedSubdomain}&subdomain=1`,
        );

        const available = await response.json();

        setSubdomainError(
          available ? null : `${debouncedSubdomain}.vercel.pub`,
        );
      } catch (error) {
        console.error(error);
      }
    }

    if (
      debouncedSubdomain !== settings?.subdomain &&
      debouncedSubdomain &&
      debouncedSubdomain?.length > 0
    )
      checkSubdomain();
  }, [debouncedSubdomain, settings?.subdomain]);

  return (
    <>
      <Layout project={settings}>
        <Container>
          <Text as="h2" fontSize="2xl" fontWeight="bold">
            Project Settings
          </Text>

          <Flex direction="column">
            <FormControl mt={4}>
              <FormLabel>Project name</FormLabel>
              <Input
                name="Project name"
                placeholder="name"
                value={data.name || ''}
                onChange={(e) => {
                  setData((d) => ({
                    ...d,
                    name: e.target.value,
                  }));
                }}
              />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Repo URL</FormLabel>
              <Input
                name="Repo URL"
                placeholder="Repo URL"
                value={data.repoUrl || ''}
                onChange={(e) => {
                  setData((d) => ({
                    ...d,
                    repoUrl: e.target.value,
                  }));
                }}
              />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Description</FormLabel>
              <Textarea
                name="Description"
                placeholder="Lorem ipsum..."
                value={data?.description || ''}
                onChange={(e) => {
                  setData((d) => ({
                    ...d,
                    description: e.target.value,
                  }));
                }}
              />
            </FormControl>

            <FormControl mt={4} isInvalid={!!subdomainError}>
              <FormLabel>Subdomain</FormLabel>
              <Input
                name="subdomain"
                placeholder="repo"
                value={data.subdomain || ''}
                onChange={(e) => {
                  setData((d) => ({
                    ...d,
                    subdomain: e.target.value,
                  }));
                }}
              />
              {subdomainError && (
                <FormErrorMessage>
                  {subdomainError} is not available. Choose another subdomain.
                </FormErrorMessage>
              )}
            </FormControl>
          </Flex>

          <Box marginY={4}>
            <Button
              isLoading={saving}
              loadingText="Saving..."
              colorScheme="green"
              disabled={saving || subdomainError !== null}
              onClick={() => saveProjectSettings(data)}
            >
              Save Changes
            </Button>
          </Box>

          <Divider marginY={10} />

          <Alert status="error">
            <AlertIcon />
            <AlertDescription fontSize="sm">
              Permanently delete your project and all of its contents from our
              platform. This action is not reversible – please continue with
              caution.
            </AlertDescription>
            <Box marginLeft={3}>
              <Button
                colorScheme="red"
                size="xs"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete Project
              </Button>
            </Box>
          </Alert>
        </Container>
      </Layout>

      <Modal showModal={showDeleteModal} setShowModal={setShowDeleteModal}>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            await deleteProject(projectId as string);
          }}
          className="inline-block w-full max-w-md pt-8 overflow-hidden text-center align-middle transition-all bg-white shadow-xl rounded-lg"
        >
          <h2 className="font-cal text-2xl mb-6">Delete Project</h2>
          <div className="grid gap-y-5 w-5/6 mx-auto">
            <p className="text-gray-600 mb-3">
              Are you sure you want to delete your project? This action is not
              reversible. Type in the full name of your project (
              <b>{data.name}</b>) to confirm.
            </p>
            <div className="border border-gray-700 rounded-lg flex flex-start items-center overflow-hidden">
              <input
                className="w-full px-5 py-3 text-gray-700 bg-white border-none focus:outline-none focus:ring-0 rounded-none rounded-r-lg placeholder-gray-400"
                type="text"
                name="name"
                placeholder={data.name ?? ''}
                pattern={data.name ?? 'Project Name'}
              />
            </div>
          </div>
          <div className="flex justify-between items-center mt-10 w-full">
            <button
              type="button"
              className="w-full px-5 py-5 text-sm text-gray-400 hover:text-black border-t border-gray-300 rounded-bl focus:outline-none focus:ring-0 transition-all ease-in-out duration-150"
              onClick={() => setShowDeleteModal(false)}
            >
              CANCEL
            </button>

            <button
              type="submit"
              disabled={deletingProject}
              className={`${
                deletingProject
                  ? 'cursor-not-allowed text-gray-400 bg-gray-50'
                  : 'bg-white text-gray-600 hover:text-black'
              } w-full px-5 py-5 text-sm border-t border-l border-gray-300 rounded-br focus:outline-none focus:ring-0 transition-all ease-in-out duration-150`}
            >
              {deletingProject ? <LoadingDots /> : 'DELETE PROJECT'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

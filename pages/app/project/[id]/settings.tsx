import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import {
  Alert,
  AlertDescription,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertIcon,
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Stack,
  Text,
  Textarea,
  useDisclosure,
  useToast,
} from '@/components';
import useSWR, { mutate } from 'swr';
import type { Project } from '@prisma/client';
import { useDebounce } from 'react-use';

import Layout from '@/components/app/Layout';
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
  const { id: projectId } = router.query;

  const toast = useToast({
    position: 'top-right',
    duration: 3000,
    isClosable: true,
    variant: 'subtle',
  });

  const cancelRef = useRef(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data: settings } = useSWR<Project | null>(
    projectId && `/api/project?projectId=${projectId}`,
    fetcher,
    {
      onError: () => router.push('/'),
      revalidateOnFocus: false,
    },
  );

  const [saving, setSaving] = useState(false);

  const [confirmName, setConfirmName] = useState('');
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
  const [subdomainError, setSubdomainError] = useState<string | null>(null);

  useDebounce(
    () => {
      async function checkSubdomain() {
        try {
          const response = await fetch(
            `/api/domain/check?domain=${data.subdomain}&subdomain=1`,
          );

          const available = await response.json();

          setSubdomainError(available ? null : `${data.subdomain}.vercel.pub`);
        } catch (error) {
          console.error(error);
        }
      }

      if (
        data.subdomain !== settings?.subdomain &&
        data.subdomain &&
        data.subdomain.length > 0
      )
        checkSubdomain();
    },
    200,
    [data.subdomain],
  );

  const shouldDisableConfirmButton = data.name !== confirmName;

  return (
    <>
      <Layout projectId={projectId as string}>
        <Container>
          <Stack spacing={4}>
            <Text as="h2" fontSize="2xl" fontWeight="bold">
              Project Settings
            </Text>

            <FormControl>
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

            <FormControl>
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

            <FormControl>
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

            <FormControl isInvalid={!!subdomainError}>
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
          </Stack>

          <Box marginY={8}>
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
              <Button colorScheme="red" size="xs" onClick={onOpen}>
                Delete Project
              </Button>
            </Box>
          </Alert>
        </Container>
      </Layout>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Project
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete your project? This action is not
              reversible. Type in the full name of your project (
              <b>{data.name}</b>) to confirm.
              <Input
                type="text"
                name="name"
                placeholder={data.name ?? ''}
                value={confirmName}
                marginTop={4}
                onChange={(e) => setConfirmName(e.target.value)}
              />
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                ml={3}
                colorScheme="red"
                isDisabled={shouldDisableConfirmButton}
                isLoading={deletingProject}
                loadingText="Deleting..."
                onClick={async () => {
                  await deleteProject(projectId as string);
                }}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}

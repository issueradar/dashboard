import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Stack,
  useToast,
} from '@chakra-ui/react';
import Layout from '@/components/app/Layout';
import BlurImage from '@/components/BlurImage';
import { HttpMethod } from '@/types';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

import type { UserSettings } from '@/types';

export default function AppSettings() {
  const { data: session } = useSession();
  console.log('### session: ', { session });

  const toast = useToast({
    position: 'top-right',
    duration: 3000,
    isClosable: true,
    variant: 'subtle',
  });

  const [saving, setSaving] = useState<boolean>(false);
  const [data, setData] = useState<UserSettings | null>(null);

  useEffect(() => {
    if (session) setData(session.user);
  }, [session]);

  async function saveSettings(data: UserSettings | null) {
    setSaving(true);
    const response = await fetch('/api/save-settings', {
      method: HttpMethod.POST,
      body: JSON.stringify({
        ...data,
      }),
    });
    if (response.ok) {
      setSaving(false);
      toast({
        title: 'Changes saved successfully!',
        status: 'success',
      });
    }
  }

  return (
    <>
      <Layout>
        <Container>
          <Stack spacing={4}>
            {data?.image && (
              <BlurImage
                src={data.image}
                alt="Cover Photo"
                width={100}
                height={100}
                className="rounded-md w-full"
              />
            )}
            <FormControl>
              <FormLabel>Full name</FormLabel>
              <Input
                name="Your name"
                placeholder="name"
                value={data?.name || ''}
                onChange={(e) => {
                  setData((d) => ({
                    ...d,
                    name: e.target.value,
                  }));
                }}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                name="Email"
                placeholder="email@example.com"
                value={data?.email || ''}
                onChange={(e) => {
                  setData((d) => ({
                    ...d,
                    email: e.target.value,
                  }));
                }}
              />
            </FormControl>
          </Stack>

          <Box marginY={8}>
            <Button
              isLoading={saving}
              loadingText="Saving..."
              colorScheme="green"
              disabled={saving}
              onClick={() => saveSettings(data)}
            >
              Save Changes
            </Button>
          </Box>
        </Container>
      </Layout>
    </>
  );
}

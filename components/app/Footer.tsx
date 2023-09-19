import { Container, Text } from '@chakra-ui/react';
import { HeartIcon } from '@/components/icons';

export const Footer = () => (
  <Container maxW="100vw" py={{ base: '1', lg: '2' }}>
    <Text fontSize="sm" color="subtle">
      Created with <HeartIcon color="red" /> from Finland.
    </Text>
  </Container>
);

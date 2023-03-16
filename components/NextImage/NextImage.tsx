import OriginalNextImage from 'next/image';
import { chakra } from '@chakra-ui/react';

export const NextImage = chakra(OriginalNextImage, {
  shouldForwardProp: (prop) =>
    ['height', 'width', 'quality', 'src', 'alt', 'priority'].includes(prop),
});

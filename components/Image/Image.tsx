import NextImage from 'next/image';
import { chakra } from '@chakra-ui/react';

export const Image = chakra(NextImage, {
  shouldForwardProp: (prop) =>
    ['height', 'width', 'quality', 'src', 'alt', 'priority'].includes(prop),
});

export default Image;

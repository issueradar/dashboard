import {
  useToast as useChakraToast,
  type UseToastOptions,
} from '@chakra-ui/react';

export const useToast = (options?: UseToastOptions) => {
  const finalOptions: UseToastOptions = {
    position: 'top-right',
    duration: 3000,
    isClosable: true,
    ...(options ?? {}),
  };

  return useChakraToast(finalOptions);
};

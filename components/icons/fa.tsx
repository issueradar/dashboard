import { Icon, type IconProps as P } from '@chakra-ui/react';

import { FaGithub } from 'react-icons/fa';

export const GithubIcon = (p: P) => <Icon as={FaGithub} {...p} />;

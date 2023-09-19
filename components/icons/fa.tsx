import { Icon, type IconProps as P } from '@chakra-ui/react';

import { FaGithub, FaHeart } from 'react-icons/fa';

export const GithubIcon = (p: P) => <Icon as={FaGithub} {...p} />;
export const HeartIcon = (p: P) => <Icon as={FaHeart} {...p} />;

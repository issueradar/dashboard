import {
  forwardRef,
  Link as ChakraLink,
  type LinkProps as ChakraLinkProps,
} from '@chakra-ui/react';
import NextLink, { type LinkProps as NextLinkProps } from 'next/link';
import type { FC, RefAttributes } from 'react';

/*
 * NOTE: Delete this component after making @chakra-ui/nextjs works
 */
type Pretty<T> = { [K in keyof T]: T[K] } & object;
type Merge<P, T> = Pretty<Omit<P, keyof T> & T>;

type LegacyProps = 'as' | 'legacyBehavior' | 'passHref';
type LinkComponent = FC<RefAttributes<HTMLAnchorElement> & LinkProps>;

export type LinkProps = Merge<
  ChakraLinkProps,
  Omit<NextLinkProps, LegacyProps>
>;

export const Link: LinkComponent = forwardRef<LinkProps, typeof NextLink>(
  function Link(props, ref) {
    const { href, children, ...rest } = props;
    return (
      <ChakraLink ref={ref} href={href as string} {...rest} as={NextLink}>
        {children}
      </ChakraLink>
    );
  },
);

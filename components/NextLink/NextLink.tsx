import {
  forwardRef,
  Link as ChakraLink,
  type LinkProps as ChakraLinkProps,
} from '@chakra-ui/react';
import OriginalNextLink, {
  type LinkProps as OriginalNextLinkProps,
} from 'next/link';
import type { FC, RefAttributes } from 'react';

/*
 * NOTE: Delete this component after making @chakra-ui/nextjs works
 */
type Pretty<T> = { [K in keyof T]: T[K] } & object;
type Merge<P, T> = Pretty<Omit<P, keyof T> & T>;

type LegacyProps = 'as' | 'legacyBehavior' | 'passHref';
type LinkComponent = FC<RefAttributes<HTMLAnchorElement> & NextLinkProps>;

export type NextLinkProps = Merge<
  ChakraLinkProps,
  Omit<OriginalNextLinkProps, LegacyProps>
>;

export const NextLink: LinkComponent = forwardRef<
  NextLinkProps,
  typeof OriginalNextLink
>(function Link(props, ref) {
  const { href, children, ...rest } = props;
  return (
    <ChakraLink ref={ref} href={href as string} {...rest} as={OriginalNextLink}>
      {children}
    </ChakraLink>
  );
});

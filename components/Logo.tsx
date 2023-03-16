import { Box, useColorMode } from '@chakra-ui/react';
import { NextLink, NextImage } from '@/components';

export type LogoProps = {
  width?: number;
  height?: number;
  href?: string;
};

export const Logo = ({
  width = 120,
  height = (width * 5) / 12,
  href = '/',
}: LogoProps) => {
  const { colorMode } = useColorMode();

  return (
    <Box width={width} height={height}>
      <NextLink href={href} width="max-content">
        <NextImage
          priority
          alt="IssueRadar"
          objectFit="cover"
          src={`/logo-${colorMode}.png`}
          width={width}
          height={height}
        />
      </NextLink>
    </Box>
  );
};

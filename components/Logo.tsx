import { Box, useColorMode } from '@chakra-ui/react';
import { Link } from '@/components/Link';
import { Image } from '@/components/Image';

export type LogoProps = {
  width?: number;
  height?: number;
};

export const Logo = ({ width = 120, height = (width * 5) / 12 }: LogoProps) => {
  const { colorMode } = useColorMode();

  return (
    <Box width={width} height={height}>
      <Link href="/" width="max-content">
        <Image
          priority={true}
          alt="IssueRadar"
          objectFit="cover"
          src={`/logo-${colorMode}.png`}
          width={width}
          height={height}
        />
      </Link>
    </Box>
  );
};

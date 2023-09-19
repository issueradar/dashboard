import { extendTheme } from '@chakra-ui/react';

const config = {
  initialColorMode: 'system',
  useSystemColorMode: true,
};

const colors = {
  brand: {
    900: '#1a365d',
    800: '#153e75',
    700: '#2a69ac',
  },
};

const styles = {
  global: {
    '.digest-markdown': {
      h2: {
        fontSize: '3xl',
        fontWeight: 'bold',
        marginTop: 8,
        marginBottom: 4,
      },
      h3: {
        fontSize: 'xl',
        fontWeight: 'bold',
        marginTop: 4,
        marginBottom: 2,
      },
      ul: {
        paddingLeft: 8,
      },
    },
  },
};

export const theme = extendTheme({ config, colors, styles });

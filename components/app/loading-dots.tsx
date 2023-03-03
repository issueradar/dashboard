import { useColorMode } from '@chakra-ui/react';
import styles from './loading-dots.module.css';

interface LoadingDotsProps {
  color?: string;
}

const LoadingDots = ({ color }: LoadingDotsProps) => {
  const { colorMode } = useColorMode();
  const bgColor = colorMode === 'dark' ? '#000' : '#FFF';

  return (
    <span className={styles.loading}>
      <span style={{ backgroundColor: color ?? bgColor }} />
      <span style={{ backgroundColor: color ?? bgColor }} />
      <span style={{ backgroundColor: color ?? bgColor }} />
    </span>
  );
};

export default LoadingDots;

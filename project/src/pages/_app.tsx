import { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { useGameStore, useGameStoreReady } from '../store/gameStore';

function MyApp({ Component, pageProps }: AppProps) {
  const [isLoading, setIsLoading] = useState(true);
  const isStoreReady = useGameStoreReady();

  useEffect(() => {
    if (isStoreReady) {
      setIsLoading(false);
    }
  }, [isStoreReady]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('App Error:', error);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh the page.</div>;
    }
    return this.props.children;
  }
}

export default MyApp;

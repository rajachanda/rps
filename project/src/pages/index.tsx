import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export default function Home() {
  const { theme, playerName } = useGameStore();

  useEffect(() => {
    console.log('Page mounted with theme:', theme);
  }, [theme]);

  return (
    <div>
      <h1>Welcome {playerName}!</h1>
      <p>Current theme: {theme}</p>
    </div>
  );
}

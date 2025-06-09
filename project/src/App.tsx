import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useGameStore } from './store/gameStore';
import { Home } from './pages/Home';
import { AIGame } from './pages/AIGame';
import { Multiplayer } from './pages/Multiplayer';
import { Game } from './pages/Game';

function App() {
  const { theme } = useGameStore();

  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <Router>
      <div className={theme}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ai-game" element={<AIGame />} />
          <Route path="/multiplayer" element={<Multiplayer />} />
          <Route path="/game" element={<Game />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
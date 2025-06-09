import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useGameStore();

  return (
    <motion.button
      onClick={toggleTheme}
      className={`p-3 rounded-full transition-colors ${
        theme === 'light' 
          ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
          : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'light' ? 0 : 180 }}
        transition={{ duration: 0.3 }}
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </motion.div>
    </motion.button>
  );
};
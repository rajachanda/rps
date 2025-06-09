import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export const SoundToggle: React.FC = () => {
  const { soundEnabled, toggleSound } = useGameStore();

  return (
    <motion.button
      onClick={toggleSound}
      className={`p-3 rounded-full transition-colors ${
        soundEnabled
          ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
          : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
    </motion.button>
  );
};
import React from 'react';
import { motion } from 'framer-motion';
import { Choice } from '../types/game';

interface ChoiceButtonProps {
  choice: Choice;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
}

const choiceEmojis = {
  rock: '🪨',
  paper: '📄',
  scissors: '✂️'
};

const choiceLabels = {
  rock: 'Rock',
  paper: 'Paper',
  scissors: 'Scissors'
};

export const ChoiceButton: React.FC<ChoiceButtonProps> = ({
  choice,
  selected = false,
  disabled = false,
  onClick,
  size = 'medium'
}) => {
  const sizeClasses = {
    small: 'w-16 h-16 text-2xl',
    medium: 'w-24 h-24 text-4xl',
    large: 'w-32 h-32 text-6xl'
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        bg-white dark:bg-gray-800 
        border-4 rounded-2xl
        flex flex-col items-center justify-center
        transition-all duration-300
        hover:shadow-xl
        ${selected 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-lg' 
          : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      animate={selected ? { 
        scale: [1, 1.1, 1],
        transition: { duration: 0.3 }
      } : {}}
    >
      <span className="mb-1">{choiceEmojis[choice]}</span>
      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
        {choiceLabels[choice]}
      </span>
    </motion.button>
  );
};
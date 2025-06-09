import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, User } from 'lucide-react';
import { Player } from '../types/game';

interface ScoreBoardProps {
  players: Player[];
  targetScore: number;
  currentPlayer?: string;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  players,
  targetScore,
  currentPlayer
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-center mb-4">
        <Trophy className="text-yellow-500 mr-2\" size={24} />
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
          First to {targetScore}
        </h3>
      </div>
      
      <div className="space-y-4">
        {players.map((player, index) => (
          <motion.div
            key={player.id}
            className={`flex items-center justify-between p-3 rounded-lg ${
              player.id === currentPlayer 
                ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-300' 
                : 'bg-gray-50 dark:bg-gray-700'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center">
              <User className={`mr-2 ${
                player.id === currentPlayer ? 'text-blue-500' : 'text-gray-500'
              }`} size={20} />
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {player.name}
              </span>
            </div>
            
            <div className="flex items-center">
              <motion.span 
                className="text-2xl font-bold text-blue-600 dark:text-blue-400"
                animate={player.score > 0 ? { 
                  scale: [1, 1.3, 1],
                  transition: { duration: 0.3 }
                } : {}}
              >
                {player.score}
              </motion.span>
              <span className="text-gray-500 ml-1">/{targetScore}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
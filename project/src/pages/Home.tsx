import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bot, Users, Play, Sparkles } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { ThemeToggle } from '../components/ThemeToggle';
import { SoundToggle } from '../components/SoundToggle';
import { soundManager } from '../utils/soundManager';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { setGameMode, soundEnabled, theme } = useGameStore();
  const [playerName, setPlayerNameLocal] = useState('');
  const { setPlayerName } = useGameStore();

  const handleGameModeSelect = (mode: 'ai' | 'friend') => {
    if (!playerName.trim()) {
      alert('Please enter your name first!');
      return;
    }
    
    if (soundEnabled) soundManager.playClickSound();
    setPlayerName(playerName.trim());
    setGameMode(mode);
    
    if (mode === 'ai') {
      navigate('/ai-game');
    } else {
      navigate('/multiplayer');
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'light' 
        ? 'bg-gradient-to-br from-blue-50 via-white to-purple-50' 
        : 'bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900'
    }`}>
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-2"
        >
          <Sparkles className="text-blue-500" size={28} />
          <h1 className={`text-2xl font-bold ${
            theme === 'light' ? 'text-gray-800' : 'text-gray-100'
          }`}>
            RPS Master
          </h1>
        </motion.div>
        
        <div className="flex space-x-3">
          <SoundToggle />
          <ThemeToggle />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className={`text-5xl font-bold mb-6 ${
            theme === 'light' ? 'text-gray-800' : 'text-gray-100'
          }`}>
            Welcome to Rock Paper Scissors
          </h2>
          <p className={`text-xl mb-8 max-w-2xl mx-auto ${
            theme === 'light' ? 'text-gray-600' : 'text-gray-300'
          }`}>
            Challenge the AI or play with friends in this classic game. 
            Choose your mode and let the battle begin!
          </p>
          
          {/* Player Name Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-md mx-auto mb-8"
          >
            <input
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerNameLocal(e.target.value)}
              className={`w-full px-6 py-3 text-lg rounded-xl border-2 transition-colors ${
                theme === 'light' 
                  ? 'bg-white border-gray-200 focus:border-blue-500 text-gray-800' 
                  : 'bg-gray-800 border-gray-600 focus:border-blue-400 text-gray-100'
              } focus:outline-none focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800`}
              maxLength={20}
            />
          </motion.div>
        </motion.div>

        {/* Game Mode Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* AI Mode */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className={`relative overflow-hidden rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl ${
              theme === 'light' ? 'bg-white' : 'bg-gray-800'
            }`}
            whileHover={{ y: -5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
            <div className="relative p-8">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-6 mx-auto">
                <Bot className="text-white" size={32} />
              </div>
              
              <h3 className={`text-2xl font-bold mb-4 text-center ${
                theme === 'light' ? 'text-gray-800' : 'text-gray-100'
              }`}>
                Play with AI
              </h3>
              
              <p className={`text-center mb-6 ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-300'
              }`}>
                Challenge our smart AI opponent. Perfect for quick games and practice sessions.
              </p>
              
              <ul className={`space-y-2 mb-6 text-sm ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                <li>• Instant gameplay</li>
                <li>• Smart AI opponent</li>
                <li>• Customizable target score</li>
                <li>• Perfect for practice</li>
              </ul>
              
              <motion.button
                onClick={() => handleGameModeSelect('ai')}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Play size={20} />
                <span>Play Now</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Multiplayer Mode */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className={`relative overflow-hidden rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl ${
              theme === 'light' ? 'bg-white' : 'bg-gray-800'
            }`}
            whileHover={{ y: -5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10"></div>
            <div className="relative p-8">
              <div className="flex items-center justify-center w-16 h-16 bg-green-500 rounded-2xl mb-6 mx-auto">
                <Users className="text-white" size={32} />
              </div>
              
              <h3 className={`text-2xl font-bold mb-4 text-center ${
                theme === 'light' ? 'text-gray-800' : 'text-gray-100'
              }`}>
                Play with Friend
              </h3>
              
              <p className={`text-center mb-6 ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-300'
              }`}>
                Create or join a room to play with friends. Real-time multiplayer experience.
              </p>
              
              <ul className={`space-y-2 mb-6 text-sm ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                <li>• Real-time multiplayer</li>
                <li>• Create or join rooms</li>
                <li>• Play with friends</li>
                <li>• Synchronized gameplay</li>
              </ul>
              
              <motion.button
                onClick={() => handleGameModeSelect('friend')}
                className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Users size={20} />
                <span>Play with Friend</span>
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Game Rules */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className={`mt-16 max-w-3xl mx-auto p-8 rounded-2xl ${
            theme === 'light' ? 'bg-white' : 'bg-gray-800'
          } shadow-xl`}
        >
          <h3 className={`text-2xl font-bold mb-6 text-center ${
            theme === 'light' ? 'text-gray-800' : 'text-gray-100'
          }`}>
            How to Play
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🪨</div>
              <h4 className={`font-semibold mb-2 ${
                theme === 'light' ? 'text-gray-800' : 'text-gray-200'
              }`}>Rock</h4>
              <p className={`text-sm ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>Crushes Scissors</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-3">📄</div>
              <h4 className={`font-semibold mb-2 ${
                theme === 'light' ? 'text-gray-800' : 'text-gray-200'
              }`}>Paper</h4>
              <p className={`text-sm ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>Covers Rock</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-3">✂️</div>
              <h4 className={`font-semibold mb-2 ${
                theme === 'light' ? 'text-gray-800' : 'text-gray-200'
              }`}>Scissors</h4>
              <p className={`text-sm ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>Cuts Paper</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
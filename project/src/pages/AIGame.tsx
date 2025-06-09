import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bot, User, RotateCcw, Settings } from 'lucide-react';
import { ChoiceButton } from '../components/ChoiceButton';
import { CountdownTimer } from '../components/CountdownTimer';
import { useGameStore } from '../store/gameStore';
import { Choice } from '../types/game';
import { GameLogic } from '../../server/gameLogic';
import { soundManager } from '../utils/soundManager';

const gameLogic = new GameLogic();

export const AIGame: React.FC = () => {
  const navigate = useNavigate();
  const { 
    playerName, 
    playerScore, 
    aiScore, 
    setPlayerScore, 
    setAIScore, 
    resetAIGame, 
    soundEnabled,
    theme 
  } = useGameStore();
  
  const [targetScore, setTargetScore] = useState(5);
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'choosing' | 'result' | 'finished'>('setup');
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [aiChoice, setAIChoice] = useState<Choice | null>(null);
  const [roundResult, setRoundResult] = useState<{ result: string; message: string } | null>(null);
  const [round, setRound] = useState(1);

  const startGame = () => {
    if (soundEnabled) soundManager.playStartSound();
    resetAIGame();
    setGameState('playing');
    setRound(1);
    startRound();
  };

  const startRound = () => {
    setPlayerChoice(null);
    setAIChoice(null);
    setRoundResult(null);
    setGameState('choosing');
  };

  const handlePlayerChoice = (choice: Choice) => {
    if (gameState !== 'choosing') return;
    
    if (soundEnabled) soundManager.playClickSound();
    setPlayerChoice(choice);
    
    // AI makes its choice
    const aiResult = gameLogic.playAgainstAI(choice);
    setAIChoice(aiResult.aiChoice);
    setRoundResult(aiResult);
    setGameState('result');
    
    // Update scores
    if (aiResult.result === 'win') {
      setPlayerScore(playerScore + 1);
      if (soundEnabled) soundManager.playWinSound();
    } else if (aiResult.result === 'lose') {
      setAIScore(aiScore + 1);
      if (soundEnabled) soundManager.playLoseSound();
    } else {
      if (soundEnabled) soundManager.playTieSound();
    }
    
    // Check for game end
    setTimeout(() => {
      const newPlayerScore = aiResult.result === 'win' ? playerScore + 1 : playerScore;
      const newAIScore = aiResult.result === 'lose' ? aiScore + 1 : aiScore;
      
      if (newPlayerScore >= targetScore || newAIScore >= targetScore) {
        setGameState('finished');
      } else {
        setRound(round + 1);
        setTimeout(startRound, 1000);
      }
    }, 3000);
  };

  const handleTimeUp = () => {
    if (gameState === 'choosing') {
      // Auto-select random choice
      const choices: Choice[] = ['rock', 'paper', 'scissors'];
      const randomChoice = choices[Math.floor(Math.random() * choices.length)];
      handlePlayerChoice(randomChoice);
    }
  };

  const playAgain = () => {
    if (soundEnabled) soundManager.playClickSound();
    startGame();
  };

  const goHome = () => {
    if (soundEnabled) soundManager.playClickSound();
    navigate('/');
  };

  if (gameState === 'setup') {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        theme === 'light' 
          ? 'bg-gradient-to-br from-blue-50 via-white to-purple-50' 
          : 'bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900'
      }`}>
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <motion.button
              onClick={goHome}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                theme === 'light' 
                  ? 'bg-white hover:bg-gray-50 text-gray-700' 
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
              whileHover={{ x: -5 }}
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </motion.button>
            
            <h1 className={`text-2xl font-bold ${
              theme === 'light' ? 'text-gray-800' : 'text-gray-100'
            }`}>
              AI Challenge
            </h1>
            
            <div className="w-20"></div>
          </div>

          {/* Setup Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`max-w-md mx-auto p-8 rounded-2xl shadow-xl ${
              theme === 'light' ? 'bg-white' : 'bg-gray-800'
            }`}
          >
            <div className="text-center mb-6">
              <Bot className="mx-auto mb-4 text-blue-500" size={48} />
              <h2 className={`text-2xl font-bold mb-2 ${
                theme === 'light' ? 'text-gray-800' : 'text-gray-100'
              }`}>
                Challenge the AI
              </h2>
              <p className={`${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Hello {playerName}! Ready to test your skills?
              </p>
            </div>

            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'light' ? 'text-gray-700' : 'text-gray-300'
              }`}>
                Target Score
              </label>
              <select
                value={targetScore}
                onChange={(e) => setTargetScore(Number(e.target.value))}
                className={`w-full p-3 rounded-lg border transition-colors ${
                  theme === 'light' 
                    ? 'bg-white border-gray-300 text-gray-800' 
                    : 'bg-gray-700 border-gray-600 text-gray-100'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value={3}>First to 3</option>
                <option value={5}>First to 5</option>
                <option value={7}>First to 7</option>
                <option value={10}>First to 10</option>
              </select>
            </div>

            <motion.button
              onClick={startGame}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Game
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'light' 
        ? 'bg-gradient-to-br from-blue-50 via-white to-purple-50' 
        : 'bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900'
    }`}>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.button
            onClick={goHome}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              theme === 'light' 
                ? 'bg-white hover:bg-gray-50 text-gray-700' 
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
            whileHover={{ x: -5 }}
          >
            <ArrowLeft size={20} />
            <span>Home</span>
          </motion.button>
          
          <h1 className={`text-xl font-bold ${
            theme === 'light' ? 'text-gray-800' : 'text-gray-100'
          }`}>
            Round {round}
          </h1>
          
          <div className="w-20"></div>
        </div>

        {/* Score Board */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.div
            className={`p-6 rounded-xl text-center ${
              theme === 'light' ? 'bg-white' : 'bg-gray-800'
            } shadow-lg`}
            animate={playerScore > 0 ? { scale: [1, 1.05, 1] } : {}}
          >
            <User className="mx-auto mb-2 text-blue-500" size={24} />
            <h3 className={`font-semibold ${
              theme === 'light' ? 'text-gray-800' : 'text-gray-200'
            }`}>
              {playerName}
            </h3>
            <div className="text-3xl font-bold text-blue-600">{playerScore}</div>
          </motion.div>
          
          <motion.div
            className={`p-6 rounded-xl text-center ${
              theme === 'light' ? 'bg-white' : 'bg-gray-800'
            } shadow-lg`}
            animate={aiScore > 0 ? { scale: [1, 1.05, 1] } : {}}
          >
            <Bot className="mx-auto mb-2 text-red-500" size={24} />
            <h3 className={`font-semibold ${
              theme === 'light' ? 'text-gray-800' : 'text-gray-200'
            }`}>
              AI Opponent
            </h3>
            <div className="text-3xl font-bold text-red-600">{aiScore}</div>
          </motion.div>
        </div>

        {/* Game Area */}
        <div className={`max-w-2xl mx-auto p-8 rounded-2xl shadow-xl ${
          theme === 'light' ? 'bg-white' : 'bg-gray-800'
        }`}>
          {gameState === 'choosing' && (
            <>
              <div className="text-center mb-8">
                <h2 className={`text-2xl font-bold mb-4 ${
                  theme === 'light' ? 'text-gray-800' : 'text-gray-100'
                }`}>
                  Make Your Choice!
                </h2>
                <CountdownTimer
                  seconds={10}
                  onComplete={handleTimeUp}
                  onTick={(remaining) => {
                    if (remaining <= 3 && remaining > 0 && soundEnabled) {
                      soundManager.playCountdownSound();
                    }
                  }}
                />
              </div>

              <div className="flex justify-center space-x-6">
                <ChoiceButton
                  choice="rock"
                  onClick={() => handlePlayerChoice('rock')}
                  size="large"
                />
                <ChoiceButton
                  choice="paper"
                  onClick={() => handlePlayerChoice('paper')}
                  size="large"
                />
                <ChoiceButton
                  choice="scissors"
                  onClick={() => handlePlayerChoice('scissors')}
                  size="large"
                />
              </div>
            </>
          )}

          {gameState === 'result' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <h2 className={`text-2xl font-bold mb-6 ${
                theme === 'light' ? 'text-gray-800' : 'text-gray-100'
              }`}>
                Round Result
              </h2>

              <div className="flex justify-center items-center space-x-8 mb-6">
                <div className="text-center">
                  <div className={`text-sm font-medium mb-2 ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {playerName}
                  </div>
                  <ChoiceButton choice={playerChoice!} size="large" disabled />
                </div>
                
                <div className={`text-4xl font-bold ${
                  theme === 'light' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  VS
                </div>
                
                <div className="text-center">
                  <div className={`text-sm font-medium mb-2 ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    AI
                  </div>
                  <ChoiceButton choice={aiChoice!} size="large" disabled />
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-xl font-bold p-4 rounded-lg ${
                  roundResult?.result === 'win' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : roundResult?.result === 'lose'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                }`}
              >
                {roundResult?.message}
              </motion.div>
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <h2 className={`text-3xl font-bold mb-6 ${
                playerScore >= targetScore 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {playerScore >= targetScore ? '🎉 You Won!' : '😢 AI Wins!'}
              </h2>

              <div className={`text-lg mb-8 ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Final Score: {playerName} {playerScore} - {aiScore} AI
              </div>

              <div className="flex justify-center space-x-4">
                <motion.button
                  onClick={playAgain}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RotateCcw size={20} />
                  <span>Play Again</span>
                </motion.button>
                
                <motion.button
                  onClick={goHome}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-colors ${
                    theme === 'light' 
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft size={20} />
                  <span>Home</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
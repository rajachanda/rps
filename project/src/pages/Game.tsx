import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, Users, RotateCcw, Trophy } from 'lucide-react';
import { ChoiceButton } from '../components/ChoiceButton';
import { CountdownTimer } from '../components/CountdownTimer';
import { ScoreBoard } from '../components/ScoreBoard';
import { useGameStore } from '../store/gameStore';
import { useSocket } from '../hooks/useSocket';
import { Choice, RoundResult } from '../types/game';
import { soundManager } from '../utils/soundManager';

export const Game: React.FC = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const { currentRoom, setCurrentRoom, soundEnabled, theme } = useGameStore();
  
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'choosing' | 'result' | 'finished'>('lobby');
  const [currentRound, setCurrentRound] = useState(1);
  const [countdown, setCountdown] = useState(10);
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [winner, setWinner] = useState<any>(null);
  const [showRules, setShowRules] = useState(false);

  const currentPlayer = socket?.id;
  const isHost = currentRoom?.host === currentPlayer;

  useEffect(() => {
    if (!socket || !currentRoom) {
      navigate('/multiplayer');
      return;
    }

    socket.on('game-started', (data) => {
      setCurrentRoom(data.room);
      setGameState('playing');
      setShowRules(true);
      if (soundEnabled) soundManager.playStartSound();
    });

    socket.on('round-start', (data) => {
      setCurrentRound(data.round);
      setCountdown(data.countdown);
      setGameState('choosing');
      setPlayerChoice(null);
      setRoundResult(null);
      setShowRules(false);
      if (soundEnabled) soundManager.playStartSound();
    });

    socket.on('round-result', (data: RoundResult) => {
      setRoundResult(data);
      setCurrentRoom(data.room);
      setGameState('result');
      
      // Play appropriate sound
      if (soundEnabled) {
        if (!data.result.winner) {
          soundManager.playTieSound();
        } else if (data.result.winner === currentPlayer) {
          soundManager.playWinSound();
        } else {
          soundManager.playLoseSound();
        }
      }
    });

    socket.on('game-over', (data) => {
      setWinner(data.winner);
      setCurrentRoom(data.room);
      setGameState('finished');
      
      if (soundEnabled) {
        if (data.winner.id === currentPlayer) {
          soundManager.playWinSound();
        } else {
          soundManager.playLoseSound();
        }
      }
    });

    socket.on('rematch-ready', (data) => {
      setCurrentRoom(data.room);
      setGameState('lobby');
      setCurrentRound(1);
      setPlayerChoice(null);
      setRoundResult(null);
      setWinner(null);
      if (soundEnabled) soundManager.playStartSound();
    });

    socket.on('player-disconnected', (data) => {
      setCurrentRoom(data.room);
      // Handle player disconnection (could show notification)
    });

    return () => {
      socket.off('game-started');
      socket.off('round-start');
      socket.off('round-result');
      socket.off('game-over');
      socket.off('rematch-ready');
      socket.off('player-disconnected');
    };
  }, [socket, currentRoom, navigate, setCurrentRoom, soundEnabled, currentPlayer]);

  const startGame = () => {
    if (!socket || !currentRoom || !isHost) return;
    
    if (soundEnabled) soundManager.playClickSound();
    socket.emit('start-game', { roomCode: currentRoom.code });
  };

  const handlePlayerChoice = (choice: Choice) => {
    if (!socket || !currentRoom || gameState !== 'choosing') return;
    
    if (soundEnabled) soundManager.playClickSound();
    setPlayerChoice(choice);
    socket.emit('player-choice', { roomCode: currentRoom.code, choice });
  };

  const handleTimeUp = () => {
    if (gameState === 'choosing' && !playerChoice) {
      // Auto-select random choice
      const choices: Choice[] = ['rock', 'paper', 'scissors'];
      const randomChoice = choices[Math.floor(Math.random() * choices.length)];
      handlePlayerChoice(randomChoice);
    }
  };

  const requestRematch = () => {
    if (!socket || !currentRoom) return;
    
    if (soundEnabled) soundManager.playClickSound();
    socket.emit('rematch', { roomCode: currentRoom.code });
  };

  const goHome = () => {
    if (soundEnabled) soundManager.playClickSound();
    navigate('/');
  };

  if (!currentRoom) {
    return <div>Loading...</div>;
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
          
          <div className="text-center">
            <h1 className={`text-xl font-bold ${
              theme === 'light' ? 'text-gray-800' : 'text-gray-100'
            }`}>
              Room: {currentRoom.code}
            </h1>
            {gameState === 'choosing' && (
              <p className={`text-sm ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Round {currentRound}
              </p>
            )}
          </div>
          
          <div className="w-20"></div>
        </div>

        {/* Score Board */}
        <div className="mb-8">
          <ScoreBoard
            players={currentRoom.players}
            targetScore={currentRoom.targetScore}
            currentPlayer={currentPlayer}
          />
        </div>

        {/* Game Content */}
        <div className={`max-w-2xl mx-auto p-8 rounded-2xl shadow-xl ${
          theme === 'light' ? 'bg-white' : 'bg-gray-800'
        }`}>
          {/* Lobby */}
          {gameState === 'lobby' && (
            <div className="text-center">
              <Users className="mx-auto mb-4 text-blue-500\" size={48} />
              <h2 className={`text-2xl font-bold mb-4 ${
                theme === 'light' ? 'text-gray-800' : 'text-gray-100'
              }`}>
                Game Lobby
              </h2>
              
              <div className="mb-6">
                <p className={`mb-2 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Players: {currentRoom.players.length}/2
                </p>
                <div className="space-y-2">
                  {currentRoom.players.map((player) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-center space-x-2 p-2 rounded-lg ${
                        theme === 'light' ? 'bg-gray-50' : 'bg-gray-700'
                      }`}
                    >
                      {player.id === currentRoom.host && (
                        <Crown className="text-yellow-500\" size={16} />
                      )}
                      <span className={`${
                        theme === 'light' ? 'text-gray-800' : 'text-gray-200'
                      }`}>
                        {player.name}
                      </span>
                      {player.id === currentPlayer && (
                        <span className="text-xs text-blue-600">(You)</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {currentRoom.players.length === 2 ? (
                isHost ? (
                  <motion.button
                    onClick={startGame}
                    className="bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold py-3 px-8 rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Start Game
                  </motion.button>
                ) : (
                  <p className={`${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    Waiting for host to start the game...
                  </p>
                )
              ) : (
                <p className={`${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Waiting for another player to join...
                </p>
              )}
            </div>
          )}

          {/* Rules Display */}
          {showRules && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <h2 className={`text-2xl font-bold mb-6 ${
                theme === 'light' ? 'text-gray-800' : 'text-gray-100'
              }`}>
                Get Ready!
              </h2>
              
              <div className={`p-6 rounded-xl mb-6 ${
                theme === 'light' ? 'bg-blue-50' : 'bg-blue-900/30'
              }`}>
                <h3 className={`font-bold mb-4 ${
                  theme === 'light' ? 'text-blue-800' : 'text-blue-300'
                }`}>
                  Game Rules
                </h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🪨</div>
                    <p className={`${
                      theme === 'light' ? 'text-blue-700' : 'text-blue-400'
                    }`}>
                      Rock beats Scissors
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">📄</div>
                    <p className={`${
                      theme === 'light' ? 'text-blue-700' : 'text-blue-400'
                    }`}>
                      Paper beats Rock
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">✂️</div>
                    <p className={`${
                      theme === 'light' ? 'text-blue-700' : 'text-blue-400'
                    }`}>
                      Scissors beats Paper
                    </p>
                  </div>
                </div>
              </div>
              
              <p className={`text-lg ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                First to {currentRoom.targetScore} wins!
              </p>
            </motion.div>
          )}

          {/* Choosing Phase */}
          {gameState === 'choosing' && (
            <>
              <div className="text-center mb-8">
                <h2 className={`text-2xl font-bold mb-4 ${
                  theme === 'light' ? 'text-gray-800' : 'text-gray-100'
                }`}>
                  Make Your Choice!
                </h2>
                <CountdownTimer
                  seconds={countdown}
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
                  selected={playerChoice === 'rock'}
                  onClick={() => handlePlayerChoice('rock')}
                  disabled={!!playerChoice}
                  size="large"
                />
                <ChoiceButton
                  choice="paper"
                  selected={playerChoice === 'paper'}
                  onClick={() => handlePlayerChoice('paper')}
                  disabled={!!playerChoice}
                  size="large"
                />
                <ChoiceButton
                  choice="scissors"
                  selected={playerChoice === 'scissors'}
                  onClick={() => handlePlayerChoice('scissors')}
                  disabled={!!playerChoice}
                  size="large"
                />
              </div>

              {playerChoice && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-center mt-4 ${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}
                >
                  Waiting for other player...
                </motion.p>
              )}
            </>
          )}

          {/* Result Phase */}
          {gameState === 'result' && roundResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <h2 className={`text-2xl font-bold mb-6 ${
                theme === 'light' ? 'text-gray-800' : 'text-gray-100'
              }`}>
                Round {currentRound} Result
              </h2>

              <div className="flex justify-center items-center space-x-8 mb-6">
                {currentRoom.players.map((player, index) => (
                  <div key={player.id} className="text-center">
                    <div className={`text-sm font-medium mb-2 ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {player.name}
                      {player.id === currentPlayer && ' (You)'}
                    </div>
                    <ChoiceButton
                      choice={roundResult.choices[player.id]}
                      size="large"
                      disabled
                    />
                  </div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-xl font-bold p-4 rounded-lg ${
                  !roundResult.result.winner
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                    : roundResult.result.winner === currentPlayer
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}
              >
                {roundResult.result.message}
              </motion.div>
            </motion.div>
          )}

          {/* Game Finished */}
          {gameState === 'finished' && winner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Trophy className={`mx-auto mb-4 ${
                winner.id === currentPlayer ? 'text-yellow-500' : 'text-gray-400'
              }`} size={64} />
              
              <h2 className={`text-3xl font-bold mb-4 ${
                winner.id === currentPlayer
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {winner.id === currentPlayer ? '🎉 You Won!' : `${winner.name} Wins!`}
              </h2>

              <div className={`text-lg mb-8 ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Final Score: {currentRoom.players.map(p => `${p.name} ${p.score}`).join(' - ')}
              </div>

              <div className="flex justify-center space-x-4">
                <motion.button
                  onClick={requestRematch}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RotateCcw size={20} />
                  <span>Rematch</span>
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
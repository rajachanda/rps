import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Hash, Users, Copy, Check } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useSocket } from '../hooks/useSocket';
import { soundManager } from '../utils/soundManager';

export const Multiplayer: React.FC = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const { playerName, soundEnabled, theme, setCurrentRoom } = useGameStore();
  
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');
  const [targetScore, setTargetScore] = useState(5);
  const [roomCode, setRoomCode] = useState('');
  const [generatedRoomCode, setGeneratedRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.on('room-created', (data) => {
      setGeneratedRoomCode(data.roomCode);
      setCurrentRoom(data.room);
      setIsLoading(false);
      if (soundEnabled) soundManager.playStartSound();
    });

    socket.on('room-joined', (data) => {
      setCurrentRoom(data.room);
      navigate('/game');
      if (soundEnabled) soundManager.playStartSound();
    });

    socket.on('join-error', (data) => {
      setError(data.message);
      setIsLoading(false);
      if (soundEnabled) soundManager.playLoseSound();
    });

    socket.on('player-joined', (data) => {
      setCurrentRoom(data.room);
      if (data.room.players.length === 2) {
        navigate('/game');
      }
    });

    return () => {
      socket.off('room-created');
      socket.off('room-joined');
      socket.off('join-error');
      socket.off('player-joined');
    };
  }, [socket, navigate, setCurrentRoom, soundEnabled]);

  const handleCreateRoom = () => {
    if (!socket) return;
    
    setIsLoading(true);
    setError('');
    if (soundEnabled) soundManager.playClickSound();
    
    socket.emit('create-room', {
      playerName,
      targetScore
    });
  };

  const handleJoinRoom = () => {
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }
    
    if (!socket) return;
    
    setIsLoading(true);
    setError('');
    if (soundEnabled) soundManager.playClickSound();
    
    socket.emit('join-room', {
      roomCode: roomCode.toUpperCase(),
      playerName
    });
  };

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedRoomCode);
      setCopied(true);
      if (soundEnabled) soundManager.playClickSound();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy room code');
    }
  };

  const goBack = () => {
    if (soundEnabled) soundManager.playClickSound();
    if (mode === 'select') {
      navigate('/');
    } else {
      setMode('select');
      setError('');
      setGeneratedRoomCode('');
    }
  };

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
            onClick={goBack}
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
            Multiplayer
          </h1>
          
          <div className="w-20"></div>
        </div>

        {/* Mode Selection */}
        {mode === 'select' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-8">
              <Users className="mx-auto mb-4 text-blue-500" size={48} />
              <h2 className={`text-3xl font-bold mb-2 ${
                theme === 'light' ? 'text-gray-800' : 'text-gray-100'
              }`}>
                Play with Friends
              </h2>
              <p className={`text-lg ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Hello {playerName}! Choose how you want to play.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Create Room */}
              <motion.div
                className={`p-8 rounded-2xl shadow-xl cursor-pointer transition-all duration-300 hover:shadow-2xl ${
                  theme === 'light' ? 'bg-white hover:bg-gray-50' : 'bg-gray-800 hover:bg-gray-700'
                }`}
                whileHover={{ y: -5 }}
                onClick={() => setMode('create')}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Plus className="text-white" size={32} />
                  </div>
                  <h3 className={`text-xl font-bold mb-3 ${
                    theme === 'light' ? 'text-gray-800' : 'text-gray-100'
                  }`}>
                    Create Room
                  </h3>
                  <p className={`${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    Start a new game and invite your friend with a room code.
                  </p>
                </div>
              </motion.div>

              {/* Join Room */}
              <motion.div
                className={`p-8 rounded-2xl shadow-xl cursor-pointer transition-all duration-300 hover:shadow-2xl ${
                  theme === 'light' ? 'bg-white hover:bg-gray-50' : 'bg-gray-800 hover:bg-gray-700'
                }`}
                whileHover={{ y: -5 }}
                onClick={() => setMode('join')}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Hash className="text-white" size={32} />
                  </div>
                  <h3 className={`text-xl font-bold mb-3 ${
                    theme === 'light' ? 'text-gray-800' : 'text-gray-100'
                  }`}>
                    Join Room
                  </h3>
                  <p className={`${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    Enter a room code to join an existing game.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Create Room */}
        {mode === 'create' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`max-w-md mx-auto p-8 rounded-2xl shadow-xl ${
              theme === 'light' ? 'bg-white' : 'bg-gray-800'
            }`}
          >
            {!generatedRoomCode ? (
              <>
                <div className="text-center mb-6">
                  <Plus className="mx-auto mb-4 text-green-500\" size={48} />
                  <h2 className={`text-2xl font-bold mb-2 ${
                    theme === 'light' ? 'text-gray-800' : 'text-gray-100'
                  }`}>
                    Create New Room
                  </h2>
                  <p className={`${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    Set up your game preferences
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
                    disabled={isLoading}
                  >
                    <option value={3}>First to 3</option>
                    <option value={5}>First to 5</option>
                    <option value={7}>First to 7</option>
                    <option value={10}>First to 10</option>
                  </select>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <motion.button
                  onClick={handleCreateRoom}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50"
                  whileHover={!isLoading ? { scale: 1.02 } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                >
                  {isLoading ? 'Creating Room...' : 'Create Room'}
                </motion.button>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Check className="text-white" size={32} />
                  </div>
                  <h2 className={`text-2xl font-bold mb-2 ${
                    theme === 'light' ? 'text-gray-800' : 'text-gray-100'
                  }`}>
                    Room Created!
                  </h2>
                  <p className={`${
                    theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    Share this code with your friend
                  </p>
                </div>

                <div className={`p-6 rounded-xl border-2 border-dashed mb-6 text-center ${
                  theme === 'light' 
                    ? 'bg-gray-50 border-gray-300' 
                    : 'bg-gray-700 border-gray-600'
                }`}>
                  <div className={`text-3xl font-bold mb-2 tracking-wider ${
                    theme === 'light' ? 'text-gray-800' : 'text-gray-100'
                  }`}>
                    {generatedRoomCode}
                  </div>
                  <motion.button
                    onClick={copyRoomCode}
                    className="flex items-center space-x-2 mx-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                  </motion.button>
                </div>

                <div className={`text-center text-sm ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Waiting for your friend to join...
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* Join Room */}
        {mode === 'join' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`max-w-md mx-auto p-8 rounded-2xl shadow-xl ${
              theme === 'light' ? 'bg-white' : 'bg-gray-800'
            }`}
          >
            <div className="text-center mb-6">
              <Hash className="mx-auto mb-4 text-blue-500" size={48} />
              <h2 className={`text-2xl font-bold mb-2 ${
                theme === 'light' ? 'text-gray-800' : 'text-gray-100'
              }`}>
                Join Room
              </h2>
              <p className={`${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Enter the room code from your friend
              </p>
            </div>

            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'light' ? 'text-gray-700' : 'text-gray-300'
              }`}>
                Room Code
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className={`w-full p-3 rounded-lg border text-center text-lg font-mono transition-colors ${
                  theme === 'light' 
                    ? 'bg-white border-gray-300 text-gray-800' 
                    : 'bg-gray-700 border-gray-600 text-gray-100'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <motion.button
              onClick={handleJoinRoom}
              disabled={isLoading || !roomCode.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50"
              whileHover={!isLoading && roomCode.trim() ? { scale: 1.02 } : {}}
              whileTap={!isLoading && roomCode.trim() ? { scale: 0.98 } : {}}
            >
              {isLoading ? 'Joining Room...' : 'Join Room'}
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
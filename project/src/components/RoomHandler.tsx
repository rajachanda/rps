import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { RoomManager } from '../utils/roomManager';

export const RoomHandler = () => {
  const { activeSession, roomCode, isHost, waitingForOpponent, gameMode, setGameMode } = useGameStore();
  const [isLoading, setIsLoading] = useState(false);
  const [inGame, setInGame] = useState(false);

  useEffect(() => {
    const initializeGame = async () => {
      if (activeSession && roomCode) {
        setInGame(true);
        setGameMode('multiplayer');
        await RoomManager.initializeGameSession(roomCode, isHost);
        useGameStore.getState().setWaitingForOpponent(false);
      }
    };

    initializeGame();

    // Check and restore session
    const savedRoomCode = localStorage.getItem('lastRoomCode');
    if (savedRoomCode && !activeSession) {
      const savedIsHost = localStorage.getItem('isHost') === 'true';
      RoomManager.joinExistingRoom(savedRoomCode, savedIsHost);
      setInGame(true);
    }

    const cleanup = () => {
      if (inGame) {
        RoomManager.leaveRoom();
      }
    };

    window.addEventListener('beforeunload', cleanup);
    return () => {
      window.removeEventListener('beforeunload', cleanup);
    };
  }, [activeSession, roomCode, isHost]);

  const handleLeaveRoom = async () => {
    setIsLoading(true);
    try {
      await RoomManager.leaveRoom();
      setInGame(false);
      useGameStore.getState().setGameMode(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeSession || !inGame) return null;

  return (
    <div className="room-handler">
      <div>Room Code: {roomCode}</div>
      <div>Role: {isHost ? 'Host' : 'Guest'}</div>
      {inGame && <div>Game in Progress</div>}
      <button onClick={handleLeaveRoom} disabled={isLoading}>
        {isLoading ? 'Leaving...' : 'Leave Game'}
      </button>
    </div>
  );
};

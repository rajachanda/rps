import { useState } from 'react';
import { RoomManager } from '../utils/roomManager';
import { useGameStore } from '../store/gameStore';

export const RoomJoin = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setJoining(true);

    try {
      if (RoomManager.isRoomFull(code)) {
        setError('Room is full');
        return;
      }

      const success = await RoomManager.joinRoom(code);
      if (!success) {
        setError('Invalid room code');
      }
    } catch (err) {
      setError('Failed to join room');
    } finally {
      setJoining(false);
    }
  };

  return (
    <form onSubmit={handleJoin}>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="Enter Room Code"
        maxLength={6}
        disabled={joining}
      />
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type="submit" disabled={joining || code.length !== 6}>
        {joining ? 'Joining...' : 'Join Game'}
      </button>
    </form>
  );
};

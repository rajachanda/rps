import { useGameStore } from '../store/gameStore';

export class RoomManager {
  static rooms = new Map<string, {
    hostConnected: boolean;
    guestConnected: boolean;
    gameState: 'waiting' | 'playing' | 'finished';
    hostChoice?: string;
    guestChoice?: string;
  }>();

  static createRoom() {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.rooms.set(roomCode, { hostConnected: true, guestConnected: false, gameState: 'waiting' });
    
    const store = useGameStore.getState();
    store.setGameMode('multiplayer');
    store.setRoomCode(roomCode);
    store.setIsHost(true);
    store.setActiveSession(true);
    
    localStorage.setItem('lastRoomCode', roomCode);
    localStorage.setItem('isHost', 'true');
    
    return roomCode;
  }

  static async initializeGameSession(roomCode: string, isHost: boolean) {
    const room = this.rooms.get(roomCode) || {
      hostConnected: isHost,
      guestConnected: !isHost,
      gameState: 'waiting'
    };

    this.rooms.set(roomCode, {
      ...room,
      hostConnected: isHost ? true : room.hostConnected,
      guestConnected: isHost ? room.guestConnected : true,
      gameState: 'playing'
    });

    const store = useGameStore.getState();
    store.setWaitingForOpponent(false);
    store.setGameMode('multiplayer');
    
    // Persist game session
    localStorage.setItem('gameSessionActive', 'true');
    return true;
  }

  static async joinRoom(code: string): Promise<boolean> {
    const trimmedCode = code.toUpperCase();
    const room = this.rooms.get(trimmedCode);
    
    if (!room || room.gameState === 'finished') {
      return false;
    }
    
    const store = useGameStore.getState();
    store.setGameMode('multiplayer');
    store.setRoomCode(trimmedCode);
    store.setIsHost(false);
    store.setActiveSession(true);
    
    // Update room state
    this.rooms.set(trimmedCode, {
      ...room,
      guestConnected: true,
      gameState: 'playing'
    });

    // Persist session
    localStorage.setItem('lastRoomCode', trimmedCode);
    localStorage.setItem('isHost', 'false');
    localStorage.setItem('gameSessionActive', 'true');
    
    return true;
  }

  static joinExistingRoom(code: string, isHost: boolean) {
    const store = useGameStore.getState();
    store.setGameMode('multiplayer');
    store.setRoomCode(code);
    store.setIsHost(isHost);
    store.setActiveSession(true);
  }

  static async leaveRoom() {
    const store = useGameStore.getState();
    const code = store.roomCode;
    
    if (code) {
      this.rooms.delete(code);
    }
    
    localStorage.removeItem('lastRoomCode');
    localStorage.removeItem('isHost');
    
    store.setRoomCode(null);
    store.setIsHost(false);
    store.setActiveSession(false);
    store.setGameMode(null);
  }

  static isRoomFull(code: string): boolean {
    const room = this.rooms.get(code);
    return room ? room.hostConnected && room.guestConnected : false;
  }

  static async makeMove(roomCode: string, isHost: boolean, choice: string) {
    const room = this.rooms.get(roomCode);
    if (!room) return false;

    if (isHost) {
      room.hostChoice = choice;
    } else {
      room.guestChoice = choice;
    }

    this.rooms.set(roomCode, room);
    return true;
  }

  static getRoomState(roomCode: string) {
    return this.rooms.get(roomCode);
  }
}

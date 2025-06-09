import io, { Socket } from 'socket.io-client';
import { useGameStore } from '../store/gameStore';

class SocketManager {
  private socket: Socket | null = null;
  
  connect(serverUrl: string = 'http://localhost:3001') {
    this.socket = io(serverUrl);
    
    this.socket.on('connect', () => {
      useGameStore.getState().setIsConnected(true);
    });
    
    this.socket.on('disconnect', () => {
      useGameStore.getState().setIsConnected(false);
    });
    
    this.setupGameEvents();
  }
  
  private setupGameEvents() {
    if (!this.socket) return;
    
    this.socket.on('player-joined', (playerName: string) => {
      useGameStore.getState().setOpponentName(playerName);
      useGameStore.getState().setWaitingForOpponent(false);
    });
    
    this.socket.on('player-choice', (choice: string) => {
      useGameStore.getState().setOpponentChoice(choice as any);
    });
  }
  
  createRoom(playerName: string) {
    if (!this.socket) return;
    this.socket.emit('create-room', { playerName });
    useGameStore.getState().setIsHost(true);
    useGameStore.getState().setWaitingForOpponent(true);
  }
  
  joinRoom(roomCode: string, playerName: string) {
    if (!this.socket) return;
    this.socket.emit('join-room', { roomCode, playerName });
    useGameStore.getState().setIsHost(false);
  }
  
  makeChoice(choice: string) {
    if (!this.socket) return;
    this.socket.emit('make-choice', { choice });
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketManager = new SocketManager();

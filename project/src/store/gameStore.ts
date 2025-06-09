import { create } from 'zustand';
import { Choice, GameMode, Room, Theme } from '../types/game';

// Add debug logging
const log = (message: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[GameStore] ${message}`);
  }
};

interface GameState {
  // Theme
  theme: Theme;
  toggleTheme: () => void;
  
  // Game settings
  gameMode: GameMode | null;
  setGameMode: (mode: GameMode) => void;
  
  // Player info
  playerName: string;
  setPlayerName: (name: string) => void;
  
  // Room info
  currentRoom: Room | null;
  setCurrentRoom: (room: Room | null) => void;
  
  // AI game state
  aiScore: number;
  playerScore: number;
  setAIScore: (score: number) => void;
  setPlayerScore: (score: number) => void;
  resetAIGame: () => void;
  
  // Game state
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
  
  // Sound settings
  soundEnabled: boolean;
  toggleSound: () => void;

  // Multiplayer specific state
  opponentName: string | null;
  opponentChoice: Choice | null;
  roomCode: string | null;
  isHost: boolean;
  waitingForOpponent: boolean;

  // Room session
  activeSession: boolean;
  
  // Multiplayer methods
  setOpponentName: (name: string | null) => void;
  setOpponentChoice: (choice: Choice | null) => void;
  setRoomCode: (code: string | null) => void;
  setIsHost: (isHost: boolean) => void;
  setWaitingForOpponent: (waiting: boolean) => void;

  // Initialization state
  initialized: boolean;
  resetRoom: () => void;
}

export const useGameStore = create<GameState>((set, get) => {
  log('Initializing game store...');
  
  // Initialize localStorage if needed
  if (typeof window !== 'undefined' && !localStorage.getItem('initialized')) {
    localStorage.setItem('theme', 'light');
    localStorage.setItem('playerName', 'Player');
    localStorage.setItem('soundEnabled', 'true');
    localStorage.setItem('initialized', 'true');
  }

  return {
    initialized: true,
    
    // Theme
    theme: (typeof window !== 'undefined' ? localStorage.getItem('theme') : 'light') as Theme || 'light',
    toggleTheme: () => set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage?.setItem('theme', newTheme);
      return { theme: newTheme };
    }),
    
    // Game settings
    gameMode: null,
    setGameMode: (mode) => {
      log(`Setting game mode: ${mode}`);
      if (!mode) return;
      set({ gameMode: mode });
    },
    
    // Player info
    playerName: localStorage.getItem('playerName') || 'Player',
    setPlayerName: (name) => {
      log(`Setting player name: ${name}`);
      if (!name?.trim()) return;
      localStorage?.setItem('playerName', name);
      set({ playerName: name });
    },
    
    // Room info
    currentRoom: null,
    setCurrentRoom: (room) => {
      if (room && !room.id) return;
      set({ 
        currentRoom: room,
        activeSession: !!room,
        waitingForOpponent: !!room && room.players?.length === 1
      });
    },
    
    // AI game state
    aiScore: 0,
    playerScore: 0,
    setAIScore: (score) => set({ aiScore: Math.max(0, score) }),
    setPlayerScore: (score) => set({ playerScore: Math.max(0, score) }),
    resetAIGame: () => {
      if (get().gameMode !== 'ai') return;
      set({ aiScore: 0, playerScore: 0 });
    },
    
    // Game state
    isConnected: false,
    setIsConnected: (connected) => set({ isConnected: connected }),
    
    // Sound settings
    soundEnabled: localStorage.getItem('soundEnabled') !== 'false',
    toggleSound: () => set((state) => {
      const newState = !state.soundEnabled;
      localStorage.setItem('soundEnabled', String(newState));
      return { soundEnabled: newState };
    }),

    // Multiplayer state
    opponentName: null,
    opponentChoice: null,
    roomCode: null,
    isHost: false,
    waitingForOpponent: false,
    activeSession: false,
    
    // Multiplayer methods
    setOpponentName: (name) => set({ opponentName: name }),
    setOpponentChoice: (choice) => set({ opponentChoice: choice }),
    setRoomCode: (code) => {
      log(`Setting room code: ${code}`);
      if (code) {
        localStorage.setItem('lastRoomCode', code);
      } else {
        localStorage.removeItem('lastRoomCode');
      }
      set({ roomCode: code });
    },
    setIsHost: (isHost) => set({ isHost }),
    setWaitingForOpponent: (waiting) => set({ waitingForOpponent: waiting }),
    setActiveSession: (active) => {
      set({ activeSession: active });
      if (!active) {
        get().resetRoom();
      }
    },
    resetRoom: () => {
      set({
        roomCode: null,
        opponentName: null,
        opponentChoice: null,
        isHost: false,
        waitingForOpponent: false,
        activeSession: false
      });
      localStorage.removeItem('lastRoomCode');
    },
  };
});

// Add selector to check if store is ready
export const useGameStoreReady = () => useGameStore(state => state.initialized);
export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface Room {
  code: string;
  host: string;
  players: Player[];
  targetScore: number;
  gameState: 'waiting' | 'playing' | 'finished';
  currentRound: number;
  currentChoices: Record<string, Choice>;
  createdAt: number;
}

export type Choice = 'rock' | 'paper' | 'scissors';

export interface GameResult {
  winner: string | null;
  result: 'win' | 'lose' | 'tie';
  message: string;
  winnerName?: string;
}

export interface RoundResult {
  choices: Record<string, Choice>;
  result: GameResult;
  room: Room;
}

export type GameMode = 'ai' | 'friend';
export type Theme = 'light' | 'dark';
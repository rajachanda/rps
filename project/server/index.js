import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { RoomManager } from './roomManager.js';
import { GameLogic } from './gameLogic.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const roomManager = new RoomManager();
const gameLogic = new GameLogic();

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../dist')));
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('create-room', (data) => {
    const { playerName, targetScore } = data;
    const room = roomManager.createRoom(socket.id, playerName, targetScore);
    
    socket.join(room.code);
    socket.emit('room-created', {
      roomCode: room.code,
      room: room
    });
  });

  socket.on('join-room', (data) => {
    const { roomCode, playerName } = data;
    const result = roomManager.joinRoom(roomCode, socket.id, playerName);
    
    if (result.success) {
      socket.join(roomCode);
      socket.emit('room-joined', { room: result.room });
      
      // Notify all players in the room
      io.to(roomCode).emit('player-joined', { room: result.room });
    } else {
      socket.emit('join-error', { message: result.message });
    }
  });

  socket.on('start-game', (data) => {
    const { roomCode } = data;
    const room = roomManager.getRoom(roomCode);
    
    if (room && room.host === socket.id && room.players.length === 2) {
      room.gameState = 'playing';
      room.currentRound = 1;
      room.roundStartTime = Date.now();
      
      io.to(roomCode).emit('game-started', { room });
      
      // Start the first round
      setTimeout(() => {
        io.to(roomCode).emit('round-start', { 
          round: room.currentRound,
          countdown: 10 
        });
      }, 3000); // 3 second delay after game starts
    }
  });

  socket.on('player-choice', (data) => {
    const { roomCode, choice } = data;
    const room = roomManager.getRoom(roomCode);
    
    if (room && room.gameState === 'playing') {
      // Store player choice
      if (!room.currentChoices) {
        room.currentChoices = {};
      }
      room.currentChoices[socket.id] = choice;
      
      // Check if both players have made their choice
      if (Object.keys(room.currentChoices).length === 2) {
        const result = gameLogic.determineWinner(room.currentChoices, room.players);
        
        // Update scores
        if (result.winner) {
          const winnerPlayer = room.players.find(p => p.id === result.winner);
          if (winnerPlayer) {
            winnerPlayer.score++;
          }
        }
        
        io.to(roomCode).emit('round-result', {
          choices: room.currentChoices,
          result: result,
          room: room
        });
        
        // Check if game is over
        const winner = room.players.find(p => p.score >= room.targetScore);
        if (winner) {
          room.gameState = 'finished';
          io.to(roomCode).emit('game-over', { winner, room });
        } else {
          // Start next round after 3 seconds
          setTimeout(() => {
            room.currentRound++;
            room.currentChoices = {};
            room.roundStartTime = Date.now();
            
            io.to(roomCode).emit('round-start', { 
              round: room.currentRound,
              countdown: 10 
            });
          }, 3000);
        }
      }
    }
  });

  socket.on('rematch', (data) => {
    const { roomCode } = data;
    const room = roomManager.getRoom(roomCode);
    
    if (room) {
      // Reset game state
      room.players.forEach(player => {
        player.score = 0;
      });
      room.currentRound = 1;
      room.gameState = 'waiting';
      room.currentChoices = {};
      
      io.to(roomCode).emit('rematch-ready', { room });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Handle player disconnection
    const room = roomManager.findRoomByPlayerId(socket.id);
    if (room) {
      room.players = room.players.filter(p => p.id !== socket.id);
      
      if (room.players.length === 0) {
        roomManager.deleteRoom(room.code);
      } else {
        // If host disconnected, assign new host
        if (room.host === socket.id && room.players.length > 0) {
          room.host = room.players[0].id;
        }
        
        io.to(room.code).emit('player-disconnected', { room });
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
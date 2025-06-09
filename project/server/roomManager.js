export class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  createRoom(hostId, playerName, targetScore) {
    const code = this.generateRoomCode();
    const room = {
      code,
      host: hostId,
      players: [{
        id: hostId,
        name: playerName,
        score: 0
      }],
      targetScore: targetScore || 5,
      gameState: 'waiting', // waiting, playing, finished
      currentRound: 0,
      currentChoices: {},
      createdAt: Date.now()
    };

    this.rooms.set(code, room);
    return room;
  }

  joinRoom(roomCode, playerId, playerName) {
    const room = this.rooms.get(roomCode);
    
    if (!room) {
      return { success: false, message: 'Room not found' };
    }

    if (room.players.length >= 2) {
      return { success: false, message: 'Room is full' };
    }

    if (room.gameState !== 'waiting') {
      return { success: false, message: 'Game already in progress' };
    }

    room.players.push({
      id: playerId,
      name: playerName,
      score: 0
    });

    return { success: true, room };
  }

  getRoom(roomCode) {
    return this.rooms.get(roomCode);
  }

  deleteRoom(roomCode) {
    this.rooms.delete(roomCode);
  }

  findRoomByPlayerId(playerId) {
    for (const room of this.rooms.values()) {
      if (room.players.find(p => p.id === playerId)) {
        return room;
      }
    }
    return null;
  }

  // Clean up old rooms (older than 1 hour)
  cleanupOldRooms() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    for (const [code, room] of this.rooms.entries()) {
      if (room.createdAt < oneHourAgo) {
        this.rooms.delete(code);
      }
    }
  }
}

// Clean up old rooms every 30 minutes
setInterval(() => {
  const roomManager = new RoomManager();
  roomManager.cleanupOldRooms();
}, 30 * 60 * 1000);
import { realtimeDb, db } from './firebase';
import { ref, set, onValue, update, remove, push, get } from 'firebase/database';
import { doc, setDoc, getDoc, updateDoc, query, collection, where, getDocs, limit } from 'firebase/firestore';
import { Tournament } from './types';

// Game Room Functions
export interface GameRoom {
  id: string;
  wheelId: string;
  createdBy: string;
  players: Record<string, GamePlayer>;
  status: 'waiting' | 'playing' | 'completed';
  createdAt: string;
  maxPlayers: number;
}

export interface GamePlayer {
  userId: string;
  displayName: string;
  profilePicture?: string;
  spinResult?: string;
  prizeAmount?: number;
  joinedAt: string;
  status: 'waiting' | 'spinning' | 'done';
}

export async function createGameRoom(
  wheelId: string,
  createdBy: string,
  maxPlayers: number = 4
): Promise<string> {
  try {
    const roomRef = ref(realtimeDb, `gameRooms/${wheelId}`);
    const roomId = `room-${Date.now()}`;

    const newRoom: GameRoom = {
      id: roomId,
      wheelId,
      createdBy,
      players: {},
      status: 'waiting',
      createdAt: new Date().toISOString(),
      maxPlayers,
    };

    await set(ref(realtimeDb, `gameRooms/${roomId}`), newRoom);
    return roomId;
  } catch (error) {
    console.error('Error creating game room:', error);
    throw error;
  }
}

export async function joinGameRoom(
  roomId: string,
  userId: string,
  displayName: string,
  profilePicture?: string
): Promise<void> {
  try {
    const playerRef = ref(realtimeDb, `gameRooms/${roomId}/players/${userId}`);
    const player: GamePlayer = {
      userId,
      displayName,
      profilePicture,
      joinedAt: new Date().toISOString(),
      status: 'waiting',
    };
    await set(playerRef, player);
  } catch (error) {
    console.error('Error joining game room:', error);
    throw error;
  }
}

export async function leaveGameRoom(roomId: string, userId: string): Promise<void> {
  try {
    const playerRef = ref(realtimeDb, `gameRooms/${roomId}/players/${userId}`);
    await remove(playerRef);
  } catch (error) {
    console.error('Error leaving game room:', error);
    throw error;
  }
}

export function subscribeToGameRoom(
  roomId: string,
  callback: (room: GameRoom | null) => void
): () => void {
  const roomRef = ref(realtimeDb, `gameRooms/${roomId}`);
  const unsubscribe = onValue(roomRef, (snapshot) => {
    callback(snapshot.val());
  });
  return unsubscribe;
}

export async function updatePlayerStatus(
  roomId: string,
  userId: string,
  status: 'waiting' | 'spinning' | 'done',
  spinResult?: string,
  prizeAmount?: number
): Promise<void> {
  try {
    const playerRef = ref(realtimeDb, `gameRooms/${roomId}/players/${userId}`);
    await update(playerRef, {
      status,
      ...(spinResult && { spinResult }),
      ...(prizeAmount !== undefined && { prizeAmount }),
    });
  } catch (error) {
    console.error('Error updating player status:', error);
    throw error;
  }
}

// Tournament Functions
export async function createTournament(
  name: string,
  description: string,
  entryFee: number,
  prizePool: number,
  wheelId: string,
  startTime: string,
  endTime: string
): Promise<string> {
  try {
    const tournamentId = `tournament-${Date.now()}`;
    const tournament: Tournament = {
      id: tournamentId,
      name,
      description,
      startTime,
      endTime,
      entryFee,
      prizePool,
      participants: [],
      wheelId,
      status: 'upcoming',
    };

    const tournamentRef = doc(db, 'tournaments', tournamentId);
    await setDoc(tournamentRef, tournament);
    return tournamentId;
  } catch (error) {
    console.error('Error creating tournament:', error);
    throw error;
  }
}

export async function getTournament(tournamentId: string): Promise<Tournament | null> {
  try {
    const tournamentRef = doc(db, 'tournaments', tournamentId);
    const tournamentSnap = await getDoc(tournamentRef);
    return tournamentSnap.exists() ? (tournamentSnap.data() as Tournament) : null;
  } catch (error) {
    console.error('Error fetching tournament:', error);
    return null;
  }
}

export async function joinTournament(tournamentId: string, userId: string): Promise<void> {
  try {
    const tournamentRef = doc(db, 'tournaments', tournamentId);
    const tournamentSnap = await getDoc(tournamentRef);

    if (!tournamentSnap.exists()) {
      throw new Error('Tournament not found');
    }

    const tournament = tournamentSnap.data() as Tournament;

    // Check if already joined
    if (tournament.participants.includes(userId)) {
      throw new Error('Already joined this tournament');
    }

    // Update participants
    await updateDoc(tournamentRef, {
      participants: [...tournament.participants, userId],
    });

    // Record tournament participation
    const participationRef = doc(
      db,
      'users',
      userId,
      'tournaments',
      tournamentId
    );
    await setDoc(participationRef, {
      tournamentId,
      joinedAt: new Date().toISOString(),
      status: 'active',
    });
  } catch (error) {
    console.error('Error joining tournament:', error);
    throw error;
  }
}

export async function getActiveTournaments(): Promise<Tournament[]> {
  try {
    const tournamentsRef = collection(db, 'tournaments');
    const now = new Date().toISOString();
    const q = query(
      tournamentsRef,
      where('status', 'in', ['upcoming', 'live']),
      limit(10)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Tournament);
  } catch (error) {
    console.error('Error fetching active tournaments:', error);
    return [];
  }
}

export async function getUserTournaments(userId: string): Promise<Tournament[]> {
  try {
    const participationRef = collection(db, 'users', userId, 'tournaments');
    const querySnapshot = await getDocs(participationRef);

    const tournaments: Tournament[] = [];
    for (const doc of querySnapshot.docs) {
      const tournamentId = doc.data().tournamentId;
      const tournament = await getTournament(tournamentId);
      if (tournament) {
        tournaments.push(tournament);
      }
    }

    return tournaments;
  } catch (error) {
    console.error('Error fetching user tournaments:', error);
    return [];
  }
}

// Chat/Messages for game rooms
export async function sendGameMessage(
  roomId: string,
  userId: string,
  displayName: string,
  message: string
): Promise<void> {
  try {
    const messagesRef = ref(realtimeDb, `gameRooms/${roomId}/messages`);
    const newMessageRef = push(messagesRef);

    await set(newMessageRef, {
      userId,
      displayName,
      message,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

export function subscribeToGameMessages(
  roomId: string,
  callback: (messages: any[]) => void
): () => void {
  const messagesRef = ref(realtimeDb, `gameRooms/${roomId}/messages`);
  const unsubscribe = onValue(messagesRef, (snapshot) => {
    const data = snapshot.val();
    const messages = data ? Object.values(data) : [];
    callback(messages);
  });
  return unsubscribe;
}

// Leaderboard updates for tournaments
export async function updateTournamentLeaderboard(
  tournamentId: string,
  userId: string,
  earnings: number
): Promise<void> {
  try {
    const leaderboardRef = ref(realtimeDb, `tournaments/${tournamentId}/leaderboard/${userId}`);
    await set(leaderboardRef, {
      userId,
      earnings,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating tournament leaderboard:', error);
    throw error;
  }
}

export function subscribeTotournamentLeaderboard(
  tournamentId: string,
  callback: (leaderboard: Record<string, any>) => void
): () => void {
  const leaderboardRef = ref(realtimeDb, `tournaments/${tournamentId}/leaderboard`);
  const unsubscribe = onValue(leaderboardRef, (snapshot) => {
    callback(snapshot.val() || {});
  });
  return unsubscribe;
}

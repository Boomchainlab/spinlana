import { db, realtimeDb } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  orderBy, 
  limit,
  getDocs,
  where,
  QueryConstraint
} from 'firebase/firestore';
import { ref, onValue, set, push } from 'firebase/database';
import { UserProfile, SpinResult, Wheel, LeaderboardEntry } from './types';

// User Functions
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? (userSnap.data() as UserProfile) : null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function createUserProfile(userId: string, email: string, displayName: string): Promise<void> {
  try {
    const userProfile: UserProfile = {
      id: userId,
      email,
      displayName,
      totalSpins: 0,
      totalWins: 0,
      totalEarnings: 0,
      balance: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', userId), userProfile);
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// Spin/Game Functions
export async function recordSpinResult(
  userId: string,
  wheelId: string,
  result: SpinResult
): Promise<void> {
  try {
    const resultsRef = collection(db, 'users', userId, 'spinResults');
    await setDoc(doc(resultsRef), {
      ...result,
      timestamp: new Date().toISOString(),
    });

    // Update user stats
    const userProfile = await getUserProfile(userId);
    if (userProfile) {
      await updateUserProfile(userId, {
        totalSpins: userProfile.totalSpins + 1,
        totalWins: userProfile.totalWins + (result.prizeAmount > 0 ? 1 : 0),
        totalEarnings: userProfile.totalEarnings + result.prizeAmount,
      });
    }
  } catch (error) {
    console.error('Error recording spin result:', error);
    throw error;
  }
}

// Wheel Functions
export async function createWheel(userId: string, wheel: Wheel): Promise<string> {
  try {
    const wheelsRef = collection(db, 'users', userId, 'wheels');
    const newWheelRef = await push(wheelsRef, wheel);
    return newWheelRef.key || '';
  } catch (error) {
    console.error('Error creating wheel:', error);
    throw error;
  }
}

export async function getWheel(userId: string, wheelId: string): Promise<Wheel | null> {
  try {
    const wheelRef = doc(db, 'users', userId, 'wheels', wheelId);
    const wheelSnap = await getDoc(wheelRef);
    return wheelSnap.exists() ? (wheelSnap.data() as Wheel) : null;
  } catch (error) {
    console.error('Error fetching wheel:', error);
    return null;
  }
}

export async function getUserWheels(userId: string): Promise<Wheel[]> {
  try {
    const wheelsRef = collection(db, 'users', userId, 'wheels');
    const q = query(wheelsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Wheel));
  } catch (error) {
    console.error('Error fetching user wheels:', error);
    return [];
  }
}

// Leaderboard Functions
export async function getLeaderboard(limit_count: number = 50): Promise<LeaderboardEntry[]> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      orderBy('totalEarnings', 'desc'),
      limit(limit_count)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map((doc, index) => {
      const data = doc.data() as UserProfile;
      return {
        userId: data.id,
        displayName: data.displayName,
        profilePicture: data.profilePicture,
        totalEarnings: data.totalEarnings,
        totalWins: data.totalWins,
        rank: index + 1,
      };
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

// Real-time Multiplayer Functions
export function subscribeToGameRoom(
  roomId: string,
  callback: (data: any) => void
): () => void {
  const roomRef = ref(realtimeDb, `gameRooms/${roomId}`);
  const unsubscribe = onValue(roomRef, (snapshot) => {
    callback(snapshot.val());
  });
  return unsubscribe;
}

export async function createGameRoom(roomId: string, roomData: any): Promise<void> {
  try {
    const roomRef = ref(realtimeDb, `gameRooms/${roomId}`);
    await set(roomRef, roomData);
  } catch (error) {
    console.error('Error creating game room:', error);
    throw error;
  }
}

export async function addPlayerToRoom(roomId: string, playerId: string, playerData: any): Promise<void> {
  try {
    const playerRef = ref(realtimeDb, `gameRooms/${roomId}/players/${playerId}`);
    await set(playerRef, playerData);
  } catch (error) {
    console.error('Error adding player to room:', error);
    throw error;
  }
}

// Spin History Functions
export async function getUserSpinHistory(userId: string, limitCount: number = 50): Promise<SpinResult[]> {
  try {
    const resultsRef = collection(db, 'users', userId, 'spinResults');
    const q = query(resultsRef, orderBy('timestamp', 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SpinResult));
  } catch (error) {
    console.error('Error fetching spin history:', error);
    return [];
  }
}

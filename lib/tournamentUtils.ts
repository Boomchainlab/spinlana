import { getSigner, getContract, TOURNAMENT_POOL_ABI, CONTRACT_ADDRESSES, approveSpinTokens } from './web3Utils';
import { db } from './firebase';
import { collection, addDoc, updateDoc, doc, Timestamp, getDocs, query, where, orderBy } from 'firebase/firestore';

export interface SmartContractTournament {
  id: string;
  contractId: string;
  name: string;
  entryFee: string;
  prizePool: string;
  maxPlayers: number;
  currentPlayers: number;
  startTime: Timestamp;
  endTime: Timestamp;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  participants: string[];
  winners?: string[];
  rewards?: string[];
}

export interface UserTournamentStats {
  totalTournaments: number;
  won: number;
  placed: number;
  totalWagered: string;
  totalWinnings: string;
  averageRank: number;
}

// Create a tournament on smart contract
export async function createSmartContractTournament(
  tournamentData: {
    name: string;
    entryFee: string;
    maxPlayers: number;
    durationInHours: number;
  }
): Promise<SmartContractTournament> {
  try {
    const signer = await getSigner();
    if (!signer) throw new Error('No signer available');

    const contract = getContract(
      CONTRACT_ADDRESSES.TOURNAMENT_POOL,
      TOURNAMENT_POOL_ABI,
      signer
    );

    const tx = await contract.createTournament(
      tournamentData.name,
      tournamentData.entryFee,
      tournamentData.maxPlayers,
      tournamentData.durationInHours
    );

    const receipt = await tx.wait();

    // Save tournament to Firestore
    const tournamentsRef = collection(db, 'smartContractTournaments');
    const tourDoc = await addDoc(tournamentsRef, {
      name: tournamentData.name,
      entryFee: tournamentData.entryFee,
      prizePool: tournamentData.entryFee * tournamentData.maxPlayers,
      maxPlayers: tournamentData.maxPlayers,
      currentPlayers: 0,
      startTime: Timestamp.now(),
      endTime: new Date(Date.now() + tournamentData.durationInHours * 60 * 60 * 1000),
      status: 'ACTIVE',
      participants: [],
      txHash: receipt?.transactionHash,
      createdAt: Timestamp.now(),
    });

    return {
      id: tourDoc.id,
      contractId: '', // Would be extracted from contract event
      name: tournamentData.name,
      entryFee: tournamentData.entryFee.toString(),
      prizePool: (tournamentData.entryFee * tournamentData.maxPlayers).toString(),
      maxPlayers: tournamentData.maxPlayers,
      currentPlayers: 0,
      startTime: Timestamp.now(),
      endTime: new Date(Date.now() + tournamentData.durationInHours * 60 * 60 * 1000),
      status: 'ACTIVE',
      participants: [],
    };
  } catch (error) {
    console.error('Error creating tournament:', error);
    throw error;
  }
}

// Join a smart contract tournament
export async function joinSmartContractTournament(
  tournamentId: string,
  userAddress: string,
  entryFee: string
): Promise<void> {
  try {
    const signer = await getSigner();
    if (!signer) throw new Error('No signer available');

    // Approve tokens first
    await approveSpinTokens(CONTRACT_ADDRESSES.TOURNAMENT_POOL, entryFee);

    const contract = getContract(
      CONTRACT_ADDRESSES.TOURNAMENT_POOL,
      TOURNAMENT_POOL_ABI,
      signer
    );

    const tx = await contract.joinTournament(tournamentId);
    await tx.wait();

    // Update tournament in Firestore
    const tourRef = doc(db, 'smartContractTournaments', tournamentId);
    await updateDoc(tourRef, {
      participants: userAddress,
      currentPlayers: userAddress,
    });
  } catch (error) {
    console.error('Error joining tournament:', error);
    throw error;
  }
}

// Get active tournaments
export async function getActiveTournaments(): Promise<SmartContractTournament[]> {
  try {
    const tournamentsRef = collection(db, 'smartContractTournaments');
    const q = query(
      tournamentsRef,
      where('status', '==', 'ACTIVE'),
      orderBy('startTime', 'asc')
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      contractId: doc.data().contractId || '',
      name: doc.data().name,
      entryFee: doc.data().entryFee.toString(),
      prizePool: doc.data().prizePool?.toString() || '0',
      maxPlayers: doc.data().maxPlayers,
      currentPlayers: doc.data().participants?.length || 0,
      startTime: doc.data().startTime,
      endTime: doc.data().endTime,
      status: doc.data().status,
      participants: doc.data().participants || [],
    }));
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return [];
  }
}

// Get tournament details
export async function getTournamentDetails(
  tournamentId: string
): Promise<SmartContractTournament | null> {
  try {
    const tourRef = doc(db, 'smartContractTournaments', tournamentId);
    const tourSnap = await getDocs(collection(db, 'smartContractTournaments'));

    const tourDoc = tourSnap.docs.find((d) => d.id === tournamentId);
    if (!tourDoc) return null;

    const data = tourDoc.data();
    return {
      id: tourDoc.id,
      contractId: data.contractId || '',
      name: data.name,
      entryFee: data.entryFee.toString(),
      prizePool: data.prizePool?.toString() || '0',
      maxPlayers: data.maxPlayers,
      currentPlayers: data.participants?.length || 0,
      startTime: data.startTime,
      endTime: data.endTime,
      status: data.status,
      participants: data.participants || [],
      winners: data.winners,
      rewards: data.rewards,
    };
  } catch (error) {
    console.error('Error fetching tournament:', error);
    return null;
  }
}

// Get user tournament statistics
export async function getUserTournamentStats(userAddress: string): Promise<UserTournamentStats> {
  try {
    const tournamentsRef = collection(db, 'smartContractTournaments');
    const querySnapshot = await getDocs(tournamentsRef);

    let totalTournaments = 0;
    let won = 0;
    let placed = 0;
    let totalWagered = 0;
    let totalWinnings = 0;
    let ranks: number[] = [];

    querySnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const participated = data.participants?.includes(userAddress);

      if (participated) {
        totalTournaments++;
        totalWagered += parseFloat(data.entryFee);

        if (data.winners?.includes(userAddress)) {
          won++;
          const winIdx = data.winners.indexOf(userAddress);
          if (winIdx === 0) {
            const firstPrize = (parseFloat(data.prizePool) * 50) / 100;
            totalWinnings += firstPrize;
            ranks.push(1);
          } else if (winIdx === 1) {
            const secondPrize = (parseFloat(data.prizePool) * 30) / 100;
            totalWinnings += secondPrize;
            ranks.push(2);
          } else if (winIdx === 2) {
            const thirdPrize = (parseFloat(data.prizePool) * 20) / 100;
            totalWinnings += thirdPrize;
            ranks.push(3);
          }
        }

        if (data.winners?.includes(userAddress)) {
          placed++;
        }
      }
    });

    const averageRank =
      ranks.length > 0 ? ranks.reduce((a, b) => a + b) / ranks.length : 0;

    return {
      totalTournaments,
      won,
      placed,
      totalWagered: totalWagered.toString(),
      totalWinnings: totalWinnings.toString(),
      averageRank,
    };
  } catch (error) {
    console.error('Error fetching tournament stats:', error);
    return {
      totalTournaments: 0,
      won: 0,
      placed: 0,
      totalWagered: '0',
      totalWinnings: '0',
      averageRank: 0,
    };
  }
}

// Complete tournament and distribute prizes
export async function completeTournament(
  tournamentId: string,
  winners: string[]
): Promise<void> {
  try {
    const signer = await getSigner();
    if (!signer) throw new Error('No signer available');

    const contract = getContract(
      CONTRACT_ADDRESSES.TOURNAMENT_POOL,
      TOURNAMENT_POOL_ABI,
      signer
    );

    const tx = await contract.completeTournament(tournamentId, winners);
    await tx.wait();

    // Update status in Firestore
    const tourRef = doc(db, 'smartContractTournaments', tournamentId);
    await updateDoc(tourRef, {
      status: 'COMPLETED',
      winners,
      completedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error completing tournament:', error);
    throw error;
  }
}

// Get leaderboard for a tournament
export async function getTournamentLeaderboard(
  tournamentId: string
): Promise<Array<{ address: string; score: number; rank: number }>> {
  try {
    // This would fetch from smart contract or Firestore
    // and calculate rankings based on scores
    return [];
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

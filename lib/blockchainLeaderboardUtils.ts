import { db } from './firebase';
import { collection, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';

export interface BlockchainLeaderboardEntry {
  rank: number;
  address: string;
  displayName: string;
  totalWins: number;
  totalEarnings: string;
  totalBets: number;
  winRate: number;
  badges: string[];
  verifiedAt: Timestamp;
  txCount: number;
}

export interface GlobalStats {
  totalPlayers: number;
  totalVolume: string;
  totalTransactions: number;
  topEarner: BlockchainLeaderboardEntry | null;
  mostActive: BlockchainLeaderboardEntry | null;
}

// Get global blockchain leaderboard
export async function getBlockchainLeaderboard(
  limit_num: number = 100,
  offset: number = 0
): Promise<BlockchainLeaderboardEntry[]> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('totalEarnings', 'desc'), limit(limit_num));

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc, idx) => {
      const data = doc.data();
      return {
        rank: offset + idx + 1,
        address: data.walletAddress || doc.id,
        displayName: data.displayName || `Player ${doc.id.slice(0, 6)}`,
        totalWins: data.totalWins || 0,
        totalEarnings: data.totalEarnings?.toString() || '0',
        totalBets: data.totalBets || 0,
        winRate: data.winRate || 0,
        badges: data.badges || [],
        verifiedAt: data.verifiedAt || Timestamp.now(),
        txCount: data.txCount || 0,
      };
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

// Get leaderboard by category
export async function getLeaderboardByCategory(
  category: 'earnings' | 'wins' | 'active' | 'newest',
  limit_num: number = 50
): Promise<BlockchainLeaderboardEntry[]> {
  try {
    const usersRef = collection(db, 'users');

    let q;
    switch (category) {
      case 'earnings':
        q = query(usersRef, orderBy('totalEarnings', 'desc'), limit(limit_num));
        break;
      case 'wins':
        q = query(usersRef, orderBy('totalWins', 'desc'), limit(limit_num));
        break;
      case 'active':
        q = query(usersRef, orderBy('totalBets', 'desc'), limit(limit_num));
        break;
      case 'newest':
        q = query(usersRef, orderBy('createdAt', 'desc'), limit(limit_num));
        break;
      default:
        q = query(usersRef, orderBy('totalEarnings', 'desc'), limit(limit_num));
    }

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc, idx) => {
      const data = doc.data();
      return {
        rank: idx + 1,
        address: data.walletAddress || doc.id,
        displayName: data.displayName || `Player ${doc.id.slice(0, 6)}`,
        totalWins: data.totalWins || 0,
        totalEarnings: data.totalEarnings?.toString() || '0',
        totalBets: data.totalBets || 0,
        winRate: data.winRate || 0,
        badges: data.badges || [],
        verifiedAt: data.verifiedAt || Timestamp.now(),
        txCount: data.txCount || 0,
      };
    });
  } catch (error) {
    console.error('Error fetching category leaderboard:', error);
    return [];
  }
}

// Get user rank and stats
export async function getUserRankAndStats(userAddress: string) {
  try {
    const leaderboard = await getBlockchainLeaderboard(1000);
    const userEntry = leaderboard.find((entry) =>
      entry.address.toLowerCase() === userAddress.toLowerCase()
    );

    return {
      rank: userEntry?.rank || 0,
      stats: userEntry || null,
    };
  } catch (error) {
    console.error('Error fetching user rank:', error);
    return { rank: 0, stats: null };
  }
}

// Get global stats
export async function getGlobalBlockchainStats(): Promise<GlobalStats> {
  try {
    const leaderboard = await getBlockchainLeaderboard(1000);

    let totalEarnings = '0';
    let totalBets = 0;

    leaderboard.forEach((entry) => {
      const earnings = parseFloat(entry.totalEarnings) || 0;
      totalEarnings = (parseFloat(totalEarnings) + earnings).toString();
      totalBets += entry.totalBets;
    });

    const txRef = collection(db, 'cryptoTransactions');
    const txSnapshot = await getDocs(txRef);

    return {
      totalPlayers: leaderboard.length,
      totalVolume: totalEarnings,
      totalTransactions: txSnapshot.size,
      topEarner: leaderboard[0] || null,
      mostActive: leaderboard.sort((a, b) => b.totalBets - a.totalBets)[0] || null,
    };
  } catch (error) {
    console.error('Error fetching global stats:', error);
    return {
      totalPlayers: 0,
      totalVolume: '0',
      totalTransactions: 0,
      topEarner: null,
      mostActive: null,
    };
  }
}

// Get blockchain verification status
export async function getBlockchainVerificationStatus(
  userAddress: string
): Promise<{
  isVerified: boolean;
  verifiedAt: Timestamp | null;
  txCount: number;
}> {
  try {
    const usersRef = collection(db, 'users');
    const userSnap = await getDocs(query(usersRef, where('walletAddress', '==', userAddress)));

    if (userSnap.empty) {
      return { isVerified: false, verifiedAt: null, txCount: 0 };
    }

    const userData = userSnap.docs[0].data();
    return {
      isVerified: userData.verified || false,
      verifiedAt: userData.verifiedAt || null,
      txCount: userData.txCount || 0,
    };
  } catch (error) {
    console.error('Error checking verification:', error);
    return { isVerified: false, verifiedAt: null, txCount: 0 };
  }
}

// Get leaderboard by time period
export async function getLeaderboardByTimePeriod(
  periodDays: number,
  limit_num: number = 50
): Promise<BlockchainLeaderboardEntry[]> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('lastActivityAt', '>=', Timestamp.fromDate(startDate)),
      orderBy('totalEarnings', 'desc'),
      limit(limit_num)
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc, idx) => {
      const data = doc.data();
      return {
        rank: idx + 1,
        address: data.walletAddress || doc.id,
        displayName: data.displayName || `Player ${doc.id.slice(0, 6)}`,
        totalWins: data.totalWins || 0,
        totalEarnings: data.totalEarnings?.toString() || '0',
        totalBets: data.totalBets || 0,
        winRate: data.winRate || 0,
        badges: data.badges || [],
        verifiedAt: data.verifiedAt || Timestamp.now(),
        txCount: data.txCount || 0,
      };
    });
  } catch (error) {
    console.error('Error fetching time-based leaderboard:', error);
    return [];
  }
}

// Get achievement badges
export async function getUserBadges(userAddress: string): Promise<string[]> {
  try {
    const usersRef = collection(db, 'users');
    const userSnap = await getDocs(query(usersRef, where('walletAddress', '==', userAddress)));

    if (userSnap.empty) return [];

    const userData = userSnap.docs[0].data();
    return userData.badges || [];
  } catch (error) {
    console.error('Error fetching badges:', error);
    return [];
  }
}

// Award badge to user
export async function awardBadge(userAddress: string, badgeId: string): Promise<void> {
  try {
    // This would be called by a backend service after verifying achievements
    console.log(`Awarding badge ${badgeId} to ${userAddress}`);
  } catch (error) {
    console.error('Error awarding badge:', error);
    throw error;
  }
}

// Get verified transactions for user
export async function getUserVerifiedTransactions(
  userAddress: string,
  limit_num: number = 100
): Promise<any[]> {
  try {
    const txRef = collection(db, 'cryptoTransactions');
    const q = query(
      txRef,
      where('fromAddress', '==', userAddress),
      orderBy('timestamp', 'desc'),
      limit(limit_num)
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

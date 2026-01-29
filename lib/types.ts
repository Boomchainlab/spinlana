// User profile types
export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  profilePicture?: string;
  totalSpins: number;
  totalWins: number;
  totalEarnings: number;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

// Game/Spin types
export interface SpinResult {
  id: string;
  userId: string;
  wheelId: string;
  result: string;
  prizeAmount: number;
  prizeType: 'currency' | 'badge' | 'item';
  timestamp: string;
  multiplier: number;
}

// Wheel types
export interface WheelSegment {
  id: string;
  label: string;
  color: string;
  prizeAmount: number;
  probability: number;
}

export interface Wheel {
  id: string;
  userId: string;
  name: string;
  description: string;
  segments: WheelSegment[];
  isPublic: boolean;
  spinCost: number;
  createdAt: string;
  plays: number;
}

// Leaderboard types
export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  profilePicture?: string;
  totalEarnings: number;
  totalWins: number;
  rank: number;
}

// Rewards types
export interface Reward {
  id: string;
  userId: string;
  wheelId: string;
  type: 'cash' | 'badge' | 'multiplier';
  amount: number;
  claimedAt?: string;
  expiresAt?: string;
}

// Tournament types
export interface Tournament {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  entryFee: number;
  prizePool: number;
  participants: string[];
  wheelId: string;
  status: 'upcoming' | 'live' | 'completed';
}

// Payment types
export interface PaymentSession {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

import { ethers } from 'ethers';
import { getSigner, getContract, SPIN_TOKEN_ABI, CONTRACT_ADDRESSES, approveSpinTokens } from './web3Utils';
import { db } from './firebase';
import { collection, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';

export interface Bet {
  id: string;
  userId: string;
  amount: string;
  multiplier: number;
  result: 'pending' | 'won' | 'lost';
  txHash: string;
  createdAt: Timestamp;
  completedAt?: Timestamp;
  winnings?: string;
}

export interface CryptoTransaction {
  id: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  type: 'bet' | 'reward' | 'mint' | 'tournament';
  status: 'pending' | 'confirmed' | 'failed';
  txHash: string;
  timestamp: Timestamp;
}

// Place a bet with SPIN tokens
export async function placeBet(
  userId: string,
  amount: string,
  multiplier: number
): Promise<Bet> {
  try {
    const signer = await getSigner();
    if (!signer) throw new Error('No signer available');

    const userAddress = await signer.getAddress();

    // First approve the tokens
    await approveSpinTokens(CONTRACT_ADDRESSES.SPIN_TOKEN, amount);

    // Record bet in Firestore
    const betsRef = collection(db, 'bets');
    const betDoc = await addDoc(betsRef, {
      userId,
      userAddress,
      amount,
      multiplier,
      result: 'pending',
      createdAt: Timestamp.now(),
      status: 'pending',
    });

    // Create transaction record
    const txRef = collection(db, 'cryptoTransactions');
    await addDoc(txRef, {
      fromAddress: userAddress,
      toAddress: CONTRACT_ADDRESSES.SPIN_TOKEN,
      amount,
      type: 'bet',
      status: 'pending',
      timestamp: Timestamp.now(),
      betId: betDoc.id,
    });

    return {
      id: betDoc.id,
      userId,
      amount,
      multiplier,
      result: 'pending',
      txHash: '',
      createdAt: Timestamp.now(),
    };
  } catch (error) {
    console.error('Error placing bet:', error);
    throw error;
  }
}

// Complete a bet and process winnings
export async function completeBet(
  betId: string,
  didWin: boolean,
  winAmount?: string
): Promise<void> {
  try {
    const betRef = doc(db, 'bets', betId);
    const bet = await updateDoc(betRef, {
      result: didWin ? 'won' : 'lost',
      completedAt: Timestamp.now(),
      winnings: winAmount || '0',
      status: 'confirmed',
    });

    // If won, reward tokens to user
    if (didWin && winAmount) {
      // This would be called by an oracle or backend service
      console.log(`Bet ${betId} won! Winnings: ${winAmount}`);
    }
  } catch (error) {
    console.error('Error completing bet:', error);
    throw error;
  }
}

// Get user's bet history
export async function getUserBetHistory(userId: string): Promise<Bet[]> {
  try {
    const betsRef = collection(db, 'bets');
    const betsQuery = betsRef.where('userId', '==', userId);
    // Note: This would need proper Firestore query implementation
    return [];
  } catch (error) {
    console.error('Error fetching bet history:', error);
    return [];
  }
}

// Get betting statistics
export async function getUserBettingStats(userId: string) {
  try {
    const betsRef = collection(db, 'bets');
    // Query user's bets and calculate stats
    const totalBets = 0;
    const wonBets = 0;
    const totalWagered = '0';
    const totalWinnings = '0';

    return {
      totalBets,
      wonBets,
      winRate: totalBets > 0 ? (wonBets / totalBets) * 100 : 0,
      totalWagered,
      totalWinnings,
    };
  } catch (error) {
    console.error('Error fetching betting stats:', error);
    return {
      totalBets: 0,
      wonBets: 0,
      winRate: 0,
      totalWagered: '0',
      totalWinnings: '0',
    };
  }
}

// Transfer tokens between users
export async function transferTokens(
  toAddress: string,
  amount: string,
  reason: string
): Promise<string> {
  try {
    const signer = await getSigner();
    if (!signer) throw new Error('No signer available');

    const userAddress = await signer.getAddress();

    const contract = getContract(
      CONTRACT_ADDRESSES.SPIN_TOKEN,
      SPIN_TOKEN_ABI,
      signer
    );

    const tx = await contract.transfer(toAddress, ethers.parseUnits(amount, 18));
    const receipt = await tx.wait();

    // Log transaction
    const txRef = collection(db, 'cryptoTransactions');
    await addDoc(txRef, {
      fromAddress: userAddress,
      toAddress,
      amount,
      type: reason,
      status: 'confirmed',
      txHash: receipt.transactionHash,
      timestamp: Timestamp.now(),
    });

    return receipt.transactionHash;
  } catch (error) {
    console.error('Error transferring tokens:', error);
    throw error;
  }
}

// Check token balance
export async function checkTokenBalance(address: string): Promise<string> {
  try {
    const contract = getContract(
      CONTRACT_ADDRESSES.SPIN_TOKEN,
      SPIN_TOKEN_ABI,
      null // Use default provider
    );

    const balance = await contract.balanceOf(address);
    return ethers.formatUnits(balance, 18);
  } catch (error) {
    console.error('Error checking balance:', error);
    return '0';
  }
}

// Get token allowance
export async function getTokenAllowance(
  ownerAddress: string,
  spenderAddress: string
): Promise<string> {
  try {
    const contract = getContract(
      CONTRACT_ADDRESSES.SPIN_TOKEN,
      SPIN_TOKEN_ABI,
      null // Use default provider
    );

    const allowance = await contract.allowance(ownerAddress, spenderAddress);
    return ethers.formatUnits(allowance, 18);
  } catch (error) {
    console.error('Error checking allowance:', error);
    return '0';
  }
}

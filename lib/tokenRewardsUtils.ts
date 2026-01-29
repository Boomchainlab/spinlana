import { db } from './firebase';
import { collection, addDoc, updateDoc, doc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { getSigner, sendSpinTokens } from './web3Utils';

export interface RewardCampaign {
  id: string;
  name: string;
  description: string;
  rewardAmount: string;
  totalClaims: number;
  maxClaims: number;
  criteria: string;
  startDate: Timestamp;
  endDate: Timestamp;
  status: 'active' | 'completed' | 'cancelled';
}

export interface UserReward {
  id: string;
  userId: string;
  amount: string;
  type: 'daily' | 'achievement' | 'referral' | 'tournament' | 'campaign';
  claimed: boolean;
  claimedAt?: Timestamp;
  createdAt: Timestamp;
}

export interface GovernanceProposal {
  id: string;
  title: string;
  description: string;
  proposedBy: string;
  voteFor: number;
  voteAgainst: number;
  startTime: Timestamp;
  endTime: Timestamp;
  status: 'active' | 'passed' | 'rejected' | 'executed';
  userVotes: Map<string, boolean>;
}

// Create reward campaign
export async function createRewardCampaign(campaignData: {
  name: string;
  description: string;
  rewardAmount: string;
  maxClaims: number;
  criteria: string;
  durationInDays: number;
}): Promise<RewardCampaign> {
  try {
    const campaignsRef = collection(db, 'rewardCampaigns');
    const campaignDoc = await addDoc(campaignsRef, {
      name: campaignData.name,
      description: campaignData.description,
      rewardAmount: campaignData.rewardAmount,
      totalClaims: 0,
      maxClaims: campaignData.maxClaims,
      criteria: campaignData.criteria,
      startDate: Timestamp.now(),
      endDate: new Date(Date.now() + campaignData.durationInDays * 24 * 60 * 60 * 1000),
      status: 'active',
      createdAt: Timestamp.now(),
    });

    return {
      id: campaignDoc.id,
      name: campaignData.name,
      description: campaignData.description,
      rewardAmount: campaignData.rewardAmount,
      totalClaims: 0,
      maxClaims: campaignData.maxClaims,
      criteria: campaignData.criteria,
      startDate: Timestamp.now(),
      endDate: new Date(Date.now() + campaignData.durationInDays * 24 * 60 * 60 * 1000),
      status: 'active',
    };
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
}

// Get active reward campaigns
export async function getActiveCampaigns(): Promise<RewardCampaign[]> {
  try {
    const campaignsRef = collection(db, 'rewardCampaigns');
    const q = query(campaignsRef, where('status', '==', 'active'));

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      description: doc.data().description,
      rewardAmount: doc.data().rewardAmount,
      totalClaims: doc.data().totalClaims,
      maxClaims: doc.data().maxClaims,
      criteria: doc.data().criteria,
      startDate: doc.data().startDate,
      endDate: doc.data().endDate,
      status: doc.data().status,
    }));
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return [];
  }
}

// Claim reward
export async function claimReward(
  userId: string,
  campaignId: string,
  rewardAmount: string
): Promise<UserReward> {
  try {
    const rewardsRef = collection(db, 'userRewards');
    const rewardDoc = await addDoc(rewardsRef, {
      userId,
      amount: rewardAmount,
      type: 'campaign',
      claimed: false,
      campaignId,
      createdAt: Timestamp.now(),
    });

    return {
      id: rewardDoc.id,
      userId,
      amount: rewardAmount,
      type: 'campaign',
      claimed: false,
      createdAt: Timestamp.now(),
    };
  } catch (error) {
    console.error('Error claiming reward:', error);
    throw error;
  }
}

// Get user pending rewards
export async function getUserPendingRewards(userId: string): Promise<UserReward[]> {
  try {
    const rewardsRef = collection(db, 'userRewards');
    const q = query(
      rewardsRef,
      where('userId', '==', userId),
      where('claimed', '==', false)
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      userId: doc.data().userId,
      amount: doc.data().amount,
      type: doc.data().type,
      claimed: doc.data().claimed,
      createdAt: doc.data().createdAt,
    }));
  } catch (error) {
    console.error('Error fetching pending rewards:', error);
    return [];
  }
}

// Get user claimed rewards
export async function getUserClaimedRewards(userId: string): Promise<UserReward[]> {
  try {
    const rewardsRef = collection(db, 'userRewards');
    const q = query(
      rewardsRef,
      where('userId', '==', userId),
      where('claimed', '==', true)
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      userId: doc.data().userId,
      amount: doc.data().amount,
      type: doc.data().type,
      claimed: doc.data().claimed,
      claimedAt: doc.data().claimedAt,
      createdAt: doc.data().createdAt,
    }));
  } catch (error) {
    console.error('Error fetching claimed rewards:', error);
    return [];
  }
}

// Claim pending rewards to wallet
export async function claimRewardToWallet(
  userAddress: string,
  totalAmount: string
): Promise<string> {
  try {
    const signer = await getSigner();
    if (!signer) throw new Error('No signer available');

    // Send tokens to user wallet
    const txHash = await sendSpinTokens(userAddress, totalAmount);

    // Update all pending rewards as claimed
    const rewardsRef = collection(db, 'userRewards');
    const q = query(
      rewardsRef,
      where('claimed', '==', false)
    );

    const querySnapshot = await getDocs(q);
    for (const doc of querySnapshot.docs) {
      await updateDoc(doc.ref, {
        claimed: true,
        claimedAt: Timestamp.now(),
      });
    }

    return txHash;
  } catch (error) {
    console.error('Error claiming rewards:', error);
    throw error;
  }
}

// Create governance proposal
export async function createGovernanceProposal(proposalData: {
  title: string;
  description: string;
  proposedBy: string;
  votingPeriodInDays: number;
}): Promise<GovernanceProposal> {
  try {
    const proposalsRef = collection(db, 'governanceProposals');
    const proposalDoc = await addDoc(proposalsRef, {
      title: proposalData.title,
      description: proposalData.description,
      proposedBy: proposalData.proposedBy,
      voteFor: 0,
      voteAgainst: 0,
      startTime: Timestamp.now(),
      endTime: new Date(Date.now() + proposalData.votingPeriodInDays * 24 * 60 * 60 * 1000),
      status: 'active',
      userVotes: {},
      createdAt: Timestamp.now(),
    });

    return {
      id: proposalDoc.id,
      title: proposalData.title,
      description: proposalData.description,
      proposedBy: proposalData.proposedBy,
      voteFor: 0,
      voteAgainst: 0,
      startTime: Timestamp.now(),
      endTime: new Date(Date.now() + proposalData.votingPeriodInDays * 24 * 60 * 60 * 1000),
      status: 'active',
      userVotes: new Map(),
    };
  } catch (error) {
    console.error('Error creating proposal:', error);
    throw error;
  }
}

// Get active governance proposals
export async function getActiveProposals(): Promise<GovernanceProposal[]> {
  try {
    const proposalsRef = collection(db, 'governanceProposals');
    const q = query(proposalsRef, where('status', '==', 'active'));

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      title: doc.data().title,
      description: doc.data().description,
      proposedBy: doc.data().proposedBy,
      voteFor: doc.data().voteFor,
      voteAgainst: doc.data().voteAgainst,
      startTime: doc.data().startTime,
      endTime: doc.data().endTime,
      status: doc.data().status,
      userVotes: new Map(Object.entries(doc.data().userVotes || {})),
    }));
  } catch (error) {
    console.error('Error fetching proposals:', error);
    return [];
  }
}

// Vote on proposal
export async function voteOnProposal(
  proposalId: string,
  userAddress: string,
  voteFor: boolean
): Promise<void> {
  try {
    const proposalRef = doc(db, 'governanceProposals', proposalId);
    const proposalSnap = await getDocs(collection(db, 'governanceProposals'));
    const proposal = proposalSnap.docs.find((d) => d.id === proposalId);

    if (!proposal) throw new Error('Proposal not found');

    const proposalData = proposal.data();
    const votes = proposalData.userVotes || {};

    // Check if user already voted
    if (votes[userAddress]) {
      throw new Error('You have already voted on this proposal');
    }

    // Update vote counts
    const newVoteFor = proposalData.voteFor + (voteFor ? 1 : 0);
    const newVoteAgainst = proposalData.voteAgainst + (!voteFor ? 1 : 0);

    votes[userAddress] = voteFor;

    await updateDoc(proposalRef, {
      voteFor: newVoteFor,
      voteAgainst: newVoteAgainst,
      userVotes: votes,
    });
  } catch (error) {
    console.error('Error voting:', error);
    throw error;
  }
}

// Get proposal details
export async function getProposalDetails(proposalId: string): Promise<GovernanceProposal | null> {
  try {
    const proposalsRef = collection(db, 'governanceProposals');
    const proposalSnap = await getDocs(proposalsRef);

    const proposal = proposalSnap.docs.find((d) => d.id === proposalId);
    if (!proposal) return null;

    const data = proposal.data();
    return {
      id: proposal.id,
      title: data.title,
      description: data.description,
      proposedBy: data.proposedBy,
      voteFor: data.voteFor,
      voteAgainst: data.voteAgainst,
      startTime: data.startTime,
      endTime: data.endTime,
      status: data.status,
      userVotes: new Map(Object.entries(data.userVotes || {})),
    };
  } catch (error) {
    console.error('Error fetching proposal:', error);
    return null;
  }
}

// Calculate reward based on activity
export async function calculateRewardEarnings(userId: string): Promise<string> {
  try {
    // Fetch user's recent activity
    const spinsRef = collection(db, 'spins');
    const q = query(spinsRef, where('userId', '==', userId));
    const spinSnapshot = await getDocs(q);

    let totalReward = 0;

    spinSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.result === 'won') {
        totalReward += parseFloat(data.winAmount) * 0.01; // 1% reward
      }
    });

    return totalReward.toString();
  } catch (error) {
    console.error('Error calculating rewards:', error);
    return '0';
  }
}

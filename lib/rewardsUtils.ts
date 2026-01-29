import { db } from './firebase';
import { collection, doc, setDoc, getDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { Reward } from './types';
import { updateUserProfile, getUserProfile } from './firebaseUtils';

// Create a reward for a user
export async function createReward(
  userId: string,
  wheelId: string,
  type: 'cash' | 'badge' | 'multiplier',
  amount: number,
  expiresInDays?: number
): Promise<string> {
  try {
    const rewardId = `reward-${Date.now()}-${Math.random()}`;
    const reward: Reward = {
      id: rewardId,
      userId,
      wheelId,
      type,
      amount,
      claimedAt: undefined,
      expiresAt: expiresInDays
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
    };

    const rewardRef = doc(db, 'users', userId, 'rewards', rewardId);
    await setDoc(rewardRef, reward);
    return rewardId;
  } catch (error) {
    console.error('Error creating reward:', error);
    throw error;
  }
}

// Get unclaimed rewards for a user
export async function getUnclaimedRewards(userId: string): Promise<Reward[]> {
  try {
    const rewardsRef = collection(db, 'users', userId, 'rewards');
    const q = query(rewardsRef, where('claimedAt', '==', undefined));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => doc.data() as Reward).filter(reward => {
      if (reward.expiresAt) {
        return new Date(reward.expiresAt) > new Date();
      }
      return true;
    });
  } catch (error) {
    console.error('Error fetching unclaimed rewards:', error);
    return [];
  }
}

// Claim a reward
export async function claimReward(userId: string, rewardId: string): Promise<void> {
  try {
    const rewardRef = doc(db, 'users', userId, 'rewards', rewardId);
    const rewardSnap = await getDoc(rewardRef);

    if (!rewardSnap.exists()) {
      throw new Error('Reward not found');
    }

    const reward = rewardSnap.data() as Reward;

    // Check if already claimed
    if (reward.claimedAt) {
      throw new Error('Reward already claimed');
    }

    // Check if expired
    if (reward.expiresAt && new Date(reward.expiresAt) < new Date()) {
      throw new Error('Reward has expired');
    }

    // Update reward as claimed
    await updateDoc(rewardRef, {
      claimedAt: new Date().toISOString(),
    });

    // Add funds/benefits to user
    const userProfile = await getUserProfile(userId);
    if (userProfile) {
      if (reward.type === 'cash') {
        await updateUserProfile(userId, {
          balance: userProfile.balance + reward.amount,
        });
      } else if (reward.type === 'multiplier') {
        // Store multiplier in a separate collection for game logic
        const multiplierRef = doc(db, 'users', userId, 'multipliers', rewardId);
        await setDoc(multiplierRef, {
          multiplier: reward.amount,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    }
  } catch (error) {
    console.error('Error claiming reward:', error);
    throw error;
  }
}

// Get user badges
export async function getUserBadges(userId: string): Promise<string[]> {
  try {
    const badgesRef = collection(db, 'users', userId, 'badges');
    const querySnapshot = await getDocs(badgesRef);
    return querySnapshot.docs.map(doc => doc.data().badge);
  } catch (error) {
    console.error('Error fetching badges:', error);
    return [];
  }
}

// Award a badge to user
export async function awardBadge(userId: string, badgeName: string, badgeIcon: string): Promise<void> {
  try {
    const badges = await getUserBadges(userId);

    if (badges.includes(badgeName)) {
      return; // Already has badge
    }

    const badgeRef = doc(db, 'users', userId, 'badges', badgeName);
    await setDoc(badgeRef, {
      badge: badgeName,
      icon: badgeIcon,
      earnedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error awarding badge:', error);
    throw error;
  }
}

// Check and award achievements/badges
export async function checkAchievements(userId: string): Promise<string[]> {
  try {
    const userProfile = await getUserProfile(userId);
    if (!userProfile) return [];

    const awardedBadges: string[] = [];

    // First Win
    if (userProfile.totalWins === 1) {
      await awardBadge(userId, 'first-win', '🎯');
      awardedBadges.push('first-win');
    }

    // 10 Wins
    if (userProfile.totalWins === 10) {
      await awardBadge(userId, 'ten-wins', '⭐');
      awardedBadges.push('ten-wins');
    }

    // 50 Wins
    if (userProfile.totalWins === 50) {
      await awardBadge(userId, 'fifty-wins', '🏆');
      awardedBadges.push('fifty-wins');
    }

    // 100 Wins
    if (userProfile.totalWins === 100) {
      await awardBadge(userId, 'hundred-wins', '👑');
      awardedBadges.push('hundred-wins');
    }

    // $100 Earned
    if (userProfile.totalEarnings >= 100 && userProfile.totalEarnings < 200) {
      await awardBadge(userId, 'hundred-dollar', '💰');
      awardedBadges.push('hundred-dollar');
    }

    // $500 Earned
    if (userProfile.totalEarnings >= 500 && userProfile.totalEarnings < 1000) {
      await awardBadge(userId, 'five-hundred-dollar', '💵');
      awardedBadges.push('five-hundred-dollar');
    }

    // $1000 Earned
    if (userProfile.totalEarnings >= 1000) {
      await awardBadge(userId, 'thousand-dollar', '💎');
      awardedBadges.push('thousand-dollar');
    }

    // High Win Rate
    const winRate = (userProfile.totalWins / Math.max(userProfile.totalSpins, 1)) * 100;
    if (winRate > 50 && userProfile.totalSpins > 10) {
      await awardBadge(userId, 'lucky', '🍀');
      awardedBadges.push('lucky');
    }

    return awardedBadges;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
}

// Distribute daily bonus
export async function distributeDailyBonus(userId: string): Promise<void> {
  try {
    const userProfile = await getUserProfile(userId);
    if (!userProfile) return;

    // Simple daily bonus: $10
    const bonusAmount = 10;

    // Create a reward
    await createReward(userId, 'daily-bonus', 'cash', bonusAmount, 7);

    // Auto-claim daily bonus
    const rewardsRef = collection(db, 'users', userId, 'rewards');
    const q = query(rewardsRef, where('wheelId', '==', 'daily-bonus'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.size > 0) {
      const latestReward = querySnapshot.docs[0];
      await claimReward(userId, latestReward.id);
    }
  } catch (error) {
    console.error('Error distributing daily bonus:', error);
  }
}

// Get referral rewards
export async function getReferralReward(referrerId: string, newUserId: string): Promise<void> {
  try {
    // Award referrer $50 for each successful referral
    await createReward(referrerId, `referral-${newUserId}`, 'cash', 50);

    // Award new user $10 welcome bonus
    await createReward(newUserId, 'welcome-bonus', 'cash', 10);

    // Auto-claim welcome bonus
    const newUserRewardsRef = collection(db, 'users', newUserId, 'rewards');
    const q = query(newUserRewardsRef, where('wheelId', '==', 'welcome-bonus'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.size > 0) {
      const welcomeReward = querySnapshot.docs[0];
      await claimReward(newUserId, welcomeReward.id);
    }
  } catch (error) {
    console.error('Error awarding referral reward:', error);
  }
}

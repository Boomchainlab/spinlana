'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getUnclaimedRewards, claimReward, getUserBadges } from '@/lib/rewardsUtils';
import { Reward } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Loader, Gift, Trophy, Star, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function RewardsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [badges, setBadges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load rewards and badges
  useEffect(() => {
    if (user) {
      loadRewards();
      loadBadges();
    }
  }, [user]);

  const loadRewards = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const unclaimedRewards = await getUnclaimedRewards(user.uid);
      setRewards(unclaimedRewards);
    } catch (error) {
      console.error('Error loading rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBadges = async () => {
    if (!user) return;
    try {
      const userBadges = await getUserBadges(user.uid);
      setBadges(userBadges);
    } catch (error) {
      console.error('Error loading badges:', error);
    }
  };

  const handleClaimReward = async (rewardId: string) => {
    if (!user) return;

    setClaimingId(rewardId);
    try {
      await claimReward(user.uid, rewardId);
      toast.success('Reward claimed successfully!');
      loadRewards();
    } catch (error: any) {
      console.error('Error claiming reward:', error);
      toast.error(error.message || 'Failed to claim reward');
    } finally {
      setClaimingId(null);
    }
  };

  const BADGE_INFO: Record<string, { name: string; icon: string; description: string }> = {
    'first-win': {
      name: 'First Win',
      icon: '🎯',
      description: 'Win your first game',
    },
    'ten-wins': {
      name: 'Rising Star',
      icon: '⭐',
      description: 'Win 10 games',
    },
    'fifty-wins': {
      name: 'Champion',
      icon: '🏆',
      description: 'Win 50 games',
    },
    'hundred-wins': {
      name: 'Legend',
      icon: '👑',
      description: 'Win 100 games',
    },
    'hundred-dollar': {
      name: 'Century',
      icon: '💰',
      description: 'Earn $100',
    },
    'five-hundred-dollar': {
      name: 'Millionaire Path',
      icon: '💵',
      description: 'Earn $500',
    },
    'thousand-dollar': {
      name: 'Billionaire',
      icon: '💎',
      description: 'Earn $1000',
    },
    lucky: {
      name: 'Lucky Streak',
      icon: '🍀',
      description: 'Achieve 50% win rate',
    },
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container-main">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Gift className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Rewards & Achievements</h1>
              <p className="text-muted">Collect rewards and unlock badges</p>
            </div>
          </div>
        </div>

        {/* Rewards Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Available Rewards</h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : rewards.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-12 text-center">
              <AlertCircle className="w-12 h-12 text-muted mx-auto mb-4 opacity-50" />
              <h3 className="font-bold mb-2">No Active Rewards</h3>
              <p className="text-muted mb-6">
                Play games to earn rewards and unlock special offers!
              </p>
              <Button asChild className="btn-primary">
                <a href="/play">Start Playing</a>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward) => (
                <div
                  key={reward.id}
                  className="bg-card rounded-xl border border-border p-6 hover:border-primary transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-muted mb-1">
                        {reward.type === 'cash' && '💵 Cash Reward'}
                        {reward.type === 'badge' && '🏅 Badge'}
                        {reward.type === 'multiplier' && '✨ Multiplier'}
                      </p>
                      <h3 className="font-bold text-lg">
                        {reward.type === 'cash' && `$${reward.amount}`}
                        {reward.type === 'badge' && 'Special Badge'}
                        {reward.type === 'multiplier' && `x${reward.amount} Multiplier`}
                      </h3>
                    </div>
                    {reward.expiresAt && (
                      <span className="text-xs bg-destructive/20 text-destructive px-2 py-1 rounded">
                        Expires soon
                      </span>
                    )}
                  </div>

                  {reward.expiresAt && (
                    <p className="text-xs text-muted mb-4">
                      Expires: {new Date(reward.expiresAt).toLocaleDateString()}
                    </p>
                  )}

                  <Button
                    onClick={() => handleClaimReward(reward.id)}
                    disabled={claimingId === reward.id}
                    className="btn-primary w-full"
                  >
                    {claimingId === reward.id ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin mr-2" />
                        Claiming...
                      </>
                    ) : (
                      'Claim Reward'
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Badges Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Achievements & Badges</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(BADGE_INFO).map(([badgeId, badgeData]) => {
              const hasBadge = badges.includes(badgeId);
              return (
                <div
                  key={badgeId}
                  className={`rounded-xl p-6 border transition ${
                    hasBadge
                      ? 'bg-gradient-to-br from-primary/20 to-accent/20 border-primary'
                      : 'bg-card border-border opacity-50'
                  }`}
                >
                  <div className="text-5xl mb-4 text-center">{badgeData.icon}</div>
                  <h3 className="font-bold text-center mb-2">{badgeData.name}</h3>
                  <p className="text-xs text-muted text-center mb-4">{badgeData.description}</p>
                  {hasBadge && (
                    <div className="text-center">
                      <span className="text-xs bg-primary/30 text-primary px-3 py-1 rounded-full font-semibold">
                        Unlocked
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 bg-card rounded-xl border border-border p-6">
            <h3 className="font-bold mb-4">How to Earn Badges</h3>
            <ul className="space-y-3 text-sm text-muted">
              <li>🎯 <strong>First Win:</strong> Win your first game</li>
              <li>⭐ <strong>Rising Star:</strong> Win 10 games</li>
              <li>🏆 <strong>Champion:</strong> Win 50 games</li>
              <li>👑 <strong>Legend:</strong> Win 100 games</li>
              <li>💰 <strong>Century:</strong> Earn $100 in total</li>
              <li>💵 <strong>Millionaire Path:</strong> Earn $500 in total</li>
              <li>💎 <strong>Billionaire:</strong> Earn $1000 in total</li>
              <li>🍀 <strong>Lucky Streak:</strong> Maintain 50% win rate with 10+ games</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

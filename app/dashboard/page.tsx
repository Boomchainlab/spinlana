'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader, Play, TrendingUp, Users, Zap, Plus } from 'lucide-react';

export default function DashboardPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container-main">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {userProfile.displayName}!</h1>
          <p className="text-muted">Ready to spin and win?</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Balance */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-muted">Account Balance</h3>
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-3xl font-bold gradient-text">${userProfile.balance}</p>
          </div>

          {/* Total Spins */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-muted">Total Spins</h3>
              <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
                <Play className="w-5 h-5 text-secondary" />
              </div>
            </div>
            <p className="text-3xl font-bold">{userProfile.totalSpins}</p>
          </div>

          {/* Total Earnings */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-muted">Total Earnings</h3>
              <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
            </div>
            <p className="text-3xl font-bold text-secondary">${userProfile.totalEarnings}</p>
          </div>

          {/* Win Rate */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-muted">Win Rate</h3>
              <div className="w-10 h-10 bg-destructive/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-destructive" />
              </div>
            </div>
            <p className="text-3xl font-bold">
              {userProfile.totalSpins > 0
                ? ((userProfile.totalWins / userProfile.totalSpins) * 100).toFixed(1)
                : 0}
              %
            </p>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Play Wheel */}
          <Link href="/play">
            <div className="bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 rounded-2xl p-8 border border-primary/50 hover:border-primary transition cursor-pointer h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Play Now</h2>
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                  <Play className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
              <p className="text-muted mb-6">
                Spin the wheel and try your luck. Win exciting prizes and climb the leaderboard!
              </p>
              <Button className="btn-primary">Start Spinning</Button>
            </div>
          </Link>

          {/* Create Wheel */}
          <Link href="/wheels/create">
            <div className="bg-gradient-to-br from-secondary/20 via-accent/20 to-primary/20 rounded-2xl p-8 border border-secondary/50 hover:border-secondary transition cursor-pointer h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Create Wheel</h2>
                <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                  <Plus className="w-6 h-6 text-secondary-foreground" />
                </div>
              </div>
              <p className="text-muted mb-6">
                Design your own custom wheel and invite friends to play. Set your own rules!
              </p>
              <Button className="btn-secondary">Create Now</Button>
            </div>
          </Link>
        </div>

        {/* Featured Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leaderboard Preview */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Top Players</h3>
              <Link href="/leaderboard" className="text-primary hover:underline text-sm">
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-sm font-bold">
                      #{i}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Player {i}</p>
                      <p className="text-xs text-muted">{1000 - i * 100} wins</p>
                    </div>
                  </div>
                  <p className="font-bold text-secondary">${50000 - i * 5000}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h3 className="font-bold text-lg mb-4">Your Activity</h3>
            <div className="space-y-3">
              <div className="p-3 bg-background rounded-lg border border-border">
                <p className="font-semibold text-sm">Spun the wheel</p>
                <p className="text-xs text-muted">Won $50</p>
                <p className="text-xs text-muted">Just now</p>
              </div>
              <div className="p-3 bg-background rounded-lg border border-border">
                <p className="font-semibold text-sm">Joined tournament</p>
                <p className="text-xs text-muted">Daily Challenge</p>
                <p className="text-xs text-muted">2 hours ago</p>
              </div>
              <div className="p-3 bg-background rounded-lg border border-border">
                <p className="font-semibold text-sm">Earned badge</p>
                <p className="text-xs text-muted">First Win</p>
                <p className="text-xs text-muted">Yesterday</p>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <h3 className="font-bold text-lg mb-4">Upcoming Events</h3>
            <div className="space-y-3">
              <div className="p-3 bg-background rounded-lg border border-border">
                <p className="font-semibold text-sm">Weekend Challenge</p>
                <p className="text-xs text-muted">Prize: $1,000</p>
                <p className="text-xs text-primary">Starts in 2 days</p>
              </div>
              <div className="p-3 bg-background rounded-lg border border-border">
                <p className="font-semibold text-sm">Monthly Tournament</p>
                <p className="text-xs text-muted">Prize: $10,000</p>
                <p className="text-xs text-primary">Starts in 5 days</p>
              </div>
              <div className="p-3 bg-background rounded-lg border border-border">
                <p className="font-semibold text-sm">Spring Festival</p>
                <p className="text-xs text-muted">Prize: $50,000</p>
                <p className="text-xs text-primary">Starts in 15 days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

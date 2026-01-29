'use client';

import React, { useEffect, useState } from 'react';
import { getLeaderboard } from '@/lib/firebaseUtils';
import { LeaderboardEntry } from '@/lib/types';
import { Loader, Trophy, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

type LeaderboardFilter = 'earnings' | 'wins' | 'spins';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LeaderboardFilter>('earnings');
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week' | 'day'>('all');

  useEffect(() => {
    loadLeaderboard();
  }, [filter, timeframe]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await getLeaderboard(100);
      // Sort based on filter
      const sorted = [...data].sort((a, b) => {
        if (filter === 'earnings') return b.totalEarnings - a.totalEarnings;
        if (filter === 'wins') return b.totalWins - a.totalWins;
        return 0;
      });
      setLeaderboard(sorted);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container-main">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Global Leaderboard</h1>
              <p className="text-muted">Compete with players worldwide</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stat Filter */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => setFilter('earnings')}
              variant={filter === 'earnings' ? 'default' : 'outline'}
              className={filter === 'earnings' ? 'btn-primary' : ''}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Total Earnings
            </Button>
            <Button
              onClick={() => setFilter('wins')}
              variant={filter === 'wins' ? 'default' : 'outline'}
              className={filter === 'wins' ? 'btn-primary' : ''}
            >
              <Trophy className="w-4 h-4 mr-2" />
              Total Wins
            </Button>
            <Button
              onClick={() => setFilter('spins')}
              variant={filter === 'spins' ? 'default' : 'outline'}
              className={filter === 'spins' ? 'btn-primary' : ''}
            >
              <Zap className="w-4 h-4 mr-2" />
              Total Spins
            </Button>
          </div>

          {/* Timeframe Filter */}
          <div className="flex gap-2 flex-wrap justify-start md:justify-end">
            {(['all', 'month', 'week', 'day'] as const).map((tf) => (
              <Button
                key={tf}
                onClick={() => setTimeframe(tf)}
                variant={timeframe === tf ? 'default' : 'outline'}
                className={timeframe === tf ? 'btn-primary' : ''}
                size="sm"
              >
                {tf === 'all' && 'All Time'}
                {tf === 'month' && 'This Month'}
                {tf === 'week' && 'This Week'}
                {tf === 'day' && 'Today'}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {leaderboard.slice(0, 3).map((entry, index) => (
                <div
                  key={entry.userId}
                  className={`rounded-2xl p-8 text-center border ${
                    index === 0
                      ? 'bg-gradient-to-br from-secondary/20 to-secondary/10 border-secondary'
                      : index === 1
                        ? 'bg-gradient-to-br from-muted/20 to-muted/10 border-muted'
                        : 'bg-gradient-to-br from-orange-500/20 to-orange-500/10 border-orange-500/50'
                  }`}
                >
                  <div className="text-5xl mb-4">{getMedalIcon(entry.rank)}</div>
                  {entry.profilePicture ? (
                    <img
                      src={entry.profilePicture}
                      alt={entry.displayName}
                      className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full mx-auto mb-4 bg-primary/20 flex items-center justify-center">
                      <span className="text-2xl font-bold">{entry.displayName[0]}</span>
                    </div>
                  )}
                  <h3 className="font-bold text-lg mb-2">{entry.displayName}</h3>
                  <p className="text-3xl font-bold gradient-text mb-2">
                    ${entry.totalEarnings}
                  </p>
                  <div className="flex justify-center gap-6 text-sm text-muted">
                    <div>
                      <p className="font-semibold">{entry.totalWins}</p>
                      <p className="text-xs">Wins</p>
                    </div>
                    <div>
                      <p className="font-semibold">
                        {entry.totalWins > 0
                          ? ((entry.totalWins / (entry.totalEarnings / 50)) * 100).toFixed(0)
                          : 0}
                        %
                      </p>
                      <p className="text-xs">Win Rate</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Full Leaderboard Table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-background">
                      <th className="px-6 py-4 text-left font-semibold">Rank</th>
                      <th className="px-6 py-4 text-left font-semibold">Player</th>
                      <th className="px-6 py-4 text-right font-semibold">
                        {filter === 'earnings' && 'Total Earnings'}
                        {filter === 'wins' && 'Total Wins'}
                        {filter === 'spins' && 'Total Spins'}
                      </th>
                      <th className="px-6 py-4 text-right font-semibold">Total Wins</th>
                      <th className="px-6 py-4 text-right font-semibold">Total Earnings</th>
                      <th className="px-6 py-4 text-right font-semibold">Win Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, index) => (
                      <tr
                        key={entry.userId}
                        className="border-b border-border hover:bg-background transition"
                      >
                        <td className="px-6 py-4">
                          <span className="text-lg font-bold">
                            {entry.rank <= 3 ? getMedalIcon(entry.rank) : `#${entry.rank}`}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {entry.profilePicture ? (
                              <img
                                src={entry.profilePicture}
                                alt={entry.displayName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="text-sm font-bold">{entry.displayName[0]}</span>
                              </div>
                            )}
                            <span className="font-semibold">{entry.displayName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-bold">
                          {filter === 'earnings' && `$${entry.totalEarnings}`}
                          {filter === 'wins' && entry.totalWins}
                          {filter === 'spins' && Math.round((entry.totalEarnings / 50) * (entry.totalWins / 10))}
                        </td>
                        <td className="px-6 py-4 text-right">{entry.totalWins}</td>
                        <td className="px-6 py-4 text-right text-secondary font-semibold">
                          ${entry.totalEarnings}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {entry.totalWins > 0
                            ? ((entry.totalWins / (entry.totalEarnings / 50)) * 100).toFixed(1)
                            : 0}
                          %
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card rounded-xl p-6 border border-border text-center">
                <p className="text-muted mb-2">Total Players</p>
                <p className="text-4xl font-bold gradient-text">{leaderboard.length}</p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border text-center">
                <p className="text-muted mb-2">Total Winnings</p>
                <p className="text-4xl font-bold text-secondary">
                  ${leaderboard.reduce((sum, entry) => sum + entry.totalEarnings, 0)}
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border text-center">
                <p className="text-muted mb-2">Total Wins</p>
                <p className="text-4xl font-bold">
                  {leaderboard.reduce((sum, entry) => sum + entry.totalWins, 0)}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

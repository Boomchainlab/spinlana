'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWallet } from '@/lib/hooks/useWallet';
import {
  getBlockchainLeaderboard,
  getLeaderboardByCategory,
  getUserRankAndStats,
  getGlobalBlockchainStats,
  BlockchainLeaderboardEntry,
  GlobalStats,
} from '@/lib/blockchainLeaderboardUtils';
import { Trophy, TrendingUp, Users, Zap, Medal, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BlockchainLeaderboardPage() {
  const { account } = useWallet();
  const [leaderboard, setLeaderboard] = useState<BlockchainLeaderboardEntry[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [userRank, setUserRank] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('earnings');

  useEffect(() => {
    loadData();
  }, [activeCategory, account]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getLeaderboardByCategory(activeCategory as any);
      setLeaderboard(data);

      if (!globalStats) {
        const stats = await getGlobalBlockchainStats();
        setGlobalStats(stats);
      }

      if (account) {
        const rankData = await getUserRankAndStats(account);
        setUserRank(rankData.rank);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Medal className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-orange-600" />;
      default:
        return <span className="text-sm font-bold text-slate-400">{rank}</span>;
    }
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900/20 to-slate-950 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-4">
            Blockchain Leaderboard
          </h1>
          <p className="text-lg text-slate-300">
            On-chain verified player rankings and achievements
          </p>
        </div>

        {/* Global Stats */}
        {globalStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
            <Card className="border-purple-500/20 bg-purple-500/5">
              <CardContent className="pt-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Total Players</p>
                  <p className="text-3xl font-bold text-purple-400">{globalStats.totalPlayers}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-500/20 bg-green-500/5">
              <CardContent className="pt-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Total Volume</p>
                  <p className="text-3xl font-bold text-green-400">
                    {parseFloat(globalStats.totalVolume).toFixed(0)} SPIN
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardContent className="pt-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Total Transactions</p>
                  <p className="text-3xl font-bold text-blue-400">{globalStats.totalTransactions}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-cyan-500/20 bg-cyan-500/5">
              <CardContent className="pt-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Your Rank</p>
                  <p className="text-3xl font-bold text-cyan-400">{userRank || '-'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Leaderboard Tabs */}
        <Card className="border-slate-700/50">
          <CardHeader>
            <CardTitle>Player Rankings</CardTitle>
            <CardDescription>Verified on-chain transactions and achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="earnings" onValueChange={setActiveCategory} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="earnings" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Earnings</span>
                </TabsTrigger>
                <TabsTrigger value="wins" className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  <span className="hidden sm:inline">Wins</span>
                </TabsTrigger>
                <TabsTrigger value="active" className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span className="hidden sm:inline">Active</span>
                </TabsTrigger>
                <TabsTrigger value="newest" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">New</span>
                </TabsTrigger>
              </TabsList>

              {['earnings', 'wins', 'active', 'newest'].map((category) => (
                <TabsContent key={category} value={category} className="space-y-2">
                  {isLoading ? (
                    <div className="text-center py-8 text-slate-400">Loading...</div>
                  ) : leaderboard.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-700/50">
                            <th className="text-left py-4 px-4 text-xs font-semibold text-slate-400">
                              Rank
                            </th>
                            <th className="text-left py-4 px-4 text-xs font-semibold text-slate-400">
                              Player
                            </th>
                            <th className="text-right py-4 px-4 text-xs font-semibold text-slate-400">
                              Earnings
                            </th>
                            <th className="text-right py-4 px-4 text-xs font-semibold text-slate-400">
                              Wins
                            </th>
                            <th className="text-right py-4 px-4 text-xs font-semibold text-slate-400">
                              Bets
                            </th>
                            <th className="text-right py-4 px-4 text-xs font-semibold text-slate-400">
                              Win Rate
                            </th>
                            <th className="text-center py-4 px-4 text-xs font-semibold text-slate-400">
                              Verified
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {leaderboard.map((entry, idx) => (
                            <tr
                              key={entry.address}
                              className={cn(
                                'border-b border-slate-700/30 hover:bg-slate-800/50 transition-colors',
                                account?.toLowerCase() === entry.address.toLowerCase() &&
                                  'bg-purple-500/10'
                              )}
                            >
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  {getMedalIcon(entry.rank)}
                                  <span className="font-semibold">{entry.rank}</span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div>
                                  <p className="font-semibold text-white">{entry.displayName}</p>
                                  <p className="text-xs text-slate-400 font-mono">
                                    {formatAddress(entry.address)}
                                  </p>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <span className="text-green-400 font-semibold">
                                  {parseFloat(entry.totalEarnings).toFixed(0)} SPIN
                                </span>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <span className="text-yellow-400 font-semibold">{entry.totalWins}</span>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <span className="text-blue-400 font-semibold">{entry.totalBets}</span>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <span className="text-purple-400 font-semibold">
                                  {(entry.winRate * 100).toFixed(1)}%
                                </span>
                              </td>
                              <td className="py-4 px-4 text-center">
                                {entry.txCount > 0 ? (
                                  <div className="flex justify-center">
                                    <Shield className="w-4 h-4 text-green-500" />
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-500">-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400">No players yet</div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="mt-8 border-slate-700/50">
          <CardHeader>
            <CardTitle>How Blockchain Verification Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                    1
                  </div>
                  <h4 className="font-semibold">Transparent Transactions</h4>
                </div>
                <p className="text-sm text-slate-400">
                  All bets and winnings are recorded on the Base blockchain for complete transparency
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold">
                    2
                  </div>
                  <h4 className="font-semibold">Verified Rankings</h4>
                </div>
                <p className="text-sm text-slate-400">
                  Leaderboard positions are calculated from verified on-chain data, not centralized databases
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
                    3
                  </div>
                  <h4 className="font-semibold">Achievement Badges</h4>
                </div>
                <p className="text-sm text-slate-400">
                  Unlock special badges by reaching milestones, all verified and stored on-chain
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

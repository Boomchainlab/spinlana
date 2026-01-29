'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/lib/hooks/useWallet';
import { getActiveTournaments, joinSmartContractTournament, getUserTournamentStats } from '@/lib/tournamentUtils';
import { SmartContractTournament, UserTournamentStats } from '@/lib/tournamentUtils';
import {
  Trophy,
  Users,
  Clock,
  Coins,
  TrendingUp,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Web3TournamentsPage() {
  const { account, isConnected, balance } = useWallet();
  const [tournaments, setTournaments] = useState<SmartContractTournament[]>([]);
  const [userStats, setUserStats] = useState<UserTournamentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTournaments();
    if (isConnected && account) {
      loadUserStats();
    }
  }, [account, isConnected]);

  const loadTournaments = async () => {
    try {
      const active = await getActiveTournaments();
      setTournaments(active);
    } catch (err) {
      console.error('Error loading tournaments:', err);
      setError('Failed to load tournaments');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserStats = async () => {
    if (!account) return;
    try {
      const stats = await getUserTournamentStats(account);
      setUserStats(stats);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleJoinTournament = async (tournamentId: string, entryFee: string) => {
    if (!account) {
      alert('Please connect your wallet');
      return;
    }

    const balanceNum = parseFloat(balance) || 0;
    const feeNum = parseFloat(entryFee);

    if (balanceNum < feeNum) {
      alert(`Insufficient balance. You need ${entryFee} SPIN`);
      return;
    }

    setJoiningId(tournamentId);
    setError(null);

    try {
      await joinSmartContractTournament(tournamentId, account, entryFee);
      alert('Successfully joined tournament!');
      loadTournaments();
    } catch (err: any) {
      setError(err.message || 'Failed to join tournament');
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900/20 to-slate-950 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-yellow-400 mb-4">
            Smart Contract Tournaments
          </h1>
          <p className="text-lg text-slate-300">
            Compete in blockchain-verified tournaments with guaranteed prize payouts
          </p>
        </div>

        {/* User Stats */}
        {isConnected && userStats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card className="border-purple-500/20 bg-purple-500/5">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Trophy className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 mb-1">Total Tournaments</p>
                  <p className="text-2xl font-bold text-purple-400">{userStats.totalTournaments}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-500/20 bg-green-500/5">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Zap className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 mb-1">Wins</p>
                  <p className="text-2xl font-bold text-green-400">{userStats.won}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardContent className="pt-6">
                <div className="text-center">
                  <TrendingUp className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 mb-1">Total Wagered</p>
                  <p className="text-2xl font-bold text-blue-400">{userStats.totalWagered}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-cyan-500/20 bg-cyan-500/5">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Coins className="w-6 h-6 text-cyan-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 mb-1">Winnings</p>
                  <p className="text-2xl font-bold text-cyan-400">{userStats.totalWinnings}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-pink-500/20 bg-pink-500/5">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Trophy className="w-6 h-6 text-pink-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 mb-1">Avg Rank</p>
                  <p className="text-2xl font-bold text-pink-400">
                    {userStats.averageRank > 0 ? userStats.averageRank.toFixed(1) : 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <Card className="mb-8 border-red-500/20 bg-red-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-400">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Wallet Warning */}
        {!isConnected && (
          <Card className="mb-8 border-yellow-500/20 bg-yellow-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <p className="text-yellow-400">Connect your wallet to join tournaments</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tournaments List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <p className="text-slate-400">Loading tournaments...</p>
            </div>
          ) : tournaments.length > 0 ? (
            tournaments.map((tournament) => (
              <Card key={tournament.id} className="border-slate-700/50 hover:border-purple-500/50 transition-colors">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{tournament.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        tournament.status === 'ACTIVE'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-slate-500/20 text-slate-400'
                      }`}
                    >
                      {tournament.status}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Prize Pool */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-400">Prize Pool</span>
                      <span className="text-lg font-bold text-yellow-400">{tournament.prizePool} SPIN</span>
                    </div>
                  </div>

                  {/* Entry Fee */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Entry Fee</span>
                    <span className="font-semibold text-purple-400">{tournament.entryFee} SPIN</span>
                  </div>

                  {/* Players */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Players
                    </span>
                    <span className="font-semibold">
                      {tournament.currentPlayers}/{tournament.maxPlayers}
                    </span>
                  </div>

                  {/* Time Remaining */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Time Left
                    </span>
                    <span className="font-semibold text-cyan-400">
                      {Math.max(
                        0,
                        Math.floor(
                          (tournament.endTime.toDate().getTime() - Date.now()) / (1000 * 60)
                        )
                      )}m
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${(tournament.currentPlayers / tournament.maxPlayers) * 100}%`,
                      }}
                    />
                  </div>

                  {/* Join Button */}
                  <Button
                    onClick={() => handleJoinTournament(tournament.id, tournament.entryFee)}
                    disabled={
                      !isConnected ||
                      joiningId === tournament.id ||
                      tournament.status !== 'ACTIVE' ||
                      tournament.currentPlayers >= tournament.maxPlayers
                    }
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {joiningId === tournament.id ? 'Joining...' : 'Join Tournament'}
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="col-span-full border-slate-700/50">
              <CardContent className="pt-12 pb-12 text-center">
                <Trophy className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
                <p className="text-slate-400">No active tournaments at the moment</p>
                <p className="text-sm text-slate-500">Check back soon!</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Prize Distribution Info */}
        <Card className="mt-12 border-slate-700/50">
          <CardHeader>
            <CardTitle>Prize Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300">
              All tournaments use smart contracts to guarantee fair and transparent prize distribution:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/50 rounded p-4">
                <div className="text-2xl font-bold text-yellow-400 mb-1">50%</div>
                <p className="text-sm text-slate-400">1st Place</p>
              </div>
              <div className="bg-slate-900/50 rounded p-4">
                <div className="text-2xl font-bold text-gray-400 mb-1">30%</div>
                <p className="text-sm text-slate-400">2nd Place</p>
              </div>
              <div className="bg-slate-900/50 rounded p-4">
                <div className="text-2xl font-bold text-orange-600 mb-1">20%</div>
                <p className="text-sm text-slate-400">3rd Place</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

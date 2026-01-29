'use client';

import React, { useState } from 'react';
import { BettingCard } from '@/components/betting/BettingCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WalletButton } from '@/components/web3/WalletButton';
import { useWallet } from '@/lib/hooks/useWallet';
import { TrendingUp, Send, Wallet as WalletIcon, Zap } from 'lucide-react';

export default function CryptoPage() {
  const { account, balance, isConnected } = useWallet();
  const [recentBets, setRecentBets] = useState<any[]>([]);

  const handleBetPlaced = (amount: string, multiplier: number) => {
    const newBet = {
      id: Date.now(),
      amount,
      multiplier,
      timestamp: new Date(),
      status: 'pending',
    };
    setRecentBets([newBet, ...recentBets]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900/20 to-slate-950 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-4">
            Crypto Betting & Payments
          </h1>
          <p className="text-lg text-slate-300">
            Bet with SPIN tokens, earn rewards, and participate in decentralized tournaments
          </p>
        </div>

        {/* Wallet Connection Alert */}
        {!isConnected && (
          <Card className="mb-8 border-yellow-500/20 bg-yellow-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-yellow-500 mb-2">Wallet Not Connected</h3>
                  <p className="text-sm text-slate-400">
                    Connect your MetaMask or WalletConnect to start betting
                  </p>
                </div>
                <WalletButton />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Betting */}
          <div className="lg:col-span-2 space-y-8">
            <BettingCard onBetPlaced={handleBetPlaced} />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-purple-500/20 bg-purple-500/5">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Zap className="w-5 h-5 text-purple-500 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 mb-1">Min Bet</p>
                    <p className="text-lg font-bold text-purple-400">1 SPIN</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-blue-500/20 bg-blue-500/5">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <TrendingUp className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 mb-1">Max Multiplier</p>
                    <p className="text-lg font-bold text-blue-400">10x</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-green-500/20 bg-green-500/5">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Send className="w-5 h-5 text-green-500 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 mb-1">Fee</p>
                    <p className="text-lg font-bold text-green-400">0%</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-cyan-500/20 bg-cyan-500/5">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <WalletIcon className="w-5 h-5 text-cyan-500 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 mb-1">Network</p>
                    <p className="text-lg font-bold text-cyan-400">Base</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Features */}
            <Card className="border-slate-700/50">
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm flex-shrink-0">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold">Connect Wallet</h4>
                        <p className="text-sm text-slate-400">Link MetaMask or WalletConnect</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm flex-shrink-0">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold">Select Amount</h4>
                        <p className="text-sm text-slate-400">Choose your bet amount in SPIN</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-sm flex-shrink-0">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold">Pick Multiplier</h4>
                        <p className="text-sm text-slate-400">Higher risk = higher rewards</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm flex-shrink-0">
                        4
                      </div>
                      <div>
                        <h4 className="font-semibold">Spin & Win</h4>
                        <p className="text-sm text-slate-400">Confirm spin and check results</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Recent Activity */}
          <div>
            <Card className="border-slate-700/50 sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Your Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Balance */}
                <div>
                  <p className="text-sm text-slate-400 mb-2">SPIN Balance</p>
                  <p className="text-3xl font-bold text-purple-400">{balance || '0'}</p>
                </div>

                {/* Connected Address */}
                {isConnected && (
                  <div>
                    <p className="text-sm text-slate-400 mb-2">Wallet Address</p>
                    <p className="text-sm font-mono bg-slate-900/50 rounded px-3 py-2 text-slate-300 break-all">
                      {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Not connected'}
                    </p>
                  </div>
                )}

                {/* Recent Bets */}
                <div>
                  <h3 className="font-semibold mb-3">Recent Bets</h3>
                  {recentBets.length > 0 ? (
                    <div className="space-y-2">
                      {recentBets.slice(0, 5).map((bet) => (
                        <div
                          key={bet.id}
                          className="bg-slate-900/50 rounded p-3 flex justify-between items-start"
                        >
                          <div>
                            <p className="text-sm font-medium">{bet.amount} SPIN</p>
                            <p className="text-xs text-slate-400">{bet.multiplier}x</p>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              bet.status === 'pending'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-green-500/20 text-green-400'
                            }`}
                          >
                            {bet.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">No bets yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

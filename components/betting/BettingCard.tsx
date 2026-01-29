'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWallet } from '@/lib/hooks/useWallet';
import { useBetting } from '@/lib/hooks/useBetting';
import { Slider } from '@/components/ui/slider';
import { Coins, TrendingUp, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BettingCardProps {
  onBetPlaced?: (amount: string, multiplier: number) => void;
}

export function BettingCard({ onBetPlaced }: BettingCardProps) {
  const { account, balance } = useWallet();
  const { isPlacingBet, error, placeBet } = useBetting();
  const [amount, setAmount] = useState('10');
  const [multiplier, setMultiplier] = useState(2);
  const [potentialWinnings, setPotentialWinnings] = useState('20');

  // Update potential winnings
  useEffect(() => {
    const winnings = (parseFloat(amount) * multiplier).toFixed(2);
    setPotentialWinnings(winnings);
  }, [amount, multiplier]);

  const handlePlaceBet = async () => {
    if (!account) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      await placeBet(account, amount, multiplier);
      onBetPlaced?.(amount, multiplier);
      setAmount('10');
      setMultiplier(2);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const balanceNum = parseFloat(balance) || 0;
  const amountNum = parseFloat(amount) || 0;
  const insufficientBalance = amountNum > balanceNum;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-purple-500" />
          Place Your Bet
        </CardTitle>
        <CardDescription>
          Bet your SPIN tokens for a chance to win big
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Wallet Status */}
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-4 border border-purple-500/20">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Balance</span>
            <span className="text-lg font-bold text-purple-500">
              {balance} SPIN
            </span>
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="bet-amount">Bet Amount (SPIN)</Label>
          <Input
            id="bet-amount"
            type="number"
            min="1"
            step="0.1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-lg"
            disabled={isPlacingBet}
          />
          <div className="flex gap-2 text-xs">
            {[10, 50, 100, 500].map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(preset.toString())}
                className="px-2 py-1 rounded bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs disabled:opacity-50"
                disabled={isPlacingBet || preset > balanceNum}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Multiplier Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="multiplier">Multiplier</Label>
            <span className="text-lg font-bold text-blue-500">{multiplier.toFixed(1)}x</span>
          </div>
          <Slider
            id="multiplier"
            min={1.5}
            max={10}
            step={0.5}
            value={[multiplier]}
            onValueChange={([val]) => setMultiplier(val)}
            className="w-full"
            disabled={isPlacingBet}
          />
          <p className="text-xs text-muted-foreground">
            Higher multiplier = higher risk, higher reward
          </p>
        </div>

        {/* Winnings Preview */}
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-4 border border-green-500/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-muted-foreground">Potential Winnings</span>
          </div>
          <p className="text-2xl font-bold text-green-500">{potentialWinnings} SPIN</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20 flex gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {/* Insufficient Balance Warning */}
        {insufficientBalance && (
          <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20 flex gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-500">
              Insufficient balance. You have {balance} SPIN.
            </p>
          </div>
        )}

        {/* Place Bet Button */}
        <Button
          onClick={handlePlaceBet}
          disabled={isPlacingBet || !account || insufficientBalance}
          className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {isPlacingBet ? 'Placing Bet...' : 'Place Bet'}
        </Button>

        {!account && (
          <p className="text-center text-sm text-muted-foreground">
            Connect your wallet to place bets
          </p>
        )}
      </CardContent>
    </Card>
  );
}

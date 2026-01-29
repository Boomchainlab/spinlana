'use client';

import { useState, useCallback } from 'react';
import {
  placeBet,
  completeBet,
  transferTokens,
  checkTokenBalance,
  getTokenAllowance,
} from '@/lib/bettingUtils';

export function useBetting() {
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePlaceBet = useCallback(
    async (userId: string, amount: string, multiplier: number) => {
      setIsPlacingBet(true);
      setError(null);
      setSuccess(false);

      try {
        const bet = await placeBet(userId, amount, multiplier);
        setSuccess(true);
        return bet;
      } catch (err: any) {
        setError(err.message || 'Failed to place bet');
        throw err;
      } finally {
        setIsPlacingBet(false);
      }
    },
    []
  );

  const handleCompleteBet = useCallback(
    async (betId: string, didWin: boolean, winAmount?: string) => {
      try {
        await completeBet(betId, didWin, winAmount);
        setSuccess(true);
      } catch (err: any) {
        setError(err.message || 'Failed to complete bet');
        throw err;
      }
    },
    []
  );

  const handleTransferTokens = useCallback(
    async (toAddress: string, amount: string, reason: string) => {
      try {
        const txHash = await transferTokens(toAddress, amount, reason);
        setSuccess(true);
        return txHash;
      } catch (err: any) {
        setError(err.message || 'Failed to transfer tokens');
        throw err;
      }
    },
    []
  );

  const getBalance = useCallback(async (address: string) => {
    try {
      return await checkTokenBalance(address);
    } catch (err: any) {
      setError(err.message || 'Failed to check balance');
      return '0';
    }
  }, []);

  const getAllowance = useCallback(
    async (ownerAddress: string, spenderAddress: string) => {
      try {
        return await getTokenAllowance(ownerAddress, spenderAddress);
      } catch (err: any) {
        setError(err.message || 'Failed to check allowance');
        return '0';
      }
    },
    []
  );

  return {
    isPlacingBet,
    error,
    success,
    placeBet: handlePlaceBet,
    completeBet: handleCompleteBet,
    transferTokens: handleTransferTokens,
    checkBalance: getBalance,
    getAllowance,
  };
}

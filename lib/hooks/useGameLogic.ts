import { useState, useCallback } from 'react';
import { WheelSegment, SpinResult } from '@/lib/types';
import { recordSpinResult } from '@/lib/firebaseUtils';

interface UseGameLogicOptions {
  userId: string;
  wheelId: string;
  wheelSegments: WheelSegment[];
  spinCost: number;
  userBalance: number;
}

interface SpinState {
  isSpinning: boolean;
  result: WheelSegment | null;
  prizeAmount: number;
  spinCount: number;
  lastSpinTime: number | null;
}

export function useGameLogic({
  userId,
  wheelId,
  wheelSegments,
  spinCost,
  userBalance,
}: UseGameLogicOptions) {
  const [state, setState] = useState<SpinState>({
    isSpinning: false,
    result: null,
    prizeAmount: 0,
    spinCount: 0,
    lastSpinTime: null,
  });

  const spin = useCallback(
    async (multiplier: number = 1) => {
      // Validation
      if (state.isSpinning) return;
      if (userBalance < spinCost * multiplier) {
        throw new Error('Insufficient balance');
      }

      // Check cooldown (1 second between spins)
      if (state.lastSpinTime && Date.now() - state.lastSpinTime < 1000) {
        throw new Error('Please wait before spinning again');
      }

      setState(prev => ({
        ...prev,
        isSpinning: true,
        lastSpinTime: Date.now(),
      }));

      return { success: true };
    },
    [state.isSpinning, state.lastSpinTime, userBalance, spinCost]
  );

  const handleSpinComplete = useCallback(
    async (result: WheelSegment, multiplier: number = 1) => {
      try {
        const prizeAmount = result.prizeAmount * multiplier;

        // Record result in database
        const spinResult: SpinResult = {
          id: `${Date.now()}-${Math.random()}`,
          userId,
          wheelId,
          result: result.label,
          prizeAmount,
          prizeType: 'currency',
          timestamp: new Date().toISOString(),
          multiplier,
        };

        await recordSpinResult(userId, wheelId, spinResult);

        setState(prev => ({
          ...prev,
          isSpinning: false,
          result,
          prizeAmount,
          spinCount: prev.spinCount + 1,
        }));

        return spinResult;
      } catch (error) {
        console.error('Error recording spin result:', error);
        setState(prev => ({
          ...prev,
          isSpinning: false,
        }));
        throw error;
      }
    },
    [userId, wheelId]
  );

  const resetResult = useCallback(() => {
    setState(prev => ({
      ...prev,
      result: null,
      prizeAmount: 0,
    }));
  }, []);

  return {
    state,
    spin,
    handleSpinComplete,
    resetResult,
  };
}

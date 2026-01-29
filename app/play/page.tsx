'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { SpinningWheel } from '@/components/wheel/SpinningWheel';
import { WheelSegment } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';
import { Loader, Volume2, VolumeX } from 'lucide-react';

// Demo wheel configuration
const DEMO_SEGMENTS: WheelSegment[] = [
  { id: '1', label: '50', color: '#FF6B9D', prizeAmount: 50, probability: 0.1 },
  { id: '2', label: '100', color: '#4ECDC4', prizeAmount: 100, probability: 0.15 },
  { id: '3', label: '25', color: '#FFE66D', prizeAmount: 25, probability: 0.2 },
  { id: '4', label: '500', color: '#95E1D3', prizeAmount: 500, probability: 0.05 },
  { id: '5', label: '75', color: '#F38181', prizeAmount: 75, probability: 0.2 },
  { id: '6', label: '200', color: '#AA96DA', prizeAmount: 200, probability: 0.15 },
  { id: '7', label: '10', color: '#FCBAD3', prizeAmount: 10, probability: 0.1 },
  { id: '8', label: '150', color: '#A8D8EA', prizeAmount: 150, probability: 0.05 },
];

export default function PlayPage() {
  const { isAuthenticated, loading } = useAuth();
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<WheelSegment | null>(null);
  const [totalWins, setTotalWins] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [spinCount, setSpinCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSpin = async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setResult(null);

    // Play sound if enabled
    if (soundEnabled) {
      playSpinSound();
    }
  };

  const handleSpinComplete = (winningSegment: WheelSegment) => {
    setResult(winningSegment);
    setIsSpinning(false);
    setSpinCount(prev => prev + 1);
    setTotalWins(prev => prev + 1);
    setTotalEarnings(prev => prev + winningSegment.prizeAmount);

    // Play win sound
    if (soundEnabled) {
      playWinSound();
    }
  };

  const playSpinSound = () => {
    // Simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 400;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const playWinSound = () => {
    // Win sound - higher pitch
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container-main">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Play Demo Wheel</h1>
            <p className="text-muted">Try our spinning wheel with this demo configuration</p>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg bg-card hover:bg-border transition"
            aria-label="Toggle sound"
          >
            {soundEnabled ? (
              <Volume2 className="w-6 h-6" />
            ) : (
              <VolumeX className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Wheel Section */}
          <div className="lg:col-span-2 bg-card rounded-2xl p-8 border border-border">
            <SpinningWheel
              segments={DEMO_SEGMENTS}
              onSpinComplete={handleSpinComplete}
              isSpinning={isSpinning}
              spinDuration={5000}
            />

            {/* Spin Button */}
            <div className="mt-8 text-center">
              <Button
                onClick={handleSpin}
                disabled={isSpinning}
                size="lg"
                className="btn-primary px-8"
              >
                {isSpinning ? 'Spinning...' : 'SPIN NOW'}
              </Button>
            </div>

            {/* Result Display */}
            {result && !isSpinning && (
              <div className="mt-8 bg-background rounded-xl p-6 border-2 border-secondary text-center fade-in">
                <p className="text-muted mb-2">You Won!</p>
                <p className="text-4xl font-bold gradient-text mb-2">${result.prizeAmount}</p>
                <p className="text-muted">{result.label}</p>
              </div>
            )}
          </div>

          {/* Stats Section */}
          <div className="space-y-4">
            {/* Account Info */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-bold mb-4">Account</h3>
              {isAuthenticated ? (
                <p className="text-muted">Logged in - Your stats are saved!</p>
              ) : (
                <div className="space-y-3">
                  <p className="text-muted text-sm">Sign in to save your progress and compete</p>
                  <Button
                    asChild
                    className="btn-primary w-full"
                  >
                    <a href="/login">Login</a>
                  </Button>
                </div>
              )}
            </div>

            {/* Statistics */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-bold mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted">Total Spins:</span>
                  <span className="font-bold">{spinCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Total Wins:</span>
                  <span className="font-bold">{totalWins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Total Earnings:</span>
                  <span className="font-bold text-secondary">${totalEarnings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Win Rate:</span>
                  <span className="font-bold">
                    {spinCount > 0 ? ((totalWins / spinCount) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Wheel Info */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-bold mb-4">Wheel Info</h3>
              <div className="space-y-2 text-sm">
                <p className="text-muted">Segments: {DEMO_SEGMENTS.length}</p>
                <p className="text-muted">Max Prize: ${Math.max(...DEMO_SEGMENTS.map(s => s.prizeAmount))}</p>
                <p className="text-muted">Min Prize: ${Math.min(...DEMO_SEGMENTS.map(s => s.prizeAmount))}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="font-bold mb-4">How to Play</h3>
          <ol className="space-y-2 text-muted text-sm list-decimal list-inside">
            <li>Click the "SPIN NOW" button to start spinning the wheel</li>
            <li>Wait for the wheel to stop rotating</li>
            <li>The segment at the top is your winning prize</li>
            <li>Sign in to save your progress and compete on the leaderboard</li>
            <li>Create custom wheels and invite friends for multiplayer games</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

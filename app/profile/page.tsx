'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { updateProfile } from 'firebase/auth';
import { updateUserProfile, getUserSpinHistory } from '@/lib/firebaseUtils';
import { SpinResult } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader, Award, TrendingUp, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [spinHistory, setSpinHistory] = useState<SpinResult[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load user data
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName);
      loadSpinHistory();
    }
  }, [userProfile]);

  const loadSpinHistory = async () => {
    if (!user) return;
    setHistoryLoading(true);
    try {
      const history = await getUserSpinHistory(user.uid, 10);
      setSpinHistory(history);
    } catch (error) {
      console.error('Error loading spin history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userProfile) return;

    setLoading(true);
    try {
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName,
      });

      // Update Firestore profile
      await updateUserProfile(user.uid, {
        displayName,
      });

      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl md:text-4xl font-bold mb-2">My Profile</h1>
          <p className="text-muted">View and manage your account</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Edit Profile Card */}
            <div className="bg-card rounded-xl p-8 border border-border">
              <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Cannot change)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email || ''}
                    disabled
                    className="bg-input border-border"
                  />
                  <p className="text-xs text-muted">Email addresses cannot be changed</p>
                </div>

                {/* Display Name */}
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Enter your display name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={loading}
                    className="bg-input border-border"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </form>
            </div>

            {/* Spin History */}
            <div className="bg-card rounded-xl p-8 border border-border">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Recent Spins</h2>
                <Button variant="outline" size="sm" onClick={loadSpinHistory}>
                  Refresh
                </Button>
              </div>

              {historyLoading ? (
                <div className="flex justify-center py-8">
                  <Loader className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : spinHistory.length === 0 ? (
                <p className="text-muted text-center py-8">No spins yet. Go play to see history!</p>
              ) : (
                <div className="space-y-3">
                  {spinHistory.map((spin) => (
                    <div
                      key={spin.id}
                      className="flex justify-between items-center p-4 bg-background rounded-lg border border-border hover:border-primary transition"
                    >
                      <div>
                        <p className="font-semibold">{spin.result}</p>
                        <p className="text-xs text-muted">
                          {new Date(spin.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-secondary">${spin.prizeAmount}</p>
                        {spin.multiplier > 1 && (
                          <p className="text-xs text-muted">x{spin.multiplier}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-6">
            {/* Account Stats */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-bold mb-6">Account Stats</h3>

              <div className="space-y-4">
                {/* Total Spins */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted">Total Spins</p>
                    <p className="font-bold text-lg">{userProfile.totalSpins}</p>
                  </div>
                </div>

                {/* Total Wins */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
                    <Award className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted">Total Wins</p>
                    <p className="font-bold text-lg">{userProfile.totalWins}</p>
                  </div>
                </div>

                {/* Total Earnings */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted">Total Earnings</p>
                    <p className="font-bold text-lg">${userProfile.totalEarnings}</p>
                  </div>
                </div>

                {/* Win Rate */}
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted mb-1">Win Rate</p>
                  <p className="font-bold text-lg">
                    {userProfile.totalSpins > 0
                      ? ((userProfile.totalWins / userProfile.totalSpins) * 100).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </div>

            {/* Account Balance */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-bold mb-4">Account Balance</h3>
              <p className="text-4xl font-bold gradient-text mb-4">${userProfile.balance}</p>
              <Button className="btn-primary w-full mb-2">Add Funds</Button>
              <Button variant="outline" className="w-full">
                Withdraw
              </Button>
            </div>

            {/* Account Info */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h3 className="font-bold mb-4">Account Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted mb-1">Email</p>
                  <p className="font-mono">{user.email}</p>
                </div>
                <div>
                  <p className="text-muted mb-1">Member Since</p>
                  <p>{new Date(userProfile.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted mb-1">Account ID</p>
                  <p className="font-mono text-xs truncate">{user.uid}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

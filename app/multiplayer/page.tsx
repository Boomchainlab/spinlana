'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { getActiveTournaments, getUserTournaments, joinTournament } from '@/lib/multiplayerUtils';
import { Tournament } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Loader, Users, Trophy, Zap, Calendar, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function MultiplayerPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTournaments, setActiveTournaments] = useState<Tournament[]>([]);
  const [userTournaments, setUserTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [tab, setTab] = useState<'available' | 'joined'>('available');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load tournaments
  useEffect(() => {
    if (user) {
      loadTournaments();
    }
  }, [user]);

  const loadTournaments = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [active, joined] = await Promise.all([
        getActiveTournaments(),
        getUserTournaments(user.uid),
      ]);
      setActiveTournaments(active);
      setUserTournaments(joined);
    } catch (error) {
      console.error('Error loading tournaments:', error);
      toast.error('Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTournament = async (tournamentId: string) => {
    if (!user) return;

    setJoiningId(tournamentId);
    try {
      await joinTournament(tournamentId, user.uid);
      toast.success('Successfully joined tournament!');
      loadTournaments();
    } catch (error: any) {
      console.error('Error joining tournament:', error);
      toast.error(error.message || 'Failed to join tournament');
    } finally {
      setJoiningId(null);
    }
  };

  const getTournamentStatus = (tournament: Tournament) => {
    const now = new Date();
    const start = new Date(tournament.startTime);
    const end = new Date(tournament.endTime);

    if (now < start) return 'Upcoming';
    if (now > end) return 'Completed';
    return 'Live';
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container-main">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Multiplayer Tournaments</h1>
              <p className="text-muted">Compete with players worldwide for big prizes</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-border">
          <button
            onClick={() => setTab('available')}
            className={`px-4 py-3 font-semibold border-b-2 transition ${
              tab === 'available'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            Available Tournaments
          </button>
          <button
            onClick={() => setTab('joined')}
            className={`px-4 py-3 font-semibold border-b-2 transition ${
              tab === 'joined'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            My Tournaments ({userTournaments.length})
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Available Tournaments */}
            {tab === 'available' && (
              <div className="space-y-6">
                {activeTournaments.length === 0 ? (
                  <div className="bg-card rounded-xl border border-border p-12 text-center">
                    <Trophy className="w-12 h-12 text-muted mx-auto mb-4 opacity-50" />
                    <h3 className="font-bold mb-2">No Active Tournaments</h3>
                    <p className="text-muted">
                      Check back soon for new tournaments!
                    </p>
                  </div>
                ) : (
                  activeTournaments.map((tournament) => (
                    <div
                      key={tournament.id}
                      className="bg-card rounded-xl border border-border p-6 hover:border-primary transition"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
                        {/* Info */}
                        <div className="md:col-span-3">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-2xl font-bold">{tournament.name}</h3>
                            <span
                              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                getTournamentStatus(tournament) === 'Upcoming'
                                  ? 'bg-blue-500/20 text-blue-500'
                                  : getTournamentStatus(tournament) === 'Live'
                                    ? 'bg-green-500/20 text-green-500'
                                    : 'bg-gray-500/20 text-gray-500'
                              }`}
                            >
                              {getTournamentStatus(tournament)}
                            </span>
                          </div>
                          <p className="text-muted mb-4">{tournament.description}</p>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-secondary" />
                              <div>
                                <p className="text-muted">Entry Fee</p>
                                <p className="font-bold">${tournament.entryFee}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Trophy className="w-4 h-4 text-secondary" />
                              <div>
                                <p className="text-muted">Prize Pool</p>
                                <p className="font-bold">${tournament.prizePool}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-secondary" />
                              <div>
                                <p className="text-muted">Participants</p>
                                <p className="font-bold">{tournament.participants.length}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-secondary" />
                              <div>
                                <p className="text-muted">Starts</p>
                                <p className="font-bold">
                                  {new Date(tournament.startTime).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Join Button */}
                        <div className="md:col-span-2 flex flex-col gap-4">
                          <Button
                            onClick={() => handleJoinTournament(tournament.id)}
                            disabled={joiningId === tournament.id || userTournaments.some(t => t.id === tournament.id)}
                            className="btn-primary w-full"
                          >
                            {joiningId === tournament.id ? (
                              <>
                                <Loader className="w-4 h-4 animate-spin mr-2" />
                                Joining...
                              </>
                            ) : userTournaments.some(t => t.id === tournament.id) ? (
                              'Already Joined'
                            ) : (
                              'Join Tournament'
                            )}
                          </Button>
                          <Button variant="outline" className="w-full">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Joined Tournaments */}
            {tab === 'joined' && (
              <div className="space-y-6">
                {userTournaments.length === 0 ? (
                  <div className="bg-card rounded-xl border border-border p-12 text-center">
                    <Zap className="w-12 h-12 text-muted mx-auto mb-4 opacity-50" />
                    <h3 className="font-bold mb-2">No Joined Tournaments</h3>
                    <p className="text-muted mb-6">
                      Join tournaments to compete and win prizes!
                    </p>
                    <Button
                      onClick={() => setTab('available')}
                      className="btn-primary"
                    >
                      Browse Tournaments
                    </Button>
                  </div>
                ) : (
                  userTournaments.map((tournament) => (
                    <div
                      key={tournament.id}
                      className="bg-card rounded-xl border border-border p-6 hover:border-primary transition"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
                        <div className="md:col-span-3">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-2xl font-bold">{tournament.name}</h3>
                            <span
                              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                getTournamentStatus(tournament) === 'Upcoming'
                                  ? 'bg-blue-500/20 text-blue-500'
                                  : getTournamentStatus(tournament) === 'Live'
                                    ? 'bg-green-500/20 text-green-500'
                                    : 'bg-gray-500/20 text-gray-500'
                              }`}
                            >
                              {getTournamentStatus(tournament)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted">Prize Pool</p>
                              <p className="font-bold text-secondary">${tournament.prizePool}</p>
                            </div>
                            <div>
                              <p className="text-muted">Participants</p>
                              <p className="font-bold">{tournament.participants.length}</p>
                            </div>
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <Button className="btn-primary w-full">
                            Play Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

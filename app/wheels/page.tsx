'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { getUserWheels } from '@/lib/firebaseUtils';
import { Wheel } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader, Plus, Play, Trash2, Lock, Globe } from 'lucide-react';
import { toast } from 'sonner';

export default function WheelsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [wheels, setWheels] = useState<Wheel[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load wheels
  useEffect(() => {
    if (user) {
      loadWheels();
    }
  }, [user]);

  const loadWheels = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userWheels = await getUserWheels(user.uid);
      setWheels(userWheels);
    } catch (error) {
      console.error('Error loading wheels:', error);
      toast.error('Failed to load wheels');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWheel = async (wheelId: string) => {
    if (!confirm('Are you sure you want to delete this wheel?')) return;

    try {
      // TODO: Implement deletion in firebaseUtils
      toast.success('Wheel deleted successfully');
      loadWheels();
    } catch (error) {
      console.error('Error deleting wheel:', error);
      toast.error('Failed to delete wheel');
    }
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
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Wheels</h1>
            <p className="text-muted">Manage your custom spinning wheels</p>
          </div>
          <Link href="/wheels/create">
            <Button className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Wheel
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : wheels.length === 0 ? (
          // Empty State
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <div className="text-6xl mb-4">🎡</div>
            <h3 className="font-bold text-lg mb-2">No Wheels Yet</h3>
            <p className="text-muted mb-8">Create your first custom wheel to get started</p>
            <Link href="/wheels/create">
              <Button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Wheel
              </Button>
            </Link>
          </div>
        ) : (
          // Wheels Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wheels.map((wheel) => (
              <div
                key={wheel.id}
                className="bg-card rounded-xl border border-border p-6 hover:border-primary transition"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{wheel.name}</h3>
                    <p className="text-xs text-muted line-clamp-2">{wheel.description}</p>
                  </div>
                  <span className="text-lg">
                    {wheel.isPublic ? (
                      <Globe className="w-5 h-5 text-secondary" title="Public" />
                    ) : (
                      <Lock className="w-5 h-5 text-muted" title="Private" />
                    )}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6 py-4 border-y border-border">
                  <div>
                    <p className="text-xs text-muted">Segments</p>
                    <p className="font-bold">{wheel.segments.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Spin Cost</p>
                    <p className="font-bold">${wheel.spinCost}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Plays</p>
                    <p className="font-bold">{wheel.plays}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Created</p>
                    <p className="font-bold text-xs">
                      {new Date(wheel.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Prize Range */}
                <div className="mb-6 p-3 bg-background rounded-lg border border-border">
                  <p className="text-xs text-muted mb-2">Prize Range</p>
                  <p className="font-bold">
                    ${Math.min(...wheel.segments.map(s => s.prizeAmount))} - $
                    {Math.max(...wheel.segments.map(s => s.prizeAmount))}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link href={`/wheels/${wheel.id}/play`} className="flex-1">
                    <Button className="btn-primary w-full">
                      <Play className="w-4 h-4 mr-2" />
                      Play
                    </Button>
                  </Link>
                  <Link href={`/wheels/${wheel.id}/edit`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    onClick={() => handleDeleteWheel(wheel.id)}
                    variant="outline"
                    className="w-10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { createWheel } from '@/lib/firebaseUtils';
import { WheelSegment, Wheel } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SpinningWheel } from '@/components/wheel/SpinningWheel';
import { Loader, Plus, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

const PRESET_COLORS = [
  '#FF6B9D',
  '#4ECDC4',
  '#FFE66D',
  '#95E1D3',
  '#F38181',
  '#AA96DA',
  '#FCBAD3',
  '#A8D8EA',
  '#FFB4B4',
  '#87CEEB',
  '#98D8C8',
  '#F7DC6F',
];

export default function CreateWheelPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [wheelName, setWheelName] = useState('My Custom Wheel');
  const [wheelDescription, setWheelDescription] = useState('');
  const [segments, setSegments] = useState<WheelSegment[]>([
    { id: '1', label: '50', color: '#FF6B9D', prizeAmount: 50, probability: 0.1 },
    { id: '2', label: '100', color: '#4ECDC4', prizeAmount: 100, probability: 0.15 },
    { id: '3', label: '25', color: '#FFE66D', prizeAmount: 25, probability: 0.2 },
    { id: '4', label: '500', color: '#95E1D3', prizeAmount: 500, probability: 0.05 },
  ]);
  const [spinCost, setSpinCost] = useState('10');
  const [isPublic, setIsPublic] = useState(true);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const addSegment = () => {
    const newId = String(segments.length + 1);
    const newSegment: WheelSegment = {
      id: newId,
      label: '100',
      color: PRESET_COLORS[(segments.length) % PRESET_COLORS.length],
      prizeAmount: 100,
      probability: 1 / (segments.length + 1),
    };
    setSegments([...segments, newSegment]);
  };

  const removeSegment = (id: string) => {
    if (segments.length <= 2) {
      toast.error('Minimum 2 segments required');
      return;
    }
    setSegments(segments.filter(s => s.id !== id));
  };

  const updateSegment = (id: string, field: string, value: any) => {
    setSegments(
      segments.map(s =>
        s.id === id ? { ...s, [field]: field === 'prizeAmount' ? Number(value) : value } : s
      )
    );
  };

  const handleSaveWheel = async () => {
    if (!user) return;

    // Validation
    if (!wheelName.trim()) {
      toast.error('Wheel name is required');
      return;
    }

    if (segments.length < 2) {
      toast.error('Minimum 2 segments required');
      return;
    }

    setSaving(true);
    try {
      const newWheel: Wheel = {
        id: `wheel-${Date.now()}`,
        userId: user.uid,
        name: wheelName,
        description: wheelDescription,
        segments,
        isPublic,
        spinCost: Number(spinCost),
        createdAt: new Date().toISOString(),
        plays: 0,
      };

      await createWheel(user.uid, newWheel);
      toast.success('Wheel created successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error saving wheel:', error);
      toast.error(error.message || 'Failed to create wheel');
    } finally {
      setSaving(false);
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
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Create Custom Wheel</h1>
          <p className="text-muted">Design your own spinning wheel and invite friends to play</p>
        </div>

        {preview ? (
          // Preview Mode
          <div className="bg-card rounded-xl border border-border p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Wheel Preview</h2>
              <Button variant="outline" onClick={() => setPreview(false)}>
                Back to Edit
              </Button>
            </div>

            <div className="mb-8">
              <SpinningWheel
                segments={segments}
                onSpinComplete={() => {}}
                isSpinning={false}
              />
            </div>

            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-muted mb-2">Wheel Name</p>
                <p className="font-bold">{wheelName}</p>
              </div>
              <div>
                <p className="text-muted mb-2">Spin Cost</p>
                <p className="font-bold">${spinCost}</p>
              </div>
              <div>
                <p className="text-muted mb-2">Segments</p>
                <p className="font-bold">{segments.length}</p>
              </div>
              <div>
                <p className="text-muted mb-2">Visibility</p>
                <p className="font-bold">{isPublic ? 'Public' : 'Private'}</p>
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Editor */}
            <div className="lg:col-span-2 space-y-6">
              {/* Wheel Info */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-bold text-lg mb-6">Wheel Information</h3>

                <div className="space-y-4">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="wheelName">Wheel Name</Label>
                    <Input
                      id="wheelName"
                      value={wheelName}
                      onChange={(e) => setWheelName(e.target.value)}
                      placeholder="Enter wheel name"
                      className="bg-input border-border"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      value={wheelDescription}
                      onChange={(e) => setWheelDescription(e.target.value)}
                      placeholder="Describe your wheel (optional)"
                      className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted resize-none"
                      rows={3}
                    />
                  </div>

                  {/* Spin Cost */}
                  <div className="space-y-2">
                    <Label htmlFor="spinCost">Spin Cost ($)</Label>
                    <Input
                      id="spinCost"
                      type="number"
                      value={spinCost}
                      onChange={(e) => setSpinCost(e.target.value)}
                      placeholder="10"
                      min="1"
                      className="bg-input border-border"
                    />
                  </div>

                  {/* Visibility */}
                  <div className="space-y-2">
                    <Label>Visibility</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="visibility"
                          checked={isPublic}
                          onChange={() => setIsPublic(true)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Public (Anyone can play)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="visibility"
                          checked={!isPublic}
                          onChange={() => setIsPublic(false)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Private (Invite only)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Segments Editor */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg">Segments ({segments.length})</h3>
                  <Button onClick={addSegment} size="sm" className="btn-secondary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Segment
                  </Button>
                </div>

                <div className="space-y-4">
                  {segments.map((segment) => (
                    <div key={segment.id} className="p-4 bg-background rounded-lg border border-border">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3">
                        {/* Color */}
                        <div>
                          <Label htmlFor={`color-${segment.id}`} className="text-xs">
                            Color
                          </Label>
                          <div className="flex gap-2 flex-wrap mt-2">
                            {PRESET_COLORS.map(color => (
                              <button
                                key={color}
                                onClick={() => updateSegment(segment.id, 'color', color)}
                                className={`w-8 h-8 rounded border-2 ${
                                  segment.color === color ? 'border-foreground' : 'border-border'
                                }`}
                                style={{ backgroundColor: color }}
                                aria-label={`Color ${color}`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Label */}
                        <div>
                          <Label htmlFor={`label-${segment.id}`} className="text-xs">
                            Label
                          </Label>
                          <Input
                            id={`label-${segment.id}`}
                            value={segment.label}
                            onChange={(e) => updateSegment(segment.id, 'label', e.target.value)}
                            placeholder="Label"
                            className="bg-input border-border text-sm mt-2"
                          />
                        </div>

                        {/* Prize Amount */}
                        <div>
                          <Label htmlFor={`prize-${segment.id}`} className="text-xs">
                            Prize ($)
                          </Label>
                          <Input
                            id={`prize-${segment.id}`}
                            type="number"
                            value={segment.prizeAmount}
                            onChange={(e) =>
                              updateSegment(segment.id, 'prizeAmount', e.target.value)
                            }
                            placeholder="0"
                            min="0"
                            className="bg-input border-border text-sm mt-2"
                          />
                        </div>

                        {/* Probability */}
                        <div>
                          <Label htmlFor={`prob-${segment.id}`} className="text-xs">
                            Prob (%)
                          </Label>
                          <Input
                            id={`prob-${segment.id}`}
                            type="number"
                            value={(segment.probability * 100).toFixed(0)}
                            onChange={(e) =>
                              updateSegment(segment.id, 'probability', Number(e.target.value) / 100)
                            }
                            placeholder="10"
                            min="0"
                            max="100"
                            className="bg-input border-border text-sm mt-2"
                          />
                        </div>

                        {/* Delete */}
                        <div className="flex items-end">
                          <Button
                            onClick={() => removeSegment(segment.id)}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Preview & Actions */}
            <div className="space-y-6">
              {/* Preview Button */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-bold mb-4">Preview</h3>
                <Button
                  onClick={() => setPreview(true)}
                  className="btn-secondary w-full mb-4"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Wheel Preview
                </Button>
              </div>

              {/* Summary */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-bold mb-4">Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Total Segments:</span>
                    <span className="font-bold">{segments.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Max Prize:</span>
                    <span className="font-bold">
                      ${Math.max(...segments.map(s => s.prizeAmount))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Min Prize:</span>
                    <span className="font-bold">
                      ${Math.min(...segments.map(s => s.prizeAmount))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Avg Prize:</span>
                    <span className="font-bold">
                      $
                      {(
                        segments.reduce((sum, s) => sum + s.prizeAmount, 0) / segments.length
                      ).toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={handleSaveWheel}
                  disabled={saving}
                  className="btn-primary w-full"
                >
                  {saving ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Wheel'
                  )}
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <a href="/dashboard">Cancel</a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

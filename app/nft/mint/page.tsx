'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWallet } from '@/lib/hooks/useWallet';
import { useNFTMinting } from '@/lib/hooks/useNFTMinting';
import { Segment } from '@/lib/nftUtils';
import {
  FileUp,
  Zap,
  ShieldCheck,
  Palette,
  AlertCircle,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NFTMintPage() {
  const { account, isConnected } = useWallet();
  const { isMinting, error: mintError, success, mintWheel } = useNFTMinting();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true,
    price: '0.1',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [segments, setSegments] = useState<Segment[]>([
    { label: 'Prize 1', color: '#FF6B6B', probability: 0.25, prizeAmount: 100 },
    { label: 'Prize 2', color: '#4ECDC4', probability: 0.25, prizeAmount: 250 },
    { label: 'Prize 3', color: '#45B7D1', probability: 0.25, prizeAmount: 500 },
    { label: 'Bonus', color: '#FFA502', probability: 0.25, prizeAmount: 1000 },
  ]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateSegment = (index: number, key: keyof Segment, value: any) => {
    const newSegments = [...segments];
    newSegments[index] = { ...newSegments[index], [key]: value };
    setSegments(newSegments);
  };

  const addSegment = () => {
    setSegments([
      ...segments,
      {
        label: `Segment ${segments.length + 1}`,
        color: '#' + Math.floor(Math.random() * 16777215).toString(16),
        probability: 1 / (segments.length + 1),
        prizeAmount: 100,
      },
    ]);
  };

  const removeSegment = (index: number) => {
    if (segments.length > 2) {
      setSegments(segments.filter((_, i) => i !== index));
    }
  };

  const handleMint = async () => {
    if (!account) {
      alert('Please connect your wallet first');
      return;
    }

    if (!imageFile) {
      alert('Please upload a wheel image');
      return;
    }

    if (!formData.name.trim()) {
      alert('Please enter a wheel name');
      return;
    }

    try {
      await mintWheel(
        {
          name: formData.name,
          description: formData.description,
          imageFile,
          segments,
          isPublic: formData.isPublic,
          price: formData.price,
        },
        account
      );
    } catch (err) {
      console.error('Minting error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900/20 to-slate-950 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
            Mint Your Wheel as NFT
          </h1>
          <p className="text-lg text-slate-300">
            Create a unique wheel design and mint it as an NFT on Base network
          </p>
        </div>

        {/* Not Connected Alert */}
        {!isConnected && (
          <Card className="mb-8 border-yellow-500/20 bg-yellow-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <p className="text-yellow-400">
                  Please connect your wallet to mint NFTs
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Alert */}
        {success && (
          <Card className="mb-8 border-green-500/20 bg-green-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-400">NFT Minted Successfully!</p>
                  <p className="text-sm text-slate-400">
                    Your wheel is now available as an NFT on the Base network
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Preview */}
          <div className="lg:col-span-1">
            <Card className="border-slate-700/50 sticky top-4">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {imagePreview ? (
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-purple-500/50">
                    <img
                      src={imagePreview}
                      alt="Wheel preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-square rounded-lg border-2 border-dashed border-slate-600 flex items-center justify-center">
                    <div className="text-center">
                      <Palette className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">No image uploaded</p>
                    </div>
                  </div>
                )}

                {/* Segments Preview */}
                <div>
                  <h4 className="font-semibold mb-3 text-sm">Segments ({segments.length})</h4>
                  <div className="space-y-2">
                    {segments.map((segment, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: segment.color }}
                        />
                        <span className="flex-1 truncate">{segment.label}</span>
                        <span className="text-slate-400">{segment.prizeAmount}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-700/50">
                  <div>
                    <p className="text-xs text-slate-400">Mint Price</p>
                    <p className="font-semibold text-sm text-purple-400">{formData.price} ETH</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Visibility</p>
                    <p className="font-semibold text-sm text-blue-400">
                      {formData.isPublic ? 'Public' : 'Private'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Upload */}
            <Card className="border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileUp className="w-5 h-5 text-purple-500" />
                  Wheel Image
                </CardTitle>
                <CardDescription>Upload a PNG or JPG image of your wheel</CardDescription>
              </CardHeader>
              <CardContent>
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <div className="border-2 border-dashed border-slate-600 hover:border-purple-500/50 rounded-lg p-8 text-center transition-colors">
                    <FileUp className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="font-semibold mb-1">Click to upload image</p>
                    <p className="text-sm text-slate-400">PNG or JPG, max 10MB</p>
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isMinting}
                  />
                </Label>
              </CardContent>
            </Card>

            {/* Basic Info */}
            <Card className="border-slate-700/50">
              <CardHeader>
                <CardTitle>Wheel Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Wheel Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="My Awesome Wheel"
                    disabled={isMinting}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your wheel design..."
                    disabled={isMinting}
                    className="mt-2 w-full min-h-24 rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Mint Price (ETH)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      disabled={isMinting}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="visibility">Visibility</Label>
                    <select
                      id="visibility"
                      value={formData.isPublic ? 'public' : 'private'}
                      onChange={(e) =>
                        setFormData({ ...formData, isPublic: e.target.value === 'public' })
                      }
                      disabled={isMinting}
                      className="mt-2 w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Segments */}
            <Card className="border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-pink-500" />
                    Wheel Segments
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addSegment}
                    disabled={isMinting}
                  >
                    Add Segment
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {segments.map((segment, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-slate-700/50 space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 space-y-3">
                        <div>
                          <Label className="text-xs">Segment Label</Label>
                          <Input
                            value={segment.label}
                            onChange={(e) => updateSegment(idx, 'label', e.target.value)}
                            disabled={isMinting}
                            className="mt-1"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label className="text-xs">Color</Label>
                            <input
                              type="color"
                              value={segment.color}
                              onChange={(e) => updateSegment(idx, 'color', e.target.value)}
                              disabled={isMinting}
                              className="mt-1 w-full h-10 rounded cursor-pointer"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Prize Amount</Label>
                            <Input
                              type="number"
                              min="0"
                              value={segment.prizeAmount}
                              onChange={(e) =>
                                updateSegment(idx, 'prizeAmount', parseFloat(e.target.value))
                              }
                              disabled={isMinting}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Probability</Label>
                            <Input
                              type="number"
                              min="0"
                              max="1"
                              step="0.01"
                              value={segment.probability}
                              onChange={(e) =>
                                updateSegment(idx, 'probability', parseFloat(e.target.value))
                              }
                              disabled={isMinting}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                      {segments.length > 2 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSegment(idx)}
                          disabled={isMinting}
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10 mt-6"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Error Alert */}
            {mintError && (
              <Card className="border-red-500/20 bg-red-500/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-red-400">{mintError}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mint Button */}
            <Button
              onClick={handleMint}
              disabled={isMinting || !isConnected || !imageFile || !formData.name.trim()}
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Zap className="w-5 h-5 mr-2" />
              {isMinting ? 'Minting NFT...' : 'Mint NFT Wheel'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

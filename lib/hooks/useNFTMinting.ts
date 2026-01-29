'use client';

import { useState, useCallback } from 'react';
import {
  mintWheelAsNFT,
  getUserNFTWheels,
  getPublicNFTWheels,
  uploadWheelImage,
  estimateMintingGas,
} from '@/lib/nftUtils';
import { Segment, WheelNFT } from '@/lib/nftUtils';

export function useNFTMinting() {
  const [isMinting, setIsMinting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const mintWheel = useCallback(
    async (
      wheelData: {
        name: string;
        description: string;
        imageFile: File;
        segments: Segment[];
        isPublic: boolean;
        price?: string;
      },
      userId: string
    ) => {
      setIsMinting(true);
      setError(null);
      setSuccess(false);

      try {
        const nft = await mintWheelAsNFT(wheelData, userId);
        setSuccess(true);
        return nft;
      } catch (err: any) {
        setError(err.message || 'Failed to mint wheel');
        throw err;
      } finally {
        setIsMinting(false);
      }
    },
    []
  );

  const fetchUserWheels = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      return await getUserNFTWheels(userId);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch wheels');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPublicWheels = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      return await getPublicNFTWheels();
    } catch (err: any) {
      setError(err.message || 'Failed to fetch public wheels');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadImage = useCallback(async (file: File, wheelName: string) => {
    try {
      return await uploadWheelImage(file, wheelName);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
      throw err;
    }
  }, []);

  const estimateGas = useCallback(async (wheelName: string, price?: string) => {
    try {
      return await estimateMintingGas(wheelName, price);
    } catch (err: any) {
      setError(err.message || 'Failed to estimate gas');
      return '0.005';
    }
  }, []);

  return {
    isMinting,
    isLoading,
    error,
    success,
    mintWheel,
    fetchUserWheels,
    fetchPublicWheels,
    uploadImage,
    estimateGas,
  };
}

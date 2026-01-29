'use client';

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { getProvider, getSigner, getUserSpinBalance, getUserWheels } from '@/lib/web3Utils';

export function useWallet() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState<string>('0');
  const [wheels, setWheels] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Check if wallet is connected on mount
  useEffect(() => {
    checkConnection();
    
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  // Update balance when account changes
  useEffect(() => {
    if (account && isConnected) {
      fetchBalance();
      fetchWheels();
    }
  }, [account, isConnected]);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      setIsConnected(true);
    } else {
      disconnect();
    }
  };

  const checkConnection = useCallback(async () => {
    try {
      const provider = await getProvider();
      if (!provider) return;

      const accounts = await provider.listAccounts?.();
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0].address);
        setIsConnected(true);
      }
    } catch (err) {
      console.error('Error checking connection:', err);
    }
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not found');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccount(null);
    setIsConnected(false);
    setBalance('0');
    setWheels([]);
  }, []);

  const fetchBalance = useCallback(async () => {
    if (!account) return;
    try {
      const bal = await getUserSpinBalance(account);
      setBalance(bal);
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  }, [account]);

  const fetchWheels = useCallback(async () => {
    if (!account) return;
    try {
      const userWheels = await getUserWheels(account);
      setWheels(userWheels);
    } catch (err) {
      console.error('Error fetching wheels:', err);
    }
  }, [account]);

  const switchToBase = useCallback(async () => {
    try {
      if (!window.ethereum) throw new Error('MetaMask not found');

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x2105' }], // Base mainnet
      });
    } catch (err: any) {
      if (err.code === 4902) {
        // Chain not added, add it
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x2105',
                chainName: 'Base',
                nativeCurrency: {
                  name: 'Ether',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://mainnet.base.org'],
                blockExplorerUrls: ['https://basescan.org'],
              },
            ],
          });
        } catch (addErr) {
          throw addErr;
        }
      } else {
        throw err;
      }
    }
  }, []);

  return {
    account,
    isConnected,
    isConnecting,
    balance,
    wheels,
    error,
    connect,
    disconnect,
    fetchBalance,
    fetchWheels,
    switchToBase,
  };
}

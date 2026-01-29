'use client';

import React from 'react';
import { useWallet } from '@/lib/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

export function WalletButton({ className }: { className?: string }) {
  const { account, isConnecting, isConnected, connect, disconnect } = useWallet();

  const displayAddress = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : '';

  return (
    <div className={cn('flex gap-2', className)}>
      {isConnected ? (
        <>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            disabled
          >
            <Wallet className="w-4 h-4 mr-2" />
            {displayAddress}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={disconnect}
            className="rounded-full"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </>
      ) : (
        <Button
          onClick={connect}
          disabled={isConnecting}
          className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          <Wallet className="w-4 h-4 mr-2" />
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      )}
    </div>
  );
}

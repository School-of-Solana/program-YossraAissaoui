'use client';

import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { initializeProgram } from '@/lib/program';

export function useBirthdayProgram() {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  const { program, error } = useMemo(() => {
    try {
      if (!wallet) {
        return { program: null, error: 'Wallet not connected' };
      }

      const prog = initializeProgram(connection, wallet);
      return { program: prog, error: null };
    } catch (err) {
      console.error('Error initializing program:', err);
      return {
        program: null,
        error: err instanceof Error ? err.message : 'Failed to initialize program',
      };
    }
  }, [wallet, connection]);

  return {
    program,
    wallet,
    connection,
    isConnected: !!wallet,
    error,
  };
}
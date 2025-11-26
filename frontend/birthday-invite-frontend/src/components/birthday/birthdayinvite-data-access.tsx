'use client';

import { useCallback, useState } from 'react';
import { useBirthdayProgram } from '@/hooks/useBirthdayProgram';
import { BirthdayEvent, Comment } from '@/types/birthday';
import * as anchor from '@coral-xyz/anchor';
import { convertToSeconds } from '@/lib/utils';
import { MAX_EVENT_NAME, MAX_COMMENT_TEXT } from '@/lib/constants';

export function useBirthdayDataAccess() {
  const { program, wallet, isConnected } = useBirthdayProgram();

  const [events, setEvents] = useState<BirthdayEvent[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  /**
   * Derive PDA for an event
   * Seeds: [event_name, "EVENT_SEED", creator]
   */
  const deriveBirthdayEventPDA = useCallback(
    async (eventName: string, creator: anchor.web3.PublicKey) => {
      if (!program) throw new Error('Program not initialized');

      const seeds = [
        Buffer.from(eventName),
        Buffer.from('EVENT_SEED'),
        creator.toBuffer(),
      ];

      const [pda] = await anchor.web3.PublicKey.findProgramAddressSync(
        seeds,
        program.programId
      );

      return pda;
    },
    [program]
  );

  // ============================================================
  // FETCH OPERATIONS
  // ============================================================

  /**
   * Fetch all BirthdayEvent accounts
   */
  const fetchEvents = useCallback(async () => {
    if (!program) {
      setError('Program not initialized');
      return;
    }

     if (!program.account || !program.account.birthdayEvent) {
    console.error('Account client not available');
    setError('Account client not initialized');
    return;
  }

    try {
      setLoading(true);
      setError(null);
      const accountsData = await program.account.birthdayEvent.all();
      if (!accountsData || accountsData.length === 0) {
        setEvents([]);
        return;
      }

      // Map Rust structs to TypeScript types
      const fetchedEvents: BirthdayEvent[] = accountsData.map((acc: any) => {
        const rustEvent = acc.account;
        console.log('Mapping account:', rustEvent);
        return {
          id: acc.publicKey.toString(),
          name: rustEvent.eventName,
          date: typeof rustEvent.eventDate === 'object'
             ? rustEvent.eventDate.toNumber()
             : rustEvent.eventDate,
          coming: rustEvent.comingCount,
          busy: rustEvent.busyCount,
          totalComments: rustEvent.comments?.length || 0,
          address: acc.publicKey.toString(),
          creator: rustEvent.creator.toString(),
        };
      });
       
     
      setEvents(fetchedEvents);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load events';
      setError(errorMsg);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [program]);

  /**
   * Fetch comments for a specific event
   */
  const fetchComments = useCallback(
    async (eventName: string) => {
      if (!program || !wallet) {
        setComments([]);
        return;
      }

      if (!eventName) {
        setComments([]);
        return;
      }

      try {
        // Derive the PDA for this event
        const eventPDA = await deriveBirthdayEventPDA(eventName, wallet.publicKey);
        // Fetch the BirthdayEvent account
        const eventAccount = await program.account.birthdayEvent.fetch(eventPDA);
        // Extract comments from the event
        if (!eventAccount.comments || eventAccount.comments.length === 0) {
          setComments([]);
          return;
        }

        // Map Rust Comment struct to TypeScript Comment type
        const mappedComments: Comment[] = eventAccount.comments.map(
          (rustComment: any, index: number) => ({
            id: rustComment.commentId?.toNumber?.() || index,
            author: rustComment.commentAuthor.toString(),
            text: rustComment.content,
            timestamp: Date.now(),
          })
        );

        setComments(mappedComments);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load comments';
        setError(errorMsg);
        setComments([]);
      }
    },
    [program, wallet, deriveBirthdayEventPDA]
  );

  // ============================================================
  // WRITE OPERATIONS
  // ============================================================

  /**
   * Create a new birthday event
   */
  const createEvent = useCallback(
    async (eventName: string, eventDate: string) => {
      if (!program || !wallet) {
        throw new Error('Program or wallet not initialized');
      }

      if (eventName.length === 0 || eventName.length > MAX_EVENT_NAME) {
        throw new Error(`Event name must be 1-${MAX_EVENT_NAME} characters`);
      }

      const dateObj = new Date(eventDate);
      if (dateObj <= new Date()) {
        throw new Error('Please select a future date');
      }

      try {
        setLoading(true);
        setError(null);

        const eventDateSeconds = new anchor.BN(convertToSeconds(eventDate));

        // Derive PDA for the new event
        const [birthdayEventPDA] = await anchor.web3.PublicKey.findProgramAddressSync(
          [
            Buffer.from(eventName),
            Buffer.from('EVENT_SEED'),
            wallet.publicKey.toBuffer(),
          ],
          program.programId
        );

        const tx = await program.methods
          .initializeBdayEvent(eventName, eventDateSeconds)
          .accounts({
            creator: wallet.publicKey,
            birthdayEvent: birthdayEventPDA,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();

        // Wait for confirmation
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Auto-fetch after creation
        await fetchEvents();

        return tx;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to create event';
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [program, wallet, fetchEvents]
  );

  /**
   * Confirm attendance to an event
   */
  const confirmAttendance = useCallback(
    async (eventName: string) => {
      if (!program || !wallet) {
        throw new Error('Program or wallet not initialized');
      }

      try {
        setLoading(true);
        setError(null);

        const eventPDA = await deriveBirthdayEventPDA(eventName, wallet.publicKey);

        const tx = await program.methods
          .confirmAttendance(eventName)
          .accounts({
            signer: wallet.publicKey,
            birthdayEvent: eventPDA,
          })
          .rpc();

        await new Promise(resolve => setTimeout(resolve, 2000));
        await fetchEvents();

        return tx;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to confirm attendance';
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [program, wallet, fetchEvents, deriveBirthdayEventPDA]
  );

  /**
   * Decline attendance to an event
   */
  const declineAttendance = useCallback(
    async (eventName: string) => {
      if (!program || !wallet) {
        throw new Error('Program or wallet not initialized');
      }

      try {
        setLoading(true);
        setError(null);

        const eventPDA = await deriveBirthdayEventPDA(eventName, wallet.publicKey);

        const tx = await program.methods
          .declineAttendance(eventName)
          .accounts({
            signer: wallet.publicKey,
            birthdayEvent: eventPDA,
          })
          .rpc();

        await new Promise(resolve => setTimeout(resolve, 2000));
        await fetchEvents();

        return tx;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to decline attendance';
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [program, wallet, fetchEvents, deriveBirthdayEventPDA]
  );

  /**
   * Add a comment to an event
   */
  const addComment = useCallback(
    async (eventName: string, commentText: string) => {
      if (!program || !wallet) {
        throw new Error('Program or wallet not initialized');
      }

      if (!commentText.trim() || commentText.length > MAX_COMMENT_TEXT) {
        throw new Error(`Comment must be 1-${MAX_COMMENT_TEXT} characters`);
      }

      try {
        setLoading(true);
        setError(null);

        const eventPDA = await deriveBirthdayEventPDA(eventName, wallet.publicKey);

        const tx = await program.methods
          .addComment(eventName, commentText)
          .accounts({
            author: wallet.publicKey,
            birthdayEvent: eventPDA,
          })
          .rpc();

        await new Promise(resolve => setTimeout(resolve, 2000));
        await fetchComments(eventName);

        return tx;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to add comment';
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [program, wallet, fetchComments, deriveBirthdayEventPDA]
  );

  // ============================================================
  // UTILITY METHODS
  // ============================================================

  const refreshData = useCallback(async () => {
    await fetchEvents();
  }, [fetchEvents]);

  const isReadyForTransactions = useCallback((): boolean => {
    return !!program && !!wallet?.publicKey && isConnected;
  }, [program, wallet, isConnected]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============================================================
  // RETURN HOOK INTERFACE
  // ============================================================

  return {
    // State
    events,
    comments,
    loading,
    error,
    isConnected,

    // Fetch methods
    fetchEvents,
    fetchComments,

    // Write methods
    createEvent,
    confirmAttendance,
    declineAttendance,
    addComment,

    // Utility methods
    refreshData,
    isReadyForTransactions,
    clearError,
  };
}
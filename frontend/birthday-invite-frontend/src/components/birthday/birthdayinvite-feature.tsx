'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useBirthdayProgram } from '@/hooks/useBirthdayProgram';
import { useBirthdayDataAccess } from './birthdayinvite-data-access';
import { BirthdayEvent, Comment } from '@/types/birthday';

/**
 * Feature/Business Logic Layer
 * Handles state management and feature logic
 * Bridges between data access and UI presentation
 */

interface OperationResult {
  success: boolean;
  error?: string;
  txHash?: string;
}

export function useBirthdayFeature() {
  const { program, isConnected } = useBirthdayProgram();
  const dataAccess = useBirthdayDataAccess();

  // ============================================================
  // STATE MANAGEMENT
  // ============================================================

  const [selectedEvent, setSelectedEvent] = useState<BirthdayEvent | null>(null);
  const [eventComments, setEventComments] = useState<Comment[]>([]);
  const [rsvpStatus, setRsvpStatus] = useState<'none' | 'coming' | 'busy'>('none');

  // Track if initial fetch is done to prevent infinite loops
  const hasInitialFetched = useRef(false);
  const lastFetchTimeRef = useRef<number>(0);

  // ============================================================
  // INITIALIZATION & AUTO-FETCH
  // ============================================================

  // Initialize on mount - fetch events once when program and wallet are ready
  useEffect(() => {
    if (program && isConnected && !hasInitialFetched.current) {
      hasInitialFetched.current = true;
      dataAccess.fetchEvents();
    }
  }, [program, isConnected]);

  
  // Auto-refresh events every 30 seconds
  useEffect(() => {
    if (!isConnected || !program) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastFetchTimeRef.current > 30000) {
        lastFetchTimeRef.current = now;
        dataAccess.fetchEvents();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected, program]);

  // Load comments when selected event changes
  useEffect(() => {
    if (selectedEvent?.id) {
      dataAccess.fetchComments(selectedEvent.name);
    }
  }, [selectedEvent?.id]);

  
  // Update event comments state
  useEffect(() => {
    setEventComments(dataAccess.comments);
  }, [dataAccess.comments]);

  
  // Reset RSVP status when selected event changes
  useEffect(() => {
    setRsvpStatus('none');
  }, [selectedEvent?.id]);

  // ============================================================
  // EVENT MANAGEMENT
  // ============================================================


  // Create a new birthday event
  const handleCreateEvent = useCallback(
    async (eventName: string, eventDate: string): Promise<OperationResult> => {
      if (!isConnected) {
        return {
          success: false,
          error: 'Please connect your wallet to create an event',
        };
      }

      if (!eventName.trim()) {
        return {
          success: false,
          error: 'Event name is required',
        };
      }

      if (!eventDate) {
        return {
          success: false,
          error: 'Event date is required',
        };
      }

      try {
        const txHash = await dataAccess.createEvent(eventName, eventDate);
        setSelectedEvent(null);
        hasInitialFetched.current = false;

        return {
          success: true,
          txHash: txHash as string,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create event';

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [isConnected, dataAccess]
  );

  
  // Select an event and load its details
  const selectEvent = useCallback((event: BirthdayEvent | null) => {
    setSelectedEvent(event);
    if (!event) {
      setEventComments([]);
      setRsvpStatus('none');
    }
  }, []);

  // ============================================================
  // RSVP OPERATIONS
  // ============================================================

  
  // Confirm attendance to an event
  const handleConfirmAttendance = useCallback(
    async (eventName: string): Promise<OperationResult> => {
      if (!isConnected) {
        return {
          success: false,
          error: 'Please connect your wallet to RSVP',
        };
      }

      try {
        const txHash = await dataAccess.confirmAttendance(eventName);
        setRsvpStatus('coming');

        return {
          success: true,
          txHash: txHash as string,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to confirm attendance';

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [isConnected, dataAccess]
  );

  
  // Decline attendance to an event
  const handleDeclineAttendance = useCallback(
    async (eventName: string): Promise<OperationResult> => {
      if (!isConnected) {
        return {
          success: false,
          error: 'Please connect your wallet to RSVP',
        };
      }

      try {
        const txHash = await dataAccess.declineAttendance(eventName);
        setRsvpStatus('busy');

        return {
          success: true,
          txHash: txHash as string,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to decline attendance';

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [isConnected, dataAccess]
  );

  // ============================================================
  // COMMENTS OPERATIONS
  // ============================================================

  
  // Add a comment to an event
  const handleAddComment = useCallback(
    async (eventName: string, commentText: string): Promise<OperationResult> => {
      if (!isConnected) {
        return {
          success: false,
          error: 'Please connect your wallet to add a comment',
        };
      }

      if (!commentText.trim()) {
        return {
          success: false,
          error: 'Comment cannot be empty',
        };
      }

      if (commentText.length > 500) {
        return {
          success: false,
          error: 'Comment is too long (max 500 characters)',
        };
      }

      try {
        const txHash = await dataAccess.addComment(eventName, commentText);

        return {
          success: true,
          txHash: txHash as string,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to add comment';

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [isConnected, dataAccess]
  );

  // ============================================================
  // UTILITY & HELPER FUNCTIONS
  // ============================================================

  // Manually refresh all data
  const refreshData = useCallback(async () => {
    lastFetchTimeRef.current = Date.now();
    await dataAccess.fetchEvents();

    if (selectedEvent) {
      await dataAccess.fetchComments(selectedEvent.name);
    }
  }, [selectedEvent?.id, dataAccess]);

  
  // Clear error from data access layer
  const clearError = useCallback(() => {
    dataAccess.clearError();
  }, [dataAccess]);

  // Check if ready for wallet-dependent operations
  const isReadyForOperations = useCallback((): boolean => {
    return dataAccess.isReadyForTransactions();
  }, [dataAccess]);

  
  // Get formatted event statistics
  const getEventStats = useCallback(() => {
    if (!selectedEvent) return null;

    return {
      eventName: selectedEvent.name,
      totalAttendees: selectedEvent.coming + selectedEvent.busy,
      coming: selectedEvent.coming,
      busy: selectedEvent.busy,
      comments: selectedEvent.totalComments,
      commentsList: eventComments,
    };
  }, [selectedEvent, eventComments]);

  // ============================================================
  // RETURN HOOK INTERFACE
  // ============================================================

  return {
    // ========== STATE ==========
    events: dataAccess.events,
    selectedEvent,
    eventComments,
    isConnected,
    isLoading: dataAccess.loading,
    error: dataAccess.error,
    rsvpStatus,

    // ========== EVENT MANAGEMENT ==========
    handleCreateEvent,
    selectEvent,

    // ========== RSVP OPERATIONS ==========
    handleConfirmAttendance,
    handleDeclineAttendance,

    // ========== COMMENTS OPERATIONS ==========
    handleAddComment,

    // ========== UTILITIES ==========
    refreshData,
    clearError,
    isReadyForOperations,
    getEventStats,

    // ========== DATA ACCESS METHODS ==========
    fetchEvents: dataAccess.fetchEvents,
    fetchComments: dataAccess.fetchComments,
  };
}
'use client';

import { useState } from 'react';
import { useBirthdayFeature } from './birthdayinvite-feature';
import { useBirthdayProgram } from '@/hooks/useBirthdayProgram';
import { getExplorerLink, formatDate, truncateAddress, validateEventName, validateDate, validateComment } from '@/lib/utils';
import { MAX_EVENT_NAME, MAX_COMMENT_TEXT } from '@/lib/constants';

function CreateEventSection() {
  const { handleCreateEvent, isLoading, error } = useBirthdayFeature();
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [uiError, setUiError] = useState('');
  const [txLink, setTxLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setUiError('');
    setTxLink('');

    if (!validateEventName(eventName)) {
      setUiError('Event name must be 1-32 characters');
      return;
    }

    if (!validateDate(eventDate)) {
      setUiError('Please select a future date');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await handleCreateEvent(eventName, eventDate);

      if (result.success) {
        setEventName('');
        setEventDate('');
        setTxLink('success');
      } else {
        setUiError(result.error || 'Failed to create event');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20 shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-6">Create Birthday Event</h2>

      {(uiError || error) && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
          {uiError || error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Event Name
          </label>
          <input
            type="text"
            placeholder="e.g., Alice's 30th Birthday!"
            value={eventName}
            onChange={(e) => setEventName(e.target.value.slice(0, MAX_EVENT_NAME))}
            maxLength={MAX_EVENT_NAME}
            className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-400 border border-white/30 focus:outline-none focus:border-blue-400 transition"
          />
          <p className="text-xs text-gray-400 mt-1">
            {eventName.length}/{MAX_EVENT_NAME}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Event Date
          </label>
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none focus:border-blue-400 transition"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || isLoading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 rounded-lg transition duration-200 disabled:opacity-50"
        >
          {isSubmitting || isLoading ? '⏳ Creating...' : '🎉 Create Event'}
        </button>

        {txLink === 'success' && (
          <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm">
            ✅ Event created successfully!
          </div>
        )}
      </div>
    </div>
  );
}

function EventCardUI() {
  const { events, selectedEvent, selectEvent, isLoading } = useBirthdayFeature();

  if (isLoading && events.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
        <p className="text-gray-300">Loading events...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
        <p className="text-gray-300">No events found. Create one to get started!</p>
      </div>
    );
  }

  const event = selectedEvent || events[0];

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20 shadow-lg">
      <div className="mb-6">
        <h3 className="text-3xl font-bold text-white mb-2">🎂 {event.name}</h3>
        <p className="text-gray-300">📅 {formatDate(new Date(event.date * 1000))}</p>
        <p className="text-sm text-gray-400 mt-2">
          Creator: {truncateAddress(event.creator)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
          <p className="text-green-200 text-sm">Coming</p>
          <p className="text-2xl font-bold text-white">{event.coming}</p>
        </div>
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-200 text-sm">Busy</p>
          <p className="text-2xl font-bold text-white">{event.busy}</p>
        </div>
      </div>

      {events.length > 1 && (
        <div className="mb-6 flex gap-2 flex-wrap">
          {events.map((e) => (
            <button
              key={e.id}
              onClick={() => selectEvent(e)}
              className={`px-3 py-1 rounded text-sm font-medium transition ${
                selectedEvent?.id === e.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/20 text-gray-200 hover:bg-white/30'
              }`}
            >
              {e.name}
            </button>
          ))}
        </div>
      )}

      <div className="border-t border-white/20 pt-6">
        <RSVPSectionUI eventName={event.name} />
      </div>

      <div className="border-t border-white/20 pt-6">
        <CommentsSectionUI eventName={event.name} />
      </div>
    </div>
  );
}

function RSVPSectionUI({ eventName }: { eventName: string }) {
  const { rsvpStatus, isLoading, error, handleConfirmAttendance, handleDeclineAttendance } = useBirthdayFeature();
  const [uiError, setUiError] = useState('');
  const [txLink, setTxLink] = useState('');
  const { isConnected } = useBirthdayProgram();

  const handleRSVP = async (status: 'coming' | 'busy') => {
    setUiError('');
    setTxLink('');

    if (!isConnected) {
      setUiError('Please connect your wallet');
      return;
    }

    try {
      const result =
        status === 'coming'
          ? await handleConfirmAttendance(eventName)
          : await handleDeclineAttendance(eventName);

      if (result.success) {
        setTxLink('success');
      } else {
        setUiError(result.error || 'Failed to update RSVP');
      }
    } catch (err) {
      setUiError('An unexpected error occurred');
    }
  };

  return (
    <div>
      <h4 className="text-lg font-bold text-white mb-4">Your RSVP</h4>

      {(uiError || error) && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
          {uiError || error}
        </div>
      )}

      <div className="flex gap-4 mb-4">
        <button
          onClick={() => handleRSVP('coming')}
          disabled={isLoading}
          className={`flex-1 py-3 rounded-lg font-bold transition duration-200 ${
            rsvpStatus === 'coming'
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-white/20 hover:bg-white/30 text-white'
          } disabled:opacity-50`}
        >
          {isLoading ? '⏳' : '✓'} I'm Coming
        </button>
        <button
          onClick={() => handleRSVP('busy')}
          disabled={isLoading}
          className={`flex-1 py-3 rounded-lg font-bold transition duration-200 ${
            rsvpStatus === 'busy'
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-white/20 hover:bg-white/30 text-white'
          } disabled:opacity-50`}
        >
          {isLoading ? '⏳' : '✗'} I'm Busy
        </button>
      </div>

      {txLink === 'success' && (
        <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm">
          ✅ RSVP updated!
        </div>
      )}
    </div>
  );
}

function CommentsSectionUI({ eventName }: { eventName: string }) {
  const { eventComments, isLoading, error, handleAddComment } = useBirthdayFeature();
  const { isConnected } = useBirthdayProgram();
  const [commentText, setCommentText] = useState('');
  const [uiError, setUiError] = useState('');
  const [txLink, setTxLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setUiError('');
    setTxLink('');

    if (!validateComment(commentText)) {
      setUiError(`Comment must be 1-${MAX_COMMENT_TEXT} characters`);
      return;
    }

    if (!isConnected) {
      setUiError('Please connect your wallet');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await handleAddComment(eventName, commentText);

      if (result.success) {
        setCommentText('');
        setTxLink('success');
      } else {
        setUiError(result.error || 'Failed to add comment');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h4 className="text-lg font-bold text-white mb-4">💬 Comments</h4>

      {(uiError || error) && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
          {uiError || error}
        </div>
      )}

      <div className="mb-6 space-y-2">
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value.slice(0, MAX_COMMENT_TEXT))}
          placeholder="Leave a birthday message..."
          maxLength={MAX_COMMENT_TEXT}
          rows={3}
          className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-gray-400 border border-white/30 focus:outline-none focus:border-blue-400 transition resize-none"
        />
        <p className="text-xs text-gray-400">
          {commentText.length}/{MAX_COMMENT_TEXT}
        </p>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || isLoading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-2 rounded-lg transition duration-200 disabled:opacity-50"
        >
          {isSubmitting || isLoading ? '⏳ Sending...' : '📤 Send Comment'}
        </button>
        {txLink === 'success' && (
          <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm">
            ✅ Comment added!
          </div>
        )}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {eventComments.length === 0 ? (
          <p className="text-gray-400 text-sm italic">
            No comments yet. Be the first to say happy birthday!
          </p>
        ) : (
          eventComments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white/10 rounded-lg p-3 border border-white/20 hover:border-white/40 transition"
            >
              <p className="text-sm text-blue-300 font-medium mb-1">
                {truncateAddress(comment.author)}
              </p>
              <p className="text-white text-sm">{comment.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function BirthdayInviteUI() {
  return (
    <div className="space-y-8">
      <CreateEventSection />
      <EventCardUI />
    </div>
  );
}
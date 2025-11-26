'use client';

import { BirthdayInviteUI } from '@/components/birthday/birthdayinvite-ui';

export default function BirthdayPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            🎉 Birthday Invitation
          </h1>
          <p className="text-lg sm:text-xl text-gray-200">
            Create birthday events, RSVP, and celebrate on-chain!
          </p>
        </div>

        {/* Main Content */}
        <BirthdayInviteUI />
      </div>
    </div>
  );
}
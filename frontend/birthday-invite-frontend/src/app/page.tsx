import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6 sm:p-8">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-6xl font-bold text-white mb-6">🎉 Birthday Invitation</h1>
        <p className="text-xl text-gray-200 mb-8">
          Create birthday events, RSVP, and celebrate on-chain with Solana!
        </p>
        <Link
          href="/birthday"
          className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-lg transition duration-200"
        >
          Get Started →
        </Link>
      </div>
    </main>
  );
}

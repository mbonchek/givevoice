import Link from 'next/link';
import PatternIndexClient from './PatternIndexClient';

export default function IndexPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-lg font-normal text-gray-500">givevoice.to</h1>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-16">
        <div className="mb-12">
          <h2 className="text-5xl font-light text-gray-900 mb-6">
            Pattern Index
          </h2>
          <p className="text-xl text-gray-600 font-light max-w-2xl" style={{ lineHeight: '1.8' }}>
            A comprehensive view of all patterns in PatternSpace.
          </p>
        </div>

        <PatternIndexClient />
      </main>
    </div>
  );
}

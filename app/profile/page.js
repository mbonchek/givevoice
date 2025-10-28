'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import UserMenu from '@/components/UserMenu';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hearts');
  const supabase = createClient();

  // Clean text for summaries by removing asterisked expressions
  const cleanForSummary = (text) => {
    return text.replace(/\*[^*]+\*/g, '').replace(/\s+/g, ' ').trim();
  };

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/auth';
        return;
      }

      setUser(user);

      const response = await fetch('/api/profile');
      const data = await response.json();
      setProfileData(data);
      setLoading(false);
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 font-light">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-8 py-6 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-lg font-normal text-gray-500">givevoice.to</h1>
          </Link>
          <UserMenu />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-16">
        <div className="mb-12">
          <h2 className="text-5xl font-light text-gray-900 mb-3">Your Profile</h2>
          <p className="text-gray-600 font-light text-lg">{user?.email}</p>
        </div>

        <div className="mb-8 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('hearts')}
              className={`py-4 px-1 border-b-2 font-light text-sm uppercase tracking-wide ${
                activeTab === 'hearts'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Hearts ({profileData?.hearts?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('voicings')}
              className={`py-4 px-1 border-b-2 font-light text-sm uppercase tracking-wide ${
                activeTab === 'voicings'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Voicings ({profileData?.voicings?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('explorations')}
              className={`py-4 px-1 border-b-2 font-light text-sm uppercase tracking-wide ${
                activeTab === 'explorations'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Explorations ({profileData?.explorations?.length || 0})
            </button>
          </nav>
        </div>

        <div className="space-y-4">
          {activeTab === 'hearts' && (
            <div className="space-y-4">
              {profileData?.hearts?.length === 0 ? (
                <div className="text-center py-12 text-gray-500 font-light">
                  No hearts yet. Heart a paragraph to see it here.
                </div>
              ) : (
                profileData?.hearts?.map((heart) => (
                  <div key={heart.id} className="border-b border-gray-200 pb-8 mb-8">
                    <Link
                      href={`/voicing/${heart.voicing_id}`}
                      className="text-xl font-light text-gray-900 hover:text-purple-600 mb-3 block transition-colors"
                    >
                      {heart.pattern_name}
                    </Link>
                    <p className="text-gray-700 font-light mb-3" style={{ fontSize: '1.0625rem', lineHeight: '1.8' }}>
                      {cleanForSummary(heart.paragraph_text)}
                    </p>
                    <p className="text-sm text-gray-500 font-light">
                      {new Date(heart.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'voicings' && (
            <div className="space-y-4">
              {profileData?.voicings?.length === 0 ? (
                <div className="text-center py-12 text-gray-500 font-light">
                  No voicings yet. Explore a pattern to see it here.
                </div>
              ) : (
                profileData?.voicings?.map((voicing) => (
                  <div key={voicing.id} className="border-b border-gray-200 pb-8 mb-8">
                    <Link
                      href={`/voicing/${voicing.id}`}
                      className="text-2xl font-light text-gray-900 hover:text-purple-600 mb-4 block transition-colors"
                    >
                      {voicing.pattern_name}
                    </Link>
                    <p className="text-gray-700 font-light mb-4 line-clamp-3" style={{ fontSize: '1.0625rem', lineHeight: '1.8' }}>
                      {cleanForSummary(voicing.voicing_text)}
                    </p>
                    <div className="flex justify-between items-center text-sm text-gray-500 font-light">
                      <span>
                        {new Date(voicing.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      <span>♥ {voicing.heart_count}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'explorations' && (
            <div className="space-y-4">
              {profileData?.explorations?.length === 0 ? (
                <div className="text-center py-12 text-gray-500 font-light">
                  No explorations yet. Highlight and explore text to see it here.
                </div>
              ) : (
                profileData?.explorations?.map((exploration) => (
                  <div key={exploration.id} className="border-b border-gray-200 pb-8 mb-8">
                    <div className="flex items-center gap-2 mb-3">
                      <Link
                        href={`/${exploration.from_pattern}`}
                        className="text-gray-900 hover:text-purple-600 font-light transition-colors"
                      >
                        {exploration.from_pattern}
                      </Link>
                      <span className="text-gray-400">→</span>
                      <Link
                        href={`/${exploration.to_pattern_slug}`}
                        className="text-gray-900 hover:text-purple-600 font-light transition-colors"
                      >
                        {exploration.to_pattern_slug}
                      </Link>
                    </div>
                    <p className="text-gray-700 font-light mb-3" style={{ fontSize: '1.0625rem', lineHeight: '1.8' }}>
                      Explored: &ldquo;{exploration.explored_phrase}&rdquo;
                    </p>
                    <p className="text-sm text-gray-500 font-light">
                      {new Date(exploration.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

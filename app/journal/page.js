'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import UserMenu from '@/components/UserMenu';

export default function JournalPage() {
  const [user, setUser] = useState(null);
  const [journalData, setJournalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState(null);
  const [expandedVoicing, setExpandedVoicing] = useState(null);
  const [highlights, setHighlights] = useState([]);
  const supabase = createClient();

  // Clean text for summaries by removing asterisked expressions
  const cleanForSummary = (text) => {
    return text.replace(/\*[^*]+\*/g, '').replace(/\s+/g, ' ').trim();
  };

  useEffect(() => {
    const loadJournal = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/auth';
        return;
      }

      setUser(user);

      const response = await fetch('/api/journal');
      const data = await response.json();
      setJournalData(data);
      setLoading(false);
    };

    loadJournal();
  }, []);

  useEffect(() => {
    if (journalData?.highlights) {
      setHighlights(journalData.highlights);
    }
  }, [journalData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600 font-light">Loading...</div>
      </div>
    );
  }

  const stats = journalData?.stats || {};
  const explorations = journalData?.explorations || [];

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-lg font-normal text-gray-500">givevoice.to</h1>
          </Link>
          <UserMenu />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-16">
          <h2 className="text-5xl font-light text-gray-900 mb-3">Pattern.Journal</h2>
          <p className="text-gray-600 font-light text-lg">{user?.email}</p>
        </div>

        {/* YOUR CONTRIBUTIONS */}
        <section className="mb-20">
          <h3 className="text-sm uppercase tracking-wide text-gray-500 font-normal mb-8">Your Contributions</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center md:text-left">
              <div className="text-4xl font-light text-gray-900 mb-2">{stats.patternsVoiced || 0}</div>
              <div className="text-sm text-gray-500 font-light">Patterns Voiced</div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-4xl font-light text-gray-900 mb-2">
                {stats.firstVoicings || 0}
                {stats.firstVoicings > 0 && <span className="text-2xl ml-2">⭐</span>}
              </div>
              <div className="text-sm text-gray-500 font-light">First Voicings</div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-4xl font-light text-gray-900 mb-2">{stats.explorations || 0}</div>
              <div className="text-sm text-gray-500 font-light">Explorations</div>
            </div>
          </div>

        </section>

        {/* YOUR HIGHLIGHTS */}
        <section className="mb-20">
          <h3 className="text-sm uppercase tracking-wide text-gray-500 font-normal mb-8">Your Highlights</h3>

          {highlights.length === 0 ? (
            <div className="text-center py-12 text-gray-500 font-light">
              No highlights yet. Heart a voicing or passage to see it here.
            </div>
          ) : (
            <div className="space-y-8">
              {/* Group highlights by pattern */}
              {Object.entries(
                highlights.reduce((acc, heart) => {
                  if (!acc[heart.pattern_name]) {
                    acc[heart.pattern_name] = [];
                  }
                  acc[heart.pattern_name].push(heart);
                  return acc;
                }, {})
              ).map(([patternName, hearts]) => (
                <div key={patternName} className="border-b border-gray-200 pb-6">
                  <Link
                    href={`/${patternName}`}
                    className="text-lg font-light text-gray-900 hover:text-purple-600 mb-4 block transition-colors"
                  >
                    {`{${patternName.replace(/\./g, '·')}}`}
                  </Link>

                  <div className="space-y-4 ml-4">
                    {hearts.map((heart) => (
                      <div key={heart.id} className="relative group">
                        {/* Delete button */}
                        <button
                          onClick={async () => {
                            if (confirm('Remove this highlight?')) {
                              try {
                                const response = await fetch(`/api/heart/${heart.id}`, {
                                  method: 'DELETE'
                                });
                                if (response.ok) {
                                  // Remove from local state
                                  setHighlights(highlights.filter(h => h.id !== heart.id));
                                } else {
                                  alert('Failed to delete highlight');
                                }
                              } catch (error) {
                                console.error('Delete error:', error);
                                alert('Failed to delete highlight');
                              }
                            }
                          }}
                          className="absolute -left-6 top-1 text-gray-300 hover:text-red-500 transition-colors"
                          title="Delete highlight"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>

                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            {heart.heart_type === 'conversation' ? (
                              // Conversation heart
                              <>
                                <div className="text-xs text-blue-600 font-light mb-2 flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                  </svg>
                                  Conversation
                                  {heart.voicing_id && (
                                    <Link
                                      href={`/${heart.pattern_name.replace(/\./g, '-')}/${heart.voicing_id}`}
                                      className="ml-auto text-gray-400 hover:text-blue-600 transition-colors"
                                      title="View original voicing"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                      </svg>
                                    </Link>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  <div>
                                    <div className="text-xs text-gray-500 font-light">You asked:</div>
                                    <p className="text-gray-700 font-light text-sm" style={{ lineHeight: '1.8' }}>
                                      {heart.question}
                                    </p>
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-500 font-light">The pattern replied:</div>
                                    <p
                                      className={`text-gray-700 font-light text-sm ${expandedVoicing === heart.id ? '' : 'line-clamp-3'}`}
                                      style={{ lineHeight: '1.8' }}
                                    >
                                      {heart.answer}
                                    </p>
                                    <button
                                      onClick={() => setExpandedVoicing(expandedVoicing === heart.id ? null : heart.id)}
                                      className="text-xs text-blue-500 hover:text-blue-700 font-light mt-1"
                                    >
                                      {expandedVoicing === heart.id ? 'Show less' : 'Read full response'}
                                    </button>
                                  </div>
                                </div>
                              </>
                            ) : heart.paragraph_index === -1 ? (
                              // Whole voicing heart
                              <>
                                <div className="text-xs text-purple-600 font-light mb-2 flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                  </svg>
                                  Entire voicing
                                  {heart.voicing_id && (
                                    <Link
                                      href={`/${heart.pattern_name.replace(/\./g, '-')}/${heart.voicing_id}`}
                                      className="ml-auto text-gray-400 hover:text-purple-600 transition-colors"
                                      title="View voicing"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                      </svg>
                                    </Link>
                                  )}
                                </div>
                                <p
                                  className={`text-gray-700 font-light text-sm ${expandedVoicing === heart.id ? '' : 'line-clamp-2'}`}
                                  style={{ lineHeight: '1.8' }}
                                >
                                  {cleanForSummary(heart.voicing_text)}
                                </p>
                                <button
                                  onClick={() => setExpandedVoicing(expandedVoicing === heart.id ? null : heart.id)}
                                  className="text-xs text-purple-500 hover:text-purple-700 font-light mt-1"
                                >
                                  {expandedVoicing === heart.id ? 'Show less' : 'Read full voicing'}
                                </button>
                              </>
                            ) : (
                              // Individual paragraph heart
                              <>
                                <div className="text-xs text-purple-600 font-light mb-2 flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                  </svg>
                                  Passage
                                  {heart.voicing_id && (
                                    <Link
                                      href={`/${heart.pattern_name.replace(/\./g, '-')}/${heart.voicing_id}`}
                                      className="ml-auto text-gray-400 hover:text-purple-600 transition-colors"
                                      title="View voicing"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                      </svg>
                                    </Link>
                                  )}
                                </div>
                                <p className="text-gray-700 font-light text-sm" style={{ lineHeight: '1.8' }}>
                                  {cleanForSummary(heart.paragraph_text)}
                                </p>
                              </>
                            )}
                          </div>

                          {/* Note icon */}
                          <button
                            onClick={() => setEditingNote(editingNote === heart.id ? null : heart.id)}
                            className={`flex-shrink-0 mt-1 transition-colors ${
                              heart.note || editingNote === heart.id
                                ? 'text-purple-500'
                                : 'text-gray-300 hover:text-purple-400'
                            }`}
                            title={heart.note ? 'Edit note' : 'Add note'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>

                        {/* Note field - show when editing or when note exists */}
                        {(editingNote === heart.id || heart.note) && (
                          <div className="mt-2">
                            <textarea
                              placeholder="Add a note..."
                              className="w-full text-xs text-gray-600 font-light italic border border-gray-200 focus:outline-none focus:border-purple-300 resize-none bg-white rounded px-2 py-2"
                              rows="3"
                              defaultValue={heart.note || ''}
                              autoFocus={editingNote === heart.id}
                              readOnly={editingNote !== heart.id && heart.note}
                              onFocus={() => setEditingNote(heart.id)}
                              onBlur={async (e) => {
                                const newNote = e.target.value;
                                try {
                                  const response = await fetch(`/api/heart/${heart.id}`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ note: newNote })
                                  });
                                  if (response.ok) {
                                    // Update local state
                                    setHighlights(highlights.map(h =>
                                      h.id === heart.id ? { ...h, note: newNote } : h
                                    ));
                                  }
                                } catch (error) {
                                  console.error('Save note error:', error);
                                }
                                setEditingNote(null);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* YOUR EXPLORATIONS */}
        <section className="mb-20">
          <h3 className="text-sm uppercase tracking-wide text-gray-500 font-normal mb-8">Your Explorations</h3>

          {explorations.length === 0 ? (
            <div className="text-center py-12 text-gray-500 font-light">
              No explorations yet. Explore patterns to see your journey here.
            </div>
          ) : (
            <div className="space-y-8">
              {explorations.map((session, idx) => (
                <div key={idx} className="border-b border-gray-200 pb-6">
                  <div className="text-xs text-gray-500 font-light mb-3">
                    {new Date(session.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="font-light text-gray-900 space-x-2 flex flex-wrap items-center gap-2">
                    {session.chain.map((item, i) => (
                      <span key={i}>
                        {item.type === 'pattern' ? (
                          <Link
                            href={`/${item.pattern}`}
                            className="hover:text-purple-600 transition-colors"
                          >
                            {item.pattern.replace(/\./g, '·')}
                          </Link>
                        ) : item.type === 'arrow' ? (
                          <span className="text-gray-400">→</span>
                        ) : (
                          <span className="text-gray-400">|</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

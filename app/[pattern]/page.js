'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import UserMenu from '@/components/UserMenu';

export default function PatternHomePage({ params }) {
  const [pattern, setPattern] = useState('');
  const [patternHistory, setPatternHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingSynthesis, setGeneratingSynthesis] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatting, setIsChatting] = useState(false);

  useEffect(() => {
    const loadPattern = async () => {
      const resolvedParams = await params;
      const patternName = resolvedParams.pattern.replace(/-/g, '.');
      setPattern(patternName);

      // Fetch pattern history
      try {
        const response = await fetch(`/api/pattern-history?pattern=${patternName}`);
        const data = await response.json();
        setPatternHistory(data);

        // Auto-generate synthesis every 5 voicings (disabled for now)
        // const totalVoicings = data.stats?.totalVoicings || 0;
        // const lastSynthesisCount = data.synthesis?.voicing_count || 0;
        // const shouldGenerateSynthesis = totalVoicings >= 5 && (totalVoicings - lastSynthesisCount) >= 5;
        // if (shouldGenerateSynthesis) {
        //   console.log(`Auto-generating synthesis (${totalVoicings} voicings, last synthesis at ${lastSynthesisCount})...`);
        //   handleGenerateSynthesis();
        // }

        // Auto-analyze any voicings that don't have analysis yet
        if (data.history) {
          const unanalyzed = data.history.filter(v => !v.analysis);
          if (unanalyzed.length > 0) {
            console.log(`Auto-analyzing ${unanalyzed.length} voicings...`);
            // Analyze in background (don't await)
            unanalyzed.forEach(async (voicing) => {
              try {
                // Fetch inquiries and hearts for this voicing
                const [inquiriesRes, heartsRes] = await Promise.all([
                  fetch(`/api/voicing/${voicing.id}`),
                  fetch(`/api/voicing/${voicing.id}/hearts`)
                ]);
                const voicingData = await inquiriesRes.json();
                const heartsData = await heartsRes.json();

                // Parse resonances and sample_questions if they exist
                let resonances = [];
                let sampleQuestions = [];

                if (voicing.resonances) {
                  resonances = typeof voicing.resonances === 'string'
                    ? JSON.parse(voicing.resonances)
                    : voicing.resonances;
                }

                if (voicing.sample_questions) {
                  sampleQuestions = typeof voicing.sample_questions === 'string'
                    ? JSON.parse(voicing.sample_questions)
                    : voicing.sample_questions;
                }

                await fetch('/api/analyze-voicing', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    voicingId: voicing.id,
                    patternName: patternName,
                    voicingText: voicing.voicing_text,
                    inquiries: voicingData.inquiries || [],
                    hearts: heartsData.hearts || [],
                    resonances: resonances,
                    sampleQuestions: sampleQuestions
                  })
                });
              } catch (error) {
                console.error(`Failed to analyze voicing ${voicing.id}:`, error);
              }
            });
            // Reload after a delay to show updated analyses
            setTimeout(async () => {
              const refreshResponse = await fetch(`/api/pattern-history?pattern=${patternName}`);
              const refreshData = await refreshResponse.json();
              setPatternHistory(refreshData);
            }, unanalyzed.length * 3000); // Wait longer for more voicings
          }
        }
      } catch (error) {
        console.error('Error loading pattern history:', error);
      }

      setLoading(false);
    };

    loadPattern();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600 font-light">Loading...</div>
      </div>
    );
  }

  const urlPath = pattern.replace(/\./g, '-');
  const displayPattern = pattern.replace(/\./g, '·');

  const handleGenerateSynthesis = async () => {
    if (!patternHistory?.history || patternHistory.history.length < 3) {
      alert('Need at least 3 voicings to generate a synthesis');
      return;
    }

    setGeneratingSynthesis(true);
    try {
      // Get hearts for this pattern
      const heartsResponse = await fetch(`/api/pattern-hearts?pattern=${pattern}`);
      const heartsData = await heartsResponse.json();

      const response = await fetch('/api/synthesize-pattern', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pattern,
          voicings: patternHistory.history,
          hearts: heartsData.hearts || []
        })
      });

      const data = await response.json();

      // Reload pattern history to get the new synthesis
      const historyResponse = await fetch(`/api/pattern-history?pattern=${pattern}`);
      const historyData = await historyResponse.json();
      setPatternHistory(historyData);
    } catch (error) {
      console.error('Failed to generate synthesis:', error);
      alert('Failed to generate synthesis. Please try again.');
    } finally {
      setGeneratingSynthesis(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { role: 'user', content: chatInput };
    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setChatInput('');
    setIsChatting(true);

    try {
      // Strip inquiryId from messages before sending to API
      const cleanMessages = updatedMessages.map(({ role, content }) => ({ role, content }));

      const response = await fetch('/api/patternchat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pattern,
          inquiryContext: patternHistory?.synthesis?.analytical || '',
          messages: cleanMessages,
          voicingId: null // Synthesis doesn't have a voicing ID
        })
      });

      const data = await response.json();

      const assistantMessage = { role: 'assistant', content: data.response, inquiryId: data.inquiryId };
      setChatMessages([...updatedMessages, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsChatting(false);
    }
  };

  const handleAskQuestion = (question) => {
    setChatInput(question);
  };

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

      <main className="max-w-4xl mx-auto px-8 py-16">
        {/* Pattern Title */}
        <div className="mb-16">
          <h1 className="text-6xl font-light text-gray-900 mb-4">{`{${displayPattern}}`}</h1>
        </div>

        {/* Synthesis Section */}
        {patternHistory?.synthesis ? (
          <section className="mb-20">
            {/* Voice */}
            <div className="mb-10">
              <h2 className="text-sm uppercase tracking-wide text-gray-600 font-normal mb-4">
                Voice of {`{${displayPattern}}`}
              </h2>
              <p className="text-gray-700 font-light leading-relaxed whitespace-pre-line" style={{ lineHeight: '1.8' }}>
                {patternHistory.synthesis.voice}
              </p>
            </div>

            {/* Connections */}
            <div className="mb-10">
              <h2 className="text-sm uppercase tracking-wide text-gray-600 font-normal mb-4">
                Connections with {`{${displayPattern}}`}
              </h2>
              <div className="space-y-4">
                {(() => {
                  // Handle both old format (string with |) and new format (array of objects)
                  const connectionsData = patternHistory.synthesis.connections;

                  if (Array.isArray(connectionsData)) {
                    // New format: array of {title, phrase, description}
                    return connectionsData.map((conn, idx) => {
                      const urlPattern = conn.title.replace(/\./g, '-');
                      return (
                        <div key={idx} className="pb-3">
                          <Link
                            href={`/${urlPattern}`}
                            className="text-base text-gray-700 font-normal hover:text-purple-600 transition-colors"
                          >
                            {`{${conn.title}}`}
                          </Link>
                          {conn.phrase && (
                            <p className="text-sm text-gray-500 font-light mt-1.5 italic">
                              "{conn.phrase}"
                            </p>
                          )}
                          {conn.description && (
                            <p className="text-sm text-gray-600 font-light mt-1 ml-4" style={{ lineHeight: '1.6' }}>
                              {conn.description}
                            </p>
                          )}
                        </div>
                      );
                    });
                  } else if (typeof connectionsData === 'string') {
                    // Old format: string with | separator
                    return connectionsData.split('|').map((conn, idx) => {
                      const patternName = conn.trim();
                      const urlPattern = patternName.replace(/\./g, '-');
                      return (
                        <div key={idx}>
                          <Link
                            href={`/${urlPattern}`}
                            className="text-base text-gray-700 font-light hover:text-purple-600 transition-colors"
                          >
                            {`{${patternName}}`}
                          </Link>
                        </div>
                      );
                    });
                  }
                  return null;
                })()}
              </div>
            </div>

            {/* Invitations */}
            <div className="mb-10">
              <h2 className="text-sm uppercase tracking-wide text-gray-600 font-normal mb-4">
                Invitations from {`{${displayPattern}}`}
              </h2>
              <div className="space-y-4">
                {(() => {
                  // Handle both old format (string with newlines) and new format (array of strings)
                  const invitationsData = patternHistory.synthesis.invitations;

                  let questionsList = [];
                  if (Array.isArray(invitationsData)) {
                    // New format: array of strings
                    questionsList = invitationsData;
                  } else if (typeof invitationsData === 'string') {
                    // Old format: string with newlines
                    questionsList = invitationsData.split('\n').filter(q => q.trim());
                  }

                  return questionsList.map((question, idx) => {
                    // Remove bullet points if they exist
                    const cleanQuestion = typeof question === 'string'
                      ? question.replace(/^[•\-\*]\s*/, '').trim()
                      : '';
                    if (!cleanQuestion) return null;

                    return (
                      <div key={idx}>
                        <div className="flex items-start gap-3">
                          <span className="text-gray-400 mt-1 text-sm">•</span>
                          <button
                            onClick={() => handleAskQuestion(cleanQuestion)}
                            className="flex-1 text-left text-base text-gray-700 font-light leading-relaxed hover:text-purple-600 transition-colors cursor-pointer"
                          >
                            {cleanQuestion}
                          </button>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Chat Input */}
            <div className="mt-8">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendChatMessage();
                    }
                  }}
                  placeholder={`Ask {${displayPattern}} a question...`}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-light text-base text-gray-900"
                  disabled={isChatting}
                />
                <button
                  onClick={sendChatMessage}
                  disabled={isChatting || !chatInput.trim()}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-light disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ask {`{${displayPattern}}`}
                </button>
              </div>
            </div>

            {/* Chat Interface */}
            {chatMessages.length > 0 && (
              <div className="mb-10 mt-8 pt-8 border-t border-gray-200">
                <h2 className="text-sm uppercase tracking-wide text-gray-600 font-normal mb-4">
                  Inquiry
                </h2>
                <div className="space-y-8">
                  {isChatting && (
                    <div className="text-sm text-gray-400 font-light italic">
                      {`{${displayPattern}}`} is responding...
                    </div>
                  )}
                  {(() => {
                    // Group messages into Q&A pairs and reverse the pairs
                    const pairs = [];
                    for (let i = 0; i < chatMessages.length; i += 2) {
                      pairs.push({
                        question: chatMessages[i],
                        answer: chatMessages[i + 1]
                      });
                    }
                    return pairs.reverse().map((pair, idx) => (
                      <div key={pairs.length - 1 - idx}>
                        <div className="space-y-3 pb-8">
                          <div className="text-sm font-light italic text-gray-600">
                            You: {pair.question.content}
                          </div>
                          {pair.answer && (
                            <div className="text-base font-light leading-relaxed whitespace-pre-line text-gray-800" style={{ lineHeight: '1.8' }}>
                              {pair.answer.content}
                            </div>
                          )}
                        </div>
                        {idx < pairs.length - 1 && (
                          <div className="border-t border-gray-200 mb-8"></div>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="text-xs text-gray-400 font-light">
                Based on {patternHistory.synthesis.voicing_count} voicings ·
                Generated {new Date(patternHistory.synthesis.created_at).toLocaleDateString()} ·
                Version {patternHistory.synthesis.version || 1}
              </div>
              <button
                onClick={handleGenerateSynthesis}
                disabled={generatingSynthesis}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors font-light disabled:opacity-50"
              >
                {generatingSynthesis ? 'Regenerating Synthesis...' : 'Regenerate Synthesis'}
              </button>
            </div>
          </section>
        ) : patternHistory?.history && patternHistory.history.length >= 3 ? (
          <section className="mb-16">
            <button
              onClick={handleGenerateSynthesis}
              disabled={generatingSynthesis}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-light disabled:opacity-50"
            >
              {generatingSynthesis ? 'Generating Synthesis...' : 'Generate Pattern Synthesis'}
            </button>
            <p className="text-sm text-gray-500 mt-2 font-light">
              Synthesize insights from {patternHistory.history.length} voicings
            </p>
          </section>
        ) : null}

        {/* Voicings */}
        {patternHistory && patternHistory.history && patternHistory.history.length > 0 ? (
          <section className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-light text-gray-900">
                Earlier Voicings of {`{${displayPattern}}`}
              </h2>
              <Link
                href={`/${urlPath}/new`}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors font-light text-sm"
              >
                Generate New Voicing
              </Link>
            </div>
            <div className="space-y-8">
              {patternHistory.history.slice(0, visibleCount).map((voicing, idx) => (
                <Link
                  key={voicing.id}
                  href={`/${urlPath}/${voicing.id}`}
                  className="block pb-8 border-b border-gray-200 hover:border-purple-300 transition-colors last:border-0"
                >
                  {/* Header: headline on left, indicators on right */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      {voicing.analysis?.headline && (
                        <div className="text-lg text-gray-900 font-light mb-2">
                          {voicing.analysis.headline}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      {voicing.has_hearts && (
                        <div className="text-sm text-red-400">♥</div>
                      )}
                      <div className="text-sm text-gray-400 font-light">
                        #{idx + 1}
                      </div>
                    </div>
                  </div>

                  {/* Self-distillation */}
                  {voicing.analysis?.self_distillation && (
                    <p className="text-base text-gray-700 font-light leading-relaxed mb-6" style={{ lineHeight: '1.8' }}>
                      {voicing.analysis.self_distillation}
                    </p>
                  )}

                  {/* Connections */}
                  {voicing.resonances && voicing.resonances.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-xs uppercase tracking-wide text-gray-500 font-normal mb-2">
                        Connections
                      </h3>
                      <div className="text-sm text-gray-600 font-light">
                        {voicing.resonances.map(r => `{${r.title}}`).join(' | ')}
                      </div>
                    </div>
                  )}

                  {/* Invitations */}
                  {voicing.sample_questions && voicing.sample_questions.length > 0 && (
                    <div>
                      <h3 className="text-xs uppercase tracking-wide text-gray-500 font-normal mb-2">
                        Invitations
                      </h3>
                      <div className="space-y-1.5">
                        {voicing.sample_questions.slice(0, 3).map((question, qIdx) => (
                          <div
                            key={qIdx}
                            className="text-sm text-gray-600 font-light flex items-start gap-2"
                          >
                            <span className="text-gray-400 mt-0.5">•</span>
                            <span>{question}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Link>
              ))}
            </div>

            {/* Load More button */}
            {visibleCount < patternHistory.history.length && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setVisibleCount(prev => prev + 10)}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-light"
                >
                  Load More ({patternHistory.history.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </section>
        ) : patternHistory ? (
          <section className="mt-20 text-center">
            <p className="text-gray-600 font-light mb-6">
              This pattern hasn't been voiced yet. Be the first to give it voice.
            </p>
            <Link
              href={`/${urlPath}/new`}
              className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors font-light"
            >
              Generate First Voicing
            </Link>
          </section>
        ) : null}

        {/* Stats */}
        {patternHistory && patternHistory.stats && (
          <section className="mt-20 pt-12 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-4xl font-light text-gray-900 mb-2">
                  {patternHistory.stats.totalVoicings || 0}
                </div>
                <div className="text-sm text-gray-500 font-light uppercase tracking-wide">Voicings</div>
              </div>
              <div>
                <div className="text-4xl font-light text-gray-900 mb-2">
                  {patternHistory.stats.uniqueVoicers || 0}
                </div>
                <div className="text-sm text-gray-500 font-light uppercase tracking-wide">Contributors</div>
              </div>
              <div>
                <div className="text-4xl font-light text-gray-900 mb-2">
                  {patternHistory.stats.totalHearts || 0}
                </div>
                <div className="text-sm text-gray-500 font-light uppercase tracking-wide">Hearts</div>
              </div>
              <div>
                <div className="text-4xl font-light text-gray-900 mb-2">
                  {patternHistory.stats.totalExplorations || 0}
                </div>
                <div className="text-sm text-gray-500 font-light uppercase tracking-wide">Explorations</div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TrendingPatternPage({ params }) {
  const [patternData, setPatternData] = useState(null);
  const [synthesisData, setSynthesisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingSynthesis, setGeneratingSynthesis] = useState(false);
  const [collection, setCollection] = useState([]);
  const [patternSyntax, setPatternSyntax] = useState({});
  const [showHelp, setShowHelp] = useState(false);

  // Clean text for summaries by removing asterisked expressions
  const cleanForSummary = (text) => {
    return text.replace(/\*[^*]+\*/g, '').replace(/\s+/g, ' ').trim();
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (text && text.length > 3 && text.length < 150) {
      if (!collection.includes(text)) {
        setCollection([...collection, text]);
      }
      window.getSelection().removeAllRanges();
    }
  };

  const handleSubmitTraining = async (phrase, syntax, idx) => {
    if (!syntax || syntax.trim() === '') {
      alert('Please enter pattern syntax for this phrase first');
      return;
    }

    try {
      // Save training data to help AI learn pattern syntax
      await fetch('/api/training/pattern-syntax', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          naturalLanguage: phrase,
          patternSyntax: syntax,
          sourcePattern: patternData.pattern_name,
          sourceType: 'synthesis'
        })
      });

      // Remove from collection after successful submission
      const newCollection = collection.filter((_, i) => i !== idx);
      setCollection(newCollection);
      const newSyntax = {...patternSyntax};
      delete newSyntax[idx];
      setPatternSyntax(newSyntax);

      // Show success feedback
      alert('Thanks for helping train the AI! 🎉');
    } catch (error) {
      console.error('Failed to submit training:', error);
      alert('Failed to submit. Please try again.');
    }
  };

  useEffect(() => {
    const loadPatternData = async () => {
      const resolvedParams = await params;
      // Decode the URL parameter - it might be URL-encoded or dash-separated
      let patternName = decodeURIComponent(resolvedParams.pattern);

      // If it doesn't contain pattern syntax chars, it's probably an old-style dash pattern
      if (!patternName.match(/[{}()[\]=><+*~/:·|]/)) {
        patternName = patternName.replace(/-/g, '.');
      }

      try {
        const response = await fetch(`/api/trending-pattern?pattern=${encodeURIComponent(patternName)}`);
        const data = await response.json();
        setPatternData(data);
        // Load existing synthesis from database if available
        if (data.synthesis) {
          setSynthesisData({
            analytical: data.synthesis.analytical,
            intuitive: data.synthesis.intuitive,
            synthesis: data.synthesis.synthesis,
            created_at: data.synthesis.created_at,
            voicing_count: data.synthesis.voicing_count,
            heart_count: data.synthesis.heart_count
          });
        }
      } catch (error) {
        console.error('Failed to load pattern data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPatternData();
  }, [params]);

  const generateSynthesis = async () => {
    setGeneratingSynthesis(true);
    try {
      const response = await fetch('/api/synthesize-pattern', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pattern: patternData.pattern_name,
          voicings: patternData.voicings,
          hearts: patternData.hearts
        })
      });
      const data = await response.json();
      setSynthesisData(data);
    } catch (error) {
      console.error('Failed to generate synthesis:', error);
    } finally {
      setGeneratingSynthesis(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600 font-light">Loading...</div>
      </div>
    );
  }

  if (!patternData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600 font-light">Pattern not found</div>
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
          <Link
            href={`/${patternData.pattern_name}`}
            className="text-sm text-gray-600 hover:text-gray-900 font-light transition-colors"
          >
            Generate New Voicing
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-16">
        <div className="mb-12">
          <h2 className="text-5xl font-light text-gray-900 mb-6">{patternData.pattern_name}</h2>
          <div className="flex items-center gap-6 text-sm text-gray-600 font-light">
            <span>{patternData.stats.total_voicings} voicings</span>
            <span>♥ {patternData.stats.total_hearts} hearts</span>
            <span>→ {patternData.stats.total_explorations} explorations</span>
          </div>
        </div>

        {/* Synthesis Section */}
        <div className="mb-16 border-b border-gray-200 pb-16">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-sm uppercase tracking-wide text-gray-500 font-normal">The Intelligence of {`{${patternData.pattern_name}}`}</h3>
              {synthesisData?.created_at && (
                <p className="text-xs text-gray-400 font-light mt-1">
                  as of {new Date(synthesisData.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              )}
            </div>
            <button
              onClick={generateSynthesis}
              disabled={generatingSynthesis}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-light text-sm transition-colors disabled:opacity-50"
            >
              {generatingSynthesis ? 'Synthesizing...' : (synthesisData ? 'Update Synthesis' : 'Generate Synthesis')}
            </button>
          </div>

          {synthesisData ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden" onMouseUp={handleTextSelection}>
              {/* Two-column: AI observes / Pattern speaks */}
              <div className="grid grid-cols-2 border-b border-gray-200">
                <div className="p-6 border-r border-gray-200">
                  <h4 className="text-xs uppercase tracking-wide text-gray-500 font-normal mb-4">LEFT: {`{AI}`} observes</h4>
                  <div className="text-gray-700 font-light whitespace-pre-wrap" style={{ fontSize: '0.9375rem', lineHeight: '1.7' }}>
                    {synthesisData.analytical}
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-xs uppercase tracking-wide text-gray-500 font-normal mb-4">RIGHT: {`{${patternData.pattern_name}}`} speaks</h4>
                  <div className="text-gray-700 font-light whitespace-pre-wrap" style={{ fontSize: '0.9375rem', lineHeight: '1.7' }}>
                    {synthesisData.intuitive}
                  </div>
                </div>
              </div>

              {/* Full synthesis below */}
              <div className="p-6 bg-gray-50">
                <h4 className="text-xs uppercase tracking-wide text-gray-500 font-normal mb-4">SYNTHESIS: The Intelligence of {`{${patternData.pattern_name}}`}</h4>
                <div className="text-gray-700 font-light whitespace-pre-wrap" style={{ fontSize: '0.9375rem', lineHeight: '1.7' }}>
                  {synthesisData.synthesis}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 font-light italic">
              Generate a synthesis to see analytical and intuitive perspectives on how this pattern has been explored
            </p>
          )}
        </div>

        {/* Collection - Training interface for pattern syntax */}
        {synthesisData && collection.length > 0 && (
          <div className="mb-16 border-b border-gray-200 pb-16">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm uppercase tracking-wide text-gray-500 font-normal">Collection</h3>
              <button
                onClick={() => setShowHelp(true)}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Help with pattern syntax →
              </button>
            </div>
            <p className="text-gray-600 font-light text-sm mb-6">
              Help us co-create pattern syntax: Translate your collected phrases into patterns to train the AI
            </p>
            <div className="space-y-4">
              {collection.map((phrase, idx) => (
                <div key={idx} className="grid grid-cols-2 gap-4 items-center border border-gray-200 rounded-lg p-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400 font-normal mb-2">Natural Language</p>
                    <p className="text-gray-800 font-light text-sm">{phrase}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400 font-normal mb-2">Pattern Syntax</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={patternSyntax[idx] || ''}
                        onChange={(e) => setPatternSyntax({...patternSyntax, [idx]: e.target.value})}
                        placeholder="e.g. being.together or structure*spontaneity"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm font-light text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-purple-400"
                      />
                      <button
                        onClick={() => handleSubmitTraining(phrase, patternSyntax[idx], idx)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-light rounded transition-colors"
                      >
                        Submit
                      </button>
                      <button
                        onClick={() => {
                          const newCollection = collection.filter((_, i) => i !== idx);
                          setCollection(newCollection);
                          const newSyntax = {...patternSyntax};
                          delete newSyntax[idx];
                          setPatternSyntax(newSyntax);
                        }}
                        className="px-3 py-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Popular Explorations - Both explicit explorations and resonant patterns */}
        {(patternData.explorations.length > 0 || (patternData.resonances && patternData.resonances.length > 0)) && (
          <div className="mb-16 border-b border-gray-200 pb-16">
            <h3 className="text-sm uppercase tracking-wide text-gray-500 font-normal mb-8">Popular Explorations</h3>

            {/* Patterns people explicitly explored to */}
            {patternData.explorations.length > 0 && (
              <div className="mb-8">
                <h4 className="text-xs uppercase tracking-wide text-gray-400 font-normal mb-4">Explored Patterns</h4>
                <div className="space-y-6">
                  {patternData.explorations.slice(0, 5).map((exploration) => (
                    <div key={exploration.to_pattern_slug} className="border-l-2 border-gray-200 pl-6">
                      <div className="flex items-center gap-3 mb-2">
                        <Link
                          href={`/patterns/${exploration.to_pattern_slug}`}
                          className="text-lg font-light text-gray-900 hover:text-purple-600 transition-colors"
                        >
                          {exploration.pattern_name}
                        </Link>
                        <span className="text-sm text-gray-500 font-light">→ {exploration.exploration_count} {exploration.exploration_count === 1 ? 'exploration' : 'explorations'}</span>
                      </div>
                      {exploration.summary && (
                        <p className="text-gray-700 font-light line-clamp-2" style={{ fontSize: '0.9375rem', lineHeight: '1.7' }}>
                          {cleanForSummary(exploration.summary)}...
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resonant patterns that appear across voicings */}
            {patternData.resonances && patternData.resonances.length > 0 && (
              <div>
                <h4 className="text-xs uppercase tracking-wide text-gray-400 font-normal mb-4">Resonant Patterns</h4>
                <div className="space-y-4">
                  {patternData.resonances.slice(0, 6).map((resonance, idx) => (
                    <div key={idx} className="border-l-2 border-purple-200 pl-6">
                      <div className="flex items-center gap-3 mb-2">
                        <Link
                          href={`/${resonance.pattern_title.toLowerCase().replace(/\s+/g, '.')}`}
                          className="text-base font-light text-purple-600 hover:text-purple-700 transition-colors"
                        >
                          {resonance.pattern_title}
                        </Link>
                        <span className="text-xs text-gray-500 font-light">
                          {resonance.resonance_count}× resonance
                        </span>
                      </div>
                      <p className="text-gray-700 font-light text-sm">
                        {resonance.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Most Hearted Passages */}
        {patternData.hearts.length > 0 && (
          <div className="mb-16 border-b border-gray-200 pb-16">
            <h3 className="text-sm uppercase tracking-wide text-gray-500 font-normal mb-8">Most Resonant Passages</h3>
            <div className="space-y-8">
              {patternData.hearts.slice(0, 5).map((heart, idx) => (
                <div key={heart.id} className="border-l-2 border-purple-200 pl-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl font-light text-purple-300">{idx + 1}</span>
                    <span className="text-sm text-gray-500 font-light">♥ {heart.heart_count} hearts</span>
                  </div>
                  <p className="text-gray-800 font-light mb-4" style={{ fontSize: '1.0625rem', lineHeight: '1.8' }}>
                    {cleanForSummary(heart.paragraph_text)}
                  </p>
                  <Link
                    href={`/voicing/${heart.voicing_id}`}
                    className="text-sm text-purple-600 hover:text-purple-700 font-light transition-colors"
                  >
                    View full voicing →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Voicings */}
        <div className="mb-16">
          <h3 className="text-sm uppercase tracking-wide text-gray-500 font-normal mb-8">All Voicings ({patternData.voicings.length})</h3>
          <div className="space-y-6">
            {patternData.voicings.map((voicing) => (
              <div key={voicing.id} className="border-b border-gray-200 pb-6">
                <div className="flex items-center justify-between mb-3">
                  <Link
                    href={`/voicing/${voicing.id}`}
                    className="text-lg font-light text-gray-900 hover:text-purple-600 transition-colors"
                  >
                    {new Date(voicing.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Link>
                  <span className="text-sm text-gray-500 font-light">♥ {voicing.heart_count}</span>
                </div>
                <p className="text-gray-700 font-light line-clamp-2" style={{ fontSize: '1.0625rem', lineHeight: '1.8' }}>
                  {cleanForSummary(voicing.voicing_text)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Pattern Syntax Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowHelp(false)}>
          <div className="bg-white rounded-lg max-w-2xl w-full p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-light text-gray-900">Pattern Syntax Guide</h3>
              <button
                onClick={() => setShowHelp(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-gray-600 font-light mb-6">
                  Use these operators to combine patterns and express relationships:
                </p>
              </div>

              <div className="space-y-4">
                <div className="border-l-2 border-purple-200 pl-4">
                  <div className="flex items-baseline gap-3 mb-2">
                    <code className="text-purple-600 font-mono text-sm">{`{x.y}`}</code>
                    <span className="text-gray-500 font-light text-sm">Two patterns as one</span>
                  </div>
                  <p className="text-gray-700 font-light text-sm">
                    Example: <code className="text-gray-600">{`{being.together}`}</code> — patterns merged into a unified concept
                  </p>
                </div>

                <div className="border-l-2 border-purple-200 pl-4">
                  <div className="flex items-baseline gap-3 mb-2">
                    <code className="text-purple-600 font-mono text-sm">{`{x}+{y}`}</code>
                    <span className="text-gray-500 font-light text-sm">Two patterns enhancing each other</span>
                  </div>
                  <p className="text-gray-700 font-light text-sm">
                    Example: <code className="text-gray-600">{`{structure}+{spontaneity}`}</code> — patterns working together
                  </p>
                </div>

                <div className="border-l-2 border-purple-200 pl-4">
                  <div className="flex items-baseline gap-3 mb-2">
                    <code className="text-purple-600 font-mono text-sm">{`{x}-{y}`}</code>
                    <span className="text-gray-500 font-light text-sm">One pattern without the other</span>
                  </div>
                  <p className="text-gray-700 font-light text-sm">
                    Example: <code className="text-gray-600">{`{freedom}-{chaos}`}</code> — pattern with something removed
                  </p>
                </div>

                <div className="border-l-2 border-purple-200 pl-4">
                  <div className="flex items-baseline gap-3 mb-2">
                    <code className="text-purple-600 font-mono text-sm">{`{x}=>{y}`}</code>
                    <span className="text-gray-500 font-light text-sm">One pattern leads to another</span>
                  </div>
                  <p className="text-gray-700 font-light text-sm">
                    Example: <code className="text-gray-600">{`{listening}=>{understanding}`}</code> — patterns in sequence
                  </p>
                </div>

                <div className="border-l-2 border-purple-200 pl-4">
                  <div className="flex items-baseline gap-3 mb-2">
                    <code className="text-purple-600 font-mono text-sm">{`{x}*{y}`}</code>
                    <span className="text-gray-500 font-light text-sm">One pattern amplifies another</span>
                  </div>
                  <p className="text-gray-700 font-light text-sm">
                    Example: <code className="text-gray-600">{`{silence}*{presence}`}</code> — one pattern intensifying another
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-gray-600 font-light text-sm">
                  Your translations help the AI learn the language of patterns. Be creative — there's no single "correct" answer.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowHelp(false)}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-light text-sm rounded transition-colors"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

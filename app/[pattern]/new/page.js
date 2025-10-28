'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import UserMenu from '@/components/UserMenu';

export default function PatternPage({ params }) {
  const [pattern, setPattern] = useState('');
  const [newVoicing, setNewVoicing] = useState(null);
  const [resonances, setResonances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [collection, setCollection] = useState([]);
  const [highlighted, setHighlighted] = useState([]);
  const [revealedParagraphs, setRevealedParagraphs] = useState(0);
  const [heartedParagraphs, setHeartedParagraphs] = useState([]);
  const [showAllResonances, setShowAllResonances] = useState(false);
  const [isWholeVoicingHearted, setIsWholeVoicingHearted] = useState(false);
  const [showResonances, setShowResonances] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [heartedMessages, setHeartedMessages] = useState([]);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState(null);
  const [sampleQuestions, setSampleQuestions] = useState([]);
  const [patternHistory, setPatternHistory] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const toggleHeart = async (paragraphText, idx) => {
    setHeartedParagraphs(prev => {
      if (prev.includes(paragraphText)) {
        return prev.filter(p => p !== paragraphText);
      } else {
        // Save to database when adding heart
        if (newVoicing) {
          fetch('/api/heart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              voicingId: newVoicing.id,
              paragraphIndex: idx,
              paragraphText: paragraphText
            })
          }).catch(error => {
            console.error('Failed to save heart:', error);
          });
        }
        return [...prev, paragraphText];
      }
    });
  };

  // Pattern highlights for loading exploration
  const patternHighlights = {
    'anticipation': [
      'the shiver before the unveiling',
      'that electric gap between promise and presence',
      'the gathering tension of what wants to arrive',
      'holding space for emergence',
      'the fertile pause before becoming'
    ],
    'patience': [
      'the art of staying present with what is not yet',
      'trust in the rhythm of unfolding',
      'making space for natural timing',
      'the quiet power of allowing'
    ],
    'curiosity': [
      'leaning into the unknown with delight',
      'that pull toward what we cannot yet name',
      'the appetite for deeper seeing',
      'wonder as a form of attention'
    ]
  };

  const [currentPatternKey, setCurrentPatternKey] = useState('anticipation');
  const [currentHighlightIndex, setCurrentHighlightIndex] = useState(0);

  // Navigation functions for loading highlights
  const navigateHighlight = (direction) => {
    const highlights = patternHighlights[currentPatternKey];
    if (direction === 'left') {
      setCurrentHighlightIndex(prev => (prev - 1 + highlights.length) % highlights.length);
    } else if (direction === 'right') {
      setCurrentHighlightIndex(prev => (prev + 1) % highlights.length);
    } else if (direction === 'down') {
      const patternKeys = Object.keys(patternHighlights);
      const currentIndex = patternKeys.indexOf(currentPatternKey);
      const nextIndex = (currentIndex + 1) % patternKeys.length;
      setCurrentPatternKey(patternKeys[nextIndex]);
      setCurrentHighlightIndex(0);
    }
  };

  // Keyboard navigation for loading screen
  useEffect(() => {
    if (!isLoading) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateHighlight('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateHighlight('right');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        navigateHighlight('down');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoading, currentPatternKey]);

  const splitLongParagraphs = (text) => {
    // Split into sentences while preserving paragraph structure
    const paragraphs = text.split('\n\n');
    const result = [];

    paragraphs.forEach((para, paraIdx) => {
      const sentences = para.match(/[^.!?]+[.!?]+/g) || [para];
      sentences.forEach((sentence, sentIdx) => {
        const trimmed = sentence.trim();
        if (trimmed.length > 0) {
          result.push({
            text: trimmed,
            isFirstInParagraph: sentIdx === 0,
            isLastInParagraph: sentIdx === sentences.length - 1
          });
        }
      });
    });

    return result;
  };

  useEffect(() => {
    const initialize = async () => {
      const resolvedParams = await params;
      const patternName = resolvedParams.pattern.replace(/-/g, '.');
      setPattern(patternName);

      await loadPattern(patternName);
      await loadPatternHistory(patternName);

      // Check for question URL parameter
      const urlParams = new URLSearchParams(window.location.search);
      const questionParam = urlParams.get('question');
      if (questionParam) {
        setChatInput(questionParam);
      }
    };
    initialize();
  }, [params]);

  const loadPatternHistory = async (patternName) => {
    try {
      const response = await fetch(`/api/pattern-history?pattern=${encodeURIComponent(patternName)}`);
      const data = await response.json();
      setPatternHistory(data);
    } catch (error) {
      console.error('Failed to load pattern history:', error);
    }
  };

  const loadPattern = async (patternName) => {
    setIsLoading(true);
    setRevealedParagraphs(0);
    try {
      const genResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pattern: patternName })
      });

      const genData = await genResponse.json();

      // Check for errors
      if (genData.error || !genData.voicing) {
        console.error('Generation failed:', genData.error || 'No voicing returned');
        setIsLoading(false);
        alert('Failed to generate voicing. Please try again.');
        return;
      }

      const freshVoicing = genData.voicing;

      setNewVoicing(freshVoicing);
      setIsLoading(false);

      if (freshVoicing) {
        const paragraphs = splitLongParagraphs(freshVoicing.voicing_text);

        // Reveal sentences sequentially
        for (let i = 0; i < paragraphs.length; i++) {
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 800));
          }
          setRevealedParagraphs(prev => i + 1);
        }

        // Use saved resonances if available
        if (freshVoicing.resonances && freshVoicing.resonances.length > 0) {
          setResonances(freshVoicing.resonances.map(r => ({
            pattern: r.title,
            phrase: r.phrase || '',
            because: r.description
          })));
        } else {
          await generateResonances(patternName, freshVoicing.voicing_text);
        }

        // Use saved sample questions if available
        if (freshVoicing.sample_questions && freshVoicing.sample_questions.length > 0) {
          setSampleQuestions(freshVoicing.sample_questions);
        } else {
          await generateSampleQuestions(patternName, freshVoicing.voicing_text);
        }
      }

    } catch (error) {
      console.error('Load error:', error);
      setIsLoading(false);
    }
  };

  const generateResonances = async (patternName, voicingText) => {
    try {
      const response = await fetch('/api/resonance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pattern: patternName,
          voicing: voicingText
        })
      });

      const data = await response.json();
      parseResonances(data.resonances);

      // Generate sample questions after resonances
      generateSampleQuestions(patternName, voicingText);
    } catch (error) {
      console.error('Resonances error:', error);
    }
  };

  const generateSampleQuestions = async (patternName, voicingText) => {
    try {
      const response = await fetch('/api/sample-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pattern: patternName,
          voicing: voicingText
        })
      });

      const data = await response.json();
      setSampleQuestions(data.questions || []);
    } catch (error) {
      console.error('Sample questions error:', error);
    }
  };

  const parseResonances = (text) => {
    if (!text) return [];
    const lines = text.split('\n').filter(l => {
      const trimmed = l.trim();
      return (trimmed.startsWith('*') || trimmed.startsWith('-')) && 
             trimmed.includes('resonated with');
    });
    
    const parsed = lines.map(line => {
      const cleaned = line.replace(/^[*-]\s*/, '').replace(/\*\*/g, '');
      const match = cleaned.match(/^([\w.]+)\s+resonated with\s+"([^"]+)"\s+[—-]\s+because\s+(.+)$/i);
      if (match) {
        return {
          pattern: match[1],
          phrase: match[2],
          because: match[3].trim()
        };
      }
      return null;
    }).filter(Boolean);
    
    console.log('Parsed resonances:', parsed);
    setResonances(parsed);
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { role: 'user', content: chatInput };
    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);

    // Remove the question from sample questions if it was one of them
    setSampleQuestions(sampleQuestions.filter(q => q !== chatInput));

    setChatInput('');
    setIsChatting(true);

    try {
      const response = await fetch('/api/patternchat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pattern,
          inquiryContext: newVoicing?.voicing_text || '',
          messages: updatedMessages,
          voicingId: newVoicing?.id
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

  const navigateToPattern = (patternPath) => {
    const urlPath = patternPath.replace(/\./g, '-');
    window.location.href = `/${urlPath}`;
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (text && text.length > 3 && text.length < 150) {
      if (!collection.includes(text)) {
        setCollection([...collection, text]);
        setHighlighted([...highlighted, text]);
      }
      window.getSelection().removeAllRanges();
    }
  };

  const handlePatternClick = async (phrase) => {
    const patternName = phrase.toLowerCase().replace(/[^a-z0-9\s.]/g, '').replace(/\s+/g, '.');
    const urlPath = patternName.replace(/\./g, '-');

    // Save exploration to database
    try {
      await fetch('/api/explore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromPattern: pattern,
          exploredPhrase: phrase,
          toPatternSlug: urlPath
        })
      });
    } catch (error) {
      console.error('Failed to save exploration:', error);
    }

    window.open(`/${urlPath}`, '_blank');
  };

  const toggleWholeVoicingHeart = async () => {
    setIsWholeVoicingHearted(!isWholeVoicingHearted);

    if (!isWholeVoicingHearted && newVoicing) {
      try {
        await fetch('/api/heart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            voicingId: newVoicing.id,
            paragraphIndex: -1,
            paragraphText: newVoicing.voicing_text
          })
        });
      } catch (error) {
        console.error('Failed to save whole voicing heart:', error);
      }
    }
  };

  const copyVoicingToClipboard = async () => {
    if (newVoicing) {
      try {
        const urlPath = pattern.replace(/\./g, '-');
        const textToCopy = `GiveVoice.to/${urlPath}\n\n${newVoicing.voicing_text}`;
        await navigator.clipboard.writeText(textToCopy);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  const formatMessageContent = (content) => {
    // Format text between *asterisks* as italic and preserve line breaks
    return content
      .replace(/\*([^*]+)\*/g, '<em class="text-gray-600 not-italic font-light">$1</em>')
      .replace(/\n\n/g, '<br/><br/>');
  };

  const toggleMessageHeart = async (idx) => {
    const message = chatMessages[idx];
    const isHearted = heartedMessages.includes(idx);

    // Only heart assistant messages that have an inquiryId
    if (!message.inquiryId) {
      console.error('No inquiryId for this message');
      return;
    }

    try {
      if (isHearted) {
        // Remove heart
        const response = await fetch(`/api/heart/inquiry/${message.inquiryId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setHeartedMessages(heartedMessages.filter(i => i !== idx));
        }
      } else {
        // Add heart
        const response = await fetch('/api/heart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inquiryId: message.inquiryId })
        });
        if (response.ok) {
          setHeartedMessages([...heartedMessages, idx]);
        }
      }
    } catch (error) {
      console.error('Failed to toggle conversation heart:', error);
    }
  };

  const copyMessage = async (questionIdx) => {
    try {
      const question = chatMessages[questionIdx].content;
      const answer = chatMessages[questionIdx + 1]?.content || '';
      const urlPath = pattern.replace(/\./g, '-');
      const textToCopy = `GiveVoice.to/${urlPath}\n\nQ: ${question}\n\nA: ${answer}`;
      await navigator.clipboard.writeText(textToCopy);
      setCopiedMessageIndex(questionIdx);
      setTimeout(() => setCopiedMessageIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,200..900;1,7..72,200..900&display=swap');
        
        body {
          font-family: 'Literata', serif;
        }
      `}</style>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-16 text-center">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex-1"></div>
            <Link href="/">
              <h1 className="text-lg font-normal text-gray-500 flex-1 text-center hover:text-gray-900 transition-colors cursor-pointer">givevoice.to</h1>
            </Link>
            <div className="flex-1 flex justify-end">
              <UserMenu />
            </div>
          </div>
          <div className="flex items-center justify-center gap-4">
            {!isLoading && newVoicing && (
              <button
                onClick={toggleWholeVoicingHeart}
                className="transition-all"
                title="Heart entire voicing"
              >
                <svg
                  className="w-6 h-6"
                  fill={isWholeVoicingHearted ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  style={{ color: isWholeVoicingHearted ? '#9CA3AF' : '#D1D5DB' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </button>
            )}
            <Link href={`/${pattern.replace(/\./g, '-')}`}>
              <div className="text-5xl font-light text-gray-900 hover:text-purple-600 transition-colors cursor-pointer">
                {`{${pattern.replace(/\./g, '·')}}`}
              </div>
            </Link>
            {!isLoading && newVoicing && (
              <button
                onClick={copyVoicingToClipboard}
                className="transition-all relative"
                title="Copy voicing to clipboard"
              >
                {copySuccess ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#10B981' }}>
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ color: '#D1D5DB' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-start pb-20">
            {/* Animated dots */}
            <div className="my-6 flex gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '600ms' }}></div>
            </div>

            {/* Welcome text - prominent and stable */}
            <div className="max-w-xl text-center space-y-4 text-gray-700 font-light mb-12" style={{ lineHeight: '1.8' }}>
              <p className="text-xl">
                Thank you for awakening <span className="text-gray-900 font-normal">{pattern.replace(/\./g, '·')}</span>.
              </p>
              <p className="text-xl">
                We are navigating Pattern.Space to give voice to it.
              </p>
              <p className="text-lg text-gray-500 mt-8">
                We look forward to your feedback on what resonates most,
                <br />
                and the patterns that inspire you to explore further.
              </p>
            </div>

            {/* Interactive highlight explorer */}
            <div className="max-w-2xl">
              <div className="flex items-center justify-center gap-4">
                {/* Left arrow */}
                <button
                  onClick={() => navigateHighlight('left')}
                  className="p-2 text-gray-400 hover:text-purple-500 transition-colors"
                  aria-label="Previous highlight"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Current highlight */}
                <div className="flex-1 text-center">
                  <p className="text-sm text-gray-400 italic mb-2">
                    {`{${currentPatternKey}}`}
                  </p>
                  <p className="text-gray-600 text-base">
                    "{patternHighlights[currentPatternKey][currentHighlightIndex]}"
                  </p>
                </div>

                {/* Right arrow */}
                <button
                  onClick={() => navigateHighlight('right')}
                  className="p-2 text-gray-400 hover:text-purple-500 transition-colors"
                  aria-label="Next highlight"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Down arrow - switch pattern */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => navigateHighlight('down')}
                  className="p-2 text-gray-400 hover:text-purple-500 transition-colors"
                  aria-label="Switch pattern"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {!isLoading && (
          <>

{newVoicing && (
              <div className="mb-20">
                <div className="prose prose-lg max-w-none">
                  <div
                    className="leading-relaxed"
                    style={{ fontSize: '1.125rem', lineHeight: '1.8' }}
                  >
                    {splitLongParagraphs(newVoicing.voicing_text).map((item, idx) => {
                      let displayText = item.text;
                      highlighted.forEach(phrase => {
                        const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const regex = new RegExp(`(${escapedPhrase})`, 'gi');
                        displayText = displayText.replace(regex, '<mark class="bg-purple-100">$1</mark>');
                      });

                      const isRevealed = idx < revealedParagraphs;
                      const isHearted = heartedParagraphs.includes(item.text);

                      return (
                        <div
                          key={idx}
                          className={`flex gap-3 group rounded-sm -mx-2 px-2 ${item.isLastInParagraph ? 'mb-6' : 'mb-2'}`}
                        >
                          <button
                            onClick={() => toggleHeart(item.text, idx)}
                            className={`flex-shrink-0 transition-opacity duration-200 ${
                              isHearted ? 'opacity-100' : 'opacity-20 hover:opacity-50'
                            }`}
                            style={{ marginTop: '0.35rem' }}
                          >
                            <svg
                              className={`w-4 h-4 ${isHearted ? 'text-gray-600 fill-current' : 'text-gray-400'}`}
                              fill={isHearted ? 'currentColor' : 'none'}
                              stroke="currentColor"
                              strokeWidth="1.5"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                            </svg>
                          </button>
                          <p
                            className="text-gray-800 transition-all duration-[3000ms] ease-out select-text cursor-text flex-1"
                            style={{
                              opacity: isRevealed ? 1 : 0.3,
                              filter: isRevealed ? 'blur(0px)' : 'blur(4px)'
                            }}
                            onMouseUp={handleTextSelection}
                            dangerouslySetInnerHTML={{ __html: displayText }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {collection.length > 0 && (
              <div className="mb-20">
                <h2 className="text-sm uppercase tracking-wide text-gray-500 font-normal mb-4">Collection</h2>
                <p className="text-gray-600 font-light text-sm mb-6">
                  Phrases you've highlighted from this voicing
                </p>
                <div className="space-y-3">
                  {collection.map((phrase, idx) => (
                    <div key={idx} className="flex items-start gap-3 border border-gray-200 rounded-lg p-4">
                      <p className="text-gray-800 font-light text-sm flex-1">{phrase}</p>
                      <button
                        onClick={() => {
                          const newCollection = collection.filter((_, i) => i !== idx);
                          setCollection(newCollection);
                        }}
                        className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {resonances.length > 0 && (
              <div className="mb-20">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-sm uppercase tracking-wide text-gray-500 font-normal">Pattern Explorations</h2>
                  <button
                    onClick={() => setShowResonances(!showResonances)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 transition-transform"
                      style={{ transform: showResonances ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-gray-400 mb-8 italic">These patterns resonated with the voice of {`{${pattern.replace(/\./g, '·')}}`}</p>
                {showResonances && (
                  <>
                    <div className="space-y-10">
                      {resonances.slice(0, showAllResonances ? resonances.length : 3).map((res, idx) => {
                        const patternSlug = res.pattern.replace(/\./g, '-');
                        return (
                          <div key={idx} className="border-l-2 border-gray-200 pl-6">
                            <Link
                              href={`/patterns/${patternSlug}`}
                              className="text-purple-600 hover:text-purple-700 font-medium mb-2 text-lg transition-colors inline-block"
                            >
                              {`{${res.pattern}}`}
                            </Link>
                            <div className="text-gray-500 text-sm italic mb-3 leading-relaxed">
                              "{res.phrase}"
                            </div>
                            <div className="text-gray-700 text-base leading-relaxed">
                              {res.because}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {resonances.length > 3 && !showAllResonances && (
                      <div className="mt-8 text-center">
                        <button
                          onClick={() => setShowAllResonances(true)}
                          className="text-sm text-gray-500 hover:text-purple-600 transition-colors"
                        >
                          Show {resonances.length - 3} more
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <div className="mb-20">
              <h2 className="text-sm uppercase tracking-wide text-gray-500 mb-8 font-normal">Inquiry</h2>

              {sampleQuestions.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs text-gray-400 mb-4 italic">
                    {chatMessages.length === 0 ? 'Try asking...' : 'You might also ask...'}
                  </p>
                  <div className="space-y-2">
                    {sampleQuestions.map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => setChatInput(question)}
                        className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-300 rounded-lg text-gray-700 hover:text-purple-700 transition-all text-sm"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder={`Engage with ${pattern.replace(/\./g, '·')}...`}
                  className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  disabled={isChatting}
                  style={{ fontSize: '0.9375rem' }}
                />
                <button
                  onClick={sendChatMessage}
                  disabled={isChatting || !chatInput.trim()}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  style={{ fontSize: '0.9375rem' }}
                >
                  Send
                </button>
              </div>

              <div className="space-y-6">
                {chatMessages.map((msg, idx) => {
                  const isUser = msg.role === 'user';
                  const isHearted = heartedMessages.includes(idx);
                  const isCopied = copiedMessageIndex === idx - 1; // Check if previous (question) was copied

                  return (
                    <div key={idx} className={`${isUser ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-flex items-start gap-2 max-w-2xl ${isUser ? 'flex-row' : 'flex-row'}`}>
                        {isUser ? (
                          // Clipboard icon for user questions (on left)
                          <button
                            onClick={() => copyMessage(idx)}
                            className="transition-opacity pt-3"
                            title="Copy Q&A"
                          >
                            {copiedMessageIndex === idx ? (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#10B981' }}>
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ color: '#D1D5DB' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                              </svg>
                            )}
                          </button>
                        ) : (
                          // Heart icon for pattern responses (on left)
                          <button
                            onClick={() => toggleMessageHeart(idx)}
                            className="transition-opacity pt-1"
                            title="Heart this response"
                          >
                            <svg
                              className="w-4 h-4"
                              fill={isHearted ? 'currentColor' : 'none'}
                              stroke="currentColor"
                              strokeWidth="1.5"
                              viewBox="0 0 24 24"
                              style={{ color: isHearted ? '#9CA3AF' : '#D1D5DB' }}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                            </svg>
                          </button>
                        )}
                        <div className={`text-left px-5 py-3 rounded-2xl ${
                          isUser
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          <div
                            className="leading-relaxed whitespace-pre-wrap"
                            style={{ fontSize: '0.9375rem' }}
                            dangerouslySetInnerHTML={{ __html: formatMessageContent(msg.content) }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
                {isChatting && (
                  <div className="text-left">
                    <div className="inline-block px-5 py-3 rounded-2xl bg-gray-100">
                      <span className="text-gray-400 animate-pulse">···</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Engagement Stats */}
              {patternHistory && patternHistory.stats && (
                <div className="mt-12 border-t border-gray-200 pt-8 text-center">
                  <div className="flex justify-center gap-12">
                    <div>
                      <div className="text-2xl font-light text-gray-900">{patternHistory.stats.total_voicings}</div>
                      <div className="text-xs text-gray-500 font-light mt-1">voicings</div>
                    </div>
                    <div>
                      <div className="text-2xl font-light text-gray-900">{patternHistory.stats.total_hearts}</div>
                      <div className="text-xs text-gray-500 font-light mt-1">hearts</div>
                    </div>
                    <div>
                      <div className="text-2xl font-light text-gray-900">{patternHistory.stats.total_explorations}</div>
                      <div className="text-xs text-gray-500 font-light mt-1">explorations</div>
                    </div>
                  </div>
                  <Link
                    href={`/${pattern.replace(/\./g, '-')}`}
                    className="inline-block mt-6 text-sm text-purple-600 hover:text-purple-700 font-light"
                  >
                    View all voicings of {`{${pattern.replace(/\./g, '·')}}`} →
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>

    </div>
  );
}
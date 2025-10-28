'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function VoicingPage({ params }) {
  const [pattern, setPattern] = useState('');
  const [voicing, setVoicing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [heartedParagraphs, setHeartedParagraphs] = useState([]);
  const [collection, setCollection] = useState([]);
  const [highlighted, setHighlighted] = useState([]);
  const [resonances, setResonances] = useState([]);
  const [showAllResonances, setShowAllResonances] = useState(false);
  const [showResonances, setShowResonances] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [heartedMessages, setHeartedMessages] = useState([]);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState(null);
  const [sampleQuestions, setSampleQuestions] = useState([]);

  const splitLongParagraphs = (text) => {
    const paragraphs = text.split('\n\n');
    const result = [];

    paragraphs.forEach(para => {
      const sentences = para.match(/[^.!?]+[.!?]+/g) || [para];

      if (sentences.length >= 3) {
        for (let i = 0; i < sentences.length; i += 2) {
          const chunk = sentences.slice(i, i + 2).join(' ').trim();
          if (chunk) result.push(chunk);
        }
      } else {
        result.push(para);
      }
    });

    return result;
  };

  const toggleHeart = async (idx) => {
    if (heartedParagraphs.includes(idx)) {
      setHeartedParagraphs(heartedParagraphs.filter(i => i !== idx));
    } else {
      setHeartedParagraphs([...heartedParagraphs, idx]);

      if (voicing) {
        const paragraphText = splitLongParagraphs(voicing.voicing_text)[idx];
        try {
          await fetch('/api/heart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              voicingId: voicing.id,
              paragraphIndex: idx,
              paragraphText: paragraphText
            })
          });
        } catch (error) {
          console.error('Failed to save heart:', error);
        }
      }
    }
  };

  const parseResonances = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const parsed = lines.map(line => {
      const match = line.match(/^[•\-*]\s*\*\*(.+?)\*\*:\s*(.+)$/);
      if (match) {
        return { title: match[1], description: match[2] };
      }
      return null;
    }).filter(Boolean);
    setResonances(parsed);
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

    try {
      await fetch('/api/explore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromPattern: pattern,
          exploredPhrase: phrase,
          toPatternSlug: patternName
        })
      });
    } catch (error) {
      console.error('Failed to save exploration:', error);
    }

    window.location.href = `/${urlPath}`;
  };

  const formatMessageContent = (content) => {
    return content
      .replace(/\*([^*]+)\*/g, '<em class="text-gray-600 not-italic font-light">$1</em>')
      .replace(/\n\n/g, '<br/><br/>');
  };

  const handleChat = async (e, questionText = null) => {
    if (e) e.preventDefault();
    const question = questionText || chatInput;
    if (!question.trim()) return;

    const updatedMessages = [...chatMessages, { role: 'user', content: question }];
    setChatMessages(updatedMessages);
    setSampleQuestions(sampleQuestions.filter(q => q !== question));
    setChatInput('');
    setIsChatting(true);

    try {
      const response = await fetch('/api/patternchat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pattern,
          inquiryContext: voicing?.voicing_text || '',
          messages: updatedMessages,
          voicingId: voicing?.id
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

  const copyToClipboard = async (question, answer, index) => {
    const textToCopy = `GiveVoice.to/${pattern}\n\nQ: ${question}\n\nA: ${answer}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedMessageIndex(index);
      setTimeout(() => setCopiedMessageIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const toggleConversationHeart = async (inquiryId, idx) => {
    const isHearted = heartedMessages.includes(idx);

    try {
      if (isHearted) {
        // Remove heart - find the heart record by inquiry_id and delete it
        const response = await fetch(`/api/heart/inquiry/${inquiryId}`, {
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
          body: JSON.stringify({ inquiryId })
        });
        if (response.ok) {
          setHeartedMessages([...heartedMessages, idx]);
        }
      }
    } catch (error) {
      console.error('Failed to toggle conversation heart:', error);
    }
  };

  useEffect(() => {
    const loadVoicing = async () => {
      const resolvedParams = await params;
      // resolvedParams now has both 'pattern' and 'id'
      try {
        const response = await fetch(`/api/voicing/${resolvedParams.id}`);
        const data = await response.json();
        setVoicing(data);
        setPattern(data.pattern_name);

        // Use saved resonances if available, otherwise generate new ones
        if (data.resonances && data.resonances.length > 0) {
          setResonances(data.resonances);
        } else {
          const resResponse = await fetch('/api/resonance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pattern: data.pattern_name,
              voicing: data.voicing_text
            })
          });
          const resData = await resResponse.json();
          parseResonances(resData.resonances);
        }

        // Use saved sample questions if available, otherwise generate new ones
        if (data.sample_questions && data.sample_questions.length > 0) {
          setSampleQuestions(data.sample_questions);
        } else {
          const qResponse = await fetch('/api/sample-questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pattern: data.pattern_name,
              voicing: data.voicing_text
            })
          });
          const qData = await qResponse.json();
          setSampleQuestions(qData.questions || []);
        }

        // Load saved inquiries if any
        if (data.inquiries && data.inquiries.length > 0) {
          const savedMessages = [];
          data.inquiries.forEach(inquiry => {
            savedMessages.push({ role: 'user', content: inquiry.question });
            savedMessages.push({ role: 'assistant', content: inquiry.answer });
          });
          setChatMessages(savedMessages);
        }

      } catch (error) {
        console.error('Failed to load voicing:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVoicing();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600 font-light">Loading...</div>
      </div>
    );
  }

  if (!voicing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600 font-light">Voicing not found</div>
      </div>
    );
  }

  const paragraphs = splitLongParagraphs(voicing.voicing_text);

  return (
    <div className="min-h-screen bg-white">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,200..900;1,7..72,200..900&display=swap');
        body {
          font-family: 'Literata', serif;
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <Link href="/">
              <h1 className="text-lg font-normal text-gray-500 hover:text-gray-900 transition-colors cursor-pointer">givevoice.to</h1>
            </Link>
            <Link href={`/patterns/${voicing.pattern_name.replace(/\./g, '-')}`}>
              <div className="text-5xl font-light text-gray-900 hover:text-purple-600 mb-2 transition-colors cursor-pointer">{voicing.pattern_name}</div>
            </Link>
            <p className="text-sm text-gray-500 font-light">
              Voiced on {new Date(voicing.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <Link
            href={`/${voicing.pattern_name}`}
            className="text-sm text-gray-600 hover:text-gray-900 font-light transition-colors"
          >
            Generate New
          </Link>
        </div>

        <div className="mb-16" onMouseUp={handleTextSelection}>
          {paragraphs.map((paragraph, idx) => (
            <div key={idx} className="relative group mb-6">
              <button
                onClick={() => toggleHeart(idx)}
                className={`absolute -left-8 top-1 transition-opacity ${
                  heartedParagraphs.includes(idx) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill={heartedParagraphs.includes(idx) ? '#9CA3AF' : 'none'}
                  stroke="#9CA3AF"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </button>
              <p className="text-gray-800 font-light leading-relaxed" style={{ fontSize: '1.125rem', lineHeight: '1.8' }}>
                {paragraph}
              </p>
            </div>
          ))}
        </div>

        {collection.length > 0 && (
          <div className="mb-16">
            <h2 className="text-sm uppercase tracking-wide text-gray-500 font-normal">Collection</h2>
            <div className="flex flex-wrap gap-3 mt-4">
              {collection.map((phrase, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePatternClick(phrase)}
                  className="px-4 py-2 bg-gray-100 hover:bg-purple-100 text-gray-700 hover:text-purple-700 rounded-full text-sm transition-colors"
                >
                  {phrase}
                </button>
              ))}
            </div>
          </div>
        )}

        {resonances.length > 0 && (
          <div className="mb-16">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm uppercase tracking-wide text-gray-500 font-normal">Resonances</h2>
              <button
                onClick={() => setShowResonances(!showResonances)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                {showResonances ? '−' : '+'}
              </button>
            </div>

            {showResonances && (
              <div className="space-y-4">
                {(showAllResonances ? resonances : resonances.slice(0, 3)).map((resonance, idx) => (
                  <div key={idx} className="border-l-2 border-purple-200 pl-4">
                    <Link
                      href={`/${resonance.title.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-purple-600 hover:text-purple-700 font-medium mb-2 text-lg transition-colors inline-block"
                    >
                      {resonance.title}
                    </Link>
                    <p className="text-gray-600 font-light">{resonance.description}</p>
                  </div>
                ))}
                {resonances.length > 3 && (
                  <button
                    onClick={() => setShowAllResonances(!showAllResonances)}
                    className="text-sm text-purple-600 hover:text-purple-700 font-light"
                  >
                    {showAllResonances ? 'Show Less' : `Show ${resonances.length - 3} More`}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mb-16">
          <h2 className="text-sm uppercase tracking-wide text-gray-500 mb-8 font-normal">Inquiry</h2>

          {sampleQuestions.length > 0 && (
            <div className="mb-6 space-y-3">
              {sampleQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={(e) => handleChat(e, question)}
                  className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors font-light"
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleChat} className="mb-8">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask the pattern a question..."
              className="w-full px-6 py-4 border border-gray-300 rounded-full focus:outline-none focus:border-purple-400 font-light text-gray-900 placeholder:text-gray-400"
            />
          </form>

          <div className="space-y-6">
            {chatMessages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              const isLastAssistant = !isUser && idx === chatMessages.length - 1;

              return (
                <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`}>
                    {!isUser && idx > 0 && chatMessages[idx - 1]?.role === 'user' && (
                      <div className="mb-2 flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(chatMessages[idx - 1].content, msg.content, idx)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          {copiedMessageIndex === idx && <span className="text-xs ml-1">Copied!</span>}
                        </button>
                        {msg.inquiryId && (
                          <button
                            onClick={() => toggleConversationHeart(msg.inquiryId, idx)}
                            className={`transition-colors ${
                              heartedMessages.includes(idx)
                                ? 'text-red-500'
                                : 'text-gray-400 hover:text-red-400'
                            }`}
                            title={heartedMessages.includes(idx) ? 'Remove from highlights' : 'Add to highlights'}
                          >
                            <svg className="w-4 h-4" fill={heartedMessages.includes(idx) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    )}
                    <div className={`text-left px-5 py-3 rounded-2xl ${
                      isUser ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-800'
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
        </div>
      </div>
    </div>
  );
}

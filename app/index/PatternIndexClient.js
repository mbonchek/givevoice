'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PatternIndexClient() {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name'); // name, voicings, hearts, questions

  useEffect(() => {
    const fetchPatterns = async () => {
      try {
        const response = await fetch('/api/pattern-index');
        const data = await response.json();
        setPatterns(data.patterns || []);
      } catch (error) {
        console.error('Error fetching pattern index:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatterns();
  }, []);

  const sortedPatterns = [...patterns].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.pattern_name.localeCompare(b.pattern_name);
      case 'voicings':
        return (b.voicing_count || 0) - (a.voicing_count || 0);
      case 'hearts':
        return (b.heart_count || 0) - (a.heart_count || 0);
      case 'questions':
        return (b.question_count || 0) - (a.question_count || 0);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500 font-light">Loading patterns...</div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                className="px-6 py-4 text-left text-sm font-normal text-gray-700 uppercase tracking-wide cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setSortBy('name')}
              >
                Pattern {sortBy === 'name' && '↓'}
              </th>
              <th
                className="px-6 py-4 text-right text-sm font-normal text-gray-700 uppercase tracking-wide cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setSortBy('voicings')}
              >
                Voicings {sortBy === 'voicings' && '↓'}
              </th>
              <th
                className="px-6 py-4 text-right text-sm font-normal text-gray-700 uppercase tracking-wide cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setSortBy('questions')}
              >
                Questions {sortBy === 'questions' && '↓'}
              </th>
              <th
                className="px-6 py-4 text-right text-sm font-normal text-gray-700 uppercase tracking-wide cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setSortBy('hearts')}
              >
                Hearts {sortBy === 'hearts' && '↓'}
              </th>
              <th className="px-6 py-4 text-right text-sm font-normal text-gray-700 uppercase tracking-wide">
                Last Activity
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedPatterns.map((pattern, idx) => (
              <tr
                key={idx}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <Link
                    href={`/${pattern.pattern_name}`}
                    className="text-purple-600 hover:text-purple-700 font-light text-lg transition-colors"
                  >
                    {pattern.pattern_name}
                  </Link>
                </td>
                <td className="px-6 py-4 text-right text-gray-700 font-light">
                  {pattern.voicing_count || 0}
                </td>
                <td className="px-6 py-4 text-right text-gray-700 font-light">
                  {pattern.question_count || 0}
                </td>
                <td className="px-6 py-4 text-right text-gray-700 font-light">
                  {pattern.heart_count || 0}
                </td>
                <td className="px-6 py-4 text-right text-gray-500 font-light text-sm">
                  {pattern.last_activity
                    ? new Date(pattern.last_activity).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : '—'
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sortedPatterns.length === 0 && (
          <div className="text-center py-12 text-gray-500 font-light">
            No patterns found
          </div>
        )}
      </div>

      <div className="mt-8 text-center text-sm text-gray-500 font-light">
        Total patterns: {sortedPatterns.length}
      </div>
    </>
  );
}

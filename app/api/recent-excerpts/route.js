import { NextResponse } from 'next/server';
import { Pool } from 'pg';

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      ssl: { rejectUnauthorized: false }
    });
  }
  return pool;
}

// Helper to clean text by removing asterisked expressions
const cleanText = (text) => {
  return text.replace(/\*[^*]+\*/g, '').replace(/\s+/g, ' ').trim();
};

// Helper to extract a meaningful excerpt from voicing
const extractExcerpt = (text) => {
  const cleaned = cleanText(text);
  const sentences = cleaned.match(/[^.!?]+[.!?]+/g) || [];

  if (sentences.length === 0) return null;

  // Take 1-2 sentences that are meaningful length
  let excerpt = sentences[0];
  if (sentences.length > 1 && excerpt.length < 80) {
    excerpt += ' ' + sentences[1];
  }

  // Limit to reasonable length
  if (excerpt.length > 200) {
    excerpt = excerpt.substring(0, 197) + '...';
  }

  return excerpt.length > 30 ? excerpt : null;
};

export async function GET(request) {
  try {
    const db = getPool();

    // Get recent voicings from various patterns
    const recentVoicings = await db.query(`
      SELECT
        v.pattern_name,
        v.voicing_text,
        v.created_at
      FROM voicings v
      ORDER BY v.created_at DESC
      LIMIT 20
    `);

    // Extract excerpts from voicings
    const excerpts = recentVoicings.rows
      .map(voicing => {
        const excerpt = extractExcerpt(voicing.voicing_text);
        if (!excerpt) return null;

        return {
          quote: excerpt,
          author: `{${voicing.pattern_name}}`,
          type: 'voicing'
        };
      })
      .filter(Boolean)
      .slice(0, 10); // Keep top 10 excerpts

    return NextResponse.json({
      excerpts
    });

  } catch (error) {
    console.error('Recent excerpts fetch error:', error);
    return NextResponse.json(
      { excerpts: [] },
      { status: 200 } // Return empty array rather than error
    );
  }
}

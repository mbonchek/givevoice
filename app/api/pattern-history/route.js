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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const pattern = searchParams.get('pattern');

    if (!pattern) {
      return NextResponse.json(
        { error: 'Pattern name required' },
        { status: 400 }
      );
    }

    const db = getPool();

    // Get all voicings for this pattern
    const voicings = await db.query(`
      SELECT
        v.id,
        v.voicing_text,
        v.created_at,
        v.user_id,
        v.analysis,
        v.resonances,
        v.sample_questions,
        up.display_name,
        up.username,
        (SELECT COUNT(*) FROM paragraph_hearts WHERE voicing_id = v.id) > 0 as has_hearts
      FROM voicings v
      LEFT JOIN user_profiles up ON up.id = v.user_id
      WHERE v.pattern_name = $1
      ORDER BY v.created_at DESC
      LIMIT 50
    `, [pattern]);

    // Get pattern statistics
    const stats = await db.query(`
      SELECT
        COUNT(DISTINCT v.id) as "totalVoicings",
        COUNT(DISTINCT v.user_id) as "uniqueVoicers",
        COUNT(DISTINCT ph.id) as "totalHearts",
        COUNT(DISTINCT pe.id) as "totalExplorations",
        MIN(v.created_at) as "firstVoicing",
        MAX(v.created_at) as "lastVoicing"
      FROM voicings v
      LEFT JOIN paragraph_hearts ph ON v.id = ph.voicing_id
      LEFT JOIN pattern_explorations pe ON v.pattern_name = pe.from_pattern
      WHERE v.pattern_name = $1
    `, [pattern]);

    // Get latest synthesis for this pattern
    const synthesis = await db.query(`
      SELECT voice, connections, invitations, created_at, voicing_count, heart_count, version
      FROM pattern_syntheses
      WHERE pattern_name = $1
      ORDER BY created_at DESC
      LIMIT 1
    `, [pattern]);

    // Aggregate all sample questions from voicings
    const allQuestions = [];
    voicings.rows.forEach(v => {
      if (v.sample_questions) {
        // sample_questions is stored as JSON array in the database
        const questions = typeof v.sample_questions === 'string'
          ? JSON.parse(v.sample_questions)
          : v.sample_questions;
        if (Array.isArray(questions)) {
          allQuestions.push(...questions);
        }
      }
    });

    // Deduplicate questions (case-insensitive)
    const uniqueQuestions = [...new Map(
      allQuestions.map(q => [q.toLowerCase().trim(), q])
    ).values()];

    // Parse synthesis JSONB fields if they exist
    let synthesisData = synthesis.rows[0] || null;
    if (synthesisData) {
      // Ensure connections and invitations fields are parsed if they're JSON strings
      if (typeof synthesisData.connections === 'string') {
        try {
          synthesisData.connections = JSON.parse(synthesisData.connections);
        } catch (e) {
          // Keep as string if it's not valid JSON (old format)
        }
      }
      if (typeof synthesisData.invitations === 'string') {
        try {
          synthesisData.invitations = JSON.parse(synthesisData.invitations);
        } catch (e) {
          // Keep as string if it's not valid JSON (old format)
        }
      }
    }

    return NextResponse.json({
      history: voicings.rows,
      stats: stats.rows[0],
      synthesis: synthesisData,
      questions: uniqueQuestions
    });

  } catch (error) {
    console.error('Pattern history fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pattern history' },
      { status: 500 }
    );
  }
}

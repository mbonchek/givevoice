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
        (SELECT COUNT(*) FROM paragraph_hearts WHERE voicing_id = v.id) as heart_count
      FROM voicings v
      WHERE v.pattern_name = $1
      ORDER BY v.created_at DESC
    `, [pattern]);

    // Get most hearted passages
    const hearts = await db.query(`
      SELECT
        ph.id,
        ph.paragraph_text,
        ph.voicing_id,
        ph.created_at,
        COUNT(*) OVER (PARTITION BY ph.paragraph_text) as heart_count
      FROM paragraph_hearts ph
      JOIN voicings v ON ph.voicing_id = v.id
      WHERE v.pattern_name = $1
      GROUP BY ph.id, ph.paragraph_text, ph.voicing_id, ph.created_at
      ORDER BY heart_count DESC, ph.created_at DESC
      LIMIT 20
    `, [pattern]);

    // Get pattern statistics
    const stats = await db.query(`
      SELECT
        COUNT(DISTINCT v.id) as total_voicings,
        COUNT(DISTINCT ph.id) as total_hearts,
        COUNT(DISTINCT pe.id) as total_explorations,
        MIN(v.created_at) as first_voicing,
        MAX(v.created_at) as last_voicing
      FROM voicings v
      LEFT JOIN paragraph_hearts ph ON v.id = ph.voicing_id
      LEFT JOIN pattern_explorations pe ON v.pattern_name = pe.from_pattern
      WHERE v.pattern_name = $1
    `, [pattern]);

    // Get explorations from this pattern with counts
    const explorations = await db.query(`
      SELECT
        pe.to_pattern_slug,
        COUNT(*) as exploration_count,
        MAX(pe.created_at) as last_explored,
        array_agg(DISTINCT pe.explored_phrase) as sample_phrases
      FROM pattern_explorations pe
      WHERE pe.from_pattern = $1
      GROUP BY pe.to_pattern_slug
      ORDER BY exploration_count DESC, last_explored DESC
    `, [pattern]);

    // Get summaries for top explorations from voicings table
    const topExplorations = explorations.rows.slice(0, 5);
    const explorationsWithSummaries = await Promise.all(
      topExplorations.map(async (exp) => {
        const patternName = exp.to_pattern_slug.replace(/-/g, '.');
        const voicing = await db.query(`
          SELECT voicing_text
          FROM voicings
          WHERE pattern_name = $1
          ORDER BY created_at DESC
          LIMIT 1
        `, [patternName]);

        return {
          ...exp,
          pattern_name: patternName,
          summary: voicing.rows[0]?.voicing_text?.substring(0, 200) || null
        };
      })
    );

    // Get most recent synthesis for this pattern
    const synthesis = await db.query(`
      SELECT
        analytical,
        intuitive,
        synthesis,
        created_at,
        voicing_count,
        heart_count
      FROM pattern_syntheses
      WHERE pattern_name = $1
      ORDER BY created_at DESC
      LIMIT 1
    `, [pattern]);

    // Get aggregated resonances across all voicings
    const resonances = await db.query(`
      SELECT
        jsonb_array_elements(v.resonances)->>'title' as pattern_title,
        jsonb_array_elements(v.resonances)->>'description' as description,
        COUNT(*) as resonance_count
      FROM voicings v
      WHERE v.pattern_name = $1
        AND v.resonances IS NOT NULL
        AND jsonb_array_length(v.resonances) > 0
      GROUP BY pattern_title, description
      ORDER BY resonance_count DESC
      LIMIT 10
    `, [pattern]);

    return NextResponse.json({
      pattern_name: pattern,
      voicings: voicings.rows,
      hearts: hearts.rows,
      stats: stats.rows[0],
      explorations: explorationsWithSummaries,
      synthesis: synthesis.rows[0] || null,
      resonances: resonances.rows
    });

  } catch (error) {
    console.error('Trending pattern fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending pattern data' },
      { status: 500 }
    );
  }
}

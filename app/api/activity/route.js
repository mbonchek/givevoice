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
    const db = getPool();

    // Get recent voicings with heart count
    const recentVoicings = await db.query(`
      SELECT
        v.id,
        v.pattern_name,
        v.voicing_text,
        v.created_at,
        (SELECT COUNT(*) FROM paragraph_hearts WHERE voicing_id = v.id) as heart_count,
        (SELECT COUNT(*) FROM pattern_explorations WHERE from_pattern = v.pattern_name) as exploration_count
      FROM voicings v
      ORDER BY v.created_at DESC
      LIMIT 20
    `);

    // Get trending patterns (most hearts and explorations in last 7 days)
    const trendingPatterns = await db.query(`
      WITH pattern_resonances AS (
        SELECT
          v2.pattern_name,
          json_agg(
            json_build_object(
              'pattern_title', elem->>'title',
              'description', elem->>'description'
            )
          ) as top_resonances
        FROM voicings v2
        CROSS JOIN LATERAL jsonb_array_elements(v2.resonances) AS elem
        WHERE v2.resonances IS NOT NULL
          AND jsonb_array_length(v2.resonances) > 0
        GROUP BY v2.pattern_name
      )
      SELECT
        v.pattern_name,
        COUNT(DISTINCT ph.id) as heart_count,
        COUNT(DISTINCT pe.id) as exploration_count,
        COUNT(DISTINCT ph.id) + COUNT(DISTINCT pe.id) as total_engagement,
        MAX(v.created_at) as last_voicing,
        (SELECT json_agg(
          json_build_object(
            'pattern_title', elem->>'title',
            'description', elem->>'description'
          )
        )
        FROM voicings v2
        CROSS JOIN LATERAL jsonb_array_elements(v2.resonances) AS elem
        WHERE v2.pattern_name = v.pattern_name
          AND v2.resonances IS NOT NULL
          AND jsonb_array_length(v2.resonances) > 0
        LIMIT 3
        ) as top_resonances,
        (SELECT ps.created_at
         FROM pattern_syntheses ps
         WHERE ps.pattern_name = v.pattern_name
         ORDER BY ps.created_at DESC
         LIMIT 1
        ) as synthesis_date
      FROM voicings v
      LEFT JOIN paragraph_hearts ph ON v.id = ph.voicing_id
        AND ph.created_at > NOW() - INTERVAL '7 days'
      LEFT JOIN pattern_explorations pe ON v.pattern_name = pe.from_pattern
        AND pe.created_at > NOW() - INTERVAL '7 days'
      WHERE v.created_at > NOW() - INTERVAL '30 days'
      GROUP BY v.pattern_name
      HAVING COUNT(DISTINCT ph.id) + COUNT(DISTINCT pe.id) > 0
      ORDER BY total_engagement DESC, last_voicing DESC
      LIMIT 10
    `);

    // Get recent hearts with context
    const recentHearts = await db.query(`
      SELECT
        ph.id,
        ph.paragraph_text,
        ph.created_at,
        v.pattern_name,
        v.id as voicing_id
      FROM paragraph_hearts ph
      JOIN voicings v ON ph.voicing_id = v.id
      ORDER BY ph.created_at DESC
      LIMIT 15
    `);

    // Get recent explorations
    const recentExplorations = await db.query(`
      SELECT
        pe.id,
        pe.from_pattern,
        pe.to_pattern_slug,
        pe.explored_phrase,
        pe.source_type,
        pe.created_at
      FROM pattern_explorations pe
      ORDER BY pe.created_at DESC
      LIMIT 15
    `);

    return NextResponse.json({
      recentVoicings: recentVoicings.rows,
      trendingPatterns: trendingPatterns.rows,
      recentHearts: recentHearts.rows,
      recentExplorations: recentExplorations.rows
    });

  } catch (error) {
    console.error('Activity fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity data' },
      { status: 500 }
    );
  }
}

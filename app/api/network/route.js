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

export async function GET() {
  try {
    const db = getPool();

    // Get patterns with their engagement metrics
    const patternsQuery = await db.query(`
      SELECT
        v.pattern_name,
        COUNT(DISTINCT v.id) as voicing_count,
        COUNT(DISTINCT ph.id) as heart_count,
        MAX(v.created_at) as last_activity
      FROM voicings v
      LEFT JOIN paragraph_hearts ph ON v.id = ph.voicing_id
      GROUP BY v.pattern_name
      HAVING COUNT(DISTINCT v.id) > 0
      ORDER BY COUNT(DISTINCT ph.id) DESC, COUNT(DISTINCT v.id) DESC
      LIMIT 25
    `);

    // Get explorations between patterns (edges)
    const explorationsQuery = await db.query(`
      SELECT
        pe.from_pattern,
        pe.to_pattern_slug,
        COUNT(*) as connection_strength
      FROM pattern_explorations pe
      WHERE pe.from_pattern IN (
        SELECT pattern_name FROM voicings GROUP BY pattern_name
      )
      GROUP BY pe.from_pattern, pe.to_pattern_slug
      HAVING COUNT(*) > 0
    `);

    // Get resonances between patterns - how patterns recognize each other
    const resonancesQuery = await db.query(`
      SELECT DISTINCT
        v.pattern_name as from_pattern,
        jsonb_array_elements(v.resonances) ->> 'title' as to_pattern,
        COUNT(*) as resonance_count
      FROM voicings v
      WHERE v.resonances IS NOT NULL
        AND jsonb_array_length(v.resonances) > 0
      GROUP BY v.pattern_name, (jsonb_array_elements(v.resonances) ->> 'title')
    `);

    // Build nodes
    const nodes = patternsQuery.rows.map(p => ({
      id: p.pattern_name,
      label: p.pattern_name,
      size: Math.log(parseInt(p.heart_count) + 1) * 10 + 10,
      voicings: parseInt(p.voicing_count),
      hearts: parseInt(p.heart_count)
    }));

    // Build edges from explorations
    const edges = [];
    const edgeMap = new Map();

    explorationsQuery.rows.forEach(e => {
      const key = `${e.from_pattern}-${e.to_pattern_slug}`;
      if (!edgeMap.has(key)) {
        edges.push({
          from: e.from_pattern,
          to: e.to_pattern_slug.replace(/-/g, '.'),
          strength: parseInt(e.connection_strength),
          type: 'exploration'
        });
        edgeMap.set(key, true);
      }
    });

    // Add resonance edges - these show how patterns recognize and give birth to other patterns
    resonancesQuery.rows.forEach(r => {
      const toPattern = r.to_pattern.toLowerCase().replace(/\s+/g, '.');
      const key = `${r.from_pattern}-${toPattern}`;
      if (!edgeMap.has(key)) {
        edges.push({
          from: r.from_pattern,
          to: toPattern,
          strength: parseInt(r.resonance_count),
          type: 'resonance'
        });
        edgeMap.set(key, true);
      }
    });

    return NextResponse.json({
      nodes,
      edges
    });

  } catch (error) {
    console.error('Network data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch network data' },
      { status: 500 }
    );
  }
}

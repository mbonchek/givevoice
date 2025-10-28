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

    // Get all hearts for this pattern with their paragraph text and counts
    const hearts = await db.query(`
      SELECT
        ph.paragraph_text,
        COUNT(*) as heart_count
      FROM paragraph_hearts ph
      JOIN voicings v ON ph.voicing_id = v.id
      WHERE v.pattern_name = $1 AND ph.paragraph_text IS NOT NULL
      GROUP BY ph.paragraph_text
      ORDER BY heart_count DESC, ph.paragraph_text
      LIMIT 50
    `, [pattern]);

    return NextResponse.json({
      hearts: hearts.rows
    });

  } catch (error) {
    console.error('Pattern hearts fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pattern hearts' },
      { status: 500 }
    );
  }
}

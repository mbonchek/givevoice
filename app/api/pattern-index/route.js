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

    // Get all patterns with their statistics
    const patterns = await db.query(`
      SELECT
        v.pattern_name,
        COUNT(DISTINCT v.id) as voicing_count,
        COUNT(DISTINCT ph.id) as heart_count,
        COUNT(DISTINCT pi.id) as question_count,
        MAX(v.created_at) as last_activity
      FROM voicings v
      LEFT JOIN paragraph_hearts ph ON v.id = ph.voicing_id
      LEFT JOIN pattern_inquiries pi ON v.id = pi.voicing_id
      GROUP BY v.pattern_name
      ORDER BY v.pattern_name ASC
    `);

    return NextResponse.json({
      patterns: patterns.rows
    });

  } catch (error) {
    console.error('Pattern index fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pattern index' },
      { status: 500 }
    );
  }
}

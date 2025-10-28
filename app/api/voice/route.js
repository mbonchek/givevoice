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

export async function POST(request) {
  try {
    const { pattern } = await request.json();
    
    const db = getPool();
    
    // Get all voicings for this pattern
    const result = await db.query(
      'SELECT id, voicing_text, resonance_score, created_at FROM voicings WHERE pattern_name = $1 ORDER BY created_at DESC',
      [pattern]
    );

    return NextResponse.json({
      voicings: result.rows
    });

  } catch (error) {
    console.error('Fetch voicings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch voicings' },
      { status: 500 }
    );
  }
}
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
    const { voicingId, text } = await request.json();

    const db = getPool();
    await db.query(
      'INSERT INTO highlights (voicing_id, highlighted_text) VALUES ($1, $2)',
      [voicingId, text]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Highlight save error:', error);
    return NextResponse.json(
      { error: 'Failed to save highlight' },
      { status: 500 }
    );
  }
}
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

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const db = getPool();
    const result = await db.query(
      'SELECT paragraph_text FROM paragraph_hearts WHERE voicing_id = $1 AND paragraph_text IS NOT NULL',
      [id]
    );

    return NextResponse.json({
      hearts: result.rows
    });

  } catch (error) {
    console.error('Hearts fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hearts' },
      { status: 500 }
    );
  }
}

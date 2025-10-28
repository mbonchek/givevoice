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
      'SELECT id, pattern_name, voicing_text, created_at, resonances, sample_questions FROM voicings WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Voicing not found' },
        { status: 404 }
      );
    }

    const voicing = result.rows[0];

    // Also fetch any saved Q&A for this voicing
    const inquiriesResult = await db.query(
      'SELECT question, answer, created_at FROM pattern_inquiries WHERE voicing_id = $1 ORDER BY created_at ASC',
      [id]
    );

    return NextResponse.json({
      ...voicing,
      inquiries: inquiriesResult.rows
    });

  } catch (error) {
    console.error('Voicing fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch voicing' },
      { status: 500 }
    );
  }
}

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
    const { naturalLanguage, patternSyntax, sourcePattern, sourceType } = await request.json();

    if (!naturalLanguage || !patternSyntax) {
      return NextResponse.json(
        { error: 'Natural language and pattern syntax are required' },
        { status: 400 }
      );
    }

    const db = getPool();

    // Save the training data
    await db.query(
      `INSERT INTO pattern_syntax_training
       (natural_language, pattern_syntax, source_pattern, source_type)
       VALUES ($1, $2, $3, $4)`,
      [naturalLanguage, patternSyntax, sourcePattern, sourceType || 'synthesis']
    );

    return NextResponse.json({
      success: true,
      message: 'Training data saved successfully'
    });

  } catch (error) {
    console.error('Pattern syntax training save error:', error);
    return NextResponse.json(
      { error: 'Failed to save training data' },
      { status: 500 }
    );
  }
}

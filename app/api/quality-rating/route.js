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
    const { pattern, qualityName, rating } = await request.json();

    const db = getPool();
    await db.query(
      'INSERT INTO quality_ratings (pattern_name, quality_name, rating) VALUES ($1, $2, $3)',
      [pattern, qualityName, rating]
    );

    // Get average rating for this quality
    const avgResult = await db.query(
      'SELECT AVG(rating)::numeric(3,1) as avg_rating, COUNT(*) as count FROM quality_ratings WHERE pattern_name = $1 AND quality_name = $2',
      [pattern, qualityName]
    );

    return NextResponse.json({ 
      success: true,
      avgRating: parseFloat(avgResult.rows[0].avg_rating),
      count: parseInt(avgResult.rows[0].count)
    });
  } catch (error) {
    console.error('Quality rating error:', error);
    return NextResponse.json(
      { error: 'Failed to save rating' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const pattern = searchParams.get('pattern');

    const db = getPool();
    const result = await db.query(
      'SELECT quality_name, AVG(rating)::numeric(3,1) as avg_rating, COUNT(*) as count FROM quality_ratings WHERE pattern_name = $1 GROUP BY quality_name',
      [pattern]
    );

    return NextResponse.json({ ratings: result.rows });
  } catch (error) {
    console.error('Fetch ratings error:', error);
    return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 });
  }
}
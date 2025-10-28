import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { createClient } from '@/lib/supabase/server';

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
    const { fromPattern, exploredPhrase, toPatternSlug } = await request.json();

    // Get user from Supabase Auth
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const db = getPool();
    await db.query(
      'INSERT INTO pattern_explorations (from_pattern, explored_phrase, to_pattern_slug, user_id) VALUES ($1, $2, $3, $4)',
      [fromPattern, exploredPhrase, toPatternSlug, user?.id || null]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Exploration save error:', error);
    return NextResponse.json(
      { error: 'Failed to save exploration' },
      { status: 500 }
    );
  }
}
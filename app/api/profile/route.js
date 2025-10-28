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

export async function GET(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = getPool();

    // Get user's hearted paragraphs with voicing details
    const hearts = await db.query(`
      SELECT
        ph.id,
        ph.paragraph_text,
        ph.paragraph_index,
        ph.created_at,
        v.pattern_name,
        v.voicing_text,
        v.id as voicing_id
      FROM paragraph_hearts ph
      JOIN voicings v ON ph.voicing_id = v.id
      WHERE ph.user_id = $1
      ORDER BY ph.created_at DESC
      LIMIT 50
    `, [user.id]);

    // Get user's pattern explorations
    const explorations = await db.query(`
      SELECT
        id,
        from_pattern,
        explored_phrase,
        to_pattern_slug,
        created_at
      FROM pattern_explorations
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 50
    `, [user.id]);

    // Get user's voicings (patterns they've explored)
    const voicings = await db.query(`
      SELECT
        id,
        pattern_name,
        voicing_text,
        created_at,
        (SELECT COUNT(*) FROM paragraph_hearts WHERE voicing_id = voicings.id) as heart_count
      FROM voicings
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 50
    `, [user.id]);

    return NextResponse.json({
      hearts: hearts.rows,
      explorations: explorations.rows,
      voicings: voicings.rows,
      user: {
        id: user.id,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile data' },
      { status: 500 }
    );
  }
}

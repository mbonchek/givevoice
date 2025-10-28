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
    const { voicingId, paragraphIndex, paragraphText, inquiryId } = await request.json();

    // Get user from Supabase Auth
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const db = getPool();

    if (inquiryId) {
      // Heart a conversation (inquiry)
      await db.query(
        'INSERT INTO paragraph_hearts (inquiry_id, user_id) VALUES ($1, $2)',
        [inquiryId, user?.id || null]
      );
    } else {
      // Heart a voicing paragraph or whole voicing
      await db.query(
        'INSERT INTO paragraph_hearts (voicing_id, paragraph_index, paragraph_text, user_id) VALUES ($1, $2, $3, $4)',
        [voicingId, paragraphIndex, paragraphText, user?.id || null]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Heart save error:', error);
    return NextResponse.json(
      { error: 'Failed to save heart' },
      { status: 500 }
    );
  }
}
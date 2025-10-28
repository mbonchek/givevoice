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

// Delete a heart by inquiry_id
export async function DELETE(request, { params }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const db = getPool();

    // Delete the heart where inquiry_id matches
    const result = await db.query(
      'DELETE FROM paragraph_hearts WHERE inquiry_id = $1 AND user_id = $2 RETURNING id',
      [id, user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Heart not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete conversation heart error:', error);
    return NextResponse.json(
      { error: 'Failed to delete heart' },
      { status: 500 }
    );
  }
}

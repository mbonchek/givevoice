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

// Delete a heart
export async function DELETE(request, { params }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const db = getPool();

    // Delete the heart (only if it belongs to the user)
    const result = await db.query(
      'DELETE FROM paragraph_hearts WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Heart not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete heart error:', error);
    return NextResponse.json(
      { error: 'Failed to delete heart' },
      { status: 500 }
    );
  }
}

// Update heart note
export async function PATCH(request, { params }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { note } = await request.json();
    const db = getPool();

    // Update the note (only if it belongs to the user)
    const result = await db.query(
      'UPDATE paragraph_hearts SET note = $1 WHERE id = $2 AND user_id = $3 RETURNING id',
      [note, id, user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Heart not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Update heart note error:', error);
    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    );
  }
}

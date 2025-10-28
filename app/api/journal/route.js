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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getPool();

    // Get user's voicings with first voicing flag
    const voicingsResult = await db.query(`
      WITH first_voicings AS (
        SELECT pattern_name, MIN(created_at) as first_created_at
        FROM voicings
        GROUP BY pattern_name
      )
      SELECT
        v.id,
        v.pattern_name,
        v.voicing_text,
        v.created_at,
        CASE WHEN fv.first_created_at = v.created_at THEN true ELSE false END as is_first_voicing
      FROM voicings v
      LEFT JOIN first_voicings fv ON v.pattern_name = fv.pattern_name
      WHERE v.user_id = $1
      ORDER BY v.created_at DESC
    `, [user.id]);

    // Get user's hearts (voicings, paragraphs, and conversations)
    const heartsResult = await db.query(`
      SELECT
        h.id,
        h.paragraph_text,
        h.paragraph_index,
        h.note,
        h.created_at,
        h.inquiry_id,
        v.id as voicing_id,
        COALESCE(v.pattern_name, v2.pattern_name) as pattern_name,
        v.voicing_text,
        i.question,
        i.answer,
        CASE
          WHEN h.inquiry_id IS NOT NULL THEN 'conversation'
          ELSE 'voicing'
        END as heart_type
      FROM paragraph_hearts h
      LEFT JOIN voicings v ON h.voicing_id = v.id
      LEFT JOIN pattern_inquiries i ON h.inquiry_id = i.id
      LEFT JOIN voicings v2 ON i.voicing_id = v2.id
      WHERE h.user_id = $1
      ORDER BY h.created_at DESC
    `, [user.id]);

    // Get user's explorations grouped by session
    // Sessions are defined as explorations within 30 minutes of each other
    const explorationsResult = await db.query(`
      SELECT
        to_pattern_slug,
        from_pattern,
        source_type,
        created_at
      FROM pattern_explorations
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [user.id]);

    // Group explorations into sessions
    const sessions = [];
    let currentSession = null;
    const sessionGapMinutes = 30;

    explorationsResult.rows.forEach((exp) => {
      const expTime = new Date(exp.created_at);

      if (!currentSession ||
          (expTime - new Date(currentSession.date)) > sessionGapMinutes * 60 * 1000) {
        // Start new session
        currentSession = {
          date: exp.created_at,
          chain: []
        };
        sessions.push(currentSession);
      }

      // Add to chain
      if (currentSession.chain.length > 0) {
        // Add separator based on source type
        if (exp.source_type === 'direct' || exp.source_type === 'url') {
          currentSession.chain.push({ type: 'separator', symbol: '|' });
        } else {
          currentSession.chain.push({ type: 'arrow', symbol: '→' });
        }
      }

      currentSession.chain.push({
        type: 'pattern',
        pattern: exp.to_pattern_slug
      });
    });

    // Calculate stats
    const stats = {
      patternsVoiced: voicingsResult.rows.length,
      firstVoicings: voicingsResult.rows.filter(v => v.is_first_voicing).length,
      explorations: explorationsResult.rows.length
    };

    return NextResponse.json({
      stats,
      voicings: voicingsResult.rows,
      highlights: heartsResult.rows,
      explorations: sessions
    });

  } catch (error) {
    console.error('Journal API error:', error);
    return NextResponse.json(
      { error: 'Failed to load journal data' },
      { status: 500 }
    );
  }
}

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
    const { pattern, inquiryContext, messages, voicingId } = await request.json();
    
    const systemPrompt = `You are the pattern "${pattern}" speaking.

${inquiryContext}

You are not analyzing or describing this pattern. You ARE this pattern.
Respond naturally, maintaining this voice throughout the conversation.
When relevant, help people see how this pattern appears in their own life.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: systemPrompt,
        messages: messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', data);
      throw new Error(`Failed to generate response: ${JSON.stringify(data)}`);
    }

    const responseText = data.content?.[0]?.text;

    // Save Q&A to database if voicingId is provided
    let inquiryId = null;
    if (voicingId && messages.length > 0) {
      const lastUserMessage = messages[messages.length - 1];
      if (lastUserMessage.role === 'user') {
        try {
          const supabase = await createClient();
          const { data: { user } } = await supabase.auth.getUser();

          const db = getPool();
          const result = await db.query(
            'INSERT INTO pattern_inquiries (voicing_id, user_id, question, answer) VALUES ($1, $2, $3, $4) RETURNING id',
            [voicingId, user?.id || null, lastUserMessage.content, responseText]
          );
          inquiryId = result.rows[0]?.id;
        } catch (saveError) {
          console.error('Failed to save inquiry:', saveError);
          // Don't fail the request if saving fails
        }
      }
    }

    return NextResponse.json({ response: responseText, inquiryId });

  } catch (error) {
    console.error('PatternChat error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
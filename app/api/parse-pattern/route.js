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
    const { phrase } = await request.json();

    // Get sample pattern names from database to show real examples
    const db = getPool();
    const examples = await db.query(`
      SELECT DISTINCT pattern_name,
             COUNT(*) as voicing_count
      FROM voicings
      GROUP BY pattern_name
      ORDER BY voicing_count DESC, random()
      LIMIT 10
    `);

    // Get human-provided training examples
    const training = await db.query(`
      SELECT natural_language, pattern_syntax
      FROM pattern_syntax_training
      ORDER BY created_at DESC
      LIMIT 10
    `);

    const examplePatterns = examples.rows.map(r => r.pattern_name).join('\n');
    const trainingExamples = training.rows.length > 0
      ? '\n\nHuman-provided translations:\n' + training.rows.map(t =>
          `"${t.natural_language}" → ${t.pattern_syntax}`
        ).join('\n')
      : '';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: `You are learning the pattern language by observing real patterns in the system.

Here are actual pattern names that exist:
${examplePatterns}
${trainingExamples}

Study these examples to understand the style:
- Simple patterns use dots: wonder, emergence, belonging
- Compound patterns connect concepts: being.together, self.recognition
- Keep it minimal and essential
- Capture the core essence, not every detail
- When humans provide translations, learn from their choices

Now parse this phrase into a pattern name that fits this language:
"${phrase}"

Guidelines:
- Use dots to connect words (not spaces, not underscores)
- Be concise - 1-3 concepts maximum
- Match the style and simplicity of the examples above
- Learn from the human-provided translations
- Lowercase only

Return ONLY the pattern name, nothing else.`
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', data);
      throw new Error('Failed to parse pattern');
    }

    const patternSyntax = data.content?.[0]?.text.trim();

    return NextResponse.json({ patternSyntax });

  } catch (error) {
    console.error('Pattern parsing error:', error);
    return NextResponse.json(
      { error: 'Failed to parse pattern' },
      { status: 500 }
    );
  }
}

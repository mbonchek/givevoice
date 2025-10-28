import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { pattern, newVoicing, previousVoicings } = await request.json();
    
    // Prepare previous voicings for comparison
    const previousText = previousVoicings.map((v, i) => 
      `=== Previous Voicing ${i + 1} ===\n${v.voicing_text}`
    ).join('\n\n');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2500,
        messages: [{
          role: 'user',
          content: `You are analyzing voicings of the pattern "${pattern}".

NEW VOICING (just generated):
${newVoicing}

${previousVoicings.length > 0 ? `PREVIOUS VOICINGS:
${previousText}` : 'This is the first voicing of this pattern.'}

Generate three sections:

COMPARISONS:
${previousVoicings.length > 0 ? `For each previous voicing, write ONE sentence comparing it to the new voicing. What does each emphasize differently? How does its voice differ?
Format:
- Previous 1: [one sentence comparison]
- Previous 2: [one sentence comparison]
etc.` : 'No previous voicings to compare.'}

QUALITIES:
Recognizing the pattern across all voicings (new + previous), identify exactly 3 key qualities that resonate through this pattern.
For each quality, suggest 3 other patterns that share this quality. Use dot notation for compound patterns (e.g., coral.reef, morning.ritual).
Format:
- Quality Name: brief description | pattern1, pattern2, pattern3

INQUIRY_CONTEXT:
In 2-3 sentences, establish who you are as this pattern for conversational engagement.`
        }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error('Failed to generate analysis');
    }

    const fullText = data.content?.[0]?.text;

    return NextResponse.json({ analysis: fullText });

  } catch (error) {
    console.error('Synthesis error:', error);
    return NextResponse.json(
      { error: 'Failed to generate analysis' },
      { status: 500 }
    );
  }
}
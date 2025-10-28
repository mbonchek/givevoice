# Current State Summary

## Core Functionality
The app is a pattern voicing system where AI gives voice to patterns (like `{mountain}`, `{river}`, etc.) as intelligent entities rather than describing them.

## Key Routes
- `/` - Homepage
- `/[pattern]` - Pattern homepage (e.g., `/mountain`) showing synthesis, history, and stats
- `/[pattern]/new` - Generate new voicing (e.g., `/mountain/new`)
- `/[pattern]/[id]` - Individual voicing detail page

## Pattern Generation System

### Three-part synthesis (`/api/synthesize-pattern`)
- **LEFT BRAIN**: Analytical perspective (600 tokens)
- **RIGHT BRAIN**: Intuitive perspective (600 tokens)
- **SYNTHESIS**: Whole mind integration (800 tokens)
- Auto-generates every 5 new voicings
- Stores versions in `pattern_syntheses` table

### Voicing Creation (`/api/generate`)
1. Generates voicing text via Claude Sonnet 4
2. Identifies resonances (related patterns)
3. Creates sample questions
4. Stores in `voicings` table with JSONB fields

### Voicing Analysis (`/api/analyze-voicing`)
- Generates `headline` (2-3 words)
- Generates `self_distillation` (one sentence summary)
- Stores as JSONB in `analysis` column

## Data Structure

### Key tables
- `voicings` - Main voicing data with JSONB columns: `resonances`, `sample_questions`, `analysis`
- `pattern_syntheses` - LEFT/RIGHT/SYNTHESIS with version tracking
- `paragraph_hearts` - User hearts on specific paragraphs
- `pattern_inquiries` - Q&A conversations about voicings
- `user_profiles` - User data linked to Supabase Auth

### Resonances format
```json
{
  "title": "river",
  "phrase": "how to catch clouds and birth rivers",
  "description": "I felt myself being spoken..."
}
```

## Recent Fixes (Oct 27, 2024)

1. **Resonance phrase display** - Fixed `/app/[pattern]/new/page.js:191` where phrases were hardcoded to empty string instead of using `r.phrase`
2. **Pattern history removal** - Replaced collapsible history section with clean engagement stats on `/new` page
3. **Pattern title link** - Fixed to use `/{pattern}` instead of `/patterns/{pattern}`

## Display on Pattern Pages

### Pattern Homepage (`/app/[pattern]/page.js`)
- Three-column synthesis (LEFT | RIGHT | SYNTHESIS)
- Recent voicings with: headline, distillation, resonances (one line), sample questions (bullets)
- Stats: total voicings, contributors

### Voicing Page (`/app/[pattern]/new/page.js`)
- Voicing text (revealed paragraph by paragraph)
- Resonances (expandable, links to related patterns)
- Sample questions (clickable to start chat)
- Chat interface for inquiries
- Heart button for passages
- Engagement stats at bottom (voicings/hearts/explorations counts)

## Tech Stack
- Next.js 15 (App Router)
- PostgreSQL (via Supabase pooler)
- Supabase Auth
- Claude Sonnet 4 (`claude-sonnet-4-20250514`)

## Database Connection
PostgreSQL via Supabase pooler:
```
postgresql://postgres.fadlvgbtdyjtzgyepopg:give-voice-to-patterns@aws-1-us-east-2.pooler.supabase.com:6543/postgres
```

## Key API Endpoints
- `/api/generate` - Generate new voicing
- `/api/resonance` - Identify pattern resonances
- `/api/sample-questions` - Generate sample questions
- `/api/analyze-voicing` - Analyze voicing for distillation/headline
- `/api/synthesize-pattern` - Generate three-part synthesis
- `/api/pattern-history` - Fetch pattern history and stats
- `/api/pattern-hearts` - Fetch hearts for a pattern
- `/api/heart` - Add/remove hearts
- `/api/inquiry` - Handle Q&A conversations

All systems working correctly as of Oct 27, 2024.

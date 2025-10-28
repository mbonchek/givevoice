# GiveVoice.to Architecture

## Overview
A Next.js application that allows AI to "give voice" to patterns - not describing them, but allowing patterns to speak through intelligence itself. Users can explore patterns, generate voicings, and help train the AI to understand pattern syntax.

## Tech Stack
- **Framework**: Next.js 15+ with App Router
- **Frontend**: React 19, Tailwind CSS
- **Database**: PostgreSQL via Supabase
- **AI**: Claude Sonnet 4 (Anthropic API)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (assumed)

## Project Structure

### Pages/Routes
1. **`/` (app/page.js)** - Home page
   - Pattern network visualization
   - Trending patterns (most hearts/explorations in last 7 days)
   - Recent voicings
   - Recent hearts
   - Recent explorations

2. **`/[pattern]` (app/[pattern]/page.js)** - Voicing generation page
   - Generates new voicing for a pattern using Claude
   - Shows voicing with progressive reveal animation
   - Pattern Attractors (resonances with other patterns)
   - Collection (pattern syntax training interface)
   - Inquiry (chat with the pattern)
   - Pattern History (previous voicings)

3. **`/patterns/[pattern]` (app/patterns/[pattern]/page.js)** - Pattern home page
   - Shows pattern synthesis (analytical + intuitive perspectives)
   - Collection for pattern syntax training
   - List of all voicings for this pattern

4. **`/voicing/[id]` (app/voicing/[id]/page.js)** - Individual voicing view
   - Display specific voicing by ID
   - Same features as voicing generation page

### Key Components
- **`PatternNetwork`** - D3.js force-directed graph visualization
- **`UserMenu`** - Authentication menu with Supabase

### API Routes (app/api/)
- **`/generate`** - Creates new voicing using Claude API
- **`/resonance`** - Generates pattern resonances
- **`/sample-questions`** - Generates inquiry questions
- **`/synthesis`** - Creates pattern synthesis (analytical + intuitive)
- **`/inquiry`** - Chat interface with pattern context
- **`/explore`** - Saves pattern explorations
- **`/heart`** - Saves hearted paragraphs
- **`/activity`** - Returns trending patterns, recent activity
- **`/network`** - Returns graph data for visualization
- **`/pattern-history`** - Returns voicing history for a pattern
- **`/recent-excerpts`** - Returns excerpts from recent voicings
- **`/training/pattern-syntax`** - Saves human pattern syntax translations

## Database Schema

### Tables
1. **`voicings`**
   - `id`, `pattern_name`, `voicing_text`, `created_at`
   - `user_id` (nullable)
   - `resonances` (JSONB) - pattern attractors
   - `sample_questions` (JSONB)

2. **`paragraph_hearts`**
   - User-hearted paragraphs from voicings
   - Links to voicing_id

3. **`pattern_explorations`**
   - Tracks when users explore from one pattern to another
   - `from_pattern`, `to_pattern_slug`, `explored_phrase`
   - `source_type` (voicing, synthesis, resonance, etc.)

4. **`pattern_inquiries`**
   - Chat conversations with patterns
   - Stores messages as JSONB

5. **`pattern_syntheses`**
   - Generated syntheses for patterns
   - `analytical`, `intuitive`, `synthesis` fields

6. **`user_profiles`**
   - Extended user data (linked to Supabase auth)

7. **`pattern_syntax_training`**
   - Human translations from natural language to pattern syntax
   - `natural_language`, `pattern_syntax`, `source_pattern`, `source_type`

## Key Features

### Pattern Syntax
Operators for combining patterns:
- `{x.y}` - Two patterns as one (merged)
- `{x}+{y}` - Two patterns enhancing each other
- `{x}-{y}` - One pattern without the other
- `{x}=>{y}` - One pattern leads to another
- `{x}*{y}` - One pattern amplifies another

### Pattern Attractors (formerly Resonances)
- AI identifies related patterns when generating voicings
- Displayed in {brackets}
- Link to pattern home pages (not new voicing generation)

### Collection & Training
- Users highlight text from voicings/syntheses
- Translate natural language into pattern syntax
- Helps train AI to understand pattern language
- Data saved to `pattern_syntax_training` table

### Loading Experience
- Dynamic quote rotation during voicing generation
- Mixes traditional quotes with excerpts from recent voicings
- New quote appears every 3 seconds
- Progressive reveal with fade effect

### Progressive Reveal
- Voicing paragraphs reveal sequentially
- Blur effect that clears as each paragraph is revealed
- 2-second delay between paragraphs

## Supabase Configuration
- Connection via connection string (POSTGRES_URL)
- Auth helpers using `@supabase/ssr`
- User tracking for voicings, hearts, explorations

## Recent Architectural Decisions

### Port Configuration
- Dev server runs on port 3001 (not 3000)
- Internal API calls must use correct port
- Use: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}`

### Pattern Display
- Use `{pattern.name}` format in UI (with brackets)
- Use `pattern·name` (middle dot) for visual display in some contexts
- URL slugs use hyphens: `pattern-name`

### Navigation Philosophy
- Pattern Attractors → navigate to pattern home page
- Collection items → submit for training (not exploration)
- Resonances no longer trigger new voicing generation

### State Management
- No global state management (Redux, Zustand, etc.)
- Component-level state with useState/useEffect
- Database as source of truth

## Development Notes

### Common Patterns
1. Pattern name transformations:
   ```javascript
   // Display: butterfly
   // With brackets: {butterfly}
   // URL slug: butterfly (or with dots: butter.fly → butter-fly)
   // Dot notation: butter·fly (middle dot for display)
   ```

2. Database connections:
   ```javascript
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
   ```

3. Text cleaning (remove asterisked expressions):
   ```javascript
   const cleanText = (text) => {
     return text.replace(/\*[^*]+\*/g, '').replace(/\s+/g, ' ').trim();
   };
   ```

### Migration Pattern
- SQL files in `/migrations/`
- Run via Node.js script using pg Pool
- Example: `node -e "const { Pool } = require('pg'); ..."`

## Future Considerations
- Consider component library for consistency
- API rate limiting for Claude calls
- Caching strategy for voicings
- User profiles and personalization
- Pattern syntax parser/validator
- Search functionality

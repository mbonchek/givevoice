# Recent Changes & Development Notes

## Latest Session (January 2025)

### Pattern Attractors Update
**Changed "Resonances" to "Pattern Attractors"**
- Updated label from "Resonances" to "Pattern Attractors"
- Subtitle changed to "Pattern attractors emerging from this voicing"
- Pattern names now display in {brackets} format: `{butterfly}` instead of `butterfly`
- Changed navigation behavior: now links to pattern home page (`/patterns/{pattern}`) instead of generating new voicing
- Changed from button to Next.js Link component
- **File**: `app/[pattern]/page.js` lines 533-576

### Pattern History Fixes
**Improved Pattern History section on voicing page**
- Fixed "Read more" functionality by adding `id` attribute to paragraph element
- Reduced font sizes to be more subtle (history is secondary):
  - Date and heart count: `text-sm` → `text-xs`
  - Voicing text: added `text-sm`
  - Read more button: `text-sm` → `text-xs`
- Changed button color from blue to purple to match site theme
- **File**: `app/[pattern]/page.js` lines 727-762

### Collection Training System
**Converted Collection from exploration to training interface**
- Changed from "click to explore" buttons to pattern syntax training UI
- Two-column grid layout:
  - Left: Natural language (the highlighted phrase)
  - Right: Pattern syntax input field
- Added "Submit" button to save training data
- Added trash icon to remove items from collection
- Added "Help with pattern syntax →" button
- Only shows Collection section when items exist
- **Files**:
  - `app/[pattern]/page.js` lines 542-600 (UI)
  - `app/[pattern]/page.js` lines 316-349 (handleSubmitTraining function)
  - `app/[pattern]/page.js` lines 839-922 (help modal)

### Dynamic Loading Quotes
**Enhanced loading experience with rotating quotes**
- Changed from single static quote to dynamic rotation
- Quotes appear progressively every 3 seconds during loading
- Mix of traditional quotes + excerpts from recent voicings
- Visual reveal effect:
  - Newest quote: full opacity and normal scale
  - Previous quotes: fade to 40% opacity and scale to 95%
  - Smooth transitions with CSS animations
- Quotes shuffle randomly on each page load
- **Files**:
  - `app/[pattern]/page.js` lines 92-138 (logic)
  - `app/[pattern]/page.js` lines 494-517 (display)

## Previous Features (Already Implemented)

### Pattern Syntax Training
- Database table: `pattern_syntax_training`
- API endpoint: `/api/training/pattern-syntax`
- Saves human translations from natural language to pattern syntax
- Tracks source (voicing, synthesis) and source pattern
- **Migration**: `migrations/006_add_pattern_syntax_training.sql`

### Pattern Synthesis
- Generates three perspectives on a pattern:
  - LEFT: Analytical perspective (categorization, analysis)
  - RIGHT: Intuitive perspective (pattern speaking for itself)
  - SYNTHESIS: Integration of both
- Stored in `pattern_syntheses` table
- API endpoint: `/api/synthesis`

### Pattern Explorations
- Tracks navigation between patterns
- Records source type (voicing, synthesis, resonance, etc.)
- Stored in `pattern_explorations` table
- Used for trending patterns calculation

### Home Page Activity
- Trending patterns (based on hearts + explorations in last 7 days)
- Shows synthesis date when available
- Shows top 3 resonating patterns
- Recent explorations tab showing pattern connections
- **File**: `app/page.js`

## Bug Fixes

### Critical: Voicing Generation Port Issue
**Problem**: Voicings weren't generating, pattern associations were missing
**Error**: `SyntaxError: Unexpected token '<', "<!DOCTYPE"... is not valid JSON`
**Root Cause**: `/api/generate` was calling other APIs at `localhost:3000` but server runs on port `3001`
**Fix**: Updated both fetch URLs in `/app/api/generate/route.js` to use port 3001
**Lines**: 64, 83

### Unblurring Animation Fix
**Problem**: Voicing paragraphs weren't revealing properly
**Fix**: Changed from direct state update to functional setState pattern
**Change**: `setRevealedParagraphs(i + 1)` → `setRevealedParagraphs(prev => i + 1)`

## Environment Variables
```
POSTGRES_URL=postgresql://postgres.fadlvgbtdyjtzgyepopg:give-voice-to-patterns@aws-1-us-east-2.pooler.supabase.com:6543/postgres
ANTHROPIC_API_KEY=[your key]
NEXT_PUBLIC_SITE_URL=http://localhost:3001 (for production: https://yoursite.com)
NEXT_PUBLIC_SUPABASE_URL=[your supabase url]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your supabase anon key]
```

## Development Commands
```bash
npm run dev          # Start dev server on port 3001
npm run build        # Production build
npm run start        # Start production server

# Run migrations
node -e "const { Pool } = require('pg'); const fs = require('fs'); const pool = new Pool({connectionString: 'postgresql://...', ssl: { rejectUnauthorized: false }}); const sql = fs.readFileSync('migrations/XXX.sql', 'utf8'); pool.query(sql).then(() => { console.log('✅ Migration completed'); return pool.end(); }).catch(err => { console.error('❌ Migration failed:', err.message); pool.end(); process.exit(1); });"
```

## Known Issues / Tech Debt
None currently tracked. Consider adding:
- Loading states for API calls
- Error boundaries for React components
- Retry logic for failed API calls
- Rate limiting for Claude API
- Caching strategy for voicings

## Next Steps / Ideas
- Consider adding pattern syntax validation
- Add search functionality
- User profile pages
- Pattern recommendations
- Export/share functionality
- Analytics dashboard

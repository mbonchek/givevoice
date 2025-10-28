-- Migration: Add analysis field to voicings table

-- Add analysis column to store the flavor/essence of each voicing
ALTER TABLE voicings
ADD COLUMN analysis JSONB;

-- Add index for querying analysis
CREATE INDEX idx_voicings_analysis ON voicings USING GIN (analysis);

-- Analysis structure will be:
-- {
--   "themes": ["patience", "perspective", "endurance"],
--   "essence": "A meditation on geological time and stillness",
--   "tone": "contemplative",
--   "key_phrases": ["slow conversation", "patience that outlasts"],
--   "analyzed_at": "2025-01-15T10:30:00Z"
-- }

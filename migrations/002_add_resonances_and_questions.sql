-- Add columns to store resonances and sample questions with the voicing
ALTER TABLE voicings
ADD COLUMN resonances JSONB,
ADD COLUMN sample_questions JSONB;

-- Add index for querying by pattern to analyze associations
CREATE INDEX idx_voicings_pattern ON voicings(pattern_name);

-- Add index for full-text search on voicing text (for future LLM training queries)
CREATE INDEX idx_voicings_text_search ON voicings USING gin(to_tsvector('english', voicing_text));

COMMENT ON COLUMN voicings.resonances IS 'Stores the resonances (related patterns) as JSON array of {title, description}';
COMMENT ON COLUMN voicings.sample_questions IS 'Stores the sample questions as JSON array of strings';

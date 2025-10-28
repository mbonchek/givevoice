-- Add source tracking to pattern_explorations
ALTER TABLE pattern_explorations
ADD COLUMN source_type TEXT DEFAULT 'resonance',
ADD COLUMN source_id INTEGER; -- Can reference voicing_id or synthesis_id

-- Add index for source queries
CREATE INDEX idx_pattern_explorations_source ON pattern_explorations(source_type);

-- Add comment for clarity
COMMENT ON COLUMN pattern_explorations.source_type IS 'Where the exploration originated: resonance, synthesis, voicing, etc.';
COMMENT ON COLUMN pattern_explorations.source_id IS 'ID of the source (voicing_id, synthesis_id, etc.)';

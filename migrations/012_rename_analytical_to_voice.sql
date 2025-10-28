-- Rename analytical column to voice for clarity
ALTER TABLE pattern_syntheses
  RENAME COLUMN analytical TO voice;

-- Update comment
COMMENT ON COLUMN pattern_syntheses.voice IS 'The synthesized voice speaking as the pattern (text)';

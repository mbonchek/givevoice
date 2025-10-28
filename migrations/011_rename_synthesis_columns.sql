-- Rename pattern_syntheses columns to be clearer
ALTER TABLE pattern_syntheses
  RENAME COLUMN intuitive TO connections;

ALTER TABLE pattern_syntheses
  RENAME COLUMN synthesis TO invitations;

-- Update comments to document the structure
COMMENT ON COLUMN pattern_syntheses.analytical IS 'The synthesized voice speaking as the pattern (text)';
COMMENT ON COLUMN pattern_syntheses.connections IS 'Array of connected patterns with phrases and descriptions (JSONB)';
COMMENT ON COLUMN pattern_syntheses.invitations IS 'Array of invitation questions (JSONB)';

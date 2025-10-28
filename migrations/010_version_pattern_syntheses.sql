-- Add version column to track synthesis evolution
ALTER TABLE pattern_syntheses
ADD COLUMN version INTEGER DEFAULT 1;

-- Create index for efficient querying of latest version
CREATE INDEX idx_pattern_syntheses_version ON pattern_syntheses(pattern_name, version DESC);

-- Update existing syntheses to have version numbers based on creation date
WITH numbered AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY pattern_name ORDER BY created_at) as row_num
  FROM pattern_syntheses
)
UPDATE pattern_syntheses
SET version = numbered.row_num
FROM numbered
WHERE pattern_syntheses.id = numbered.id;

-- Add comment explaining the versioning
COMMENT ON COLUMN pattern_syntheses.version IS 'Version number showing evolution of pattern understanding. Increments with each new synthesis (typically every 5 voicings).';

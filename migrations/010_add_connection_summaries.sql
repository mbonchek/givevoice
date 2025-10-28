-- Add connection_summaries column to pattern_syntheses table
ALTER TABLE pattern_syntheses
ADD COLUMN IF NOT EXISTS connection_summaries JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN pattern_syntheses.connection_summaries IS 'Aggregated summaries of resonances for each connected pattern, stored as {pattern_name: summary}';

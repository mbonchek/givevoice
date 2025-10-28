-- Create table to store pattern syntheses over time
CREATE TABLE pattern_syntheses (
  id SERIAL PRIMARY KEY,
  pattern_name TEXT NOT NULL,
  analytical TEXT NOT NULL,
  intuitive TEXT NOT NULL,
  synthesis TEXT NOT NULL,
  voicing_count INTEGER NOT NULL,
  heart_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for pattern lookups and temporal analysis
CREATE INDEX idx_pattern_syntheses_pattern ON pattern_syntheses(pattern_name);
CREATE INDEX idx_pattern_syntheses_created ON pattern_syntheses(created_at);
CREATE INDEX idx_pattern_syntheses_pattern_time ON pattern_syntheses(pattern_name, created_at);

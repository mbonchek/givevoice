-- Pattern syntax training data
-- This captures human translations of natural language to pattern syntax
-- Used to train AI in understanding pattern language conventions

CREATE TABLE pattern_syntax_training (
  id SERIAL PRIMARY KEY,
  natural_language TEXT NOT NULL,
  pattern_syntax TEXT NOT NULL,
  source_pattern TEXT,  -- Which pattern page this was submitted from
  source_type TEXT DEFAULT 'synthesis',  -- Where the phrase came from
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for querying training examples
CREATE INDEX idx_pattern_syntax_training_created ON pattern_syntax_training(created_at);
CREATE INDEX idx_pattern_syntax_training_source ON pattern_syntax_training(source_pattern);

-- Comments
COMMENT ON TABLE pattern_syntax_training IS 'Human-provided translations from natural language to pattern syntax for AI training';
COMMENT ON COLUMN pattern_syntax_training.natural_language IS 'The phrase in natural language';
COMMENT ON COLUMN pattern_syntax_training.pattern_syntax IS 'The corresponding pattern syntax';
COMMENT ON COLUMN pattern_syntax_training.source_pattern IS 'Pattern page where this was submitted';
COMMENT ON COLUMN pattern_syntax_training.source_type IS 'Origin of the phrase (synthesis, voicing, etc)';

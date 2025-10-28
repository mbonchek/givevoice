-- Create table to store pattern inquiry conversations (Q&A)
CREATE TABLE pattern_inquiries (
  id SERIAL PRIMARY KEY,
  voicing_id INTEGER REFERENCES voicings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for efficient querying
CREATE INDEX idx_pattern_inquiries_voicing ON pattern_inquiries(voicing_id);
CREATE INDEX idx_pattern_inquiries_user ON pattern_inquiries(user_id);
CREATE INDEX idx_pattern_inquiries_created ON pattern_inquiries(created_at DESC);

-- Enable Row Level Security
ALTER TABLE pattern_inquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Anyone can read, only authenticated users can create
CREATE POLICY "Pattern inquiries are viewable by everyone"
  ON pattern_inquiries FOR SELECT
  USING (true);

CREATE POLICY "Users can create pattern inquiries"
  ON pattern_inquiries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE pattern_inquiries IS 'Stores questions asked to patterns and their answers - building a rich dataset of pattern-human dialogues';
COMMENT ON COLUMN pattern_inquiries.question IS 'The question asked to the pattern';
COMMENT ON COLUMN pattern_inquiries.answer IS 'The patterns response';

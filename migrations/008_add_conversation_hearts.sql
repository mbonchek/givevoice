-- Migration: Add support for hearting conversations (pattern_inquiries)

-- Add inquiry_id to allow hearting conversations
ALTER TABLE paragraph_hearts
ADD COLUMN inquiry_id INTEGER REFERENCES pattern_inquiries(id) ON DELETE CASCADE;

-- Make voicing_id nullable since we can now heart either a voicing OR a conversation
ALTER TABLE paragraph_hearts
ALTER COLUMN voicing_id DROP NOT NULL;

-- Add check constraint to ensure either voicing_id or inquiry_id is set (but not both)
ALTER TABLE paragraph_hearts
ADD CONSTRAINT heart_type_check CHECK (
  (voicing_id IS NOT NULL AND inquiry_id IS NULL) OR
  (voicing_id IS NULL AND inquiry_id IS NOT NULL)
);

-- Add index for performance
CREATE INDEX idx_paragraph_hearts_inquiry_id ON paragraph_hearts(inquiry_id);

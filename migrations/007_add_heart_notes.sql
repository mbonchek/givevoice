-- Migration: Add notes to paragraph_hearts

ALTER TABLE paragraph_hearts
ADD COLUMN note TEXT;

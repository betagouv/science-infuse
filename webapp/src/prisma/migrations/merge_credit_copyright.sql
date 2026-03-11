-- Migration to merge copyright into credit field and remove copyright column
-- This migration should be run manually before applying the schema changes

-- Step 1: For Document table, merge copyright into credit where credit is NULL or empty
UPDATE "Document" 
SET credit = COALESCE(NULLIF(TRIM(credit), ''), copyright)
WHERE (credit IS NULL OR TRIM(credit) = '') 
  AND copyright IS NOT NULL 
  AND TRIM(copyright) != '';

-- Step 2: For Draft table, merge copyright into credit where credit is NULL or empty
UPDATE "Draft" 
SET credit = COALESCE(NULLIF(TRIM(credit), ''), copyright)
WHERE (credit IS NULL OR TRIM(credit) = '') 
  AND copyright IS NOT NULL 
  AND TRIM(copyright) != '';

-- Step 3: Remove the copyright column from Document table
ALTER TABLE "Document" DROP COLUMN IF EXISTS copyright;

-- Step 4: Remove the copyright column from Draft table
ALTER TABLE "Draft" DROP COLUMN IF EXISTS copyright;


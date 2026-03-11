-- Ensure default source uses correct casing.
ALTER TABLE "Document" ALTER COLUMN "source" SET DEFAULT 'Universcience';

-- Normalize existing rows that still have the old default.
UPDATE "Document"
SET "source" = 'Universcience'
WHERE "source" = 'UniverScience';

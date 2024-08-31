-- Enable the pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the Document table
CREATE TABLE IF NOT EXISTS "Document" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "s3_object_name" TEXT NOT NULL,
  "original_path" TEXT NOT NULL,
  "public_path" TEXT,
  "media_name" TEXT NOT NULL
);

-- Create the DocumentChunk table
CREATE TABLE IF NOT EXISTS "DocumentChunk" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  text_embedding vector(768),
  title TEXT NOT NULL,
  "media_type" TEXT NOT NULL,
  "document_id" UUID NOT NULL,
  FOREIGN KEY ("document_id") REFERENCES "Document"(id)
);

-- Create the DocumentChunkMeta table
CREATE TABLE IF NOT EXISTS "DocumentChunkMeta" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "s3_object_name" TEXT,
  "page_number" INTEGER,
  "bbox" JSONB,
  "type" TEXT,
  "start" FLOAT,
  "end" FLOAT,
  "question" TEXT,
  "answer" TEXT,
  "url" TEXT,
  "document_chunk_id" UUID UNIQUE NOT NULL,
  FOREIGN KEY ("document_chunk_id") REFERENCES "DocumentChunk"(id)
);

-- Create an efficient index for text_embedding using HNSW index only if it does not already existq
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'DocumentChunk'
  ) AND NOT EXISTS (
    SELECT FROM pg_indexes
    WHERE schemaname = 'public' 
      AND tablename = 'DocumentChunk' 
      AND indexname = 'DocumentChunk_text_embedding_idx'
  ) THEN
    EXECUTE 'CREATE INDEX idx_document_chunk_text_embedding ON "DocumentChunk" USING hnsw (text_embedding vector_cosine_ops)';
  END IF;
END $$;


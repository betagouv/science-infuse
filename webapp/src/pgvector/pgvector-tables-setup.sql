-- Enable the pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the Document table
CREATE TABLE IF NOT EXISTS "Document" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "s3ObjectName" TEXT NOT NULL,
  "originalPath" TEXT NOT NULL,
  "publicPath" TEXT,
  "mediaName" TEXT NOT NULL
);

-- Create the DocumentChunk table
CREATE TABLE IF NOT EXISTS "DocumentChunk" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  text_embedding vector(768),
  title TEXT NOT NULL,
  "mediaType" TEXT NOT NULL,
  "documentId" UUID NOT NULL,
  FOREIGN KEY ("documentId") REFERENCES "Document"(id)
);

-- Create the DocumentChunkMeta table
CREATE TABLE IF NOT EXISTS "DocumentChunkMeta" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "s3ObjectName" TEXT,
  "pageNumber" INTEGER,
  bbox JSONB,
  type TEXT,
  start FLOAT,
  "end" FLOAT,
  question TEXT,
  answer TEXT,
  url TEXT,
  "documentChunkId" UUID UNIQUE NOT NULL,
  FOREIGN KEY ("documentChunkId") REFERENCES "DocumentChunk"(id)
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


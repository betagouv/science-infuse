-- ALTER TABLE "DocumentChunk" ALTER COLUMN "textEmbedding" TYPE vector(768);
-- ALTER TABLE "Block" ALTER COLUMN "textEmbedding" TYPE vector(768);
-- 
-- SET maintenance_work_mem = '2GB';
-- DROP INDEX IF EXISTS idx_document_chunk_textEmbedding;
-- CREATE INDEX idx_document_chunk_textEmbedding  ON "DocumentChunk" USING hnsw ("textEmbedding" vector_cosine_ops);
-- DROP INDEX IF EXISTS idx_block_textEmbedding;
-- CREATE INDEX idx_block_textEmbedding  ON "Block" USING hnsw ("textEmbedding" vector_cosine_ops);

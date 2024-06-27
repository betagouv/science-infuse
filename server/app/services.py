from langchain_text_splitters import CharacterTextSplitter

from SIWeaviateClient import SIWeaviateClient

from schemas import DocumentChunk, MediaType
from processing.audio.SIWhisperModel import SIWhisperModel

# TODO: group whisper chunks by larger groups
def add_video_chunks(original_public_path: str, file_path: str, document_id: str):
    whisper = SIWhisperModel('medium', 'whisper-medium')
    chunks = whisper.get_srt(file_path)
    
    # Configure batch with desired batch size
    with SIWeaviateClient() as client:
        client.batch.configure(batch_size=100)
        
        with client.collections.get("DocumentChunk").batch.dynamic() as batch:
            for chunk in chunks:
                documentChunk = DocumentChunk(
                    chunk=chunk.text, 
                    document_id=document_id, 
                    local_path=file_path,
                    original_public_path=original_public_path,
                    media_type=MediaType.TEXT,
                    start_offset=chunk.start, 
                    end_offset=chunk.start + chunk.duration
                )
                batch.add_object(
                    properties=documentChunk.model_dump()
                )


text_splitter = CharacterTextSplitter(
    separator="\n\n",
    chunk_size=1000,
    chunk_overlap=200,
    length_function=len,
    add_start_index=True,
    is_separator_regex=False,
)
def add_text_chunks(original_public_path: str, file_path: str, document_id: str):
    with open(file_path) as f:
        file = f.read()
        text_chunks = text_splitter.create_documents([file])
        with SIWeaviateClient() as client:
            with client.collections.get("DocumentChunk").batch.dynamic() as batch:
                for chunk in text_chunks:
                    # print("CHUNK METADATA:", chunk.metadata)
                    start_index = chunk.metadata['start_index']
                    end_index = start_index + len(chunk.page_content)
                    documentChunk = DocumentChunk(
                        chunk=chunk.page_content, 
                        document_id=document_id, 
                        local_path=file_path, 
                        original_public_path=original_public_path,
                        media_type=MediaType.TEXT,
                        start_offset=start_index, 
                        end_offset=end_index
                    )
                    batch.add_object(
                        properties=documentChunk.model_dump()
                    )


from langchain_text_splitters import CharacterTextSplitter

from SIWeaviateClient import SIWeaviateClient

from schemas import UserApproveQuery
from processing.audio.SIWhisperModel import SIWhisperModel

# TODO: NOT UP TO DATE
def add_video_chunks(original_path: str, file_path: str, document_id: str):
    pass
def add_text_chunks(original_path: str, file_path: str, document_id: str):
    pass

def approve_document(query: UserApproveQuery):
    with SIWeaviateClient() as client:
        document = client.collections.get("Document")
        document.data.update(
            uuid=query.uuid,
            properties={
                "user_approved": query.approve,
            }
        )

def approve_document_chunk(query: UserApproveQuery):
    updated_properties = {
        "user_approved": query.approve,
        "user_disapproved": not query.approve,
    }
    
    with SIWeaviateClient() as client:
        documentChunk = client.collections.get("DocumentChunk")
        documentChunk.data.update(
            uuid=query.uuid,
            properties=updated_properties
        )


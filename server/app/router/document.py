from typing import List
from fastapi import APIRouter, Query, UploadFile, File, Form
from SIWeaviateClient import SIWeaviateClient
from document_table_of_content import TOCItem, TableOfContents, get_document_toc
from services import add_video_chunks, add_text_chunks
import uuid

router = APIRouter()

@router.post("/upload")
async def upload_document(file: UploadFile = File(...), media_type: str = Form(...), public_path: str = Form(...)):
    document_id = str(uuid.uuid4())
    file_location = f"./{file.filename}"
    with open(file_location, "wb+") as file_object:
        file_object.write(file.file.read())
    
    if media_type == "video":
        add_video_chunks("original file path", file_location, document_id)
    elif media_type == "text":
        add_text_chunks("original file path", file_location, document_id)
    else:
        return {"message": "Unsupported media type"}
    
    return {"message": f"Document {file.filename} uploaded and indexed successfully.", "document_id": document_id}

@router.post("/toc")
async def get_toc(document_uuid: str = Query(...)) -> TableOfContents:
    with SIWeaviateClient() as client:
        return get_document_toc(client=client, document_uuid=document_uuid)
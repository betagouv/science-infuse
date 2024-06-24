from fastapi import APIRouter, UploadFile, File, Form
from app.services import add_video_chunks, add_text_chunks
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

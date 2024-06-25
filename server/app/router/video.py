from fastapi import APIRouter
from services import add_video_chunks, list_videos
from fastapi import UploadFile, File
from typing import List

router = APIRouter()

@router.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    file_location = f"../tests/WhisperVideoTransctiption/{file.filename}"
    with open(file_location, "wb+") as file_object:
        file_object.write(file.file.read())
    add_video_chunks(file_location, file.filename)
    return {"message": f"Video {file.filename} uploaded and indexed successfully."}

@router.get("/list", response_model=List[str])
async def get_video_list():
    return list_videos()

import asyncio
from concurrent.futures import ThreadPoolExecutor
import aiofiles
import os
from processing.YoutubeProcessor import VideoProcessor
from processing.URLProcessor import URLProcessor
from processing.PictureProcessor import PictureProcessor
from processing.PDFProcessor import PDFProcessor
from fastapi import APIRouter, File, UploadFile
from typing import List
from model_loader import image_descriptor, translator, surya, s3, whisper
from processing.text.SIReranker import SIReranker, TextWithScore
from schemas import RerankTextQuery, Document, DocumentChunk
from pydantic import BaseModel

io_executor = ThreadPoolExecutor(max_workers=10)

router = APIRouter()
class DataProcessorResponse(BaseModel):
    chunks: List[DocumentChunk]
    document: Document


async def async_save_file(file: UploadFile, path: str):
    async with aiofiles.open(path, 'wb') as buffer:
        content = await file.read()
        await buffer.write(content)

@router.post("/pdf", response_model=[])
async def _process_pdf(file: UploadFile = File(...)):
    pdf_path = file.filename
    await async_save_file(file, pdf_path)
    
    loop = asyncio.get_running_loop()
    document, chunks = await loop.run_in_executor(
        io_executor,
        lambda: PDFProcessor(image_descriptor, translator, surya, s3, pdf_path).process_document()
    )
 
    response = DataProcessorResponse(
        document=document,
        chunks=chunks
    )

    # os.remove(pdf_path)
    return response

@router.post("/picture", response_model=[])
async def _process_picture(file: UploadFile = File(...)):
    image_path = file.filename
    await async_save_file(file, image_path)
    
    loop = asyncio.get_running_loop()
    document, chunks = await loop.run_in_executor(
        io_executor,
        lambda: PictureProcessor(image_descriptor, translator, s3, image_path).process_document()
    )
 
    response = DataProcessorResponse(
        document=document,
        chunks=chunks
    )

    # os.remove(image_path)
    return response

@router.post("/url", response_model=[])
async def _process_url(data: dict):
    print("indexing url :", data)
    loop = asyncio.get_running_loop()
    document, chunks = await loop.run_in_executor(
            io_executor,
            lambda: URLProcessor(data["url"]).process_document()
        )
    response = DataProcessorResponse(
        document=document,
        chunks=chunks
    )
    return response


@router.post("/youtube", response_model=[])
async def _process_youtube(data: dict):
    print("indexing youtube url :", data)
    loop = asyncio.get_running_loop()
    document, chunks = await loop.run_in_executor(
        io_executor,
        lambda: VideoProcessor(s3=s3, whisper=whisper, youtube_url=data['url'], use_oauth=False).process_document()
    )
    response = DataProcessorResponse(
        document=document,
        chunks=chunks
    )
    return response
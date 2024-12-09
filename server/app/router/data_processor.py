import os
from app.processing.URLProcessor import URLProcessor
from processing.PictureProcessor import PictureProcessor
from processing.PDFProcessor import PDFProcessor
from fastapi import APIRouter, File, UploadFile
from typing import List
from model_loader import image_descriptor, translator, surya, s3
from processing.text.SIReranker import SIReranker, TextWithScore
from schemas import RerankTextQuery, Document, DocumentChunk
from pydantic import BaseModel

class DataProcessorResponse(BaseModel):
    chunks: List[DocumentChunk]
    document: Document

router = APIRouter()

@router.post("/pdf", response_model=[])
async def _process_pdf(file: UploadFile = File(...)):
    with open(file.filename, "wb") as buffer:
        buffer.write(await file.read())
    pdf_path = file.filename

    pdf_to_process = PDFProcessor(image_descriptor, translator, surya, s3, pdf_path)
    document, chunks = pdf_to_process.process_document()
    response = DataProcessorResponse(
        document=document,
        chunks=chunks
    )
    os.remove(pdf_path)
    return response

@router.post("/picture", response_model=[])
async def _process_picture(file: UploadFile = File(...)):
    with open(file.filename, "wb") as buffer:
        buffer.write(await file.read())
    image_path = file.filename

    picture_to_process = PictureProcessor(image_descriptor, translator, s3, image_path)
    document, chunks = picture_to_process.process_document()
    response = DataProcessorResponse(
        document=document,
        chunks=chunks
    )
    os.remove(image_path)
    return response

@router.post("/url", response_model=[])
async def _process_url(data: dict):
    picture_to_process = URLProcessor(data["url"])
    document, chunks = picture_to_process.process_document()
    response = DataProcessorResponse(
        document=document,
        chunks=chunks
    )
    return response
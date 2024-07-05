from SIWeaviateClient import SIWeaviateClient
from processing.PDFProcessor import PDFProcessor
from processing.image.SIImageDescription import SIImageDescription
from processing.text.SIITranslator import SITranslator

image_descriptor = SIImageDescription()
translator = SITranslator()

def process_pdf(pdf_path: str):
    with SIWeaviateClient() as client:
        pdf = PDFProcessor(client, image_descriptor, translator, pdf_path)

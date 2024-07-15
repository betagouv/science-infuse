from SIWeaviateClient import SIWeaviateClient
from S3Storage import S3Storage
from processing.text.SISurya import SISurya
from processing.PDFProcessor import PDFProcessor
from processing.image.SIImageDescription import SIImageDescription
from processing.text.SIITranslator import SITranslator

def process_pdf(pdf_path: str, image_descriptor: SIImageDescription, translator: SITranslator, s3: S3Storage, surya: SISurya):
    try:
        with SIWeaviateClient() as client:
            pdf = PDFProcessor(client, image_descriptor, translator, surya, s3, pdf_path)
        return pdf
    except Exception as e:
        print(f"PDFProcessor : An error occurred", e, flush=True)
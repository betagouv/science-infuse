from googleapiclient.discovery import build
import os
import sys
from weaviate.classes.query import Filter

sys.path.append(os.path.join(os.getcwd(), 'app'))

from weaviate import WeaviateClient
from SIWeaviateClient import SIWeaviateClient
from processing.image.SIImageDescription import SIImageDescription
from processing.text.SIITranslator import SITranslator
from processing.text.SISurya import SISurya
from S3Storage import S3Storage
from processing.PDFProcessor import PDFProcessor

def get_all_pdfs(root_folder: str):
    pdf_files = []
    for root, dirs, files in os.walk(root_folder):
        for file in files:
            if file.endswith(".pdf"):
                pdf_files.append(os.path.join(root, file))
                # pdf_files.append(os.path.abspath(os.path.join(root, file)))
    return pdf_files

def is_document_already_indexed(pdf_path, client: WeaviateClient):
    document = client.collections.get("Document")
    response = document.query.fetch_objects(
        filters=(
            Filter.by_property("original_path").equal(pdf_path)
        ),
        limit=1,
        return_properties=[]
    )
    return len(response.objects) > 0

image_descriptor = SIImageDescription()
s3 = S3Storage()
image_descriptor = SIImageDescription()
translator = SITranslator()
surya = SISurya()

def index_pdfs_from_dir(dir: str):
    with SIWeaviateClient() as client:
        pdf_paths = get_all_pdfs(dir)
        for pdf_path in pdf_paths:
            if (is_document_already_indexed(pdf_path, client)):
                print(f"Already in DB, SKIP INDEXING {pdf_path}")
                continue
            pdf = PDFProcessor(client, image_descriptor, translator, surya, s3, pdf_path)
            print(f"Successfully indexed {pdf_path}", flush=True)



# you can change it to whatever directory containing pdfs, 
# it will skip a file based on it's absolute path on the server (stored as original_path in db) cf : is_document_already_indexed
index_pdfs_from_dir('/home/debian/science-infuse/ftp-data')
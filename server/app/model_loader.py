from S3Storage import S3Storage
from processing.text import SIReranker
from processing.image.SIImageDescription import SIImageDescription
from processing.text.SISurya import SISurya
from processing.text.SIITranslator import SITranslator


image_descriptor = SIImageDescription()
s3 = S3Storage()
translator = SITranslator()
surya = SISurya()
reranker = SIReranker()

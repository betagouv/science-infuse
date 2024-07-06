from surya.model.detection.segformer import load_model, load_processor
from surya.model.ordering.processor import load_processor as load_order_processor
from surya.model.ordering.model import load_model as load_order_model
from surya.settings import settings
from typing import List, Tuple
from surya.postprocessing.heatmap import draw_polys_on_image
from surya.schema import OCRResult, TextDetectionResult, LayoutResult, OrderResult
from PIL import Image
from surya.ordering import batch_ordering
from surya.detection import batch_text_detection
from surya.layout import batch_layout_detection
from surya.model.detection.segformer import load_model, load_processor
from surya.model.ordering.processor import load_processor as load_order_processor
from surya.model.ordering.model import load_model as load_order_model
from PIL import Image
from surya.settings import settings

class SISurya:
    def __init__(self):
        self.det_model, self.det_processor = self.load_det_cached()
        self.layout_model, self.layout_processor = self.load_layout_cached()
        self.order_model, self.order_processor = self.load_order_cached()
        
        # Available labels:
        # ["Caption","Footnote","Formula","List-item","Page-footer","Page-header","Picture","Figure","Section-header","Table","Text","Title"]
        self.TITLES = ["Title"]
        self.SUB_TITLES = ["Section-header", "Page-header"]
        self.TEXTS = ["Text", "List-item"]

    def restructure_text(self, text:str) -> str:
        """
        Restructures the given text by combining lines that start with '- ' into a single line, and removing leading/trailing whitespace from each line.
        It aims to deal with bullet lists in texts extracted from pdf 
        """
        lines = text.split('\n')
        result = []
        current_line = ''

        for line in lines:
            if line.startswith('- '):
                if current_line:
                    result.append(current_line.strip())
                current_line = line
            else:
                current_line += ' ' + line.strip()

        if current_line:
            result.append(current_line.strip())

        return '\n'.join(result)
    
    def process_images(self, images: List[Image.Image], batch_size=5):
        return self.order_detection(images, batch_size=batch_size)

    def load_det_cached(self):
        checkpoint = settings.DETECTOR_MODEL_CHECKPOINT
        return load_model(checkpoint=checkpoint), load_processor(checkpoint=checkpoint)

    def load_layout_cached(self):
        return load_model(checkpoint=settings.LAYOUT_MODEL_CHECKPOINT), load_processor(checkpoint=settings.LAYOUT_MODEL_CHECKPOINT)

    def load_order_cached(self):
        return load_order_model(), load_order_processor()
    
    def texts_detection(self, images: List[Image.Image], batch_size=10) -> List[TextDetectionResult]:
        preds = batch_text_detection(images, self.det_model, self.det_processor, batch_size=batch_size)
        return preds

    def layout_detection(self, images: List[Image.Image], batch_size=10) -> List[LayoutResult]:
        _det_preds = self.texts_detection(images, batch_size=batch_size)
        preds = batch_layout_detection(images, self.layout_model, self.layout_processor, _det_preds, batch_size=batch_size)
        return preds

    def order_detection(self, images: List[Image.Image], batch_size=10) -> Tuple[List[Image.Image], List[OrderResult], List[List[str]]]:
        layout_preds = self.layout_detection(images, batch_size=batch_size)
        all_bboxes: List[List[List[float]]] = []
        all_labels: List[List[str]] = []
        for layout_pred in layout_preds:
            bboxes = [l.bbox for l in layout_pred.bboxes]
            labels = [l.label for l in layout_pred.bboxes]
            all_labels.append(labels)
            all_bboxes.append(bboxes)
        preds = batch_ordering(images, all_bboxes, self.order_model, self.order_processor, batch_size=batch_size)
        all_polys:List[List[List[List[float]]]] = []
        all_positions:List[List[str]] = []
        for pred in preds:
            polys = [l.polygon for l in pred.bboxes]
            all_polys.append(polys)
            positions = [str(l.position) for l in pred.bboxes]
            all_positions.append(positions)

        order_imgs: List[Image.Image] = []
        for idx, img in enumerate(images):
            order_img = draw_polys_on_image(all_polys[idx], img.copy(), labels=all_positions[idx], label_font_size=20)
            order_imgs.append(order_img)
        return order_imgs, preds, all_labels
    
    

    

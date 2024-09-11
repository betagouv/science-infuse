from schemas import Document, WebsiteQAChunk, WebsiteQAMetadata

from playwright.sync_api import sync_playwright, Page, Playwright, Browser

import os
import uuid
from typing import List, Tuple
from weaviate import WeaviateClient
from processing.BaseDocumentProcessor import BaseDocumentProcessor

from tenacity import retry, stop_after_attempt, wait_exponential
import logging
import traceback

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CiteScienceQA(BaseDocumentProcessor):
    """
    Process question answer from a page like : https://www.cite-sciences.fr/fr/au-programme/lieux-ressources/cite-de-la-sante/une-question-en-sante/questions-sante/toutes-les-questions/2020/01/calcium-et-maladie-de-forestier
    """
    def __init__(self, browser: Browser, qa_url: str):
        self.browser = browser
        self.qa_url = qa_url
        super().__init__()


    def extract_document(self) -> Tuple[Document, List[WebsiteQAChunk]]:
        page = self.browser.new_page()
        document, chunk = self.get_qa_from_url(self.qa_url, page)
        page.close()
        return document, [chunk]

    # @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    def get_qa_from_url(self, url: str, page: Page):
        try:
            page.goto(url)
            page.wait_for_selector("article>h1")
            title = page.query_selector("article>h1").text_content()

            post_parts = page.query_selector_all(".post-question")
            question_elem = post_parts[0].query_selector('p')
            question = question_elem.inner_text()
            
            answer_elem = post_parts[1].query_selector(">div")
            
            children_info = answer_elem.evaluate("""
                el => Array.from(el.children).map(child => ({
                    tagName: child.tagName.toLowerCase(),
                    className: child.className,
                    textContent: child.textContent
                }))
            """)
            answer_parts = [f"```{child['textContent']}```" if child['tagName'] == 'blockquote' else child['textContent'] for child in children_info]
            answer = "\n".join(answer_parts)
            
            document = Document(
                id=self.get_random_uuid(),
                publicPath=url,
                originalPath=url,
                mediaName=title,
            )
            chunk = WebsiteQAChunk(
                chunk_id=self.id,
                document=document,
                title=title,
                text=f"Titre: {title}\nQuestion: {question}\nAnswer: {answer}",
                metadata=WebsiteQAMetadata(
                    question=question,
                    answer=answer,
                    url=url,
                )
            )
            
            return document, chunk
        except TimeoutError:
            print(f"Timeout occurred for URL: {url}. Retrying...")
            raise
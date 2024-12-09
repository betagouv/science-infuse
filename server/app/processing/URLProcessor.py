from pathlib import Path
import os
import re
from PIL import Image, ImageFile
from S3Storage import S3Storage
from schemas import Document, ImageChunk, ImageMetadata, WebsiteChunk, WebsiteMetadata
from processing.image.SIImageDescription import SIImageDescription
from processing.text.SIITranslator import SITranslator
from processing.BaseDocumentProcessor import BaseDocumentProcessor
from unstructured.chunking.title import chunk_by_title
from unstructured.partition.html import partition_html
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from langchain_text_splitters import HTMLHeaderTextSplitter, HTMLSectionSplitter
import logging
import numpy as np
# TODO: check if not causing problems: https://github.com/python-pillow/Pillow/issues/1510
logger = logging.getLogger()

HTML_HEADERS = [
    ("h1", "Header 1"),
    ("h2", "Header 2"),
    ("h3", "Header 3"),
    ("h4", "Header 4"),
    ("h5", "Header 5"),
    ("h6", "Header 6"),
]

class URLProcessor(BaseDocumentProcessor):
    def __init__(self, url: str):
        self.url = url        
        return super().__init__()

    def extract_html_from_url(self, url):
        try:
            chrome_options = Options()
            chrome_options.add_argument("--headless")
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            
            driver = webdriver.Chrome(
                service=Service(ChromeDriverManager().install()), 
                options=chrome_options
            )
            
            driver.get(url)
            html_content = driver.page_source
            driver.quit()
            return html_content
                
        except Exception as e:
            print(f"An error occurred: {e}")
            return []

    def get_page_title(self, html: str):
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(html, 'html.parser')
        
        # Try to get h1 first, if not found get title
        title = soup.find('h1').text
        if not title:
            title = soup.find('title')
        return title

    def get_element_title(self, element):
        title = ""
        keys = list(element.metadata.keys())
        if (len(keys) > 0):
            _title = element.metadata[keys[0]]
            if (_title != "#TITLE#"):
                title = _title
        return title.strip()


    def extract_document(self):
        print("UrlProcessor", self.url, flush=True)
        chunks = []
        html = self.extract_html_from_url(self.url)
        splitter = HTMLSectionSplitter(headers_to_split_on=HTML_HEADERS)
        page_title = self.get_page_title(html)
        elements = splitter.split_text(html)

        print("page title = ", page_title)
        for i, element in enumerate(elements):
            print(f"Chunk {i+1}:\n{element.metadata}\n")
            clean_text = ' '.join(element.page_content.replace('\n', ' ').replace('\t', ' ').split())
            print(clean_text)
            chunk = WebsiteChunk(
                text=clean_text,
                title=self.get_element_title(element),
                document=document,
                metadata=WebsiteMetadata(
                    url=self.url,
                )
            )
            chunks.append(chunk)


        mediaName = page_title or self.url

        document = Document(
            id=self.id,
            originalPath=self.url,
            mediaName=mediaName,
        )
        
        return document, chunks

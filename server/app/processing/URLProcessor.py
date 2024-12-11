from pathlib import Path
import os
import re
from bs4 import BeautifulSoup, Comment
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
            return None

    def get_page_title(self, soup):        
        # Try to get h1 first, if not found get title
        h1_tag = soup.find('h1')
        if h1_tag:
            title = h1_tag.text
        else:
            title_tag = soup.find('title')
            title = title_tag.text if title_tag else "No title found"
        return title

    def clean_html_content(self, html):
        soup = BeautifulSoup(html, 'html.parser')
        # Remove useless tags
        for element in soup(["script", "style", "head", "header", "footer", "nav", "aside", "noscript"]):
            element.decompose()

        # Remove HTML comments
        for comment in soup.find_all(text=lambda text: isinstance(text, Comment)):
            comment.extract()

        # Remove hidden elements
        for hidden_element in soup.find_all(style=lambda value: value and ('display:none' in value or 'visibility:hidden' in value)):
            hidden_element.decompose()
        for hidden_class in soup.find_all(attrs={"class": lambda value: value and 'hidden' in value.lower()}):
            hidden_class.decompose()

        # Remove irrelevent sections
        keywords_to_ignore = [
            'cookies', 'cookie', 'politique de confidentialité', 'conditions générales', 
            'mentions légales', 'cgu', 'cgv', 'données personnelles', 'protection des données'
        ]
        for element in soup.find_all(text=True):
            if any(mot in element.lower() for mot in keywords_to_ignore):
                parent = element.find_parent()
                if parent:
                    parent.decompose()

        return soup


    def extract_sections_by_titles(self, soup):
        header_tags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
        sections = []

        all_elements = iter(soup.find_all())
        last_section = None
        current_header = None

        for element in all_elements:
            if element.name in header_tags:
                title = element.get_text(strip=True)

                if not title:
                    continue

                last_section = {'title': title, 'content': ''}
                current_header = element
                sections.append(last_section)
            elif last_section:
                # Add content to the current section
                if hasattr(element, 'get_text') and element != current_header:
                    text = element.get_text(separator=' ', strip=True)
                    if text and text != last_section['title']:
                        last_section['content'] += ' ' + text

        # Final cleanup: Remove sections with empty or duplicate titles
        cleaned_sections = []
        for section in sections:
            title = section['title'].strip()
            content = section['content'].strip()

            if not title and content:
                # Merge with previous section if possible
                if cleaned_sections:
                    cleaned_sections[-1]['content'] += ' ' + content
            elif title and content:
                cleaned_sections.append({'title': title, 'content': content})

        return cleaned_sections


    def extract_document(self):
        print("UrlProcessor", self.url, flush=True)
        chunks = []

        html = self.extract_html_from_url(self.url)


        soup = self.clean_html_content(html)
        page_title = self.get_page_title(soup)
        mediaName = page_title or self.url
        
        sections = self.extract_sections_by_titles(soup)
        
        document = Document(
            id=self.id,
            originalPath=self.url,
            mediaName=mediaName,
        )
        if (len(sections) > 0):
            for section in sections:
                print("Title:", section['title'])
                print("Content:", section['content'])
                print("-" * 50)

                chunk = WebsiteChunk(
                    text=section['content'],
                    title=section['title'],
                    document=document,
                    metadata=WebsiteMetadata(
                        url=self.url,
                    )
                )
                chunks.append(chunk)
        else:
            # if no title in the website take all text as a single chunk
            chunk = WebsiteChunk(
                text=soup.getText().strip(),
                title=mediaName,
                document=document,
                metadata=WebsiteMetadata(
                    url=self.url,
                )
            )
            chunks.append(chunk)
        
        return document, chunks

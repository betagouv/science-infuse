import itertools
import sys
import os
from typing import List
from urllib.parse import urljoin

from weaviate import WeaviateClient
sys.path.append(os.path.join(os.getcwd(), 'app'))

from SIWeaviateClient import SIWeaviateClient
from processing.CiteScienceQA import CiteScienceQA
import os
from weaviate.classes.query import Filter, GeoCoordinate, MetadataQuery, QueryReference 
from playwright.sync_api import sync_playwright, Browser
import concurrent.futures

print(os.getcwd())

# Configure logging

# def get_qas_urls(base_url, browser: Browser):
#     from urllib.parse import urljoin
#     page = browser.new_page()
#     page.goto(base_url)
#     qas_urls = []
#     while True:
#         page.wait_for_selector(".card-list")
#         questions_elems = page.query_selector_all(".card-list>li")
#         for elem in questions_elems:
#             relative_url = elem.get_attribute('data-document-url')
#             if relative_url:
#                 absolute_url = urljoin(base_url, relative_url)
#                 qas_urls.append(absolute_url)
        
#         next_page_button = page.query_selector(".page-item.page-item-arrow .icon-arrow-right")
#         if next_page_button:
#             next_page = page.query_selector(".page-item.page-item-arrow:has(.icon-arrow-right) > a")
#             next_page_link = next_page.get_attribute('href')
#             next_page_full_link = urljoin(base_url, next_page_link)
#             # print("LEN URL", len(qas_urls))
#             print("GOING NEXT PAGE", next_page_full_link)
#             page.goto(next_page_full_link)
#             page.wait_for_selector(".card-list")
#         else:
#             break
        
#     print("last LEN URL", len(qas_urls))
#     page.close()
#     return qas_urls


def get_qa_list_page_number(playwright):    
    # go to the last page of the qa, and return the max number from the pagination
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto(get_url_at_page(10000))
    page.wait_for_selector('.pagination')
    pages_elems = page.query_selector_all(".pagination>li")
    raw_pages = [page_elem.text_content() for page_elem in pages_elems]
    pages = [page.strip().lower().replace('page ', '') for page in raw_pages if page is not None]
    pages = [int(page) for page in pages if page.isdigit()]
    num_pages = max(pages)
    return num_pages

def get_qa_list_from_page(url):
    qas_urls: List[str] = []
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            page = browser.new_page()
            page.goto(url)
            page.wait_for_selector(".card-list")
            questions_elems = page.query_selector_all(".card-list>li")
            for elem in questions_elems:
                relative_url = elem.get_attribute('data-document-url')
                if relative_url:
                    absolute_url = urljoin(url, relative_url)
                    qas_urls.append(absolute_url)
            browser.close()
            return qas_urls
    except Exception as e:
        print("ERROR process_page", e)


def get_url_at_page(page_number: int):
    return f"https://www.cite-sciences.fr/fr/au-programme/lieux-ressources/cite-de-la-sante/une-question-en-sante/questions-sante/toutes-les-questions?tx_questionssante_search%5Bpage%5D={page_number}#results-list"

def get_qas_urls(playwright):
    # page_number = get_qa_list_page_number(playwright)
    page_number=20
    qas_urls = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(get_qa_list_from_page, get_url_at_page(page_index+1)) for page_index in range(page_number)]
        concurrent.futures.wait(futures)
        results = [future.result() for future in futures]
        qas_urls.extend(itertools.chain(*results))


    return qas_urls

def is_url_already_indexed(url, client: WeaviateClient):
    documentChunk = client.collections.get("DocumentChunk")
    response = documentChunk.query.fetch_objects(
        filters=(
            Filter.by_property("meta_url").equal(url)
        ),
        limit=1,
        return_properties=[]
    )
    return len(response.objects) > 0

def process_single_qa(url, client):
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        if not is_url_already_indexed(url, client):
            print("INDEXING ", url[-40:])
            try:
                processor = CiteScienceQA(client, browser, url)
            except Exception as e:
                print("ERROR", e)
        else:
            print("SKIPPING INDEXING ", url[-40:])
        
        browser.close()

def main():
    with SIWeaviateClient() as client:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            urls = get_qas_urls(playwright)
            print("URLS", urls)
            print("LEN URLS", len(urls))
            # base_url = "https://www.cite-sciences.fr/fr/au-programme/lieux-ressources/cite-de-la-sante/une-question-en-sante/questions-sante/toutes-les-questions?tx_questionssante_search%5Bpage%5D=320#results-list"
            # urls = get_qas_urls(base_url, browser)
            browser.close()

        # Use ThreadPoolExecutor to process URLs in parallel
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(process_single_qa, url, client) for url in urls]
            concurrent.futures.wait(futures)


main()

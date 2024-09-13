import itertools
import sys
import os
from typing import List
from urllib.parse import urljoin

sys.path.append(os.path.join(os.getcwd(), 'app'))

from processing.CiteScienceQA import CiteScienceQA
import os
from playwright.sync_api import sync_playwright
import concurrent.futures

print(os.getcwd())

def get_qa_list_pageNumber(playwright):    
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


def get_url_at_page(pageNumber: int):
    return f"https://www.cite-sciences.fr/fr/au-programme/lieux-ressources/cite-de-la-sante/une-question-en-sante/questions-sante/toutes-les-questions?tx_questionssante_search%5Bpage%5D={pageNumber}#results-list"

def get_qas_urls(playwright):
    pageNumber = get_qa_list_pageNumber(playwright)
    print("PAGE NUM", pageNumber)
    # pageNumber=20
    qas_urls = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(get_qa_list_from_page, get_url_at_page(page_index+1)) for page_index in range(pageNumber)]
        concurrent.futures.wait(futures)
        results = [future.result() for future in futures]
        qas_urls.extend(itertools.chain(*results))


    return qas_urls

def is_url_already_indexed(url):
    return False
    # documentChunk = client.collections.get("DocumentChunk")
    # response = documentChunk.query.fetch_objects(
    #     filters=(
    #         Filter.by_property("meta_url").equal(url)
    #     ),
    #     limit=1,
    #     return_properties=[]
    # )
    # return len(response.objects) > 0

def process_single_qa(url):
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        if not is_url_already_indexed(url):
            print("INDEXING ", url[-40:])
            try:
                processor = CiteScienceQA(browser, url)
            except Exception as e:
                print("ERROR", e)
        else:
            print("SKIPPING INDEXING ", url[-40:])
        
        browser.close()

def main():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        urls = get_qas_urls(playwright)
        browser.close()

    # Use ThreadPoolExecutor to process URLs in parallel
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(process_single_qa, url) for url in urls]
        concurrent.futures.wait(futures)


main()

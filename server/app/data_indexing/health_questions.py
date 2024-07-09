import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'app'))

from SIWeaviateClient import SIWeaviateClient
from processing.CiteScienceQA import CiteScienceQA
import os
from weaviate.classes.query import Filter, GeoCoordinate, MetadataQuery, QueryReference 
from playwright.sync_api import sync_playwright, Browser

print(os.getcwd())

# Configure logging

def get_qas_urls(base_url, browser: Browser):
    from urllib.parse import urljoin
    page = browser.new_page()
    page.goto(base_url)
    qas_urls = []
    while True:
        page.wait_for_selector(".card-list")
        questions_elems = page.query_selector_all(".card-list>li")
        for elem in questions_elems:
            relative_url = elem.get_attribute('data-document-url')
            if relative_url:
                absolute_url = urljoin(base_url, relative_url)
                qas_urls.append(absolute_url)
        
        next_page_button = page.query_selector(".page-item.page-item-arrow .icon-arrow-right")
        if next_page_button:
            next_page = page.query_selector(".page-item.page-item-arrow:has(.icon-arrow-right) > a")
            next_page_link = next_page.get_attribute('href')
            next_page_full_link = urljoin(base_url, next_page_link)
            # print("LEN URL", len(qas_urls))
            print("GOING NEXT PAGE", next_page_full_link)
            page.goto(next_page_full_link)
            page.wait_for_selector(".card-list")
        else:
            break
        
    print("last LEN URL", len(qas_urls))
    page.close()
    return qas_urls

def main():
    with SIWeaviateClient() as client:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            base_url = "https://www.cite-sciences.fr/fr/au-programme/lieux-ressources/cite-de-la-sante/une-question-en-sante/questions-sante/toutes-les-questions?tx_questionssante_search%5Bpage%5D=341#results-list"
            urls = get_qas_urls(base_url, browser)

            for url in urls[:1]:
                documentChunk = client.collections.get("DocumentChunk")
                response = documentChunk.query.fetch_objects(
                    filters=(
                        Filter.by_property("metadata.url").equal(url)
                    ),
                    limit=1,
                )
                print(response)


                processor = CiteScienceQA(client, browser, urls[1])


main()

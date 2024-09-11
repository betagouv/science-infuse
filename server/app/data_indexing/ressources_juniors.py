import sys
import os
from urllib.parse import urljoin


sys.path.append(os.path.join(os.getcwd(), 'app'))

from processing.CiteScienceRessourcesJunior import CiteScienceRessourcesJunior
import os
from playwright.sync_api import sync_playwright


from urllib.parse import urljoin
from playwright.sync_api import sync_playwright

def get_experience_type(text: str):
    lower_text = text.lower()
    if "quiz" in lower_text:
        return "quiz"
    if "simulation" in lower_text:
        return "simulation"
    return "experience web"

def get_ressources_juniors_experiences():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        page = browser.new_page()
        base_url = "https://www.cite-sciences.fr/fr/ressources/juniors"
        page.goto(base_url)

        web_experiences = []

        # SMART GAMES
        smart_games = page.query_selector_all("#grid .item-grid.bgJunior")
        for element in smart_games:
            title = element.query_selector('.titre').inner_text()
            description = element.query_selector('.texte').inner_text()
            href = element.query_selector('a').get_attribute('href')
            absolute_url = urljoin(base_url, href)
            web_experiences.append({
                "title": title,
                "description": description,
                "url": absolute_url,
                "type": get_experience_type(description+title+absolute_url)
            })

        # TINKERING AND MANIPULATIONS
        tinkering_experiences = page.query_selector_all("#grid .item-grid.bgLight")
        for element in tinkering_experiences:
            title = element.query_selector('.titre').inner_text()
            description = element.query_selector('.texte').inner_text()
            href = element.query_selector('a').get_attribute('href')
            absolute_url = urljoin(base_url, href)
            
            new_page = browser.new_page()
            new_page.goto(absolute_url)
            experiences = new_page.query_selector_all("#grid .item-grid .contenu:has(a)")
            for experience in experiences:
                title = experience.query_selector('.ce-bodytext>h3').inner_text()
                paragraphs = experience.query_selector_all('.ce-bodytext p')
                description = '\n'.join([p.inner_text() for p in paragraphs])
                urls = experience.query_selector_all('.ce-bodytext a')
                experience_url = urls[-1].get_attribute('href') if urls else ""
                
                web_experiences.append({
                    "title": title,
                    "description": description,
                    "url": urljoin(absolute_url, experience_url),
                    "type": get_experience_type(description+title+absolute_url),
                })
            new_page.close()

        page.close()
        browser.close()
        return web_experiences

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


def main():
    web_experiences = get_ressources_juniors_experiences()
    
    for exp in web_experiences:
        title = exp.get('title', '')
        url = exp.get('url', '')
        description = exp.get('description', '')
        type = exp.get('type', '')
        if not is_url_already_indexed(url):
            print("INDEXING ", url[-40:])
            try:
                processor = CiteScienceRessourcesJunior(title, url, description, type)
            except Exception as e:
                print("ERROR", e)
        else:
            print("SKIPPING INDEXING ", url[-40:])


main()


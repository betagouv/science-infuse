import weaviate
from weaviate.classes.query import QueryReference
from collections import defaultdict
from typing import Dict, List, Optional
from pydantic import BaseModel
from pydantic import BaseModel
from typing import List, Optional


class TOCItem(BaseModel):
    text: str
    page: int
    items: Optional[List['TOCItem']] = None

class TableOfContents(BaseModel):
    items: List[TOCItem]

def create_toc_structure(data: List[dict]) -> TableOfContents:
    root = {}
    
    for item in data:
        current = root
        for i, title in enumerate(item['path']):
            if title not in current:
                if i == len(item['path']) - 1:
                    current[title] = {"page": item['page']}
                else:
                    current[title] = {"items": {}}
            if i < len(item['path']) - 1:
                current = current[title]["items"]
    
    def build_toc_items(node: dict) -> List[TOCItem]:
        items = []
        for text, content in node.items():
            if "page" in content:
                items.append(TOCItem(text=text, page=content["page"]))
            else:
                sub_items = build_toc_items(content["items"])
                items.append(TOCItem(text=text, page=0, items=sub_items))
        return items

    return TableOfContents(items=build_toc_items(root))


def get_document_toc(client: weaviate.WeaviateClient, document_uuid: str) -> TableOfContents:
    document = client.collections.get("Document")
    doc = document.query.fetch_object_by_id(
        uuid=document_uuid,
        return_references=[QueryReference(
            link_on="hasChunks", 
            return_properties=["title", "meta_page_number"]
        )]
    )
    chunks = doc.references['hasChunks'].objects
    chunks = [{"title": chunk.properties.get('title'), "page": chunk.properties.get('meta_page_number')} for chunk in chunks if chunk.properties.get('title')]

    # Remove duplicates, keeping only the first occurrence (min page)
    unique_chunks = {}

    for chunk in chunks:
        title = chunk['title']
        page = chunk['page']
        if title not in unique_chunks or page < unique_chunks[title]['page']:
            unique_chunks[title] = chunk

    chunks = list(unique_chunks.values())
    toc = []
    seen_titles = set()
    for chunk in chunks:
        title = chunk.get('title', '')
        if title not in seen_titles:
            toc.append({"path": title.split(">"), "page":chunk.get('page')})
            seen_titles.add(title)
    
    return create_toc_structure(toc)
import requests

def embed_text(text: str):
    url = "http://localhost:8005/vectors/"
    headers = {
        "Content-Type": "application/json"
    }
    data = {
        "text": text
    }
    
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code == 200:
        return response.json().get('vector')
    else:
        response.raise_for_status()


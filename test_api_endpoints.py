import requests
import json

def test_synonyms_api():
    url = "http://localhost:5002/api/synonyms/happy"
    
    try:
        response = requests.get(url)
        print(f"Synonyms API - Status code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

def test_antonyms_api():
    url = "http://localhost:5002/api/antonyms/happy"
    
    try:
        response = requests.get(url)
        print(f"Antonyms API - Status code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

def test_related_api():
    url = "http://localhost:5002/api/related/happy?type=hypernyms"
    
    try:
        response = requests.get(url)
        print(f"Related API - Status code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

def test_thesaurus_api():
    url = "http://localhost:5002/api/thesaurus/happy"
    
    try:
        response = requests.get(url)
        print(f"Thesaurus API - Status code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)[:200]}...")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_synonyms_api()
    test_antonyms_api()
    test_related_api()
    test_thesaurus_api()

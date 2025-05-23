import requests
import json

BASE_URL = 'http://localhost:5035'

def test_endpoint(endpoint, params=None):
    try:
        response = requests.get(f"{BASE_URL}{endpoint}", params=params)
        print(f"\nTesting {endpoint}:")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("Response:", json.dumps(response.json(), indent=2))
        else:
            print("Error:", response.text)
    except Exception as e:
        print(f"Error testing {endpoint}: {str(e)}")

def main():
    # Test thesaurus endpoint
    test_endpoint('/api/thesaurus/example')
    
    # Test synonyms endpoint
    test_endpoint('/api/synonyms/example')
    
    # Test related concepts endpoint
    test_endpoint('/api/related-concepts/machine learning')
    
    # Test learning resources endpoint
    test_endpoint('/api/learning-resources/neural networks')

if __name__ == '__main__':
    main()

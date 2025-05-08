#!/bin/bash

# Check the status of the server
echo "Checking Thesaurus AI LLM Fine-Tuning server..."

# Check server on port 5003
echo "Checking server on port 5003..."
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5003/ > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Server on port 5003 is running."
else
    echo "❌ Server on port 5003 is not running."
fi

# Print the URL for the server
echo ""
echo "Server URL:"
echo "- http://127.0.0.1:5003/ (Test server)"
echo ""
echo "This is a simplified test server that only provides a health check endpoint."
echo "The main application server is currently experiencing technical difficulties."
echo "Please try again later or contact support for assistance."

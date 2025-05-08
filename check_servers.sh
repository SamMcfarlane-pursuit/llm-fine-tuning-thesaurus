#!/bin/bash

# Check the status of the server
echo "Checking Thesaurus AI LLM Fine-Tuning server..."

# Check server on port 5003
echo "Checking server on port 5003..."
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5003/health > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Server on port 5003 is running."
else
    echo "❌ Server on port 5003 is not running."
fi

# Print the URL for the server
echo ""
echo "Server URL:"
echo "- http://127.0.0.1:5003/ (Main application server)"
echo ""
echo "You can access all pages on this server."
echo "For example:"
echo "- http://127.0.0.1:5003/workshop-progress"
echo "- http://127.0.0.1:5003/frameworks"
echo "- http://127.0.0.1:5003/tutorials"

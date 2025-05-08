#!/bin/bash

# Check the status of all servers
echo "Checking Thesaurus AI LLM Fine-Tuning servers..."

# Check server on port 5035
echo "Checking server on port 5035..."
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5035/ > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Server on port 5035 is running."
else
    echo "❌ Server on port 5035 is not running."
fi

# Check server on port 5036
echo "Checking server on port 5036..."
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5036/ > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Server on port 5036 is running."
else
    echo "❌ Server on port 5036 is not running."
fi

# Check server on port 5037
echo "Checking server on port 5037..."
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5037/ > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Server on port 5037 is running."
else
    echo "❌ Server on port 5037 is not running."
fi

# Print the URLs for the servers
echo ""
echo "Server URLs:"
echo "- http://127.0.0.1:5035/ (Main server)"
echo "- http://127.0.0.1:5036/ (Secondary server)"
echo "- http://127.0.0.1:5037/ (Tertiary server)"
echo ""
echo "You can access different pages on each server to distribute the load."
echo "For example:"
echo "- http://127.0.0.1:5035/workshop-progress"
echo "- http://127.0.0.1:5036/frameworks"
echo "- http://127.0.0.1:5037/tutorials"

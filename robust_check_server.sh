#!/bin/bash

# Robust server check script that checks multiple ports
# This script will check ports 5005, 5006, 5007, 5008, 5009, and 5010 for a running server.

# Define the ports to check
PORTS=(5005 5006 5007 5008 5009 5010)

# Check the status of the server
echo "Checking Thesaurus AI LLM Fine-Tuning server..."

# Flag to track if any server is running
SERVER_RUNNING=false

# Check each port
for port in "${PORTS[@]}"; do
    echo "Checking server on port $port..."
    curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:$port/health > /dev/null
    if [ $? -eq 0 ]; then
        echo "✅ Server on port $port is running."
        SERVER_RUNNING=true
        
        # Print the URL for the server
        echo ""
        echo "Server URL:"
        echo "- http://127.0.0.1:$port/ (Main application server)"
        echo ""
        echo "You can access all pages on this server."
        echo "For example:"
        echo "- http://127.0.0.1:$port/workshop-progress"
        echo "- http://127.0.0.1:$port/frameworks"
        echo "- http://127.0.0.1:$port/tutorials"
        
        # No need to check other ports if we found a running server
        break
    else
        echo "❌ Server on port $port is not running."
    fi
done

# If no server is running, print a message
if [ "$SERVER_RUNNING" = false ]; then
    echo ""
    echo "No server is running on any of the checked ports."
    echo "Please start the server using ./robust_start_server.sh"
fi

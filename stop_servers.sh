#!/bin/bash

# Stop the server
echo "Stopping Thesaurus AI LLM Fine-Tuning server..."

# Kill any existing Python processes
echo "Killing any existing Python processes..."
pkill -f "python app.py"

echo "Server stopped."

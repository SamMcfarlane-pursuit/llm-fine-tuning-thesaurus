#!/bin/bash

# Stop all servers
echo "Stopping Thesaurus AI LLM Fine-Tuning servers..."

# Kill any existing Python processes
echo "Killing any existing Python processes..."
pkill -f "python app.py"

echo "All servers stopped."

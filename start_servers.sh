#!/bin/bash

# Start a single server on port 5001
echo "Starting Thesaurus AI LLM Fine-Tuning server..."

# Kill any existing Python processes
echo "Killing any existing Python processes..."
pkill -f "python app.py"

# Start the server on port 5001 (to avoid conflicts)
echo "Starting server on port 5001..."
python app.py --port 5001 &
SERVER_PID=$!
echo "Server started with PID: $SERVER_PID"

# Print the URL for the server
echo ""
echo "Server is now running at:"
echo "- http://127.0.0.1:5001/ (Main server)"
echo ""
echo "Press Ctrl+C to stop the server."

# Wait for user to press Ctrl+C
wait

# This part will execute when the user presses Ctrl+C
echo ""
echo "Stopping server..."
kill $SERVER_PID
echo "Server stopped."

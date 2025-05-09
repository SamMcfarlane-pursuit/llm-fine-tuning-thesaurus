#!/bin/bash

# Start a single server on port 5001
echo "Starting Thesaurus AI LLM Fine-Tuning server..."

# Kill any existing Python processes
echo "Killing any existing Python processes..."
pkill -f "python app.py" || true

# Make sure the port is not in use
echo "Making sure port 5001 is not in use..."
lsof -i:5001 | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null || true

# Start the server on port 5001
echo "Starting server on port 5001..."
python app.py --port 5001 &
SERVER_PID=$!
echo "Server started with PID: $SERVER_PID"

# Print the URL for the server
echo ""
echo "Server is now running at:"
echo "- http://127.0.0.1:5001/ (Main server)"
echo ""
echo "You can access all pages on this server."
echo "For example:"
echo "- http://127.0.0.1:5001/workshop-progress"
echo "- http://127.0.0.1:5001/frameworks"
echo "- http://127.0.0.1:5001/tutorials"
echo ""
echo "Press Ctrl+C to stop the server."

# Wait for user to press Ctrl+C
wait

# This part will execute when the user presses Ctrl+C
echo ""
echo "Stopping server..."
kill $SERVER_PID 2>/dev/null || true
echo "Server stopped."

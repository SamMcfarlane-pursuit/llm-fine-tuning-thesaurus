#!/bin/bash

# Start a single server on port 5003
echo "Starting Thesaurus AI LLM Fine-Tuning server..."

# Kill any existing Python processes
echo "Killing any existing Python processes..."
pkill -f "python app.py" || true
pkill -f "python test_server.py" || true

# Make sure the port is not in use
echo "Making sure port 5003 is not in use..."
lsof -i:5003 | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null || true

# Start the test server on port 5003 (to avoid conflicts)
echo "Starting test server on port 5003..."
python test_server.py &
SERVER_PID=$!
echo "Test server started with PID: $SERVER_PID"

# Print the URL for the server
echo ""
echo "Server is now running at:"
echo "- http://127.0.0.1:5003/ (Test server)"
echo ""
echo "Press Ctrl+C to stop the server."

# Wait for user to press Ctrl+C
wait

# This part will execute when the user presses Ctrl+C
echo ""
echo "Stopping server..."
kill $SERVER_PID 2>/dev/null || true
echo "Server stopped."

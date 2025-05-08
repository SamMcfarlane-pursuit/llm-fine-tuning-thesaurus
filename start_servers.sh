#!/bin/bash

# Start multiple servers on different ports
echo "Starting Thesaurus AI LLM Fine-Tuning servers on multiple ports..."

# Kill any existing Python processes
echo "Killing any existing Python processes..."
pkill -f "python app.py"

# Start the first server on port 5035
echo "Starting server on port 5035..."
python app.py --port 5035 &
SERVER1_PID=$!
echo "Server 1 started with PID: $SERVER1_PID"

# Wait a moment to ensure the first server starts properly
sleep 2

# Start the second server on port 5036
echo "Starting server on port 5036..."
python app.py --port 5036 &
SERVER2_PID=$!
echo "Server 2 started with PID: $SERVER2_PID"

# Wait a moment to ensure the second server starts properly
sleep 2

# Start the third server on port 5037
echo "Starting server on port 5037..."
python app.py --port 5037 &
SERVER3_PID=$!
echo "Server 3 started with PID: $SERVER3_PID"

# Print the URLs for the servers
echo ""
echo "Servers are now running at:"
echo "- http://127.0.0.1:5035/ (Main server)"
echo "- http://127.0.0.1:5036/ (Secondary server)"
echo "- http://127.0.0.1:5037/ (Tertiary server)"
echo ""
echo "You can access different pages on each server to distribute the load."
echo "For example:"
echo "- http://127.0.0.1:5035/workshop-progress"
echo "- http://127.0.0.1:5036/frameworks"
echo "- http://127.0.0.1:5037/tutorials"
echo ""
echo "Press Ctrl+C to stop all servers."

# Wait for user to press Ctrl+C
wait

# This part will execute when the user presses Ctrl+C
echo ""
echo "Stopping all servers..."
kill $SERVER1_PID $SERVER2_PID $SERVER3_PID
echo "All servers stopped."

#!/bin/bash

# Kill any existing processes
echo "Stopping any existing processes..."
pkill -f "python app.py" || true

# Make sure the port is not in use
echo "Making sure port 5036 is not in use..."
lsof -i:5036 | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null || true

# Activate virtual environment
echo "Activating virtual environment..."
source thesaurus_env/bin/activate

# Install/update dependencies
echo "Installing/updating dependencies..."
pip install -r requirements.txt

# Initialize the database
echo "Initializing database..."
python init_db.py

# Set environment variables
export FLASK_APP=app.py
export FLASK_ENV=development
export FLASK_DEBUG=1

# Start the server
echo "Starting server on port 5036..."
python -u app.py --port 5036 &
SERVER_PID=$!
echo "Server started with PID: $SERVER_PID"

# Print the URL for the server
echo ""
echo "Server is now running at:"
echo "- http://localhost:5036/"
echo ""
echo "You can access all pages on this server."
echo "For example:"
echo "- http://localhost:5036/workshop-progress"
echo "- http://localhost:5036/frameworks"
echo "- http://localhost:5036/tutorials"
echo ""
echo "Press Ctrl+C to stop the server."

# Wait for user to press Ctrl+C
wait

# This part will execute when the user presses Ctrl+C
echo ""
echo "Stopping server..."
kill $SERVER_PID 2>/dev/null || true
echo "Server stopped." 
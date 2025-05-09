#!/bin/bash

# Robust server startup script that handles port conflicts
# This script will try to start the server on port 5005, but if that port is in use,
# it will try ports 5006, 5007, 5008, 5009, and 5010 before giving up.

# Define the ports to try
PORTS=(5005 5006 5007 5008 5009 5010)

# Kill any existing Python processes
echo "Killing any existing Python processes..."
pkill -f "python app.py" || true
pkill -f "python test_server.py" || true
pkill -f "python -m flask run" || true

# Function to check if a port is in use
is_port_in_use() {
    lsof -i:"$1" | grep LISTEN > /dev/null
    return $?
}

# Function to start the server on a given port
start_server_on_port() {
    local port=$1
    
    echo "Starting main application server on port $port..."
    
    # Update the .env file with the new port
    sed -i.bak "s/PORT=[0-9]*/PORT=$port/" .env
    sed -i.bak "s|APP_URL=http://localhost:[0-9]*|APP_URL=http://localhost:$port|" .env
    
    # Start the server
    FLASK_APP=app.py FLASK_ENV=development FLASK_DEBUG=1 python -m flask run --port $port --host=0.0.0.0 &
    SERVER_PID=$!
    
    # Wait a moment to make sure the server starts
    sleep 2
    
    # Check if the server is running
    if ps -p $SERVER_PID > /dev/null; then
        echo "Main application server started with PID: $SERVER_PID"
        
        # Print the URL for the server
        echo ""
        echo "Server is now running at:"
        echo "- http://127.0.0.1:$port/ (Main application server)"
        echo ""
        echo "You can access all pages on this server."
        echo "For example:"
        echo "- http://127.0.0.1:$port/workshop-progress"
        echo "- http://127.0.0.1:$port/frameworks"
        echo "- http://127.0.0.1:$port/tutorials"
        echo ""
        echo "Press Ctrl+C to stop the server."
        
        # Create a temporary check_servers.sh script for this port
        cat > check_servers_temp.sh << EOF
#!/bin/bash

# Check the status of the server
echo "Checking Thesaurus AI LLM Fine-Tuning server..."

# Check server on port $port
echo "Checking server on port $port..."
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:$port/health > /dev/null
if [ \$? -eq 0 ]; then
    echo "✅ Server on port $port is running."
else
    echo "❌ Server on port $port is not running."
fi

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
EOF
        
        chmod +x check_servers_temp.sh
        
        return 0
    else
        echo "Failed to start server on port $port"
        return 1
    fi
}

# Try each port in the list
for port in "${PORTS[@]}"; do
    echo "Trying port $port..."
    
    # Check if the port is in use
    if is_port_in_use "$port"; then
        echo "Port $port is already in use. Trying next port..."
        continue
    fi
    
    # Try to start the server on this port
    if start_server_on_port "$port"; then
        # Server started successfully
        break
    fi
done

# Check if the server was started
if [ -z "$SERVER_PID" ] || ! ps -p $SERVER_PID > /dev/null; then
    echo "Failed to start server on any port. Please check for port conflicts or other issues."
    exit 1
fi

# Wait for user to press Ctrl+C
wait

# This part will execute when the user presses Ctrl+C
echo ""
echo "Stopping server..."
kill $SERVER_PID 2>/dev/null || true
echo "Server stopped."

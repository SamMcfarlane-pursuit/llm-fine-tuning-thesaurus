#!/bin/bash

# Robust server stop script that stops all Python processes
# This script will kill all Python processes and free up all ports.

echo "Stopping all Python processes..."

# Kill all Python processes
pkill -f "python app.py" || true
pkill -f "python test_server.py" || true
pkill -f "python -m flask run" || true

# Check if any Python processes are still running
if pgrep -f "python app.py" > /dev/null || pgrep -f "python test_server.py" > /dev/null || pgrep -f "python -m flask run" > /dev/null; then
    echo "Some Python processes are still running. Trying to force kill them..."
    pkill -9 -f "python app.py" || true
    pkill -9 -f "python test_server.py" || true
    pkill -9 -f "python -m flask run" || true
fi

# Check if any Python processes are still running
if pgrep -f "python app.py" > /dev/null || pgrep -f "python test_server.py" > /dev/null || pgrep -f "python -m flask run" > /dev/null; then
    echo "❌ Failed to stop all Python processes. Please check manually."
else
    echo "✅ All Python processes have been stopped."
fi

# Define the ports to check
PORTS=(5005 5006 5007 5008 5009 5010)

# Check each port
for port in "${PORTS[@]}"; do
    echo "Checking if port $port is in use..."
    if lsof -i:"$port" | grep LISTEN > /dev/null; then
        echo "Port $port is in use. Trying to free it up..."
        lsof -i:"$port" | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null || true
        
        # Check if the port is still in use
        if lsof -i:"$port" | grep LISTEN > /dev/null; then
            echo "❌ Failed to free up port $port. Please check manually."
        else
            echo "✅ Port $port has been freed up."
        fi
    else
        echo "✅ Port $port is not in use."
    fi
done

echo ""
echo "Server stop process completed."

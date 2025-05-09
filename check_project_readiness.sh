#!/bin/bash

# Check Project Readiness Script
# This script checks if the project is ready to be opened and used

echo "Checking project readiness..."
echo "=============================="

# Check if Python is installed
echo "Checking Python installation..."
if command -v python3 &>/dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "✅ Python is installed: $PYTHON_VERSION"
else
    echo "❌ Python is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if pip is installed
echo "Checking pip installation..."
if command -v pip3 &>/dev/null; then
    PIP_VERSION=$(pip3 --version)
    echo "✅ pip is installed: $PIP_VERSION"
else
    echo "❌ pip is not installed. Please install pip."
    exit 1
fi

# Check if virtual environment exists
echo "Checking virtual environment..."
if [ -d "thesaurus_env" ]; then
    echo "✅ Virtual environment exists"
else
    echo "⚠️ Virtual environment does not exist. Creating it now..."
    python3 -m venv thesaurus_env
    if [ $? -eq 0 ]; then
        echo "✅ Virtual environment created successfully"
    else
        echo "❌ Failed to create virtual environment"
        exit 1
    fi
fi

# Check if requirements.txt exists
echo "Checking requirements.txt..."
if [ -f "requirements.txt" ]; then
    echo "✅ requirements.txt exists"
else
    echo "❌ requirements.txt does not exist. Please create it."
    exit 1
fi

# Check if .env file exists
echo "Checking .env file..."
if [ -f ".env" ]; then
    echo "✅ .env file exists"
else
    echo "⚠️ .env file does not exist. Creating it from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ .env file created from .env.example"
    else
        echo "❌ .env.example does not exist. Please create a .env file manually."
        exit 1
    fi
fi

# Check if robust server scripts exist
echo "Checking robust server scripts..."
if [ -f "robust_start_server.sh" ] && [ -f "robust_check_server.sh" ] && [ -f "robust_stop_server.sh" ]; then
    echo "✅ Robust server scripts exist"
else
    echo "❌ Robust server scripts do not exist. Please create them."
    exit 1
fi

# Check if the scripts are executable
echo "Checking if scripts are executable..."
if [ -x "robust_start_server.sh" ] && [ -x "robust_check_server.sh" ] && [ -x "robust_stop_server.sh" ]; then
    echo "✅ Robust server scripts are executable"
else
    echo "⚠️ Making robust server scripts executable..."
    chmod +x robust_start_server.sh robust_check_server.sh robust_stop_server.sh
    echo "✅ Robust server scripts are now executable"
fi

# Check if app.py exists
echo "Checking app.py..."
if [ -f "app.py" ]; then
    echo "✅ app.py exists"
else
    echo "❌ app.py does not exist. Please create it."
    exit 1
fi

# Check if templates directory exists
echo "Checking templates directory..."
if [ -d "templates" ]; then
    echo "✅ templates directory exists"
else
    echo "❌ templates directory does not exist. Please create it."
    exit 1
fi

# Check if static directory exists
echo "Checking static directory..."
if [ -d "static" ]; then
    echo "✅ static directory exists"
else
    echo "❌ static directory does not exist. Please create it."
    exit 1
fi

# Check if NLTK data is downloaded
echo "Checking NLTK data..."
if python3 -c "import nltk; nltk.data.find('corpora/wordnet')" &>/dev/null; then
    echo "✅ NLTK wordnet data is downloaded"
else
    echo "⚠️ NLTK wordnet data is not downloaded. Downloading it now..."
    python3 -c "import nltk; nltk.download('wordnet'); nltk.download('omw-1.4')"
    if [ $? -eq 0 ]; then
        echo "✅ NLTK data downloaded successfully"
    else
        echo "❌ Failed to download NLTK data"
        exit 1
    fi
fi

# Check if port 5005 is available
echo "Checking if port 5005 is available..."
if lsof -i:5005 | grep LISTEN &>/dev/null; then
    echo "⚠️ Port 5005 is already in use. The robust server scripts will try other ports."
else
    echo "✅ Port 5005 is available"
fi

echo "=============================="
echo "Project readiness check complete!"
echo "The project is ready to be opened and used."
echo ""
echo "To start the server, run:"
echo "  ./robust_start_server.sh"
echo ""
echo "To check the server status, run:"
echo "  ./robust_check_server.sh"
echo ""
echo "To stop the server, run:"
echo "  ./robust_stop_server.sh"
echo ""
echo "Enjoy using the Visual LLM Thesaurus!"

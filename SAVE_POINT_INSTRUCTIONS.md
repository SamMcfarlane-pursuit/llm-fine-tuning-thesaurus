# Visual LLM Thesaurus - Save Point v1.0.0

This document provides instructions for using the save point (v1.0.0) of the Visual LLM Thesaurus application.

## Overview

This save point represents a stable version of the Visual LLM Thesaurus application with simplified server management. The application is now configured to run on a single port (5001) for simplicity and reliability.

## Getting Started

### Prerequisites

- Python 3.8 or higher
- pip (Python package installer)
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/SamMcfarlane-pursuit/llm-fine-tuning-thesaurus.git
   cd llm-fine-tuning-thesaurus
   ```

2. Checkout the save point:
   ```bash
   git checkout v1.0.0
   ```

3. Create and activate a virtual environment:
   ```bash
   python -m venv thesaurus_env
   source thesaurus_env/bin/activate  # On Windows: thesaurus_env\Scripts\activate
   ```

4. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

5. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration if needed
   ```

6. Download NLTK data:
   ```bash
   python -c "import nltk; nltk.download('wordnet'); nltk.download('omw-1.4')"
   ```

### Running the Application

1. Start the server:
   ```bash
   ./start_servers.sh
   ```

2. Check the server status:
   ```bash
   ./check_servers.sh
   ```

3. Open your browser and navigate to:
   ```
   http://127.0.0.1:5001/
   ```

4. When you're done, stop the server:
   ```bash
   ./stop_servers.sh
   ```

## Key Features

- **Thesaurus**: Explore relationships between LLM fine-tuning concepts
- **Hands-on Exercises**: Practice with LoRA/QLoRA fine-tuning
- **Interactive Code**: Colab integration for practical learning
- **Comprehensive Guides**: Learn about all LLM fine-tuning techniques
- **Search Functionality**: Find related terms and concepts
- **Quizzes**: Test your knowledge after each lesson

## Key Pages

- **Home**: http://127.0.0.1:5001/
- **Thesaurus**: http://127.0.0.1:5001/thesaurus
- **Workshop Progress**: http://127.0.0.1:5001/workshop-progress
- **Frameworks**: http://127.0.0.1:5001/frameworks
- **Tutorials**: http://127.0.0.1:5001/tutorials

## Troubleshooting

If you encounter any issues:

1. **Server not starting**: Check if there are any Python processes still running:
   ```bash
   ps aux | grep python
   ```
   If there are, kill them:
   ```bash
   ./stop_servers.sh
   ```

2. **Port conflicts**: If port 5001 is already in use, modify the start_servers.sh script to use a different port.

3. **Page not loading**: Check if the server is running:
   ```bash
   ./check_servers.sh
   ```
   If not, start it:
   ```bash
   ./start_servers.sh
   ```

4. **Styling issues**: Try clearing your browser cache or opening the page in an incognito window.

## Changes in This Save Point

1. **Simplified Server Configuration**
   - Updated the start_servers.sh script to use a single port (5001) for simplicity
   - Updated the check_servers.sh script to check port 5001
   - Made all scripts executable

2. **Improved Documentation**
   - Updated README.md with clear instructions for running the server
   - Added detailed troubleshooting steps

3. **Code Cleanup**
   - Removed unnecessary files and scripts
   - Streamlined the codebase for better maintainability

## Next Steps

After successfully running the application from this save point, you can:

1. Explore the different sections of the application
2. Try out the hands-on exercises
3. Take the quizzes to test your knowledge
4. Use the thesaurus to explore relationships between LLM fine-tuning concepts

## Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.

Happy learning!

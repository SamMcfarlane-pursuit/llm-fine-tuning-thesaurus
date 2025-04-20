# LLM Fine-Tuning Thesaurus

A visual thesaurus application powered by a fine-tuned Large Language Model (LLM) that provides comprehensive information about LLM fine-tuning concepts and techniques.

This project demonstrates how to fine-tune a Large Language Model (LLM) to create a thesaurus application with an interactive visual interface. It serves as an educational resource to understand the principles and methods of LLM fine-tuning while providing a practical, user-friendly thesaurus tool.

## Features

* **Guided Fine-tuning:** Step-by-step instructions for loading a pre-trained LLM, applying LoRA, and running a basic fine-tuning process.
* **Interactive Code:** Executable code cells for each stage of the fine-tuning process.
* **Visual Thesaurus Interface:** Interactive visualization of word relationships, similar to commercial thesaurus tools.
* **Basic Inference:** Demonstrates how to use the fine-tuned model to generate synonyms and related words.
* **"Need Help" Point:** A specific section where users can input a question and receive a direct text response.
* **Clear Instructions:** Concise guidance for each step of the process.

## Getting Started

### Local Development

1. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Download NLTK data:
   ```
   python -c "import nltk; nltk.download('wordnet'); nltk.download('omw-1.4')"
   ```

3. Open the Jupyter notebook to learn about LLM fine-tuning:
   ```
   jupyter notebook thesaurus_llm_finetuning.ipynb
   ```

4. Follow the step-by-step instructions in the notebook to fine-tune the model.

5. Launch the visual thesaurus web application:
   ```
   python app.py
   ```

6. Open your browser and navigate to `http://localhost:5000` to use the visual thesaurus interface.

### Deployment

#### Using Docker

1. Build the Docker image:
   ```
   docker build -t thesaurus-llm .
   ```

2. Run the container:
   ```
   docker run -p 8000:8000 thesaurus-llm
   ```

3. Access the application at `http://localhost:8000`

#### Using Docker Compose

1. Start the application:
   ```
   docker-compose up -d
   ```

2. Access the application at `http://localhost:8000`

#### Deploying to Render (Free Domain)

1. Fork this repository to your GitHub account

2. Sign up for a free account at [render.com](https://render.com)

3. Create a new Web Service and select your forked repository

4. Use the following settings:
   - Environment: Python
   - Build Command: `./build.sh`
   - Start Command: `gunicorn app:app`

5. Add the following environment variables:
   - `PYTHON_VERSION`: 3.9.18
   - `FLASK_ENV`: production

6. Click "Create Web Service"

7. Access your application at the provided Render URL (e.g., your-app-name.onrender.com)

#### Deploying to a Custom Domain

1. Set up a server with Docker installed

2. Clone the repository to your server

3. Create a `.env` file based on `.env.example` with your configuration

4. Start the application using Docker Compose:
   ```
   docker-compose up -d
   ```

5. Set up a reverse proxy (like Nginx) to forward requests from your domain to the application

6. Configure SSL certificates for secure HTTPS connections

## Requirements

- Python 3.8+
- PyTorch 2.0+
- Transformers library
- PEFT library
- 8GB+ RAM
- GPU recommended for faster training

## Project Structure

### Core Files
- `thesaurus_llm_finetuning.ipynb`: Main notebook with all code and explanations for fine-tuning
- `requirements.txt`: List of required packages
- `data_preparation.py`: Helper script for preparing thesaurus data
- `thesaurus_utils.py`: Utility functions for the thesaurus application
- `llm_thesaurus.py`: Domain-specific thesaurus for LLM fine-tuning terms
- `llm_concepts.py`: Visualization of LLM fine-tuning concepts

### Visual Interface Files
- `app.py`: Flask web application for serving the visual thesaurus interface
- `visual_thesaurus.py`: Utilities for creating visual representations of word relationships
- `templates/`: HTML templates for the web interface
- `static/`: CSS, JavaScript, and other static files for the web interface

### Deployment Files
- `build.sh`: Build script for Render deployment
- `Procfile`: Process file for web servers
- `runtime.txt`: Python version specification
- `.env.example`: Example environment variables file

## License

This project is open source and available under the MIT License.

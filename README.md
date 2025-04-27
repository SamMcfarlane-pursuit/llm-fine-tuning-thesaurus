# LLM Fine-Tuning Thesaurus

A visual thesaurus application powered by a fine-tuned Large Language Model (LLM) that provides comprehensive information about LLM fine-tuning concepts and techniques.

This project demonstrates how to fine-tune a Large Language Model (LLM) to create a thesaurus application with an interactive visual interface. It serves as an educational resource to understand the principles and methods of LLM fine-tuning while providing a practical, user-friendly thesaurus tool.

## Features

### Learning Resources
* **Guided Fine-tuning:** Step-by-step instructions for loading a pre-trained LLM, applying LoRA, and running a basic fine-tuning process.
* **Interactive Code:** Executable code cells for each stage of the fine-tuning process, compatible with Google Colab.
* **Comprehensive Tutorials:** In-depth explanations of LLM fine-tuning concepts, techniques, and best practices.
* **Hands-on Workshops:** Practical exercises to implement various fine-tuning techniques like QLoRA, LoRA, and parameter-efficient methods.
* **Real-time Quizzes:** Interactive quizzes to test your knowledge after each lesson with immediate feedback.

### Thesaurus Features
* **Visual Thesaurus Interface:** Interactive visualization of word relationships and LLM fine-tuning concepts.
* **Advanced Search:** Full-text search capabilities for finding related terms and concepts.
* **Concept Maps:** Visual representation of relationships between different LLM fine-tuning techniques.
* **Term Definitions:** Comprehensive explanations of technical terms with examples and use cases.

### Application Features
* **User Authentication:** Secure login with email, Google, GitHub, or other OAuth providers.
* **Progress Tracking:** Track your learning journey with detailed progress statistics.
* **Subscription Tiers:** Free and premium content with different access levels.
* **Real-time Analytics:** Track your learning patterns and engagement metrics.
* **Responsive Design:** Works seamlessly on desktop, tablet, and mobile devices.
* **Dark Mode:** Eye-friendly dark theme for comfortable reading.

### Technical Features
* **Basic Inference:** Demonstrates how to use the fine-tuned model to generate synonyms and related words.
* **Pipeline Integration:** Easy model inference using Hugging Face pipeline() functionality.
* **Memory Efficiency:** Techniques for optimizing memory usage during fine-tuning.
* **Gradient Checkpointing:** Implementation of gradient checkpointing for training larger models.
* **Quantization:** Practical examples of model quantization for faster inference.
* **"Need Help" Assistant:** AI-powered assistance for answering questions about LLM fine-tuning.

## Getting Started

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/llm-fine-tuning-thesaurus.git
   cd llm-fine-tuning-thesaurus
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv thesaurus_env
   source thesaurus_env/bin/activate  # On Windows: thesaurus_env\Scripts\activate
   ```

3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Initialize the database:
   ```bash
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

6. Download NLTK data:
   ```bash
   python -c "import nltk; nltk.download('wordnet'); nltk.download('omw-1.4')"
   ```

7. Launch the web application:
   ```bash
   flask run
   ```

8. Open your browser and navigate to `http://localhost:5000` to use the application.

### Fine-Tuning with QLoRA

1. Prepare the dataset for fine-tuning:
   ```bash
   python prepare_dataset.py
   ```

2. Run the QLoRA fine-tuning process:
   ```bash
   python finetune_qlora.py
   ```

   Alternatively, you can use the provided shell script:
   ```bash
   chmod +x run_finetuning.sh
   ./run_finetuning.sh
   ```

3. Test the fine-tuned model:
   ```bash
   python test_model.py
   ```

4. Deploy the application with the fine-tuned model:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

### Using Google Colab for Tutorials

1. Access the Colab notebooks directly from the application's tutorial section.

2. Alternatively, open the notebooks from the `notebooks/` directory in Google Colab:
   - Go to [Google Colab](https://colab.research.google.com/)
   - Click on "File" > "Open notebook"
   - Select the "GitHub" tab
   - Enter the repository URL: `https://github.com/yourusername/llm-fine-tuning-thesaurus`
   - Choose the notebook you want to open

3. Follow the step-by-step instructions in the notebook to learn about LLM fine-tuning.

### Deployment

#### Using Docker

1. Build the Docker image:
   ```bash
   docker build -t thesaurus-llm .
   ```

2. Run the container:
   ```bash
   docker run -p 5000:5000 -e SECRET_KEY=your-secret-key thesaurus-llm
   ```

3. Access the application at `http://localhost:5000`

#### Using Docker Compose

1. Create a `.env` file based on `.env.example` with your configuration:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. Start the application with all services (web, database, Redis, Nginx):
   ```bash
   docker-compose up -d
   ```

3. Access the application at `http://localhost:80` (or `https://localhost:443` if SSL is configured)

#### Deploying to Cloud Providers

##### AWS Elastic Beanstalk

1. Install the AWS CLI and EB CLI:
   ```bash
   pip install awscli awsebcli
   ```

2. Initialize the EB application:
   ```bash
   eb init -p docker
   ```

3. Create an environment and deploy:
   ```bash
   eb create thesaurus-llm-env
   ```

4. Access your application at the provided AWS URL

##### Google Cloud Run

1. Install the Google Cloud SDK

2. Build and push the Docker image to Google Container Registry:
   ```bash
   gcloud builds submit --tag gcr.io/your-project-id/thesaurus-llm
   ```

3. Deploy to Cloud Run:
   ```bash
   gcloud run deploy thesaurus-llm --image gcr.io/your-project-id/thesaurus-llm --platform managed
   ```

4. Access your application at the provided Google Cloud Run URL

##### Render (Free Domain)

1. Fork this repository to your GitHub account

2. Sign up for a free account at [render.com](https://render.com)

3. Create a new Web Service and select your forked repository

4. Use the following settings:
   - Environment: Docker
   - Build Command: (leave empty)
   - Start Command: (leave empty)

5. Add the necessary environment variables from `.env.example`

6. Click "Create Web Service"

7. Access your application at the provided Render URL (e.g., your-app-name.onrender.com)

#### Deploying to a Custom Domain with SSL

1. Set up a server with Docker and Docker Compose installed

2. Clone the repository to your server:
   ```bash
   git clone https://github.com/yourusername/llm-fine-tuning-thesaurus.git
   cd llm-fine-tuning-thesaurus
   ```

3. Create a `.env` file based on `.env.example` with your configuration

4. Create SSL certificates using Let's Encrypt:
   ```bash
   mkdir -p nginx/ssl
   sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
   sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
   sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/
   sudo chmod 755 nginx/ssl
   ```

5. Update the Nginx configuration in `nginx/conf.d/app.conf` with your domain name

6. Start the application using Docker Compose:
   ```bash
   docker-compose up -d
   ```

7. Set up automatic SSL certificate renewal:
   ```bash
   sudo crontab -e
   # Add the following line:
   0 12 * * * certbot renew --quiet && cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /path/to/app/nginx/ssl/ && cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /path/to/app/nginx/ssl/ && docker-compose restart nginx
   ```

## Requirements

- Python 3.8+
- PyTorch 2.1+
- Transformers library 4.35+
- PEFT library 0.5+
- bitsandbytes 0.41+
- trl 0.7+
- 8GB+ RAM
- GPU with at least 8GB VRAM recommended for QLoRA fine-tuning
- 16GB+ RAM for inference with quantized models

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

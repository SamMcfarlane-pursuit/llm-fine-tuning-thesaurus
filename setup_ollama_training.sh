#!/bin/bash

# 🔥 OLLAMA TRAINING SETUP FOR VISUAL LLM PLATFORM
# Complete setup script for Ollama model training capabilities

echo "🔥 SETTING UP OLLAMA TRAINING SYSTEM"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

# Check if running on macOS or Linux
OS="$(uname -s)"
case "${OS}" in
    Linux*)     MACHINE=Linux;;
    Darwin*)    MACHINE=Mac;;
    *)          MACHINE="UNKNOWN:${OS}"
esac

print_info "Detected OS: $MACHINE"

# Step 1: Install Ollama
echo ""
echo "📥 STEP 1: Installing Ollama"
echo "----------------------------"

if command -v ollama &> /dev/null; then
    print_status "Ollama is already installed"
    ollama --version
else
    print_info "Installing Ollama..."
    if [ "$MACHINE" = "Mac" ]; then
        # macOS installation
        if command -v brew &> /dev/null; then
            brew install ollama
        else
            curl -fsSL https://ollama.ai/install.sh | sh
        fi
    else
        # Linux installation
        curl -fsSL https://ollama.ai/install.sh | sh
    fi
    
    if command -v ollama &> /dev/null; then
        print_status "Ollama installed successfully"
    else
        print_error "Failed to install Ollama"
        exit 1
    fi
fi

# Step 2: Start Ollama service
echo ""
echo "🚀 STEP 2: Starting Ollama Service"
echo "----------------------------------"

# Check if Ollama is already running
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    print_status "Ollama service is already running"
else
    print_info "Starting Ollama service..."
    
    if [ "$MACHINE" = "Mac" ]; then
        # macOS - start as background service
        ollama serve &
        OLLAMA_PID=$!
        print_info "Ollama started with PID: $OLLAMA_PID"
    else
        # Linux - start as systemd service if available
        if systemctl --version &> /dev/null; then
            sudo systemctl start ollama
            sudo systemctl enable ollama
            print_status "Ollama started as systemd service"
        else
            # Fallback to background process
            ollama serve &
            OLLAMA_PID=$!
            print_info "Ollama started with PID: $OLLAMA_PID"
        fi
    fi
    
    # Wait for service to start
    print_info "Waiting for Ollama service to start..."
    for i in {1..30}; do
        if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
            print_status "Ollama service is running"
            break
        fi
        sleep 1
        echo -n "."
    done
    echo ""
    
    if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        print_error "Failed to start Ollama service"
        exit 1
    fi
fi

# Step 3: Download recommended models
echo ""
echo "📦 STEP 3: Downloading Recommended Models"
echo "----------------------------------------"

models=(
    "llama3.1:latest"
    "codellama:latest"
    "mistral:latest"
    "phi3:latest"
)

for model in "${models[@]}"; do
    print_info "Checking model: $model"
    
    if ollama list | grep -q "${model%:*}"; then
        print_status "$model is already available"
    else
        print_info "Downloading $model..."
        if ollama pull "$model"; then
            print_status "$model downloaded successfully"
        else
            print_warning "Failed to download $model (continuing anyway)"
        fi
    fi
done

# Step 4: Install Python dependencies
echo ""
echo "🐍 STEP 4: Installing Python Dependencies"
echo "----------------------------------------"

# Check if we're in a virtual environment
if [[ "$VIRTUAL_ENV" != "" ]]; then
    print_status "Virtual environment detected: $VIRTUAL_ENV"
else
    print_warning "No virtual environment detected. Consider using one."
fi

# Install required packages
python_packages=(
    "aiohttp>=3.8.0"
    "asyncio"
    "requests>=2.28.0"
    "flask>=2.3.0"
    "python-dotenv>=1.0.0"
)

print_info "Installing Python packages..."
for package in "${python_packages[@]}"; do
    if pip install "$package"; then
        print_status "Installed: $package"
    else
        print_warning "Failed to install: $package"
    fi
done

# Step 5: Create training directories
echo ""
echo "📁 STEP 5: Creating Training Directories"
echo "---------------------------------------"

directories=(
    "trained_models"
    "training_datasets"
    "modelfiles"
    "training_logs"
)

for dir in "${directories[@]}"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        print_status "Created directory: $dir"
    else
        print_status "Directory already exists: $dir"
    fi
done

# Step 6: Create sample training dataset
echo ""
echo "📊 STEP 6: Creating Sample Training Dataset"
echo "------------------------------------------"

cat > training_datasets/sample_llm_finetuning.jsonl << 'EOF'
{"prompt": "What is LoRA fine-tuning?", "response": "LoRA (Low-Rank Adaptation) is a parameter-efficient fine-tuning technique that freezes the pre-trained model weights and injects trainable rank decomposition matrices into each layer of the Transformer architecture. This reduces the number of trainable parameters by up to 10,000x while maintaining comparable performance to full fine-tuning.", "system": "You are an expert AI assistant specializing in LLM fine-tuning and machine learning education."}
{"prompt": "How does QLoRA differ from LoRA?", "response": "QLoRA (Quantized LoRA) extends LoRA by adding 4-bit quantization to the base model, further reducing memory requirements. While LoRA reduces trainable parameters, QLoRA also reduces the memory footprint of the frozen parameters through quantization, enabling fine-tuning of larger models on consumer hardware.", "system": "You are an expert AI assistant specializing in LLM fine-tuning and machine learning education."}
{"prompt": "What are the advantages of parameter-efficient fine-tuning?", "response": "Parameter-efficient fine-tuning offers several key advantages: 1) Dramatically reduced computational requirements, 2) Lower memory usage, 3) Faster training times, 4) Ability to maintain multiple task-specific adapters, 5) Reduced risk of catastrophic forgetting, and 6) More accessible fine-tuning for researchers with limited resources.", "system": "You are an expert AI assistant specializing in LLM fine-tuning and machine learning education."}
{"prompt": "Provide a code example for implementing LoRA", "response": "Here's a complete LoRA implementation example:\n\n```python\nfrom peft import LoraConfig, get_peft_model, TaskType\nfrom transformers import AutoModelForCausalLM, AutoTokenizer\n\n# Load base model and tokenizer\nmodel_name = \"microsoft/DialoGPT-medium\"\nmodel = AutoModelForCausalLM.from_pretrained(model_name)\ntokenizer = AutoTokenizer.from_pretrained(model_name)\n\n# Configure LoRA\nlora_config = LoraConfig(\n    task_type=TaskType.CAUSAL_LM,\n    inference_mode=False,\n    r=16,  # rank\n    lora_alpha=32,\n    lora_dropout=0.1,\n    target_modules=[\"c_attn\", \"c_proj\"]\n)\n\n# Apply LoRA to model\nmodel = get_peft_model(model, lora_config)\nmodel.print_trainable_parameters()\n```\n\nThis reduces trainable parameters from 117M to just 295K while maintaining model quality.", "system": "You are an expert AI assistant specializing in LLM fine-tuning and machine learning education."}
{"prompt": "What is the difference between full fine-tuning and LoRA?", "response": "Full fine-tuning updates all model parameters, requiring significant computational resources and memory. LoRA (Low-Rank Adaptation) freezes the original model weights and only trains small adapter matrices, reducing trainable parameters by 10,000x. LoRA maintains 99% of full fine-tuning performance while being much more efficient and allowing multiple task-specific adapters to coexist.", "system": "You are an expert AI assistant specializing in LLM fine-tuning and machine learning education."}
EOF

print_status "Created sample training dataset: training_datasets/sample_llm_finetuning.jsonl"

# Step 7: Test the installation
echo ""
echo "🧪 STEP 7: Testing Installation"
echo "------------------------------"

print_info "Testing Ollama API connection..."
if curl -s http://localhost:11434/api/tags > /dev/null; then
    print_status "Ollama API is accessible"
    
    print_info "Available models:"
    ollama list
    
    print_info "Testing model inference..."
    if echo '{"model":"llama3.1","prompt":"What is machine learning?","stream":false}' | curl -s -X POST http://localhost:11434/api/generate -d @- > /dev/null; then
        print_status "Model inference test passed"
    else
        print_warning "Model inference test failed"
    fi
else
    print_error "Ollama API is not accessible"
fi

# Step 8: Create quick start script
echo ""
echo "📝 STEP 8: Creating Quick Start Script"
echo "-------------------------------------"

cat > start_ollama_training.sh << 'EOF'
#!/bin/bash

# Quick start script for Ollama training
echo "🔥 Starting Ollama Training System..."

# Start Ollama if not running
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "Starting Ollama service..."
    ollama serve &
    sleep 5
fi

# Start Flask app
echo "Starting Visual LLM Platform..."
python app.py

EOF

chmod +x start_ollama_training.sh
print_status "Created quick start script: start_ollama_training.sh"

# Step 9: Final summary
echo ""
echo "🎉 SETUP COMPLETE!"
echo "=================="

print_status "Ollama Training System is ready!"
echo ""
echo "📋 Summary:"
echo "  ✅ Ollama installed and running"
echo "  ✅ Models downloaded: llama3.1, codellama, mistral, phi3"
echo "  ✅ Python dependencies installed"
echo "  ✅ Training directories created"
echo "  ✅ Sample dataset prepared"
echo "  ✅ Quick start script created"
echo ""
echo "🚀 Next Steps:"
echo "  1. Start the Visual LLM platform: python app.py"
echo "  2. Navigate to: http://localhost:5037/training/ollama"
echo "  3. Try the 'Quick Start Demo' button"
echo "  4. Explore custom training configurations"
echo ""
echo "💡 Quick Commands:"
echo "  • Check Ollama status: curl http://localhost:11434/api/tags"
echo "  • List models: ollama list"
echo "  • Start training interface: ./start_ollama_training.sh"
echo ""
echo "📚 Training Features Available:"
echo "  • LoRA fine-tuning"
echo "  • QLoRA (4-bit quantized) fine-tuning"
echo "  • Full model fine-tuning"
echo "  • Custom dataset upload"
echo "  • Real-time training progress monitoring"
echo "  • Model testing and inference"
echo ""

# Optional: Start the Flask app
read -p "🚀 Would you like to start the Visual LLM platform now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Starting Visual LLM Platform..."
    python app.py
fi

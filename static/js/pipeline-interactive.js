/**
 * Pipeline Interactive Demo JavaScript
 * Handles the interactive functionality of the Hugging Face pipeline demo
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize syntax highlighting
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block);
    });
    
    // DOM Elements
    const taskSelect = document.getElementById('taskSelect');
    const modelSelect = document.getElementById('modelSelect');
    const inputText = document.getElementById('inputText');
    const additionalParams = document.getElementById('additionalParams');
    const runPipelineBtn = document.getElementById('runPipeline');
    const resultsContainer = document.querySelector('.results-container');
    const resultOutput = document.getElementById('resultOutput');
    const generatedCode = document.getElementById('generatedCode');
    const copyCodeBtn = document.getElementById('copyCode');
    const openColabBtn = document.getElementById('openColab');
    
    // Task-specific model options
    const taskModels = {
        'sentiment-analysis': [
            { value: 'distilbert-base-uncased-finetuned-sst-2-english', label: 'DistilBERT (SST-2)' },
            { value: 'nlptown/bert-base-multilingual-uncased-sentiment', label: 'BERT Multilingual Sentiment' },
            { value: 'cardiffnlp/twitter-roberta-base-sentiment', label: 'RoBERTa Twitter Sentiment' }
        ],
        'text-generation': [
            { value: 'gpt2', label: 'GPT-2 (Small)' },
            { value: 'gpt2-medium', label: 'GPT-2 (Medium)' },
            { value: 'distilgpt2', label: 'DistilGPT-2' }
        ],
        'fill-mask': [
            { value: 'bert-base-uncased', label: 'BERT Base Uncased' },
            { value: 'roberta-base', label: 'RoBERTa Base' },
            { value: 'distilbert-base-uncased', label: 'DistilBERT Base Uncased' }
        ],
        'token-classification': [
            { value: 'dbmdz/bert-large-cased-finetuned-conll03-english', label: 'BERT NER (CoNLL-2003)' },
            { value: 'Jean-Baptiste/camembert-ner', label: 'CamemBERT NER (French)' }
        ],
        'question-answering': [
            { value: 'distilbert-base-cased-distilled-squad', label: 'DistilBERT SQuAD' },
            { value: 'deepset/roberta-base-squad2', label: 'RoBERTa SQuAD 2' }
        ],
        'summarization': [
            { value: 'facebook/bart-large-cnn', label: 'BART CNN' },
            { value: 't5-small', label: 'T5 Small' }
        ],
        'translation': [
            { value: 't5-small', label: 'T5 Small (Multilingual)' },
            { value: 'Helsinki-NLP/opus-mt-en-fr', label: 'Opus MT (English to French)' },
            { value: 'Helsinki-NLP/opus-mt-en-de', label: 'Opus MT (English to German)' }
        ]
    };
    
    // Task-specific default inputs
    const defaultInputs = {
        'sentiment-analysis': 'I love using Hugging Face transformers! They make NLP so accessible.',
        'text-generation': 'Hugging Face transformers are',
        'fill-mask': 'The [MASK] sat on the mat.',
        'token-classification': 'My name is John and I live in New York City.',
        'question-answering': 'Context: Hugging Face is a company that provides NLP tools. Question: What does Hugging Face provide?',
        'summarization': 'Hugging Face is a company based in New York City that develops tools for building applications using machine learning. Their main product is the Transformers library, which provides pre-trained models for natural language processing tasks. The company was founded in 2016 and has gained popularity for making NLP accessible to developers.',
        'translation': 'Hello, how are you doing today?'
    };
    
    // Task-specific additional parameters
    const taskParams = {
        'text-generation': `
            <div class="row">
                <div class="col-md-4">
                    <div class="form-group">
                        <label for="maxLength" class="form-label">Max Length</label>
                        <input type="number" class="form-control" id="maxLength" value="50" min="10" max="200">
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="form-group">
                        <label for="temperature" class="form-label">Temperature</label>
                        <input type="number" class="form-control" id="temperature" value="0.7" min="0.1" max="1.5" step="0.1">
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="form-group">
                        <label for="numReturn" class="form-label">Num Return</label>
                        <input type="number" class="form-control" id="numReturn" value="1" min="1" max="5">
                    </div>
                </div>
            </div>
        `,
        'question-answering': `
            <div class="row">
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="context" class="form-label">Context</label>
                        <textarea class="form-control" id="context" rows="3" placeholder="Enter context...">Hugging Face is a company that provides NLP tools.</textarea>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="question" class="form-label">Question</label>
                        <textarea class="form-control" id="question" rows="3" placeholder="Enter question...">What does Hugging Face provide?</textarea>
                    </div>
                </div>
            </div>
        `,
        'translation': `
            <div class="row">
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="srcLang" class="form-label">Source Language</label>
                        <select class="form-select" id="srcLang">
                            <option value="en">English</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                            <option value="es">Spanish</option>
                        </select>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="tgtLang" class="form-label">Target Language</label>
                        <select class="form-select" id="tgtLang">
                            <option value="fr">French</option>
                            <option value="de">German</option>
                            <option value="es">Spanish</option>
                            <option value="en">English</option>
                        </select>
                    </div>
                </div>
            </div>
        `
    };
    
    // Update model options based on selected task
    function updateModelOptions() {
        const task = taskSelect.value;
        const models = taskModels[task] || [];
        
        // Clear current options
        modelSelect.innerHTML = '<option value="">Default for selected task</option>';
        
        // Add new options
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.value;
            option.textContent = model.label;
            modelSelect.appendChild(option);
        });
        
        // Update default input text
        inputText.value = defaultInputs[task] || '';
        
        // Update additional parameters
        updateAdditionalParams();
    }
    
    // Update additional parameters based on selected task
    function updateAdditionalParams() {
        const task = taskSelect.value;
        additionalParams.innerHTML = taskParams[task] || '';
        
        // Special handling for question-answering
        if (task === 'question-answering') {
            // Split the input text into context and question
            const parts = inputText.value.split('Question:');
            if (parts.length > 1) {
                const contextPart = parts[0].replace('Context:', '').trim();
                const questionPart = parts[1].trim();
                
                document.getElementById('context').value = contextPart;
                document.getElementById('question').value = questionPart;
                
                // Hide the main input text
                inputText.parentElement.style.display = 'none';
            }
        } else {
            // Show the main input text for other tasks
            inputText.parentElement.style.display = 'block';
        }
    }
    
    // Generate code based on selected options
    function generateCode() {
        const task = taskSelect.value;
        const model = modelSelect.value;
        let input = inputText.value;
        
        let code = `from transformers import pipeline\n\n`;
        
        // Create pipeline
        if (model) {
            code += `# Initialize pipeline with specific model\n`;
            code += `pipe = pipeline("${task}", model="${model}")\n\n`;
        } else {
            code += `# Initialize pipeline with default model\n`;
            code += `pipe = pipeline("${task}")\n\n`;
        }
        
        // Task-specific code
        switch (task) {
            case 'text-generation':
                const maxLength = document.getElementById('maxLength')?.value || 50;
                const temperature = document.getElementById('temperature')?.value || 0.7;
                const numReturn = document.getElementById('numReturn')?.value || 1;
                
                code += `# Generate text\n`;
                code += `result = pipe("${input}", max_length=${maxLength}, temperature=${temperature}, num_return_sequences=${numReturn})\n`;
                break;
                
            case 'question-answering':
                const context = document.getElementById('context')?.value || '';
                const question = document.getElementById('question')?.value || '';
                
                code += `# Answer question based on context\n`;
                code += `result = pipe(question="${question}", context="${context}")\n`;
                break;
                
            case 'translation':
                const srcLang = document.getElementById('srcLang')?.value || 'en';
                const tgtLang = document.getElementById('tgtLang')?.value || 'fr';
                
                code += `# Translate text\n`;
                code += `result = pipe("${input}", src_lang="${srcLang}", tgt_lang="${tgtLang}")\n`;
                break;
                
            default:
                code += `# Process input\n`;
                code += `result = pipe("${input}")\n`;
        }
        
        code += `\n# Print result\nprint(result)`;
        
        return code;
    }
    
    // Simulate running the pipeline
    function simulateRunPipeline() {
        const task = taskSelect.value;
        let result;
        
        // Simulate results based on task
        switch (task) {
            case 'sentiment-analysis':
                result = [
                    {
                        "label": "POSITIVE",
                        "score": 0.9998
                    }
                ];
                break;
                
            case 'text-generation':
                result = [
                    {
                        "generated_text": inputText.value + " incredibly useful for building NLP applications. They provide pre-trained models that can be fine-tuned for specific tasks, saving developers time and computational resources."
                    }
                ];
                break;
                
            case 'fill-mask':
                result = [
                    {
                        "token": "cat",
                        "score": 0.1784,
                        "sequence": "The cat sat on the mat."
                    },
                    {
                        "token": "dog",
                        "score": 0.1749,
                        "sequence": "The dog sat on the mat."
                    },
                    {
                        "token": "man",
                        "score": 0.0589,
                        "sequence": "The man sat on the mat."
                    }
                ];
                break;
                
            case 'token-classification':
                result = [
                    {
                        "entity": "B-PER",
                        "score": 0.9971,
                        "word": "John",
                        "start": 11,
                        "end": 15
                    },
                    {
                        "entity": "B-LOC",
                        "score": 0.9988,
                        "word": "New",
                        "start": 30,
                        "end": 33
                    },
                    {
                        "entity": "I-LOC",
                        "score": 0.9993,
                        "word": "York",
                        "start": 34,
                        "end": 38
                    },
                    {
                        "entity": "I-LOC",
                        "score": 0.9994,
                        "word": "City",
                        "start": 39,
                        "end": 43
                    }
                ];
                break;
                
            case 'question-answering':
                const context = document.getElementById('context')?.value || '';
                const question = document.getElementById('question')?.value || '';
                
                result = {
                    "score": 0.9876,
                    "start": 27,
                    "end": 37,
                    "answer": "NLP tools"
                };
                break;
                
            case 'summarization':
                result = [
                    {
                        "summary_text": "Hugging Face is a New York-based company that develops tools for machine learning applications. Their main product is the Transformers library for NLP tasks."
                    }
                ];
                break;
                
            case 'translation':
                const tgtLang = document.getElementById('tgtLang')?.value || 'fr';
                
                if (tgtLang === 'fr') {
                    result = [
                        {
                            "translation_text": "Bonjour, comment allez-vous aujourd'hui?"
                        }
                    ];
                } else if (tgtLang === 'de') {
                    result = [
                        {
                            "translation_text": "Hallo, wie geht es Ihnen heute?"
                        }
                    ];
                } else if (tgtLang === 'es') {
                    result = [
                        {
                            "translation_text": "Hola, ¿cómo estás hoy?"
                        }
                    ];
                } else {
                    result = [
                        {
                            "translation_text": "Hello, how are you doing today?"
                        }
                    ];
                }
                break;
                
            default:
                result = { "error": "Task not supported in this demo" };
        }
        
        return result;
    }
    
    // Event Listeners
    taskSelect.addEventListener('change', updateModelOptions);
    
    runPipelineBtn.addEventListener('click', function() {
        // Generate code
        const code = generateCode();
        generatedCode.textContent = code;
        hljs.highlightBlock(generatedCode);
        
        // Simulate running the pipeline
        const result = simulateRunPipeline();
        resultOutput.textContent = JSON.stringify(result, null, 2);
        hljs.highlightBlock(resultOutput);
        
        // Show results
        resultsContainer.style.display = 'block';
        
        // Scroll to results
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    
    copyCodeBtn.addEventListener('click', function() {
        navigator.clipboard.writeText(generatedCode.textContent)
            .then(() => {
                // Change button text temporarily
                const originalText = copyCodeBtn.innerHTML;
                copyCodeBtn.innerHTML = '<i class="bi bi-check"></i> Copied!';
                
                setTimeout(() => {
                    copyCodeBtn.innerHTML = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy code: ', err);
            });
    });
    
    openColabBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Create a base64-encoded version of the code
        const code = generatedCode.textContent;
        const encodedCode = encodeURIComponent(code);
        
        // Open Google Colab with the code
        const colabUrl = `https://colab.research.google.com/github/huggingface/notebooks/blob/main/transformers_doc/en/pipeline_tutorial.ipynb`;
        window.open(colabUrl, '_blank');
    });
    
    // Initialize the page
    updateModelOptions();
});

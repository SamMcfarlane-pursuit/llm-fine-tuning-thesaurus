"""
Comprehensive AI Assistant for Visual LLM Platform
Claude-level quality AI assistant with deep technical knowledge
Specialized in AI/ML, software development, and computer science education
"""

import os
import asyncio
import aiohttp
import json
import logging
import time
import re
from typing import Dict, List, Optional, Any
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class AssistantResponse:
    """Structured response from the AI assistant"""
    content: str
    confidence: float
    sources: List[str]
    code_examples: List[Dict[str, str]]
    related_topics: List[str]
    difficulty_level: str
    response_time: float
    provider_used: str
    tokens_used: int

class ComprehensiveKnowledgeBase:
    """
    Comprehensive knowledge base for AI/ML and software development
    Contains structured information for high-quality responses
    """
    
    def __init__(self):
        self.knowledge_domains = {
            'ai_ml': self._init_ai_ml_knowledge(),
            'software_dev': self._init_software_dev_knowledge(),
            'web_dev': self._init_web_dev_knowledge(),
            'mobile_dev': self._init_mobile_dev_knowledge(),
            'devops': self._init_devops_knowledge(),
            'computer_science': self._init_cs_knowledge()
        }
        
        self.code_templates = self._init_code_templates()
        self.best_practices = self._init_best_practices()
        
        logger.info("🧠 Comprehensive Knowledge Base initialized")

    def _init_ai_ml_knowledge(self) -> Dict[str, Any]:
        """Initialize AI/ML domain knowledge"""
        return {
            'fine_tuning': {
                'lora': {
                    'definition': 'Low-Rank Adaptation (LoRA) is a parameter-efficient fine-tuning technique that freezes pre-trained model weights and injects trainable rank decomposition matrices into each layer of the Transformer architecture.',
                    'advantages': [
                        'Reduces trainable parameters by up to 10,000x',
                        'Maintains comparable performance to full fine-tuning',
                        'Enables multiple task-specific adapters',
                        'Faster training and lower memory requirements',
                        'Prevents catastrophic forgetting'
                    ],
                    'use_cases': [
                        'Domain adaptation (medical, legal, financial)',
                        'Task-specific fine-tuning (summarization, QA)',
                        'Multi-tenant model serving',
                        'Rapid prototyping and experimentation'
                    ],
                    'implementation_steps': [
                        'Choose target modules (attention layers)',
                        'Set rank (r) and alpha parameters',
                        'Initialize LoRA matrices',
                        'Train only LoRA parameters',
                        'Merge or serve with adapters'
                    ]
                },
                'qlora': {
                    'definition': 'QLoRA (Quantized LoRA) extends LoRA by adding 4-bit quantization to the base model, further reducing memory requirements while maintaining training effectiveness.',
                    'key_innovations': [
                        '4-bit NormalFloat (NF4) quantization',
                        'Double quantization for additional compression',
                        'Paged optimizers for memory management',
                        'Gradient checkpointing integration'
                    ],
                    'memory_savings': 'Enables fine-tuning of 65B models on single 48GB GPU',
                    'performance': 'Maintains 99.3% of full fine-tuning performance'
                }
            },
            'architectures': {
                'transformers': {
                    'components': ['Multi-head attention', 'Feed-forward networks', 'Layer normalization', 'Positional encoding'],
                    'variants': ['BERT', 'GPT', 'T5', 'PaLM', 'LLaMA', 'Mistral'],
                    'attention_mechanisms': ['Self-attention', 'Cross-attention', 'Sparse attention', 'Linear attention']
                },
                'optimization': {
                    'techniques': ['Gradient accumulation', 'Mixed precision', 'Gradient clipping', 'Learning rate scheduling'],
                    'optimizers': ['AdamW', 'Lion', 'Sophia', 'Adafactor'],
                    'regularization': ['Dropout', 'Weight decay', 'Label smoothing', 'Mixup']
                }
            }
        }

    def _init_software_dev_knowledge(self) -> Dict[str, Any]:
        """Initialize software development knowledge"""
        return {
            'programming_languages': {
                'python': {
                    'strengths': ['AI/ML ecosystem', 'Rapid prototyping', 'Data science', 'Automation'],
                    'frameworks': ['Django', 'Flask', 'FastAPI', 'PyTorch', 'TensorFlow', 'Pandas'],
                    'best_practices': ['PEP 8', 'Type hints', 'Virtual environments', 'Testing with pytest'],
                    'performance': ['Cython', 'NumPy vectorization', 'Async/await', 'Multiprocessing']
                },
                'javascript': {
                    'strengths': ['Web development', 'Full-stack capability', 'Large ecosystem', 'Real-time applications'],
                    'frameworks': ['React', 'Vue', 'Angular', 'Node.js', 'Express', 'Next.js'],
                    'modern_features': ['ES6+', 'Async/await', 'Modules', 'Destructuring', 'Arrow functions'],
                    'tooling': ['Webpack', 'Vite', 'ESLint', 'Prettier', 'TypeScript']
                }
            },
            'design_patterns': {
                'creational': ['Singleton', 'Factory', 'Builder', 'Prototype'],
                'structural': ['Adapter', 'Decorator', 'Facade', 'Proxy'],
                'behavioral': ['Observer', 'Strategy', 'Command', 'State']
            },
            'testing': {
                'types': ['Unit', 'Integration', 'End-to-end', 'Performance', 'Security'],
                'frameworks': {
                    'python': ['pytest', 'unittest', 'nose2'],
                    'javascript': ['Jest', 'Mocha', 'Cypress', 'Playwright'],
                    'java': ['JUnit', 'TestNG', 'Mockito']
                },
                'best_practices': ['Test-driven development', 'Behavior-driven development', 'Continuous testing']
            }
        }

    def _init_web_dev_knowledge(self) -> Dict[str, Any]:
        """Initialize web development knowledge"""
        return {
            'frontend': {
                'frameworks': {
                    'react': {
                        'concepts': ['Components', 'JSX', 'Virtual DOM', 'Hooks', 'Context'],
                        'ecosystem': ['Redux', 'React Router', 'Material-UI', 'Styled Components'],
                        'best_practices': ['Component composition', 'State management', 'Performance optimization']
                    },
                    'vue': {
                        'concepts': ['Templates', 'Directives', 'Computed properties', 'Watchers'],
                        'ecosystem': ['Vuex', 'Vue Router', 'Nuxt.js', 'Quasar'],
                        'advantages': ['Gentle learning curve', 'Excellent documentation', 'Progressive adoption']
                    }
                },
                'css': {
                    'methodologies': ['BEM', 'OOCSS', 'SMACSS', 'Atomic CSS'],
                    'preprocessors': ['Sass', 'Less', 'Stylus'],
                    'frameworks': ['Tailwind CSS', 'Bootstrap', 'Bulma', 'Foundation'],
                    'modern_features': ['Grid', 'Flexbox', 'Custom properties', 'Container queries']
                }
            },
            'backend': {
                'architectures': ['Monolithic', 'Microservices', 'Serverless', 'Event-driven'],
                'databases': {
                    'relational': ['PostgreSQL', 'MySQL', 'SQLite'],
                    'nosql': ['MongoDB', 'Redis', 'Cassandra', 'DynamoDB'],
                    'concepts': ['ACID', 'CAP theorem', 'Normalization', 'Indexing']
                },
                'apis': {
                    'rest': ['HTTP methods', 'Status codes', 'Resource design', 'Versioning'],
                    'graphql': ['Schema', 'Resolvers', 'Queries', 'Mutations', 'Subscriptions'],
                    'grpc': ['Protocol buffers', 'Streaming', 'Load balancing']
                }
            }
        }

    def _init_mobile_dev_knowledge(self) -> Dict[str, Any]:
        """Initialize mobile development knowledge"""
        return {
            'native': {
                'ios': {
                    'languages': ['Swift', 'Objective-C'],
                    'frameworks': ['UIKit', 'SwiftUI', 'Core Data', 'Combine'],
                    'tools': ['Xcode', 'Instruments', 'TestFlight'],
                    'architecture': ['MVC', 'MVVM', 'VIPER', 'Clean Architecture']
                },
                'android': {
                    'languages': ['Kotlin', 'Java'],
                    'frameworks': ['Android SDK', 'Jetpack Compose', 'Room', 'WorkManager'],
                    'tools': ['Android Studio', 'Gradle', 'ADB'],
                    'architecture': ['MVP', 'MVVM', 'Clean Architecture']
                }
            },
            'cross_platform': {
                'react_native': {
                    'advantages': ['Code reuse', 'Hot reload', 'Native performance', 'Large community'],
                    'components': ['Views', 'Navigation', 'State management', 'Native modules']
                },
                'flutter': {
                    'advantages': ['Single codebase', 'Fast development', 'Custom UI', 'Hot reload'],
                    'concepts': ['Widgets', 'State management', 'Dart language', 'Platform channels']
                }
            }
        }

    def _init_devops_knowledge(self) -> Dict[str, Any]:
        """Initialize DevOps knowledge"""
        return {
            'containerization': {
                'docker': {
                    'concepts': ['Images', 'Containers', 'Dockerfile', 'Volumes', 'Networks'],
                    'best_practices': ['Multi-stage builds', 'Layer optimization', 'Security scanning'],
                    'orchestration': ['Docker Compose', 'Docker Swarm']
                },
                'kubernetes': {
                    'concepts': ['Pods', 'Services', 'Deployments', 'ConfigMaps', 'Secrets'],
                    'architecture': ['Master node', 'Worker nodes', 'etcd', 'API server'],
                    'tools': ['kubectl', 'Helm', 'Istio', 'Prometheus']
                }
            },
            'ci_cd': {
                'principles': ['Continuous integration', 'Continuous delivery', 'Continuous deployment'],
                'tools': ['Jenkins', 'GitLab CI', 'GitHub Actions', 'CircleCI', 'Azure DevOps'],
                'practices': ['Automated testing', 'Code quality gates', 'Deployment strategies']
            },
            'cloud_platforms': {
                'aws': ['EC2', 'S3', 'Lambda', 'RDS', 'EKS', 'CloudFormation'],
                'azure': ['Virtual Machines', 'Blob Storage', 'Functions', 'SQL Database', 'AKS'],
                'gcp': ['Compute Engine', 'Cloud Storage', 'Cloud Functions', 'Cloud SQL', 'GKE']
            }
        }

    def _init_cs_knowledge(self) -> Dict[str, Any]:
        """Initialize computer science fundamentals"""
        return {
            'algorithms': {
                'sorting': ['Quick sort', 'Merge sort', 'Heap sort', 'Radix sort'],
                'searching': ['Binary search', 'Depth-first search', 'Breadth-first search'],
                'graph': ['Dijkstra', 'A*', 'Bellman-Ford', 'Floyd-Warshall'],
                'dynamic_programming': ['Memoization', 'Tabulation', 'Optimal substructure']
            },
            'data_structures': {
                'linear': ['Arrays', 'Linked lists', 'Stacks', 'Queues'],
                'trees': ['Binary trees', 'BST', 'AVL', 'Red-black', 'B-trees'],
                'graphs': ['Adjacency matrix', 'Adjacency list', 'Weighted graphs'],
                'hash_tables': ['Collision resolution', 'Load factor', 'Hash functions']
            },
            'system_design': {
                'scalability': ['Horizontal scaling', 'Vertical scaling', 'Load balancing'],
                'reliability': ['Redundancy', 'Failover', 'Circuit breakers'],
                'consistency': ['ACID', 'BASE', 'CAP theorem', 'Eventual consistency'],
                'patterns': ['Microservices', 'Event sourcing', 'CQRS', 'Saga pattern']
            }
        }

    def _init_code_templates(self) -> Dict[str, Dict[str, str]]:
        """Initialize code templates for common implementations"""
        return {
            'lora_implementation': {
                'python': '''
# Complete LoRA Implementation with PEFT
from peft import LoraConfig, get_peft_model, TaskType
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments, Trainer
import torch

# Load base model and tokenizer
model_name = "microsoft/DialoGPT-medium"
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float16,
    device_map="auto"
)
tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer.pad_token = tokenizer.eos_token

# Configure LoRA
lora_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    inference_mode=False,
    r=16,  # rank - controls adaptation capacity
    lora_alpha=32,  # scaling factor
    lora_dropout=0.1,  # regularization
    target_modules=["c_attn", "c_proj"],  # target attention layers
    bias="none"  # bias handling strategy
)

# Apply LoRA to model
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()
# Output: trainable params: 294,912 || all params: 117,489,664 || trainable%: 0.25

# Training setup
training_args = TrainingArguments(
    output_dir="./lora_model",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=2,
    learning_rate=1e-4,
    fp16=True,
    logging_steps=10,
    save_strategy="epoch"
)

# Train the model
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    tokenizer=tokenizer
)

trainer.train()
'''
            },
            'react_component': {
                'javascript': '''
// Modern React Component with Hooks and TypeScript
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';

interface SearchComponentProps {
  onSearch: (query: string) => Promise<SearchResult[]>;
  placeholder?: string;
  debounceMs?: number;
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
}

const SearchComponent: React.FC<SearchComponentProps> = ({
  onSearch,
  placeholder = "Search...",
  debounceMs = 300
}) => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Memoized debounced search function
  const debouncedSearch = useMemo(
    () => debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const searchResults = await onSearch(searchQuery);
        setResults(searchResults);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs),
    [onSearch, debounceMs]
  );

  // Handle input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    debouncedSearch(newQuery);
  }, [debouncedSearch]);

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <div className="search-component">
      <div className="search-input-container">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="search-input"
          aria-label="Search input"
        />
        {loading && <div className="search-spinner" aria-label="Loading" />}
      </div>

      {error && (
        <div className="search-error" role="alert">
          Error: {error}
        </div>
      )}

      <div className="search-results">
        {results.map((result) => (
          <div key={result.id} className="search-result-item">
            <h3 className="result-title">{result.title}</h3>
            <p className="result-description">{result.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchComponent;
'''
            }
        }

    def _init_best_practices(self) -> Dict[str, List[str]]:
        """Initialize best practices for different domains"""
        return {
            'ai_ml': [
                'Always validate your data before training',
                'Use proper train/validation/test splits',
                'Monitor for overfitting and underfitting',
                'Implement proper evaluation metrics',
                'Version control your datasets and models',
                'Document your experiments thoroughly',
                'Use reproducible random seeds',
                'Implement proper error handling',
                'Monitor model performance in production',
                'Consider ethical implications and bias'
            ],
            'software_development': [
                'Write clean, readable, and maintainable code',
                'Follow SOLID principles',
                'Use meaningful variable and function names',
                'Write comprehensive tests',
                'Document your code and APIs',
                'Use version control effectively',
                'Implement proper error handling',
                'Follow security best practices',
                'Optimize for performance when necessary',
                'Refactor regularly to reduce technical debt'
            ],
            'web_development': [
                'Implement responsive design from the start',
                'Optimize for performance and accessibility',
                'Use semantic HTML elements',
                'Implement proper SEO practices',
                'Secure your applications against common vulnerabilities',
                'Use HTTPS everywhere',
                'Implement proper caching strategies',
                'Monitor and log application performance',
                'Use progressive enhancement',
                'Test across different browsers and devices'
            ]
        }

class ComprehensiveAIAssistant:
    """
    Claude-level AI assistant with comprehensive technical knowledge
    Provides detailed, accurate responses with code examples and best practices
    """
    
    def __init__(self):
        self.knowledge_base = ComprehensiveKnowledgeBase()
        self.providers = self._init_providers()
        self.response_cache = {}
        self.conversation_history = []
        
        logger.info("🤖 Comprehensive AI Assistant initialized")

    def _init_providers(self) -> Dict[str, Dict[str, Any]]:
        """Initialize AI providers with fallback hierarchy"""
        return {
            'ollama': {
                'url': 'http://localhost:11434',
                'model': 'llama3.1',
                'priority': 1,
                'available': True
            },
            'groq': {
                'url': 'https://api.groq.com/openai/v1',
                'model': 'llama3-70b-8192',
                'priority': 2,
                'available': bool(os.getenv('GROQ_API_KEY'))
            }
        }

    async def get_comprehensive_response(self, query: str, context: Optional[Dict[str, Any]] = None) -> AssistantResponse:
        """
        Generate comprehensive, Claude-level response to user query
        
        Args:
            query: User's question or request
            context: Additional context (page, user level, etc.)
            
        Returns:
            AssistantResponse with detailed technical information
        """
        start_time = time.time()
        
        # Analyze query to determine domain and complexity
        query_analysis = self._analyze_query(query)
        
        # Get relevant knowledge from knowledge base
        relevant_knowledge = self._get_relevant_knowledge(query, query_analysis)
        
        # Generate enhanced prompt with context
        enhanced_prompt = self._create_enhanced_prompt(query, relevant_knowledge, context)
        
        # Get response from best available provider
        response_content = await self._get_provider_response(enhanced_prompt, query_analysis)
        
        # Enhance response with additional information
        enhanced_response = self._enhance_response(response_content, query_analysis, relevant_knowledge)
        
        response_time = time.time() - start_time
        
        return AssistantResponse(
            content=enhanced_response['content'],
            confidence=enhanced_response['confidence'],
            sources=enhanced_response['sources'],
            code_examples=enhanced_response['code_examples'],
            related_topics=enhanced_response['related_topics'],
            difficulty_level=query_analysis['difficulty'],
            response_time=response_time,
            provider_used=enhanced_response['provider'],
            tokens_used=enhanced_response['tokens']
        )

    def _analyze_query(self, query: str) -> Dict[str, Any]:
        """Advanced query analysis with enhanced domain detection and intent recognition"""
        query_lower = query.lower()

        # Enhanced domain detection with more comprehensive keywords
        domain_keywords = {
            'ai_ml': [
                'lora', 'qlora', 'fine-tuning', 'transformer', 'neural', 'ai', 'ml', 'machine learning',
                'deep learning', 'pytorch', 'tensorflow', 'hugging face', 'bert', 'gpt', 'llama',
                'attention', 'embedding', 'tokenizer', 'model training', 'inference', 'peft',
                'quantization', 'gradient', 'backpropagation', 'optimization', 'loss function',
                'dataset', 'evaluation', 'metrics', 'overfitting', 'regularization', 'hyperparameter'
            ],
            'web_dev': [
                'react', 'vue', 'angular', 'javascript', 'html', 'css', 'frontend', 'backend',
                'node.js', 'express', 'fastapi', 'django', 'flask', 'api', 'rest', 'graphql',
                'database', 'sql', 'mongodb', 'redis', 'authentication', 'authorization',
                'responsive', 'spa', 'ssr', 'pwa', 'webpack', 'vite', 'typescript', 'jsx'
            ],
            'software_dev': [
                'python', 'java', 'programming', 'algorithm', 'data structure', 'c++', 'c#',
                'golang', 'rust', 'design pattern', 'solid', 'clean code', 'testing',
                'unit test', 'integration', 'refactoring', 'debugging', 'version control',
                'git', 'object oriented', 'functional programming', 'concurrency', 'async'
            ],
            'devops': [
                'docker', 'kubernetes', 'devops', 'ci/cd', 'deployment', 'containerization',
                'orchestration', 'jenkins', 'github actions', 'aws', 'azure', 'gcp',
                'terraform', 'ansible', 'monitoring', 'prometheus', 'grafana', 'logging',
                'microservices', 'load balancing', 'scaling', 'infrastructure', 'cloud'
            ],
            'mobile_dev': [
                'ios', 'android', 'mobile', 'react native', 'flutter', 'swift', 'kotlin',
                'java android', 'xcode', 'android studio', 'app store', 'play store',
                'native', 'cross platform', 'ui/ux', 'responsive design', 'performance'
            ]
        }

        # Calculate domain scores
        domain_scores = {}
        for domain, keywords in domain_keywords.items():
            score = sum(1 for keyword in keywords if keyword in query_lower)
            if score > 0:
                domain_scores[domain] = score

        # Determine primary domain
        domain = max(domain_scores, key=domain_scores.get) if domain_scores else 'general'

        # Enhanced difficulty detection
        difficulty_indicators = {
            'beginner': [
                'basic', 'beginner', 'introduction', 'what is', 'explain', 'simple',
                'getting started', 'tutorial', 'learn', 'understand', 'overview'
            ],
            'intermediate': [
                'implement', 'create', 'build', 'develop', 'setup', 'configure',
                'integrate', 'use', 'apply', 'practice', 'example'
            ],
            'advanced': [
                'advanced', 'optimization', 'performance', 'architecture', 'design pattern',
                'scalability', 'production', 'enterprise', 'complex', 'sophisticated',
                'distributed', 'high-performance', 'best practices', 'trade-offs'
            ]
        }

        difficulty_scores = {}
        for level, indicators in difficulty_indicators.items():
            score = sum(1 for indicator in indicators if indicator in query_lower)
            if score > 0:
                difficulty_scores[level] = score

        difficulty = max(difficulty_scores, key=difficulty_scores.get) if difficulty_scores else 'intermediate'

        # Enhanced intent recognition
        intent_patterns = {
            'explanation': ['what is', 'explain', 'describe', 'define', 'understand', 'concept'],
            'implementation': ['how to', 'implement', 'create', 'build', 'develop', 'setup', 'configure'],
            'code_example': ['example', 'code', 'sample', 'snippet', 'demo', 'show me'],
            'best_practices': ['best practice', 'recommend', 'should', 'guidelines', 'standards'],
            'troubleshooting': ['debug', 'error', 'fix', 'problem', 'issue', 'not working', 'help'],
            'comparison': ['vs', 'versus', 'compare', 'difference', 'better', 'choose'],
            'optimization': ['optimize', 'improve', 'faster', 'efficient', 'performance']
        }

        intent_scores = {}
        for intent_type, patterns in intent_patterns.items():
            score = sum(1 for pattern in patterns if pattern in query_lower)
            if score > 0:
                intent_scores[intent_type] = score

        intent = max(intent_scores, key=intent_scores.get) if intent_scores else 'explanation'

        # Determine additional requirements
        requires_code = intent in ['implementation', 'code_example'] or any(
            term in query_lower for term in ['code', 'example', 'implement', 'build', 'create']
        )

        requires_visual_llm_context = any(
            term in query_lower for term in ['visual llm', 'platform', 'website', 'tutorial', 'lesson']
        )

        return {
            'domain': domain,
            'difficulty': difficulty,
            'intent': intent,
            'requires_code': requires_code,
            'requires_examples': True,
            'requires_visual_llm_context': requires_visual_llm_context,
            'technical_depth': 'high' if difficulty == 'advanced' else 'medium',
            'domain_confidence': domain_scores.get(domain, 0),
            'complexity_score': len([w for w in query_lower.split() if len(w) > 6])  # Complexity indicator
        }

    def _get_relevant_knowledge(self, query: str, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Extract relevant knowledge from knowledge base"""
        domain = analysis['domain']
        relevant_knowledge = {}

        if domain in self.knowledge_base.knowledge_domains:
            relevant_knowledge = self.knowledge_base.knowledge_domains[domain]

        if analysis['requires_code']:
            relevant_knowledge['code_templates'] = self.knowledge_base.code_templates

        if domain in self.knowledge_base.best_practices:
            relevant_knowledge['best_practices'] = self.knowledge_base.best_practices[domain]

        return relevant_knowledge

    def _create_enhanced_prompt(self, query: str, knowledge: Dict[str, Any], context: Optional[Dict[str, Any]]) -> str:
        """Create enhanced prompt with comprehensive context"""

        # Determine user expertise level and context
        user_level = context.get('user_level', 'intermediate') if context else 'intermediate'
        page_context = context.get('page', '') if context else ''

        # Enhanced system prompt with adaptive expertise
        system_prompt = f"""You are an exceptional AI assistant and coding copilot for the Visual LLM platform, providing responses comparable to Claude-4 and GPT-4. You are the definitive expert in AI/ML education, LLM fine-tuning, and comprehensive software development.

CORE IDENTITY & EXPERTISE:
- You are the Visual LLM platform's premier AI educator and technical mentor
- You specialize in making complex AI/ML concepts accessible and actionable
- You provide production-ready code solutions with enterprise-level quality
- You adapt your communication style to user expertise level: {user_level}

RESPONSE EXCELLENCE STANDARDS:
1. **Technical Accuracy**: Provide cutting-edge, industry-standard information
2. **Practical Implementation**: Always include complete, working code examples
3. **Educational Depth**: Explain the 'why' behind every recommendation
4. **Multiple Approaches**: Offer beginner, intermediate, and advanced solutions
5. **Real-World Context**: Include production considerations, scalability, and best practices
6. **Troubleshooting Mastery**: Anticipate common issues and provide solutions
7. **Visual LLM Integration**: Reference platform features and learning paths when relevant

SPECIALIZED KNOWLEDGE DOMAINS:
- **LLM Fine-tuning Excellence**: LoRA, QLoRA, PEFT, parameter-efficient training
- **AI/ML Production**: Model deployment, monitoring, MLOps, distributed training
- **Software Architecture**: Microservices, system design, scalability patterns
- **Full-Stack Development**: Modern frameworks, performance optimization, security
- **DevOps Mastery**: Containerization, orchestration, CI/CD, cloud platforms
- **Computer Science Fundamentals**: Algorithms, data structures, complexity analysis

ADAPTIVE COMMUNICATION:
- **Beginner**: Use analogies, step-by-step guidance, extensive explanations
- **Intermediate**: Balance theory with practice, include optimization tips
- **Advanced/Expert**: Focus on cutting-edge techniques, architectural decisions, trade-offs

UNIQUE VALUE PROPOSITION:
- Provide implementation guidance that actually works in production
- Offer multiple solution paths with clear trade-offs
- Include performance benchmarks and optimization strategies
- Connect concepts to Visual LLM platform learning objectives
- Maintain an encouraging, mentor-like tone that builds confidence

Current context: User is on page '{page_context}' with {user_level} expertise level."""

        # Add relevant knowledge context
        knowledge_context = ""
        if knowledge:
            knowledge_context = f"\n\nRELEVANT KNOWLEDGE CONTEXT:\n{json.dumps(knowledge, indent=2)[:1000]}..."

        enhanced_prompt = f"{system_prompt}{knowledge_context}\n\nUser Question: {query}\n\nProvide a comprehensive, exceptional response that demonstrates true AI assistant excellence:"
        return enhanced_prompt

    async def _get_provider_response(self, prompt: str, analysis: Dict[str, Any]) -> str:
        """Get response from best available provider with fallback"""

        for provider_name, config in sorted(self.providers.items(), key=lambda x: x[1]['priority']):
            if not config['available']:
                continue

            try:
                if provider_name == 'ollama':
                    response = await self._query_ollama(prompt, config)
                elif provider_name == 'groq':
                    response = await self._query_groq(prompt, config)
                else:
                    continue

                if response:
                    return response

            except Exception as e:
                logger.warning(f"Provider {provider_name} failed: {e}")
                continue

        return self._generate_fallback_response(analysis)

    async def _query_ollama(self, prompt: str, config: Dict[str, Any]) -> str:
        """Query Ollama with enhanced prompt"""
        try:
            payload = {
                "model": config['model'],
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "num_ctx": 8192,
                    "num_predict": 2048
                }
            }

            async with aiohttp.ClientSession() as session:
                async with session.post(f"{config['url']}/api/generate", json=payload, timeout=120) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data.get('response', '')

        except Exception as e:
            logger.error(f"Ollama query failed: {e}")

        return ""

    def _generate_fallback_response(self, analysis: Dict[str, Any]) -> str:
        """Generate comprehensive fallback response when providers fail"""
        domain = analysis['domain']

        fallback_responses = {
            'ai_ml': """I'd be happy to help with your AI/ML question! Here's comprehensive guidance:

**LLM Fine-tuning Techniques:**

**LoRA (Low-Rank Adaptation):**
- Reduces trainable parameters by up to 10,000x
- Maintains 99%+ of full fine-tuning performance
- Key parameters: rank (r=16), alpha (32), dropout (0.1)
- Target modules: attention layers (q_proj, v_proj, k_proj, o_proj)

**QLoRA (Quantized LoRA):**
- Combines LoRA with 4-bit quantization
- Enables fine-tuning 65B models on single 48GB GPU
- Uses NF4 quantization and double quantization
- Perfect for resource-constrained environments

**Implementation Best Practices:**
1. Use Hugging Face PEFT library for easy implementation
2. Start with smaller learning rates (1e-4 to 1e-5)
3. Monitor training loss and validation metrics
4. Use gradient accumulation for larger effective batch sizes
5. Implement proper data preprocessing and tokenization

**Code Example Structure:**
```python
from peft import LoraConfig, get_peft_model
# Configure LoRA with optimal parameters
# Apply to target modules
# Train with proper hyperparameters
```

Would you like specific implementation details for any particular aspect?""",

            'software_dev': """I'm here to provide comprehensive software development guidance:

**Core Programming Principles:**

**Clean Code Practices:**
- Use meaningful, descriptive variable and function names
- Keep functions small and focused (single responsibility)
- Write self-documenting code with clear logic flow
- Implement proper error handling and logging

**SOLID Principles:**
- Single Responsibility: One class, one reason to change
- Open/Closed: Open for extension, closed for modification
- Liskov Substitution: Subtypes must be substitutable
- Interface Segregation: Many specific interfaces vs one general
- Dependency Inversion: Depend on abstractions, not concretions

**Testing Strategy:**
- Unit tests: Test individual components in isolation
- Integration tests: Test component interactions
- End-to-end tests: Test complete user workflows
- Test-driven development (TDD) for better design

**Performance Optimization:**
- Profile before optimizing (measure, don't guess)
- Optimize algorithms and data structures first
- Use appropriate caching strategies
- Implement lazy loading where beneficial

**Security Best Practices:**
- Validate and sanitize all inputs
- Use parameterized queries to prevent SQL injection
- Implement proper authentication and authorization
- Keep dependencies updated and scan for vulnerabilities

Would you like detailed examples for any specific technology or concept?""",

            'web_dev': """I'm ready to provide comprehensive web development guidance:

**Frontend Development:**

**Modern JavaScript/TypeScript:**
- Use ES6+ features: destructuring, arrow functions, async/await
- Implement proper error handling with try/catch blocks
- Leverage TypeScript for better type safety and developer experience
- Use modern bundlers (Vite, Webpack) for optimization

**React Best Practices:**
- Use functional components with hooks
- Implement proper state management (useState, useReducer, Context)
- Optimize performance with useMemo, useCallback, React.memo
- Follow component composition patterns

**CSS/Styling:**
- Use CSS Grid and Flexbox for layouts
- Implement responsive design with mobile-first approach
- Use CSS custom properties for theming
- Consider CSS-in-JS or utility frameworks (Tailwind CSS)

**Backend Development:**

**API Design:**
- Follow RESTful principles with proper HTTP methods
- Implement consistent error handling and status codes
- Use proper authentication (JWT, OAuth) and authorization
- Document APIs with OpenAPI/Swagger

**Database Optimization:**
- Design normalized database schemas
- Use appropriate indexes for query performance
- Implement connection pooling
- Consider caching strategies (Redis, Memcached)

**Performance & Security:**
- Implement HTTPS everywhere
- Use Content Security Policy (CSP) headers
- Optimize images and assets
- Implement proper CORS policies

Would you like specific examples for any framework or technology stack?"""
        }

        return fallback_responses.get(domain, "I'm here to provide comprehensive technical guidance! Please ask about AI/ML, software development, web development, mobile development, DevOps, or computer science topics, and I'll provide detailed explanations with practical examples.")

    def _enhance_response(self, content: str, analysis: Dict[str, Any], knowledge: Dict[str, Any]) -> Dict[str, Any]:
        """Enhance response with advanced structured information and quality metrics"""

        # Extract and enhance code examples
        code_examples = self._extract_and_enhance_code_examples(content, analysis)

        # Generate contextual related topics
        related_topics = self._generate_contextual_related_topics(analysis, knowledge, content)

        # Calculate advanced confidence score
        confidence = self._calculate_advanced_confidence(content, analysis, code_examples)

        # Generate authoritative sources
        sources = self._generate_authoritative_sources(analysis, content)

        # Add learning path suggestions
        learning_path = self._generate_learning_path(analysis)

        # Add troubleshooting tips
        troubleshooting_tips = self._generate_troubleshooting_tips(analysis, content)

        # Calculate response quality metrics
        quality_metrics = self._calculate_quality_metrics(content, code_examples, analysis)

        return {
            'content': content,
            'confidence': confidence,
            'sources': sources,
            'code_examples': code_examples,
            'related_topics': related_topics,
            'learning_path': learning_path,
            'troubleshooting_tips': troubleshooting_tips,
            'quality_metrics': quality_metrics,
            'provider': 'comprehensive_ai',
            'tokens': len(content.split()),
            'educational_quality': 'claude_level',
            'technical_depth': analysis.get('technical_depth', 'medium'),
            'comprehensive': True
        }

    def _extract_and_enhance_code_examples(self, content: str, analysis: Dict[str, Any]) -> List[Dict[str, str]]:
        """Extract and enhance code examples with detailed metadata"""
        code_examples = []
        code_pattern = r'```(\w+)?\n(.*?)\n```'
        matches = re.findall(code_pattern, content, re.DOTALL)

        for i, (language, code) in enumerate(matches):
            # Determine code complexity and type
            code_lines = code.strip().split('\n')
            complexity = 'simple' if len(code_lines) <= 10 else 'moderate' if len(code_lines) <= 30 else 'complex'

            # Generate enhanced description based on content analysis
            description = self._generate_code_description(code, language, analysis)

            # Add execution instructions
            execution_notes = self._generate_execution_notes(language, code)

            code_examples.append({
                'language': language or 'text',
                'code': code.strip(),
                'description': description,
                'complexity': complexity,
                'lines_of_code': len(code_lines),
                'execution_notes': execution_notes,
                'best_practices': self._extract_best_practices_from_code(code, language),
                'example_number': i + 1
            })

        return code_examples

    def _generate_code_description(self, code: str, language: str, analysis: Dict[str, Any]) -> str:
        """Generate intelligent description for code examples"""
        code_lower = code.lower()
        domain = analysis.get('domain', 'general')

        # AI/ML specific descriptions
        if domain == 'ai_ml':
            if 'lora' in code_lower or 'peft' in code_lower:
                return 'LoRA fine-tuning implementation with PEFT library'
            elif 'transformers' in code_lower:
                return 'Transformer model implementation using Hugging Face'
            elif 'torch' in code_lower or 'pytorch' in code_lower:
                return 'PyTorch neural network implementation'
            elif 'train' in code_lower:
                return 'Model training loop with optimization'

        # Web development descriptions
        elif domain == 'web_dev':
            if language == 'javascript' or language == 'jsx':
                if 'react' in code_lower:
                    return 'React component with modern hooks and TypeScript'
                elif 'api' in code_lower:
                    return 'API integration with error handling'
            elif language == 'python':
                if 'flask' in code_lower or 'fastapi' in code_lower:
                    return 'Backend API endpoint implementation'

        # DevOps descriptions
        elif domain == 'devops':
            if language == 'dockerfile':
                return 'Production-ready Docker container configuration'
            elif language == 'yaml':
                return 'Kubernetes deployment configuration'
            elif 'jenkins' in code_lower:
                return 'CI/CD pipeline configuration'

        return f'{language.title()} implementation example'

    def _generate_execution_notes(self, language: str, code: str) -> str:
        """Generate execution instructions for code examples"""
        if language == 'python':
            if 'pip install' in code or 'requirements.txt' in code:
                return 'Install dependencies first: pip install -r requirements.txt'
            elif 'torch' in code or 'transformers' in code:
                return 'Requires PyTorch and Transformers: pip install torch transformers'
            else:
                return 'Run with: python script_name.py'

        elif language == 'javascript' or language == 'jsx':
            if 'npm' in code or 'package.json' in code:
                return 'Install dependencies: npm install, then run: npm start'
            else:
                return 'Run with Node.js: node script_name.js'

        elif language == 'bash':
            return 'Execute in terminal with appropriate permissions'

        elif language == 'dockerfile':
            return 'Build with: docker build -t image_name .'

        elif language == 'yaml':
            if 'kubernetes' in code.lower() or 'kubectl' in code.lower():
                return 'Apply with: kubectl apply -f filename.yaml'
            else:
                return 'Configuration file - apply according to your system'

        return f'Execute according to {language} standards'

    def _extract_best_practices_from_code(self, code: str, language: str) -> List[str]:
        """Extract best practices demonstrated in code"""
        practices = []
        code_lower = code.lower()

        # General practices
        if 'try:' in code and 'except' in code:
            practices.append('Proper error handling with try/except blocks')

        if 'logging' in code_lower or 'logger' in code_lower:
            practices.append('Comprehensive logging for debugging and monitoring')

        # Language-specific practices
        if language == 'python':
            if 'type hints' in code or '->' in code or ': str' in code:
                practices.append('Type hints for better code documentation')
            if '__name__ == "__main__"' in code:
                practices.append('Proper script entry point protection')
            if 'with open' in code:
                practices.append('Context managers for resource management')

        elif language == 'javascript' or language == 'jsx':
            if 'const ' in code:
                practices.append('Using const for immutable variables')
            if 'async' in code and 'await' in code:
                practices.append('Modern async/await for asynchronous operations')
            if 'useCallback' in code or 'useMemo' in code:
                practices.append('React performance optimization with hooks')

        return practices if practices else ['Clean, readable code structure']

    def _generate_contextual_related_topics(self, analysis: Dict[str, Any], knowledge: Dict[str, Any], content: str) -> List[str]:
        """Generate contextual related topics based on analysis and content"""
        domain = analysis['domain']
        difficulty = analysis['difficulty']

        # Base topics by domain
        base_topics = {
            'ai_ml': [
                'Parameter-efficient fine-tuning techniques',
                'Transformer architecture optimization',
                'Model quantization strategies',
                'Distributed training approaches',
                'Model evaluation and metrics',
                'Hyperparameter optimization'
            ],
            'software_dev': [
                'Design patterns and architecture',
                'Code quality and testing strategies',
                'Performance optimization techniques',
                'Security best practices',
                'Refactoring and technical debt',
                'API design principles'
            ],
            'web_dev': [
                'Modern JavaScript frameworks',
                'Progressive Web Apps (PWAs)',
                'Web performance optimization',
                'Accessibility guidelines',
                'SEO best practices',
                'Cross-browser compatibility'
            ],
            'devops': [
                'Container orchestration strategies',
                'Infrastructure as Code (IaC)',
                'Monitoring and observability',
                'Security in DevOps pipelines',
                'Scalability patterns',
                'Disaster recovery planning'
            ],
            'mobile_dev': [
                'Cross-platform development',
                'Mobile performance optimization',
                'App store optimization',
                'Mobile security best practices',
                'Offline-first architecture',
                'Push notification strategies'
            ]
        }

        topics = base_topics.get(domain, ['Software engineering principles', 'Best practices', 'Industry standards'])

        # Add difficulty-specific topics
        if difficulty == 'beginner':
            topics.extend([
                'Getting started guides',
                'Fundamental concepts',
                'Common beginner mistakes to avoid'
            ])
        elif difficulty == 'advanced':
            topics.extend([
                'Advanced architectural patterns',
                'Performance optimization strategies',
                'Enterprise-level considerations'
            ])

        # Add content-specific topics based on keywords in response
        content_lower = content.lower()
        if 'docker' in content_lower:
            topics.append('Container security best practices')
        if 'kubernetes' in content_lower:
            topics.append('Kubernetes networking and storage')
        if 'react' in content_lower:
            topics.append('React performance optimization')
        if 'lora' in content_lower or 'fine-tuning' in content_lower:
            topics.append('Advanced fine-tuning techniques')

        return list(set(topics))  # Remove duplicates

    def _generate_learning_path(self, analysis: Dict[str, Any]) -> List[str]:
        """Generate personalized learning path suggestions"""
        domain = analysis['domain']
        difficulty = analysis['difficulty']

        learning_paths = {
            'ai_ml': {
                'beginner': [
                    'Start with Python programming fundamentals',
                    'Learn basic machine learning concepts',
                    'Practice with scikit-learn and pandas',
                    'Understand neural network basics',
                    'Explore PyTorch or TensorFlow tutorials'
                ],
                'intermediate': [
                    'Deep dive into transformer architectures',
                    'Practice with Hugging Face transformers',
                    'Learn about fine-tuning techniques',
                    'Experiment with LoRA and QLoRA',
                    'Build end-to-end ML pipelines'
                ],
                'advanced': [
                    'Master distributed training techniques',
                    'Implement custom training loops',
                    'Optimize model performance and memory',
                    'Deploy models to production',
                    'Research cutting-edge techniques'
                ]
            },
            'web_dev': {
                'beginner': [
                    'Master HTML, CSS, and JavaScript fundamentals',
                    'Learn responsive design principles',
                    'Practice with a modern framework (React/Vue)',
                    'Understand basic backend concepts',
                    'Build simple full-stack projects'
                ],
                'intermediate': [
                    'Master advanced framework features',
                    'Learn state management patterns',
                    'Implement authentication and authorization',
                    'Practice API design and integration',
                    'Deploy applications to cloud platforms'
                ],
                'advanced': [
                    'Architect scalable web applications',
                    'Implement advanced performance optimizations',
                    'Master microservices architecture',
                    'Lead technical teams and projects',
                    'Contribute to open-source projects'
                ]
            }
        }

        return learning_paths.get(domain, {}).get(difficulty, [
            'Continue practicing with hands-on projects',
            'Join developer communities and forums',
            'Read technical documentation and blogs',
            'Contribute to open-source projects',
            'Build a portfolio of diverse projects'
        ])

    def _generate_troubleshooting_tips(self, analysis: Dict[str, Any], content: str) -> List[str]:
        """Generate relevant troubleshooting tips"""
        domain = analysis['domain']
        content_lower = content.lower()

        tips = []

        # Domain-specific troubleshooting
        if domain == 'ai_ml':
            tips.extend([
                'Monitor GPU memory usage during training',
                'Check for data leakage in train/validation splits',
                'Verify tensor shapes and data types',
                'Use gradient clipping to prevent exploding gradients'
            ])

            if 'lora' in content_lower or 'fine-tuning' in content_lower:
                tips.extend([
                    'Start with smaller learning rates (1e-5 to 1e-4)',
                    'Monitor training loss for signs of overfitting',
                    'Ensure target modules are correctly specified'
                ])

        elif domain == 'web_dev':
            tips.extend([
                'Check browser console for JavaScript errors',
                'Verify API endpoints and network requests',
                'Test across different browsers and devices',
                'Use browser dev tools for debugging'
            ])

            if 'react' in content_lower:
                tips.extend([
                    'Check for key prop warnings in lists',
                    'Verify component state updates',
                    'Use React DevTools for debugging'
                ])

        elif domain == 'devops':
            tips.extend([
                'Check container logs for error messages',
                'Verify resource limits and requests',
                'Test configurations in staging environment',
                'Monitor system resources and performance'
            ])

        # General troubleshooting tips
        tips.extend([
            'Read error messages carefully and search for solutions',
            'Check official documentation and GitHub issues',
            'Create minimal reproducible examples',
            'Ask for help in relevant community forums'
        ])

        return tips[:6]  # Limit to most relevant tips

    def _calculate_advanced_confidence(self, content: str, analysis: Dict[str, Any], code_examples: List[Dict]) -> float:
        """Calculate advanced confidence score with multiple factors"""
        confidence = 0.6  # Base confidence

        # Content length and depth
        word_count = len(content.split())
        if word_count > 300:
            confidence += 0.1
        if word_count > 600:
            confidence += 0.1
        if word_count > 1000:
            confidence += 0.05

        # Code examples quality
        if code_examples:
            confidence += 0.1
            if len(code_examples) > 1:
                confidence += 0.05

            # Check for best practices in code
            for example in code_examples:
                if example.get('best_practices'):
                    confidence += 0.02

        # Structure and formatting
        if any(marker in content for marker in ['1.', '2.', '3.', '**', '##']):
            confidence += 0.05

        # Technical depth indicators
        technical_terms = ['implementation', 'architecture', 'optimization', 'best practices', 'production']
        technical_score = sum(1 for term in technical_terms if term in content.lower())
        confidence += min(technical_score * 0.02, 0.1)

        # Domain expertise indicators
        domain = analysis.get('domain', 'general')
        if domain != 'general':
            confidence += 0.05

        return min(confidence, 0.98)  # Cap at 98%

    def _calculate_quality_metrics(self, content: str, code_examples: List[Dict], analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate comprehensive quality metrics"""
        return {
            'word_count': len(content.split()),
            'code_examples_count': len(code_examples),
            'technical_depth_score': analysis.get('complexity_score', 0),
            'readability_score': self._calculate_readability_score(content),
            'completeness_score': self._calculate_completeness_score(content, analysis),
            'practical_value_score': self._calculate_practical_value_score(content, code_examples)
        }

    def _calculate_readability_score(self, content: str) -> float:
        """Calculate readability score based on structure and formatting"""
        score = 0.5

        # Check for good structure
        if '##' in content or '**' in content:
            score += 0.2
        if any(marker in content for marker in ['1.', '2.', '3.', '-', '*']):
            score += 0.2

        # Check sentence length (shorter is better for readability)
        sentences = content.split('.')
        avg_sentence_length = sum(len(s.split()) for s in sentences) / len(sentences) if sentences else 0
        if avg_sentence_length < 20:
            score += 0.1

        return min(score, 1.0)

    def _calculate_completeness_score(self, content: str, analysis: Dict[str, Any]) -> float:
        """Calculate how complete the response is"""
        score = 0.5

        # Check for key elements based on intent
        intent = analysis.get('intent', 'explanation')

        if intent == 'implementation' and 'step' in content.lower():
            score += 0.2
        if intent == 'code_example' and '```' in content:
            score += 0.2
        if intent == 'best_practices' and 'practice' in content.lower():
            score += 0.2

        # Check for comprehensive coverage
        if 'example' in content.lower():
            score += 0.1
        if 'best practice' in content.lower():
            score += 0.1
        if 'troubleshoot' in content.lower() or 'debug' in content.lower():
            score += 0.1

        return min(score, 1.0)

    def _calculate_practical_value_score(self, content: str, code_examples: List[Dict]) -> float:
        """Calculate practical value of the response"""
        score = 0.4

        # Code examples add practical value
        if code_examples:
            score += 0.3
            if len(code_examples) > 1:
                score += 0.1

        # Practical keywords
        practical_terms = ['implement', 'build', 'create', 'setup', 'configure', 'deploy']
        practical_count = sum(1 for term in practical_terms if term in content.lower())
        score += min(practical_count * 0.05, 0.2)

        return min(score, 1.0)

    def _generate_related_topics(self, analysis: Dict[str, Any], knowledge: Dict[str, Any]) -> List[str]:
        """Generate related topics based on query analysis"""
        domain = analysis['domain']

        related_topics_map = {
            'ai_ml': [
                'Parameter-efficient fine-tuning techniques',
                'Transformer architecture optimization',
                'Model quantization strategies',
                'Distributed training approaches',
                'Model evaluation and metrics',
                'Hyperparameter optimization'
            ],
            'software_dev': [
                'Design patterns and architecture',
                'Code quality and testing strategies',
                'Performance optimization techniques',
                'Security best practices',
                'Refactoring and technical debt',
                'API design principles'
            ],
            'web_dev': [
                'Modern JavaScript frameworks',
                'Progressive Web Apps (PWAs)',
                'Web performance optimization',
                'Accessibility guidelines',
                'SEO best practices',
                'Cross-browser compatibility'
            ]
        }

        return related_topics_map.get(domain, ['Software engineering principles', 'Best practices', 'Industry standards'])

    def _calculate_confidence(self, content: str, analysis: Dict[str, Any]) -> float:
        """Calculate confidence score based on response quality"""
        confidence = 0.7

        if len(content) > 500:
            confidence += 0.1
        if len(content) > 1000:
            confidence += 0.1
        if '```' in content:
            confidence += 0.1
        if any(marker in content for marker in ['1.', '2.', '3.', '-', '*']):
            confidence += 0.05

        return min(confidence, 0.95)

    def _generate_authoritative_sources(self, analysis: Dict[str, Any], content: str) -> List[str]:
        """Generate authoritative sources based on domain and content"""
        domain = analysis['domain']
        content_lower = content.lower()

        # Base sources by domain
        sources_map = {
            'ai_ml': [
                'Hugging Face Documentation',
                'PyTorch Documentation',
                'Papers With Code',
                'ArXiv Papers',
                'Google AI Research'
            ],
            'software_dev': [
                'Official Language Documentation',
                'Stack Overflow Community',
                'GitHub Best Practices',
                'Clean Code Principles',
                'Design Patterns Literature'
            ],
            'web_dev': [
                'MDN Web Docs',
                'W3C Web Standards',
                'Framework Official Documentation',
                'Web.dev Performance Guidelines',
                'Can I Use Browser Compatibility'
            ],
            'devops': [
                'Docker Official Documentation',
                'Kubernetes Documentation',
                'Cloud Provider Best Practices',
                'CNCF Guidelines',
                'DevOps Institute Standards'
            ],
            'mobile_dev': [
                'Apple Developer Documentation',
                'Android Developer Guides',
                'React Native Documentation',
                'Flutter Official Docs',
                'Mobile Development Best Practices'
            ]
        }

        base_sources = sources_map.get(domain, ['Official Documentation', 'Industry Best Practices'])

        # Add content-specific sources
        additional_sources = []

        if 'lora' in content_lower or 'qlora' in content_lower:
            additional_sources.extend(['PEFT Library Documentation', 'LoRA Research Papers'])

        if 'react' in content_lower:
            additional_sources.append('React Official Documentation')

        if 'kubernetes' in content_lower:
            additional_sources.append('Kubernetes Official Documentation')

        if 'docker' in content_lower:
            additional_sources.append('Docker Official Documentation')

        if 'aws' in content_lower:
            additional_sources.append('AWS Documentation')

        if 'security' in content_lower:
            additional_sources.append('OWASP Security Guidelines')

        # Combine and deduplicate
        all_sources = base_sources + additional_sources
        return list(dict.fromkeys(all_sources))  # Remove duplicates while preserving order

    async def _get_provider_response(self, prompt: str, analysis: Dict[str, Any]) -> str:
        """Get response from best available provider with fallback"""

        # Try providers in priority order
        for provider_name, config in sorted(self.providers.items(), key=lambda x: x[1]['priority']):
            if not config['available']:
                continue

            try:
                if provider_name == 'ollama':
                    response = await self._query_ollama(prompt, config)
                elif provider_name == 'groq':
                    response = await self._query_groq(prompt, config)
                else:
                    continue

                if response:
                    return response

            except Exception as e:
                logger.warning(f"Provider {provider_name} failed: {e}")
                continue

        # Fallback response if all providers fail
        return self._generate_fallback_response(analysis)

    async def _query_ollama(self, prompt: str, config: Dict[str, Any]) -> str:
        """Query Ollama with enhanced prompt"""
        try:
            payload = {
                "model": config['model'],
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "num_ctx": 8192,  # Larger context for detailed responses
                    "num_predict": 2048  # Allow longer responses
                }
            }

            async with aiohttp.ClientSession() as session:
                async with session.post(f"{config['url']}/api/generate", json=payload, timeout=120) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data.get('response', '')

        except Exception as e:
            logger.error(f"Ollama query failed: {e}")

        return ""

    async def _query_groq(self, prompt: str, config: Dict[str, Any]) -> str:
        """Query Groq with enhanced prompt"""
        try:
            import os
            api_key = os.getenv('GROQ_API_KEY')
            if not api_key:
                return ""

            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }

            payload = {
                "model": config['model'],
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 2048
            }

            async with aiohttp.ClientSession() as session:
                async with session.post(f"{config['url']}/chat/completions", headers=headers, json=payload, timeout=60) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data['choices'][0]['message']['content']

        except Exception as e:
            logger.error(f"Groq query failed: {e}")

        return ""

    def _generate_fallback_response(self, analysis: Dict[str, Any]) -> str:
        """Generate fallback response when all providers fail"""
        domain = analysis['domain']

        fallback_responses = {
            'ai_ml': """I'd be happy to help with your AI/ML question! While I'm currently experiencing connectivity issues with my AI providers, I can share some key insights:

For LLM fine-tuning topics like LoRA and QLoRA:
- LoRA (Low-Rank Adaptation) reduces trainable parameters by up to 10,000x while maintaining performance
- QLoRA adds 4-bit quantization for even greater memory efficiency
- Both techniques enable fine-tuning large models on consumer hardware

For implementation, I recommend:
1. Using the Hugging Face PEFT library
2. Starting with rank=16, alpha=32 for LoRA
3. Targeting attention layers (q_proj, v_proj, k_proj, o_proj)
4. Using AdamW optimizer with learning rate 1e-4

Would you like me to provide specific code examples or dive deeper into any particular aspect?""",

            'software_dev': """I'm here to help with your software development question! Even though I'm having temporary connectivity issues, I can provide guidance:

For programming best practices:
- Write clean, readable code with meaningful names
- Follow SOLID principles and design patterns
- Implement comprehensive testing (unit, integration, e2e)
- Use version control effectively with meaningful commits
- Document your code and APIs thoroughly

For specific technologies:
- Python: Use type hints, virtual environments, and follow PEP 8
- JavaScript: Leverage ES6+ features, use proper async/await patterns
- React: Embrace hooks, component composition, and proper state management

Would you like specific examples or guidance on a particular technology or concept?""",

            'web_dev': """I'm ready to assist with your web development question! While experiencing temporary provider issues, I can share essential guidance:

Frontend best practices:
- Implement responsive design with mobile-first approach
- Use semantic HTML and proper accessibility features
- Optimize performance with lazy loading and code splitting
- Follow modern CSS practices (Grid, Flexbox, custom properties)

Backend considerations:
- Design RESTful APIs with proper HTTP methods and status codes
- Implement proper authentication and authorization
- Use database indexing and query optimization
- Follow security best practices (HTTPS, input validation, CORS)

Would you like specific examples for any framework or technology stack?"""
        }

        return fallback_responses.get(domain, "I'm experiencing temporary connectivity issues, but I'm here to help! Please try your question again, and I'll provide a comprehensive response with detailed explanations and code examples.")

    def _enhance_response(self, content: str, analysis: Dict[str, Any], knowledge: Dict[str, Any]) -> Dict[str, Any]:
        """Enhance response with additional structured information"""

        # Extract code examples from response
        code_examples = self._extract_code_examples(content)

        # Generate related topics
        related_topics = self._generate_related_topics(analysis, knowledge)

        # Determine confidence based on content quality
        confidence = self._calculate_confidence(content, analysis)

        # Add sources
        sources = self._generate_sources(analysis)

        return {
            'content': content,
            'confidence': confidence,
            'sources': sources,
            'code_examples': code_examples,
            'related_topics': related_topics,
            'provider': 'ollama',  # Default, should be set by actual provider used
            'tokens': len(content.split())  # Approximate token count
        }

    def _extract_code_examples(self, content: str) -> List[Dict[str, str]]:
        """Extract code examples from response content"""
        code_examples = []

        # Find code blocks with language specification
        code_pattern = r'```(\w+)?\n(.*?)\n```'
        matches = re.findall(code_pattern, content, re.DOTALL)

        for language, code in matches:
            code_examples.append({
                'language': language or 'text',
                'code': code.strip(),
                'description': 'Code example'
            })

        return code_examples

    def _generate_related_topics(self, analysis: Dict[str, Any], knowledge: Dict[str, Any]) -> List[str]:
        """Generate related topics based on query analysis"""
        domain = analysis['domain']

        related_topics_map = {
            'ai_ml': [
                'Parameter-efficient fine-tuning techniques',
                'Transformer architecture deep dive',
                'Model quantization strategies',
                'Distributed training approaches',
                'Model evaluation metrics',
                'Hyperparameter optimization'
            ],
            'software_dev': [
                'Design patterns and architecture',
                'Code quality and testing strategies',
                'Performance optimization techniques',
                'Security best practices',
                'Refactoring and technical debt',
                'API design principles'
            ],
            'web_dev': [
                'Modern JavaScript frameworks',
                'Progressive Web Apps (PWAs)',
                'Web performance optimization',
                'Accessibility (a11y) guidelines',
                'SEO best practices',
                'Cross-browser compatibility'
            ]
        }

        return related_topics_map.get(domain, ['Software engineering principles', 'Best practices', 'Industry standards'])

    def _calculate_confidence(self, content: str, analysis: Dict[str, Any]) -> float:
        """Calculate confidence score based on response quality"""
        confidence = 0.7  # Base confidence

        # Increase confidence for longer, detailed responses
        if len(content) > 500:
            confidence += 0.1
        if len(content) > 1000:
            confidence += 0.1

        # Increase confidence if code examples are present
        if '```' in content:
            confidence += 0.1

        # Increase confidence for structured responses
        if any(marker in content for marker in ['1.', '2.', '3.', '-', '*']):
            confidence += 0.05

        return min(confidence, 0.95)  # Cap at 95%

    def _generate_sources(self, analysis: Dict[str, Any]) -> List[str]:
        """Generate relevant sources based on domain"""
        domain = analysis['domain']

        sources_map = {
            'ai_ml': [
                'Hugging Face Documentation',
                'PyTorch Documentation',
                'Papers With Code',
                'ArXiv Papers',
                'Google AI Research'
            ],
            'software_dev': [
                'Official Documentation',
                'Stack Overflow',
                'GitHub Best Practices',
                'Clean Code Principles',
                'Design Patterns Literature'
            ],
            'web_dev': [
                'MDN Web Docs',
                'W3C Standards',
                'Framework Documentation',
                'Web.dev Guidelines',
                'Can I Use Database'
            ]
        }

        return sources_map.get(domain, ['Official Documentation', 'Industry Best Practices', 'Community Guidelines'])

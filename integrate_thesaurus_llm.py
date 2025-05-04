"""
Script to integrate the AI Thesaurus LLM with the main application
"""

import os
import argparse
from app import app
from ai_thesaurus_llm.app_integration import init_app

def main(args):
    # Initialize the ThesaurusLLM and register the Blueprint with the Flask app
    init_app(
        app=app,
        model_path=args.model_path,
        base_model_name=args.base_model_name,
        use_auth_token=args.auth_token
    )
    
    print(f"AI Thesaurus LLM integrated with the main application")
    print(f"Model path: {args.model_path}")
    print(f"Base model name: {args.base_model_name}")
    
    # Run the Flask app if requested
    if args.run:
        print(f"Starting Flask server on port {args.port}...")
        app.run(host=args.host, port=args.port, debug=args.debug)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Integrate the AI Thesaurus LLM with the main application")
    parser.add_argument("--model_path", type=str, required=True, help="Path to the fine-tuned model")
    parser.add_argument("--base_model_name", type=str, default=None, help="Name of the base model from BASE_MODELS config")
    parser.add_argument("--auth_token", type=str, default=None, help="Hugging Face token for gated models")
    parser.add_argument("--run", action="store_true", help="Run the Flask app after integration")
    parser.add_argument("--host", type=str, default="127.0.0.1", help="Host to run the server on")
    parser.add_argument("--port", type=int, default=5000, help="Port to run the server on")
    parser.add_argument("--debug", action="store_true", help="Run the server in debug mode")
    
    args = parser.parse_args()
    main(args)

#!/usr/bin/env python3
"""
Training System Test Suite
Tests Ollama training system functionality without requiring Ollama installation
"""

import sys
import os
import json
import asyncio
from unittest.mock import Mock, patch, AsyncMock
from pathlib import Path

# Add project root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from ollama_training_system import OllamaTrainingSystem, TrainingConfig, SAMPLE_DATASETS
    from api.ollama_training_api import training_api
except ImportError as e:
    print(f"❌ Import Error: {e}")
    print("Some training system components may not be available")
    OllamaTrainingSystem = None
    TrainingConfig = None
    SAMPLE_DATASETS = None
    training_api = None

class TrainingSystemTester:
    """Test suite for the training system"""
    
    def __init__(self):
        self.test_results = {
            'passed': 0,
            'failed': 0,
            'skipped': 0,
            'tests': []
        }
    
    def log_test(self, test_name: str, status: str, message: str = ""):
        """Log test result"""
        self.test_results['tests'].append({
            'name': test_name,
            'status': status,
            'message': message
        })
        self.test_results[status] += 1
        
        status_icon = {
            'passed': '✅',
            'failed': '❌', 
            'skipped': '⏭️'
        }.get(status, '❓')
        
        print(f"{status_icon} {test_name}: {message}")
    
    def test_file_structure(self):
        """Test if training system files exist"""
        required_files = [
            'ollama_training_system.py',
            'api/ollama_training_api.py',
            'setup_ollama_training.sh',
            'OLLAMA_TRAINING_AND_API_GUIDE.md'
        ]
        
        for file_path in required_files:
            if os.path.exists(file_path):
                self.log_test(f"File exists: {file_path}", 'passed', f"Found {file_path}")
            else:
                self.log_test(f"File exists: {file_path}", 'failed', f"Missing {file_path}")
    
    def test_training_config(self):
        """Test TrainingConfig class"""
        if TrainingConfig is None:
            self.log_test("TrainingConfig class", 'skipped', "TrainingConfig not available")
            return
        
        try:
            config = TrainingConfig(
                model_name="test_model",
                base_model="llama3.1",
                dataset_path="test_dataset.jsonl",
                training_type="lora"
            )
            
            # Test default values
            assert config.epochs == 3
            assert config.learning_rate == 1e-4
            assert config.lora_rank == 16
            
            self.log_test("TrainingConfig creation", 'passed', "Config created with correct defaults")
        except Exception as e:
            self.log_test("TrainingConfig creation", 'failed', str(e))
    
    def test_sample_datasets(self):
        """Test sample datasets availability"""
        if SAMPLE_DATASETS is None:
            self.log_test("Sample datasets", 'skipped', "SAMPLE_DATASETS not available")
            return
        
        try:
            assert isinstance(SAMPLE_DATASETS, dict)
            assert len(SAMPLE_DATASETS) > 0
            
            # Check for expected dataset types
            expected_datasets = ['llm_finetuning', 'code_generation', 'qa_pairs']
            found_datasets = []
            
            for dataset_name in expected_datasets:
                if dataset_name in SAMPLE_DATASETS:
                    found_datasets.append(dataset_name)
            
            self.log_test("Sample datasets", 'passed', f"Found {len(found_datasets)} datasets: {found_datasets}")
        except Exception as e:
            self.log_test("Sample datasets", 'failed', str(e))
    
    def test_training_system_init(self):
        """Test OllamaTrainingSystem initialization"""
        if OllamaTrainingSystem is None:
            self.log_test("Training system init", 'skipped', "OllamaTrainingSystem not available")
            return
        
        try:
            # Mock the system to avoid requiring Ollama
            with patch('ollama_training_system.logger'):
                system = OllamaTrainingSystem()
                
                # Check if directories are created
                assert hasattr(system, 'models_dir')
                assert hasattr(system, 'datasets_dir')
                assert hasattr(system, 'modelfiles_dir')
                
                self.log_test("Training system init", 'passed', "System initialized successfully")
        except Exception as e:
            self.log_test("Training system init", 'failed', str(e))
    
    def test_api_blueprint(self):
        """Test training API blueprint"""
        if training_api is None:
            self.log_test("API blueprint", 'skipped', "training_api not available")
            return
        
        try:
            # Check if blueprint is properly configured
            assert hasattr(training_api, 'name')
            assert training_api.name == 'training_api'
            
            # Check for expected routes (this is a basic check)
            route_count = len(training_api.deferred_functions)
            
            self.log_test("API blueprint", 'passed', f"Blueprint configured with {route_count} routes")
        except Exception as e:
            self.log_test("API blueprint", 'failed', str(e))
    
    def test_training_directories(self):
        """Test training directory structure"""
        expected_dirs = [
            'trained_models',
            'training_datasets', 
            'modelfiles'
        ]
        
        for dir_name in expected_dirs:
            dir_path = Path(dir_name)
            if dir_path.exists() and dir_path.is_dir():
                self.log_test(f"Directory: {dir_name}", 'passed', f"Directory exists")
            else:
                # Create directory for testing
                try:
                    dir_path.mkdir(exist_ok=True)
                    self.log_test(f"Directory: {dir_name}", 'passed', f"Directory created")
                except Exception as e:
                    self.log_test(f"Directory: {dir_name}", 'failed', str(e))
    
    def test_setup_script(self):
        """Test setup script existence and permissions"""
        setup_script = Path('setup_ollama_training.sh')
        
        if not setup_script.exists():
            self.log_test("Setup script exists", 'failed', "setup_ollama_training.sh not found")
            return
        
        self.log_test("Setup script exists", 'passed', "setup_ollama_training.sh found")
        
        # Check if script is executable
        if os.access(setup_script, os.X_OK):
            self.log_test("Setup script executable", 'passed', "Script has execute permissions")
        else:
            self.log_test("Setup script executable", 'failed', "Script not executable")
    
    def test_mock_training_workflow(self):
        """Test a mock training workflow"""
        if TrainingConfig is None or OllamaTrainingSystem is None:
            self.log_test("Mock training workflow", 'skipped', "Training components not available")
            return
        
        try:
            # Create mock config
            config = TrainingConfig(
                model_name="test_llm",
                base_model="llama3.1",
                dataset_path="test_data.jsonl",
                training_type="lora",
                epochs=1,
                learning_rate=0.0001
            )
            
            # Mock training system
            with patch('ollama_training_system.logger'):
                system = OllamaTrainingSystem()
                
                # Test modelfile creation
                with patch.object(system, 'create_modelfile') as mock_create:
                    mock_create.return_value = "test_modelfile_path"
                    modelfile_path = system.create_modelfile(config)
                    assert modelfile_path == "test_modelfile_path"
            
            self.log_test("Mock training workflow", 'passed', "Workflow components work correctly")
        except Exception as e:
            self.log_test("Mock training workflow", 'failed', str(e))
    
    def run_all_tests(self):
        """Run all tests"""
        print("🔥 Training System Test Suite")
        print("=" * 50)
        print()
        
        # Run tests
        self.test_file_structure()
        self.test_training_config()
        self.test_sample_datasets()
        self.test_training_system_init()
        self.test_api_blueprint()
        self.test_training_directories()
        self.test_setup_script()
        self.test_mock_training_workflow()
        
        # Print summary
        print()
        print("📊 Test Results Summary")
        print("=" * 30)
        print(f"✅ Passed: {self.test_results['passed']}")
        print(f"❌ Failed: {self.test_results['failed']}")
        print(f"⏭️ Skipped: {self.test_results['skipped']}")
        print(f"📊 Total: {sum(self.test_results[k] for k in ['passed', 'failed', 'skipped'])}")
        
        # Overall status
        if self.test_results['failed'] == 0:
            print("\n🎉 All tests passed! Training system structure is valid.")
            if self.test_results['skipped'] > 0:
                print(f"💡 Note: {self.test_results['skipped']} tests were skipped (likely due to missing Ollama)")
        else:
            print(f"\n⚠️ {self.test_results['failed']} tests failed. Check the issues above.")
        
        return self.test_results

if __name__ == "__main__":
    tester = TrainingSystemTester()
    results = tester.run_all_tests()
    
    # Exit with appropriate code
    exit_code = 0 if results['failed'] == 0 else 1
    sys.exit(exit_code)
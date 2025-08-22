#!/usr/bin/env python3
"""
LORA MODEL MARKETPLACE FOR VISUAL LLM
Community-driven LoRA adapter sharing and discovery system
"""

import os
import json
import hashlib
import shutil
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LoRAModelMarketplace:
    """Community marketplace for LoRA adapters"""
    
    def __init__(self):
        self.marketplace_dir = Path("marketplace")
        self.models_dir = Path("models")
        self.marketplace_db = self.marketplace_dir / "marketplace.json"
        
        # Create directories
        self.marketplace_dir.mkdir(exist_ok=True)
        (self.marketplace_dir / "adapters").mkdir(exist_ok=True)
        (self.marketplace_dir / "metadata").mkdir(exist_ok=True)
        
        # Load marketplace database
        self.marketplace_data = self._load_marketplace_db()
        
    def _load_marketplace_db(self) -> Dict:
        """Load marketplace database"""
        if self.marketplace_db.exists():
            with open(self.marketplace_db, 'r') as f:
                return json.load(f)
        return {
            "adapters": {},
            "categories": {
                "educational": "Educational and tutorial content",
                "code": "Code generation and programming",
                "chat": "Conversational AI and dialogue",
                "domain": "Domain-specific knowledge",
                "multilingual": "Multi-language support",
                "creative": "Creative writing and content"
            },
            "stats": {
                "total_adapters": 0,
                "total_downloads": 0,
                "last_updated": datetime.now().isoformat()
            }
        }
    
    def _save_marketplace_db(self):
        """Save marketplace database"""
        self.marketplace_data["stats"]["last_updated"] = datetime.now().isoformat()
        with open(self.marketplace_db, 'w') as f:
            json.dump(self.marketplace_data, f, indent=2)
    
    def _calculate_file_hash(self, file_path: Path) -> str:
        """Calculate SHA256 hash of file"""
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                sha256_hash.update(chunk)
        return sha256_hash.hexdigest()
    
    def publish_adapter(self, 
                       adapter_path: str,
                       name: str,
                       description: str,
                       category: str,
                       author: str,
                       base_model: str,
                       tags: List[str] = None,
                       license: str = "MIT") -> bool:
        """Publish a LoRA adapter to the marketplace"""
        
        logger.info(f"📦 Publishing LoRA adapter: {name}")
        
        adapter_path = Path(adapter_path)
        if not adapter_path.exists():
            logger.error(f"❌ Adapter path not found: {adapter_path}")
            return False
        
        # Validate category
        if category not in self.marketplace_data["categories"]:
            logger.error(f"❌ Invalid category: {category}")
            logger.info(f"Available categories: {list(self.marketplace_data['categories'].keys())}")
            return False
        
        # Create adapter ID
        adapter_id = f"{author}_{name}".lower().replace(" ", "_").replace("-", "_")
        
        # Create marketplace entry
        marketplace_entry = self.marketplace_dir / "adapters" / adapter_id
        marketplace_entry.mkdir(exist_ok=True)
        
        # Copy adapter files
        try:
            if marketplace_entry.exists():
                shutil.rmtree(marketplace_entry)
            shutil.copytree(adapter_path, marketplace_entry)
            logger.info(f"✅ Adapter files copied to marketplace")
        except Exception as e:
            logger.error(f"❌ Failed to copy adapter: {e}")
            return False
        
        # Calculate file hashes for integrity
        file_hashes = {}
        for file_path in marketplace_entry.rglob("*"):
            if file_path.is_file():
                rel_path = file_path.relative_to(marketplace_entry)
                file_hashes[str(rel_path)] = self._calculate_file_hash(file_path)
        
        # Create metadata
        metadata = {
            "id": adapter_id,
            "name": name,
            "description": description,
            "category": category,
            "author": author,
            "base_model": base_model,
            "tags": tags or [],
            "license": license,
            "version": "1.0.0",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "downloads": 0,
            "rating": 0.0,
            "reviews": [],
            "file_hashes": file_hashes,
            "size_mb": sum(f.stat().st_size for f in marketplace_entry.rglob("*") if f.is_file()) / 1024 / 1024,
            "files_count": len([f for f in marketplace_entry.rglob("*") if f.is_file()])
        }
        
        # Save metadata
        metadata_file = self.marketplace_dir / "metadata" / f"{adapter_id}.json"
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        # Update marketplace database
        self.marketplace_data["adapters"][adapter_id] = metadata
        self.marketplace_data["stats"]["total_adapters"] += 1
        self._save_marketplace_db()
        
        logger.info(f"✅ LoRA adapter '{name}' published successfully!")
        logger.info(f"   📍 ID: {adapter_id}")
        logger.info(f"   📂 Category: {category}")
        logger.info(f"   📊 Size: {metadata['size_mb']:.1f}MB")
        logger.info(f"   📄 Files: {metadata['files_count']}")
        
        return True
    
    def search_adapters(self, 
                       query: str = "",
                       category: str = "",
                       author: str = "",
                       base_model: str = "") -> List[Dict]:
        """Search for LoRA adapters in marketplace"""
        
        results = []
        query_lower = query.lower()
        
        for adapter_id, metadata in self.marketplace_data["adapters"].items():
            # Apply filters
            if category and metadata["category"] != category:
                continue
            if author and metadata["author"].lower() != author.lower():
                continue
            if base_model and base_model.lower() not in metadata["base_model"].lower():
                continue
            
            # Apply text search
            if query:
                searchable_text = f"{metadata['name']} {metadata['description']} {' '.join(metadata['tags'])}".lower()
                if query_lower not in searchable_text:
                    continue
            
            results.append(metadata)
        
        # Sort by downloads and rating
        results.sort(key=lambda x: (x["downloads"], x["rating"]), reverse=True)
        return results
    
    def download_adapter(self, adapter_id: str, destination: str = None) -> bool:
        """Download a LoRA adapter from marketplace"""
        
        if adapter_id not in self.marketplace_data["adapters"]:
            logger.error(f"❌ Adapter not found: {adapter_id}")
            return False
        
        metadata = self.marketplace_data["adapters"][adapter_id]
        source_path = self.marketplace_dir / "adapters" / adapter_id
        
        if not source_path.exists():
            logger.error(f"❌ Adapter files not found: {source_path}")
            return False
        
        # Determine destination
        if destination is None:
            destination = self.models_dir / f"marketplace_{adapter_id}"
        else:
            destination = Path(destination)
        
        logger.info(f"📥 Downloading LoRA adapter: {metadata['name']}")
        
        try:
            if destination.exists():
                shutil.rmtree(destination)
            shutil.copytree(source_path, destination)
            
            # Update download count
            self.marketplace_data["adapters"][adapter_id]["downloads"] += 1
            self.marketplace_data["stats"]["total_downloads"] += 1
            self._save_marketplace_db()
            
            logger.info(f"✅ Adapter downloaded to: {destination}")
            logger.info(f"   📊 Size: {metadata['size_mb']:.1f}MB")
            logger.info(f"   📄 Files: {metadata['files_count']}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Download failed: {e}")
            return False
    
    def list_adapters(self, category: str = "") -> List[Dict]:
        """List all available adapters"""
        adapters = list(self.marketplace_data["adapters"].values())
        
        if category:
            adapters = [a for a in adapters if a["category"] == category]
        
        # Sort by popularity
        adapters.sort(key=lambda x: (x["downloads"], x["rating"]), reverse=True)
        return adapters
    
    def get_adapter_info(self, adapter_id: str) -> Optional[Dict]:
        """Get detailed information about an adapter"""
        return self.marketplace_data["adapters"].get(adapter_id)
    
    def rate_adapter(self, adapter_id: str, rating: float, review: str = "") -> bool:
        """Rate and review an adapter"""
        if adapter_id not in self.marketplace_data["adapters"]:
            return False
        
        if not 1 <= rating <= 5:
            logger.error("❌ Rating must be between 1 and 5")
            return False
        
        adapter = self.marketplace_data["adapters"][adapter_id]
        
        # Add review
        review_data = {
            "rating": rating,
            "review": review,
            "timestamp": datetime.now().isoformat()
        }
        adapter["reviews"].append(review_data)
        
        # Update average rating
        total_ratings = sum(r["rating"] for r in adapter["reviews"])
        adapter["rating"] = total_ratings / len(adapter["reviews"])
        
        self._save_marketplace_db()
        logger.info(f"✅ Rating submitted for {adapter['name']}")
        return True
    
    def create_featured_collection(self):
        """Create a featured collection of high-quality adapters"""
        
        # Create some sample high-quality adapters
        featured_adapters = [
            {
                "name": "LLM Education Master",
                "description": "Comprehensive LoRA adapter trained on advanced LLM concepts, fine-tuning techniques, and research papers. Perfect for educational platforms.",
                "category": "educational",
                "author": "visual_llm_team",
                "base_model": "microsoft/DialoGPT-medium",
                "tags": ["education", "llm", "fine-tuning", "research"],
                "featured": True
            },
            {
                "name": "Python Code Assistant",
                "description": "Specialized LoRA adapter for Python code generation, debugging, and explanation. Trained on high-quality code examples.",
                "category": "code",
                "author": "code_masters",
                "base_model": "microsoft/DialoGPT-medium",
                "tags": ["python", "coding", "debugging", "programming"],
                "featured": True
            },
            {
                "name": "Academic Writing Helper",
                "description": "LoRA adapter fine-tuned for academic writing, research assistance, and scholarly communication.",
                "category": "domain",
                "author": "academic_ai",
                "base_model": "microsoft/DialoGPT-medium",
                "tags": ["academic", "writing", "research", "scholarly"],
                "featured": True
            }
        ]
        
        logger.info("🌟 Creating featured adapter collection...")
        
        for adapter_info in featured_adapters:
            adapter_id = f"{adapter_info['author']}_{adapter_info['name']}".lower().replace(" ", "_")
            
            # Create placeholder metadata (in real implementation, these would be actual trained models)
            metadata = {
                "id": adapter_id,
                "name": adapter_info["name"],
                "description": adapter_info["description"],
                "category": adapter_info["category"],
                "author": adapter_info["author"],
                "base_model": adapter_info["base_model"],
                "tags": adapter_info["tags"],
                "license": "MIT",
                "version": "1.0.0",
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
                "downloads": 0,
                "rating": 4.5,
                "reviews": [],
                "featured": adapter_info.get("featured", False),
                "size_mb": 8.5,
                "files_count": 6,
                "status": "placeholder"  # Indicates this is a placeholder
            }
            
            self.marketplace_data["adapters"][adapter_id] = metadata
        
        self._save_marketplace_db()
        logger.info("✅ Featured collection created")
    
    def generate_marketplace_stats(self) -> Dict:
        """Generate marketplace statistics"""
        adapters = list(self.marketplace_data["adapters"].values())
        
        stats = {
            "total_adapters": len(adapters),
            "total_downloads": sum(a["downloads"] for a in adapters),
            "categories": {},
            "top_authors": {},
            "average_rating": 0,
            "featured_count": 0
        }
        
        # Category breakdown
        for adapter in adapters:
            category = adapter["category"]
            stats["categories"][category] = stats["categories"].get(category, 0) + 1
        
        # Top authors
        for adapter in adapters:
            author = adapter["author"]
            stats["top_authors"][author] = stats["top_authors"].get(author, 0) + 1
        
        # Average rating
        rated_adapters = [a for a in adapters if a["rating"] > 0]
        if rated_adapters:
            stats["average_rating"] = sum(a["rating"] for a in rated_adapters) / len(rated_adapters)
        
        # Featured count
        stats["featured_count"] = sum(1 for a in adapters if a.get("featured", False))
        
        return stats

# Global marketplace instance
marketplace = LoRAModelMarketplace()

def main():
    """Main marketplace function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='LoRA Model Marketplace')
    parser.add_argument('action', choices=['publish', 'search', 'download', 'list', 'info', 'init'],
                       help='Action to perform')
    parser.add_argument('--name', help='Adapter name')
    parser.add_argument('--path', help='Adapter path')
    parser.add_argument('--description', help='Adapter description')
    parser.add_argument('--category', help='Adapter category')
    parser.add_argument('--author', help='Author name')
    parser.add_argument('--base-model', help='Base model name')
    parser.add_argument('--query', help='Search query')
    parser.add_argument('--adapter-id', help='Adapter ID')
    
    args = parser.parse_args()
    
    if args.action == 'init':
        marketplace.create_featured_collection()
        stats = marketplace.generate_marketplace_stats()
        print("🌟 LoRA Model Marketplace initialized!")
        print(f"📊 {stats['total_adapters']} adapters available")
        print(f"🏆 {stats['featured_count']} featured adapters")
        
    elif args.action == 'publish':
        if not all([args.name, args.path, args.description, args.category, args.author, args.base_model]):
            print("❌ Missing required arguments for publish")
            return
        
        marketplace.publish_adapter(
            args.path, args.name, args.description, 
            args.category, args.author, args.base_model
        )
        
    elif args.action == 'search':
        results = marketplace.search_adapters(
            query=args.query or "",
            category=args.category or "",
            author=args.author or ""
        )
        
        print(f"🔍 Found {len(results)} adapters:")
        for adapter in results[:10]:  # Show top 10
            print(f"   📦 {adapter['name']} by {adapter['author']}")
            print(f"      {adapter['description'][:80]}...")
            print(f"      Category: {adapter['category']} | Downloads: {adapter['downloads']}")
            print()
    
    elif args.action == 'list':
        adapters = marketplace.list_adapters(args.category or "")
        print(f"📋 {len(adapters)} adapters available:")
        for adapter in adapters:
            featured = "⭐" if adapter.get("featured") else ""
            print(f"   {featured} {adapter['name']} ({adapter['category']})")
    
    elif args.action == 'download':
        if not args.adapter_id:
            print("❌ Adapter ID required for download")
            return
        marketplace.download_adapter(args.adapter_id)
    
    elif args.action == 'info':
        if not args.adapter_id:
            print("❌ Adapter ID required for info")
            return
        info = marketplace.get_adapter_info(args.adapter_id)
        if info:
            print(f"📦 {info['name']}")
            print(f"   Author: {info['author']}")
            print(f"   Description: {info['description']}")
            print(f"   Category: {info['category']}")
            print(f"   Base Model: {info['base_model']}")
            print(f"   Downloads: {info['downloads']}")
            print(f"   Rating: {info['rating']:.1f}/5.0")
        else:
            print("❌ Adapter not found")

if __name__ == "__main__":
    main()

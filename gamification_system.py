#!/usr/bin/env python3
"""
GAMIFICATION SYSTEM FOR VISUAL LLM
Badges, achievements, leaderboards, and progress tracking
"""

import os
import json
import uuid
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class Achievement:
    """Represents an achievement/badge"""
    id: str
    name: str
    description: str
    icon: str
    category: str
    points: int
    requirements: Dict[str, Any]
    rarity: str  # common, rare, epic, legendary
    unlocked_by: List[str] = None  # List of user IDs who unlocked this

@dataclass
class UserProgress:
    """Tracks user progress and achievements"""
    user_id: str
    username: str
    level: int
    total_xp: int
    achievements_unlocked: List[str]
    badges_earned: List[str]
    stats: Dict[str, Any]
    created_at: str
    last_active: str

class GamificationManager:
    """Manages gamification features for the platform"""
    
    def __init__(self):
        self.gamification_dir = Path("gamification_data")
        self.achievements_file = self.gamification_dir / "achievements.json"
        self.users_file = self.gamification_dir / "user_progress.json"
        self.leaderboard_file = self.gamification_dir / "leaderboard.json"
        
        # Create directories
        self.gamification_dir.mkdir(exist_ok=True)
        
        # Load data
        self.achievements = self._load_achievements()
        self.user_progress = self._load_user_progress()
        
        # XP and level system
        self.xp_per_level = 1000
        self.max_level = 100
        
    def _load_achievements(self) -> Dict[str, Achievement]:
        """Load achievements from file or create defaults"""
        if self.achievements_file.exists():
            try:
                with open(self.achievements_file, 'r') as f:
                    data = json.load(f)
                    return {
                        aid: Achievement(**achievement_data)
                        for aid, achievement_data in data.items()
                    }
            except Exception as e:
                logger.warning(f"Failed to load achievements file: {e}")

        # Create default achievements
        default_achievements = self._create_default_achievements()
        # Set achievements before saving
        self.achievements = default_achievements
        self._save_achievements()
        return default_achievements
    
    def _create_default_achievements(self) -> Dict[str, Achievement]:
        """Create default achievement set"""
        achievements = {}
        
        # Learning Achievements
        learning_achievements = [
            {
                "id": "first_steps",
                "name": "First Steps",
                "description": "Complete your first tutorial",
                "icon": "👶",
                "category": "learning",
                "points": 100,
                "requirements": {"tutorials_completed": 1},
                "rarity": "common"
            },
            {
                "id": "knowledge_seeker",
                "name": "Knowledge Seeker",
                "description": "Complete 5 tutorials",
                "icon": "📚",
                "category": "learning",
                "points": 500,
                "requirements": {"tutorials_completed": 5},
                "rarity": "common"
            },
            {
                "id": "lora_master",
                "name": "LoRA Master",
                "description": "Complete all LoRA workshops",
                "icon": "🎯",
                "category": "learning",
                "points": 1000,
                "requirements": {"lora_workshops_completed": 3},
                "rarity": "rare"
            },
            {
                "id": "quiz_champion",
                "name": "Quiz Champion",
                "description": "Score 100% on 3 quizzes",
                "icon": "🏆",
                "category": "learning",
                "points": 750,
                "requirements": {"perfect_quizzes": 3},
                "rarity": "rare"
            }
        ]
        
        # Training Achievements
        training_achievements = [
            {
                "id": "first_model",
                "name": "Model Creator",
                "description": "Train your first LoRA model",
                "icon": "🤖",
                "category": "training",
                "points": 500,
                "requirements": {"models_trained": 1},
                "rarity": "common"
            },
            {
                "id": "model_trainer",
                "name": "Model Trainer",
                "description": "Train 5 LoRA models",
                "icon": "🏋️",
                "category": "training",
                "points": 1500,
                "requirements": {"models_trained": 5},
                "rarity": "rare"
            },
            {
                "id": "efficiency_expert",
                "name": "Efficiency Expert",
                "description": "Train a model with 90%+ efficiency score",
                "icon": "⚡",
                "category": "training",
                "points": 1000,
                "requirements": {"high_efficiency_models": 1},
                "rarity": "rare"
            },
            {
                "id": "speed_demon",
                "name": "Speed Demon",
                "description": "Complete training in under 10 minutes",
                "icon": "🚀",
                "category": "training",
                "points": 750,
                "requirements": {"fast_training_completed": 1},
                "rarity": "epic"
            }
        ]
        
        # Community Achievements
        community_achievements = [
            {
                "id": "helpful_member",
                "name": "Helpful Member",
                "description": "Share your first model in marketplace",
                "icon": "🤝",
                "category": "community",
                "points": 300,
                "requirements": {"models_shared": 1},
                "rarity": "common"
            },
            {
                "id": "community_contributor",
                "name": "Community Contributor",
                "description": "Share 3 models in marketplace",
                "icon": "🌟",
                "category": "community",
                "points": 1000,
                "requirements": {"models_shared": 3},
                "rarity": "rare"
            },
            {
                "id": "ai_assistant_user",
                "name": "AI Assistant User",
                "description": "Have 10 conversations with AI assistant",
                "icon": "💬",
                "category": "community",
                "points": 400,
                "requirements": {"ai_conversations": 10},
                "rarity": "common"
            }
        ]
        
        # Special Achievements
        special_achievements = [
            {
                "id": "early_adopter",
                "name": "Early Adopter",
                "description": "Join the platform in its first month",
                "icon": "🌅",
                "category": "special",
                "points": 2000,
                "requirements": {"joined_before": "2024-02-01"},
                "rarity": "legendary"
            },
            {
                "id": "perfectionist",
                "name": "Perfectionist",
                "description": "Complete all available content with 100% score",
                "icon": "💎",
                "category": "special",
                "points": 5000,
                "requirements": {"perfect_completion": True},
                "rarity": "legendary"
            },
            {
                "id": "innovator",
                "name": "Innovator",
                "description": "Create a model that gets 10+ downloads",
                "icon": "🔬",
                "category": "special",
                "points": 2500,
                "requirements": {"popular_model_downloads": 10},
                "rarity": "epic"
            }
        ]
        
        # Combine all achievements
        all_achievements = (
            learning_achievements + 
            training_achievements + 
            community_achievements + 
            special_achievements
        )
        
        for achievement_data in all_achievements:
            achievement = Achievement(**achievement_data, unlocked_by=[])
            achievements[achievement.id] = achievement
        
        return achievements
    
    def _save_achievements(self):
        """Save achievements to file"""
        try:
            data = {
                aid: asdict(achievement)
                for aid, achievement in self.achievements.items()
            }
            with open(self.achievements_file, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save achievements: {e}")
    
    def _load_user_progress(self) -> Dict[str, UserProgress]:
        """Load user progress from file"""
        if self.users_file.exists():
            with open(self.users_file, 'r') as f:
                data = json.load(f)
                return {
                    uid: UserProgress(**user_data)
                    for uid, user_data in data.items()
                }
        return {}
    
    def _save_user_progress(self):
        """Save user progress to file"""
        data = {
            uid: asdict(progress)
            for uid, progress in self.user_progress.items()
        }
        with open(self.users_file, 'w') as f:
            json.dump(data, f, indent=2)
    
    def get_or_create_user(self, user_id: str, username: str = None) -> UserProgress:
        """Get existing user or create new one"""
        if user_id not in self.user_progress:
            self.user_progress[user_id] = UserProgress(
                user_id=user_id,
                username=username or f"User_{user_id[:8]}",
                level=1,
                total_xp=0,
                achievements_unlocked=[],
                badges_earned=[],
                stats={
                    "tutorials_completed": 0,
                    "quizzes_completed": 0,
                    "perfect_quizzes": 0,
                    "models_trained": 0,
                    "models_shared": 0,
                    "ai_conversations": 0,
                    "login_streak": 0,
                    "total_time_spent": 0
                },
                created_at=datetime.now().isoformat(),
                last_active=datetime.now().isoformat()
            )
            self._save_user_progress()
        
        return self.user_progress[user_id]
    
    def award_xp(self, user_id: str, xp_amount: int, reason: str = "") -> Dict[str, Any]:
        """Award XP to user and check for level ups"""
        user = self.get_or_create_user(user_id)
        
        old_level = user.level
        user.total_xp += xp_amount
        
        # Calculate new level
        new_level = min(
            self.max_level,
            (user.total_xp // self.xp_per_level) + 1
        )
        
        level_up = new_level > old_level
        user.level = new_level
        user.last_active = datetime.now().isoformat()
        
        self._save_user_progress()
        
        result = {
            "xp_awarded": xp_amount,
            "total_xp": user.total_xp,
            "old_level": old_level,
            "new_level": new_level,
            "level_up": level_up,
            "reason": reason
        }
        
        if level_up:
            logger.info(f"🎉 User {user_id} leveled up to {new_level}!")
        
        return result
    
    def update_user_stat(self, user_id: str, stat_name: str, value: Any = None, increment: int = 1):
        """Update a user statistic"""
        user = self.get_or_create_user(user_id)
        
        if value is not None:
            user.stats[stat_name] = value
        else:
            user.stats[stat_name] = user.stats.get(stat_name, 0) + increment
        
        user.last_active = datetime.now().isoformat()
        self._save_user_progress()
        
        # Check for achievements
        self._check_achievements(user_id)
    
    def _check_achievements(self, user_id: str):
        """Check if user has unlocked any new achievements"""
        user = self.get_or_create_user(user_id)
        newly_unlocked = []
        
        for achievement_id, achievement in self.achievements.items():
            if achievement_id in user.achievements_unlocked:
                continue  # Already unlocked
            
            # Check requirements
            unlocked = True
            for req_key, req_value in achievement.requirements.items():
                if req_key in user.stats:
                    if user.stats[req_key] < req_value:
                        unlocked = False
                        break
                elif req_key == "joined_before":
                    join_date = datetime.fromisoformat(user.created_at).date()
                    required_date = datetime.fromisoformat(req_value).date()
                    if join_date >= required_date:
                        unlocked = False
                        break
                else:
                    unlocked = False
                    break
            
            if unlocked:
                user.achievements_unlocked.append(achievement_id)
                user.badges_earned.append(achievement.icon)
                achievement.unlocked_by.append(user_id)
                newly_unlocked.append(achievement)
                
                # Award XP for achievement
                self.award_xp(user_id, achievement.points, f"Achievement: {achievement.name}")
                
                logger.info(f"🏆 User {user_id} unlocked achievement: {achievement.name}")
        
        if newly_unlocked:
            self._save_user_progress()
            self._save_achievements()
        
        return newly_unlocked
    
    def get_user_achievements(self, user_id: str) -> Dict[str, Any]:
        """Get user's achievements and progress"""
        user = self.get_or_create_user(user_id)
        
        unlocked_achievements = [
            self.achievements[aid] for aid in user.achievements_unlocked
        ]
        
        # Calculate progress for locked achievements
        locked_achievements = []
        for achievement_id, achievement in self.achievements.items():
            if achievement_id not in user.achievements_unlocked:
                progress = self._calculate_achievement_progress(user, achievement)
                locked_achievements.append({
                    "achievement": achievement,
                    "progress": progress
                })
        
        return {
            "user": user,
            "unlocked_achievements": unlocked_achievements,
            "locked_achievements": locked_achievements,
            "total_achievements": len(self.achievements),
            "completion_percentage": len(user.achievements_unlocked) / len(self.achievements) * 100
        }
    
    def _calculate_achievement_progress(self, user: UserProgress, achievement: Achievement) -> float:
        """Calculate progress towards an achievement (0.0 to 1.0)"""
        total_progress = 0
        requirements_count = len(achievement.requirements)
        
        for req_key, req_value in achievement.requirements.items():
            if req_key in user.stats:
                current_value = user.stats[req_key]
                progress = min(1.0, current_value / req_value)
                total_progress += progress
            elif req_key == "joined_before":
                # Special case for date requirements
                join_date = datetime.fromisoformat(user.created_at).date()
                required_date = datetime.fromisoformat(req_value).date()
                total_progress += 1.0 if join_date < required_date else 0.0
            # Add more special cases as needed
        
        return total_progress / requirements_count if requirements_count > 0 else 0.0
    
    def get_leaderboard(self, category: str = "overall", limit: int = 10) -> List[Dict]:
        """Get leaderboard for specified category"""
        users = list(self.user_progress.values())
        
        if category == "overall":
            # Sort by total XP
            users.sort(key=lambda u: u.total_xp, reverse=True)
        elif category == "level":
            # Sort by level, then XP
            users.sort(key=lambda u: (u.level, u.total_xp), reverse=True)
        elif category == "achievements":
            # Sort by number of achievements
            users.sort(key=lambda u: len(u.achievements_unlocked), reverse=True)
        elif category == "models":
            # Sort by models trained
            users.sort(key=lambda u: u.stats.get("models_trained", 0), reverse=True)
        
        leaderboard = []
        for i, user in enumerate(users[:limit]):
            leaderboard.append({
                "rank": i + 1,
                "user_id": user.user_id,
                "username": user.username,
                "level": user.level,
                "total_xp": user.total_xp,
                "achievements_count": len(user.achievements_unlocked),
                "models_trained": user.stats.get("models_trained", 0),
                "last_active": user.last_active
            })
        
        return leaderboard
    
    def get_user_rank(self, user_id: str, category: str = "overall") -> Dict[str, Any]:
        """Get user's rank in specified category"""
        leaderboard = self.get_leaderboard(category, limit=1000)  # Get full leaderboard
        
        for entry in leaderboard:
            if entry["user_id"] == user_id:
                return {
                    "rank": entry["rank"],
                    "total_users": len(leaderboard),
                    "percentile": (1 - (entry["rank"] - 1) / len(leaderboard)) * 100
                }
        
        return {"rank": None, "total_users": len(leaderboard), "percentile": 0}

# Global gamification manager
gamification_manager = GamificationManager()

def get_gamification_manager():
    """Get the global gamification manager instance"""
    return gamification_manager

if __name__ == "__main__":
    # Test the gamification system
    print("🎮 Testing Gamification System")
    print("=" * 50)
    
    manager = GamificationManager()
    
    # Create test user
    user_id = "test_user_123"
    user = manager.get_or_create_user(user_id, "TestUser")
    
    print(f"👤 Created user: {user.username}")
    print(f"📊 Level: {user.level}, XP: {user.total_xp}")
    
    # Simulate some activities
    print("\n🎯 Simulating user activities...")
    
    # Complete tutorial
    manager.update_user_stat(user_id, "tutorials_completed")
    manager.award_xp(user_id, 100, "Completed tutorial")
    
    # Train model
    manager.update_user_stat(user_id, "models_trained")
    manager.award_xp(user_id, 500, "Trained first model")
    
    # Get achievements
    achievements_data = manager.get_user_achievements(user_id)
    print(f"\n🏆 Achievements unlocked: {len(achievements_data['unlocked_achievements'])}")
    for achievement in achievements_data['unlocked_achievements']:
        print(f"   {achievement.icon} {achievement.name}")
    
    # Get leaderboard
    leaderboard = manager.get_leaderboard("overall", 5)
    print(f"\n📊 Leaderboard:")
    for entry in leaderboard:
        print(f"   #{entry['rank']} {entry['username']} - Level {entry['level']} ({entry['total_xp']} XP)")
    
    print("\n🎉 Gamification system test completed!")

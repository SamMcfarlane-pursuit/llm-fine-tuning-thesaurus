#!/usr/bin/env python3
"""
GLOBAL EXPANSION SYSTEM FOR VISUAL LLM
Multi-language support, accessibility, and international features
"""

import os
import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GlobalExpansionManager:
    """Manages global expansion features"""
    
    def __init__(self):
        self.i18n_dir = Path("internationalization")
        self.languages_dir = self.i18n_dir / "languages"
        self.accessibility_dir = Path("accessibility")
        
        # Create directories
        for dir_path in [self.i18n_dir, self.languages_dir, self.accessibility_dir]:
            dir_path.mkdir(exist_ok=True)
        
        # Supported languages
        self.supported_languages = {
            "en": {
                "name": "English",
                "native_name": "English",
                "code": "en",
                "direction": "ltr",
                "flag": "🇺🇸",
                "completion": 100,
                "default": True
            },
            "es": {
                "name": "Spanish",
                "native_name": "Español",
                "code": "es",
                "direction": "ltr",
                "flag": "🇪🇸",
                "completion": 85,
                "default": False
            },
            "fr": {
                "name": "French",
                "native_name": "Français",
                "code": "fr",
                "direction": "ltr",
                "flag": "🇫🇷",
                "completion": 80,
                "default": False
            },
            "de": {
                "name": "German",
                "native_name": "Deutsch",
                "code": "de",
                "direction": "ltr",
                "flag": "🇩🇪",
                "completion": 75,
                "default": False
            },
            "zh": {
                "name": "Chinese",
                "native_name": "中文",
                "code": "zh",
                "direction": "ltr",
                "flag": "🇨🇳",
                "completion": 70,
                "default": False
            },
            "ja": {
                "name": "Japanese",
                "native_name": "日本語",
                "code": "ja",
                "direction": "ltr",
                "flag": "🇯🇵",
                "completion": 65,
                "default": False
            },
            "ko": {
                "name": "Korean",
                "native_name": "한국어",
                "code": "ko",
                "direction": "ltr",
                "flag": "🇰🇷",
                "completion": 60,
                "default": False
            },
            "pt": {
                "name": "Portuguese",
                "native_name": "Português",
                "code": "pt",
                "direction": "ltr",
                "flag": "🇧🇷",
                "completion": 70,
                "default": False
            },
            "ru": {
                "name": "Russian",
                "native_name": "Русский",
                "code": "ru",
                "direction": "ltr",
                "flag": "🇷🇺",
                "completion": 55,
                "default": False
            },
            "ar": {
                "name": "Arabic",
                "native_name": "العربية",
                "code": "ar",
                "direction": "rtl",
                "flag": "🇸🇦",
                "completion": 50,
                "default": False
            }
        }
        
        # Load translations
        self.translations = self._load_translations()
        
        # Accessibility features
        self.accessibility_features = {
            "screen_reader": True,
            "high_contrast": True,
            "large_text": True,
            "keyboard_navigation": True,
            "voice_commands": False,  # Phase 6B feature
            "reduced_motion": True,
            "focus_indicators": True,
            "alt_text": True
        }
    
    def _load_translations(self) -> Dict[str, Dict]:
        """Load all translation files"""
        translations = {}
        
        for lang_code in self.supported_languages.keys():
            lang_file = self.languages_dir / f"{lang_code}.json"
            
            if lang_file.exists():
                try:
                    with open(lang_file, 'r', encoding='utf-8') as f:
                        translations[lang_code] = json.load(f)
                except Exception as e:
                    logger.warning(f"Failed to load {lang_code} translations: {e}")
                    translations[lang_code] = {}
            else:
                # Create default translations
                translations[lang_code] = self._create_default_translations(lang_code)
                self._save_translation_file(lang_code, translations[lang_code])
        
        return translations
    
    def _create_default_translations(self, lang_code: str) -> Dict:
        """Create default translations for a language"""
        
        # Base English translations
        base_translations = {
            # Navigation
            "nav.home": "Home",
            "nav.learn": "Learn",
            "nav.workshops": "Workshops",
            "nav.tools": "Tools",
            "nav.about": "About",
            "nav.contact": "Contact",
            
            # Common UI
            "ui.loading": "Loading...",
            "ui.error": "Error",
            "ui.success": "Success",
            "ui.cancel": "Cancel",
            "ui.save": "Save",
            "ui.delete": "Delete",
            "ui.edit": "Edit",
            "ui.create": "Create",
            "ui.search": "Search",
            "ui.filter": "Filter",
            "ui.sort": "Sort",
            "ui.next": "Next",
            "ui.previous": "Previous",
            "ui.close": "Close",
            "ui.open": "Open",
            
            # LoRA specific
            "lora.title": "LoRA Fine-Tuning",
            "lora.description": "Learn parameter-efficient fine-tuning techniques",
            "lora.rank": "LoRA Rank",
            "lora.alpha": "LoRA Alpha",
            "lora.dropout": "LoRA Dropout",
            "lora.training": "Training LoRA Model",
            "lora.inference": "LoRA Inference",
            "lora.adapter": "LoRA Adapter",
            
            # Training
            "training.create_model": "Create New Model",
            "training.model_name": "Model Name",
            "training.dataset": "Training Dataset",
            "training.progress": "Training Progress",
            "training.completed": "Training Completed",
            "training.failed": "Training Failed",
            "training.pending": "Training Pending",
            "training.running": "Training Running",
            
            # Achievements
            "achievements.title": "Achievements",
            "achievements.unlocked": "Unlocked",
            "achievements.locked": "Locked",
            "achievements.progress": "Progress",
            "achievements.points": "Points",
            "achievements.level": "Level",
            "achievements.xp": "Experience Points",
            "achievements.rank": "Rank",
            "achievements.leaderboard": "Leaderboard",
            
            # AI Assistant
            "ai.assistant": "AI Assistant",
            "ai.chat": "Chat with AI",
            "ai.ask_question": "Ask a question...",
            "ai.thinking": "AI is thinking...",
            "ai.response": "AI Response",
            "ai.error": "AI Error",
            
            # Accessibility
            "a11y.skip_to_content": "Skip to main content",
            "a11y.menu": "Menu",
            "a11y.close_menu": "Close menu",
            "a11y.language_selector": "Language selector",
            "a11y.theme_toggle": "Toggle theme",
            "a11y.high_contrast": "High contrast mode",
            "a11y.large_text": "Large text mode",
            "a11y.screen_reader": "Screen reader mode",
            
            # Errors and messages
            "error.network": "Network error. Please check your connection.",
            "error.server": "Server error. Please try again later.",
            "error.validation": "Please check your input and try again.",
            "error.permission": "You don't have permission for this action.",
            "error.not_found": "The requested resource was not found.",
            
            "success.saved": "Successfully saved!",
            "success.created": "Successfully created!",
            "success.updated": "Successfully updated!",
            "success.deleted": "Successfully deleted!",
            
            # Welcome and onboarding
            "welcome.title": "Welcome to Visual LLM",
            "welcome.subtitle": "Learn LLM fine-tuning with hands-on experience",
            "welcome.get_started": "Get Started",
            "welcome.learn_more": "Learn More",
            
            # Features
            "features.lora_models": "Actual LoRA Models",
            "features.user_training": "Train Your Own Models",
            "features.achievements": "Achievements & Badges",
            "features.marketplace": "Model Marketplace",
            "features.ai_assistant": "AI Assistant",
            "features.workshops": "Interactive Workshops"
        }
        
        # Language-specific translations
        if lang_code == "es":
            return {
                "nav.home": "Inicio",
                "nav.learn": "Aprender",
                "nav.workshops": "Talleres",
                "nav.tools": "Herramientas",
                "nav.about": "Acerca de",
                "nav.contact": "Contacto",
                "ui.loading": "Cargando...",
                "ui.error": "Error",
                "ui.success": "Éxito",
                "ui.cancel": "Cancelar",
                "ui.save": "Guardar",
                "ui.delete": "Eliminar",
                "ui.edit": "Editar",
                "ui.create": "Crear",
                "ui.search": "Buscar",
                "lora.title": "Ajuste Fino LoRA",
                "lora.description": "Aprende técnicas de ajuste fino eficientes en parámetros",
                "training.create_model": "Crear Nuevo Modelo",
                "training.model_name": "Nombre del Modelo",
                "training.dataset": "Conjunto de Datos de Entrenamiento",
                "achievements.title": "Logros",
                "ai.assistant": "Asistente IA",
                "welcome.title": "Bienvenido a Visual LLM",
                "welcome.subtitle": "Aprende ajuste fino de LLM con experiencia práctica",
                **{k: v for k, v in base_translations.items() if k not in [
                    "nav.home", "nav.learn", "nav.workshops", "nav.tools", "nav.about", "nav.contact",
                    "ui.loading", "ui.error", "ui.success", "ui.cancel", "ui.save", "ui.delete",
                    "ui.edit", "ui.create", "ui.search", "lora.title", "lora.description",
                    "training.create_model", "training.model_name", "training.dataset",
                    "achievements.title", "ai.assistant", "welcome.title", "welcome.subtitle"
                ]}
            }
        elif lang_code == "fr":
            return {
                "nav.home": "Accueil",
                "nav.learn": "Apprendre",
                "nav.workshops": "Ateliers",
                "nav.tools": "Outils",
                "nav.about": "À propos",
                "nav.contact": "Contact",
                "ui.loading": "Chargement...",
                "ui.error": "Erreur",
                "ui.success": "Succès",
                "ui.cancel": "Annuler",
                "ui.save": "Enregistrer",
                "ui.delete": "Supprimer",
                "ui.edit": "Modifier",
                "ui.create": "Créer",
                "ui.search": "Rechercher",
                "lora.title": "Ajustement Fin LoRA",
                "lora.description": "Apprenez les techniques d'ajustement fin efficaces en paramètres",
                "training.create_model": "Créer un Nouveau Modèle",
                "training.model_name": "Nom du Modèle",
                "training.dataset": "Jeu de Données d'Entraînement",
                "achievements.title": "Réalisations",
                "ai.assistant": "Assistant IA",
                "welcome.title": "Bienvenue sur Visual LLM",
                "welcome.subtitle": "Apprenez l'ajustement fin des LLM avec une expérience pratique",
                **{k: v for k, v in base_translations.items() if k not in [
                    "nav.home", "nav.learn", "nav.workshops", "nav.tools", "nav.about", "nav.contact",
                    "ui.loading", "ui.error", "ui.success", "ui.cancel", "ui.save", "ui.delete",
                    "ui.edit", "ui.create", "ui.search", "lora.title", "lora.description",
                    "training.create_model", "training.model_name", "training.dataset",
                    "achievements.title", "ai.assistant", "welcome.title", "welcome.subtitle"
                ]}
            }
        elif lang_code == "zh":
            return {
                "nav.home": "首页",
                "nav.learn": "学习",
                "nav.workshops": "工作坊",
                "nav.tools": "工具",
                "nav.about": "关于",
                "nav.contact": "联系",
                "ui.loading": "加载中...",
                "ui.error": "错误",
                "ui.success": "成功",
                "ui.cancel": "取消",
                "ui.save": "保存",
                "ui.delete": "删除",
                "ui.edit": "编辑",
                "ui.create": "创建",
                "ui.search": "搜索",
                "lora.title": "LoRA微调",
                "lora.description": "学习参数高效的微调技术",
                "training.create_model": "创建新模型",
                "training.model_name": "模型名称",
                "training.dataset": "训练数据集",
                "achievements.title": "成就",
                "ai.assistant": "AI助手",
                "welcome.title": "欢迎来到Visual LLM",
                "welcome.subtitle": "通过实践经验学习LLM微调",
                **{k: v for k, v in base_translations.items() if k not in [
                    "nav.home", "nav.learn", "nav.workshops", "nav.tools", "nav.about", "nav.contact",
                    "ui.loading", "ui.error", "ui.success", "ui.cancel", "ui.save", "ui.delete",
                    "ui.edit", "ui.create", "ui.search", "lora.title", "lora.description",
                    "training.create_model", "training.model_name", "training.dataset",
                    "achievements.title", "ai.assistant", "welcome.title", "welcome.subtitle"
                ]}
            }
        else:
            return base_translations
    
    def _save_translation_file(self, lang_code: str, translations: Dict):
        """Save translation file"""
        lang_file = self.languages_dir / f"{lang_code}.json"
        try:
            with open(lang_file, 'w', encoding='utf-8') as f:
                json.dump(translations, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Failed to save {lang_code} translations: {e}")
    
    def get_translation(self, key: str, lang_code: str = "en", **kwargs) -> str:
        """Get translation for a key"""
        translations = self.translations.get(lang_code, self.translations.get("en", {}))
        
        # Get translation with fallback to English
        text = translations.get(key, self.translations.get("en", {}).get(key, key))
        
        # Format with kwargs if provided
        if kwargs:
            try:
                text = text.format(**kwargs)
            except (KeyError, ValueError):
                pass  # Return unformatted text if formatting fails
        
        return text
    
    def get_supported_languages(self) -> Dict:
        """Get list of supported languages"""
        return self.supported_languages
    
    def detect_user_language(self, accept_language_header: str = None) -> str:
        """Detect user's preferred language"""
        if not accept_language_header:
            return "en"
        
        # Parse Accept-Language header
        languages = []
        for lang_range in accept_language_header.split(','):
            lang_range = lang_range.strip()
            if ';' in lang_range:
                lang, quality = lang_range.split(';', 1)
                try:
                    quality = float(quality.split('=')[1])
                except (ValueError, IndexError):
                    quality = 1.0
            else:
                lang, quality = lang_range, 1.0
            
            lang = lang.strip().lower()
            if '-' in lang:
                lang = lang.split('-')[0]  # Take primary language code
            
            languages.append((lang, quality))
        
        # Sort by quality
        languages.sort(key=lambda x: x[1], reverse=True)
        
        # Find best match
        for lang, _ in languages:
            if lang in self.supported_languages:
                return lang
        
        return "en"  # Default fallback
    
    def create_accessibility_config(self) -> Dict:
        """Create accessibility configuration"""
        return {
            "features": self.accessibility_features,
            "wcag_compliance": "AA",
            "screen_reader_support": [
                "NVDA", "JAWS", "VoiceOver", "TalkBack"
            ],
            "keyboard_shortcuts": {
                "skip_to_content": "Alt+1",
                "main_navigation": "Alt+2",
                "search": "Alt+3",
                "ai_assistant": "Alt+4",
                "achievements": "Alt+5",
                "user_training": "Alt+6"
            },
            "color_contrast": {
                "normal": "4.5:1",
                "large_text": "3:1",
                "high_contrast": "7:1"
            },
            "font_sizes": {
                "small": "14px",
                "normal": "16px",
                "large": "20px",
                "extra_large": "24px"
            }
        }
    
    def create_mobile_pwa_config(self) -> Dict:
        """Create Progressive Web App configuration"""
        return {
            "name": "Visual LLM - Learn AI Fine-Tuning",
            "short_name": "Visual LLM",
            "description": "Learn LLM fine-tuning with hands-on LoRA models and interactive workshops",
            "start_url": "/",
            "display": "standalone",
            "orientation": "portrait-primary",
            "theme_color": "#3c6430",
            "background_color": "#eef5eb",
            "categories": ["education", "artificial-intelligence", "machine-learning"],
            "icons": [
                {
                    "src": "/static/icons/icon-72x72.png",
                    "sizes": "72x72",
                    "type": "image/png"
                },
                {
                    "src": "/static/icons/icon-96x96.png",
                    "sizes": "96x96",
                    "type": "image/png"
                },
                {
                    "src": "/static/icons/icon-128x128.png",
                    "sizes": "128x128",
                    "type": "image/png"
                },
                {
                    "src": "/static/icons/icon-144x144.png",
                    "sizes": "144x144",
                    "type": "image/png"
                },
                {
                    "src": "/static/icons/icon-152x152.png",
                    "sizes": "152x152",
                    "type": "image/png"
                },
                {
                    "src": "/static/icons/icon-192x192.png",
                    "sizes": "192x192",
                    "type": "image/png"
                },
                {
                    "src": "/static/icons/icon-384x384.png",
                    "sizes": "384x384",
                    "type": "image/png"
                },
                {
                    "src": "/static/icons/icon-512x512.png",
                    "sizes": "512x512",
                    "type": "image/png"
                }
            ],
            "screenshots": [
                {
                    "src": "/static/screenshots/desktop-home.png",
                    "sizes": "1280x720",
                    "type": "image/png",
                    "form_factor": "wide"
                },
                {
                    "src": "/static/screenshots/mobile-home.png",
                    "sizes": "390x844",
                    "type": "image/png",
                    "form_factor": "narrow"
                }
            ],
            "features": [
                "offline_support",
                "push_notifications",
                "background_sync",
                "install_prompt"
            ]
        }
    
    def get_regional_settings(self, country_code: str = None) -> Dict:
        """Get regional settings for localization"""
        regional_settings = {
            "US": {
                "currency": "USD",
                "date_format": "MM/DD/YYYY",
                "time_format": "12h",
                "number_format": "1,234.56",
                "timezone": "America/New_York"
            },
            "GB": {
                "currency": "GBP",
                "date_format": "DD/MM/YYYY",
                "time_format": "24h",
                "number_format": "1,234.56",
                "timezone": "Europe/London"
            },
            "DE": {
                "currency": "EUR",
                "date_format": "DD.MM.YYYY",
                "time_format": "24h",
                "number_format": "1.234,56",
                "timezone": "Europe/Berlin"
            },
            "FR": {
                "currency": "EUR",
                "date_format": "DD/MM/YYYY",
                "time_format": "24h",
                "number_format": "1 234,56",
                "timezone": "Europe/Paris"
            },
            "CN": {
                "currency": "CNY",
                "date_format": "YYYY/MM/DD",
                "time_format": "24h",
                "number_format": "1,234.56",
                "timezone": "Asia/Shanghai"
            },
            "JP": {
                "currency": "JPY",
                "date_format": "YYYY/MM/DD",
                "time_format": "24h",
                "number_format": "1,234",
                "timezone": "Asia/Tokyo"
            }
        }
        
        return regional_settings.get(country_code, regional_settings["US"])

# Global expansion manager instance
global_expansion_manager = GlobalExpansionManager()

def get_global_expansion_manager():
    """Get the global expansion manager instance"""
    return global_expansion_manager

if __name__ == "__main__":
    # Test the global expansion system
    print("🌍 Testing Global Expansion System")
    print("=" * 50)
    
    manager = GlobalExpansionManager()
    
    # Test language support
    languages = manager.get_supported_languages()
    print(f"🌐 Supported languages: {len(languages)}")
    for code, info in languages.items():
        completion = info['completion']
        status = "✅" if completion >= 80 else "🔄" if completion >= 50 else "⚠️"
        print(f"   {status} {info['flag']} {info['native_name']} ({completion}%)")
    
    # Test translations
    print(f"\n🔤 Translation examples:")
    test_keys = ["nav.home", "lora.title", "achievements.title", "welcome.title"]
    for key in test_keys:
        en_text = manager.get_translation(key, "en")
        es_text = manager.get_translation(key, "es")
        zh_text = manager.get_translation(key, "zh")
        print(f"   {key}:")
        print(f"     EN: {en_text}")
        print(f"     ES: {es_text}")
        print(f"     ZH: {zh_text}")
    
    # Test accessibility
    a11y_config = manager.create_accessibility_config()
    print(f"\n♿ Accessibility features: {len(a11y_config['features'])}")
    for feature, enabled in a11y_config['features'].items():
        status = "✅" if enabled else "⚠️"
        print(f"   {status} {feature}")
    
    # Test PWA config
    pwa_config = manager.create_mobile_pwa_config()
    print(f"\n📱 PWA configuration:")
    print(f"   Name: {pwa_config['name']}")
    print(f"   Icons: {len(pwa_config['icons'])}")
    print(f"   Features: {len(pwa_config['features'])}")
    
    print("\n🎉 Global expansion system test completed!")

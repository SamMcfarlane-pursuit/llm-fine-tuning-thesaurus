#!/usr/bin/env python3
"""
Comprehensive Data Validation Framework for Thesaurus AI LLM
Provides input sanitization, type checking, and authenticity verification.
"""

import re
import html
import json
import hashlib
import secrets
from typing import Any, Dict, List, Optional, Union, Callable, Type
from functools import wraps
from datetime import datetime, timezone
from flask import request, jsonify, g
import logging
from dataclasses import dataclass
from enum import Enum
import bleach
from urllib.parse import urlparse
import ipaddress

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ValidationError(Exception):
    """Custom exception for validation errors."""
    def __init__(self, message: str, field: str = None, code: str = None):
        self.message = message
        self.field = field
        self.code = code
        super().__init__(message)

class DataType(Enum):
    """Supported data types for validation."""
    STRING = "string"
    INTEGER = "integer"
    FLOAT = "float"
    BOOLEAN = "boolean"
    EMAIL = "email"
    URL = "url"
    UUID = "uuid"
    DATE = "date"
    DATETIME = "datetime"
    JSON = "json"
    LIST = "list"
    DICT = "dict"
    IP_ADDRESS = "ip_address"
    PHONE = "phone"
    PASSWORD = "password"
    USERNAME = "username"
    HTML = "html"
    SQL = "sql"

@dataclass
class ValidationRule:
    """Represents a validation rule for a field."""
    field_name: str
    data_type: DataType
    required: bool = True
    min_length: Optional[int] = None
    max_length: Optional[int] = None
    min_value: Optional[Union[int, float]] = None
    max_value: Optional[Union[int, float]] = None
    pattern: Optional[str] = None
    allowed_values: Optional[List[Any]] = None
    custom_validator: Optional[Callable] = None
    sanitize: bool = True
    description: str = ""

class SecurityValidator:
    """
    Security-focused validation to prevent common attacks.
    """
    
    # Common attack patterns
    SQL_INJECTION_PATTERNS = [
        r"('|(\-\-)|(;)|(\||\|)|(\*|\*))",
        r"(union|select|insert|delete|update|drop|create|alter|exec|execute)",
        r"(script|javascript|vbscript|onload|onerror|onclick)"
    ]
    
    XSS_PATTERNS = [
        r"<script[^>]*>.*?</script>",
        r"javascript:",
        r"on\w+\s*=",
        r"<iframe[^>]*>.*?</iframe>",
        r"<object[^>]*>.*?</object>",
        r"<embed[^>]*>.*?</embed>"
    ]
    
    COMMAND_INJECTION_PATTERNS = [
        r"[;&|`$(){}\[\]]",
        r"(rm|cat|ls|ps|kill|chmod|chown|sudo|su)",
        r"(\.\./|\.\.\\)"
    ]
    
    @staticmethod
    def check_sql_injection(value: str) -> bool:
        """Check for SQL injection patterns."""
        if not isinstance(value, str):
            return False
        
        value_lower = value.lower()
        for pattern in SecurityValidator.SQL_INJECTION_PATTERNS:
            if re.search(pattern, value_lower, re.IGNORECASE):
                return True
        return False
    
    @staticmethod
    def check_xss(value: str) -> bool:
        """Check for XSS patterns."""
        if not isinstance(value, str):
            return False
        
        for pattern in SecurityValidator.XSS_PATTERNS:
            if re.search(pattern, value, re.IGNORECASE):
                return True
        return False
    
    @staticmethod
    def check_command_injection(value: str) -> bool:
        """Check for command injection patterns."""
        if not isinstance(value, str):
            return False
        
        for pattern in SecurityValidator.COMMAND_INJECTION_PATTERNS:
            if re.search(pattern, value, re.IGNORECASE):
                return True
        return False
    
    @staticmethod
    def sanitize_html(value: str, allowed_tags: List[str] = None) -> str:
        """Sanitize HTML content."""
        if not isinstance(value, str):
            return str(value)
        
        if allowed_tags is None:
            allowed_tags = ['b', 'i', 'u', 'em', 'strong', 'p', 'br']
        
        return bleach.clean(value, tags=allowed_tags, strip=True)
    
    @staticmethod
    def sanitize_string(value: str) -> str:
        """Basic string sanitization."""
        if not isinstance(value, str):
            return str(value)
        
        # Remove null bytes
        value = value.replace('\x00', '')
        
        # HTML escape
        value = html.escape(value)
        
        # Remove control characters except newline and tab
        value = ''.join(char for char in value if ord(char) >= 32 or char in '\n\t')
        
        return value.strip()

class DataValidator:
    """
    Main data validation class with comprehensive validation rules.
    """
    
    def __init__(self):
        self.security_validator = SecurityValidator()
        self.validation_cache = {}
        
        # Compile regex patterns for better performance
        self.email_pattern = re.compile(
            r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        )
        self.uuid_pattern = re.compile(
            r'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
            re.IGNORECASE
        )
        self.username_pattern = re.compile(r'^[a-zA-Z0-9_-]{3,30}$')
        self.phone_pattern = re.compile(r'^\+?[1-9]\d{1,14}$')
    
    def validate_type(self, value: Any, data_type: DataType) -> Any:
        """Validate and convert value to specified type."""
        if value is None:
            return None
        
        try:
            if data_type == DataType.STRING:
                return str(value)
            
            elif data_type == DataType.INTEGER:
                if isinstance(value, bool):
                    raise ValidationError("Boolean cannot be converted to integer")
                return int(value)
            
            elif data_type == DataType.FLOAT:
                if isinstance(value, bool):
                    raise ValidationError("Boolean cannot be converted to float")
                return float(value)
            
            elif data_type == DataType.BOOLEAN:
                if isinstance(value, str):
                    return value.lower() in ('true', '1', 'yes', 'on')
                return bool(value)
            
            elif data_type == DataType.EMAIL:
                email = str(value).strip().lower()
                if not self.email_pattern.match(email):
                    raise ValidationError("Invalid email format")
                return email
            
            elif data_type == DataType.URL:
                url = str(value).strip()
                parsed = urlparse(url)
                if not parsed.scheme or not parsed.netloc:
                    raise ValidationError("Invalid URL format")
                return url
            
            elif data_type == DataType.UUID:
                uuid_str = str(value).strip()
                if not self.uuid_pattern.match(uuid_str):
                    raise ValidationError("Invalid UUID format")
                return uuid_str
            
            elif data_type == DataType.DATE:
                if isinstance(value, str):
                    return datetime.fromisoformat(value).date()
                return value
            
            elif data_type == DataType.DATETIME:
                if isinstance(value, str):
                    return datetime.fromisoformat(value)
                return value
            
            elif data_type == DataType.JSON:
                if isinstance(value, str):
                    return json.loads(value)
                return value
            
            elif data_type == DataType.LIST:
                if isinstance(value, str):
                    return json.loads(value) if value.startswith('[') else [value]
                return list(value) if not isinstance(value, list) else value
            
            elif data_type == DataType.DICT:
                if isinstance(value, str):
                    return json.loads(value)
                return dict(value) if not isinstance(value, dict) else value
            
            elif data_type == DataType.IP_ADDRESS:
                ip_str = str(value).strip()
                ipaddress.ip_address(ip_str)  # Validates IP
                return ip_str
            
            elif data_type == DataType.PHONE:
                phone = re.sub(r'[^+\d]', '', str(value))
                if not self.phone_pattern.match(phone):
                    raise ValidationError("Invalid phone number format")
                return phone
            
            elif data_type == DataType.USERNAME:
                username = str(value).strip()
                if not self.username_pattern.match(username):
                    raise ValidationError("Invalid username format")
                return username
            
            elif data_type == DataType.PASSWORD:
                password = str(value)
                if len(password) < 8:
                    raise ValidationError("Password must be at least 8 characters")
                if not re.search(r'[A-Z]', password):
                    raise ValidationError("Password must contain uppercase letter")
                if not re.search(r'[a-z]', password):
                    raise ValidationError("Password must contain lowercase letter")
                if not re.search(r'\d', password):
                    raise ValidationError("Password must contain digit")
                return password
            
            elif data_type == DataType.HTML:
                return self.security_validator.sanitize_html(str(value))
            
            elif data_type == DataType.SQL:
                sql_str = str(value)
                if self.security_validator.check_sql_injection(sql_str):
                    raise ValidationError("Potential SQL injection detected")
                return sql_str
            
            else:
                return value
                
        except (ValueError, TypeError, json.JSONDecodeError) as e:
            raise ValidationError(f"Type conversion error: {str(e)}")
    
    def validate_field(self, value: Any, rule: ValidationRule) -> Any:
        """Validate a single field according to its rule."""
        field_name = rule.field_name
        
        # Check if required
        if value is None or (isinstance(value, str) and not value.strip()):
            if rule.required:
                raise ValidationError(f"Field '{field_name}' is required", field_name, "required")
            return None
        
        # Security checks
        if isinstance(value, str):
            if self.security_validator.check_sql_injection(value):
                raise ValidationError(f"Potential SQL injection in '{field_name}'", field_name, "security")
            
            if self.security_validator.check_xss(value):
                raise ValidationError(f"Potential XSS attack in '{field_name}'", field_name, "security")
            
            if self.security_validator.check_command_injection(value):
                raise ValidationError(f"Potential command injection in '{field_name}'", field_name, "security")
        
        # Type validation and conversion
        try:
            validated_value = self.validate_type(value, rule.data_type)
        except ValidationError as e:
            e.field = field_name
            e.code = "type_error"
            raise e
        
        # Length validation for strings
        if isinstance(validated_value, str):
            if rule.min_length is not None and len(validated_value) < rule.min_length:
                raise ValidationError(
                    f"Field '{field_name}' must be at least {rule.min_length} characters",
                    field_name, "min_length"
                )
            
            if rule.max_length is not None and len(validated_value) > rule.max_length:
                raise ValidationError(
                    f"Field '{field_name}' must be at most {rule.max_length} characters",
                    field_name, "max_length"
                )
        
        # Value range validation for numbers
        if isinstance(validated_value, (int, float)):
            if rule.min_value is not None and validated_value < rule.min_value:
                raise ValidationError(
                    f"Field '{field_name}' must be at least {rule.min_value}",
                    field_name, "min_value"
                )
            
            if rule.max_value is not None and validated_value > rule.max_value:
                raise ValidationError(
                    f"Field '{field_name}' must be at most {rule.max_value}",
                    field_name, "max_value"
                )
        
        # Pattern validation
        if rule.pattern and isinstance(validated_value, str):
            if not re.match(rule.pattern, validated_value):
                raise ValidationError(
                    f"Field '{field_name}' does not match required pattern",
                    field_name, "pattern"
                )
        
        # Allowed values validation
        if rule.allowed_values is not None:
            if validated_value not in rule.allowed_values:
                raise ValidationError(
                    f"Field '{field_name}' must be one of: {rule.allowed_values}",
                    field_name, "allowed_values"
                )
        
        # Custom validation
        if rule.custom_validator:
            try:
                custom_result = rule.custom_validator(validated_value)
                if custom_result is not True:
                    error_msg = custom_result if isinstance(custom_result, str) else f"Custom validation failed for '{field_name}'"
                    raise ValidationError(error_msg, field_name, "custom")
            except Exception as e:
                raise ValidationError(f"Custom validation error for '{field_name}': {str(e)}", field_name, "custom")
        
        # Sanitization
        if rule.sanitize and isinstance(validated_value, str):
            validated_value = self.security_validator.sanitize_string(validated_value)
        
        return validated_value
    
    def validate_data(self, data: Dict[str, Any], rules: List[ValidationRule]) -> Dict[str, Any]:
        """Validate a dictionary of data against a list of rules."""
        validated_data = {}
        errors = []
        
        # Create rule lookup
        rule_map = {rule.field_name: rule for rule in rules}
        
        # Validate each field
        for field_name, rule in rule_map.items():
            try:
                value = data.get(field_name)
                validated_value = self.validate_field(value, rule)
                if validated_value is not None:
                    validated_data[field_name] = validated_value
            except ValidationError as e:
                errors.append({
                    'field': e.field,
                    'message': e.message,
                    'code': e.code
                })
        
        # Check for unexpected fields
        expected_fields = set(rule_map.keys())
        provided_fields = set(data.keys())
        unexpected_fields = provided_fields - expected_fields
        
        if unexpected_fields:
            for field in unexpected_fields:
                errors.append({
                    'field': field,
                    'message': f"Unexpected field '{field}'",
                    'code': 'unexpected_field'
                })
        
        if errors:
            raise ValidationError("Validation failed", errors=errors)
        
        return validated_data

def validate_request(rules: List[ValidationRule], source: str = 'json'):
    """
    Decorator for validating Flask request data.
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            validator = DataValidator()
            
            try:
                # Get data from request
                if source == 'json':
                    data = request.get_json() or {}
                elif source == 'form':
                    data = request.form.to_dict()
                elif source == 'args':
                    data = request.args.to_dict()
                else:
                    data = {**request.args.to_dict(), **request.form.to_dict()}
                    if request.is_json:
                        data.update(request.get_json() or {})
                
                # Validate data
                validated_data = validator.validate_data(data, rules)
                
                # Add validated data to Flask g object
                g.validated_data = validated_data
                
                return f(*args, **kwargs)
                
            except ValidationError as e:
                if hasattr(e, 'errors'):
                    return jsonify({
                        'error': 'Validation failed',
                        'details': e.errors
                    }), 400
                else:
                    return jsonify({
                        'error': 'Validation failed',
                        'message': e.message,
                        'field': e.field,
                        'code': e.code
                    }), 400
            
            except Exception as e:
                logger.error(f"Validation decorator error: {str(e)}")
                return jsonify({
                    'error': 'Internal validation error'
                }), 500
        
        return decorated_function
    return decorator

def create_validation_rule(field_name: str, data_type: str, **kwargs) -> ValidationRule:
    """Helper function to create validation rules."""
    try:
        dt = DataType(data_type)
    except ValueError:
        raise ValueError(f"Invalid data type: {data_type}")
    
    return ValidationRule(field_name=field_name, data_type=dt, **kwargs)

# Common validation rule sets
USER_REGISTRATION_RULES = [
    ValidationRule('username', DataType.USERNAME, min_length=3, max_length=30),
    ValidationRule('email', DataType.EMAIL),
    ValidationRule('password', DataType.PASSWORD),
    ValidationRule('first_name', DataType.STRING, min_length=1, max_length=50, required=False),
    ValidationRule('last_name', DataType.STRING, min_length=1, max_length=50, required=False),
]

USER_LOGIN_RULES = [
    ValidationRule('username', DataType.STRING, min_length=1, max_length=100),
    ValidationRule('password', DataType.STRING, min_length=1),
    ValidationRule('remember_me', DataType.BOOLEAN, required=False),
]

THESAURUS_QUERY_RULES = [
    ValidationRule('word', DataType.STRING, min_length=1, max_length=100, pattern=r'^[a-zA-Z\s-]+$'),
    ValidationRule('limit', DataType.INTEGER, min_value=1, max_value=100, required=False),
    ValidationRule('include_definitions', DataType.BOOLEAN, required=False),
]

AI_CHAT_RULES = [
    ValidationRule('message', DataType.STRING, min_length=1, max_length=2000),
    ValidationRule('model', DataType.STRING, allowed_values=['general', 'educational', 'code', 'fast'], required=False),
    ValidationRule('context', DataType.STRING, max_length=5000, required=False),
]

# Export key components
__all__ = [
    'DataValidator',
    'SecurityValidator',
    'ValidationRule',
    'ValidationError',
    'DataType',
    'validate_request',
    'create_validation_rule',
    'USER_REGISTRATION_RULES',
    'USER_LOGIN_RULES',
    'THESAURUS_QUERY_RULES',
    'AI_CHAT_RULES'
]
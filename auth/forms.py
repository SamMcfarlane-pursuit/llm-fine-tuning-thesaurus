"""
Authentication forms.
"""

from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField, HiddenField
from wtforms.validators import DataRequired, Email, EqualTo, Length, ValidationError
from flask_login import current_user
import re

from models import User
from secure_auth_system import SecurePasswordManager, InputSanitizer

class LoginForm(FlaskForm):
    """Login form with MFA support."""

    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    totp_token = StringField('Authentication Code (if enabled)', validators=[Length(min=0, max=6)])
    remember_me = BooleanField('Remember Me')
    submit = SubmitField('Sign In')
    
    def validate_email(self, email):
        """Validate email format."""
        sanitizer = InputSanitizer()
        if not sanitizer.validate_email(email.data):
            raise ValidationError('Invalid email format.')


class RegistrationForm(FlaskForm):
    """Registration form with enhanced security validation."""

    username = StringField('Username', validators=[DataRequired(), Length(min=3, max=64)])
    name = StringField('Full Name', validators=[DataRequired(), Length(min=2, max=64)])
    email = StringField('Email', validators=[DataRequired(), Email(), Length(max=120)])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=8, max=128)])
    password2 = PasswordField(
        'Confirm Password',
        validators=[DataRequired(), EqualTo('password', message='Passwords must match.')]
    )
    submit = SubmitField('Register')

    def validate_username(self, username):
        """Validate username format and uniqueness."""
        sanitizer = InputSanitizer()
        if not sanitizer.validate_username(username.data):
            raise ValidationError('Username must be 3-64 characters and contain only letters, numbers, underscore, and hyphen.')
        
        user = User.query.filter_by(username=username.data).first()
        if user is not None:
            raise ValidationError('Please use a different username.')

    def validate_email(self, email):
        """Validate email format and uniqueness."""
        sanitizer = InputSanitizer()
        if not sanitizer.validate_email(email.data):
            raise ValidationError('Invalid email format.')
        
        user = User.query.filter_by(email=email.data).first()
        if user is not None:
            raise ValidationError('Please use a different email address.')
    
    def validate_password(self, password):
        """Validate password strength."""
        password_manager = SecurePasswordManager()
        is_strong, issues = password_manager.is_password_strong(password.data)
        if not is_strong:
            raise ValidationError('Password requirements: ' + '; '.join(issues))


class ProfileForm(FlaskForm):
    """Profile form."""

    username = StringField('Username', validators=[DataRequired(), Length(min=3, max=64)])
    name = StringField('Full Name', validators=[DataRequired(), Length(min=2, max=64)])
    password = PasswordField('New Password', validators=[Length(min=0, max=128)])
    password2 = PasswordField(
        'Confirm New Password',
        validators=[EqualTo('password', message='Passwords must match.')]
    )
    submit = SubmitField('Update Profile')

    def validate_username(self, username):
        """Validate username is unique."""
        if username.data != current_user.username:
            user = User.query.filter_by(username=username.data).first()
            if user is not None:
                raise ValidationError('Please use a different username.')


class GuestConversionForm(FlaskForm):
    """Form for converting guest account to registered user."""

    username = StringField('Username', validators=[DataRequired(), Length(min=3, max=64)])
    email = StringField('Email', validators=[DataRequired(), Email(), Length(max=120)])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=8)])
    password2 = PasswordField(
        'Confirm Password',
        validators=[DataRequired(), EqualTo('password', message='Passwords must match.')]
    )
    submit = SubmitField('Create Account & Save Progress')

    def validate_username(self, username):
        """Validate username is unique."""
        user = User.query.filter_by(username=username.data).first()
        if user is not None:
            raise ValidationError('Please use a different username.')

    def validate_email(self, email):
        """Validate email is unique."""
        user = User.query.filter_by(email=email.data).first()
        if user is not None:
            raise ValidationError('Please use a different email address.')


class MFASetupForm(FlaskForm):
    """Form for setting up multi-factor authentication."""
    
    totp_token = StringField('Enter 6-digit code from your authenticator app', 
                           validators=[DataRequired(), Length(min=6, max=6)])
    submit = SubmitField('Enable MFA')
    
    def validate_totp_token(self, totp_token):
        """Validate TOTP token format."""
        if not totp_token.data.isdigit():
            raise ValidationError('Authentication code must be 6 digits.')


class MFAVerifyForm(FlaskForm):
    """Form for verifying MFA during login."""
    
    totp_token = StringField('Enter 6-digit authentication code', 
                           validators=[DataRequired(), Length(min=6, max=6)])
    use_backup_code = BooleanField('Use backup code instead')
    backup_code = StringField('Backup code', validators=[Length(min=0, max=8)])
    submit = SubmitField('Verify')
    
    def validate_totp_token(self, totp_token):
        """Validate TOTP token format."""
        if not self.use_backup_code.data and totp_token.data and not totp_token.data.isdigit():
            raise ValidationError('Authentication code must be 6 digits.')
    
    def validate_backup_code(self, backup_code):
        """Validate backup code format."""
        if self.use_backup_code.data and not backup_code.data:
            raise ValidationError('Backup code is required when selected.')


class PasswordResetRequestForm(FlaskForm):
    """Form for requesting password reset."""
    
    email = StringField('Email', validators=[DataRequired(), Email()])
    submit = SubmitField('Request Password Reset')
    
    def validate_email(self, email):
        """Validate email format."""
        sanitizer = InputSanitizer()
        if not sanitizer.validate_email(email.data):
            raise ValidationError('Invalid email format.')


class PasswordResetForm(FlaskForm):
    """Form for resetting password with token."""
    
    password = PasswordField('New Password', validators=[DataRequired(), Length(min=8, max=128)])
    password2 = PasswordField(
        'Confirm New Password',
        validators=[DataRequired(), EqualTo('password', message='Passwords must match.')]
    )
    submit = SubmitField('Reset Password')
    
    def validate_password(self, password):
        """Validate password strength."""
        password_manager = SecurePasswordManager()
        is_strong, issues = password_manager.is_password_strong(password.data)
        if not is_strong:
            raise ValidationError('Password requirements: ' + '; '.join(issues))

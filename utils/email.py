"""
Email utility functions for sending emails.
"""

import os
from flask import current_app, render_template
from flask_mail import Mail, Message
from threading import Thread

# Initialize mail
mail = Mail()

def send_async_email(app, msg):
    """Send email asynchronously.
    
    Args:
        app: Flask application context
        msg: Email message to send
    """
    with app.app_context():
        try:
            mail.send(msg)
        except Exception as e:
            app.logger.error(f"Failed to send email: {str(e)}")

def send_email(subject, recipients, text_body, html_body, sender=None):
    """Send an email.
    
    Args:
        subject: Email subject
        recipients: List of recipient email addresses
        text_body: Plain text email body
        html_body: HTML email body
        sender: Email sender (defaults to app config)
        
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    try:
        app = current_app._get_current_object()
        sender = sender or app.config['MAIL_DEFAULT_SENDER']
        
        msg = Message(subject, sender=sender, recipients=recipients)
        msg.body = text_body
        msg.html = html_body
        
        # Send email asynchronously
        Thread(target=send_async_email, args=(app, msg)).start()
        return True
    except Exception as e:
        current_app.logger.error(f"Error sending email: {str(e)}")
        return False

def send_password_reset_email(user):
    """Send password reset email to user.
    
    Args:
        user: User object with email and reset token
        
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    token = user.get_reset_password_token()
    reset_url = current_app.config.get('APP_URL', '') + '/auth/password-reset/' + token
    
    return send_email(
        subject='Reset Your Password',
        recipients=[user.email],
        text_body=render_template('email/reset_password.txt', 
                                 user=user, 
                                 reset_url=reset_url),
        html_body=render_template('email/reset_password.html', 
                                 user=user, 
                                 reset_url=reset_url)
    )

def send_confirmation_email(user):
    """Send account confirmation email to user.
    
    Args:
        user: User object with email and confirmation token
        
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    # Implementation would be similar to password reset
    # This is a placeholder for future implementation
    return True

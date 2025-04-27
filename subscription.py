"""
Subscription management module.
Handles subscription tiers, payments, and feature access.
"""

import os
import stripe
from datetime import datetime, timedelta
from flask import current_app, url_for, render_template
from flask_login import current_user
from models import User
from extensions import db
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Stripe
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')

# Subscription tiers and prices
SUBSCRIPTION_TIERS = {
    'free': {
        'name': 'Free',
        'description': 'Access to basic tutorials and concept search',
        'price_monthly': 0,
        'price_yearly': 0,
        'features': [
            'Basic tutorials',
            'Concept search',
            'Public notebooks'
        ],
        'stripe_price_id_monthly': None,
        'stripe_price_id_yearly': None
    },
    'basic': {
        'name': 'Basic',
        'description': 'Access to all tutorials and progress tracking',
        'price_monthly': 9.99,
        'price_yearly': 99.99,
        'features': [
            'All Free features',
            'Advanced tutorials',
            'Progress tracking',
            'Bookmarks'
        ],
        'stripe_price_id_monthly': os.environ.get('STRIPE_PRICE_BASIC_MONTHLY'),
        'stripe_price_id_yearly': os.environ.get('STRIPE_PRICE_BASIC_YEARLY')
    },
    'premium': {
        'name': 'Premium',
        'description': 'Access to all content including exercises and quizzes',
        'price_monthly': 19.99,
        'price_yearly': 199.99,
        'features': [
            'All Basic features',
            'Premium content',
            'Code exercises',
            'Quizzes'
        ],
        'stripe_price_id_monthly': os.environ.get('STRIPE_PRICE_PREMIUM_MONTHLY'),
        'stripe_price_id_yearly': os.environ.get('STRIPE_PRICE_PREMIUM_YEARLY')
    },
    'enterprise': {
        'name': 'Enterprise',
        'description': 'Full access with team management and API access',
        'price_monthly': 49.99,
        'price_yearly': 499.99,
        'features': [
            'All Premium features',
            'Team management',
            'Custom models',
            'API access'
        ],
        'stripe_price_id_monthly': os.environ.get('STRIPE_PRICE_ENTERPRISE_MONTHLY'),
        'stripe_price_id_yearly': os.environ.get('STRIPE_PRICE_ENTERPRISE_YEARLY')
    }
}

def get_subscription_tiers():
    """Get all subscription tiers."""
    return SUBSCRIPTION_TIERS

def get_subscription_tier(tier_id):
    """Get a specific subscription tier."""
    return SUBSCRIPTION_TIERS.get(tier_id)

def create_checkout_session(user_id, tier_id, interval='monthly'):
    """Create a Stripe checkout session for subscription."""
    try:
        # Get user
        user = User.query.get(user_id)
        if not user:
            return None, 'User not found'

        # Get subscription tier
        tier = get_subscription_tier(tier_id)
        if not tier:
            return None, 'Invalid subscription tier'

        # Get price ID based on interval
        price_id = tier[f'stripe_price_id_{interval}']
        if not price_id:
            return None, 'Price not available for this tier and interval'

        # Create or retrieve Stripe customer
        if user.stripe_customer_id:
            customer = stripe.Customer.retrieve(user.stripe_customer_id)
        else:
            customer = stripe.Customer.create(
                email=user.email,
                name=user.name,
                metadata={
                    'user_id': user.id
                }
            )
            user.stripe_customer_id = customer.id
            db.session.commit()

        # Create checkout session
        checkout_session = stripe.checkout.Session.create(
            customer=customer.id,
            payment_method_types=['card'],
            line_items=[
                {
                    'price': price_id,
                    'quantity': 1,
                },
            ],
            mode='subscription',
            success_url=url_for('subscription.success', _external=True) + '?session_id={CHECKOUT_SESSION_ID}',
            cancel_url=url_for('subscription.cancel', _external=True),
            metadata={
                'user_id': user.id,
                'tier_id': tier_id,
                'interval': interval
            }
        )

        return checkout_session, None
    except Exception as e:
        current_app.logger.error(f"Error creating checkout session: {e}")
        return None, str(e)

def handle_subscription_updated(subscription_id):
    """Handle Stripe subscription updated event."""
    try:
        # Retrieve subscription from Stripe
        subscription = stripe.Subscription.retrieve(subscription_id)

        # Get customer ID
        customer_id = subscription.customer

        # Find user by Stripe customer ID
        user = User.query.filter_by(stripe_customer_id=customer_id).first()
        if not user:
            return False, 'User not found'

        # Update user subscription details
        user.payment_status = subscription.status

        # Map subscription to tier
        for item in subscription.items.data:
            price_id = item.price.id

            # Find tier by price ID
            for tier_id, tier in SUBSCRIPTION_TIERS.items():
                if tier['stripe_price_id_monthly'] == price_id or tier['stripe_price_id_yearly'] == price_id:
                    user.subscription_tier = tier_id
                    break

        # Update subscription dates
        user.subscription_start = datetime.fromtimestamp(subscription.current_period_start)
        user.subscription_end = datetime.fromtimestamp(subscription.current_period_end)

        db.session.commit()
        return True, None
    except Exception as e:
        current_app.logger.error(f"Error handling subscription update: {e}")
        return False, str(e)

def cancel_subscription(user_id):
    """Cancel user subscription."""
    try:
        # Get user
        user = User.query.get(user_id)
        if not user:
            return False, 'User not found'

        # Check if user has Stripe customer ID
        if not user.stripe_customer_id:
            return False, 'No subscription found'

        # Get customer's subscriptions
        subscriptions = stripe.Subscription.list(
            customer=user.stripe_customer_id,
            status='active',
            limit=1
        )

        if not subscriptions.data:
            return False, 'No active subscription found'

        # Cancel subscription
        subscription = stripe.Subscription.modify(
            subscriptions.data[0].id,
            cancel_at_period_end=True
        )

        # Update user record
        user.payment_status = 'canceled'
        db.session.commit()

        return True, None
    except Exception as e:
        current_app.logger.error(f"Error canceling subscription: {e}")
        return False, str(e)

def check_feature_access(feature):
    """Check if current user can access a specific feature."""
    # All features are free, so always return True
    return True

def render_subscription_required(feature_name, required_tier='basic'):
    """Render subscription required template."""
    # Since all features are free, we would normally redirect to the feature
    # But for now, just show a message that everything is free
    return render_template(
        'subscription/free_access.html',
        feature_name=feature_name
    )

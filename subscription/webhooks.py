"""
Stripe webhook handlers.
"""

import stripe
import json
import os
from flask import request, jsonify, current_app
from werkzeug.exceptions import BadRequest

from . import subscription
from extensions import db, csrf
from models import User
import subscription as subscription_module

@subscription.route('/webhook', methods=['POST'])
@csrf.exempt
def webhook():
    """Handle Stripe webhooks."""
    # Get webhook secret from environment
    webhook_secret = os.environ.get('STRIPE_WEBHOOK_SECRET')

    # Get request data
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')

    # Verify webhook signature
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError as e:
        # Invalid payload
        current_app.logger.error(f"Invalid Stripe payload: {e}")
        return jsonify({'error': 'Invalid payload'}), 400
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        current_app.logger.error(f"Invalid Stripe signature: {e}")
        return jsonify({'error': 'Invalid signature'}), 400

    # Handle specific event types
    try:
        if event['type'] == 'checkout.session.completed':
            # Payment was successful, activate the subscription
            session = event['data']['object']

            # Get subscription ID from session
            subscription_id = session.get('subscription')
            if subscription_id:
                success, error = subscription_module.handle_subscription_updated(subscription_id)
                if not success:
                    current_app.logger.error(f"Error handling subscription update: {error}")

        elif event['type'] == 'customer.subscription.updated':
            # Subscription was updated
            subscription_object = event['data']['object']
            subscription_id = subscription_object.get('id')

            if subscription_id:
                success, error = subscription_module.handle_subscription_updated(subscription_id)
                if not success:
                    current_app.logger.error(f"Error handling subscription update: {error}")

        elif event['type'] == 'customer.subscription.deleted':
            # Subscription was canceled or expired
            subscription_object = event['data']['object']
            customer_id = subscription_object.get('customer')

            if customer_id:
                # Find user by Stripe customer ID
                user = User.query.filter_by(stripe_customer_id=customer_id).first()
                if user:
                    # Reset subscription to free tier
                    user.subscription_tier = 'free'
                    user.payment_status = 'none'
                    db.session.commit()

        elif event['type'] == 'invoice.payment_failed':
            # Payment failed
            invoice = event['data']['object']
            customer_id = invoice.get('customer')

            if customer_id:
                # Find user by Stripe customer ID
                user = User.query.filter_by(stripe_customer_id=customer_id).first()
                if user:
                    # Update payment status
                    user.payment_status = 'past_due'
                    db.session.commit()

    except Exception as e:
        current_app.logger.error(f"Error processing Stripe webhook: {e}")
        return jsonify({'error': str(e)}), 500

    return jsonify({'status': 'success'})

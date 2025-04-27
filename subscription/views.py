"""
Subscription views.
"""

from flask import render_template, flash
from flask_login import login_required

from . import subscription

@subscription.route('/plans')
def plans():
    """Subscription plans page."""
    # Redirect to free access page
    return render_template(
        'subscription/free_access.html',
        feature_name='all features',
        title='All Features Are Free'
    )

@subscription.route('/checkout/<tier_id>/<interval>')
@login_required
def checkout(tier_id, interval):
    """Checkout page for subscription."""
    # All features are free
    flash('All features are now free! No need to subscribe.', 'success')
    return render_template(
        'subscription/free_access.html',
        feature_name='all features',
        title='All Features Are Free'
    )

@subscription.route('/success')
@login_required
def success():
    """Subscription success page."""
    # All features are free
    flash('All features are now free! No need to subscribe.', 'success')
    return render_template(
        'subscription/free_access.html',
        feature_name='all features',
        title='All Features Are Free'
    )

@subscription.route('/cancel')
@login_required
def cancel():
    """Subscription cancellation page."""
    # All features are free
    flash('All features are now free! No need to cancel.', 'success')
    return render_template(
        'subscription/free_access.html',
        feature_name='all features',
        title='All Features Are Free'
    )

@subscription.route('/manage')
@login_required
def manage():
    """Subscription management page."""
    # All features are free
    flash('All features are now free! No need to manage subscriptions.', 'success')
    return render_template(
        'subscription/free_access.html',
        feature_name='all features',
        title='All Features Are Free'
    )

@subscription.route('/cancel-subscription', methods=['POST'])
@login_required
def cancel_subscription():
    """Cancel user subscription."""
    # All features are free
    flash('All features are now free! No need to cancel.', 'success')
    return render_template(
        'subscription/free_access.html',
        feature_name='all features',
        title='All Features Are Free'
    )

@subscription.route('/required/<feature>')
def required(feature):
    """Subscription required page."""
    # All features are free
    return render_template(
        'subscription/free_access.html',
        feature_name=feature,
        title='All Features Are Free'
    )

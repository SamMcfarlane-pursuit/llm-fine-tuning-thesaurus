#!/usr/bin/env python3
"""
Performance Monitor and Crash Prevention System
Monitors system resources and implements safeguards to prevent crashes
"""

import psutil
import time
import threading
import logging
from datetime import datetime, timedelta
from collections import deque
import json
import os
from flask import request, g
from functools import wraps

class PerformanceMonitor:
    def __init__(self, app=None):
        self.app = app
        self.metrics = {
            'cpu_usage': deque(maxlen=60),  # Last 60 measurements
            'memory_usage': deque(maxlen=60),
            'active_connections': deque(maxlen=60),
            'response_times': deque(maxlen=1000),
            'error_count': deque(maxlen=60),
            'request_count': deque(maxlen=60)
        }
        
        self.thresholds = {
            'cpu_critical': 85.0,
            'cpu_warning': 70.0,
            'memory_critical': 85.0,
            'memory_warning': 70.0,
            'response_time_critical': 5.0,
            'response_time_warning': 2.0,
            'error_rate_critical': 10.0,
            'error_rate_warning': 5.0,
            'max_concurrent_users': 150  # Based on load test results
        }
        
        self.current_connections = 0
        self.monitoring_active = False
        self.alert_cooldown = {}
        self.emergency_mode = False
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize the performance monitor with Flask app"""
        self.app = app
        
        # Set up logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Register request handlers
        app.before_request(self.before_request)
        app.after_request(self.after_request)
        app.teardown_appcontext(self.teardown_request)
        
        # Start monitoring thread
        self.start_monitoring()
        
        self.logger.info("Performance Monitor initialized")
    
    def start_monitoring(self):
        """Start the background monitoring thread"""
        if not self.monitoring_active:
            self.monitoring_active = True
            monitor_thread = threading.Thread(target=self._monitor_loop, daemon=True)
            monitor_thread.start()
            self.logger.info("Performance monitoring started")
    
    def stop_monitoring(self):
        """Stop the background monitoring"""
        self.monitoring_active = False
        self.logger.info("Performance monitoring stopped")
    
    def _monitor_loop(self):
        """Main monitoring loop"""
        while self.monitoring_active:
            try:
                self._collect_metrics()
                self._check_thresholds()
                self._cleanup_old_data()
                time.sleep(1)  # Monitor every second
            except Exception as e:
                self.logger.error(f"Monitoring error: {e}")
                time.sleep(5)  # Wait longer on error
    
    def _collect_metrics(self):
        """Collect system metrics"""
        current_time = time.time()
        
        # CPU and Memory usage
        cpu_percent = psutil.cpu_percent(interval=None)
        memory_info = psutil.virtual_memory()
        
        self.metrics['cpu_usage'].append((current_time, cpu_percent))
        self.metrics['memory_usage'].append((current_time, memory_info.percent))
        self.metrics['active_connections'].append((current_time, self.current_connections))
        
        # Calculate request rate (requests per minute)
        recent_requests = len([t for t, _ in self.metrics['request_count'] 
                             if current_time - t < 60])
        
        # Calculate error rate
        recent_errors = len([t for t, _ in self.metrics['error_count'] 
                           if current_time - t < 60])
        error_rate = (recent_errors / max(recent_requests, 1)) * 100
        
        # Log metrics periodically
        if int(current_time) % 30 == 0:  # Every 30 seconds
            self.logger.info(f"Metrics - CPU: {cpu_percent:.1f}%, Memory: {memory_info.percent:.1f}%, "
                           f"Connections: {self.current_connections}, Error Rate: {error_rate:.1f}%")
    
    def _check_thresholds(self):
        """Check if any thresholds are exceeded"""
        current_time = time.time()
        
        # Get recent metrics
        recent_cpu = [val for ts, val in self.metrics['cpu_usage'] if current_time - ts < 60]
        recent_memory = [val for ts, val in self.metrics['memory_usage'] if current_time - ts < 60]
        recent_response_times = [val for ts, val in self.metrics['response_times'] if current_time - ts < 300]
        
        if recent_cpu:
            avg_cpu = sum(recent_cpu) / len(recent_cpu)
            if avg_cpu > self.thresholds['cpu_critical']:
                self._trigger_alert('cpu_critical', f"Critical CPU usage: {avg_cpu:.1f}%")
                self._enable_emergency_mode()
            elif avg_cpu > self.thresholds['cpu_warning']:
                self._trigger_alert('cpu_warning', f"High CPU usage: {avg_cpu:.1f}%")
        
        if recent_memory:
            avg_memory = sum(recent_memory) / len(recent_memory)
            if avg_memory > self.thresholds['memory_critical']:
                self._trigger_alert('memory_critical', f"Critical memory usage: {avg_memory:.1f}%")
                self._enable_emergency_mode()
            elif avg_memory > self.thresholds['memory_warning']:
                self._trigger_alert('memory_warning', f"High memory usage: {avg_memory:.1f}%")
        
        if recent_response_times:
            avg_response_time = sum(recent_response_times) / len(recent_response_times)
            if avg_response_time > self.thresholds['response_time_critical']:
                self._trigger_alert('response_critical', f"Critical response time: {avg_response_time:.2f}s")
                self._enable_emergency_mode()
            elif avg_response_time > self.thresholds['response_time_warning']:
                self._trigger_alert('response_warning', f"Slow response time: {avg_response_time:.2f}s")
        
        # Check connection limits
        if self.current_connections > self.thresholds['max_concurrent_users']:
            self._trigger_alert('connection_limit', f"Too many connections: {self.current_connections}")
            self._enable_emergency_mode()
    
    def _trigger_alert(self, alert_type, message):
        """Trigger an alert with cooldown"""
        current_time = time.time()
        
        # Check cooldown (don't spam alerts)
        if alert_type in self.alert_cooldown:
            if current_time - self.alert_cooldown[alert_type] < 300:  # 5 minute cooldown
                return
        
        self.alert_cooldown[alert_type] = current_time
        self.logger.warning(f"ALERT [{alert_type}]: {message}")
        
        # Save alert to file
        self._save_alert(alert_type, message)
    
    def _save_alert(self, alert_type, message):
        """Save alert to file for external monitoring"""
        alert_data = {
            'timestamp': datetime.now().isoformat(),
            'type': alert_type,
            'message': message,
            'metrics': self.get_current_metrics()
        }
        
        try:
            with open('performance_alerts.json', 'a') as f:
                f.write(json.dumps(alert_data) + '\n')
        except Exception as e:
            self.logger.error(f"Failed to save alert: {e}")
    
    def _enable_emergency_mode(self):
        """Enable emergency mode to prevent crashes"""
        if not self.emergency_mode:
            self.emergency_mode = True
            self.logger.critical("EMERGENCY MODE ACTIVATED - Implementing crash prevention measures")
            
            # Reduce connection limits
            self.thresholds['max_concurrent_users'] = min(50, self.thresholds['max_concurrent_users'])
    
    def _disable_emergency_mode(self):
        """Disable emergency mode when system recovers"""
        if self.emergency_mode:
            self.emergency_mode = False
            self.thresholds['max_concurrent_users'] = 150  # Reset to normal
            self.logger.info("Emergency mode deactivated - System recovered")
    
    def _cleanup_old_data(self):
        """Clean up old metrics data"""
        current_time = time.time()
        cutoff_time = current_time - 3600  # Keep 1 hour of data
        
        for metric_name, metric_data in self.metrics.items():
            while metric_data and metric_data[0][0] < cutoff_time:
                metric_data.popleft()
    
    def before_request(self):
        """Called before each request"""
        # Check if we should reject the request
        if self.emergency_mode and self.current_connections > 25:
            from flask import abort
            abort(503)  # Service Unavailable
        
        if self.current_connections > self.thresholds['max_concurrent_users']:
            from flask import abort
            abort(503)  # Service Unavailable
        
        self.current_connections += 1
        g.request_start_time = time.time()
        
        # Log request
        self.metrics['request_count'].append((time.time(), 1))
    
    def after_request(self, response):
        """Called after each request"""
        if hasattr(g, 'request_start_time'):
            response_time = time.time() - g.request_start_time
            self.metrics['response_times'].append((time.time(), response_time))
            
            # Log slow requests
            if response_time > 2.0:
                self.logger.warning(f"Slow request: {request.path} took {response_time:.2f}s")
            
            # Log errors
            if response.status_code >= 400:
                self.metrics['error_count'].append((time.time(), 1))
        
        return response
    
    def teardown_request(self, exception):
        """Called when request context is torn down"""
        self.current_connections = max(0, self.current_connections - 1)
        
        if exception:
            self.metrics['error_count'].append((time.time(), 1))
            self.logger.error(f"Request exception: {exception}")
    
    def get_current_metrics(self):
        """Get current system metrics"""
        current_time = time.time()
        
        # Get recent metrics
        recent_cpu = [val for ts, val in self.metrics['cpu_usage'] if current_time - ts < 60]
        recent_memory = [val for ts, val in self.metrics['memory_usage'] if current_time - ts < 60]
        recent_response_times = [val for ts, val in self.metrics['response_times'] if current_time - ts < 300]
        
        return {
            'timestamp': datetime.now().isoformat(),
            'cpu_usage': sum(recent_cpu) / len(recent_cpu) if recent_cpu else 0,
            'memory_usage': sum(recent_memory) / len(recent_memory) if recent_memory else 0,
            'active_connections': self.current_connections,
            'avg_response_time': sum(recent_response_times) / len(recent_response_times) if recent_response_times else 0,
            'emergency_mode': self.emergency_mode,
            'max_concurrent_users': self.thresholds['max_concurrent_users']
        }
    
    def get_health_status(self):
        """Get overall health status"""
        metrics = self.get_current_metrics()
        
        status = 'healthy'
        issues = []
        
        if metrics['cpu_usage'] > self.thresholds['cpu_critical']:
            status = 'critical'
            issues.append(f"Critical CPU usage: {metrics['cpu_usage']:.1f}%")
        elif metrics['cpu_usage'] > self.thresholds['cpu_warning']:
            status = 'warning'
            issues.append(f"High CPU usage: {metrics['cpu_usage']:.1f}%")
        
        if metrics['memory_usage'] > self.thresholds['memory_critical']:
            status = 'critical'
            issues.append(f"Critical memory usage: {metrics['memory_usage']:.1f}%")
        elif metrics['memory_usage'] > self.thresholds['memory_warning']:
            status = 'warning'
            issues.append(f"High memory usage: {metrics['memory_usage']:.1f}%")
        
        if metrics['avg_response_time'] > self.thresholds['response_time_critical']:
            status = 'critical'
            issues.append(f"Critical response time: {metrics['avg_response_time']:.2f}s")
        elif metrics['avg_response_time'] > self.thresholds['response_time_warning']:
            status = 'warning'
            issues.append(f"Slow response time: {metrics['avg_response_time']:.2f}s")
        
        return {
            'status': status,
            'issues': issues,
            'metrics': metrics,
            'emergency_mode': self.emergency_mode
        }

def connection_limiter(max_connections=100):
    """Decorator to limit concurrent connections to specific endpoints"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            monitor = getattr(g, 'performance_monitor', None)
            if monitor and monitor.current_connections > max_connections:
                from flask import abort
                abort(503)  # Service Unavailable
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def rate_limiter(requests_per_minute=60):
    """Simple rate limiter decorator"""
    request_times = deque(maxlen=requests_per_minute)
    
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            current_time = time.time()
            
            # Remove old requests
            while request_times and current_time - request_times[0] > 60:
                request_times.popleft()
            
            # Check rate limit
            if len(request_times) >= requests_per_minute:
                from flask import abort
                abort(429)  # Too Many Requests
            
            request_times.append(current_time)
            return f(*args, **kwargs)
        return decorated_function
    return decorator
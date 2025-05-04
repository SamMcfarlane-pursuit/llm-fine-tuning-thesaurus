# Thesaurus AI LLM Fine-Tuning Deployment Guide

This guide provides detailed instructions for deploying the Thesaurus AI LLM Fine-Tuning project to a production environment, ensuring that all components work correctly and the application is secure, scalable, and performant.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Application Deployment](#application-deployment)
4. [Database Setup](#database-setup)
5. [Authentication Setup](#authentication-setup)
6. [Static Files](#static-files)
7. [HTTPS Configuration](#https-configuration)
8. [Monitoring and Logging](#monitoring-and-logging)
9. [Scaling](#scaling)
10. [Backup and Recovery](#backup-and-recovery)
11. [Maintenance](#maintenance)

## Prerequisites

Before deploying the application, ensure you have the following:

- A server or cloud platform (AWS, Google Cloud, Azure, etc.)
- Domain name (optional but recommended)
- SSL certificate (for HTTPS)
- Database server (PostgreSQL recommended)
- Python 3.8 or higher
- Git
- Basic knowledge of server administration

## Environment Setup

### Server Preparation

1. **Update the server**:
   ```bash
   sudo apt update
   sudo apt upgrade -y
   ```

2. **Install required packages**:
   ```bash
   sudo apt install -y python3-pip python3-dev build-essential libssl-dev libffi-dev python3-setuptools python3-venv nginx
   ```

3. **Create a user for the application**:
   ```bash
   sudo useradd -m -s /bin/bash thesaurus
   sudo passwd thesaurus
   ```

4. **Set up the application directory**:
   ```bash
   sudo mkdir -p /var/www/thesaurus
   sudo chown thesaurus:thesaurus /var/www/thesaurus
   ```

### Python Environment

1. **Create a virtual environment**:
   ```bash
   sudo -u thesaurus bash -c "cd /var/www/thesaurus && python3 -m venv venv"
   ```

2. **Activate the virtual environment**:
   ```bash
   sudo -u thesaurus bash -c "cd /var/www/thesaurus && source venv/bin/activate"
   ```

3. **Install required Python packages**:
   ```bash
   sudo -u thesaurus bash -c "cd /var/www/thesaurus && pip install wheel gunicorn flask"
   ```

## Application Deployment

### Clone the Repository

1. **Clone the repository**:
   ```bash
   sudo -u thesaurus bash -c "cd /var/www/thesaurus && git clone https://github.com/yourusername/thesaurus-ai.git app"
   ```

2. **Install application dependencies**:
   ```bash
   sudo -u thesaurus bash -c "cd /var/www/thesaurus/app && pip install -r requirements.txt"
   ```

### Configuration

1. **Create a production configuration file**:
   ```bash
   sudo -u thesaurus bash -c "cd /var/www/thesaurus/app && cp config.py.example config.py"
   ```

2. **Edit the configuration file**:
   ```bash
   sudo -u thesaurus bash -c "nano /var/www/thesaurus/app/config.py"
   ```

   Update the following settings:
   ```python
   DEBUG = False
   SECRET_KEY = 'your-secure-secret-key'
   SQLALCHEMY_DATABASE_URI = 'postgresql://username:password@localhost/thesaurus'
   ```

### WSGI Setup

1. **Create a WSGI entry point**:
   ```bash
   sudo -u thesaurus bash -c "nano /var/www/thesaurus/app/wsgi.py"
   ```

   Add the following content:
   ```python
   from app import app

   if __name__ == '__main__':
       app.run()
   ```

2. **Create a systemd service file**:
   ```bash
   sudo nano /etc/systemd/system/thesaurus.service
   ```

   Add the following content:
   ```
   [Unit]
   Description=Gunicorn instance to serve Thesaurus AI
   After=network.target

   [Service]
   User=thesaurus
   Group=www-data
   WorkingDirectory=/var/www/thesaurus/app
   Environment="PATH=/var/www/thesaurus/venv/bin"
   ExecStart=/var/www/thesaurus/venv/bin/gunicorn --workers 3 --bind unix:thesaurus.sock -m 007 wsgi:app

   [Install]
   WantedBy=multi-user.target
   ```

3. **Start and enable the service**:
   ```bash
   sudo systemctl start thesaurus
   sudo systemctl enable thesaurus
   ```

### Nginx Configuration

1. **Create an Nginx server block**:
   ```bash
   sudo nano /etc/nginx/sites-available/thesaurus
   ```

   Add the following content:
   ```
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       location / {
           include proxy_params;
           proxy_pass http://unix:/var/www/thesaurus/app/thesaurus.sock;
       }

       location /static {
           alias /var/www/thesaurus/app/static;
       }
   }
   ```

2. **Enable the server block**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/thesaurus /etc/nginx/sites-enabled
   ```

3. **Test the Nginx configuration**:
   ```bash
   sudo nginx -t
   ```

4. **Restart Nginx**:
   ```bash
   sudo systemctl restart nginx
   ```

## Database Setup

### PostgreSQL Installation

1. **Install PostgreSQL**:
   ```bash
   sudo apt install -y postgresql postgresql-contrib
   ```

2. **Create a database and user**:
   ```bash
   sudo -u postgres psql
   ```

   In the PostgreSQL prompt:
   ```sql
   CREATE DATABASE thesaurus;
   CREATE USER thesaurus_user WITH PASSWORD 'your-secure-password';
   GRANT ALL PRIVILEGES ON DATABASE thesaurus TO thesaurus_user;
   \q
   ```

### Database Initialization

1. **Update the database URI in the configuration file**:
   ```bash
   sudo -u thesaurus bash -c "nano /var/www/thesaurus/app/config.py"
   ```

   Update the database URI:
   ```python
   SQLALCHEMY_DATABASE_URI = 'postgresql://thesaurus_user:your-secure-password@localhost/thesaurus'
   ```

2. **Initialize the database**:
   ```bash
   sudo -u thesaurus bash -c "cd /var/www/thesaurus/app && source ../venv/bin/activate && python manage.py db upgrade"
   ```

## Authentication Setup

### Supabase Integration

If using Supabase for authentication:

1. **Create a Supabase account and project**:
   - Go to [Supabase](https://supabase.io/) and sign up
   - Create a new project
   - Note your project URL and API key

2. **Update the configuration file**:
   ```bash
   sudo -u thesaurus bash -c "nano /var/www/thesaurus/app/config.py"
   ```

   Add Supabase configuration:
   ```python
   SUPABASE_URL = 'your-supabase-url'
   SUPABASE_KEY = 'your-supabase-key'
   ```

3. **Enable email authentication in Supabase**:
   - Go to Authentication > Settings
   - Enable Email auth
   - Configure email templates

### Local Authentication

If using local authentication:

1. **Ensure the authentication routes are properly configured**:
   ```bash
   sudo -u thesaurus bash -c "nano /var/www/thesaurus/app/auth.py"
   ```

2. **Set up email for password reset**:
   ```bash
   sudo -u thesaurus bash -c "nano /var/www/thesaurus/app/config.py"
   ```

   Add email configuration:
   ```python
   MAIL_SERVER = 'smtp.yourmailserver.com'
   MAIL_PORT = 587
   MAIL_USE_TLS = True
   MAIL_USERNAME = 'your-email@example.com'
   MAIL_PASSWORD = 'your-email-password'
   MAIL_DEFAULT_SENDER = 'your-email@example.com'
   ```

## Static Files

### Collecting Static Files

1. **Collect static files**:
   ```bash
   sudo -u thesaurus bash -c "cd /var/www/thesaurus/app && source ../venv/bin/activate && python manage.py collectstatic"
   ```

2. **Set proper permissions**:
   ```bash
   sudo chown -R thesaurus:www-data /var/www/thesaurus/app/static
   sudo chmod -R 755 /var/www/thesaurus/app/static
   ```

### CDN Integration (Optional)

For better performance, consider using a CDN:

1. **Sign up for a CDN service** (e.g., Cloudflare, AWS CloudFront)

2. **Configure the CDN to serve static files**:
   - Set up a distribution pointing to your domain
   - Configure caching rules for static files

3. **Update the application to use the CDN URL for static files**:
   ```bash
   sudo -u thesaurus bash -c "nano /var/www/thesaurus/app/config.py"
   ```

   Add CDN configuration:
   ```python
   CDN_URL = 'https://your-cdn-url.com'
   ```

## HTTPS Configuration

### Let's Encrypt SSL

1. **Install Certbot**:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   ```

2. **Obtain an SSL certificate**:
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

3. **Set up auto-renewal**:
   ```bash
   sudo systemctl status certbot.timer
   ```

### Manual SSL

If using a manually obtained SSL certificate:

1. **Install the certificate**:
   ```bash
   sudo mkdir -p /etc/nginx/ssl
   sudo cp your-certificate.crt /etc/nginx/ssl/thesaurus.crt
   sudo cp your-private-key.key /etc/nginx/ssl/thesaurus.key
   ```

2. **Update the Nginx configuration**:
   ```bash
   sudo nano /etc/nginx/sites-available/thesaurus
   ```

   Update the server block:
   ```
   server {
       listen 443 ssl;
       server_name yourdomain.com www.yourdomain.com;

       ssl_certificate /etc/nginx/ssl/thesaurus.crt;
       ssl_certificate_key /etc/nginx/ssl/thesaurus.key;

       # SSL configuration
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_prefer_server_ciphers on;
       ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
       ssl_session_timeout 1d;
       ssl_session_cache shared:SSL:10m;
       ssl_session_tickets off;

       location / {
           include proxy_params;
           proxy_pass http://unix:/var/www/thesaurus/app/thesaurus.sock;
       }

       location /static {
           alias /var/www/thesaurus/app/static;
       }
   }

   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;
       return 301 https://$host$request_uri;
   }
   ```

3. **Restart Nginx**:
   ```bash
   sudo systemctl restart nginx
   ```

## Monitoring and Logging

### Application Logging

1. **Configure application logging**:
   ```bash
   sudo -u thesaurus bash -c "nano /var/www/thesaurus/app/config.py"
   ```

   Add logging configuration:
   ```python
   import logging
   from logging.handlers import RotatingFileHandler

   LOGGING_LEVEL = logging.INFO
   LOGGING_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
   LOGGING_LOCATION = '/var/log/thesaurus/app.log'
   LOGGING_MAX_BYTES = 10485760  # 10MB
   LOGGING_BACKUP_COUNT = 10
   ```

2. **Create the log directory**:
   ```bash
   sudo mkdir -p /var/log/thesaurus
   sudo chown thesaurus:thesaurus /var/log/thesaurus
   ```

### Server Monitoring

1. **Install monitoring tools**:
   ```bash
   sudo apt install -y prometheus node-exporter grafana
   ```

2. **Configure Prometheus**:
   ```bash
   sudo nano /etc/prometheus/prometheus.yml
   ```

   Add configuration for monitoring the application:
   ```yaml
   scrape_configs:
     - job_name: 'node'
       static_configs:
         - targets: ['localhost:9100']
     - job_name: 'thesaurus'
       static_configs:
         - targets: ['localhost:8000']
   ```

3. **Start and enable Prometheus and Node Exporter**:
   ```bash
   sudo systemctl start prometheus
   sudo systemctl enable prometheus
   sudo systemctl start node-exporter
   sudo systemctl enable node-exporter
   ```

4. **Configure Grafana**:
   ```bash
   sudo systemctl start grafana-server
   sudo systemctl enable grafana-server
   ```

   Access Grafana at `http://your-server-ip:3000` and set up dashboards for monitoring.

## Scaling

### Horizontal Scaling

For handling increased traffic:

1. **Set up multiple application servers**:
   - Clone the application to multiple servers
   - Configure each server with the same settings

2. **Set up a load balancer**:
   ```bash
   sudo apt install -y haproxy
   ```

3. **Configure HAProxy**:
   ```bash
   sudo nano /etc/haproxy/haproxy.cfg
   ```

   Add configuration:
   ```
   frontend http_front
       bind *:80
       stats uri /haproxy?stats
       default_backend http_back

   backend http_back
       balance roundrobin
       server server1 server1-ip:80 check
       server server2 server2-ip:80 check
   ```

4. **Restart HAProxy**:
   ```bash
   sudo systemctl restart haproxy
   ```

### Vertical Scaling

For handling increased computational needs:

1. **Increase server resources**:
   - Upgrade CPU, RAM, and disk space
   - Update Gunicorn configuration for more workers:
     ```bash
     sudo nano /etc/systemd/system/thesaurus.service
     ```

     Update the ExecStart line:
     ```
     ExecStart=/var/www/thesaurus/venv/bin/gunicorn --workers 6 --bind unix:thesaurus.sock -m 007 wsgi:app
     ```

2. **Restart the service**:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl restart thesaurus
   ```

## Backup and Recovery

### Database Backup

1. **Set up automated backups**:
   ```bash
   sudo nano /etc/cron.daily/backup-thesaurus-db
   ```

   Add backup script:
   ```bash
   #!/bin/bash
   BACKUP_DIR="/var/backups/thesaurus"
   TIMESTAMP=$(date +"%Y%m%d%H%M%S")
   mkdir -p $BACKUP_DIR
   pg_dump -U thesaurus_user thesaurus > $BACKUP_DIR/thesaurus-$TIMESTAMP.sql
   find $BACKUP_DIR -type f -name "thesaurus-*.sql" -mtime +7 -delete
   ```

2. **Make the script executable**:
   ```bash
   sudo chmod +x /etc/cron.daily/backup-thesaurus-db
   ```

### Application Backup

1. **Set up Git-based backups**:
   ```bash
   sudo -u thesaurus bash -c "cd /var/www/thesaurus/app && git add . && git commit -m 'Backup $(date)' && git push origin master"
   ```

2. **Automate with cron**:
   ```bash
   sudo -u thesaurus bash -c "crontab -e"
   ```

   Add cron job:
   ```
   0 0 * * * cd /var/www/thesaurus/app && git add . && git commit -m 'Backup $(date)' && git push origin master
   ```

## Maintenance

### Regular Updates

1. **Update the application**:
   ```bash
   sudo -u thesaurus bash -c "cd /var/www/thesaurus/app && git pull"
   ```

2. **Update dependencies**:
   ```bash
   sudo -u thesaurus bash -c "cd /var/www/thesaurus/app && source ../venv/bin/activate && pip install -r requirements.txt"
   ```

3. **Restart the application**:
   ```bash
   sudo systemctl restart thesaurus
   ```

### Database Maintenance

1. **Optimize the database**:
   ```bash
   sudo -u postgres bash -c "psql -d thesaurus -c 'VACUUM ANALYZE;'"
   ```

2. **Check for and fix database issues**:
   ```bash
   sudo -u postgres bash -c "psql -d thesaurus -c 'REINDEX DATABASE thesaurus;'"
   ```

### Security Updates

1. **Update the server**:
   ```bash
   sudo apt update
   sudo apt upgrade -y
   ```

2. **Restart services if needed**:
   ```bash
   sudo systemctl restart nginx
   sudo systemctl restart thesaurus
   ```

By following this deployment guide, you can ensure that the Thesaurus AI LLM Fine-Tuning project is deployed securely, performs well, and is easy to maintain in a production environment.

# Thesaurus AI LLM Fine-Tuning Server Instructions

This document provides instructions for running the Thesaurus AI LLM Fine-Tuning application on multiple servers to ensure all features are fully functional and accessible.

## Server Scripts

The following scripts are provided to help manage the servers:

1. **start_servers.sh**: Starts three servers on different ports (5035, 5036, and 5037)
2. **check_servers.sh**: Checks if all servers are running and displays their URLs
3. **stop_servers.sh**: Stops all running servers

## Starting the Servers

To start all servers, run the following command:

```bash
./start_servers.sh
```

This will start three servers on the following ports:
- Port 5035: Main server
- Port 5036: Secondary server
- Port 5037: Tertiary server

## Checking Server Status

To check if all servers are running, run the following command:

```bash
./check_servers.sh
```

This will display the status of each server and their URLs.

## Stopping the Servers

To stop all servers, run the following command:

```bash
./stop_servers.sh
```

This will stop all running servers.

## Accessing Different Features

You can access different features on each server to distribute the load and ensure all functionality is available. Here are some examples:

### Main Server (Port 5035)
- Homepage: http://127.0.0.1:5035/
- Workshop Progress: http://127.0.0.1:5035/workshop-progress
- Learn and Explore: http://127.0.0.1:5035/learn-and-explore

### Secondary Server (Port 5036)
- Homepage: http://127.0.0.1:5036/
- Frameworks: http://127.0.0.1:5036/frameworks
- QLoRA Implementation Guide: http://127.0.0.1:5036/guide/qlora-implementation

### Tertiary Server (Port 5037)
- Homepage: http://127.0.0.1:5037/
- Tutorials: http://127.0.0.1:5037/tutorials
- PEFT Guide: http://127.0.0.1:5037/peft-guide

## Troubleshooting

If a server is not running, you can start it individually using the following command:

```bash
python app.py --port <port_number>
```

For example, to start the server on port 5035:

```bash
python app.py --port 5035
```

If you encounter any issues with the servers, try the following:

1. Stop all servers using `./stop_servers.sh`
2. Start all servers again using `./start_servers.sh`
3. Check if all servers are running using `./check_servers.sh`

If you still encounter issues, check the server logs for any error messages.

## Additional Information

The servers are configured to run in debug mode, which means they will automatically reload when changes are made to the code. This is useful for development, but may cause the servers to restart unexpectedly.

If you need to make changes to the code, it's recommended to stop all servers first, make the changes, and then start the servers again.

For production deployment, it's recommended to use a production WSGI server like Gunicorn or uWSGI instead of the built-in Flask development server.

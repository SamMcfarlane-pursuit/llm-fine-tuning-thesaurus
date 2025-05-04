#!/usr/bin/env python3
"""
Load testing script for the website.
Simulates multiple users accessing the website simultaneously.
"""

import argparse
import asyncio
import random
import time
from datetime import datetime

import aiohttp

# List of pages to test
PAGES = [
    "/",
    "/thesaurus",
    "/guide/qlora-implementation",
    "/guide/data-preparation",
    "/exercises",
    "/quiz/quizzes",
    "/learn",
    "/tutorials",
    "/frameworks"
]

# User agent strings to simulate different browsers
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
]

# Results storage
results = {
    "total_requests": 0,
    "successful_requests": 0,
    "failed_requests": 0,
    "response_times": [],
    "errors": []
}

async def simulate_user(session, base_url, user_id, pages_to_visit=5, delay_between_requests=1):
    """Simulate a user browsing the website."""
    user_agent = random.choice(USER_AGENTS)
    headers = {
        "User-Agent": user_agent,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "X-Test-User-ID": str(user_id)
    }
    
    # Create a session cookie
    cookies = {
        "session_id": f"test-session-{user_id}",
        "test_user": f"user-{user_id}"
    }
    
    # Visit random pages
    pages_to_visit = min(pages_to_visit, len(PAGES))
    pages = random.sample(PAGES, pages_to_visit)
    
    for page in pages:
        url = f"{base_url}{page}"
        try:
            start_time = time.time()
            async with session.get(url, headers=headers, cookies=cookies) as response:
                response_time = time.time() - start_time
                results["response_times"].append(response_time)
                results["total_requests"] += 1
                
                if response.status == 200:
                    results["successful_requests"] += 1
                    print(f"User {user_id} - {url} - {response.status} - {response_time:.2f}s")
                else:
                    results["failed_requests"] += 1
                    error = f"User {user_id} - {url} - Error: {response.status}"
                    results["errors"].append(error)
                    print(error)
                
                # Simulate reading the page
                await asyncio.sleep(delay_between_requests)
        except Exception as e:
            results["total_requests"] += 1
            results["failed_requests"] += 1
            error = f"User {user_id} - {url} - Exception: {str(e)}"
            results["errors"].append(error)
            print(error)

async def run_load_test(base_url, num_users, pages_per_user, delay_between_requests):
    """Run the load test with the specified number of users."""
    print(f"Starting load test with {num_users} users...")
    print(f"Each user will visit {pages_per_user} pages with {delay_between_requests}s delay between requests")
    print(f"Base URL: {base_url}")
    print("-" * 80)
    
    start_time = time.time()
    
    async with aiohttp.ClientSession() as session:
        tasks = []
        for user_id in range(1, num_users + 1):
            task = simulate_user(
                session, 
                base_url, 
                user_id, 
                pages_per_user, 
                delay_between_requests
            )
            tasks.append(task)
        
        await asyncio.gather(*tasks)
    
    total_time = time.time() - start_time
    
    # Print results
    print("\n" + "=" * 80)
    print(f"Load Test Results - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    print(f"Total time: {total_time:.2f} seconds")
    print(f"Total requests: {results['total_requests']}")
    print(f"Successful requests: {results['successful_requests']}")
    print(f"Failed requests: {results['failed_requests']}")
    
    if results["response_times"]:
        avg_response_time = sum(results["response_times"]) / len(results["response_times"])
        max_response_time = max(results["response_times"])
        min_response_time = min(results["response_times"])
        print(f"Average response time: {avg_response_time:.2f} seconds")
        print(f"Maximum response time: {max_response_time:.2f} seconds")
        print(f"Minimum response time: {min_response_time:.2f} seconds")
    
    if results["errors"]:
        print("\nErrors:")
        for error in results["errors"][:10]:  # Show first 10 errors
            print(f"- {error}")
        
        if len(results["errors"]) > 10:
            print(f"... and {len(results['errors']) - 10} more errors")
    
    print("\nRequests per second: {:.2f}".format(results["total_requests"] / total_time))
    print("=" * 80)

def main():
    parser = argparse.ArgumentParser(description="Load testing script for the website")
    parser.add_argument("--url", default="http://localhost:5016", help="Base URL of the website")
    parser.add_argument("--users", type=int, default=10, help="Number of concurrent users")
    parser.add_argument("--pages", type=int, default=3, help="Number of pages each user visits")
    parser.add_argument("--delay", type=float, default=1.0, help="Delay between requests (seconds)")
    
    args = parser.parse_args()
    
    asyncio.run(run_load_test(args.url, args.users, args.pages, args.delay))

if __name__ == "__main__":
    main()

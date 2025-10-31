#!/usr/bin/env python3
"""
Database Optimization Module for Thesaurus AI LLM
Provides connection pooling, query optimization, and database performance enhancements.
"""

import sqlite3
import threading
import time
import logging
from contextlib import contextmanager
from typing import Dict, Any, List, Optional, Tuple
from queue import Queue, Empty
from dataclasses import dataclass
from datetime import datetime, timezone
import os
from functools import wraps
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class QueryMetrics:
    """Metrics for database query performance."""
    query: str
    execution_time: float
    timestamp: datetime
    rows_affected: int
    success: bool
    error_message: Optional[str] = None

class ConnectionPool:
    """
    SQLite connection pool for improved performance and concurrency.
    """
    
    def __init__(self, database_path: str, pool_size: int = 10, timeout: int = 30):
        self.database_path = database_path
        self.pool_size = pool_size
        self.timeout = timeout
        self.pool = Queue(maxsize=pool_size)
        self.active_connections = 0
        self.lock = threading.Lock()
        self.metrics = []
        
        # Initialize the pool
        self._initialize_pool()
        
        logger.info(f"Connection pool initialized with {pool_size} connections for {database_path}")
    
    def _initialize_pool(self):
        """Initialize the connection pool with configured connections."""
        for _ in range(self.pool_size):
            try:
                conn = self._create_connection()
                self.pool.put(conn)
            except Exception as e:
                logger.error(f"Failed to create connection: {e}")
    
    def _create_connection(self) -> sqlite3.Connection:
        """Create a new SQLite connection with optimizations."""
        conn = sqlite3.connect(
            self.database_path,
            check_same_thread=False,
            timeout=self.timeout
        )
        
        # Enable optimizations
        conn.execute("PRAGMA journal_mode=WAL")  # Write-Ahead Logging
        conn.execute("PRAGMA synchronous=NORMAL")  # Balanced durability/performance
        conn.execute("PRAGMA cache_size=10000")  # Increase cache size
        conn.execute("PRAGMA temp_store=MEMORY")  # Store temp tables in memory
        conn.execute("PRAGMA mmap_size=268435456")  # 256MB memory-mapped I/O
        
        # Enable foreign key constraints
        conn.execute("PRAGMA foreign_keys=ON")
        
        # Set row factory for better data access
        conn.row_factory = sqlite3.Row
        
        return conn
    
    @contextmanager
    def get_connection(self):
        """Get a connection from the pool using context manager."""
        conn = None
        try:
            # Try to get a connection from the pool
            try:
                conn = self.pool.get(timeout=self.timeout)
            except Empty:
                # If pool is empty, create a new connection
                logger.warning("Connection pool exhausted, creating new connection")
                conn = self._create_connection()
            
            with self.lock:
                self.active_connections += 1
            
            yield conn
            
        except Exception as e:
            logger.error(f"Connection error: {e}")
            if conn:
                conn.rollback()
            raise
        finally:
            if conn:
                try:
                    # Return connection to pool if there's space
                    if self.pool.qsize() < self.pool_size:
                        self.pool.put(conn)
                    else:
                        conn.close()
                except Exception as e:
                    logger.error(f"Error returning connection to pool: {e}")
                    if conn:
                        conn.close()
                
                with self.lock:
                    self.active_connections = max(0, self.active_connections - 1)
    
    def execute_query(self, query: str, params: Tuple = (), fetch: str = 'none') -> Any:
        """Execute a query with performance monitoring."""
        start_time = time.time()
        rows_affected = 0
        success = False
        error_message = None
        result = None
        
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, params)
                
                if fetch == 'all':
                    result = cursor.fetchall()
                    rows_affected = len(result) if result else 0
                elif fetch == 'one':
                    result = cursor.fetchone()
                    rows_affected = 1 if result else 0
                else:
                    rows_affected = cursor.rowcount
                
                conn.commit()
                success = True
                
        except Exception as e:
            error_message = str(e)
            logger.error(f"Query execution error: {e}")
            raise
        finally:
            execution_time = time.time() - start_time
            
            # Record metrics
            metric = QueryMetrics(
                query=query[:100] + '...' if len(query) > 100 else query,
                execution_time=execution_time,
                timestamp=datetime.now(timezone.utc),
                rows_affected=rows_affected,
                success=success,
                error_message=error_message
            )
            self.metrics.append(metric)
            
            # Keep only last 1000 metrics
            if len(self.metrics) > 1000:
                self.metrics = self.metrics[-1000:]
            
            if execution_time > 1.0:  # Log slow queries
                logger.warning(f"Slow query detected: {execution_time:.2f}s - {query[:50]}...")
        
        return result
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get performance metrics for the connection pool."""
        if not self.metrics:
            return {'message': 'No metrics available'}
        
        total_queries = len(self.metrics)
        successful_queries = sum(1 for m in self.metrics if m.success)
        failed_queries = total_queries - successful_queries
        
        execution_times = [m.execution_time for m in self.metrics if m.success]
        avg_execution_time = sum(execution_times) / len(execution_times) if execution_times else 0
        max_execution_time = max(execution_times) if execution_times else 0
        
        return {
            'total_queries': total_queries,
            'successful_queries': successful_queries,
            'failed_queries': failed_queries,
            'success_rate': (successful_queries / total_queries * 100) if total_queries > 0 else 0,
            'average_execution_time': round(avg_execution_time, 4),
            'max_execution_time': round(max_execution_time, 4),
            'active_connections': self.active_connections,
            'pool_size': self.pool_size,
            'pool_utilization': (self.active_connections / self.pool_size * 100) if self.pool_size > 0 else 0
        }
    
    def close_all(self):
        """Close all connections in the pool."""
        while not self.pool.empty():
            try:
                conn = self.pool.get_nowait()
                conn.close()
            except Empty:
                break
            except Exception as e:
                logger.error(f"Error closing connection: {e}")
        
        logger.info("All connections closed")

class QueryOptimizer:
    """
    Query optimization and analysis tools.
    """
    
    def __init__(self, connection_pool: ConnectionPool):
        self.pool = connection_pool
        self.query_cache = {}
        self.cache_hits = 0
        self.cache_misses = 0
    
    def analyze_query(self, query: str) -> Dict[str, Any]:
        """Analyze a query for performance optimization opportunities."""
        try:
            with self.pool.get_connection() as conn:
                cursor = conn.cursor()
                
                # Get query plan
                explain_query = f"EXPLAIN QUERY PLAN {query}"
                cursor.execute(explain_query)
                query_plan = cursor.fetchall()
                
                analysis = {
                    'query': query,
                    'query_plan': [dict(row) for row in query_plan],
                    'recommendations': self._generate_recommendations(query_plan)
                }
                
                return analysis
                
        except Exception as e:
            logger.error(f"Query analysis error: {e}")
            return {'error': str(e)}
    
    def _generate_recommendations(self, query_plan: List) -> List[str]:
        """Generate optimization recommendations based on query plan."""
        recommendations = []
        
        for step in query_plan:
            detail = step.get('detail', '').lower() if hasattr(step, 'get') else str(step).lower()
            
            if 'scan' in detail and 'index' not in detail:
                recommendations.append("Consider adding an index to avoid full table scan")
            
            if 'temp b-tree' in detail:
                recommendations.append("Query uses temporary B-tree, consider optimizing ORDER BY or GROUP BY")
            
            if 'using temporary' in detail:
                recommendations.append("Query uses temporary table, consider query restructuring")
        
        if not recommendations:
            recommendations.append("Query appears to be well optimized")
        
        return recommendations
    
    def cached_query(self, cache_key: str, query: str, params: Tuple = (), fetch: str = 'none', ttl: int = 300):
        """Execute a query with caching support."""
        # Check cache first
        if cache_key in self.query_cache:
            cached_data, timestamp = self.query_cache[cache_key]
            if time.time() - timestamp < ttl:
                self.cache_hits += 1
                return cached_data
            else:
                # Remove expired cache entry
                del self.query_cache[cache_key]
        
        # Execute query
        self.cache_misses += 1
        result = self.pool.execute_query(query, params, fetch)
        
        # Cache the result
        self.query_cache[cache_key] = (result, time.time())
        
        # Limit cache size
        if len(self.query_cache) > 100:
            # Remove oldest entries
            oldest_keys = sorted(self.query_cache.keys(), 
                               key=lambda k: self.query_cache[k][1])[:20]
            for key in oldest_keys:
                del self.query_cache[key]
        
        return result
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache performance statistics."""
        total_requests = self.cache_hits + self.cache_misses
        hit_rate = (self.cache_hits / total_requests * 100) if total_requests > 0 else 0
        
        return {
            'cache_hits': self.cache_hits,
            'cache_misses': self.cache_misses,
            'hit_rate': round(hit_rate, 2),
            'cached_queries': len(self.query_cache)
        }

class DatabaseOptimizer:
    """
    Main database optimization class that coordinates all optimization features.
    """
    
    def __init__(self, database_path: str, pool_size: int = 10):
        self.database_path = database_path
        self.connection_pool = ConnectionPool(database_path, pool_size)
        self.query_optimizer = QueryOptimizer(self.connection_pool)
        self.indexes_created = set()
        
        # Ensure database directory exists
        os.makedirs(os.path.dirname(database_path) if os.path.dirname(database_path) else '.', exist_ok=True)
        
        # Initialize database optimizations
        self._initialize_optimizations()
        
        logger.info(f"Database optimizer initialized for {database_path}")
    
    def _initialize_optimizations(self):
        """Initialize database-level optimizations."""
        try:
            # Create common indexes for better performance
            self.create_index('users', 'username', unique=True)
            self.create_index('users', 'email', unique=True)
            self.create_index('user_progress', 'user_id')
            self.create_index('user_progress', 'created_at')
            
            # Analyze database for optimization opportunities
            self._analyze_database()
            
        except Exception as e:
            logger.error(f"Database optimization initialization error: {e}")
    
    def create_index(self, table: str, column: str, unique: bool = False) -> bool:
        """Create an index on a table column."""
        index_name = f"idx_{table}_{column}"
        
        if index_name in self.indexes_created:
            return True
        
        try:
            unique_clause = "UNIQUE" if unique else ""
            query = f"CREATE {unique_clause} INDEX IF NOT EXISTS {index_name} ON {table}({column})"
            
            self.connection_pool.execute_query(query)
            self.indexes_created.add(index_name)
            
            logger.info(f"Created index: {index_name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to create index {index_name}: {e}")
            return False
    
    def _analyze_database(self):
        """Analyze database structure and suggest optimizations."""
        try:
            # Get table information
            tables_query = "SELECT name FROM sqlite_master WHERE type='table'"
            tables = self.connection_pool.execute_query(tables_query, fetch='all')
            
            for table in tables:
                table_name = table['name']
                if not table_name.startswith('sqlite_'):
                    self._analyze_table(table_name)
                    
        except Exception as e:
            logger.error(f"Database analysis error: {e}")
    
    def _analyze_table(self, table_name: str):
        """Analyze a specific table for optimization opportunities."""
        try:
            # Get table info
            table_info_query = f"PRAGMA table_info({table_name})"
            columns = self.connection_pool.execute_query(table_info_query, fetch='all')
            
            # Get index info
            index_info_query = f"PRAGMA index_list({table_name})"
            indexes = self.connection_pool.execute_query(index_info_query, fetch='all')
            
            logger.info(f"Table {table_name}: {len(columns)} columns, {len(indexes)} indexes")
            
        except Exception as e:
            logger.error(f"Table analysis error for {table_name}: {e}")
    
    def optimize_database(self) -> Dict[str, Any]:
        """Run database optimization procedures."""
        optimization_results = {
            'vacuum_completed': False,
            'analyze_completed': False,
            'integrity_check': False,
            'optimization_time': 0
        }
        
        start_time = time.time()
        
        try:
            # Run VACUUM to reclaim space and defragment
            self.connection_pool.execute_query("VACUUM")
            optimization_results['vacuum_completed'] = True
            logger.info("Database VACUUM completed")
            
            # Run ANALYZE to update query planner statistics
            self.connection_pool.execute_query("ANALYZE")
            optimization_results['analyze_completed'] = True
            logger.info("Database ANALYZE completed")
            
            # Run integrity check
            integrity_result = self.connection_pool.execute_query("PRAGMA integrity_check", fetch='one')
            optimization_results['integrity_check'] = integrity_result['integrity_check'] == 'ok' if integrity_result else False
            
        except Exception as e:
            logger.error(f"Database optimization error: {e}")
            optimization_results['error'] = str(e)
        finally:
            optimization_results['optimization_time'] = round(time.time() - start_time, 2)
        
        return optimization_results
    
    def get_database_stats(self) -> Dict[str, Any]:
        """Get comprehensive database statistics."""
        try:
            stats = {
                'connection_pool': self.connection_pool.get_metrics(),
                'query_cache': self.query_optimizer.get_cache_stats(),
                'indexes_created': len(self.indexes_created),
                'database_size': self._get_database_size()
            }
            
            # Get table statistics
            tables_query = "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
            tables = self.connection_pool.execute_query(tables_query, fetch='all')
            
            table_stats = {}
            for table in tables:
                table_name = table['name']
                count_query = f"SELECT COUNT(*) as count FROM {table_name}"
                count_result = self.connection_pool.execute_query(count_query, fetch='one')
                table_stats[table_name] = count_result['count'] if count_result else 0
            
            stats['table_counts'] = table_stats
            
            return stats
            
        except Exception as e:
            logger.error(f"Database stats error: {e}")
            return {'error': str(e)}
    
    def _get_database_size(self) -> Dict[str, Any]:
        """Get database file size information."""
        try:
            if os.path.exists(self.database_path):
                size_bytes = os.path.getsize(self.database_path)
                size_mb = round(size_bytes / (1024 * 1024), 2)
                
                # Get page count and page size
                page_count_result = self.connection_pool.execute_query("PRAGMA page_count", fetch='one')
                page_size_result = self.connection_pool.execute_query("PRAGMA page_size", fetch='one')
                
                return {
                    'size_bytes': size_bytes,
                    'size_mb': size_mb,
                    'page_count': page_count_result['page_count'] if page_count_result else 0,
                    'page_size': page_size_result['page_size'] if page_size_result else 0
                }
            else:
                return {'error': 'Database file not found'}
                
        except Exception as e:
            logger.error(f"Database size calculation error: {e}")
            return {'error': str(e)}
    
    def close(self):
        """Close the database optimizer and all connections."""
        self.connection_pool.close_all()
        logger.info("Database optimizer closed")

def query_performance_monitor(func):
    """
    Decorator to monitor query performance.
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = func(*args, **kwargs)
            execution_time = time.time() - start_time
            
            if execution_time > 0.5:  # Log queries taking more than 500ms
                logger.warning(f"Slow query in {func.__name__}: {execution_time:.2f}s")
            
            return result
        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(f"Query error in {func.__name__} after {execution_time:.2f}s: {e}")
            raise
    
    return wrapper

# Global database optimizer instance
database_optimizer = None

def initialize_database_optimizer(database_path: str, pool_size: int = 10) -> DatabaseOptimizer:
    """Initialize the global database optimizer."""
    global database_optimizer
    database_optimizer = DatabaseOptimizer(database_path, pool_size)
    return database_optimizer

def get_database_optimizer() -> Optional[DatabaseOptimizer]:
    """Get the global database optimizer instance."""
    return database_optimizer

# Export key components
__all__ = [
    'DatabaseOptimizer',
    'ConnectionPool',
    'QueryOptimizer',
    'QueryMetrics',
    'query_performance_monitor',
    'initialize_database_optimizer',
    'get_database_optimizer'
]
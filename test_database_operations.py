#!/usr/bin/env python3
"""
Database Operations Test Script for Thesaurus AI Application
Tests database connectivity, CRUD operations, and data integrity
"""

import os
import sqlite3
import tempfile
import json
from datetime import datetime
from pathlib import Path

def test_database_creation():
    """Test database file creation and basic connectivity"""
    print("\n🔍 Testing Database Creation...")
    
    db_path = "quiz_test.db"
    
    try:
        # Create database connection
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Test basic query
        cursor.execute("SELECT sqlite_version()")
        version = cursor.fetchone()[0]
        
        print(f"✅ Database created successfully")
        print(f"   SQLite version: {version}")
        print(f"   Database path: {os.path.abspath(db_path)}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Database creation failed: {e}")
        return False

def test_table_creation():
    """Test creating tables with proper schema"""
    print("\n🔍 Testing Table Creation...")
    
    db_path = "quiz_test.db"
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Create users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create user_progress table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                content_type TEXT NOT NULL,
                content_id TEXT NOT NULL,
                status TEXT NOT NULL,
                progress_data TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                UNIQUE(user_id, content_type, content_id)
            )
        """)
        
        # Create quiz_results table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS quiz_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                quiz_id TEXT NOT NULL,
                score INTEGER NOT NULL,
                max_score INTEGER NOT NULL,
                answers TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)
        
        # Create analytics_events table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS analytics_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_type TEXT NOT NULL,
                user_id INTEGER,
                session_id TEXT,
                event_data TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)
        
        conn.commit()
        
        # Verify tables were created
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall()]
        
        expected_tables = ['users', 'user_progress', 'quiz_results', 'analytics_events']
        created_tables = [table for table in expected_tables if table in tables]
        
        print(f"✅ Tables created successfully: {', '.join(created_tables)}")
        print(f"   Total tables: {len(tables)}")
        
        conn.close()
        return len(created_tables) == len(expected_tables)
        
    except Exception as e:
        print(f"❌ Table creation failed: {e}")
        return False

def test_crud_operations():
    """Test Create, Read, Update, Delete operations"""
    print("\n🔍 Testing CRUD Operations...")
    
    db_path = "quiz_test.db"
    
    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row  # Enable column access by name
        cursor = conn.cursor()
        
        # CREATE - Insert test user
        cursor.execute("""
            INSERT INTO users (username, email, password_hash)
            VALUES (?, ?, ?)
        """, ('testuser', 'test@example.com', 'hashed_password_123'))
        
        user_id = cursor.lastrowid
        print(f"✅ CREATE: User created with ID {user_id}")
        
        # READ - Fetch the user
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        
        if user:
            print(f"✅ READ: User found - {user['username']} ({user['email']})")
        else:
            print("❌ READ: User not found")
            return False
        
        # UPDATE - Modify user email
        new_email = 'updated@example.com'
        cursor.execute("""
            UPDATE users SET email = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        """, (new_email, user_id))
        
        cursor.execute("SELECT email FROM users WHERE id = ?", (user_id,))
        updated_user = cursor.fetchone()
        
        if updated_user and updated_user['email'] == new_email:
            print(f"✅ UPDATE: User email updated to {new_email}")
        else:
            print("❌ UPDATE: Failed to update user email")
            return False
        
        # Test user progress CRUD
        cursor.execute("""
            INSERT INTO user_progress (user_id, content_type, content_id, status, progress_data)
            VALUES (?, ?, ?, ?, ?)
        """, (user_id, 'quiz', 'basic_thesaurus', 'completed', json.dumps({'score': 85, 'time_spent': 120})))
        
        progress_id = cursor.lastrowid
        print(f"✅ CREATE: User progress created with ID {progress_id}")
        
        # Test quiz results CRUD
        cursor.execute("""
            INSERT INTO quiz_results (user_id, quiz_id, score, max_score, answers)
            VALUES (?, ?, ?, ?, ?)
        """, (user_id, 'thesaurus_basics', 8, 10, json.dumps([{'q': 1, 'a': 'correct'}, {'q': 2, 'a': 'wrong'}])))
        
        quiz_result_id = cursor.lastrowid
        print(f"✅ CREATE: Quiz result created with ID {quiz_result_id}")
        
        # Test analytics events CRUD
        cursor.execute("""
            INSERT INTO analytics_events (event_type, user_id, session_id, event_data)
            VALUES (?, ?, ?, ?)
        """, ('page_view', user_id, 'session_123', json.dumps({'page': '/thesaurus', 'duration': 45})))
        
        event_id = cursor.lastrowid
        print(f"✅ CREATE: Analytics event created with ID {event_id}")
        
        # DELETE - Clean up test data
        cursor.execute("DELETE FROM analytics_events WHERE id = ?", (event_id,))
        cursor.execute("DELETE FROM quiz_results WHERE id = ?", (quiz_result_id,))
        cursor.execute("DELETE FROM user_progress WHERE id = ?", (progress_id,))
        cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
        
        print("✅ DELETE: Test data cleaned up successfully")
        
        conn.commit()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ CRUD operations failed: {e}")
        return False

def test_data_integrity():
    """Test foreign key constraints and data integrity"""
    print("\n🔍 Testing Data Integrity...")
    
    db_path = "quiz_test.db"
    
    try:
        conn = sqlite3.connect(db_path)
        conn.execute("PRAGMA foreign_keys = ON")  # Enable foreign key constraints
        cursor = conn.cursor()
        
        # Test foreign key constraint
        try:
            cursor.execute("""
                INSERT INTO user_progress (user_id, content_type, content_id, status)
                VALUES (?, ?, ?, ?)
            """, (99999, 'quiz', 'test', 'started'))  # Non-existent user_id
            
            conn.commit()
            print("❌ Foreign key constraint not enforced")
            return False
            
        except sqlite3.IntegrityError:
            print("✅ Foreign key constraint working correctly")
        
        # Test unique constraint
        cursor.execute("""
            INSERT INTO users (username, email, password_hash)
            VALUES (?, ?, ?)
        """, ('unique_test', 'unique@test.com', 'hash123'))
        
        try:
            cursor.execute("""
                INSERT INTO users (username, email, password_hash)
                VALUES (?, ?, ?)
            """, ('unique_test', 'different@test.com', 'hash456'))  # Duplicate username
            
            conn.commit()
            print("❌ Unique constraint not enforced")
            return False
            
        except sqlite3.IntegrityError:
            print("✅ Unique constraint working correctly")
        
        # Clean up
        cursor.execute("DELETE FROM users WHERE username = 'unique_test'")
        conn.commit()
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Data integrity test failed: {e}")
        return False

def test_database_performance():
    """Test database performance with bulk operations"""
    print("\n🔍 Testing Database Performance...")
    
    db_path = "quiz_test.db"
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Test bulk insert performance
        start_time = datetime.now()
        
        # Insert multiple analytics events
        events_data = [
            ('page_view', None, f'session_{i}', json.dumps({'page': f'/page_{i}', 'timestamp': datetime.now().isoformat()}))
            for i in range(100)
        ]
        
        cursor.executemany("""
            INSERT INTO analytics_events (event_type, user_id, session_id, event_data)
            VALUES (?, ?, ?, ?)
        """, events_data)
        
        conn.commit()
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        print(f"✅ Bulk insert performance: 100 records in {duration:.3f} seconds")
        
        # Test query performance
        start_time = datetime.now()
        
        cursor.execute("""
            SELECT event_type, COUNT(*) as count
            FROM analytics_events
            GROUP BY event_type
            ORDER BY count DESC
        """)
        
        results = cursor.fetchall()
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        print(f"✅ Query performance: Aggregation query in {duration:.3f} seconds")
        print(f"   Results: {len(results)} event types found")
        
        # Clean up test data
        cursor.execute("DELETE FROM analytics_events WHERE session_id LIKE 'session_%'")
        conn.commit()
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Performance test failed: {e}")
        return False

def test_database_backup_restore():
    """Test database backup and restore functionality"""
    print("\n🔍 Testing Database Backup/Restore...")
    
    db_path = "quiz_test.db"
    backup_path = "quiz_test_backup.db"
    
    try:
        # Create some test data
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO users (username, email, password_hash)
            VALUES (?, ?, ?)
        """, ('backup_test', 'backup@test.com', 'hash_backup'))
        
        user_id = cursor.lastrowid
        conn.commit()
        
        # Backup database
        backup_conn = sqlite3.connect(backup_path)
        conn.backup(backup_conn)
        backup_conn.close()
        
        print(f"✅ Database backup created: {backup_path}")
        
        # Verify backup by reading from it
        backup_conn = sqlite3.connect(backup_path)
        backup_cursor = backup_conn.cursor()
        
        backup_cursor.execute("SELECT username FROM users WHERE id = ?", (user_id,))
        backup_user = backup_cursor.fetchone()
        
        if backup_user and backup_user[0] == 'backup_test':
            print("✅ Backup verification successful")
        else:
            print("❌ Backup verification failed")
            return False
        
        backup_conn.close()
        
        # Clean up
        cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
        conn.commit()
        conn.close()
        
        # Remove backup file
        if os.path.exists(backup_path):
            os.remove(backup_path)
            print("✅ Backup file cleaned up")
        
        return True
        
    except Exception as e:
        print(f"❌ Backup/restore test failed: {e}")
        return False

def get_database_info():
    """Get comprehensive database information"""
    print("\n📊 Database Information:")
    
    db_path = "quiz_test.db"
    
    try:
        if os.path.exists(db_path):
            file_size = os.path.getsize(db_path)
            print(f"   📁 Database file size: {file_size:,} bytes ({file_size/1024:.2f} KB)")
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get SQLite version
        cursor.execute("SELECT sqlite_version()")
        version = cursor.fetchone()[0]
        print(f"   🔧 SQLite version: {version}")
        
        # Get table information
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        print(f"   📋 Tables: {len(tables)}")
        
        for table in tables:
            table_name = table[0]
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            count = cursor.fetchone()[0]
            print(f"      - {table_name}: {count} records")
        
        # Get database settings
        cursor.execute("PRAGMA foreign_keys")
        fk_status = cursor.fetchone()[0]
        print(f"   🔗 Foreign keys: {'Enabled' if fk_status else 'Disabled'}")
        
        cursor.execute("PRAGMA journal_mode")
        journal_mode = cursor.fetchone()[0]
        print(f"   📝 Journal mode: {journal_mode}")
        
        conn.close()
        
    except Exception as e:
        print(f"   ❌ Error getting database info: {e}")

def run_database_tests():
    """Run all database tests"""
    print("="*70)
    print("🗄️  DATABASE OPERATIONS TEST SUITE")
    print("="*70)
    print(f"🕐 Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    tests = [
        ("Database Creation", test_database_creation),
        ("Table Creation", test_table_creation),
        ("CRUD Operations", test_crud_operations),
        ("Data Integrity", test_data_integrity),
        ("Database Performance", test_database_performance),
        ("Backup/Restore", test_database_backup_restore)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        if test_func():
            passed += 1
    
    # Get database information
    get_database_info()
    
    print("\n" + "="*70)
    print("📊 DATABASE TEST RESULTS SUMMARY")
    print("="*70)
    print(f"✅ Passed: {passed}/{total} tests")
    print(f"❌ Failed: {total - passed}/{total} tests")
    
    if passed == total:
        print("🎉 ALL DATABASE TESTS PASSED! Database is fully functional.")
    else:
        print(f"⚠️  {total - passed} test(s) failed. Please review the issues above.")
    
    print(f"🕐 Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)
    
    return passed == total

if __name__ == "__main__":
    success = run_database_tests()
    exit(0 if success else 1)
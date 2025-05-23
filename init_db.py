#!/usr/bin/env python3
"""
Database initialization script.
Creates the necessary tables and initial data.
"""

import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Load environment variables
load_dotenv()

# Get database URL from environment variables
DATABASE_URL = os.environ.get('DATABASE_URL')

if not DATABASE_URL:
    print("Error: DATABASE_URL must be set in .env file")
    sys.exit(1)

# Create database engine
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

def init_database():
    """Initialize the database with necessary tables and data."""
    print("Initializing database...")
    
    # Create tables
    create_tables()
    
    # Add initial data
    add_initial_data()
    
    print("Database initialization completed successfully!")

def create_tables():
    """Create necessary database tables."""
    print("Creating tables...")
    
    # SQL for creating tables
    sql = """
    -- Create thesaurus table
    CREATE TABLE IF NOT EXISTS thesaurus (
        id SERIAL PRIMARY KEY,
        word TEXT UNIQUE NOT NULL,
        definition TEXT,
        synonyms TEXT[],
        antonyms TEXT[],
        examples TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create related_concepts table
    CREATE TABLE IF NOT EXISTS related_concepts (
        id SERIAL PRIMARY KEY,
        topic TEXT NOT NULL,
        concepts TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create learning_resources table
    CREATE TABLE IF NOT EXISTS learning_resources (
        id SERIAL PRIMARY KEY,
        topic TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        url TEXT,
        type TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    """
    
    try:
        # Execute SQL
        session.execute(text(sql))
        session.commit()
        print("Tables created successfully")
    except Exception as e:
        session.rollback()
        print(f"Error creating tables: {e}")
        sys.exit(1)

def add_initial_data():
    """Add initial data to the database."""
    print("Adding initial data...")
    
    # Sample thesaurus data
    thesaurus_data = [
        {
            'word': 'learning',
            'definition': 'The acquisition of knowledge or skills through study, experience, or being taught.',
            'synonyms': ['education', 'training', 'study', 'instruction', 'teaching'],
            'antonyms': ['ignorance', 'unlearning'],
            'examples': ['Machine learning is a subset of artificial intelligence.']
        },
        {
            'word': 'neural',
            'definition': 'Relating to a nerve or the nervous system.',
            'synonyms': ['nervous', 'neurological', 'cerebral'],
            'antonyms': [],
            'examples': ['Neural networks are inspired by the human brain.']
        }
    ]
    
    # Sample related concepts
    concepts_data = [
        {
            'topic': 'machine learning',
            'concepts': ['supervised learning', 'unsupervised learning', 'reinforcement learning', 'deep learning']
        },
        {
            'topic': 'neural networks',
            'concepts': ['artificial neural networks', 'deep neural networks', 'convolutional neural networks', 'recurrent neural networks']
        }
    ]
    
    # Sample learning resources
    resources_data = [
        {
            'topic': 'neural networks',
            'title': 'Introduction to Neural Networks',
            'description': 'A comprehensive guide to understanding neural networks and their applications.',
            'url': 'https://example.com/neural-networks',
            'type': 'tutorial'
        }
    ]
    
    try:
        # Insert thesaurus data
        for item in thesaurus_data:
            session.execute(
                text("""
                INSERT INTO thesaurus (word, definition, synonyms, antonyms, examples)
                VALUES (:word, :definition, :synonyms, :antonyms, :examples)
                ON CONFLICT (word) DO NOTHING
                """),
                item
            )
        
        # Insert related concepts
        for item in concepts_data:
            session.execute(
                text("""
                INSERT INTO related_concepts (topic, concepts)
                VALUES (:topic, :concepts)
                ON CONFLICT (topic) DO NOTHING
                """),
                item
            )
        
        # Insert learning resources
        for item in resources_data:
            session.execute(
                text("""
                INSERT INTO learning_resources (topic, title, description, url, type)
                VALUES (:topic, :title, :description, :url, :type)
                """),
                item
            )
        
        session.commit()
        print("Initial data added successfully")
    except Exception as e:
        session.rollback()
        print(f"Error adding initial data: {e}")
        sys.exit(1)

if __name__ == '__main__':
    init_database() 
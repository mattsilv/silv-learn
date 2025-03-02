# Lesson Data Structure

This directory contains JSON files that represent the lesson data for the microlearning platform.

## Database Schema

The JSON structure is designed to be easily migrated to a PostgreSQL database. Here's the proposed schema:

### Lessons Table

```sql
CREATE TABLE lessons (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);
```

### Learning Styles Table

```sql
CREATE TABLE learning_styles (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  style_type VARCHAR(50) NOT NULL, -- 'reading', 'listening', 'watching'
  content JSONB NOT NULL,
  UNIQUE(lesson_id, style_type)
);
```

### Quiz Questions Table

```sql
CREATE TABLE quiz_questions (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of options
  correct_answer_index INTEGER NOT NULL,
  explanation TEXT
);
```

## Current JSON Structure

The current JSON structure in `lessons.json` includes:

- Basic lesson information (id, slug, title, duration)
- Learning styles (reading, listening, watching) with their specific content
- Quiz questions with options, correct answers, and explanations
- Metadata including tags, difficulty level, and prerequisites

This structure allows for easy extension with additional lessons and learning styles in the future.

## Usage

The lesson data is loaded in the application using Next.js's `getStaticProps` function, which makes it available to the components at build time. In a production environment, this would be replaced with API calls to fetch data from a database.

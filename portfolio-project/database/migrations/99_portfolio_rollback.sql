-- ============================================
-- ROLLBACK SCRIPT - Migration 002 (Seed Data)
-- File: rollback_002.sql
-- ============================================

-- Remove sample blog post
DELETE FROM blog_translations WHERE blog_post_id = '750e8400-e29b-41d4-a716-446655440001';
DELETE FROM blog_posts WHERE id = '750e8400-e29b-41d4-a716-446655440001';

-- Remove translations
DELETE FROM translations;

-- Remove site config
DELETE FROM site_config;

-- Remove experiences
DELETE FROM experience_translations;
DELETE FROM experiences;

-- Remove skills
DELETE FROM skill_translations;
DELETE FROM skills;

-- Remove projects and related data
DELETE FROM project_images;
DELETE FROM project_technologies;
DELETE FROM project_translations;
DELETE FROM projects;

-- Remove technologies
DELETE FROM technologies;

-- Remove admin user
DELETE FROM users WHERE id = '550e8400-e29b-41d4-a716-446655440000';

SELECT 'Seed data rollback completed' AS status;

-- ============================================
-- ROLLBACK SCRIPT - Migration 001 (Initial Schema)
-- File: rollback_001.sql
-- ============================================

-- Drop views
DROP VIEW IF EXISTS v_featured_projects;
DROP VIEW IF EXISTS v_published_blogs;

-- Drop triggers
DROP TRIGGER IF EXISTS update_experience_translations_updated_at ON experience_translations;
DROP TRIGGER IF EXISTS update_project_translations_updated_at ON project_translations;
DROP TRIGGER IF EXISTS update_blog_translations_updated_at ON blog_translations;
DROP TRIGGER IF EXISTS update_experiences_updated_at ON experiences;
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS page_views CASCADE;
DROP TABLE IF EXISTS translations CASCADE;
DROP TABLE IF EXISTS site_config CASCADE;
DROP TABLE IF EXISTS github_repos CASCADE;
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS experience_translations CASCADE;
DROP TABLE IF EXISTS experiences CASCADE;
DROP TABLE IF EXISTS skill_translations CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS project_images CASCADE;
DROP TABLE IF EXISTS project_technologies CASCADE;
DROP TABLE IF EXISTS project_translations CASCADE;
DROP TABLE IF EXISTS technologies CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS blog_translations CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop extensions
DROP EXTENSION IF EXISTS pg_trgm;
DROP EXTENSION IF EXISTS "uuid-ossp";

SELECT 'Schema rollback completed' AS status;

-- ============================================
-- COMPLETE DATABASE RESET
-- File: reset_database.sql
-- WARNING: This will delete ALL data!
-- ============================================

-- Drop all tables including migration tracking
DROP TABLE IF EXISTS schema_migrations CASCADE;
DROP TABLE IF EXISTS page_views CASCADE;
DROP TABLE IF EXISTS translations CASCADE;
DROP TABLE IF EXISTS site_config CASCADE;
DROP TABLE IF EXISTS github_repos CASCADE;
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS experience_translations CASCADE;
DROP TABLE IF EXISTS experiences CASCADE;
DROP TABLE IF EXISTS skill_translations CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS project_images CASCADE;
DROP TABLE IF EXISTS project_technologies CASCADE;
DROP TABLE IF EXISTS project_translations CASCADE;
DROP TABLE IF EXISTS technologies CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS blog_translations CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop views
DROP VIEW IF EXISTS v_featured_projects CASCADE;
DROP VIEW IF EXISTS v_published_blogs CASCADE;

-- Drop functions and triggers
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop extensions
DROP EXTENSION IF EXISTS pg_trgm CASCADE;
DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;

SELECT 'Complete database reset completed - ready for fresh migration' AS status;

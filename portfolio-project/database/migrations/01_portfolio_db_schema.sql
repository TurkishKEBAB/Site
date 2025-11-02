-- ============================================
-- PORTFOLIO DATABASE SCHEMA
-- PostgreSQL 15+
-- ============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- ============================================
-- USERS TABLE (Admin)
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- ============================================
-- BLOG POSTS
-- ============================================
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    cover_image VARCHAR(500),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    views INTEGER DEFAULT 0,
    reading_time INTEGER, -- minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON blog_posts(published, published_at DESC);
CREATE INDEX idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_views ON blog_posts(views DESC);

-- Full-text search index
CREATE INDEX idx_blog_posts_search ON blog_posts USING gin(to_tsvector('english', title || ' ' || content));

-- ============================================
-- BLOG TRANSLATIONS
-- ============================================
CREATE TABLE blog_translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blog_post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    language VARCHAR(5) NOT NULL, -- tr, en, de, fr
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(blog_post_id, language)
);

CREATE INDEX idx_blog_translations_post ON blog_translations(blog_post_id);
CREATE INDEX idx_blog_translations_lang ON blog_translations(language);

-- ============================================
-- PROJECTS
-- ============================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    short_description TEXT,
    description TEXT NOT NULL,
    cover_image VARCHAR(500),
    github_url VARCHAR(500),
    demo_url VARCHAR(500),
    featured BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_featured ON projects(featured, display_order);
CREATE INDEX idx_projects_order ON projects(display_order);

-- ============================================
-- PROJECT TRANSLATIONS
-- ============================================
CREATE TABLE project_translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    language VARCHAR(5) NOT NULL,
    title VARCHAR(255) NOT NULL,
    short_description TEXT,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, language)
);

CREATE INDEX idx_project_translations_project ON project_translations(project_id);
CREATE INDEX idx_project_translations_lang ON project_translations(language);

-- ============================================
-- TECHNOLOGIES
-- ============================================
CREATE TABLE technologies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(500), -- URL or icon class
    category VARCHAR(50), -- language, framework, tool, cloud, database
    color VARCHAR(7), -- Hex color for UI
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_technologies_slug ON technologies(slug);
CREATE INDEX idx_technologies_category ON technologies(category);

-- ============================================
-- PROJECT - TECHNOLOGY (Many-to-Many)
-- ============================================
CREATE TABLE project_technologies (
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    technology_id UUID NOT NULL REFERENCES technologies(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, technology_id)
);

CREATE INDEX idx_project_technologies_project ON project_technologies(project_id);
CREATE INDEX idx_project_technologies_tech ON project_technologies(technology_id);

-- ============================================
-- PROJECT IMAGES (Gallery)
-- ============================================
CREATE TABLE project_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    caption TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_project_images_project ON project_images(project_id, display_order);

-- ============================================
-- SKILLS
-- ============================================
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- Programming, CS, Soft Skills, Languages
    proficiency INTEGER CHECK (proficiency >= 0 AND proficiency <= 100),
    icon VARCHAR(500),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_skills_category ON skills(category, display_order);

-- ============================================
-- SKILL TRANSLATIONS
-- ============================================
CREATE TABLE skill_translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    language VARCHAR(5) NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(skill_id, language)
);

CREATE INDEX idx_skill_translations_skill ON skill_translations(skill_id);
CREATE INDEX idx_skill_translations_lang ON skill_translations(language);

-- ============================================
-- EXPERIENCES (Education, Work, Activities)
-- ============================================
CREATE TABLE experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    organization VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    experience_type VARCHAR(50) NOT NULL, -- education, work, volunteer, activity
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_experiences_type ON experiences(experience_type, start_date DESC);
CREATE INDEX idx_experiences_current ON experiences(is_current);
CREATE INDEX idx_experiences_order ON experiences(display_order);

-- ============================================
-- EXPERIENCE TRANSLATIONS
-- ============================================
CREATE TABLE experience_translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
    language VARCHAR(5) NOT NULL,
    title VARCHAR(255) NOT NULL,
    organization VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(experience_id, language)
);

CREATE INDEX idx_experience_translations_exp ON experience_translations(experience_id);
CREATE INDEX idx_experience_translations_lang ON experience_translations(language);

-- ============================================
-- CONTACT MESSAGES
-- ============================================
CREATE TABLE contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_replied BOOLEAN DEFAULT FALSE,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contact_messages_read ON contact_messages(is_read, created_at DESC);
CREATE INDEX idx_contact_messages_email ON contact_messages(email);
CREATE INDEX idx_contact_messages_created ON contact_messages(created_at DESC);

-- ============================================
-- GITHUB REPOSITORIES CACHE
-- ============================================
CREATE TABLE github_repos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repo_name VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    description TEXT,
    url VARCHAR(500) NOT NULL,
    homepage VARCHAR(500),
    stars INTEGER DEFAULT 0,
    forks INTEGER DEFAULT 0,
    watchers INTEGER DEFAULT 0,
    language VARCHAR(50),
    topics TEXT[], -- Array of topics
    last_updated TIMESTAMP WITH TIME ZONE,
    cached_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_featured BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_github_repos_featured ON github_repos(is_featured, stars DESC);
CREATE INDEX idx_github_repos_stars ON github_repos(stars DESC);
CREATE INDEX idx_github_repos_cached ON github_repos(cached_at);

-- ============================================
-- SITE CONFIGURATION
-- ============================================
CREATE TABLE site_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_site_config_key ON site_config(key);

-- ============================================
-- TRANSLATIONS (UI Elements)
-- ============================================
CREATE TABLE translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    language VARCHAR(5) NOT NULL,
    translation_key VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(language, translation_key)
);

CREATE INDEX idx_translations_lang_key ON translations(language, translation_key);

-- ============================================
-- SITE ANALYTICS (Simple)
-- ============================================
CREATE TABLE page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_path VARCHAR(500) NOT NULL,
    referrer VARCHAR(500),
    ip_address INET,
    user_agent TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_page_views_path ON page_views(page_path, viewed_at DESC);
CREATE INDEX idx_page_views_date ON page_views(viewed_at DESC);

-- ============================================
-- TRIGGERS FOR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experiences_updated_at BEFORE UPDATE ON experiences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_translations_updated_at BEFORE UPDATE ON blog_translations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_translations_updated_at BEFORE UPDATE ON project_translations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experience_translations_updated_at BEFORE UPDATE ON experience_translations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- Published blogs with translations
CREATE VIEW v_published_blogs AS
SELECT 
    bp.id,
    bp.slug,
    bp.title as title_default,
    bp.cover_image,
    bp.published_at,
    bp.views,
    bp.reading_time,
    u.username as author,
    json_agg(
        json_build_object(
            'language', bt.language,
            'title', bt.title,
            'excerpt', bt.excerpt
        )
    ) as translations
FROM blog_posts bp
LEFT JOIN users u ON bp.author_id = u.id
LEFT JOIN blog_translations bt ON bp.id = bt.blog_post_id
WHERE bp.published = TRUE
GROUP BY bp.id, u.username
ORDER BY bp.published_at DESC;

-- Featured projects with technologies
CREATE VIEW v_featured_projects AS
SELECT 
    p.id,
    p.slug,
    p.title,
    p.short_description,
    p.cover_image,
    p.github_url,
    p.demo_url,
    array_agg(t.name) as technologies
FROM projects p
LEFT JOIN project_technologies pt ON p.id = pt.project_id
LEFT JOIN technologies t ON pt.technology_id = t.id
WHERE p.featured = TRUE
GROUP BY p.id
ORDER BY p.display_order;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE users IS 'Admin kullanıcılar (şu an sadece Yiğit)';
COMMENT ON TABLE blog_posts IS 'Blog yazıları (Markdown formatında)';
COMMENT ON TABLE blog_translations IS 'Blog yazılarının çevirileri (TR, EN, DE, FR)';
COMMENT ON TABLE projects IS 'Portfolio projeleri';
COMMENT ON TABLE technologies IS 'Teknoloji/tool listesi (Java, Python, Docker, etc.)';
COMMENT ON TABLE github_repos IS '24 saatlik cache ile GitHub repo bilgileri';
COMMENT ON TABLE translations IS 'UI elementleri için çeviriler (butonlar, başlıklar, etc.)';
COMMENT ON TABLE page_views IS 'Basit analytics - hangi sayfalar görüntüleniyor';

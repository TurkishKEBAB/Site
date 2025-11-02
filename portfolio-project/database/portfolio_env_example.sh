# ============================================
# PORTFOLIO ENVIRONMENT VARIABLES
# Copy this file to .env and fill in your values
# ============================================

# ============================================
# DATABASE CONFIGURATION
# ============================================
DB_HOST=localhost
DB_PORT=5432
DB_NAME=portfolio
DB_USER=postgres
DB_PASSWORD=your_secure_password_here

# Database connection string (alternative format)
DATABASE_URL=postgresql://postgres:your_secure_password_here@localhost:5432/portfolio

# ============================================
# SUPABASE CONFIGURATION (Production)
# ============================================
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# ============================================
# APPLICATION CONFIGURATION
# ============================================
APP_ENV=development  # development, staging, production
APP_DEBUG=true
APP_PORT=8000
APP_HOST=0.0.0.0

# Secret key for JWT tokens (generate with: openssl rand -hex 32)
SECRET_KEY=your_secret_key_here_generate_with_openssl
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080  # 7 days

# ============================================
# FRONTEND CONFIGURATION
# ============================================
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# ============================================
# GITHUB INTEGRATION
# ============================================
GITHUB_USERNAME=TurkishKEBAB
GITHUB_API_TOKEN=  # Optional, increases rate limit from 60 to 5000 req/hour
GITHUB_CACHE_HOURS=24

# ============================================
# EMAIL CONFIGURATION
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USE_TLS=true
SMTP_USERNAME=yigitokur@ieee.org
SMTP_PASSWORD=your_app_specific_password  # Gmail App Password
EMAIL_FROM=yigitokur@ieee.org
EMAIL_TO=yigitokur@ieee.org

# ============================================
# REDIS CONFIGURATION (Cache & Sessions)
# ============================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_URL=redis://localhost:6379/0

# ============================================
# FILE STORAGE
# ============================================
STORAGE_TYPE=local  # local, s3, supabase
STORAGE_PATH=./uploads

# AWS S3 Configuration (if using S3)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_S3_REGION=eu-central-1

# ============================================
# ANALYTICS & MONITORING
# ============================================
ENABLE_ANALYTICS=true
SENTRY_DSN=  # Optional error tracking

# ============================================
# RATE LIMITING
# ============================================
RATE_LIMIT_ENABLED=true
RATE_LIMIT_PER_MINUTE=60

# ============================================
# ADMIN CONFIGURATION
# ============================================
ADMIN_USERNAME=yigitokur
ADMIN_EMAIL=yigitokur@ieee.org
# Admin password will be set during first setup
# Generate hash with: python -c "from passlib.hash import bcrypt; print(bcrypt.hash('your_password'))"

# ============================================
# TRANSLATION SERVICE
# ============================================
AUTO_TRANSLATE=true
DEFAULT_LANGUAGE=tr
SUPPORTED_LANGUAGES=tr,en,de,fr

# ============================================
# LOGGING
# ============================================
LOG_LEVEL=INFO  # DEBUG, INFO, WARNING, ERROR, CRITICAL
LOG_FILE=./logs/app.log
LOG_MAX_BYTES=10485760  # 10MB
LOG_BACKUP_COUNT=5

# ============================================
# SECURITY
# ============================================
ALLOWED_HOSTS=localhost,127.0.0.1
HTTPS_ONLY=false  # Set to true in production
SECURE_COOKIES=false  # Set to true in production

# ============================================
# DEPLOYMENT (Railway/Render)
# ============================================
# These are automatically set by hosting platforms
# PORT=8000
# RAILWAY_STATIC_URL=
# RENDER_EXTERNAL_URL=

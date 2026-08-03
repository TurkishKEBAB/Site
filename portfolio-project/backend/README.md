# 🚀 Portfolio Backend API

FastAPI backend for Yiğit Okur's professional portfolio website.

## 📋 Features

- ✅ **Authentication**: JWT-based admin authentication
- ✅ **Blog System**: Multi-language blog posts with Markdown support
- ✅ **Project Showcase**: Portfolio projects with technologies and translations
- ✅ **Skills Management**: Proficiency-based skill tracking
- ✅ **Experience Timeline**: Education, work, and volunteer activities
- ✅ **Contact Form**: Database-backed admin inbox with optional SMTP notifications
- ✅ **GitHub Integration**: Cached repository data (24h cache)
- ✅ **Multi-language**: TR, EN, DE, FR support
- ✅ **File Upload**: Supabase Storage with image optimization
- ✅ **Caching**: Redis for improved performance
- ✅ **Rate Limiting**: Protection against abuse
- ✅ **Analytics**: Simple page view tracking

## 🛠️ Tech Stack

- **Framework**: FastAPI 0.104+
- **Database**: PostgreSQL 15+ with SQLAlchemy ORM
- **Cache**: Redis
- **Storage**: Supabase Storage
- **Email**: Optional SMTP (Gmail/SendGrid); admin inbox is always available
- **Authentication**: JWT with bcrypt
- **Validation**: Pydantic v2

## 📁 Project Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py               # Configuration and environment variables
│   ├── database.py             # Database connection and session management
│   ├── models/                 # SQLAlchemy ORM models
│   │   ├── user.py
│   │   ├── blog.py
│   │   ├── project.py
│   │   ├── skill.py
│   │   ├── experience.py
│   │   ├── contact.py
│   │   ├── github.py
│   │   ├── technology.py
│   │   └── site.py
│   ├── schemas/                # Pydantic request/response schemas
│   ├── crud/                   # Database CRUD operations
│   ├── api/                    # API route handlers
│   │   └── v1/                 # API version 1
│   │       ├── auth.py
│   │       ├── blog.py
│   │       ├── projects.py
│   │       ├── skills.py
│   │       ├── experiences.py
│   │       ├── contact.py
│   │       ├── github.py
│   │       └── translations.py
│   ├── services/               # Business logic services
│   │   ├── github_service.py   # GitHub API integration
│   │   ├── email_service.py    # SMTP email sending
│   │   ├── cache_service.py    # Redis caching
│   │   └── storage_service.py  # File upload to Supabase
│   └── utils/                  # Utility functions
│       ├── security.py         # JWT and password hashing
│       └── logger.py           # Logging configuration
├── tests/                      # Unit tests
├── logs/                       # Application logs
├── requirements.txt            # Python dependencies
├── .env.example                # Environment variables template
├── Dockerfile                  # Docker container configuration
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Redis
- (Optional) Supabase account for file storage

### 1. Clone and Setup

```bash
# Navigate to backend directory
cd portfolio-project/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1

# Windows CMD:
venv\Scripts\activate.bat

# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Database Setup

```bash
# Navigate to database directory
cd ../database

# Run database setup script (creates tables and seeds data)
# For PowerShell:
python portfolio_migration.py

# Or manually run migrations:
psql -U your_user -d portfolio < migrations/portfolio_db_schema.sql
psql -U your_user -d portfolio < migrations/portfolio_seed_data.sql
```

### 3. Environment Configuration

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
# Required variables:
# - DATABASE_URL
# - SECRET_KEY (generate with: openssl rand -hex 32)
# - (Optional) SMTP credentials for email notifications
# - REDIS_URL
# - (Optional) SUPABASE_URL and SUPABASE_KEY
```

Example `.env`:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/portfolio
SECRET_KEY=your-super-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080

GITHUB_USERNAME=TurkishKEBAB
GITHUB_API_TOKEN=

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=

REDIS_URL=redis://localhost:6379/0

SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_KEY=your-anon-key

FRONTEND_URL=http://localhost:3000

ENVIRONMENT=development
```

### 4. Run the Application

```bash
# Development mode (with auto-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or using Python directly
python -m app.main

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## 📚 API Endpoints

### Public Endpoints (No Authentication)

```http
GET  /api/v1/blog                    # List published blog posts
GET  /api/v1/blog/{slug}             # Get single blog post
GET  /api/v1/projects                # List projects
GET  /api/v1/projects/{slug}         # Get single project
GET  /api/v1/skills                  # List skills by category
GET  /api/v1/experiences             # List experiences
GET  /api/v1/github/repos            # Get cached GitHub repos
GET  /api/v1/translations/{lang}     # Get UI translations
POST /api/v1/contact                 # Submit contact form
GET  /api/v1/config                  # Get site configuration
```

### Admin Endpoints (Authentication Required)

```http
POST   /api/v1/auth/login            # Login and get JWT token
POST   /api/v1/auth/refresh          # Refresh access token

POST   /api/v1/blog                  # Create blog post
PUT    /api/v1/blog/{id}             # Update blog post
DELETE /api/v1/blog/{id}             # Delete blog post
PATCH  /api/v1/blog/{id}/publish     # Toggle publish status

POST   /api/v1/projects              # Create project
PUT    /api/v1/projects/{id}         # Update project
DELETE /api/v1/projects/{id}         # Delete project

POST   /api/v1/upload                # Upload file

GET    /api/v1/messages              # List contact messages
PATCH  /api/v1/messages/{id}         # Mark message as read

POST   /api/v1/github/refresh        # Force GitHub cache refresh
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### 1. Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "yigitokur@ieee.org",
  "password": "your-password"
}
```

Response:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 604800
}
```

### 2. Use Token

```http
GET /api/v1/messages
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

## 📧 Optional Email Configuration

### Gmail Setup

1. Enable 2-Factor Authentication in your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the app password in `.env`:

```env
SMTP_USERNAME=yigitokur@ieee.org
SMTP_PASSWORD=your-16-char-app-password
```

SMTP notifications are disabled by default. Contact submissions are always
available in the authenticated admin inbox; set `EMAIL_ENABLED=true` and
provide SMTP credentials only when outbound notifications are explicitly
desired.

## 🐳 Docker Deployment

```dockerfile
# Build image
docker build -t portfolio-api .

# Run container
docker run -p 8000:8000 --env-file .env portfolio-api
```

## 🚀 Production Deployment

### Railway/Render

1. Connect GitHub repository
2. Set environment variables in dashboard
3. Deploy automatically on push

Environment variables to set:
- `DATABASE_URL`
- `SECRET_KEY`
- `REDIS_URL`
- `SMTP_USERNAME` (optional)
- `SMTP_PASSWORD` (optional)
- `FRONTEND_URL`
- `ENVIRONMENT=production`

## 🧪 Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/test_blog.py
```

## 📝 Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## 🔧 Development

### Code Formatting

```bash
# Format code with black
black app/

# Sort imports
isort app/

# Lint with flake8
flake8 app/
```

### Generate Secret Key

```bash
# PowerShell
python -c "import secrets; print(secrets.token_hex(32))"

# Or use OpenSSL
openssl rand -hex 32
```

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:8000/health
```

Response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "development",
  "services": {
    "database": "connected",
    "cache": "connected"
  }
}
```

### Logs

Logs are stored in `logs/` directory:
- `logs/app.log` - All application logs
- `logs/error.log` - Error-level logs only

## 🤝 Contributing

This is a personal portfolio project, but suggestions are welcome!

## 📄 License

© 2025 Yiğit Okur. All rights reserved.

## 📬 Contact

- **Email**: yigitokur@ieee.org
- **LinkedIn**: https://www.linkedin.com/in/yiğit-okur-050b5b278
- **GitHub**: https://github.com/TurkishKEBAB

---

Built with ❤️ by Yiğit Okur

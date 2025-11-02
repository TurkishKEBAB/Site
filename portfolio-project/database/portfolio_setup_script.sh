#!/bin/bash

# ============================================
# Portfolio Database Setup Script
# ============================================

set -e  # Exit on error

echo "================================================"
echo "  Portfolio Database Setup"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠ .env file not found!${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
    echo -e "${YELLOW}⚠ Please edit .env file with your database credentials${NC}"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

echo "Configuration:"
echo "  Database: $DB_NAME"
echo "  Host: $DB_HOST:$DB_PORT"
echo "  User: $DB_USER"
echo ""

# Function to check if PostgreSQL is running
check_postgres() {
    echo "Checking PostgreSQL connection..."
    if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c '\q' 2>/dev/null; then
        echo -e "${GREEN}✓ PostgreSQL is running${NC}"
        return 0
    else
        echo -e "${RED}✗ Cannot connect to PostgreSQL${NC}"
        echo "Please ensure PostgreSQL is running and credentials are correct"
        return 1
    fi
}

# Function to create database if it doesn't exist
create_database() {
    echo ""
    echo "Checking if database '$DB_NAME' exists..."
    
    if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
        echo -e "${YELLOW}⊙ Database '$DB_NAME' already exists${NC}"
        read -p "Do you want to reset the database? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "Resetting database..."
            PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migrations/reset_database.sql
            echo -e "${GREEN}✓ Database reset${NC}"
        fi
    else
        echo "Creating database '$DB_NAME'..."
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;"
        echo -e "${GREEN}✓ Database created${NC}"
    fi
}

# Function to run migrations
run_migrations() {
    echo ""
    echo "Running database migrations..."
    
    # Check if Python is installed
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}✗ Python 3 is not installed${NC}"
        exit 1
    fi
    
    # Check if required Python packages are installed
    if ! python3 -c "import psycopg2" 2>/dev/null; then
        echo "Installing required Python packages..."
        pip3 install psycopg2-binary
    fi
    
    # Run migration script
    python3 migrate.py
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Migrations completed successfully${NC}"
    else
        echo -e "${RED}✗ Migration failed${NC}"
        exit 1
    fi
}

# Function to verify setup
verify_setup() {
    echo ""
    echo "Verifying database setup..."
    
    # Check tables
    TABLE_COUNT=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
    
    echo "  Tables created: $TABLE_COUNT"
    
    if [ $TABLE_COUNT -gt 0 ]; then
        echo -e "${GREEN}✓ Database setup verified${NC}"
    else
        echo -e "${RED}✗ No tables found${NC}"
        exit 1
    fi
}

# Function to create admin user
create_admin() {
    echo ""
    echo "Creating admin user..."
    
    read -p "Enter admin password: " -s ADMIN_PASSWORD
    echo ""
    
    # Generate password hash using Python
    HASHED_PASSWORD=$(python3 -c "from passlib.hash import bcrypt; print(bcrypt.hash('$ADMIN_PASSWORD'))")
    
    # Update admin password
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "UPDATE users SET password_hash = '$HASHED_PASSWORD' WHERE username = 'yigitokur';"
    
    echo -e "${GREEN}✓ Admin password set${NC}"
}

# Main execution
main() {
    # Check PostgreSQL connection
    if ! check_postgres; then
        exit 1
    fi
    
    # Create database
    create_database
    
    # Run migrations
    run_migrations
    
    # Verify setup
    verify_setup
    
    # Optionally create admin user
    read -p "Do you want to set admin password now? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        create_admin
    fi
    
    echo ""
    echo "================================================"
    echo -e "${GREEN}✓ Database setup completed successfully!${NC}"
    echo "================================================"
    echo ""
    echo "Next steps:"
    echo "  1. Start the backend: cd backend && python3 main.py"
    echo "  2. Start the frontend: cd frontend && npm run dev"
    echo ""
    echo "Admin credentials:"
    echo "  Username: yigitokur"
    echo "  Email: yigitokur@ieee.org"
    echo ""
}

# Run main function
main

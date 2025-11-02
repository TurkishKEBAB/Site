"""
Database Migration Script for Portfolio
Handles schema creation, updates, and rollbacks
"""
import psycopg2
from psycopg2 import sql
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseMigration:
    def __init__(self, db_config):
        """
        Initialize database connection
        db_config: dict with keys: host, port, database, user, password
        """
        self.config = db_config
        self.conn = None
        self.cursor = None
        
    def connect(self):
        """Establish database connection"""
        try:
            self.conn = psycopg2.connect(
                host=self.config['host'],
                port=self.config['port'],
                database=self.config['database'],
                user=self.config['user'],
                password=self.config['password']
            )
            self.conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            self.cursor = self.conn.cursor()
            logger.info("✓ Database connection established")
            return True
        except Exception as e:
            logger.error(f"✗ Database connection failed: {e}")
            return False
    
    def disconnect(self):
        """Close database connection"""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
        logger.info("✓ Database connection closed")
    
    def execute_sql_file(self, filepath):
        """Execute SQL from file"""
        try:
            with open(filepath, 'r', encoding='utf-8') as file:
                sql_commands = file.read()
                self.cursor.execute(sql_commands)
                logger.info(f"✓ Executed SQL file: {filepath}")
                return True
        except Exception as e:
            logger.error(f"✗ Failed to execute {filepath}: {e}")
            return False
    
    def create_migration_table(self):
        """Create migrations tracking table"""
        sql_query = """
        CREATE TABLE IF NOT EXISTS schema_migrations (
            id SERIAL PRIMARY KEY,
            version VARCHAR(50) UNIQUE NOT NULL,
            description TEXT,
            executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            execution_time_ms INTEGER
        );
        """
        try:
            self.cursor.execute(sql_query)
            logger.info("✓ Migration tracking table ready")
            return True
        except Exception as e:
            logger.error(f"✗ Failed to create migration table: {e}")
            return False
    
    def check_migration_exists(self, version):
        """Check if migration already executed"""
        sql_query = "SELECT COUNT(*) FROM schema_migrations WHERE version = %s"
        self.cursor.execute(sql_query, (version,))
        count = self.cursor.fetchone()[0]
        return count > 0
    
    def record_migration(self, version, description, execution_time_ms):
        """Record successful migration"""
        sql_query = """
        INSERT INTO schema_migrations (version, description, execution_time_ms)
        VALUES (%s, %s, %s)
        """
        self.cursor.execute(sql_query, (version, description, execution_time_ms))
        logger.info(f"✓ Migration {version} recorded")
    
    def run_migration(self, version, description, sql_file):
        """Run a single migration"""
        if self.check_migration_exists(version):
            logger.info(f"⊙ Migration {version} already applied, skipping")
            return True
        
        logger.info(f"→ Running migration {version}: {description}")
        start_time = datetime.now()
        
        success = self.execute_sql_file(sql_file)
        
        if success:
            end_time = datetime.now()
            execution_time = int((end_time - start_time).total_seconds() * 1000)
            self.record_migration(version, description, execution_time)
            logger.info(f"✓ Migration {version} completed in {execution_time}ms")
        else:
            logger.error(f"✗ Migration {version} failed")
        
        return success
    
    def run_all_migrations(self):
        """Execute all pending migrations in order"""
        migrations = [
            {
                'version': '001',
                'description': 'Initial schema creation',
                'file': 'migrations/001_initial_schema.sql'
            },
            {
                'version': '002',
                'description': 'Seed initial data',
                'file': 'migrations/002_seed_data.sql'
            }
        ]
        
        logger.info("=" * 50)
        logger.info("Starting database migration")
        logger.info("=" * 50)
        
        for migration in migrations:
            success = self.run_migration(
                migration['version'],
                migration['description'],
                migration['file']
            )
            if not success:
                logger.error("Migration failed, stopping")
                return False
        
        logger.info("=" * 50)
        logger.info("All migrations completed successfully!")
        logger.info("=" * 50)
        return True
    
    def rollback_migration(self, version):
        """Rollback a specific migration (if rollback file exists)"""
        rollback_file = f'migrations/rollback_{version}.sql'
        
        if not os.path.exists(rollback_file):
            logger.error(f"Rollback file not found: {rollback_file}")
            return False
        
        logger.info(f"→ Rolling back migration {version}")
        success = self.execute_sql_file(rollback_file)
        
        if success:
            # Remove from migration tracking
            sql_query = "DELETE FROM schema_migrations WHERE version = %s"
            self.cursor.execute(sql_query, (version,))
            logger.info(f"✓ Migration {version} rolled back")
        
        return success
    
    def get_migration_status(self):
        """Get list of applied migrations"""
        sql_query = """
        SELECT version, description, executed_at, execution_time_ms
        FROM schema_migrations
        ORDER BY executed_at DESC
        """
        self.cursor.execute(sql_query)
        results = self.cursor.fetchall()
        
        if results:
            logger.info("\nApplied Migrations:")
            logger.info("-" * 80)
            for row in results:
                logger.info(f"  {row[0]} | {row[1]} | {row[2]} | {row[3]}ms")
            logger.info("-" * 80)
        else:
            logger.info("No migrations applied yet")
        
        return results
    
    def verify_database(self):
        """Verify database structure"""
        logger.info("\nVerifying database structure...")
        
        checks = [
            ("Users table", "SELECT COUNT(*) FROM users"),
            ("Technologies", "SELECT COUNT(*) FROM technologies"),
            ("Projects", "SELECT COUNT(*) FROM projects"),
            ("Skills", "SELECT COUNT(*) FROM skills"),
            ("Blog posts", "SELECT COUNT(*) FROM blog_posts"),
            ("Translations", "SELECT COUNT(*) FROM translations"),
        ]
        
        for name, query in checks:
            try:
                self.cursor.execute(query)
                count = self.cursor.fetchone()[0]
                logger.info(f"  ✓ {name}: {count} records")
            except Exception as e:
                logger.error(f"  ✗ {name}: {e}")
                return False
        
        return True


def main():
    """Main migration script"""
    
    # Database configuration from environment variables
    db_config = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'port': os.getenv('DB_PORT', '5432'),
        'database': os.getenv('DB_NAME', 'portfolio'),
        'user': os.getenv('DB_USER', 'postgres'),
        'password': os.getenv('DB_PASSWORD', 'postgres')
    }
    
    # Create migration instance
    migration = DatabaseMigration(db_config)
    
    # Connect to database
    if not migration.connect():
        return
    
    # Create migration tracking table
    migration.create_migration_table()
    
    # Check migration status
    migration.get_migration_status()
    
    # Run all pending migrations
    success = migration.run_all_migrations()
    
    if success:
        # Verify database
        migration.verify_database()
    
    # Disconnect
    migration.disconnect()


if __name__ == "__main__":
    main()

#!/bin/bash

# Load environment variables
source .env

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="verceldb"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Database backup
echo "Starting database backup..."
pg_dump "$DATABASE_URL" > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

# Compress backup
echo "Compressing backup..."
gzip "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

# Upload to cloud storage (example with AWS S3)
if [ -n "$AWS_BUCKET_NAME" ]; then
  echo "Uploading to S3..."
  aws s3 cp "$BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz" "s3://$AWS_BUCKET_NAME/backups/"
fi

# Cleanup old backups (keep last 7 days)
find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed successfully!"

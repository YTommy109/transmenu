#!/bin/sh
# データベース削除スクリプト

set -e

DB_NAME="transmenu"
DB_USER="webapp"

echo "Dropping database..."
psql -U postgres -c "DROP DATABASE IF EXISTS ${DB_NAME};"

echo "Dropping user..."
psql -U postgres -c "DROP USER IF EXISTS ${DB_USER};"

echo "Database cleanup completed!"

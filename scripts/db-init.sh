#!/bin/sh
# データベース初期化スクリプト

set -e

DB_NAME="transmenu"
DB_USER="webapp"
DB_PASSWORD="webapp"

echo "Creating database user..."
psql -U postgres -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';" || echo "User already exists"

echo "Creating database..."
psql -U postgres -c "CREATE DATABASE ${DB_NAME};" || echo "Database already exists"

echo "Granting privileges..."
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"
psql -U postgres -c "GRANT CREATE ON DATABASE ${DB_NAME} TO ${DB_USER};"
psql -U postgres -d "${DB_NAME}" -c "GRANT ALL ON SCHEMA public TO ${DB_USER};"
psql -U postgres -d "${DB_NAME}" -c "GRANT CREATE ON SCHEMA public TO ${DB_USER};"

echo "Database initialization completed!"

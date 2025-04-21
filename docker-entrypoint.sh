#!/bin/sh
set -e

echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h postgres -p 5432 -U postgres; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is up - executing database migrations"

npm run db:push

if [ "$NODE_ENV" = "production" ]; then
  echo "Starting in production mode"
  npm run start
else
  echo "Starting in development mode"
  npm run dev
fi

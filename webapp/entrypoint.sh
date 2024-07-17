#!/bin/sh

# Wait for PostgreSQL to be ready
until npx prisma db push; do
  echo "Waiting for PostgreSQL to be ready..."
  sleep 2
done

# Start the application
npm start
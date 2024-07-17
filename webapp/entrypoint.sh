#!/bin/sh

# Generate Prisma client
npx prisma generate

# Wait for PostgreSQL to be ready
until npx prisma db push; do
  echo "Waiting for PostgreSQL to be ready..."
  sleep 2
done

# Start the application
npm start
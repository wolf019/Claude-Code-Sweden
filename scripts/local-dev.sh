#!/bin/bash
set -e

echo "Starting local development server..."

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Warning: .env file not found"
  echo "Creating .env from .env.example..."
  if [ -f .env.example ]; then
    cp .env.example .env
    echo "Created .env file. Please update it with your settings."
  else
    echo "No .env.example found. Using default settings."
  fi
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  npm install
fi

# Start with nodemon for hot reload
echo ""
echo "Starting server with hot reload..."
echo "Server will be available at http://localhost:8080"
echo ""
npm run dev

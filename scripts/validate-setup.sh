#!/bin/bash

# Phase 0 Setup Validation Script
# This script validates that the Zyra development environment is correctly set up

set -e

echo "🔧 Zyra Phase 0 Setup Validation"
echo "================================="

# Check for required tools
echo "📋 Checking required tools..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    exit 1
fi

echo "✅ All required tools are installed"

# Check Node.js version
NODE_VERSION=$(node --version)
echo "📦 Node.js version: $NODE_VERSION"

# Check pnpm version
PNPM_VERSION=$(pnpm --version)
echo "📦 pnpm version: $PNPM_VERSION"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --no-frozen-lockfile

# Type checking
echo "🔍 Running type checks..."
echo "  - Backend TypeScript check..."
cd apps/backend && pnpm type-check && cd ../..

echo "  - Frontend TypeScript check..."
cd apps/frontend && pnpm type-check && cd ../..

# Linting
echo "🧹 Running linting..."
echo "  - Frontend linting..."
cd apps/frontend && pnpm lint && cd ../..

# Build tests
echo "🏗️  Testing builds..."
echo "  - Frontend build..."
cd apps/frontend && pnpm build && cd ../..

# Docker services
echo "🐳 Checking Docker services..."
if ! docker compose ps | grep -q "postgres.*healthy"; then
    echo "⚠️  PostgreSQL service not running. Start with: make dev-up"
else
    echo "✅ PostgreSQL service is healthy"
fi

if ! docker compose ps | grep -q "redis.*healthy"; then
    echo "⚠️  Redis service not running. Start with: make dev-up"
else
    echo "✅ Redis service is healthy"
fi

if ! docker compose ps | grep -q "minio.*Up"; then
    echo "⚠️  MinIO service not running. Start with: make dev-up"
else
    echo "✅ MinIO service is running"
fi

echo ""
echo "🎉 Phase 0 validation complete!"
echo ""
echo "Next steps:"
echo "1. Start services: make dev-up"
echo "2. Run migrations: make db-migrate"
echo "3. Seed database: make db-seed"
echo "4. Start development: pnpm dev"
echo ""
echo "Then visit:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:3001"
echo "- API Docs: http://localhost:3001/api/docs"
echo "- MinIO Console: http://localhost:9001"
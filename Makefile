.PHONY: help install dev-up dev-down db-migrate db-seed db-studio clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	pnpm install

dev-up: ## Start development environment
	cp .env.example .env
	docker-compose up -d postgres redis minio
	@echo "Waiting for services to be ready..."
	@sleep 10
	pnpm db:migrate
	pnpm db:seed
	@echo "Development environment is ready!"
	@echo "You can now run 'pnpm dev' to start the applications"

dev-down: ## Stop development environment
	docker-compose down

dev-full: ## Start full development environment with all services
	cp .env.example .env
	docker-compose up

db-migrate: ## Run database migrations
	cd apps/backend && pnpm db:migrate

db-seed: ## Seed database with demo data
	cd apps/backend && pnpm db:seed

db-studio: ## Open Prisma Studio
	cd apps/backend && pnpm db:studio

clean: ## Clean up containers and volumes
	docker-compose down -v
	docker system prune -f

logs: ## Show logs from all services
	docker-compose logs -f

test: ## Run all tests
	pnpm test

lint: ## Run linting
	pnpm lint

format: ## Format code
	pnpm format

build: ## Build all applications
	pnpm build
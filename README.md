# Zyra

A modern, multi-tenant SaaS project management system built with Next.js, NestJS, and PostgreSQL.

## Overview

Zyra is a comprehensive project management platform designed for teams to manage projects, track time, handle expenses, and collaborate effectively. The system features a multi-tenant architecture ensuring complete data isolation between organizations.

## Features

### Phase 0 (Current - MVP Skeleton)
- ✅ **Multi-tenant Architecture**: Complete organization-level data isolation
- ✅ **Authentication & Authorization**: JWT-based auth with role-based access control
- ✅ **User Management**: Organization registration and user management
- ✅ **Health Monitoring**: System health checks and monitoring endpoints
- ✅ **Modern Stack**: Next.js 14, NestJS, Prisma, PostgreSQL, Redis, MinIO

### Planned Features (Future Phases)
- **Project Management**: Create and manage projects with tasks, deadlines, and budgets
- **Time Tracking**: Built-in timesheet functionality with billable hours tracking
- **Expense Management**: Track and categorize project expenses
- **Invoice Generation**: Automated PDF invoice generation and management
- **File Management**: Secure file uploads and sharing with S3-compatible storage
- **Team Collaboration**: Comments, notifications, and activity feeds
- **Reporting & Analytics**: Comprehensive project and financial reports

## Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** + **shadcn/ui** for styling
- **React Query** for data fetching and caching
- **React Hook Form** + **Zod** for form handling and validation

### Backend
- **NestJS** with TypeScript
- **Prisma ORM** with PostgreSQL
- **JWT Authentication** with role-based access control
- **Swagger/OpenAPI** documentation
- **Multi-tenant architecture** with organization-level isolation

### Infrastructure
- **PostgreSQL** for primary database
- **Redis** for caching and sessions
- **MinIO** for S3-compatible object storage
- **Docker Compose** for development environment

### Development Tools
- **ESLint** + **Prettier** for code quality
- **Husky** for git hooks
- **Playwright** for E2E testing
- **Jest** for unit testing

## Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm 8+
- Docker and Docker Compose

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd zyra
   ```

2. **Install dependencies**
   ```bash
   make install
   # or
   pnpm install
   ```

3. **Start development environment**
   ```bash
   make dev-up
   ```
   This will:
   - Start PostgreSQL, Redis, and MinIO containers
   - Run database migrations
   - Seed the database with demo data

4. **Start the applications**
   ```bash
   # Start both frontend and backend
   pnpm dev
   
   # Or start individually
   pnpm --filter @zyra/backend dev
   pnpm --filter @zyra/frontend dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Documentation: http://localhost:3001/api/docs
   - MinIO Console: http://localhost:9001

### Demo Credentials

The system comes with pre-seeded demo data:

**Demo Organization**: Demo Organization
- **Admin User**: admin@demo.com / password123
- **Manager User**: manager@demo.com / password123  
- **Team Member**: team@demo.com / password123

### Available Commands

```bash
# Development
make dev-up          # Start development services
make dev-down        # Stop development services
make dev-full        # Start full environment with auto-reload

# Database
make db-migrate      # Run database migrations
make db-seed         # Seed database with demo data
make db-studio       # Open Prisma Studio

# Maintenance
make clean           # Clean up containers and volumes
make logs            # Show service logs

# Code Quality
make lint            # Run linting
make format          # Format code
make test            # Run tests
```

## Project Structure

```
zyra/
├── apps/
│   ├── backend/           # NestJS API
│   │   ├── src/
│   │   │   ├── auth/      # Authentication module
│   │   │   ├── common/    # Shared utilities
│   │   │   ├── organizations/ # Organization management
│   │   │   └── users/     # User management
│   │   └── prisma/        # Database schema and migrations
│   └── frontend/          # Next.js application
│       ├── src/
│       │   ├── app/       # App Router pages
│       │   ├── components/ # Reusable components
│       │   ├── hooks/     # Custom hooks
│       │   └── lib/       # Utilities and API client
│       └── tests/         # E2E tests
├── packages/
│   ├── ui/               # Shared UI components
│   └── config/           # Shared configuration
├── docker-compose.yml    # Development services
├── Makefile             # Development commands
└── README.md           # This file
```

## API Documentation

The backend API is fully documented with Swagger/OpenAPI. After starting the backend, visit:
http://localhost:3001/api/docs

### Key Endpoints

- `POST /api/v1/auth/register` - Register new organization
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/org` - Get current organization
- `GET /api/v1/users` - List organization users
- `GET /api/v1/health` - Health check

## Multi-Tenant Architecture

Zyra implements a multi-tenant architecture with the following key principles:

1. **Data Isolation**: All data is scoped to an organization ID
2. **Authentication**: JWT tokens contain organization context
3. **Authorization**: All API endpoints enforce organization-level access control
4. **Database Design**: All tables include `organization_id` foreign key

## Testing

### Unit Tests
```bash
pnpm test
```

### E2E Tests
```bash
pnpm test:e2e
```

The E2E tests cover:
- User authentication flow
- Organization registration
- Dashboard access
- Route protection

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database
DATABASE_URL="postgresql://zyra:zyra_password@localhost:5432/zyra"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Redis
REDIS_URL="redis://localhost:6379"

# MinIO/S3
S3_ENDPOINT="http://localhost:9000"
S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="minioadmin"

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
```

## Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** using Argon2
- **Input Validation** with class-validator and Zod
- **CORS Protection** with configurable origins
- **SQL Injection Protection** via Prisma ORM
- **Multi-tenant Data Isolation** at the application level

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Ensure all tests pass
6. Submit a pull request

## Development Workflow

1. **Feature Development**: Create feature branches from main
2. **Code Quality**: Pre-commit hooks ensure code formatting and linting
3. **Testing**: All changes require passing tests
4. **Review**: Pull requests require code review
5. **Deployment**: Continuous integration handles deployment

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

---

Built with ❤️ using modern web technologies
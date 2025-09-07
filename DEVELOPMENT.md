# Development Guide

This guide provides detailed information for developers working on the Zyra project.

## Architecture Overview

### Monorepo Structure

```
zyra/
├── apps/
│   ├── backend/           # NestJS API server
│   └── frontend/          # Next.js web application
├── packages/
│   ├── ui/               # Shared UI components
│   └── config/           # Shared configuration
├── scripts/              # Development scripts
└── .github/              # CI/CD workflows
```

### Technology Stack

**Frontend:**
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS + shadcn/ui for styling
- React Query for server state management
- React Hook Form + Zod for forms
- Playwright for E2E testing

**Backend:**
- NestJS with TypeScript
- Prisma ORM with PostgreSQL
- JWT authentication
- Swagger/OpenAPI documentation
- Jest for unit testing

**Infrastructure:**
- Docker Compose for development
- PostgreSQL for database
- Redis for caching
- MinIO for object storage

## Development Workflow

### Initial Setup

1. **Prerequisites**
   ```bash
   # Required tools
   node --version    # v18 or higher
   pnpm --version    # v8 or higher
   docker --version  # Latest stable
   ```

2. **Clone and setup**
   ```bash
   git clone <repo-url>
   cd zyra
   pnpm install
   ```

3. **Start development environment**
   ```bash
   make dev-up
   ```

4. **Validate setup**
   ```bash
   ./scripts/validate-setup.sh
   ```

### Daily Development

1. **Start services**
   ```bash
   make dev-up     # Start database services
   pnpm dev        # Start frontend and backend
   ```

2. **Run specific commands**
   ```bash
   # Database operations
   make db-migrate  # Run migrations
   make db-seed     # Seed with demo data
   make db-studio   # Open Prisma Studio

   # Code quality
   pnpm lint        # Run linting
   pnpm format      # Format code
   pnpm type-check  # TypeScript checking

   # Testing
   pnpm test        # Run unit tests
   pnpm test:e2e    # Run E2E tests
   ```

3. **Stop services**
   ```bash
   make dev-down    # Stop services
   make clean       # Clean up completely
   ```

### Code Standards

**TypeScript:**
- Strict mode enabled
- Prefer explicit types over `any`
- Use proper error handling
- Follow naming conventions

**React/Next.js:**
- Use App Router patterns
- Prefer server components when possible
- Implement proper error boundaries
- Follow accessibility guidelines

**NestJS:**
- Use decorators for validation
- Implement proper exception handling
- Follow module organization
- Use dependency injection

**Database:**
- All queries must be tenant-aware
- Use Prisma migrations
- Include proper indexes
- Follow naming conventions

### Multi-Tenant Guidelines

**Critical Requirements:**
1. Every database query MUST include `organizationId` filter
2. JWT tokens MUST contain organization context
3. API endpoints MUST validate organization access
4. Never expose cross-tenant data

**Implementation Pattern:**
```typescript
// ✅ Correct - Always filter by organization
const projects = await prisma.project.findMany({
  where: {
    organizationId: user.organizationId,
    // ... other filters
  }
});

// ❌ Wrong - Missing organization filter
const projects = await prisma.project.findMany({
  where: {
    status: 'active'
  }
});
```

### Testing Strategy

**Unit Tests:**
- Test business logic
- Mock external dependencies
- Focus on edge cases
- Maintain high coverage

**Integration Tests:**
- Test API endpoints
- Verify database operations
- Test multi-tenant isolation
- Use test database

**E2E Tests:**
- Test complete user workflows
- Verify authentication flow
- Test critical business processes
- Run against production-like environment

### Security Checklist

**Authentication:**
- [ ] JWT tokens properly validated
- [ ] Passwords hashed with Argon2
- [ ] Session management secure
- [ ] Rate limiting implemented

**Authorization:**
- [ ] Role-based access control
- [ ] Organization-level isolation
- [ ] API endpoint protection
- [ ] File access validation

**Data Protection:**
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection

### Performance Guidelines

**Database:**
- Use proper indexes
- Implement pagination
- Optimize N+1 queries
- Use connection pooling

**Frontend:**
- Implement code splitting
- Use React Query caching
- Optimize images and assets
- Implement lazy loading

**Backend:**
- Use caching strategies
- Implement request compression
- Monitor query performance
- Use async operations

### Deployment

**Development:**
```bash
make dev-up      # Local development
```

**Staging:**
```bash
docker-compose -f docker-compose.staging.yml up
```

**Production:**
```bash
# Use production environment variables
# Implement proper secrets management
# Use container orchestration (K8s/ECS)
```

### Troubleshooting

**Common Issues:**

1. **Prisma client not generated**
   ```bash
   cd apps/backend
   pnpm db:generate
   ```

2. **Database connection issues**
   ```bash
   make dev-down
   make dev-up
   ```

3. **Port conflicts**
   ```bash
   # Check running processes
   lsof -i :3000
   lsof -i :3001
   ```

4. **Dependencies issues**
   ```bash
   pnpm install --no-frozen-lockfile
   ```

### Adding New Features

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Database changes**
   ```bash
   # Edit schema.prisma
   cd apps/backend
   pnpm prisma migrate dev --name your-migration-name
   ```

3. **Add tests**
   - Unit tests for business logic
   - Integration tests for APIs
   - E2E tests for user workflows

4. **Update documentation**
   - Update README if needed
   - Add API documentation
   - Update development guide

5. **Submit PR**
   - Ensure all tests pass
   - Follow code review process
   - Update CHANGELOG

### Best Practices

**Git Workflow:**
- Use meaningful commit messages
- Keep commits atomic
- Rebase feature branches
- Use conventional commits

**Code Review:**
- Review security implications
- Check multi-tenant isolation
- Verify test coverage
- Ensure documentation updates

**Documentation:**
- Keep README updated
- Document API changes
- Update migration guides
- Maintain architecture docs

## Getting Help

- Check existing documentation
- Review GitHub issues
- Ask in team channels
- Pair programming sessions

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
# Contributing Guidelines

This document outlines development standards, code organization principles, and best practices for the BlihOps Talent Platform.

## 📋 Table of Contents

- [Code Organization](#code-organization)
- [Core vs Shared Guidelines](#core-vs-shared-guidelines)
- [Git Workflow](#git-workflow)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)

## 🗂️ Code Organization

### Package Structure

```
packages/
├── core/          # Infrastructure & cross-cutting concerns
├── shared/        # Business domain shared code
├── api-backend/   # NestJS REST API + BullMQ workers
├── telegram-bot/  # Unified Telegram bot (role-based access)
├── admin-web/     # Next.js 15.5+ admin dashboard
└── tooling/       # Shared dev tooling
```

### When to Create a New Package

Create a new package when:
- Code is reusable across 3+ services
- It has distinct deployment needs
- It requires independent versioning
- It has different dependency requirements

**Do NOT create a package for:**
- Single-use code (keep it in the service)
- Code used by only 2 services (consider `shared/` first)

## 🎯 Core vs Shared Guidelines

### `packages/core/` - Infrastructure Layer

**Purpose**: Technical infrastructure and cross-cutting concerns that are **domain-agnostic**.

**What belongs here:**
- ✅ Logger (Winston/Pino wrapper)
- ✅ Custom exception classes
- ✅ Configuration validation utilities
- ✅ Event system (EventEmitter2 setup)
- ✅ Shared decorators (guards, interceptors)
- ✅ HTTP client wrappers
- ✅ Database connection utilities
- ✅ Technical utilities (date formatting, string manipulation, validation helpers)

**What does NOT belong here:**
- ❌ Business logic
- ❌ Domain-specific types
- ❌ Business constants
- ❌ Domain-specific utilities

**Example:**
```typescript
// ✅ GOOD - packages/core/utils/date.ts
export function formatDate(date: Date, format: string): string {
  // Generic date formatting
}

// ❌ BAD - Don't put business logic here
export function calculateTalentScore(talent: Talent): number {
  // This belongs in shared/ or api-backend/
}
```

### `packages/shared/` - Business Domain Layer

**Purpose**: Business domain code shared across services.

**What belongs here:**
- ✅ TypeScript types/interfaces (Talent, Job, etc.)
- ✅ Domain constants (ServiceCategory, ExperienceLevel, etc.)
- ✅ Business utilities (talent scoring, job matching helpers)
- ✅ Validation schemas (Zod schemas for domain objects)
- ✅ Domain-specific transforms
- ✅ Business rules and enums

**What does NOT belong here:**
- ❌ Infrastructure code
- ❌ Framework-specific code
- ❌ Technical utilities (use `core/`)

**Example:**
```typescript
// ✅ GOOD - packages/shared/types/talent.ts
export interface Talent {
  id: string;
  name: string;
  serviceCategory: ServiceCategory;
  skills: string[];
  experienceLevel: ExperienceLevel;
}

// ✅ GOOD - packages/shared/utils/matching.ts
export function calculateSkillOverlap(talentSkills: string[], jobSkills: string[]): number {
  // Business logic for matching
}

// ❌ BAD - Don't put infrastructure here
export class Logger {
  // This belongs in core/
}
```

### Decision Tree

```
Is it domain-agnostic infrastructure?
├─ YES → packages/core/
└─ NO
   ├─ Is it business domain code?
   │  ├─ YES → packages/shared/
   │  └─ NO → Keep in the service package
   └─ Is it used by 3+ services?
      ├─ YES → Consider extracting to core/ or shared/
      └─ NO → Keep in the service package
```

### Common Patterns

**Pattern 1: Technical Utility**
```typescript
// packages/core/utils/validation.ts
export function isValidEmail(email: string): boolean {
  // Generic email validation
}
```

**Pattern 2: Business Utility**
```typescript
// packages/shared/utils/talent.ts
export function calculateTalentScore(talent: Talent, job: Job): number {
  // Business logic using domain types
}
```

**Pattern 3: Domain Type**
```typescript
// packages/shared/types/job.ts
export interface Job {
  id: string;
  title: string;
  serviceCategory: ServiceCategory; // Domain enum
}
```

## 🔀 Git Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `fix/*` - Bug fixes
- `hotfix/*` - Critical production fixes

### Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(talent): add CV upload functionality
fix(matching): correct skill overlap calculation
docs(api): update authentication endpoints
refactor(core): extract logger configuration
```

### Pull Request Process

1. Create feature branch from `develop`
2. Make changes following guidelines
3. Write/update tests
4. Update documentation if needed
5. Create PR with clear description
6. Request review from team
7. Address feedback
8. Merge after approval

## 💻 Code Standards

### TypeScript

- **Strict mode**: Always enabled
- **Type safety**: No `any` types (use `unknown` if needed)
- **Imports**: Use absolute imports from package root
- **Exports**: Prefer named exports over default exports

```typescript
// ✅ GOOD
import { Talent } from '@blihops/shared/types';
import { Logger } from '@blihops/core/logger';

// ❌ BAD
import Talent from './types/talent';
const logger: any = require('./logger');
```

### NestJS (Backend)

- **Modules**: One module per domain feature
- **Services**: Business logic in services, not controllers
- **DTOs**: Use class-validator for validation
- **Guards**: Use for authentication/authorization
- **Interceptors**: Use for logging, transformation

```typescript
// ✅ GOOD - Service contains business logic
@Injectable()
export class TalentService {
  async createTalent(dto: CreateTalentDto): Promise<Talent> {
    // Business logic here
  }
}

// ✅ GOOD - Controller is thin
@Controller('talents')
export class TalentController {
  constructor(private talentService: TalentService) {}
  
  @Post()
  async create(@Body() dto: CreateTalentDto) {
    return this.talentService.createTalent(dto);
  }
}
```

### Next.js (Frontend)

- **App Router**: Use Next.js 15.5+ app directory
- **Server Components**: Default, use Client Components only when needed
- **Server Actions**: Use for mutations and form submissions
- **Data Fetching**: Server Components for server-side, React Query optional for client-side
- **Styling**: Tailwind CSS v4 utility classes

```typescript
// ✅ GOOD - Server Component by default
export default async function TalentsPage() {
  const talents = await fetchTalents(); // Server-side
  return <TalentsList talents={talents} />;
}

// ✅ GOOD - Client Component when needed
'use client';
export function TalentsList({ talents }: { talents: Talent[] }) {
  const { data } = useQuery(['talents'], fetchTalents);
  // Client-side logic
}
```

### Telegram Bots

- **Handlers**: One handler per command/action
- **Workflows**: Use state machines for multi-step flows
- **Keyboards**: Reusable keyboard components
- **Services**: Business logic in services, not handlers

```typescript
// ✅ GOOD - Handler is thin
bot.command('start', async (ctx) => {
  await onboardingService.startOnboarding(ctx.from.id);
});

// ✅ GOOD - Service contains logic
export class OnboardingService {
  async startOnboarding(userId: number) {
    // Workflow logic here
  }
}
```

## 🧪 Testing Requirements

### Test Coverage

- **Unit tests**: Required for all services and utilities
- **Integration tests**: Required for API endpoints
- **E2E tests**: Required for critical user flows

### Test Structure

```
<package>/
├── src/
└── test/
    ├── unit/
    ├── integration/
    └── e2e/
```

### Writing Tests

```typescript
// ✅ GOOD - Descriptive test names
describe('TalentService', () => {
  describe('createTalent', () => {
    it('should create talent with valid data', async () => {
      // Test implementation
    });
    
    it('should throw error when email is invalid', async () => {
      // Test implementation
    });
  });
});
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter api-backend test

# Run with coverage
pnpm --filter api-backend test:cov

# Run E2E tests
pnpm --filter tests test:e2e
```

## 📝 Documentation

### Code Documentation

- **JSDoc**: Required for public APIs
- **README**: Required for each package
- **Inline comments**: Explain "why", not "what"

```typescript
// ✅ GOOD - JSDoc for public methods
/**
 * Calculates the matching score between a talent and a job.
 * 
 * @param talent - The talent profile
 * @param job - The job posting
 * @returns A score between 0 and 100
 */
export function calculateMatchScore(talent: Talent, job: Job): number {
  // Implementation
}
```

### README Requirements

Each package should have a README.md with:
- Purpose and overview
- Installation instructions
- Usage examples
- API documentation (if applicable)
- Development notes

## 🚫 Anti-Patterns

### ❌ Don't Do This

1. **Circular Dependencies**
   ```typescript
   // ❌ BAD
   // core/ imports from shared/
   // shared/ imports from core/
   ```

2. **Hardcoded Secrets**
   ```typescript
   // ❌ BAD
   const API_KEY = 'secret123';
   
   // ✅ GOOD
   const API_KEY = process.env.API_KEY;
   ```

3. **Business Logic in Controllers**
   ```typescript
   // ❌ BAD
   @Controller('talents')
   export class TalentController {
     @Post()
     async create(@Body() dto: CreateTalentDto) {
       // Complex business logic here
     }
   }
   ```

4. **Type Duplication**
   ```typescript
   // ❌ BAD - Duplicate type definitions
   // api-backend/src/types/talent.ts
   interface Talent { ... }
   // telegram-bot/src/types/talent.ts
   interface Talent { ... }
   
   // ✅ GOOD - Shared type
   // packages/shared/types/talent.ts
   export interface Talent { ... }
   ```

## ✅ Checklist Before Submitting PR

- [ ] Code follows TypeScript strict mode
- [ ] All tests pass
- [ ] New code has tests
- [ ] Documentation updated
- [ ] No hardcoded secrets
- [ ] Code follows `core/` vs `shared/` guidelines
- [ ] Commit messages follow conventions
- [ ] No circular dependencies
- [ ] Linter passes
- [ ] Code reviewed by self

## 🆘 Getting Help

- Check existing documentation in `docs/`
- Review similar code in the codebase
- Ask in team chat
- Create a discussion issue

---

**Remember**: When in doubt, ask! It's better to clarify than to create technical debt.



# @blihops/shared

Business domain shared code package. This package contains **domain-specific** types, constants, utilities, and schemas that are shared across multiple services.

## 🎯 Purpose

`@blihops/shared` provides:
- TypeScript types and interfaces for domain entities
- Business domain constants and enums
- Business logic utilities
- Validation schemas (Zod)
- Domain-specific transformations

## 📦 What Belongs Here

### ✅ Domain Components

**Types** (`types/`)
- Domain entity interfaces (Talent, Job, Admin, etc.)
- DTOs shared across services
- Request/Response types
- Domain-specific type utilities

**Constants** (`constants/`)
- Business enums (ServiceCategory, ExperienceLevel, etc.)
- Domain-specific constants
- Status values
- Configuration values specific to the domain

**Utils** (`utils/`)
- Business logic utilities (matching, scoring, etc.)
- Domain-specific transformations
- Business rule implementations
- Domain calculations

**Schemas** (`schemas/`)
- Zod validation schemas for domain objects
- Input validation schemas
- Data transformation schemas

### ❌ What Does NOT Belong Here

- Infrastructure code (use `@blihops/core`)
- Framework-specific code
- Technical utilities (use `@blihops/core/utils`)
- Service-specific implementations

## 📁 Structure

```
shared/
├── types/
│   ├── talent.types.ts
│   ├── job.types.ts
│   ├── admin.types.ts
│   ├── matching.types.ts
│   └── index.ts
├── constants/
│   ├── service-category.constants.ts
│   ├── experience-level.constants.ts
│   ├── engagement-type.constants.ts
│   └── index.ts
├── utils/
│   ├── matching.util.ts
│   ├── scoring.util.ts
│   ├── talent.util.ts
│   └── index.ts
└── schemas/
    ├── talent.schema.ts
    ├── job.schema.ts
    └── index.ts
```

## 🔧 Usage Examples

### Types

```typescript
import { Talent, Job, ServiceCategory } from '@blihops/shared/types';

const talent: Talent = {
  id: '123',
  name: 'John Doe',
  serviceCategory: ServiceCategory.ITO,
  skills: ['TypeScript', 'NestJS'],
  experienceLevel: ExperienceLevel.SENIOR,
};
```

### Constants

```typescript
import { 
  ServiceCategory, 
  ExperienceLevel,
  EngagementType 
} from '@blihops/shared/constants';

const category = ServiceCategory.ITO;
const level = ExperienceLevel.SENIOR;
const engagement = EngagementType.FULL_TIME;
```

### Utils

```typescript
import { 
  calculateSkillOverlap,
  calculateMatchScore,
  formatTalentProfile 
} from '@blihops/shared/utils';

const overlap = calculateSkillOverlap(
  talent.skills,
  job.requiredSkills
);

const score = calculateMatchScore(talent, job);
```

### Schemas

```typescript
import { 
  TalentSchema, 
  JobSchema,
  CreateTalentSchema 
} from '@blihops/shared/schemas';

// Validate data
const result = CreateTalentSchema.safeParse(data);
if (!result.success) {
  // Handle validation errors
}

// Type inference
type CreateTalentInput = z.infer<typeof CreateTalentSchema>;
```

## 🚫 Decision Guidelines

### Should I add this to `shared/`?

**YES, if:**
- ✅ It's business domain code (talent, job, matching, etc.)
- ✅ It's used by 2+ services
- ✅ It's a domain type, constant, or utility
- ✅ It's domain-specific validation

**NO, if:**
- ❌ It's technical infrastructure (use `@blihops/core`)
- ❌ It's only used by one service (keep it in that service)
- ❌ It's framework-specific
- ❌ It's a generic technical utility (use `@blihops/core/utils`)

### Examples

```typescript
// ✅ GOOD - Domain type
export interface Talent {
  id: string;
  name: string;
  serviceCategory: ServiceCategory;
  skills: string[];
}

// ❌ BAD - Infrastructure
export class Logger {
  // This belongs in core/
}

// ✅ GOOD - Business utility
export function calculateSkillOverlap(
  talentSkills: string[],
  jobSkills: string[]
): number {
  // Business logic for matching
}

// ❌ BAD - Technical utility
export function formatDate(date: Date): string {
  // This belongs in core/utils/
}

// ✅ GOOD - Domain constant
export enum ServiceCategory {
  ITO = 'ITO',
  AI = 'AI',
  AUTOMATION = 'AUTOMATION',
  DATA_ANALYTICS = 'DATA_ANALYTICS',
}

// ❌ BAD - Technical constant
export const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  // This belongs in core/
};
```

## 🔗 Dependencies

`@blihops/shared` can depend on:
- `@blihops/core` - For infrastructure types if needed
- TypeScript
- Zod (for validation schemas)
- Utility libraries for business logic

**Should NOT depend on:**
- Framework-specific packages (NestJS, Next.js, Telegraf)
- Service-specific packages
- Infrastructure packages (unless needed for types)

## 📝 Adding New Code

1. **Check if it belongs here** (see guidelines above)
2. **Create appropriate file in correct folder**
3. **Export from index.ts**
4. **Add JSDoc documentation**
5. **Write unit tests**
6. **Update this README if needed**

### File Naming Conventions

- Types: `*.types.ts` (e.g., `talent.types.ts`)
- Constants: `*.constants.ts` (e.g., `service-category.constants.ts`)
- Utils: `*.util.ts` (e.g., `matching.util.ts`)
- Schemas: `*.schema.ts` (e.g., `talent.schema.ts`)

## 🧪 Testing

```bash
# Run tests
pnpm --filter @blihops/shared test

# Run with coverage
pnpm --filter @blihops/shared test:cov
```

## 📚 Related Packages

- `@blihops/core` - Infrastructure (may be imported if needed for types)
- `@blihops/api-backend` - Uses shared for types, constants, utils
- `@blihops/telegram-bot` - Uses shared for types, constants
- `@blihops/admin-web` - Uses shared for types, constants

## 🔄 Type Safety

All types in `shared/` should be:
- **Exported** from `index.ts` for easy importing
- **Documented** with JSDoc comments
- **Validated** with Zod schemas when possible
- **Versioned** carefully (breaking changes affect all services)

## 💡 Best Practices

1. **Keep types pure** - No business logic in type definitions
2. **Use enums for constants** - Better type safety than string literals
3. **Validate with schemas** - Use Zod schemas for runtime validation
4. **Document everything** - JSDoc for all public exports
5. **Test utilities** - All business utilities should have tests

---

**Remember**: `shared/` is for **business domain** code, not infrastructure. When in doubt, check `@blihops/core` first!



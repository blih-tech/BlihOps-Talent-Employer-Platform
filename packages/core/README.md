# @blihops/core

Infrastructure and cross-cutting concerns package. This package contains **domain-agnostic** technical utilities and infrastructure code that can be used across all services.

## 🎯 Purpose

`@blihops/core` provides:
- Technical infrastructure (logging, exceptions, config)
- Cross-cutting concerns (events, decorators)
- Framework-agnostic utilities
- Reusable technical helpers

## 📦 What Belongs Here

### ✅ Infrastructure Components

**Logger** (`logger/`)
- Winston/Pino wrapper
- Log formatting and transport configuration
- Log levels and context

**Exceptions** (`exceptions/`)
- Custom exception classes
- Error handling utilities
- HTTP exception mappers

**Config** (`config/`)
- Configuration validation
- Environment variable management
- Config schema definitions

**Events** (`events/`)
- EventEmitter2 setup
- Event type definitions
- Event bus utilities

**Decorators** (`decorators/`)
- Shared decorators for guards, interceptors
- Metadata utilities
- Cross-framework decorators

**Utils** (`utils/`)
- Technical utilities (date formatting, string manipulation)
- Validation helpers (email, URL, etc.)
- Generic data transformation

### ❌ What Does NOT Belong Here

- Business logic
- Domain-specific types
- Business constants
- Domain-specific utilities
- Framework-specific code (unless it's infrastructure)

## 📁 Structure

```
core/
├── logger/
│   ├── logger.service.ts
│   ├── logger.module.ts
│   └── logger.interface.ts
├── exceptions/
│   ├── base.exception.ts
│   ├── http.exception.ts
│   └── exception.filter.ts
├── config/
│   ├── config.service.ts
│   ├── config.schema.ts
│   └── config.interface.ts
├── events/
│   ├── event-bus.service.ts
│   ├── event.types.ts
│   └── event.module.ts
├── decorators/
│   ├── roles.decorator.ts
│   ├── public.decorator.ts
│   └── current-user.decorator.ts
└── utils/
    ├── date.util.ts
    ├── string.util.ts
    └── validation.util.ts
```

## 🔧 Usage Examples

### Logger

```typescript
import { Logger } from '@blihops/core/logger';

const logger = new Logger('MyService');

logger.info('User logged in', { userId: 123 });
logger.error('Failed to process', error);
```

### Exceptions

```typescript
import { NotFoundException, BadRequestException } from '@blihops/core/exceptions';

throw new NotFoundException('Talent not found');
throw new BadRequestException('Invalid email format');
```

### Config

```typescript
import { ConfigService } from '@blihops/core/config';

const config = new ConfigService();
const dbUrl = config.get('DATABASE_URL');
```

### Events

```typescript
import { EventBus } from '@blihops/core/events';

// Emit event
eventBus.emit('talent.created', { talentId: '123' });

// Listen to event
eventBus.on('talent.created', (data) => {
  // Handle event
});
```

### Utils

```typescript
import { formatDate, isValidEmail, slugify } from '@blihops/core/utils';

const formatted = formatDate(new Date(), 'YYYY-MM-DD');
const valid = isValidEmail('user@example.com');
const slug = slugify('Hello World'); // 'hello-world'
```

## 🚫 Decision Guidelines

### Should I add this to `core/`?

**YES, if:**
- ✅ It's domain-agnostic (works for any business domain)
- ✅ It's technical infrastructure (logging, config, etc.)
- ✅ It's a reusable technical utility
- ✅ It's used by 3+ services

**NO, if:**
- ❌ It contains business logic
- ❌ It's specific to talent/job domain
- ❌ It's only used by one service
- ❌ It's framework-specific (unless it's infrastructure)

### Examples

```typescript
// ✅ GOOD - Technical utility
export function formatDate(date: Date, format: string): string {
  // Generic date formatting
}

// ❌ BAD - Business logic
export function calculateTalentScore(talent: Talent): number {
  // This belongs in shared/ or api-backend/
}

// ✅ GOOD - Infrastructure
export class Logger {
  // Logging infrastructure
}

// ❌ BAD - Domain-specific
export enum ServiceCategory {
  // This belongs in shared/
}
```

## 🔗 Dependencies

`@blihops/core` should have **minimal dependencies**:
- TypeScript
- Utility libraries (date-fns, lodash, etc.)
- Infrastructure libraries (winston, class-validator, etc.)

**Should NOT depend on:**
- Business domain packages (`@blihops/shared` is OK if needed for types)
- Framework-specific packages (unless it's infrastructure)
- Service-specific packages

## 📝 Adding New Code

1. **Check if it belongs here** (see guidelines above)
2. **Create appropriate module/folder**
3. **Export from index.ts**
4. **Add JSDoc documentation**
5. **Write unit tests**
6. **Update this README if needed**

## 🧪 Testing

```bash
# Run tests
pnpm --filter @blihops/core test

# Run with coverage
pnpm --filter @blihops/core test:cov
```

## 📚 Related Packages

- `@blihops/shared` - Business domain shared code
- `@blihops/api-backend` - Uses core for infrastructure
- `@blihops/telegram-bot` - Uses core for logging, events
- `@blihops/admin-web` - Uses core for infrastructure (optional)

---

**Remember**: `core/` is for **infrastructure**, not business logic. When in doubt, ask!



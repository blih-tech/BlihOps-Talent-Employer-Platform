# @blihops/admin-web

Next.js 15.5+ admin dashboard for internal BlihOps operations. Built with App Router, Server Components, Server Actions, React 19, and stable Turbopack builds. Provides secure access to talent management, job management, matching insights, and administrative controls.

## 🎯 Overview

The Admin Web application enables:
- Secure authentication and role-based access
- Talent directory with advanced filtering
- Job creation and management
- Talent-job matching insights
- Approval workflows
- Analytics and reporting

## 🏗️ Architecture

### Structure

```
src/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (protected)/         # Protected routes
│   │   ├── talents/         # Talent management
│   │   │   ├── page.tsx     # Server Component
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx
│   │   │   │   └── edit/
│   │   │   │       └── page.tsx
│   │   │   └── actions.ts   # Server Actions
│   │   ├── jobs/            # Job management
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── actions.ts
│   │   ├── matching/        # Matching insights
│   │   │   └── page.tsx
│   │   ├── settings/        # Admin settings
│   │   │   └── page.tsx
│   │   └── layout.tsx        # Protected layout with auth
│   ├── api/                 # API routes (if needed)
│   ├── layout.tsx           # Root layout
│   ├── loading.tsx          # Global loading UI
│   ├── error.tsx            # Global error boundary
│   └── not-found.tsx        # 404 page
├── components/
│   ├── ui/                  # Reusable UI components (shadcn/ui)
│   ├── talent/              # Talent-specific components
│   ├── job/                 # Job-specific components
│   └── admin/               # Admin-specific components
├── actions/                 # Server Actions (shared)
├── hooks/                   # Custom React hooks (Client Components)
├── lib/                     # Utilities, API clients, configs
├── types/                   # Frontend types
├── styles/                  # Global styles
└── middleware.ts            # Next.js middleware for auth
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20.11+ (required for Next.js 15)
- Backend API running
- pnpm 8+
- React 19+

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.local
```

### Environment Variables

```env
# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Authentication (Auth.js v5)
AUTH_SECRET=your-secret-key
AUTH_URL=http://localhost:3001
AUTH_TRUST_HOST=true

# Database (for Auth.js sessions)
DATABASE_URL=postgresql://... # or mongodb://...

# Optional: Analytics, etc.
NEXT_PUBLIC_SENTRY_DSN=
```

### Development

```bash
# Start development server (with Turbopack)
pnpm dev

# Start with Turbopack explicitly
pnpm dev --turbo

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Run type checking
pnpm type-check
```

## 🔐 Authentication

The app uses **Auth.js v5** (formerly NextAuth.js) with the latest Next.js 15 patterns:

1. Server-side authentication with secure sessions
2. JWT tokens stored in HTTP-only cookies
3. Middleware-based route protection
4. Role-based access control (RBAC)
5. Server Components for auth checks

### Middleware Protection

```typescript
// middleware.ts
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  
  // Protect all routes under /(protected)
  if (pathname.startsWith('/talents') || 
      pathname.startsWith('/jobs') ||
      pathname.startsWith('/matching')) {
    if (!req.auth) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### Server Component Auth

```typescript
// app/(protected)/talents/page.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function TalentsPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }
  
  // Fetch data on server
  const talents = await fetchTalents();
  
  return <TalentsList talents={talents} />;
}
```

### Client Component Auth

```typescript
// components/ProtectedContent.tsx
'use client';
import { useSession } from 'next-auth/react';

export function ProtectedContent() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') return <Loading />;
  if (!session) return <LoginPrompt />;
  
  return <Content />;
}
```

## 📱 Pages & Routing

### Authentication

- `/login` - Admin login page (Server Component)

### Talent Management

- `/talents` - Talent directory with filtering (Server Component)
- `/talents/[id]` - Individual talent profile (Server Component)
- `/talents/[id]/edit` - Edit talent profile (Client Component with form)
- `/talents/[id]/cv` - View/download CV (Server Component)

### Job Management

- `/jobs` - Job listings (Server Component)
- `/jobs/new` - Create new job (Client Component with form)
- `/jobs/[id]` - Job details (Server Component)
- `/jobs/[id]/edit` - Edit job (Client Component with form)

### Matching

- `/matching` - Matching dashboard (Server Component)
- `/matching/jobs/[id]/talents` - Talents matched to job (Server Component)
- `/matching/talents/[id]/jobs` - Jobs matched to talent (Server Component)

### Settings

- `/settings` - Admin settings (Server Component)
- `/settings/users` - User management (if applicable)

### Special Files

- `loading.tsx` - Loading UI (Suspense boundaries)
- `error.tsx` - Error boundaries
- `not-found.tsx` - 404 page
- `layout.tsx` - Layouts for route groups

## 🎨 Components

### UI Components (`components/ui/`)

Built with **shadcn/ui** and Tailwind CSS (fully customizable):
- `Button` - Button component with variants
- `Input` - Input field with validation
- `Select` - Accessible dropdown select
- `Dialog` - Modal dialog (replaces Modal)
- `DataTable` - Advanced data table with sorting/filtering
- `Card` - Card container
- `Badge` - Status badge
- `Skeleton` - Loading skeleton (better UX than spinner)
- `Form` - Form components with validation
- `Toast` - Toast notifications
- `DropdownMenu` - Dropdown menus
- `Tabs` - Tab navigation

### Server Components

- `TalentList` - Server Component for talent listing
- `JobList` - Server Component for job listing
- `MatchingDashboard` - Server Component for matching insights

### Client Components

- `TalentCard` - Interactive talent profile card
- `TalentFilters` - Advanced filtering UI (client-side state)
- `JobCard` - Interactive job posting card
- `MatchScore` - Matching score display with animations
- `ApprovalWorkflow` - Approval UI with Server Actions
- `DataTableClient` - Client-side table with sorting/filtering

### Component Patterns

```typescript
// Server Component (default)
// app/talents/page.tsx
export default async function TalentsPage() {
  const talents = await fetchTalents(); // Server-side fetch
  return <TalentsList talents={talents} />;
}

// Client Component (when needed)
// components/TalentFilters.tsx
'use client';
import { useState } from 'react';

export function TalentFilters() {
  const [filters, setFilters] = useState({});
  // Client-side interactivity
}
```

## 🔌 Data Fetching & API Integration

### Server Components (Recommended)

Fetch data directly in Server Components:

```typescript
// app/talents/page.tsx
async function fetchTalents() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/talents`, {
    headers: {
      'Authorization': `Bearer ${await getToken()}`,
    },
    // Next.js 15: Automatic request deduplication and caching
    next: { revalidate: 60 }, // Revalidate every 60 seconds
  });
  
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export default async function TalentsPage() {
  const talents = await fetchTalents();
  return <TalentsList talents={talents} />;
}
```

### Server Actions

Use Server Actions for mutations (forms, updates):

```typescript
// app/talents/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function approveTalent(talentId: string) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/talents/${talentId}/approve`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.accessToken}`,
    },
  });
  
  if (!res.ok) throw new Error('Failed to approve');
  
  // Revalidate the talents page
  revalidatePath('/talents');
  return { success: true };
}
```

### React Query (Client Components)

For client-side data fetching and caching:

```typescript
// hooks/useTalents.ts
'use client';
import { useQuery } from '@tanstack/react-query';

export function useTalents(filters?: TalentFilters) {
  return useQuery({
    queryKey: ['talents', filters],
    queryFn: async () => {
      const res = await fetch(`/api/talents?${new URLSearchParams(filters)}`);
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### API Client (Legacy/Shared)

For shared API logic:

```typescript
// lib/api-client.ts
import { auth } from '@/auth';

export async function apiClient(endpoint: string, options?: RequestInit) {
  const session = await auth();
  const token = session?.accessToken;
  
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options?.headers,
    },
  });
}
```

## 🎯 Features

### Talent Management

- **Directory View**: List all talents with pagination
- **Advanced Filtering**: Filter by category, skills, experience, availability
- **Profile View**: Detailed talent profile with CV
- **Approval Workflow**: Approve, reject, or hide talents
- **Status Labels**: Verified, Shortlisted, Interviewed, Hired
- **Bulk Operations**: Bulk approve/reject

### Job Management

- **Job Listings**: View all jobs with status
- **Job Creation**: Create new job postings
- **Job Editing**: Update job details
- **Publishing**: Publish/archive jobs
- **Matching Preview**: See matched talents before publishing

### Matching Insights

- **Match Scores**: Relevance scores for talent-job pairs
- **Ranked Lists**: Top matches for each job
- **Recommendations**: Suggested jobs for talents
- **Match History**: Track matching over time

### Analytics

- **Dashboard**: Key metrics and statistics
- **Talent Stats**: Onboarding trends, approval rates
- **Job Stats**: Job creation, publication rates
- **Matching Stats**: Match quality metrics

## 🎨 Styling

### Tailwind CSS v4 (Latest)

The app uses Tailwind CSS v4 with CSS-first configuration:

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --color-primary: #your-primary-color;
  --color-secondary: #your-secondary-color;
  /* Custom theme variables */
}
```

### shadcn/ui Components

Components are built with Radix UI primitives and Tailwind:

```typescript
// components/ui/button.tsx
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
```

### CSS Modules (Optional)

For component-specific styles:

```css
/* components/TalentCard.module.css */
.card {
  @apply rounded-lg border bg-card p-6 shadow-sm;
}
```

## 🧪 Testing

### Setup

```bash
# Run tests
pnpm test

# Run with coverage
pnpm test:cov

# Run E2E tests with Playwright
pnpm test:e2e

# Run tests in watch mode
pnpm test:watch
```

### Component Testing (React Testing Library)

```typescript
// __tests__/components/TalentCard.test.tsx
import { render, screen } from '@testing-library/react';
import { TalentCard } from '@/components/talent/TalentCard';

describe('TalentCard', () => {
  it('should render talent information', () => {
    render(<TalentCard talent={mockTalent} />);
    expect(screen.getByText(mockTalent.name)).toBeInTheDocument();
  });
});
```

### Server Component Testing

```typescript
// __tests__/app/talents/page.test.tsx
import { render } from '@testing-library/react';
import TalentsPage from '@/app/talents/page';

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([mockTalent]),
  })
);

describe('TalentsPage', () => {
  it('should render talents', async () => {
    const page = await TalentsPage();
    const { container } = render(page);
    // Assertions
  });
});
```

### Server Actions Testing

```typescript
// __tests__/actions/talent.test.ts
import { approveTalent } from '@/app/talents/actions';

describe('approveTalent', () => {
  it('should approve talent', async () => {
    const result = await approveTalent('talent-id');
    expect(result.success).toBe(true);
  });
});
```

### E2E Testing (Playwright)

```typescript
// e2e/talents.spec.ts
import { test, expect } from '@playwright/test';

test('should display talents page', async ({ page }) => {
  await page.goto('/talents');
  await expect(page.getByRole('heading', { name: 'Talents' })).toBeVisible();
});
```

## 🚀 Deployment

### Build

```bash
# Build for production
pnpm build
```

### Docker

```bash
docker build -f infrastructure/docker/Dockerfile.admin-web -t blihops-admin .
docker run -p 3001:3001 blihops-admin
```

### Environment Variables

Ensure all environment variables are set in production:
- `NEXT_PUBLIC_API_URL` - Backend API URL (public)
- `AUTH_SECRET` - Authentication secret (server-only)
- `AUTH_URL` - App URL for Auth.js
- `DATABASE_URL` - Database connection (for sessions, server-only)
- `NODE_ENV` - Environment (production/development)

## 🔗 Dependencies

### Core Dependencies
- `next@^15.0.0` - Next.js 15 framework
- `react@^19.0.0` - React 19 library
- `react-dom@^19.0.0` - React DOM
- `@auth/core` / `next-auth@^5.0.0` - Auth.js v5 (authentication)
- `@tanstack/react-query@^5.0.0` - Data fetching (client-side)
- `tailwindcss@^4.0.0` - Tailwind CSS v4
- `@radix-ui/*` - UI primitives (via shadcn/ui)
- `class-variance-authority` - Component variants
- `clsx` / `tailwind-merge` - Class name utilities
- `zod` - Schema validation
- `@blihops/shared` - Domain types
- `@blihops/core` - Infrastructure utilities

### Development Dependencies
- `@testing-library/react@^16.0.0` - Component testing
- `@testing-library/jest-dom` - Jest DOM matchers
- `jest` - Test framework
- `jest-environment-jsdom` - JSDOM environment
- `@playwright/test` - E2E testing
- `typescript@^5.0.0` - TypeScript
- `eslint` - Linting
- `eslint-config-next` - Next.js ESLint config
- `prettier` - Code formatting

## 📚 Related Documentation

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [Auth.js v5 Documentation](https://authjs.dev)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com)
- [React Query Documentation](https://tanstack.com/query)
- [Server Actions Guide](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Backend API Documentation](../../docs/api/)
- [Contributing Guidelines](../../CONTRIBUTING.md)

## 🚀 Next.js 15 Features Used

### Core Features
- ✅ **App Router** - File-based routing with layouts
- ✅ **Server Components** - Default rendering on server
- ✅ **Server Actions** - Form mutations and data updates
- ✅ **React 19** - Latest React features (useActionState, useFormStatus)
- ✅ **Turbopack** - Fast bundler (dev mode)
- ✅ **Partial Prerendering** - Hybrid rendering (when stable)

### Performance
- ✅ **Automatic Request Deduplication** - Shared fetch requests
- ✅ **Improved Caching** - fetch() caching with revalidate
- ✅ **Streaming** - Progressive page rendering
- ✅ **Suspense Boundaries** - Loading states

### Developer Experience
- ✅ **TypeScript First** - Better type safety
- ✅ **Improved Error Handling** - error.tsx boundaries
- ✅ **Better Loading States** - loading.tsx files
- ✅ **Route Groups** - Organized routing with (groups)

## 🔒 Security

1. **Authentication**: Auth.js v5 with secure session handling
2. **Authorization**: Middleware-based route protection + RBAC
3. **CSRF Protection**: Built-in Next.js CSRF protection
4. **XSS Prevention**: React 19's built-in XSS protection
5. **Environment Variables**: Server-only variables (no `NEXT_PUBLIC_` prefix)
6. **Server Actions**: Secure server-side mutations
7. **Content Security Policy**: CSP headers via middleware
8. **Secure Cookies**: HTTP-only, secure, same-site cookies

## 🐛 Troubleshooting

### Build errors
- Check TypeScript errors
- Verify environment variables
- Check dependency versions

### API connection issues
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings on backend
- Verify authentication tokens

---

**Status**: 🟢 Active Development


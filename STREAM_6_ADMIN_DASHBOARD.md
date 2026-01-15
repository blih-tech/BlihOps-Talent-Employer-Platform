# STREAM 6: Admin Web Dashboard

**Developer**: Frontend Developer  
**Duration**: 3-4 weeks (Week 11-14) - Extended to include applicant management features  
**Status**: 🟡 READY TO START - All dependencies met, pending admin credentials  
**Dependencies**: ✅ ALL MET - Stream 1, 2, 3, 4 complete  
**Can Work Parallel**: ✅ YES - Can work parallel with Stream 5 (Telegram Bot)  
**Note**: This stream now includes comprehensive job status management and applicant management features based on employer-job-management.md requirements

---

## 📊 Stream Overview

This stream covers the Next.js 15.5+ admin dashboard with:
1. **Next.js Project Setup** - Next.js 15.5+, Tailwind CSS v4, shadcn/ui
2. **Authentication** - Auth.js v5 integration
3. **Talent Management Pages** - List, filter, approve, reject talents
4. **Job Management Pages** - List, create, edit, publish jobs with status workflow (Pending, Published, Rejected, Closed/Expired)
5. **Applicant Management** - View applicants, manage applications, shortlist/hire/reject candidates
6. **Matching Dashboard** - View matches, scores, insights

---

## 🚨 DEPENDENCY CHECK

### ✅ Prerequisites (Must be completed first)
- [x] **Stream 1**: Development environment setup - ✅ COMPLETE
- [x] **Stream 2 Task 2.3**: Talent API complete - ✅ COMPLETE - All CRUD endpoints, approval/rejection
- [x] **Stream 3 Task 3.1**: Jobs API complete - ✅ COMPLETE - All CRUD endpoints, publish/archive
- [x] **Stream 3 Task 3.2**: Matching API complete - ✅ COMPLETE - Matching endpoints with Redis caching
- [x] **Stream 3 Task 3.3**: Admin API complete - ✅ COMPLETE - Stats, analytics, dashboard endpoints
- [x] **Decision 001**: Database with Admin entity - ✅ COMPLETE - Admin model in Prisma schema

### ⚠️ Before Starting
- [x] **Verify API endpoints work**: ✅ VERIFIED - All endpoints tested and working
  - ✅ Talent CRUD endpoints tested
  - ✅ Job CRUD endpoints tested
  - ✅ Matching endpoints tested
  - ✅ Admin endpoints tested
- [ ] **Have admin credentials** for testing - ⚠️ ACTION REQUIRED - Create admin user via seed script
- [x] **Verify PostgreSQL is accessible** for Auth.js - ✅ VERIFIED - PostgreSQL accessible on port 5432

**✅ DEPENDENCIES MET - Ready to start (pending admin credentials)**

---

## ✅ Already Completed

### Infrastructure
- [x] `packages/admin-web/` - Directory exists
- [x] `packages/admin-web/Dockerfile` - Docker configuration
- [x] `packages/core/` - Core utilities available
- [x] `packages/shared/` - Shared types available

---

## 🚀 Tasks to Complete

### TASK 6.1: Next.js Project Setup (2-3 days)
**Priority**: CRITICAL  
**Status**: ❌ NOT STARTED

#### Subtask 6.1.1: Next.js 15.5+ Initialization (Day 1)
- [ ] Initialize Next.js project
  ```bash
  cd packages/admin-web
  pnpm create next-app@latest . --typescript --tailwind --app --src-dir
  ```
- [ ] Configure TypeScript (strict mode)
- [ ] Set up path aliases
- [ ] Configure Tailwind CSS v4
- [ ] Test basic page render

**Files to configure**:
- `packages/admin-web/tsconfig.json`
- `packages/admin-web/tailwind.config.ts`
- `packages/admin-web/next.config.js`

**TSConfig Path Aliases**:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/api/*": ["./src/api/*"]
    }
  }
}
```

**Acceptance Criteria**:
- Next.js app runs at `http://localhost:3001`
- Tailwind CSS works
- TypeScript strict mode enabled

---

#### Subtask 6.1.2: shadcn/ui Setup (Day 1)
- [ ] Install shadcn/ui CLI
  ```bash
  pnpm dlx shadcn-ui@latest init
  ```
- [ ] Install base components:
  - Button
  - Input
  - Card
  - Dialog
  - Table (DataTable)
  - Form components
  - Badge
  - Select
  - Tabs
  - Toast
- [ ] Create layout components (Header, Sidebar, Footer)
- [ ] Verify Next.js 15.5+ and Tailwind v4 compatibility

**Components to install**:
```bash
pnpm dlx shadcn-ui@latest add button input card dialog table form badge select tabs toast
```

**Acceptance Criteria**:
- All shadcn/ui components work
- Components use Tailwind v4 classes
- No compatibility issues with Next.js 15.5+

---

#### Subtask 6.1.3: API Client Setup (Day 2)
- [ ] Create API client for backend communication
- [ ] Use shared types from `@blihops/shared`
- [ ] Add error handling
- [ ] Configure base URL

**Files to create**:
- `packages/admin-web/src/lib/api-client.ts`
- `packages/admin-web/src/lib/api-types.ts`

**API Client Template**:
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  }

  // Talent endpoints
  async getTalents(query?: TalentQueryParams) {
    const params = new URLSearchParams(query as any);
    return this.request<TalentListResponse>(`/talents?${params}`);
  }

  async getTalent(id: string) {
    return this.request<Talent>(`/talents/${id}`);
  }

  async approveTalent(id: string) {
    return this.request<Talent>(`/talents/${id}/approve`, { method: 'POST' });
  }

  async rejectTalent(id: string) {
    return this.request<Talent>(`/talents/${id}/reject`, { method: 'POST' });
  }

  // Job endpoints
  async getJobs(query?: JobQueryParams) {
    const params = new URLSearchParams(query as any);
    return this.request<JobListResponse>(`/jobs?${params}`);
  }

  async createJob(data: CreateJobDto) {
    return this.request<Job>('/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async publishJob(id: string) {
    return this.request<Job>(`/jobs/${id}/publish`, { method: 'POST' });
  }

  async rejectJob(id: string, reason?: string) {
    return this.request<Job>(`/jobs/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async closeJob(id: string) {
    return this.request<Job>(`/jobs/${id}/close`, { method: 'POST' });
  }

  async reopenJob(id: string) {
    return this.request<Job>(`/jobs/${id}/reopen`, { method: 'POST' });
  }

  // Applicant endpoints
  async getJobApplicants(jobId: string, query?: ApplicantQueryParams) {
    const params = new URLSearchParams(query as any);
    return this.request<ApplicantListResponse>(`/jobs/${jobId}/applicants?${params}`);
  }

  async getApplicant(jobId: string, applicantId: string) {
    return this.request<Applicant>(`/jobs/${jobId}/applicants/${applicantId}`);
  }

  async shortlistApplicant(jobId: string, applicantId: string, notes?: string) {
    return this.request<Applicant>(`/jobs/${jobId}/applicants/${applicantId}/shortlist`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  async hireApplicant(jobId: string, applicantId: string, hireDate?: string, notes?: string) {
    return this.request<Applicant>(`/jobs/${jobId}/applicants/${applicantId}/hire`, {
      method: 'POST',
      body: JSON.stringify({ hireDate, notes }),
    });
  }

  async rejectApplicant(jobId: string, applicantId: string, reason?: string) {
    return this.request<Applicant>(`/jobs/${jobId}/applicants/${applicantId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Matching endpoints
  async getMatchingTalentsForJob(jobId: string) {
    return this.request<MatchResult[]>(`/matching/jobs/${jobId}/talents`);
  }

  // Admin endpoints
  async getStats() {
    return this.request<AdminStats>('/admin/stats');
  }
}

export const apiClient = new ApiClient();
```

**Acceptance Criteria**:
- API client can call all required endpoints
- Shared types are used
- Error handling works

---

### TASK 6.2: Authentication Implementation (3-4 days)
**Priority**: CRITICAL  
**Status**: ❌ NOT STARTED

#### Subtask 6.2.1: Auth.js v5 Setup (Day 1-2)
- [ ] Install Auth.js v5 (next-auth@beta)
  ```bash
  pnpm add next-auth@beta @auth/prisma-adapter
  ```
- [ ] Configure Auth.js with credentials provider
- [ ] Set up PostgreSQL adapter
- [ ] Create auth API routes
- [ ] Create login page

**Files to create**:
- `packages/admin-web/src/app/api/auth/[...nextauth]/route.ts`
- `packages/admin-web/src/lib/auth.ts`
- `packages/admin-web/src/app/login/page.tsx`

**Auth Configuration**:
```typescript
// src/lib/auth.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const admin = await prisma.admin.findUnique({
          where: { email: credentials.email as string },
        });

        if (!admin) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          admin.passwordHash
        );

        if (!isValid) return null;

        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
});
```

**Login Page Template**:
```typescript
// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid credentials');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4"
          />
          <Button type="submit" className="w-full">Login</Button>
        </form>
      </Card>
    </div>
  );
}
```

**Acceptance Criteria**:
- Auth.js is configured
- Login page works
- Session persists across page refreshes

---

#### Subtask 6.2.2: Protected Routes (Day 2)
- [ ] Create middleware for route protection
- [ ] Protect all dashboard routes
- [ ] Redirect unauthenticated users to login
- [ ] Create auth utilities

**Files to create**:
- `packages/admin-web/src/middleware.ts`
- `packages/admin-web/src/lib/auth-helpers.ts`

**Middleware Template**:
```typescript
// src/middleware.ts
import { auth } from '@/lib/auth';

export default auth((req) => {
  const isAuthenticated = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith('/login');

  if (!isAuthenticated && !isAuthPage) {
    return Response.redirect(new URL('/login', req.url));
  }

  if (isAuthenticated && isAuthPage) {
    return Response.redirect(new URL('/dashboard', req.url));
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

**Acceptance Criteria**:
- Protected routes redirect to login
- Logged-in users can access dashboard
- Logout works correctly

---

### TASK 6.3: Talent Management Pages (1 week)
**Priority**: HIGH  
**Status**: ❌ NOT STARTED  
**Dependencies**: Task 6.1, Task 6.2

#### Subtask 6.3.1: Talent List Page (Day 1-2)
- [ ] Create talent list Server Component
- [ ] Fetch talents from API
- [ ] Implement DataTable component
- [ ] Add filtering (status, category)
- [ ] Add search functionality
- [ ] Add pagination
- [ ] Add approval/reject actions (Server Actions)

**Files to create**:
- `packages/admin-web/src/app/dashboard/talents/page.tsx`
- `packages/admin-web/src/components/talents/talent-table.tsx`
- `packages/admin-web/src/actions/talent-actions.ts`

**Talent List Page Template** (simplified):
```typescript
// src/app/dashboard/talents/page.tsx
import { apiClient } from '@/lib/api-client';
import { TalentTable } from '@/components/talents/talent-table';

export default async function TalentsPage({
  searchParams,
}: {
  searchParams: { page?: string; status?: string };
}) {
  const talents = await apiClient.getTalents({
    page: searchParams.page || '1',
    status: searchParams.status,
  });

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Talent Management</h1>
      <TalentTable data={talents.data} meta={talents.meta} />
    </div>
  );
}
```

**Server Actions Template**:
```typescript
// src/actions/talent-actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { apiClient } from '@/lib/api-client';

export async function approveTalentAction(talentId: string) {
  try {
    await apiClient.approveTalent(talentId);
    revalidatePath('/dashboard/talents');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to approve talent' };
  }
}

export async function rejectTalentAction(talentId: string) {
  try {
    await apiClient.rejectTalent(talentId);
    revalidatePath('/dashboard/talents');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to reject talent' };
  }
}
```

**Acceptance Criteria**:
- Talent list displays correctly
- Filtering and search work
- Pagination works
- Approve/reject actions work
- Data updates after actions

---

#### Subtask 6.3.2: Talent Detail Page (Day 2-3)
- [ ] Create talent detail page
- [ ] Display full talent profile
- [ ] Show CV download link
- [ ] Show matched jobs
- [ ] Add edit capability (optional for MVP)

**Files to create**:
- `packages/admin-web/src/app/dashboard/talents/[id]/page.tsx`

**Acceptance Criteria**:
- Detail page shows full profile
- Matched jobs are displayed
- CV download works (if available)

---

### TASK 6.4: Job Management Pages (1 week)
**Priority**: HIGH  
**Status**: ❌ NOT STARTED  
**Dependencies**: Task 6.1, Task 6.2

#### Job Status Workflow
Jobs progress through the following statuses with real-time updates:

**1. Pending - Awaiting Approval**
- Job post has been created and is awaiting admin review and approval
- Actions Available:
  - View job details
  - Edit job posting
  - Delete job posting
  - Submit for approval (if created by employer)
- Next Status: `Published` (after approval) or `Rejected` (if issues found)

**2. Published - Live and Accepting Applications**
- Job is live on the platform, visible to talents, and actively accepting applications
- Actions Available:
  - View all applicants
  - Check application details
  - Shortlist candidates
  - Hire candidates
  - Reject candidates
  - Close job posting (stop accepting applications)
  - Edit job posting (limited - may require re-approval)
- Next Status: `Closed/Expired` (when no longer accepting applications)

**3. Rejected - Review and Make Adjustments**
- Job post was rejected during review. Employer can review feedback and make adjustments
- Actions Available:
  - View rejection reason/feedback
  - Edit job posting
  - Resubmit for approval
  - Delete job posting
- Next Status: `Pending` (after resubmission)

**4. Closed/Expired - No Longer Accepting Applications**
- Job posting is closed and no longer accepting new applications
- Actions Available:
  - View all applicants (historical)
  - Check application details
  - Shortlist/hire/reject existing candidates
  - Reopen job posting (if needed)
  - Archive job posting
- Next Status: `Published` (if reopened) or `Archived` (permanent closure)

**Status Transition Diagram**:
```
┌─────────┐
│  Draft  │ (Initial creation)
└────┬────┘
     │ Submit
     ▼
┌─────────┐
│ Pending │ ◄──┐
└────┬────┘    │ Resubmit
     │         │
     │ Approve │
     ▼         │
┌──────────┐   │
│Published │   │
└────┬─────┘   │
     │         │
     │ Reject  │
     ▼         │
┌──────────┐   │
│ Rejected │───┘
└────┬─────┘
     │
     │ Close
     ▼
┌──────────────┐
│Closed/Expired│
└──────────────┘
```

#### Subtask 6.4.1: Job List Page (Day 1-2)
- [ ] Create job list Server Component
- [ ] Fetch jobs from API
- [ ] Implement DataTable component
- [ ] Add filtering (status: Pending, Published, Rejected, Closed/Expired, category)
- [ ] Add search functionality
- [ ] Add pagination
- [ ] Display quick stats for each job:
  - Total applicants
  - Shortlisted candidates
  - Hired candidates
  - Days since posted
- [ ] Add status-based actions:
  - Publish (for Pending jobs)
  - Reject (for Pending jobs)
  - Close (for Published jobs)
  - Reopen (for Closed jobs)
  - Archive (for Closed jobs)
- [ ] Show status badges with color coding
- [ ] Add sorting options (most recent, most applicants, oldest)

**Files to create**:
- `packages/admin-web/src/app/dashboard/jobs/page.tsx`
- `packages/admin-web/src/components/jobs/job-table.tsx`
- `packages/admin-web/src/components/jobs/job-status-badge.tsx`
- `packages/admin-web/src/actions/job-actions.ts`

**Similar structure to Talent List Page**

**Acceptance Criteria**:
- Job list displays correctly with all statuses
- Quick stats are shown for each job
- Filtering by status and category works
- Search functionality works
- Status-based actions work correctly
- Status badges are color-coded and clear

---

#### Subtask 6.4.2: Job Create/Edit Pages (Day 2-3)
- [ ] Create job creation form
- [ ] Create job edit page
- [ ] Add form validation
- [ ] Use Server Actions for submission
- [ ] Show matching preview before publishing
- [ ] Handle status transitions (Pending → Published, Pending → Rejected, etc.)
- [ ] Show rejection feedback when editing rejected jobs

**Files to create**:
- `packages/admin-web/src/app/dashboard/jobs/new/page.tsx`
- `packages/admin-web/src/app/dashboard/jobs/[id]/edit/page.tsx`
- `packages/admin-web/src/components/jobs/job-form.tsx`

**Job Form Template** (simplified):
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createJobAction } from '@/actions/job-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';

export function JobForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    serviceCategory: '',
    requiredSkills: '',
    experienceLevel: '',
    engagementType: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await createJobAction({
      ...formData,
      requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()),
    });

    if (result.success) {
      router.push('/dashboard/jobs');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Job Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      />
      <Textarea
        placeholder="Job Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />
      {/* More form fields... */}
      <Button type="submit">Create Job</Button>
    </form>
  );
}
```

**Acceptance Criteria**:
- Job creation form works
- Job edit form works
- Form validation works
- Jobs are saved correctly
- Status transitions work correctly
- Rejection feedback is displayed when editing rejected jobs

---

#### Subtask 6.4.3: Job Detail Page (Day 3-4)
- [ ] Create job detail page
- [ ] Display full job information:
  - Job description
  - Required skills
  - Service category
  - Engagement type
  - Duration
  - Status and status history
  - Created/updated timestamps
- [ ] Show applicant statistics:
  - Total applicants
  - Shortlisted count
  - Hired count
  - Rejected count
- [ ] Add status management actions based on current status
- [ ] Link to applicant management page
- [ ] Show matching preview (top matching talents)

**Files to create**:
- `packages/admin-web/src/app/dashboard/jobs/[id]/page.tsx`
- `packages/admin-web/src/components/jobs/job-detail-header.tsx`
- `packages/admin-web/src/components/jobs/job-status-history.tsx`

**Acceptance Criteria**:
- Job detail page shows all information
- Status history is displayed
- Applicant statistics are accurate
- Status actions are available based on current status
- Links to applicant management work

---

### TASK 6.5: Matching Dashboard (3-4 days)
**Priority**: MEDIUM  
**Status**: ❌ NOT STARTED  
**Dependencies**: Task 6.1, Task 6.2, Stream 3 Task 3.2

#### Subtask 6.5.1: Matching Overview Page (Day 1-2)
- [ ] Create matching dashboard page
- [ ] Show statistics (match quality, recent matches)
- [ ] List recent matches
- [ ] Link to job-to-talent and talent-to-job views

**Files to create**:
- `packages/admin-web/src/app/dashboard/matching/page.tsx`

**Acceptance Criteria**:
- Matching dashboard shows overview
- Statistics are accurate
- Links to detail views work

---

#### Subtask 6.5.2: Job-to-Talent Matching View (Day 2)
- [ ] Create page to view matching talents for a job
- [ ] Display match scores
- [ ] Show score breakdown
- [ ] Sort by score

**Files to create**:
- `packages/admin-web/src/app/dashboard/matching/jobs/[id]/page.tsx`

**Acceptance Criteria**:
- Matching talents are displayed
- Scores are shown correctly
- Score breakdown is visible

---

#### Subtask 6.5.3: Talent-to-Job Matching View (Day 2)
- [ ] Create page to view matching jobs for a talent
- [ ] Display match scores
- [ ] Show score breakdown

**Files to create**:
- `packages/admin-web/src/app/dashboard/matching/talents/[id]/page.tsx`

**Acceptance Criteria**:
- Matching jobs are displayed
- Scores are shown correctly

---

### TASK 6.6: Applicant Management Pages (1 week)
**Priority**: HIGH  
**Status**: ❌ NOT STARTED  
**Dependencies**: Task 6.1, Task 6.2, Task 6.4

#### Subtask 6.6.1: Applicant List Page (Day 1-2)
- [ ] Create applicant list page for a job
- [ ] Fetch applicants from API
- [ ] Implement DataTable component
- [ ] Display applicant information:
  - Candidate name
  - Match score (0-100)
  - Application date
  - Candidate status (New, Shortlisted, Hired, Rejected)
  - Quick actions (Shortlist, Hire, Reject)
- [ ] Add filtering:
  - By status (New, Shortlisted, Hired, Rejected)
  - By match score range
- [ ] Add sorting:
  - By match score (highest first)
  - By application date (newest first)
  - By status
- [ ] Add search functionality (by candidate name)
- [ ] Add pagination
- [ ] Show match score badges with color coding

**Files to create**:
- `packages/admin-web/src/app/dashboard/jobs/[id]/applicants/page.tsx`
- `packages/admin-web/src/components/applicants/applicant-table.tsx`
- `packages/admin-web/src/components/applicants/match-score-badge.tsx`
- `packages/admin-web/src/actions/applicant-actions.ts`

**Acceptance Criteria**:
- Applicant list displays correctly
- Match scores are shown with visual indicators
- Filtering and sorting work
- Quick actions are accessible
- Status updates reflect immediately

---

#### Subtask 6.6.2: Applicant Detail Page (Day 2-3)
- [ ] Create applicant detail page
- [ ] Display full candidate profile:
  - Name and contact information
  - Skills and experience level
  - Availability
  - Engagement preference
  - CV/resume download link (if provided)
- [ ] Display match breakdown:
  - Service category match
  - Skill overlap percentage
  - Experience level match
  - Availability match
  - Overall match score
- [ ] Display application timeline:
  - Application date
  - Status changes history
  - Notes and comments
- [ ] Add candidate actions:
  - Shortlist (with notes)
  - Hire (with hire date and notes)
  - Reject (with rejection reason)
- [ ] Show matched jobs for this candidate

**Files to create**:
- `packages/admin-web/src/app/dashboard/jobs/[jobId]/applicants/[applicantId]/page.tsx`
- `packages/admin-web/src/components/applicants/applicant-profile.tsx`
- `packages/admin-web/src/components/applicants/match-breakdown.tsx`
- `packages/admin-web/src/components/applicants/application-timeline.tsx`
- `packages/admin-web/src/components/applicants/candidate-actions.tsx`

**Server Actions Template**:
```typescript
// src/actions/applicant-actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { apiClient } from '@/lib/api-client';

export async function shortlistApplicantAction(
  jobId: string,
  applicantId: string,
  notes?: string
) {
  try {
    await apiClient.shortlistApplicant(jobId, applicantId, notes);
    revalidatePath(`/dashboard/jobs/${jobId}/applicants`);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to shortlist applicant' };
  }
}

export async function hireApplicantAction(
  jobId: string,
  applicantId: string,
  hireDate?: string,
  notes?: string
) {
  try {
    await apiClient.hireApplicant(jobId, applicantId, hireDate, notes);
    revalidatePath(`/dashboard/jobs/${jobId}/applicants`);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to hire applicant' };
  }
}

export async function rejectApplicantAction(
  jobId: string,
  applicantId: string,
  reason?: string
) {
  try {
    await apiClient.rejectApplicant(jobId, applicantId, reason);
    revalidatePath(`/dashboard/jobs/${jobId}/applicants`);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to reject applicant' };
  }
}
```

**Acceptance Criteria**:
- Applicant detail page shows full profile
- Match breakdown is displayed clearly
- Application timeline is shown
- Candidate actions work correctly
- CV download works (if available)
- Status updates reflect immediately

---

#### Subtask 6.6.3: Real-Time Status Updates (Day 3-4)
- [ ] Implement real-time status updates using polling or WebSockets
- [ ] Update applicant list when status changes
- [ ] Show toast notifications for status changes
- [ ] Update job statistics when applicants are shortlisted/hired/rejected
- [ ] Ensure status changes are reflected across all views

**Files to create/update**:
- `packages/admin-web/src/hooks/use-realtime-updates.ts` (optional, if using WebSockets)
- `packages/admin-web/src/components/applicants/applicant-status-updater.tsx`

**Acceptance Criteria**:
- Status updates are reflected in real-time
- Toast notifications appear for actions
- Job statistics update automatically
- No page refresh needed for status changes

---

## 📊 Reporting & Analytics Requirements

Based on the employer-job-management guide, the dashboard should provide:

### Job Post Performance
- Views count
- Applications count
- Conversion rates (views to applications)
- Time-to-hire metrics

### Hiring Metrics
- Time-to-hire
- Source of candidates
- Success rates by status
- Average match scores for hired candidates

### Candidate Pipeline
- Application stages breakdown
- Drop-off rates
- Status distribution (New, Shortlisted, Hired, Rejected)

### Status Distribution
- Jobs by status
- Trends over time
- Status transition analytics

**Note**: These analytics features can be implemented in a future iteration if not available in the initial API endpoints.

---

## 📋 Testing Requirements

### Manual Testing Checklist

#### Authentication
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (should fail)
- [ ] Access protected route without login (should redirect)
- [ ] Logout and verify session cleared

#### Talent Management
- [ ] View talent list
- [ ] Filter talents by status
- [ ] Search talents
- [ ] Approve a talent
- [ ] Reject a talent
- [ ] View talent detail page

#### Job Management
- [ ] View job list with all statuses
- [ ] Filter jobs by status (Pending, Published, Rejected, Closed/Expired)
- [ ] Create a new job (status: Pending)
- [ ] Edit an existing job
- [ ] Publish a job (Pending → Published)
- [ ] Reject a job (Pending → Rejected)
- [ ] Close a job (Published → Closed)
- [ ] Reopen a job (Closed → Published)
- [ ] Archive a job
- [ ] View job detail page with statistics
- [ ] Verify quick stats display correctly (applicants, shortlisted, hired)

#### Applicant Management
- [ ] View applicant list for a job
- [ ] Filter applicants by status (New, Shortlisted, Hired, Rejected)
- [ ] Sort applicants by match score
- [ ] View applicant detail page
- [ ] View match breakdown for an applicant
- [ ] Shortlist an applicant (with notes)
- [ ] Hire an applicant (with hire date and notes)
- [ ] Reject an applicant (with rejection reason)
- [ ] Download CV/resume (if available)
- [ ] Verify status updates reflect immediately
- [ ] Verify job statistics update after actions

#### Matching Dashboard
- [ ] View matching overview
- [ ] View matching talents for a job
- [ ] View matching jobs for a talent
- [ ] Verify match scores are correct

---

## 🎯 Definition of Done

### Setup
- ✅ Next.js 15.5+ app is running
- ✅ Tailwind CSS v4 works
- ✅ shadcn/ui components work
- ✅ API client works

### Authentication
- ✅ Auth.js v5 is configured
- ✅ Login page works
- ✅ Protected routes work
- ✅ Session persists

### Pages
- ✅ Talent management pages work
- ✅ Job management pages work with status workflow
- ✅ Applicant management pages work
- ✅ Matching dashboard works
- ✅ All CRUD operations work
- ✅ Job status transitions work (Pending → Published/Rejected, Published → Closed, etc.)
- ✅ Applicant actions work (Shortlist, Hire, Reject)

### UI/UX
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling
- ✅ Toast notifications
- ✅ Real-time status updates
- ✅ Status badges with color coding
- ✅ Match score visualizations
- ✅ Application timeline display

---

## 📂 Key Files

### Configuration
- `packages/admin-web/next.config.js`
- `packages/admin-web/tsconfig.json`
- `packages/admin-web/tailwind.config.ts`

### Authentication
- `packages/admin-web/src/lib/auth.ts`
- `packages/admin-web/src/middleware.ts`
- `packages/admin-web/src/app/login/page.tsx`

### API
- `packages/admin-web/src/lib/api-client.ts`

### Pages
- `packages/admin-web/src/app/dashboard/talents/page.tsx`
- `packages/admin-web/src/app/dashboard/jobs/page.tsx`
- `packages/admin-web/src/app/dashboard/jobs/[id]/page.tsx`
- `packages/admin-web/src/app/dashboard/jobs/[id]/applicants/page.tsx`
- `packages/admin-web/src/app/dashboard/jobs/[jobId]/applicants/[applicantId]/page.tsx`
- `packages/admin-web/src/app/dashboard/matching/page.tsx`

### Actions
- `packages/admin-web/src/actions/talent-actions.ts`
- `packages/admin-web/src/actions/job-actions.ts`
- `packages/admin-web/src/actions/applicant-actions.ts`

### Components
- `packages/admin-web/src/components/jobs/job-status-badge.tsx`
- `packages/admin-web/src/components/jobs/job-status-history.tsx`
- `packages/admin-web/src/components/applicants/applicant-table.tsx`
- `packages/admin-web/src/components/applicants/match-score-badge.tsx`
- `packages/admin-web/src/components/applicants/match-breakdown.tsx`
- `packages/admin-web/src/components/applicants/application-timeline.tsx`

---

## 🚨 Blockers & Dependencies

### Current Blockers
- ⚠️ **Stream 2 Task 2.3**: Talent API must be complete
- ⚠️ **Stream 3 Task 3.1**: Jobs API must be complete
- ⚠️ **Stream 3 Task 3.2**: Matching API must be complete

### This Stream Blocks
- **Stream 7**: Integration testing needs dashboard working

---

**Last Updated**: 2025-01-15  
**Next Review**: Daily standup  
**Owner**: Frontend Developer  
**Status Note**: All dependencies from Streams 1-4 are complete. Ready to start pending admin credentials setup.

---

## 📚 Reference Documents

- **Employer Job Management Guide**: `/docs/employer-job-management.md` - Comprehensive guide for job post status management, applicant management, and candidate actions. This document provides the detailed requirements for job status workflows, applicant management features, and best practices that are implemented in this stream.



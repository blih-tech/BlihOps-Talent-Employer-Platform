# Employer/BlihOps Job Management Guide

Comprehensive guide for managing job posts, tracking applications, and managing candidates through the BlihOps Talent Platform.

## 📋 Overview

Employers and BlihOps administrators can manage job postings with real-time status tracking, view all applicants, and manage candidate applications through a streamlined workflow.

## 🎯 Job Post Status Management

### Status Workflow

Jobs progress through the following statuses with real-time updates:

#### 1. **Pending** - Awaiting Approval
- **Description**: Job post has been created and is awaiting admin review and approval
- **Actions Available**:
  - View job details
  - Edit job posting
  - Delete job posting
  - Submit for approval (if created by employer)
- **Next Status**: `Published` (after approval) or `Rejected` (if issues found)

#### 2. **Published** - Live and Accepting Applications
- **Description**: Job is live on the platform, visible to talents, and actively accepting applications
- **Actions Available**:
  - View all applicants
  - Check application details
  - Shortlist candidates
  - Hire candidates
  - Reject candidates
  - Close job posting (stop accepting applications)
  - Edit job posting (limited - may require re-approval)
- **Next Status**: `Closed/Expired` (when no longer accepting applications)

#### 3. **Rejected** - Review and Make Adjustments
- **Description**: Job post was rejected during review. Employer can review feedback and make adjustments
- **Actions Available**:
  - View rejection reason/feedback
  - Edit job posting
  - Resubmit for approval
  - Delete job posting
- **Next Status**: `Pending` (after resubmission)

#### 4. **Closed/Expired** - No Longer Accepting Applications
- **Description**: Job posting is closed and no longer accepting new applications
- **Actions Available**:
  - View all applicants (historical)
  - Check application details
  - Shortlist/hire/reject existing candidates
  - Reopen job posting (if needed)
  - Archive job posting
- **Next Status**: `Published` (if reopened) or `Archived` (permanent closure)

### Status Transition Diagram

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

## 📊 Job Post Management Features

### View Job Posts List

Access your job posts dashboard to see:
- **All job posts** organized by status
- **Real-time status updates** (Pending, Published, Rejected, Closed/Expired)
- **Quick stats** for each job:
  - Total applicants
  - Shortlisted candidates
  - Hired candidates
  - Days since posted
- **Filtering options**:
  - By status
  - By service category
  - By date range
  - By number of applicants
- **Sorting options**:
  - Most recent first
  - Most applicants first
  - Oldest first

### Job Post Details

Click on any job post from your list to access:

#### 1. **Job Information**
- Full job description
- Required skills
- Service category
- Engagement type
- Duration
- Status and status history
- Created/updated timestamps

#### 2. **Applicant Management**

##### View All Applicants
- **List view** showing all candidates who applied
- **Match score** for each applicant (0-100)
- **Application date**
- **Candidate status** (New, Shortlisted, Hired, Rejected)
- **Quick actions** (Shortlist, Hire, Reject)

##### Application Details
Click on any applicant to view:
- **Full candidate profile**:
  - Name and contact information
  - Skills and experience level
  - Availability
  - Engagement preference
  - CV/resume (if provided)
- **Match breakdown**:
  - Service category match
  - Skill overlap percentage
  - Experience level match
  - Availability match
  - Overall match score
- **Application timeline**:
  - Application date
  - Status changes
  - Notes and comments

#### 3. **Candidate Actions**

##### Shortlist Candidate
- Move candidate to shortlist for further review
- Add notes/feedback
- Candidate receives notification
- Status changes to "Shortlisted"

##### Hire Candidate
- Mark candidate as hired
- Add hire date and notes
- Candidate receives notification
- Job posting status may change (if all positions filled)
- Status changes to "Hired"

##### Reject Candidate
- Reject candidate application
- Add rejection reason (optional)
- Candidate receives notification
- Status changes to "Rejected"

## 👥 Employee/Talent Status Management

Similar status management is available for employee/talent profiles:

### Talent Status Workflow

#### 1. **Pending** - Awaiting Approval
- Talent profile submitted, awaiting admin review
- Not visible to employers
- Can be edited by talent

#### 2. **Approved** - Active and Visible
- Profile is live and visible to employers
- Can receive job matches
- Can apply to jobs
- Can be edited by talent (may require re-approval for major changes)

#### 3. **Rejected** - Needs Review
- Profile was rejected during review
- Talent can view rejection reason
- Can edit and resubmit
- Not visible to employers

#### 4. **Hired** - Currently Employed
- Talent has been hired for a position
- Profile may be marked as "Not Available" or remain active
- Can still receive job matches (for future opportunities)

#### 5. **Inactive** - Temporarily Unavailable
- Talent is temporarily not available
- Profile remains visible but marked as inactive
- Can be reactivated by talent or admin

### Employee Management Actions

For employers managing their employees:

- **View employee profiles**
- **Update employment status**
- **Track employee performance**
- **Manage employee availability**
- **Update employee skills and experience**

## 🔄 Real-Time Status Updates

All status changes are reflected in real-time across:
- **Job post dashboard**
- **Application management interface**
- **Admin dashboard**
- **Telegram bot notifications**
- **Email notifications** (if configured)

## 📱 Access Methods

### 1. Admin Web Dashboard
- Full-featured web interface
- Real-time updates
- Advanced filtering and search
- Bulk operations

### 2. Telegram Bot
- Quick status checks
- Receive notifications
- Basic job management
- Application updates

### 3. REST API
- Programmatic access
- Integration with other systems
- Automated workflows
- Custom reporting

## 🎯 Best Practices

### For Job Posts:
1. **Keep job descriptions clear and detailed**
2. **Update status promptly** when positions are filled
3. **Review applications regularly** to maintain candidate engagement
4. **Provide feedback** when rejecting candidates
5. **Close expired postings** to maintain data accuracy

### For Candidate Management:
1. **Review applications within 48 hours**
2. **Shortlist promising candidates** for further review
3. **Communicate decisions** promptly
4. **Maintain organized notes** for each candidate
5. **Track hiring metrics** for future improvements

## 📊 Reporting & Analytics

Access comprehensive reports on:
- **Job post performance**: Views, applications, conversion rates
- **Hiring metrics**: Time-to-hire, source of candidates, success rates
- **Candidate pipeline**: Application stages, drop-off rates
- **Status distribution**: Jobs by status, trends over time

---

**Last Updated**: 2025-01-14  
**Version**: 1.0.0






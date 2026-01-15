import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';

// Load environment variables explicitly for seed script
config({ path: '.env' });

// Prisma 7: Use adapter pattern with PostgreSQL
const databaseUrl = process.env.DATABASE_URL || 'postgresql://blihops:dev_password_123@localhost:5432/blihops_db?schema=public';
const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin users with test credentials
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const superAdminPasswordHash = await bcrypt.hash('superadmin123', 10);
  const testAdminPasswordHash = await bcrypt.hash('testadmin123', 10);

  const admin = await prisma.admin.upsert({
    where: { email: 'admin@blihops.com' },
    update: {
      passwordHash: adminPasswordHash, // Update password in case it changed
    },
    create: {
      email: 'admin@blihops.com',
      passwordHash: adminPasswordHash,
      name: 'System Admin',
      role: 'ADMIN',
      telegramIds: ['123456789'],
    },
  });
  console.log('✅ Admin user created:', admin.email, '(password: admin123)');

  const superAdmin = await prisma.admin.upsert({
    where: { email: 'superadmin@blihops.com' },
    update: {
      passwordHash: superAdminPasswordHash,
    },
    create: {
      email: 'superadmin@blihops.com',
      passwordHash: superAdminPasswordHash,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      telegramIds: ['987654321'],
    },
  });
  console.log('✅ Super Admin user created:', superAdmin.email, '(password: superadmin123)');

  const testAdmin = await prisma.admin.upsert({
    where: { email: 'test@blihops.com' },
    update: {
      passwordHash: testAdminPasswordHash,
    },
    create: {
      email: 'test@blihops.com',
      passwordHash: testAdminPasswordHash,
      name: 'Test Admin',
      role: 'ADMIN',
      telegramIds: [],
    },
  });
  console.log('✅ Test Admin user created:', testAdmin.email, '(password: testadmin123)');

  // Create sample talents
  const talents = await Promise.all([
    prisma.talent.upsert({
      where: { telegramId: '111111111' },
      update: {},
      create: {
        telegramId: '111111111',
        name: 'John Doe',
        serviceCategory: 'WEB_DEVELOPMENT',
        skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
        experienceLevel: 'INTERMEDIATE',
        yearsOfExperience: 3,
        bio: 'Full-stack web developer with experience in modern JavaScript frameworks',
        status: 'APPROVED',
      },
    }),
    prisma.talent.upsert({
      where: { telegramId: '222222222' },
      update: {},
      create: {
        telegramId: '222222222',
        name: 'Jane Smith',
        serviceCategory: 'MOBILE_DEVELOPMENT',
        skills: ['React Native', 'iOS', 'Android', 'Flutter'],
        experienceLevel: 'SENIOR',
        yearsOfExperience: 5,
        bio: 'Mobile app developer specializing in cross-platform solutions',
        status: 'APPROVED',
      },
    }),
    prisma.talent.upsert({
      where: { telegramId: '333333333' },
      update: {},
      create: {
        telegramId: '333333333',
        name: 'Bob Johnson',
        serviceCategory: 'DESIGN',
        skills: ['UI/UX Design', 'Figma', 'Adobe XD', 'Prototyping'],
        experienceLevel: 'SENIOR',
        yearsOfExperience: 4,
        bio: 'Creative designer focused on user experience and interface design',
        status: 'APPROVED',
      },
    }),
    prisma.talent.upsert({
      where: { telegramId: '444444444' },
      update: {},
      create: {
        telegramId: '444444444',
        name: 'Alice Williams',
        serviceCategory: 'DATA_ANALYSIS',
        skills: ['Python', 'SQL', 'Data Visualization', 'Machine Learning'],
        experienceLevel: 'EXPERT',
        yearsOfExperience: 7,
        bio: 'Data scientist and analyst with expertise in ML and analytics',
        status: 'APPROVED',
      },
    }),
    prisma.talent.upsert({
      where: { telegramId: '555555555' },
      update: {},
      create: {
        telegramId: '555555555',
        name: 'Charlie Brown',
        serviceCategory: 'WEB_DEVELOPMENT',
        skills: ['Vue.js', 'PHP', 'Laravel', 'MySQL'],
        experienceLevel: 'INTERMEDIATE',
        yearsOfExperience: 2,
        bio: 'Backend developer with Laravel expertise',
        status: 'PENDING',
      },
    }),
    prisma.talent.upsert({
      where: { telegramId: '666666666' },
      update: {},
      create: {
        telegramId: '666666666',
        name: 'Diana Prince',
        serviceCategory: 'MARKETING',
        skills: ['SEO', 'Content Marketing', 'Social Media', 'Analytics'],
        experienceLevel: 'SENIOR',
        yearsOfExperience: 6,
        bio: 'Digital marketing specialist with proven track record',
        status: 'APPROVED',
      },
    }),
    prisma.talent.upsert({
      where: { telegramId: '777777777' },
      update: {},
      create: {
        telegramId: '777777777',
        name: 'Eve Davis',
        serviceCategory: 'CONTENT_CREATION',
        skills: ['Copywriting', 'Blogging', 'Technical Writing', 'Editing'],
        experienceLevel: 'INTERMEDIATE',
        yearsOfExperience: 3,
        bio: 'Content creator and technical writer',
        status: 'APPROVED',
      },
    }),
  ]);
  console.log(`✅ Created ${talents.length} talents`);

  // Create sample jobs
  const jobs = await Promise.all([
    prisma.job.upsert({
      where: { id: 'job-1' },
      update: {},
      create: {
        id: 'job-1',
        title: 'Senior React Developer',
        description: 'Looking for an experienced React developer to join our team. Must have strong TypeScript skills and experience with modern React patterns.',
        serviceCategory: 'WEB_DEVELOPMENT',
        requiredSkills: ['React', 'TypeScript', 'Redux', 'Node.js'],
        experienceLevel: 'SENIOR',
        engagementType: 'FULL_TIME',
        duration: 'Permanent',
        budget: '$80,000 - $120,000',
        status: 'PUBLISHED',
        createdById: admin.id,
        publishedAt: new Date(),
      },
    }),
    prisma.job.upsert({
      where: { id: 'job-2' },
      update: {},
      create: {
        id: 'job-2',
        title: 'Mobile App Developer (React Native)',
        description: 'We need a skilled mobile developer to build cross-platform applications using React Native.',
        serviceCategory: 'MOBILE_DEVELOPMENT',
        requiredSkills: ['React Native', 'JavaScript', 'iOS', 'Android'],
        experienceLevel: 'INTERMEDIATE',
        engagementType: 'CONTRACT',
        duration: '6 months',
        budget: '$50,000 - $70,000',
        status: 'PUBLISHED',
        createdById: admin.id,
        publishedAt: new Date(),
      },
    }),
    prisma.job.upsert({
      where: { id: 'job-3' },
      update: {},
      create: {
        id: 'job-3',
        title: 'UI/UX Designer',
        description: 'Seeking a creative designer to design user interfaces and experiences for our web and mobile applications.',
        serviceCategory: 'DESIGN',
        requiredSkills: ['UI/UX Design', 'Figma', 'Prototyping', 'User Research'],
        experienceLevel: 'SENIOR',
        engagementType: 'FULL_TIME',
        duration: 'Permanent',
        budget: '$60,000 - $90,000',
        status: 'PUBLISHED',
        createdById: admin.id,
        publishedAt: new Date(),
      },
    }),
    prisma.job.upsert({
      where: { id: 'job-4' },
      update: {},
      create: {
        id: 'job-4',
        title: 'Data Analyst',
        description: 'Looking for a data analyst to help us make data-driven decisions. Experience with Python and SQL required.',
        serviceCategory: 'DATA_ANALYSIS',
        requiredSkills: ['Python', 'SQL', 'Data Visualization', 'Statistics'],
        experienceLevel: 'INTERMEDIATE',
        engagementType: 'PART_TIME',
        duration: '3 months',
        budget: '$30,000 - $40,000',
        status: 'PUBLISHED',
        createdById: admin.id,
        publishedAt: new Date(),
      },
    }),
    prisma.job.upsert({
      where: { id: 'job-5' },
      update: {},
      create: {
        id: 'job-5',
        title: 'Content Marketing Specialist',
        description: 'We need a content marketing expert to create engaging content and manage our social media presence.',
        serviceCategory: 'MARKETING',
        requiredSkills: ['Content Marketing', 'SEO', 'Social Media', 'Analytics'],
        experienceLevel: 'SENIOR',
        engagementType: 'FREELANCE',
        duration: 'Ongoing',
        budget: '$40/hour',
        status: 'PUBLISHED',
        createdById: admin.id,
        publishedAt: new Date(),
      },
    }),
  ]);
  console.log(`✅ Created ${jobs.length} jobs`);

  // Create sample applications
  const applications = await Promise.all([
    prisma.application.upsert({
      where: {
        jobId_talentId: {
          jobId: 'job-1',
          talentId: talents[0].id, // John Doe
        },
      },
      update: {},
      create: {
        jobId: 'job-1',
        talentId: talents[0].id,
        status: 'SHORTLISTED',
        matchScore: 85.5,
        matchBreakdown: {
          skills: 90,
          experience: 80,
          category: 100,
        },
        shortlistedAt: new Date(),
      },
    }),
    prisma.application.upsert({
      where: {
        jobId_talentId: {
          jobId: 'job-2',
          talentId: talents[1].id, // Jane Smith
        },
      },
      update: {},
      create: {
        jobId: 'job-2',
        talentId: talents[1].id,
        status: 'NEW',
        matchScore: 92.0,
        matchBreakdown: {
          skills: 95,
          experience: 90,
          category: 100,
        },
      },
    }),
    prisma.application.upsert({
      where: {
        jobId_talentId: {
          jobId: 'job-3',
          talentId: talents[2].id, // Bob Johnson
        },
      },
      update: {},
      create: {
        jobId: 'job-3',
        talentId: talents[2].id,
        status: 'HIRED',
        matchScore: 88.0,
        matchBreakdown: {
          skills: 90,
          experience: 85,
          category: 100,
        },
        hiredAt: new Date(),
      },
    }),
    prisma.application.upsert({
      where: {
        jobId_talentId: {
          jobId: 'job-4',
          talentId: talents[3].id, // Alice Williams
        },
      },
      update: {},
      create: {
        jobId: 'job-4',
        talentId: talents[3].id,
        status: 'SHORTLISTED',
        matchScore: 95.0,
        matchBreakdown: {
          skills: 100,
          experience: 95,
          category: 100,
        },
        shortlistedAt: new Date(),
      },
    }),
    prisma.application.upsert({
      where: {
        jobId_talentId: {
          jobId: 'job-5',
          talentId: talents[5].id, // Diana Prince
        },
      },
      update: {},
      create: {
        jobId: 'job-5',
        talentId: talents[5].id,
        status: 'NEW',
        matchScore: 87.5,
        matchBreakdown: {
          skills: 90,
          experience: 85,
          category: 100,
        },
      },
    }),
  ]);
  console.log(`✅ Created ${applications.length} applications`);

  // Create sample audit logs
  const auditLogs = await Promise.all([
    prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: 'APPROVE_TALENT',
        resourceType: 'TALENT',
        resourceId: talents[0].id,
        metadata: {
          reason: 'Profile complete and verified',
        },
      },
    }),
    prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: 'PUBLISH_JOB',
        resourceType: 'JOB',
        resourceId: jobs[0].id,
        metadata: {
          reason: 'Job approved and published',
        },
      },
    }),
    prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: 'HIRE_TALENT',
        resourceType: 'APPLICATION',
        resourceId: applications[2].id,
        metadata: {
          jobId: jobs[2].id,
          talentId: talents[2].id,
        },
      },
    }),
  ]);
  console.log(`✅ Created ${auditLogs.length} audit logs`);

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📝 Seed Data Summary:');
  console.log(`   - Admins:`);
  console.log(`     * ${admin.email} (password: admin123, role: ${admin.role})`);
  console.log(`     * ${superAdmin.email} (password: superadmin123, role: ${superAdmin.role})`);
  console.log(`     * ${testAdmin.email} (password: testadmin123, role: ${testAdmin.role})`);
  console.log(`   - Talents: ${talents.length}`);
  console.log(`   - Jobs: ${jobs.length}`);
  console.log(`   - Applications: ${applications.length}`);
  console.log(`   - Audit Logs: ${auditLogs.length}`);
  console.log('\n🔐 Test Credentials:');
  console.log('   Use these credentials to test authentication:');
  console.log(`   Email: ${admin.email} | Password: admin123`);
  console.log(`   Email: ${superAdmin.email} | Password: superadmin123`);
  console.log(`   Email: ${testAdmin.email} | Password: testadmin123`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


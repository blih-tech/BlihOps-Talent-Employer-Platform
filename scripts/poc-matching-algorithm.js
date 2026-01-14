#!/usr/bin/env node

/**
 * Matching Algorithm Proof of Concept
 * 
 * Standalone script to demonstrate and test the matching algorithm
 * Run with: node scripts/poc-matching-algorithm.js
 */

// Constants (simplified for POC)
const ServiceCategory = {
  ITO: 'ITO',
  AI: 'AI',
  AUTOMATION: 'AUTOMATION',
  DATA_ANALYTICS: 'DATA_ANALYTICS',
};

const ExperienceLevel = {
  JUNIOR: 'JUNIOR',
  MID: 'MID',
  SENIOR: 'SENIOR',
  LEAD: 'LEAD',
  ARCHITECT: 'ARCHITECT',
};

const EngagementType = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  CONTRACT: 'CONTRACT',
  FREELANCE: 'FREELANCE',
  PROJECT_BASED: 'PROJECT_BASED',
};

// Matching utility functions (from packages/shared/src/utils/matching.util.ts)
function calculateSkillOverlap(talentSkills, jobSkills) {
  if (jobSkills.length === 0) {
    return 0;
  }

  const normalizedTalentSkills = talentSkills.map((s) => s.toLowerCase().trim());
  const normalizedJobSkills = jobSkills.map((s) => s.toLowerCase().trim());

  const matchingSkills = normalizedJobSkills.filter((jobSkill) =>
    normalizedTalentSkills.some((talentSkill) =>
      talentSkill.includes(jobSkill) || jobSkill.includes(talentSkill)
    )
  );

  return matchingSkills.length / normalizedJobSkills.length;
}

function calculateCategoryMatch(talentCategories, jobCategory) {
  if (Array.isArray(talentCategories)) {
    return talentCategories.includes(jobCategory) ? 1 : 0;
  }
  return talentCategories === jobCategory ? 1 : 0;
}

function calculateExperienceMatch(talentLevel, jobLevel) {
  if (!jobLevel) {
    return 0.5;
  }

  const levelHierarchy = {
    [ExperienceLevel.JUNIOR]: 1,
    [ExperienceLevel.MID]: 2,
    [ExperienceLevel.SENIOR]: 3,
    [ExperienceLevel.LEAD]: 4,
    [ExperienceLevel.ARCHITECT]: 5,
  };

  const talentRank = levelHierarchy[talentLevel];
  const jobRank = levelHierarchy[jobLevel];

  if (talentRank === jobRank) {
    return 1;
  }

  if (talentRank > jobRank) {
    const diff = talentRank - jobRank;
    return Math.max(0.7, 1 - diff * 0.1);
  }

  const diff = jobRank - talentRank;
  return Math.max(0, 1 - diff * 0.3);
}

function calculateEngagementMatch(talentPreference, jobEngagement) {
  if (!talentPreference) {
    return 0.5;
  }

  if (Array.isArray(talentPreference)) {
    return talentPreference.includes(jobEngagement) ? 1 : 0;
  }

  return talentPreference === jobEngagement ? 1 : 0;
}

function calculateMatchScore(talent, job, weights = {}) {
  const defaultWeights = {
    skillOverlap: 0.5,
    categoryMatch: 0.2,
    experienceMatch: 0.2,
    engagementMatch: 0.1,
  };

  const finalWeights = { ...defaultWeights, ...weights };

  const skillOverlap = calculateSkillOverlap(talent.skills, job.requiredSkills);
  const categoryMatch = calculateCategoryMatch(talent.serviceCategory, job.serviceCategory);
  const experienceMatch = calculateExperienceMatch(talent.experienceLevel, job.experienceLevel);
  const engagementMatch = calculateEngagementMatch(
    talent.engagementPreference,
    job.engagementType
  );

  const total =
    skillOverlap * finalWeights.skillOverlap +
    categoryMatch * finalWeights.categoryMatch +
    experienceMatch * finalWeights.experienceMatch +
    engagementMatch * finalWeights.engagementMatch;

  const score = Math.round(total * 100);

  const breakdown = {
    skillOverlap: Math.round(skillOverlap * 100),
    categoryMatch: Math.round(categoryMatch * 100),
    experienceMatch: Math.round(experienceMatch * 100),
    engagementMatch: Math.round(engagementMatch * 100),
    total: score,
  };

  return { score, breakdown };
}

// Sample data for testing
const sampleJob = {
  id: 'job-1',
  title: 'Senior Full-Stack Developer',
  serviceCategory: ServiceCategory.ITO,
  requiredSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL'],
  engagementType: EngagementType.FULL_TIME,
  experienceLevel: ExperienceLevel.SENIOR,
  description: 'Looking for an experienced full-stack developer...',
};

const sampleTalents = [
  {
    id: 'talent-1',
    name: 'Perfect Match',
    serviceCategory: ServiceCategory.ITO,
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'MongoDB'],
    experienceLevel: ExperienceLevel.SENIOR,
    engagementPreference: EngagementType.FULL_TIME,
  },
  {
    id: 'talent-2',
    name: 'Good Match',
    serviceCategory: ServiceCategory.ITO,
    skills: ['JavaScript', 'TypeScript', 'React', 'Vue'],
    experienceLevel: ExperienceLevel.MID,
    engagementPreference: [EngagementType.FULL_TIME, EngagementType.PART_TIME],
  },
  {
    id: 'talent-3',
    name: 'Partial Match',
    serviceCategory: ServiceCategory.AI,
    skills: ['Python', 'Machine Learning', 'TensorFlow'],
    experienceLevel: ExperienceLevel.SENIOR,
    engagementPreference: EngagementType.CONTRACT,
  },
  {
    id: 'talent-4',
    name: 'Over-Qualified',
    serviceCategory: ServiceCategory.ITO,
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker'],
    experienceLevel: ExperienceLevel.ARCHITECT,
    engagementPreference: EngagementType.FULL_TIME,
  },
  {
    id: 'talent-5',
    name: 'Under-Qualified',
    serviceCategory: ServiceCategory.ITO,
    skills: ['JavaScript', 'HTML', 'CSS'],
    experienceLevel: ExperienceLevel.JUNIOR,
    engagementPreference: EngagementType.FULL_TIME,
  },
  {
    id: 'talent-6',
    name: 'No Match',
    serviceCategory: ServiceCategory.DATA_ANALYTICS,
    skills: ['SQL', 'Excel', 'Tableau'],
    experienceLevel: ExperienceLevel.MID,
    engagementPreference: EngagementType.PART_TIME,
  },
];

// Test scenarios
function runTestScenarios() {
  console.log('='.repeat(80));
  console.log('Matching Algorithm Proof of Concept');
  console.log('='.repeat(80));
  console.log();

  console.log('Job Details:');
  console.log(`  Title: ${sampleJob.title}`);
  console.log(`  Category: ${sampleJob.serviceCategory}`);
  console.log(`  Required Skills: ${sampleJob.requiredSkills.join(', ')}`);
  console.log(`  Experience Level: ${sampleJob.experienceLevel}`);
  console.log(`  Engagement Type: ${sampleJob.engagementType}`);
  console.log();

  console.log('='.repeat(80));
  console.log('Matching Results:');
  console.log('='.repeat(80));
  console.log();

  const results = sampleTalents.map((talent) => {
    const startTime = process.hrtime.bigint();
    const match = calculateMatchScore(talent, sampleJob);
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds

    return {
      talent,
      match,
      duration,
    };
  });

  // Sort by score (descending)
  results.sort((a, b) => b.match.score - a.match.score);

  results.forEach((result, index) => {
    const { talent, match, duration } = result;
    console.log(`${index + 1}. ${talent.name} (Score: ${match.score}%)`);
    console.log(`   Category: ${Array.isArray(talent.serviceCategory) ? talent.serviceCategory.join(', ') : talent.serviceCategory}`);
    console.log(`   Skills: ${talent.skills.join(', ')}`);
    console.log(`   Experience: ${talent.experienceLevel}`);
    console.log(`   Engagement: ${Array.isArray(talent.engagementPreference) ? talent.engagementPreference.join(', ') : talent.engagementPreference || 'Not specified'}`);
    console.log(`   Breakdown:`);
    console.log(`     - Skill Overlap: ${match.breakdown.skillOverlap}%`);
    console.log(`     - Category Match: ${match.breakdown.categoryMatch}%`);
    console.log(`     - Experience Match: ${match.breakdown.experienceMatch}%`);
    console.log(`     - Engagement Match: ${match.breakdown.engagementMatch}%`);
    console.log(`   Calculation Time: ${duration.toFixed(3)}ms`);
    console.log();
  });

  // Performance summary
  console.log('='.repeat(80));
  console.log('Performance Summary:');
  console.log('='.repeat(80));
  const avgTime = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  const totalTime = results.reduce((sum, r) => sum + r.duration, 0);
  console.log(`  Total Talents: ${results.length}`);
  console.log(`  Average Time per Match: ${avgTime.toFixed(3)}ms`);
  console.log(`  Total Calculation Time: ${totalTime.toFixed(3)}ms`);
  console.log();

  // Estimated performance for larger datasets
  console.log('='.repeat(80));
  console.log('Estimated Performance (Extrapolated):');
  console.log('='.repeat(80));
  const estimates = [100, 1000, 10000];
  estimates.forEach((count) => {
    const estimatedTime = avgTime * count;
    console.log(`  ${count} talents: ~${(estimatedTime / 1000).toFixed(2)}s`);
  });
  console.log();
}

// Run performance benchmark
function runPerformanceBenchmark() {
  console.log('='.repeat(80));
  console.log('Performance Benchmark');
  console.log('='.repeat(80));
  console.log();

  const testSizes = [10, 100, 1000];
  const job = sampleJob;

  testSizes.forEach((size) => {
    // Generate test talents
    const testTalents = Array.from({ length: size }, (_, i) => ({
      id: `talent-${i}`,
      name: `Test Talent ${i}`,
      serviceCategory: ServiceCategory.ITO,
      skills: ['JavaScript', 'TypeScript', 'React'],
      experienceLevel: ExperienceLevel.SENIOR,
      engagementPreference: EngagementType.FULL_TIME,
    }));

    const startTime = process.hrtime.bigint();
    testTalents.forEach((talent) => {
      calculateMatchScore(talent, job);
    });
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds

    console.log(`  ${size} talents: ${duration.toFixed(2)}ms (${(duration / size).toFixed(3)}ms per match)`);
  });
  console.log();
}

// Main execution
if (require.main === module) {
  runTestScenarios();
  runPerformanceBenchmark();
  console.log('='.repeat(80));
  console.log('POC Complete!');
  console.log('='.repeat(80));
}

module.exports = {
  calculateMatchScore,
  calculateSkillOverlap,
  calculateCategoryMatch,
  calculateExperienceMatch,
  calculateEngagementMatch,
};


# Matching Algorithm Specification

**Version:** 1.0  
**Last Updated:** 2025-01-14  
**Implementation:** `packages/shared/src/utils/matching.util.ts`

## Overview

The matching algorithm calculates a compatibility score between talents and jobs based on multiple factors. The algorithm is designed to be flexible, configurable, and performant for real-time matching scenarios.

## Purpose

The algorithm serves to:
- Rank talents by their compatibility with a specific job
- Rank jobs by their compatibility with a specific talent
- Provide transparent score breakdowns for admin review
- Enable efficient on-the-fly matching without pre-computation

## Scoring Formula

The overall match score is calculated using a weighted sum of four factors:

```
Total Score = (Skill Overlap × 0.5) + (Category Match × 0.2) + (Experience Match × 0.2) + (Engagement Match × 0.1)
```

Final score is converted to a percentage (0-100).

### Weight Distribution

| Factor | Weight | Percentage | Description |
|--------|--------|------------|-------------|
| Skill Overlap | 0.5 | 50% | Primary factor - measures required skills match |
| Category Match | 0.2 | 20% | Service category alignment |
| Experience Match | 0.2 | 20% | Experience level compatibility |
| Engagement Match | 0.1 | 10% | Engagement type preference match |
| **Total** | **1.0** | **100%** | |

## Step-by-Step Calculation Process

### 1. Skill Overlap Calculation

**Function:** `calculateSkillOverlap(talentSkills: string[], jobSkills: string[])`

**Process:**
1. If job has no required skills, return 0
2. Normalize all skills to lowercase and trim whitespace
3. For each job skill, check if any talent skill contains it or vice versa (substring matching)
4. Count matching skills
5. Calculate: `matchingSkills.length / jobSkills.length`

**Returns:** Value between 0 and 1

**Example:**
- Job skills: `["JavaScript", "TypeScript", "React"]`
- Talent skills: `["JavaScript", "Node.js", "React", "Vue"]`
- Matching: `["JavaScript", "React"]` (2 out of 3)
- Score: `2/3 = 0.667` (66.7%)

### 2. Category Match Calculation

**Function:** `calculateCategoryMatch(talentCategories, jobCategory)`

**Process:**
1. If talent has multiple categories (array), check if job category is included
2. If talent has single category, check exact match
3. Return 1 if match, 0 otherwise

**Returns:** 0 or 1 (binary)

**Example:**
- Job category: `ServiceCategory.ITO`
- Talent categories: `[ServiceCategory.ITO, ServiceCategory.AI]`
- Score: `1` (100%)

### 3. Experience Match Calculation

**Function:** `calculateExperienceMatch(talentLevel, jobLevel?)`

**Process:**
1. If job doesn't specify level, return 0.5 (neutral)
2. Define hierarchy: JUNIOR=1, MID=2, SENIOR=3, LEAD=4, ARCHITECT=5
3. If talent rank equals job rank: return 1.0 (perfect match)
4. If talent rank > job rank (over-qualified):
   - Calculate: `max(0.7, 1 - (talentRank - jobRank) × 0.1)`
   - Slightly penalize over-qualification
5. If talent rank < job rank (under-qualified):
   - Calculate: `max(0, 1 - (jobRank - talentRank) × 0.3)`
   - More heavily penalize under-qualification

**Returns:** Value between 0 and 1

**Example:**
- Job level: `ExperienceLevel.SENIOR` (rank 3)
- Talent level: `ExperienceLevel.LEAD` (rank 4)
- Difference: 1
- Score: `max(0.7, 1 - 1 × 0.1) = 0.9` (90%)

### 4. Engagement Match Calculation

**Function:** `calculateEngagementMatch(talentPreference, jobEngagement)`

**Process:**
1. If talent hasn't specified preference, return 0.5 (neutral)
2. If talent has multiple preferences (array), check if job engagement is included
3. If talent has single preference, check exact match
4. Return 1 if match, 0 if no match

**Returns:** 0, 0.5, or 1

**Example:**
- Job engagement: `EngagementType.FULL_TIME`
- Talent preference: `[EngagementType.FULL_TIME, EngagementType.PART_TIME]`
- Score: `1` (100%)

### 5. Overall Score Calculation

**Function:** `calculateMatchScore(talent, job, weights?)`

**Process:**
1. Use default weights or provided custom weights
2. Calculate each factor score using functions above
3. Apply weighted sum: `Σ(factor × weight)`
4. Round to nearest integer (0-100)
5. Return score and breakdown

**Returns:** `{ score: number, breakdown: MatchScoreBreakdown }`

**Example:**
- Skill Overlap: 0.667 (66.7%)
- Category Match: 1.0 (100%)
- Experience Match: 0.9 (90%)
- Engagement Match: 1.0 (100%)
- Calculation: `(0.667 × 0.5) + (1.0 × 0.2) + (0.9 × 0.2) + (1.0 × 0.1) = 0.8335`
- Final Score: `83` (rounded)

## Cache Invalidation Strategy

**Current Implementation:** On-the-fly calculation (no pre-computation)

**Caching Strategy (Future):**
- Cache key format: `match:job:{jobId}:talent:{talentId}`
- TTL: 5 minutes (300 seconds)
- Invalidation triggers:
  - Talent profile update
  - Job update
  - New talent registration
  - New job creation

**Redis Cache Structure:**
```
match:job:{jobId}:talent:{talentId} = {
  score: 83,
  breakdown: {
    skillOverlap: 67,
    categoryMatch: 100,
    experienceMatch: 90,
    engagementMatch: 100,
    total: 83
  },
  calculatedAt: "2025-01-14T16:00:00Z"
}
```

## Performance Considerations

### Time Complexity
- Skill Overlap: O(n × m) where n = job skills, m = talent skills
- Category Match: O(1) or O(k) where k = talent categories
- Experience Match: O(1)
- Engagement Match: O(1) or O(k) where k = talent preferences
- Overall: O(n × m) - dominated by skill overlap

### Optimization Strategies
1. **Early Exit:** If category doesn't match, skip other calculations (return 0)
2. **Indexing:** Use PostgreSQL GIN indexes on skills arrays
3. **Caching:** Cache results in Redis with appropriate TTL
4. **Batch Processing:** For large datasets, process in batches
5. **Parallel Processing:** Calculate multiple matches concurrently

### Scalability
- **Small scale (< 1000 talents):** On-the-fly calculation is sufficient
- **Medium scale (1000-10000 talents):** Consider caching frequently accessed matches
- **Large scale (> 10000 talents):** Implement background workers for pre-computation

## Edge Cases and Handling

### Edge Case 1: Empty Job Skills
- **Scenario:** Job has no required skills
- **Handling:** Skill overlap returns 0
- **Impact:** Maximum possible score is 50% (if all other factors are perfect)

### Edge Case 2: Missing Experience Level
- **Scenario:** Job doesn't specify required experience level
- **Handling:** Experience match returns 0.5 (neutral)
- **Impact:** Reduces maximum possible score by 10% (0.2 weight × 0.5 score)

### Edge Case 3: No Engagement Preference
- **Scenario:** Talent hasn't specified engagement preference
- **Handling:** Engagement match returns 0.5 (neutral)
- **Impact:** Reduces maximum possible score by 5% (0.1 weight × 0.5 score)

### Edge Case 4: Over-Qualified Talent
- **Scenario:** Talent is significantly more experienced than required
- **Handling:** Score is reduced but capped at 0.7 minimum
- **Rationale:** Over-qualification is acceptable but not ideal

### Edge Case 5: Under-Qualified Talent
- **Scenario:** Talent is significantly less experienced than required
- **Handling:** Score is reduced more heavily (0.3 penalty per level)
- **Rationale:** Under-qualification is less acceptable

## Custom Weights

The algorithm supports custom weights for different use cases:

```typescript
const customWeights = {
  skillOverlap: 0.6,    // Increase skill importance
  categoryMatch: 0.15,  // Decrease category importance
  experienceMatch: 0.2,
  engagementMatch: 0.05
};

const result = calculateMatchScore(talent, job, customWeights);
```

**Note:** Weights should sum to 1.0 for meaningful results.

## Implementation Reference

- **Source Code:** `packages/shared/src/utils/matching.util.ts`
- **Type Definitions:** `packages/shared/src/types/matching.types.ts`
- **Constants:** `packages/shared/src/constants/`

## Future Enhancements

1. **Fuzzy Skill Matching:** Use similarity algorithms (Levenshtein distance) for better skill matching
2. **Location Matching:** Add geographic proximity as a factor
3. **Salary Range Matching:** Consider salary expectations
4. **Availability Matching:** Factor in talent availability dates
5. **Machine Learning:** Train ML model on successful matches to improve weights
6. **Multi-factor Scoring:** Add more factors (portfolio quality, certifications, etc.)

## Testing

Test scenarios should cover:
- Perfect matches (all factors = 1.0)
- Partial matches (mixed factors)
- No matches (all factors = 0.0)
- Edge cases (empty arrays, missing values)
- Custom weights
- Performance with large datasets

## Related Documentation

- [Architecture Documentation](./architecture.md#matching-algorithm-flow) - System architecture and flow diagrams
- [API Documentation](./api/README.md) - API endpoints for matching
- [Task Breakdown](../PROJECT_TASK_BREAKDOWN.md) - Project task tracking


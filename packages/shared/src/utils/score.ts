/**
 * Venue score weights
 */
export const VENUE_SCORE_WEIGHTS = {
  service: 0.2,
  atmosphere: 0.2,
  cleanliness: 0.15,
  value: 0.15,
  location: 0.1,
  noise: 0.1,
  overall: 0.1, // If provided separately
} as const;

/**
 * Calculate weighted average for venue scores
 */
export function calculateVenueOverallScore(scores: {
  service: number;
  atmosphere: number;
  cleanliness: number;
  value: number;
  location: number;
  noise: number;
}): number {
  const weights = VENUE_SCORE_WEIGHTS;
  
  // Sum without 'overall' weight since it's not in the input
  const totalWeight = 
    weights.service + 
    weights.atmosphere + 
    weights.cleanliness + 
    weights.value + 
    weights.location + 
    weights.noise;

  const weightedSum =
    scores.service * weights.service +
    scores.atmosphere * weights.atmosphere +
    scores.cleanliness * weights.cleanliness +
    scores.value * weights.value +
    scores.location * weights.location +
    scores.noise * weights.noise;

  return Math.round((weightedSum / totalWeight) * 10) / 10;
}

/**
 * Calculate weighted average for item scores based on criteria weights
 */
export function calculateItemOverallScore(
  criteriaScores: Record<string, number>,
  criteriaWeights: Record<string, number>
): number {
  let totalWeight = 0;
  let weightedSum = 0;

  for (const [criterion, score] of Object.entries(criteriaScores)) {
    const weight = criteriaWeights[criterion] || 1;
    weightedSum += score * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return 0;
  
  return Math.round((weightedSum / totalWeight) * 10) / 10;
}

/**
 * Calculate simple average (all criteria equal weight)
 */
export function calculateSimpleAverage(scores: number[]): number {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((a, b) => a + b, 0);
  return Math.round((sum / scores.length) * 10) / 10;
}

/**
 * Aggregate scores from multiple reviews
 */
export function aggregateScores(
  reviews: Array<{ overallScore: number }>
): {
  avgScore: number;
  reviewCount: number;
} {
  if (reviews.length === 0) {
    return { avgScore: 0, reviewCount: 0 };
  }

  const sum = reviews.reduce((acc, review) => acc + review.overallScore, 0);
  const avgScore = Math.round((sum / reviews.length) * 10) / 10;

  return {
    avgScore,
    reviewCount: reviews.length,
  };
}

/**
 * Aggregate criteria scores from multiple reviews
 */
export function aggregateCriteriaScores(
  reviews: Array<{ criteriaScores: Record<string, number> }>
): Record<string, number> {
  if (reviews.length === 0) return {};

  const criteriaSum: Record<string, number> = {};
  const criteriaCount: Record<string, number> = {};

  for (const review of reviews) {
    for (const [criterion, score] of Object.entries(review.criteriaScores)) {
      criteriaSum[criterion] = (criteriaSum[criterion] || 0) + score;
      criteriaCount[criterion] = (criteriaCount[criterion] || 0) + 1;
    }
  }

  const result: Record<string, number> = {};
  for (const criterion of Object.keys(criteriaSum)) {
    result[criterion] = Math.round((criteriaSum[criterion] / criteriaCount[criterion]) * 10) / 10;
  }

  return result;
}

/**
 * Format score for display (e.g., 4.5 → "4.5")
 */
export function formatScore(score: number | undefined | null): string {
  if (score === undefined || score === null) return '-';
  return score.toFixed(1);
}

/**
 * Get score color/class based on value
 */
export function getScoreColor(score: number): 'excellent' | 'good' | 'average' | 'poor' {
  if (score >= 4.5) return 'excellent';
  if (score >= 3.5) return 'good';
  if (score >= 2.5) return 'average';
  return 'poor';
}

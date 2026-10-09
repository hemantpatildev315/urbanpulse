/**
 * UrbanPulse NLP Triage & Safety Scoring Engine
 * Rule-based natural language classifier for real-time civic hazard intelligence.
 * @module triageEngine
 */

export type HazardCategory = 'accident_zone' | 'poor_lighting' | 'waterlogging' | 'traffic';
export type HazardSeverity = 'critical' | 'moderate' | 'low';

/**
 * Result structure produced by the citizen incident triage analysis.
 */
export interface TriageResult {
  /** Assigned incident category based on keyword density */
  category: HazardCategory;
  /** Severity tier used for prioritized routing and alerts */
  severity: HazardSeverity;
  /** Safety index penalty impact (0 to 100 scale deduction) */
  impact: number;
  /** Algorithmic confidence score (0.0 to 1.0) */
  confidence: number;
  /** Contextual metadata tags for dispatch and filtering */
  tags: string[];
  /** Recommended civic or traveler response advisory */
  recommendedAction: string;
}

// Immutable keyword matrices for rule-based civic NLP classification
const ACCIDENT_KEYWORDS: readonly string[] = [
  'accident',
  'crash',
  'blind spot',
  'collision',
  'skid',
  'overturn',
  'danger curve',
  'hit and run',
  'fatal',
  'pileup',
  'head-on'
];

const WATER_KEYWORDS: readonly string[] = [
  'waterlogging',
  'flood',
  'drain',
  'water',
  'waterlogged',
  'sewage overflow',
  'clogged gutter',
  'submerged',
  'puddle'
];

const LIGHTING_KEYWORDS: readonly string[] = [
  'dark',
  'pitch black',
  'no light',
  'streetlight',
  'unlit',
  'lamp broken',
  'broken streetlight',
  'blackout',
  'dimly lit',
  'zero visibility'
];

const CRITICAL_TRAFFIC_KEYWORDS: readonly string[] = [
  'complete gridlock',
  'standstill',
  'metro barricade block',
  'choked',
  'jam'
];

/**
 * Analyzes citizen incident descriptions using keyword-based NLP triage.
 * Evaluates semantic risk factors to determine category, severity, and localized impact.
 *
 * @param text - Plain-text incident report submitted by citizen
 * @returns Comprehensive TriageResult with severity rating, impact score, and tags
 */
export function analyzeIncidentReport(text: string): TriageResult {
  const normalized = text.toLowerCase().trim();

  if (!normalized) {
    return {
      category: 'traffic',
      severity: 'low',
      impact: 5,
      confidence: 0.5,
      tags: ['unclassified', 'awaiting-details'],
      recommendedAction: 'Provide additional details for accurate dispatch and classification.'
    };
  }

  const isAccident = ACCIDENT_KEYWORDS.some(keyword => normalized.includes(keyword));
  const isWater = WATER_KEYWORDS.some(keyword => normalized.includes(keyword));
  const isLighting = LIGHTING_KEYWORDS.some(keyword => normalized.includes(keyword));
  const isCriticalTraffic = CRITICAL_TRAFFIC_KEYWORDS.some(keyword => normalized.includes(keyword));

  let category: HazardCategory = 'traffic';
  let severity: HazardSeverity = 'low';
  let impact = 5;
  let confidence = 0.85;
  const tags: string[] = [];
  let recommendedAction = 'Drive with caution and observe standard civic traffic advisories.';

  if (isAccident) {
    category = 'accident_zone';
    severity = 'critical';
    impact = 20;
    confidence = 0.95;
    tags.push('critical-blackspot', 'emergency-dispatch', 'high-risk');
    recommendedAction = 'Avoid stretch; use verified well-lit bypass route immediately.';
  } else if (isWater) {
    category = 'waterlogging';
    severity = 'moderate';
    impact = 15;
    confidence = 0.90;
    tags.push('monsoon-alert', 'drainage-clog', 'low-traction');
    recommendedAction = 'Submerged curb detected; reduce vehicle speed to under 20 km/h.';
  } else if (isLighting) {
    category = 'poor_lighting';
    severity = 'moderate';
    impact = 12;
    confidence = 0.92;
    tags.push('pedestrian-hazard', 'night-safety', 'unlit-lane');
    recommendedAction = 'Pedestrians advised to take arterial well-lit avenue; high-beam illumination recommended.';
  } else if (isCriticalTraffic) {
    category = 'traffic';
    severity = 'moderate';
    impact = 10;
    confidence = 0.88;
    tags.push('peak-congestion', 'metro-diversion', 'slow-transit');
    recommendedAction = 'Anticipate 15-25 min delay; reroute through secondary connectors.';
  } else {
    tags.push('general-alert', 'civic-report');
  }

  return {
    category,
    severity,
    impact,
    confidence,
    tags,
    recommendedAction
  };
}

/**
 * Calculates updated safety index bounded between 0 and 100.
 * Ensures boundary constraints are strictly enforced without underflow or overflow.
 *
 * @param baseScore - Pre-incident baseline score for neighborhood (0 - 100)
 * @param impact - Penalty value determined by NLP triage (positive number)
 * @returns Normalized safety index clamped to [0, 100]
 */
export function calculateSafetyIndex(baseScore: number, impact: number): number {
  return Math.max(0, Math.min(100, baseScore - impact));
}

/**
 * User-facing alias for analyzeIncidentReport
 */
export const analyzeCitizenReport = analyzeIncidentReport;

export type HazardCategory = 'accident_zone' | 'poor_lighting' | 'waterlogging' | 'traffic';
export type HazardSeverity = 'critical' | 'moderate' | 'low';

export interface TriageResult {
  category: HazardCategory;
  severity: HazardSeverity;
  impact: number;
  confidence: number;
  tags: string[];
  recommendedAction: string;
}

// Keyword matrices for rule-based civic NLP classification
const ACCIDENT_KEYWORDS = [
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

const WATER_KEYWORDS = [
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

const LIGHTING_KEYWORDS = [
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

const CRITICAL_TRAFFIC_KEYWORDS = [
  'complete gridlock',
  'standstill',
  'metro barricade block',
  'choked',
  'jam'
];

/**
 * Analyzes citizen incident descriptions using keyword-based NLP triage
 * Returns category, severity, penalty impact, and contextual metadata.
 */
export function analyzeIncidentReport(text: string): TriageResult {
  const lower = text.toLowerCase();

  const isAccident = ACCIDENT_KEYWORDS.some(w => lower.includes(w));
  const isWater = WATER_KEYWORDS.some(w => lower.includes(w));
  const isLighting = LIGHTING_KEYWORDS.some(w => lower.includes(w));
  const isCriticalTraffic = CRITICAL_TRAFFIC_KEYWORDS.some(w => lower.includes(w));

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
 * Calculates updated safety index bounded between 0 and 100
 */
export function calculateSafetyIndex(baseScore: number, impact: number): number {
  return Math.max(0, Math.min(100, baseScore - impact));
}

// User-facing alias
export const analyzeCitizenReport = analyzeIncidentReport;


export type PlaceCategory = 'all' | 'heritage' | 'food' | 'nightlife' | 'budget_stay' | 'culture';
export type HazardCategory = 'accident_zone' | 'poor_lighting' | 'waterlogging' | 'traffic';
export type HazardSeverity = 'critical' | 'moderate' | 'low';
export type RouteMode = 'safe' | 'standard';

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory | string;
  lat: number;
  lng: number;
  rating: number;
  cost_range: string;
  cleanliness_score: number;
  safety_score: number;
  area_name: string;
  description: string;
  created_at?: string;
}

export interface HazardAlert {
  id: string;
  category: HazardCategory | string;
  severity: HazardSeverity;
  title: string;
  description: string;
  lat: number;
  lng: number;
  area_name: string;
  upvotes: number;
  reported_at?: string;
}

export interface AreaMetric {
  area_name: string;
  safety_index: number;
  cleanliness_index: number;
  transit_score: number;
  walkability_score: number;
  night_safety: number;
  updated_at?: string;
}

export interface TriageBadgeData {
  category: HazardCategory;
  severity: HazardSeverity;
  impact: number;
  confidence: number;
  tags: string[];
  recommendedAction: string;
}

import { describe, test, expect } from '@jest/globals';
import { analyzeIncidentReport, calculateSafetyIndex } from '../utils/triageEngine';

describe('UrbanPulse NLP Triage & Safety Scoring Engine', () => {
  test('correctly classifies high-risk road accident hazards as critical severity', () => {
    const result = analyzeIncidentReport('Major vehicle accident near blind spot');
    expect(result.category).toBe('accident_zone');
    expect(result.severity).toBe('critical');
    expect(result.impact).toBe(20);
    expect(result.tags).toContain('critical-blackspot');
  });

  test('correctly identifies poor lighting hazards with moderate severity', () => {
    const result = analyzeIncidentReport('Pitch black alley with broken streetlight');
    expect(result.category).toBe('poor_lighting');
    expect(result.severity).toBe('moderate');
    expect(result.impact).toBe(12);
    expect(result.tags).toContain('pedestrian-hazard');
  });

  test('correctly identifies waterlogging and monsoon drainage hazards', () => {
    const result = analyzeIncidentReport('Severe waterlogging with submerged street curb');
    expect(result.category).toBe('waterlogging');
    expect(result.severity).toBe('moderate');
    expect(result.impact).toBe(15);
  });

  test('accurately penalizes local safety index without dropping below zero', () => {
    const base = 85;
    const penalty = 20;
    const finalScore = calculateSafetyIndex(base, penalty);
    expect(finalScore).toBe(65);

    const zeroCapped = calculateSafetyIndex(10, 20);
    expect(zeroCapped).toBe(0);

    const maxCapped = calculateSafetyIndex(95, -10);
    expect(maxCapped).toBe(100);
  });
});
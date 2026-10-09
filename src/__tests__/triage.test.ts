import { describe, test, expect } from '@jest/globals';

// Core NLP triage and safety score logic
function analyzeIncidentReport(text: string) {
    const lower = text.toLowerCase();

    const isAccident = ['accident', 'crash', 'blind spot', 'collision'].some(w => lower.includes(w));
    const isLighting = ['dark', 'pitch black', 'no light', 'streetlight'].some(w => lower.includes(w));
    const isWater = ['waterlogging', 'flood', 'drain', 'water'].some(w => lower.includes(w));

    let category = 'traffic';
    let severity = 'low';
    let impact = 5;

    if (isAccident) {
        category = 'accident_zone';
        severity = 'critical';
        impact = 20;
    } else if (isWater) {
        category = 'waterlogging';
        severity = 'moderate';
        impact = 15;
    } else if (isLighting) {
        category = 'poor_lighting';
        severity = 'moderate';
        impact = 12;
    }

    return { category, severity, impact };
}

function calculateSafetyIndex(baseScore: number, impact: number): number {
    return Math.max(0, Math.min(100, baseScore - impact));
}

describe('UrbanPulse NLP Triage & Safety Scoring Engine', () => {
    test('correctly classifies high-risk road accident hazards as critical severity', () => {
        const result = analyzeIncidentReport('Major vehicle accident near blind spot');
        expect(result.category).toBe('accident_zone');
        expect(result.severity).toBe('critical');
        expect(result.impact).toBe(20);
    });

    test('correctly identifies poor lighting hazards with moderate severity', () => {
        const result = analyzeIncidentReport('Pitch black alley with broken streetlight');
        expect(result.category).toBe('poor_lighting');
        expect(result.severity).toBe('moderate');
    });

    test('accurately penalizes local safety index without dropping below zero', () => {
        const base = 85;
        const penalty = 20;
        const finalScore = calculateSafetyIndex(base, penalty);
        expect(finalScore).toBe(65);

        const zeroCapped = calculateSafetyIndex(10, 20);
        expect(zeroCapped).toBe(0);
    });
});
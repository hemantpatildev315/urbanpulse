import { describe, test, expect } from '@jest/globals';
import { fetchPlaces, fetchHazards, insertHazard, fetchAreaMetrics } from '../../api/db.js';
import placesHandler from '../../api/places.js';
import hazardsHandler from '../../api/hazards.js';
import reportHazardHandler from '../../api/report-hazard.js';
import metricsHandler from '../../api/metrics.js';
import type { ApiRequest, ApiResponse } from '../../api/_types.js';

function createMockResponse() {
  let statusCode = 200;
  let responseData: unknown = null;
  const headers: Record<string, string> = {};

  const res: ApiResponse = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(data: unknown) {
      responseData = data;
    },
    setHeader(name: string, value: string) {
      headers[name] = value;
      return res;
    },
    end() {
      // noop
    },
  };

  return {
    res,
    getStatusCode: () => statusCode,
    getData: () => responseData as Record<string, unknown>,
    getHeaders: () => headers,
  };
}

describe('UrbanPulse Phase 2 Serverless API Endpoints', () => {
  // 1. /api/places
  describe('GET /api/places', () => {
    test('fetches all places when category is omitted or "all"', async () => {
      const places = await fetchPlaces('all');
      expect(places.length).toBeGreaterThanOrEqual(10);
      const categories = new Set(places.map(p => p.category));
      expect(categories.has('heritage')).toBe(true);
      expect(categories.has('food')).toBe(true);
      expect(categories.has('nightlife')).toBe(true);
      expect(categories.has('budget_stay')).toBe(true);
    });

    test('filters places by "budget_stay" category', async () => {
      const places = await fetchPlaces('budget_stay');
      expect(places.length).toBeGreaterThan(0);
      expect(places.every(p => p.category === 'budget_stay')).toBe(true);
      const zostel = places.find(p => p.id === 'plc_zostel_pune');
      expect(zostel).toBeDefined();
      expect(zostel?.area_name).toBe('Viman Nagar');
    });

    test('placesHandler returns 200 with JSON payload and CORS headers', async () => {
      const { res, getStatusCode, getData, getHeaders } = createMockResponse();
      const req: ApiRequest = { method: 'GET', query: { category: 'food' } };

      await placesHandler(req, res);

      expect(getStatusCode()).toBe(200);
      expect(getHeaders()['Access-Control-Allow-Origin']).toBe('*');
      const data = getData();
      expect(data.success).toBe(true);
      expect(data.category).toBe('food');
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  // 2. /api/hazards
  describe('GET /api/hazards', () => {
    test('returns active civic alerts sorted with critical hazards prioritized', async () => {
      const hazards = await fetchHazards();
      expect(hazards.length).toBeGreaterThan(0);

      // Verify sorting: First items must be critical severity
      const firstHazard = hazards[0];
      expect(firstHazard.severity).toBe('critical');

      // Verify known Pune hazard hotspots
      const swargate = hazards.find(h => h.area_name === 'Swargate');
      expect(swargate).toBeDefined();
      expect(swargate?.severity).toBe('critical');
    });

    test('hazardsHandler supports query filtering by severity', async () => {
      const { res, getStatusCode, getData } = createMockResponse();
      const req: ApiRequest = { method: 'GET', query: { severity: 'critical' } };

      await hazardsHandler(req, res);

      expect(getStatusCode()).toBe(200);
      const data = getData();
      expect(data.success).toBe(true);
      const items = data.data as Array<{ severity: string }>;
      expect(items.every(h => h.severity === 'critical')).toBe(true);
    });
  });

  // 3. /api/report-hazard
  describe('POST /api/report-hazard', () => {
    test('triage categorizes and creates high-risk accident zone alert', async () => {
      const { res, getStatusCode, getData } = createMockResponse();
      const req: ApiRequest = {
        method: 'POST',
        body: {
          description: 'Serious vehicle collision and blind spot near Karve Road bridge',
          area_name: 'Karve Road',
        }
      };

      await reportHazardHandler(req, res);

      expect(getStatusCode()).toBe(201);
      const data = getData();
      expect(data.success).toBe(true);
      const triage = data.triage as Record<string, unknown>;
      expect(triage.category).toBe('accident_zone');
      expect(triage.severity).toBe('critical');
      expect(triage.impact).toBe(20);

      const created = data.data as Record<string, unknown>;
      expect(created.category).toBe('accident_zone');
      expect(created.area_name).toBe('Karve Road');
      expect(created.lat).toBe(18.5085);
    });

    test('returns 400 when description is missing in payload', async () => {
      const { res, getStatusCode, getData } = createMockResponse();
      const req: ApiRequest = {
        method: 'POST',
        body: { area_name: 'FC Road' }
      };

      await reportHazardHandler(req, res);

      expect(getStatusCode()).toBe(400);
      expect(getData().success).toBe(false);
    });

    test('insertHazard directly creates and persists hazard in store', async () => {
      const customHazard = await insertHazard({
        category: 'traffic',
        severity: 'moderate',
        title: 'Metro Barricade Traffic',
        description: 'Single lane traffic near Deccan',
        lat: 18.5173,
        lng: 73.8412,
        area_name: 'Deccan',
      });

      expect(customHazard.id).toBeDefined();
      expect(customHazard.category).toBe('traffic');
      expect(customHazard.area_name).toBe('Deccan');
    });
  });

  // 4. /api/metrics
  describe('GET /api/metrics', () => {
    test('returns area livability & safety metrics including Pune key areas', async () => {
      const metrics = await fetchAreaMetrics();
      expect(metrics.length).toBeGreaterThanOrEqual(8);

      const areaNames = metrics.map(m => m.area_name);
      expect(areaNames).toContain('Shivajinagar');
      expect(areaNames).toContain('Kalyani Nagar');
      expect(areaNames).toContain('Swargate');
      expect(areaNames).toContain('FC Road');
    });

    test('metricsHandler supports side-by-side area comparison query', async () => {
      const { res, getStatusCode, getData } = createMockResponse();
      const req: ApiRequest = {
        method: 'GET',
        query: { area1: 'FC Road', area2: 'Swargate' }
      };

      await metricsHandler(req, res);

      expect(getStatusCode()).toBe(200);
      const data = getData();
      expect(data.type).toBe('comparison');
      const area1 = data.area1 as Record<string, unknown>;
      const area2 = data.area2 as Record<string, unknown>;
      expect(area1.area_name).toBe('FC Road');
      expect(area2.area_name).toBe('Swargate');
      expect(Number(area1.safety_index)).toBeGreaterThan(Number(area2.safety_index));
    });
  });
});

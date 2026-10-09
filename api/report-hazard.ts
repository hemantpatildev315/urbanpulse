import { insertHazard } from './db.js';
import { parseRequestBody, setCorsHeaders, type ApiRequest, type ApiResponse } from './_types.js';
import { analyzeIncidentReport } from '../src/utils/triageEngine.js';

interface ReportPayload {
  title?: string;
  description?: string;
  area_name?: string;
  lat?: number;
  lng?: number;
}

const PUNE_AREA_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'fc road': { lat: 18.5246, lng: 73.8415 },
  'shivajinagar': { lat: 18.5312, lng: 73.8525 },
  'kalyani nagar': { lat: 18.5482, lng: 73.9025 },
  'viman nagar': { lat: 18.5679, lng: 73.9143 },
  'deccan': { lat: 18.5173, lng: 73.8412 },
  'shaniwar wada': { lat: 18.5196, lng: 73.8553 },
  'swargate': { lat: 18.5018, lng: 73.8587 },
  'karve road': { lat: 18.5085, lng: 73.8260 },
  'ganeshkhind': { lat: 18.5378, lng: 73.8340 },
  'kothrud': { lat: 18.5074, lng: 73.8077 },
};

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      error: `Method ${req.method || 'UNKNOWN'} not allowed. Only POST is supported.`
    });
    return;
  }

  try {
    const payload = parseRequestBody<ReportPayload>(req.body);

    const description = payload.description?.trim();
    const areaName = payload.area_name?.trim() || 'Pune Central';

    if (!description) {
      res.status(400).json({
        success: false,
        error: 'Missing required field: "description" is required for civic incident triage.'
      });
      return;
    }

    // 1. Process description through NLP triage logic
    const triage = analyzeIncidentReport(description);

    // 2. Coordinate fallback deduction if client did not supply GPS pin
    let lat = typeof payload.lat === 'number' && !isNaN(payload.lat) ? payload.lat : undefined;
    let lng = typeof payload.lng === 'number' && !isNaN(payload.lng) ? payload.lng : undefined;

    if (lat === undefined || lng === undefined) {
      const areaKey = areaName.toLowerCase();
      const matchedArea = Object.keys(PUNE_AREA_COORDINATES).find(k => areaKey.includes(k));
      if (matchedArea) {
        lat = PUNE_AREA_COORDINATES[matchedArea].lat;
        lng = PUNE_AREA_COORDINATES[matchedArea].lng;
      } else {
        // Pune city center default
        lat = 18.5204;
        lng = 73.8567;
      }
    }

    // 3. Generate meaningful title if omitted
    const title = payload.title?.trim() ||
      `${triage.category.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} alert reported in ${areaName}`;

    // 4. Insert into database (TiDB or in-memory fallback)
    const newHazard = await insertHazard({
      category: triage.category,
      severity: triage.severity,
      title,
      description,
      lat,
      lng,
      area_name: areaName,
    });

    res.status(201).json({
      success: true,
      message: 'Citizen incident triage complete and logged to UrbanPulse safety intelligence network.',
      data: newHazard,
      triage: {
        category: triage.category,
        severity: triage.severity,
        impact: triage.impact,
        confidence: triage.confidence,
        tags: triage.tags,
        recommendedAction: triage.recommendedAction,
      }
    });
  } catch (err) {
    console.error('Error in /api/report-hazard endpoint:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to process citizen incident report.'
    });
  }
}

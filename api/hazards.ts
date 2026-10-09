import { fetchHazards } from './db.js';
import { setCorsHeaders, type ApiRequest, type ApiResponse } from './_types.js';

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({
      success: false,
      error: `Method ${req.method || 'UNKNOWN'} not allowed. Only GET is supported.`
    });
    return;
  }

  try {
    let hazards = await fetchHazards();

    const querySeverity = typeof req.query?.severity === 'string'
      ? req.query.severity.toLowerCase().trim()
      : undefined;

    const queryArea = typeof req.query?.area === 'string'
      ? req.query.area.toLowerCase().trim()
      : undefined;

    if (querySeverity) {
      hazards = hazards.filter(h => h.severity.toLowerCase() === querySeverity);
    }

    if (queryArea) {
      hazards = hazards.filter(h => h.area_name.toLowerCase().includes(queryArea));
    }

    res.status(200).json({
      success: true,
      count: hazards.length,
      data: hazards
    });
  } catch (err) {
    console.error('Error in /api/hazards endpoint:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve active hazard alerts'
    });
  }
}

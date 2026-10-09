import { fetchAreaMetrics } from './db.js';
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
    const metrics = await fetchAreaMetrics();

    const queryArea = typeof req.query?.area === 'string'
      ? req.query.area.toLowerCase().trim()
      : undefined;

    const area1Param = typeof req.query?.area1 === 'string' ? req.query.area1.toLowerCase().trim() : undefined;
    const area2Param = typeof req.query?.area2 === 'string' ? req.query.area2.toLowerCase().trim() : undefined;

    if (area1Param && area2Param) {
      const match1 = metrics.find(m => m.area_name.toLowerCase() === area1Param);
      const match2 = metrics.find(m => m.area_name.toLowerCase() === area2Param);

      res.status(200).json({
        success: true,
        type: 'comparison',
        area1: match1 || null,
        area2: match2 || null,
      });
      return;
    }

    if (queryArea) {
      const matched = metrics.filter(m => m.area_name.toLowerCase().includes(queryArea));
      res.status(200).json({
        success: true,
        count: matched.length,
        data: matched
      });
      return;
    }

    res.status(200).json({
      success: true,
      count: metrics.length,
      data: metrics
    });
  } catch (err) {
    console.error('Error in /api/metrics endpoint:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve locality safety metrics from UrbanPulse'
    });
  }
}

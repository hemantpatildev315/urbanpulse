import { fetchPlaces } from './db.js';
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
    let categoryParam: string | undefined;
    const queryCategory = req.query?.category;

    if (Array.isArray(queryCategory)) {
      categoryParam = queryCategory[0];
    } else if (typeof queryCategory === 'string') {
      categoryParam = queryCategory;
    }

    const places = await fetchPlaces(categoryParam);

    res.status(200).json({
      success: true,
      category: categoryParam || 'all',
      count: places.length,
      data: places
    });
  } catch (err) {
    console.error('Error in /api/places endpoint:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve places dataset from UrbanPulse'
    });
  }
}

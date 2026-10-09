import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables for local/server execution
dotenv.config();

export interface Place {
  id: string;
  name: string;
  category: 'heritage' | 'food' | 'nightlife' | 'culture' | string;
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
  category: 'traffic' | 'poor_lighting' | 'waterlogging' | 'accident_zone' | string;
  severity: 'critical' | 'moderate' | 'low';
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

// -------------------------------------------------------------
// Resilient In-Memory Fallback Dataset (Pune Realistic Data)
// -------------------------------------------------------------
export const MOCK_PLACES: Place[] = [
  {
    id: 'plc_shaniwar_wada',
    name: 'Shaniwar Wada Heritage Fort',
    category: 'heritage',
    lat: 18.5196,
    lng: 73.8553,
    rating: 4.6,
    cost_range: '₹50-100',
    cleanliness_score: 8.4,
    safety_score: 8.8,
    area_name: 'Shaniwar Wada',
    description: 'Iconic 18th-century Peshwa seat of power with sprawling historic gardens, ramparts, and evening heritage illumination.',
    created_at: '2026-03-01 10:00:00'
  },
  {
    id: 'plc_fc_road_hub',
    name: 'FC Road Walking & Street Food Strip',
    category: 'food',
    lat: 18.5246,
    lng: 73.8415,
    rating: 4.8,
    cost_range: '₹150-400',
    cleanliness_score: 8.2,
    safety_score: 9.3,
    area_name: 'FC Road',
    description: 'Legendary student thoroughfare packed with vibrant open-air cafes, book stalls, Vaishali, and bustling evening pedestrian walkways.',
    created_at: '2026-03-01 10:30:00'
  },
  {
    id: 'plc_cafe_goodluck',
    name: 'Cafe Goodluck (Deccan)',
    category: 'food',
    lat: 18.5173,
    lng: 73.8412,
    rating: 4.7,
    cost_range: '₹100-250',
    cleanliness_score: 8.6,
    safety_score: 9.1,
    area_name: 'Deccan',
    description: 'Pune institution established in 1935 famous for classic bun maska, Irani chai, and heritage cultural debates.',
    created_at: '2026-03-01 11:00:00'
  },
  {
    id: 'plc_kalyani_highstreet',
    name: 'Kalyani Nagar Promenade & Nightlife',
    category: 'nightlife',
    lat: 18.5482,
    lng: 73.9025,
    rating: 4.7,
    cost_range: '₹800-1800',
    cleanliness_score: 9.2,
    safety_score: 9.0,
    area_name: 'Kalyani Nagar',
    description: 'Cosmopolitan high street featuring top culinary spots, live music venues, well-lit sidewalks, and active evening patrols.',
    created_at: '2026-03-01 11:30:00'
  },
  {
    id: 'plc_viman_nagar_social',
    name: 'Viman Nagar Youth & Cafe District',
    category: 'nightlife',
    lat: 18.5679,
    lng: 73.9143,
    rating: 4.6,
    cost_range: '₹300-700',
    cleanliness_score: 8.9,
    safety_score: 8.9,
    area_name: 'Viman Nagar',
    description: 'Dynamic tech-and-campus neighborhood with Phoenix Marketcity, indie roasteries, and round-the-clock student dining.',
    created_at: '2026-03-01 12:00:00'
  },
  {
    id: 'plc_aga_khan_palace',
    name: 'Aga Khan Palace Heritage Grounds',
    category: 'heritage',
    lat: 18.5524,
    lng: 73.9015,
    rating: 4.8,
    cost_range: '₹50-100',
    cleanliness_score: 9.5,
    safety_score: 9.5,
    area_name: 'Kalyani Nagar',
    description: 'Majestic Italianate palace with tranquil lawns, profound historical memorials, and verified family-friendly security.',
    created_at: '2026-03-01 12:30:00'
  },
  {
    id: 'plc_lal_mahal',
    name: 'Lal Mahal Historic Palace',
    category: 'heritage',
    lat: 18.5182,
    lng: 73.8570,
    rating: 4.5,
    cost_range: '₹20-50',
    cleanliness_score: 8.1,
    safety_score: 8.5,
    area_name: 'Shaniwar Wada',
    description: 'Reconstructed historic red landmark dedicated to Chhatrapati Shivaji Maharaj and the historic core of Pune.',
    created_at: '2026-03-01 13:00:00'
  },
  {
    id: 'plc_deccan_gymkhana',
    name: 'Deccan Gymkhana Pavilion & Avenues',
    category: 'culture',
    lat: 18.5150,
    lng: 73.8400,
    rating: 4.5,
    cost_range: '₹100-300',
    cleanliness_score: 8.8,
    safety_score: 9.2,
    area_name: 'Deccan',
    description: 'Heritage athletic and cultural epicenter featuring lush avenues, theater auditoriums, and heritage sweet shops.',
    created_at: '2026-03-01 13:30:00'
  }
];

export const MOCK_HAZARDS: HazardAlert[] = [
  {
    id: 'hz_swargate_bottleneck',
    category: 'traffic',
    severity: 'critical',
    title: 'Swargate Flyover & Metro Junction Gridlock',
    description: 'Major arterial bottleneck with heavy bus and private vehicle spillover. 20-30 min transit delay during evening hours.',
    lat: 18.5018,
    lng: 73.8587,
    area_name: 'Swargate',
    upvotes: 48,
    reported_at: '2026-03-01 08:30:00'
  },
  {
    id: 'hz_ganeshkhind_metro',
    category: 'accident_zone',
    severity: 'critical',
    title: 'Ganeshkhind Flyover Construction Blind Curve',
    description: 'Ongoing metro pier construction creates acute lane squeeze and poorly marked barricades near University Circle.',
    lat: 18.5378,
    lng: 73.8340,
    area_name: 'Ganeshkhind',
    upvotes: 62,
    reported_at: '2026-03-01 09:15:00'
  },
  {
    id: 'hz_karve_rd_lighting',
    category: 'poor_lighting',
    severity: 'moderate',
    title: 'Karve Road Metro Shadow Unlit Stretch',
    description: 'Overhead elevated metro viaduct leaves 200m between Nal Stop and Kothrud dimly lit. Streetlights awaiting replacement.',
    lat: 18.5085,
    lng: 73.8260,
    area_name: 'Karve Road',
    upvotes: 31,
    reported_at: '2026-03-01 11:45:00'
  },
  {
    id: 'hz_deccan_river_waterlog',
    category: 'waterlogging',
    severity: 'moderate',
    title: 'Mutha Riverbed Causeway Drainage Overflow',
    description: 'Periodic shallow water pooling across the low-lying causeway lane following local municipal storm drain overflow.',
    lat: 18.5135,
    lng: 73.8432,
    area_name: 'Deccan',
    upvotes: 19,
    reported_at: '2026-03-01 12:20:00'
  },
  {
    id: 'hz_fc_road_alley',
    category: 'poor_lighting',
    severity: 'low',
    title: 'FC Road North Pedestrian Alleyway Dim Light',
    description: 'Broken sodium lamp on the campus connecting lane. Night navigators advised to take primary FC Road avenue.',
    lat: 18.5208,
    lng: 73.8428,
    area_name: 'FC Road',
    upvotes: 14,
    reported_at: '2026-03-01 14:10:00'
  }
];

export const MOCK_AREA_METRICS: AreaMetric[] = [
  {
    area_name: 'FC Road',
    safety_index: 92.4,
    cleanliness_index: 81.5,
    transit_score: 87.0,
    walkability_score: 94.2,
    night_safety: 91.8,
    updated_at: '2026-03-01 12:00:00'
  },
  {
    area_name: 'Kalyani Nagar',
    safety_index: 91.0,
    cleanliness_index: 93.5,
    transit_score: 82.0,
    walkability_score: 86.4,
    night_safety: 89.5,
    updated_at: '2026-03-01 12:00:00'
  },
  {
    area_name: 'Viman Nagar',
    safety_index: 88.5,
    cleanliness_index: 89.0,
    transit_score: 89.5,
    walkability_score: 88.0,
    night_safety: 87.2,
    updated_at: '2026-03-01 12:00:00'
  },
  {
    area_name: 'Deccan',
    safety_index: 90.2,
    cleanliness_index: 84.0,
    transit_score: 92.5,
    walkability_score: 90.0,
    night_safety: 88.0,
    updated_at: '2026-03-01 12:00:00'
  },
  {
    area_name: 'Shaniwar Wada',
    safety_index: 84.0,
    cleanliness_index: 78.5,
    transit_score: 85.0,
    walkability_score: 83.5,
    night_safety: 79.2,
    updated_at: '2026-03-01 12:00:00'
  },
  {
    area_name: 'Swargate',
    safety_index: 72.5,
    cleanliness_index: 68.0,
    transit_score: 96.0,
    walkability_score: 64.0,
    night_safety: 71.0,
    updated_at: '2026-03-01 12:00:00'
  },
  {
    area_name: 'Karve Road',
    safety_index: 83.5,
    cleanliness_index: 77.0,
    transit_score: 91.0,
    walkability_score: 76.5,
    night_safety: 80.5,
    updated_at: '2026-03-01 12:00:00'
  },
  {
    area_name: 'Ganeshkhind',
    safety_index: 78.0,
    cleanliness_index: 82.5,
    transit_score: 84.0,
    walkability_score: 70.0,
    night_safety: 74.0,
    updated_at: '2026-03-01 12:00:00'
  }
];

// In-memory writable copy for live fallback demo
const activeMockHazards: HazardAlert[] = [...MOCK_HAZARDS];

// -------------------------------------------------------------
// TiDB Cloud Serverless Connection Pool
// -------------------------------------------------------------
let pool: mysql.Pool | null = null;

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.TIDB_HOST && process.env.TIDB_USER);
}

export function getPool(): mysql.Pool | null {
  if (!isDatabaseConfigured()) {
    return null;
  }

  if (!pool) {
    try {
      pool = mysql.createPool({
        host: process.env.TIDB_HOST,
        port: Number(process.env.TIDB_PORT) || 4000,
        user: process.env.TIDB_USER,
        password: process.env.TIDB_PASSWORD || '',
        database: process.env.TIDB_DATABASE || 'urbanpulse',
        // CRITICAL: TiDB Cloud Serverless mandatory TLS/SSL configuration
        ssl: {
          minVersion: 'TLSv1.2',
          rejectUnauthorized: true,
        },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
      });
      console.log('✓ TiDB Cloud connection pool initialized with TLSv1.2');
    } catch (err) {
      console.error('Failed to create TiDB connection pool, falling back to mock data:', err);
      pool = null;
    }
  }

  return pool;
}

// -------------------------------------------------------------
// Resilient Database Access Methods with Fallback
// -------------------------------------------------------------

export async function queryDatabase<T = unknown>(sql: string, params: unknown[] = []): Promise<T | null> {
  const dbPool = getPool();
  if (!dbPool) return null;

  try {
    const [rows] = await dbPool.execute(sql, params);
    return rows as T;
  } catch (error) {
    console.warn('TiDB query error (falling back to in-memory store):', error);
    return null;
  }
}

export async function fetchPlaces(category?: string): Promise<Place[]> {
  const sql = category && category !== 'all'
    ? 'SELECT * FROM places WHERE category = ? ORDER BY rating DESC'
    : 'SELECT * FROM places ORDER BY rating DESC';
  const params = category && category !== 'all' ? [category] : [];

  const rows = await queryDatabase<Place[]>(sql, params);
  if (rows && rows.length > 0) {
    return rows.map((p) => ({
      ...p,
      lat: Number(p.lat),
      lng: Number(p.lng),
      rating: Number(p.rating),
      cleanliness_score: Number(p.cleanliness_score),
      safety_score: Number(p.safety_score),
    }));
  }

  // Fallback
  if (category && category !== 'all') {
    return MOCK_PLACES.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }
  return MOCK_PLACES;
}

export async function fetchHazards(): Promise<HazardAlert[]> {
  const rows = await queryDatabase<HazardAlert[]>(
    'SELECT * FROM hazard_alerts ORDER BY reported_at DESC, upvotes DESC'
  );

  if (rows && rows.length > 0) {
    return rows.map((h) => ({
      ...h,
      lat: Number(h.lat),
      lng: Number(h.lng),
      upvotes: Number(h.upvotes),
    }));
  }

  return activeMockHazards;
}

export async function insertHazard(hazard: Omit<HazardAlert, 'id' | 'upvotes' | 'reported_at'>): Promise<HazardAlert> {
  const newId = `hz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  const newHazard: HazardAlert = {
    id: newId,
    category: hazard.category,
    severity: hazard.severity,
    title: hazard.title,
    description: hazard.description,
    lat: Number(hazard.lat),
    lng: Number(hazard.lng),
    area_name: hazard.area_name,
    upvotes: 0,
    reported_at: now,
  };

  const dbPool = getPool();
  if (dbPool) {
    try {
      await dbPool.execute(
        `INSERT INTO hazard_alerts (id, category, severity, title, description, lat, lng, area_name, upvotes, reported_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newHazard.id,
          newHazard.category,
          newHazard.severity,
          newHazard.title,
          newHazard.description,
          newHazard.lat,
          newHazard.lng,
          newHazard.area_name,
          newHazard.upvotes,
          newHazard.reported_at,
        ]
      );
      return newHazard;
    } catch (err) {
      console.warn('Failed to insert into TiDB, saved to memory fallback:', err);
    }
  }

  // Fallback in-memory insert
  activeMockHazards.unshift(newHazard);
  return newHazard;
}

export async function fetchAreaMetrics(): Promise<AreaMetric[]> {
  const rows = await queryDatabase<AreaMetric[]>(
    'SELECT * FROM area_metrics ORDER BY safety_index DESC'
  );

  if (rows && rows.length > 0) {
    return rows.map((m) => ({
      ...m,
      safety_index: Number(m.safety_index),
      cleanliness_index: Number(m.cleanliness_index),
      transit_score: Number(m.transit_score),
      walkability_score: Number(m.walkability_score),
      night_safety: Number(m.night_safety),
    }));
  }

  return MOCK_AREA_METRICS;
}

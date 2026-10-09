import type { Place, HazardAlert, AreaMetric } from '../types/index.ts';

// Initial pre-seeded data for instant client-side rendering
const INITIAL_PLACES: Place[] = [
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
  },
  {
    id: 'plc_zostel_pune',
    name: 'Zostel Pune Community Hub',
    category: 'budget_stay',
    lat: 18.5640,
    lng: 73.9110,
    rating: 4.7,
    cost_range: '₹600-1200',
    cleanliness_score: 9.1,
    safety_score: 9.4,
    area_name: 'Viman Nagar',
    description: 'Premier backpacker hostel with vibrant rooftop co-working cafe, 24/7 biometric security, and solo traveler safety protocols.',
    created_at: '2026-03-01 14:00:00'
  },
  {
    id: 'plc_deccan_hostel',
    name: 'Deccan Youth & Student Hostel',
    category: 'budget_stay',
    lat: 18.5180,
    lng: 73.8390,
    rating: 4.5,
    cost_range: '₹500-900',
    cleanliness_score: 8.7,
    safety_score: 9.1,
    area_name: 'Deccan',
    description: 'Clean budget dormitory walking distance from FC Road with high-speed WiFi and safe verified access control.',
    created_at: '2026-03-01 14:30:00'
  },
  {
    id: 'plc_shivaji_stay',
    name: 'Shivajinagar Transit Pods & Stay',
    category: 'budget_stay',
    lat: 18.5320,
    lng: 73.8490,
    rating: 4.6,
    cost_range: '₹450-800',
    cleanliness_score: 8.9,
    safety_score: 9.0,
    area_name: 'Shivajinagar',
    description: 'Modern compact sleeping pods near Shivajinagar Metro and railway hub, purpose-built for hackathon attendees and commuters.',
    created_at: '2026-03-01 15:00:00'
  }
];

const INITIAL_HAZARDS: HazardAlert[] = [
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

const INITIAL_METRICS: AreaMetric[] = [
  {
    area_name: 'Shivajinagar',
    safety_index: 87.5,
    cleanliness_index: 83.0,
    transit_score: 95.0,
    walkability_score: 88.5,
    night_safety: 85.0,
    updated_at: '2026-03-01 12:00:00'
  },
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

// In-memory writable stores for client fallback
let localHazards: HazardAlert[] = [...INITIAL_HAZARDS];

export async function getPlaces(category?: string): Promise<Place[]> {
  try {
    const url = category && category !== 'all' ? `/api/places?category=${encodeURIComponent(category)}` : '/api/places';
    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch {
    // Silently fall back to in-memory dataset
  }

  if (category && category !== 'all') {
    return INITIAL_PLACES.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }
  return INITIAL_PLACES;
}

export async function getHazards(): Promise<HazardAlert[]> {
  try {
    const res = await fetch('/api/hazards');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch {
    // Silently fall back to in-memory dataset
  }

  return localHazards;
}

export async function submitHazardReport(payload: {
  title?: string;
  description: string;
  area_name: string;
  lat?: number;
  lng?: number;
}): Promise<{ success: boolean; data: HazardAlert; error?: string }> {
  try {
    const res = await fetch('/api/report-hazard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        localHazards = [json.data, ...localHazards];
        return { success: true, data: json.data };
      }
    }
  } catch {
    // Client-side fallback
  }

  // Create optimistic local hazard
  const newHazard: HazardAlert = {
    id: `hz_local_${Date.now()}`,
    category: 'traffic',
    severity: 'moderate',
    title: payload.title || `Incident Alert in ${payload.area_name}`,
    description: payload.description,
    area_name: payload.area_name,
    lat: payload.lat || 18.5204,
    lng: payload.lng || 73.8567,
    upvotes: 1,
    reported_at: 'Just now'
  };

  localHazards = [newHazard, ...localHazards];
  return { success: true, data: newHazard };
}

export async function getMetrics(): Promise<AreaMetric[]> {
  try {
    const res = await fetch('/api/metrics');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch {
    // Fallback
  }

  return INITIAL_METRICS;
}

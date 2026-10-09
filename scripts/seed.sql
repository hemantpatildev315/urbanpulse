-- =========================================================================
-- UrbanPulse Smart City Navigator & Safety Intelligence Schema & Seed Script
-- Target Database: TiDB Cloud Serverless (MySQL 8.0 Compatible)
-- Idempotent execution: Safe to run multiple times without duplicating data
-- =========================================================================

CREATE DATABASE IF NOT EXISTS urbanpulse;
USE urbanpulse;

-- -------------------------------------------------------------
-- 1. Table: places (Cultural Discovery, Heritage & Hospitality)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS places (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(64) NOT NULL, -- 'heritage' | 'food' | 'nightlife' | 'culture'
  lat DECIMAL(10, 7) NOT NULL,
  lng DECIMAL(10, 7) NOT NULL,
  rating DECIMAL(3, 2) NOT NULL DEFAULT 4.50,
  cost_range VARCHAR(32) NOT NULL DEFAULT '₹₹',
  cleanliness_score DECIMAL(3, 1) NOT NULL DEFAULT 8.0,
  safety_score DECIMAL(3, 1) NOT NULL DEFAULT 8.5,
  area_name VARCHAR(128) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_places_category (category),
  INDEX idx_places_area (area_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 2. Table: hazard_alerts (Real-Time Urban Chaos & Safety Incidents)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hazard_alerts (
  id VARCHAR(64) PRIMARY KEY,
  category VARCHAR(64) NOT NULL, -- 'traffic' | 'poor_lighting' | 'waterlogging' | 'accident_zone'
  severity VARCHAR(32) NOT NULL, -- 'critical' | 'moderate' | 'low'
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  lat DECIMAL(10, 7) NOT NULL,
  lng DECIMAL(10, 7) NOT NULL,
  area_name VARCHAR(128) NOT NULL,
  upvotes INT NOT NULL DEFAULT 0,
  reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_hazards_severity (severity),
  INDEX idx_hazards_area (area_name),
  INDEX idx_hazards_reported_at (reported_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- 3. Table: area_metrics (Locality Safety & Livability Index)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS area_metrics (
  area_name VARCHAR(128) PRIMARY KEY,
  safety_index DECIMAL(4, 1) NOT NULL,
  cleanliness_index DECIMAL(4, 1) NOT NULL,
  transit_score DECIMAL(4, 1) NOT NULL,
  walkability_score DECIMAL(4, 1) NOT NULL,
  night_safety DECIMAL(4, 1) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- Seed Data: Curated Pune Localities, Landmarks & Active Hazard Pins
-- =========================================================================

-- Seed: places
INSERT INTO places (id, name, category, lat, lng, rating, cost_range, cleanliness_score, safety_score, area_name, description)
VALUES
  ('plc_shaniwar_wada', 'Shaniwar Wada Heritage Fort', 'heritage', 18.5196000, 73.8553000, 4.60, '₹50-100', 8.4, 8.8, 'Shaniwar Wada', 'Iconic 18th-century Peshwa seat of power with sprawling historic gardens, ramparts, and evening heritage illumination.'),
  ('plc_fc_road_hub', 'FC Road Walking & Street Food Strip', 'food', 18.5246000, 73.8415000, 4.80, '₹150-400', 8.2, 9.3, 'FC Road', 'Legendary student thoroughfare packed with vibrant open-air cafes, book stalls, Vaishali, and bustling evening pedestrian walkways.'),
  ('plc_cafe_goodluck', 'Cafe Goodluck (Deccan)', 'food', 18.5173000, 73.8412000, 4.70, '₹100-250', 8.6, 9.1, 'Deccan', 'Pune institution established in 1935 famous for classic bun maska, Irani chai, and heritage cultural debates.'),
  ('plc_kalyani_highstreet', 'Kalyani Nagar Promenade & Nightlife', 'nightlife', 18.5482000, 73.9025000, 4.70, '₹800-1800', 9.2, 9.0, 'Kalyani Nagar', 'Cosmopolitan high street featuring top culinary spots, live music venues, well-lit sidewalks, and active evening patrols.'),
  ('plc_viman_nagar_social', 'Viman Nagar Youth & Cafe District', 'nightlife', 18.5679000, 73.9143000, 4.60, '₹300-700', 8.9, 8.9, 'Viman Nagar', 'Dynamic tech-and-campus neighborhood with Phoenix Marketcity, indie roasteries, and round-the-clock student dining.'),
  ('plc_aga_khan_palace', 'Aga Khan Palace Heritage Grounds', 'heritage', 18.5524000, 73.9015000, 4.80, '₹50-100', 9.5, 9.5, 'Kalyani Nagar', 'Majestic Italianate palace with tranquil lawns, profound historical memorials, and verified family-friendly security.'),
  ('plc_lal_mahal', 'Lal Mahal Historic Palace', 'heritage', 18.5182000, 73.8570000, 4.50, '₹20-50', 8.1, 8.5, 'Shaniwar Wada', 'Reconstructed historic red landmark dedicated to Chhatrapati Shivaji Maharaj and the historic core of Pune.'),
  ('plc_deccan_gymkhana', 'Deccan Gymkhana Pavilion & Avenues', 'culture', 18.5150000, 73.8400000, 4.50, '₹100-300', 8.8, 9.2, 'Deccan', 'Heritage athletic and cultural epicenter featuring lush avenues, theater auditoriums, and heritage sweet shops.')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  category = VALUES(category),
  lat = VALUES(lat),
  lng = VALUES(lng),
  rating = VALUES(rating),
  cost_range = VALUES(cost_range),
  cleanliness_score = VALUES(cleanliness_score),
  safety_score = VALUES(safety_score),
  area_name = VALUES(area_name),
  description = VALUES(description);

-- Seed: hazard_alerts
INSERT INTO hazard_alerts (id, category, severity, title, description, lat, lng, area_name, upvotes, reported_at)
VALUES
  ('hz_swargate_bottleneck', 'traffic', 'critical', 'Swargate Flyover & Metro Junction Gridlock', 'Major arterial bottleneck with heavy bus and private vehicle spillover. 20-30 min transit delay during evening hours.', 18.5018000, 73.8587000, 'Swargate', 48, NOW()),
  ('hz_ganeshkhind_metro', 'accident_zone', 'critical', 'Ganeshkhind Flyover Construction Blind Curve', 'Ongoing metro pier construction creates acute lane squeeze and poorly marked barricades near University Circle.', 18.5378000, 73.8340000, 'Ganeshkhind', 62, NOW()),
  ('hz_karve_rd_lighting', 'poor_lighting', 'moderate', 'Karve Road Metro Shadow Unlit Stretch', 'Overhead elevated metro viaduct leaves 200m between Nal Stop and Kothrud dimly lit. Streetlights awaiting replacement.', 18.5085000, 73.8260000, 'Karve Road', 31, NOW()),
  ('hz_deccan_river_waterlog', 'waterlogging', 'moderate', 'Mutha Riverbed Causeway Drainage Overflow', 'Periodic shallow water pooling across the low-lying causeway lane following local municipal storm drain overflow.', 18.5135000, 73.8432000, 'Deccan', 19, NOW()),
  ('hz_fc_road_alley', 'poor_lighting', 'low', 'FC Road North Pedestrian Alleyway Dim Light', 'Broken sodium lamp on the campus connecting lane. Night navigators advised to take primary FC Road avenue.', 18.5208000, 73.8428000, 'FC Road', 14, NOW())
ON DUPLICATE KEY UPDATE
  category = VALUES(category),
  severity = VALUES(severity),
  title = VALUES(title),
  description = VALUES(description),
  lat = VALUES(lat),
  lng = VALUES(lng),
  area_name = VALUES(area_name),
  upvotes = VALUES(upvotes);

-- Seed: area_metrics
INSERT INTO area_metrics (area_name, safety_index, cleanliness_index, transit_score, walkability_score, night_safety)
VALUES
  ('FC Road', 92.4, 81.5, 87.0, 94.2, 91.8),
  ('Kalyani Nagar', 91.0, 93.5, 82.0, 86.4, 89.5),
  ('Viman Nagar', 88.5, 89.0, 89.5, 88.0, 87.2),
  ('Deccan', 90.2, 84.0, 92.5, 90.0, 88.0),
  ('Shaniwar Wada', 84.0, 78.5, 85.0, 83.5, 79.2),
  ('Swargate', 72.5, 68.0, 96.0, 64.0, 71.0),
  ('Karve Road', 83.5, 77.0, 91.0, 76.5, 80.5),
  ('Ganeshkhind', 78.0, 82.5, 84.0, 70.0, 74.0)
ON DUPLICATE KEY UPDATE
  safety_index = VALUES(safety_index),
  cleanliness_index = VALUES(cleanliness_index),
  transit_score = VALUES(transit_score),
  walkability_score = VALUES(walkability_score),
  night_safety = VALUES(night_safety);

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Place, HazardAlert, RouteMode } from '../types/index.ts';
import { ShieldCheck, AlertTriangle, Navigation, Zap, Eye, CheckCircle2 } from 'lucide-react';

interface MapViewProps {
  places: Place[];
  hazards: HazardAlert[];
  selectedCategory: string;
  routeMode: RouteMode;
  onRouteChange: (mode: RouteMode) => void;
  onSelectPlace?: (place: Place) => void;
  onSelectHazard?: (hazard: HazardAlert) => void;
  onOpenReportModal: () => void;
}

// -------------------------------------------------------------
// Route Coordinates across Pune (Shaniwar Wada to FC Road)
// -------------------------------------------------------------
// Standard Route: Passes through low-lying river causeway and dim alleys (touches active hazards)
const STANDARD_ROUTE: [number, number][] = [
  [18.5196, 73.8553], // Shaniwar Wada
  [18.5140, 73.8500], // Congested Shivaji Road cross
  [18.5135, 73.8432], // Mutha river causeway (active waterlog alert)
  [18.5208, 73.8428], // FC Road unlit campus lane (dim light hazard)
  [18.5246, 73.8415], // FC Road Center
];

// Verified Safe Route: Follows well-lit arterial JM Road & illuminated promenade
const SAFE_ROUTE: [number, number][] = [
  [18.5196, 73.8553], // Shaniwar Wada
  [18.5225, 73.8540], // Dengle Bridge
  [18.5280, 73.8490], // Sancheti / JM Road North (Illuminated 6-lane artery)
  [18.5265, 73.8430], // Ghole Road Smart Corridor
  [18.5246, 73.8415], // FC Road Center
];

export default function MapView({
  places,
  hazards,
  selectedCategory,
  routeMode,
  onRouteChange,
  onOpenReportModal
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const placesLayerRef = useRef<L.LayerGroup | null>(null);
  const hazardsLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [18.5204, 73.8567], // Pune City Center
      zoom: 13,
      zoomControl: false,
    });

    // Free public OpenStreetMap tile layer (crisp, detailed, no watermark or API key)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Zoom control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    placesLayerRef.current = L.layerGroup().addTo(map);
    hazardsLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    // Ensure map tiles and dimensions calculate accurately on mount
    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Places Markers
  useEffect(() => {
    const layer = placesLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    if (selectedCategory === 'hazards') return;

    const filtered = selectedCategory === 'all'
      ? places
      : places.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());

    filtered.forEach(place => {
      let pinColor = '#10b981'; // emerald for heritage/culture
      let iconSymbol = '🏛️';

      if (place.category === 'food') {
        pinColor = '#f97316';
        iconSymbol = '☕';
      } else if (place.category === 'nightlife') {
        pinColor = '#8b5cf6';
        iconSymbol = '✨';
      } else if (place.category === 'budget_stay') {
        pinColor = '#0284c7';
        iconSymbol = '🛏️';
      }

      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="
            background: ${pinColor};
            width: 34px;
            height: 34px;
            border-radius: 50% 50% 50% 4px;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(15, 23, 42, 0.25);
            border: 2px solid #ffffff;
            cursor: pointer;
            transition: transform 0.2s ease;
          ">
            <span style="transform: rotate(45deg); font-size: 14px; user-select: none;">${iconSymbol}</span>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([place.lat, place.lng], { icon: customIcon });

      const popupHtml = `
        <div style="font-family: inherit; width: 260px; padding: 14px 16px; background: #ffffff;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 2px 8px; border-radius: 9999px; background: #ecfdf5; color: #047857;">
              ${place.category.toUpperCase().replace('_', ' ')}
            </span>
            <span style="font-size: 12px; font-weight: 700; color: #f59e0b; display: flex; align-items: center; gap: 2px;">
              ★ ${place.rating.toFixed(1)}
            </span>
          </div>
          <h3 style="margin: 0 0 4px; font-size: 15px; font-weight: 700; color: #0f172a; line-height: 1.3;">
            ${place.name}
          </h3>
          <p style="margin: 0 0 8px; font-size: 12px; color: #64748b;">
            📍 ${place.area_name} • <strong style="color: #334155;">${place.cost_range}</strong>
          </p>
          <p style="margin: 0 0 12px; font-size: 12px; color: #475569; line-height: 1.45;">
            ${place.description}
          </p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding-top: 8px; border-top: 1px solid #f1f5f9;">
            <div style="background: #f8fafc; padding: 6px 8px; border-radius: 8px; text-align: center;">
              <span style="font-size: 10px; color: #64748b; display: block;">Cleanliness</span>
              <strong style="font-size: 12px; color: #0f172a;">${place.cleanliness_score}/10</strong>
            </div>
            <div style="background: #ecfdf5; padding: 6px 8px; border-radius: 8px; text-align: center;">
              <span style="font-size: 10px; color: #047857; display: block;">Safety Score</span>
              <strong style="font-size: 12px; color: #047857;">${place.safety_score}/10</strong>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      layer.addLayer(marker);
    });
  }, [places, selectedCategory]);

  // Update Hazard Markers
  useEffect(() => {
    const layer = hazardsLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    hazards.forEach(hazard => {
      const isCritical = hazard.severity.toLowerCase() === 'critical';
      const pulseClass = isCritical ? 'hazard-pulse-critical' : 'hazard-pulse-moderate';
      const bgColor = isCritical ? '#ef4444' : '#f59e0b';

      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div class="${pulseClass}" style="
            background: ${bgColor};
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2.5px solid #ffffff;
            cursor: pointer;
            box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4);
          ">
            <span style="color: #ffffff; font-size: 14px; font-weight: 800;">!</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([hazard.lat, hazard.lng], { icon: customIcon });

      const severityBadgeBg = isCritical ? '#fef2f2' : '#fffbeb';
      const severityBadgeColor = isCritical ? '#b91c1c' : '#b45309';

      const popupHtml = `
        <div style="font-family: inherit; width: 270px; padding: 14px 16px; background: #ffffff;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 8px; border-radius: 9999px; background: ${severityBadgeBg}; color: ${severityBadgeColor};">
              ${hazard.severity.toUpperCase()} HAZARD
            </span>
            <span style="font-size: 11px; color: #64748b;">
              👍 ${hazard.upvotes} verified
            </span>
          </div>
          <h3 style="margin: 0 0 4px; font-size: 14px; font-weight: 700; color: #0f172a; line-height: 1.3;">
            ${hazard.title}
          </h3>
          <p style="margin: 0 0 6px; font-size: 11px; color: #64748b;">
            📍 ${hazard.area_name} • ${hazard.reported_at || 'Active alert'}
          </p>
          <div style="background: #f8fafc; border-left: 3px solid ${bgColor}; padding: 8px 10px; border-radius: 4px; margin-bottom: 8px;">
            <p style="margin: 0; font-size: 12px; color: #334155; line-height: 1.45;">
              ${hazard.description}
            </p>
          </div>
          <div style="font-size: 11px; color: #047857; font-weight: 600; display: flex; align-items: center; gap: 4px;">
            🛡️ Safe route bypasses this section
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      layer.addLayer(marker);
    });
  }, [hazards]);

  // Update Route Polylines
  useEffect(() => {
    const layer = routeLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    if (routeMode === 'safe') {
      // Solid Vibrant Emerald Safe Route
      const safePolyline = L.polyline(SAFE_ROUTE, {
        color: '#10b981',
        weight: 6,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      });
      safePolyline.bindPopup(`
        <div style="padding: 10px; font-size: 12px;">
          <strong style="color: #047857; font-size: 13px;">✓ Verified Safe & Well-Lit Route</strong>
          <p style="margin: 4px 0 0; color: #475569;">Bypasses low-lying river causeway and unlit student alleys via arterial JM Road.</p>
        </div>
      `);
      layer.addLayer(safePolyline);

      // Start & End markers for Safe Route
      const startMarker = L.circleMarker(SAFE_ROUTE[0], {
        radius: 7,
        fillColor: '#10b981',
        color: '#ffffff',
        weight: 3,
        fillOpacity: 1,
      }).bindTooltip('Start: Shaniwar Wada', { permanent: false });

      const endMarker = L.circleMarker(SAFE_ROUTE[SAFE_ROUTE.length - 1], {
        radius: 7,
        fillColor: '#059669',
        color: '#ffffff',
        weight: 3,
        fillOpacity: 1,
      }).bindTooltip('End: FC Road Hub', { permanent: false });

      layer.addLayer(startMarker);
      layer.addLayer(endMarker);
    } else {
      // Dashed Amber/Crimson Standard Route
      const standardPolyline = L.polyline(STANDARD_ROUTE, {
        color: '#ef4444',
        weight: 5,
        dashArray: '8, 8',
        opacity: 0.85,
        lineCap: 'round',
      });
      standardPolyline.bindPopup(`
        <div style="padding: 10px; font-size: 12px;">
          <strong style="color: #b91c1c; font-size: 13px;">⚠ Standard / Fastest Route</strong>
          <p style="margin: 4px 0 0; color: #475569;">Exposed to 2 active civic hazard zones (waterlogging causeway & dim lighting).</p>
        </div>
      `);
      layer.addLayer(standardPolyline);

      const startMarker = L.circleMarker(STANDARD_ROUTE[0], {
        radius: 7,
        fillColor: '#ef4444',
        color: '#ffffff',
        weight: 3,
        fillOpacity: 1,
      });

      const endMarker = L.circleMarker(STANDARD_ROUTE[STANDARD_ROUTE.length - 1], {
        radius: 7,
        fillColor: '#b91c1c',
        color: '#ffffff',
        weight: 3,
        fillOpacity: 1,
      });

      layer.addLayer(startMarker);
      layer.addLayer(endMarker);
    }
  }, [routeMode]);

  // Corridor focus handler
  const focusCorridor = (coords: [number, number], zoom = 14) => {
    mapInstanceRef.current?.flyTo(coords, zoom, { duration: 1.2 });
  };

  return (
    <div className="relative w-full h-full min-h-[600px] overflow-hidden" style={{ minHeight: 'calc(100vh - 70px)' }}>
      {/* Leaflet Canvas Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-full min-h-[600px] z-0"
        style={{ width: '100%', height: '100%', minHeight: 'calc(100vh - 70px)' }}
      />

      {/* Floating Smart Route Controller (Top Left) */}
      <div className="absolute top-4 left-4 z-[1000] w-80 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/80 p-4 transition-all">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">Smart Dual-Route Engine</h2>
          </div>
          <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200/60">
            Pune Central
          </span>
        </div>

        <p className="text-xs text-slate-500 mt-2 mb-3">
          Corridor: <span className="font-semibold text-slate-700">Shaniwar Wada</span> → <span className="font-semibold text-slate-700">FC Road</span>
        </p>

        {/* Toggle Switch */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl mb-3">
          <button
            type="button"
            onClick={() => onRouteChange('safe')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              routeMode === 'safe'
                ? 'bg-white text-emerald-700 shadow-sm border border-emerald-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Safe & Well-Lit
          </button>
          <button
            type="button"
            onClick={() => onRouteChange('standard')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              routeMode === 'standard'
                ? 'bg-white text-rose-700 shadow-sm border border-rose-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Standard / Fast
          </button>
        </div>

        {/* Dynamic Route Stats Card */}
        {routeMode === 'safe' ? (
          <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-2.5 space-y-1.5 text-xs text-slate-700">
            <div className="flex items-center justify-between font-semibold text-emerald-900">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Zero Active Hazards
              </span>
              <span>10 min • 3.2 km</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Route follows well-patrolled, 6-lane JM Road & smart streetlights. Skirts waterlogged causeway and dim alleys.
            </p>
            <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-700 pt-1 border-t border-emerald-200/40">
              <Eye className="w-3 h-3" />
              <span>98% High-Luminance LED Coverage</span>
            </div>
          </div>
        ) : (
          <div className="bg-rose-50/80 border border-rose-200/60 rounded-xl p-2.5 space-y-1.5 text-xs text-slate-700">
            <div className="flex items-center justify-between font-semibold text-rose-900">
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                2 Active Civic Hazards
              </span>
              <span>8 min • 2.8 km</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Fastest path passes through Mutha River causeway drainage overflow & unlit campus connector.
            </p>
            <div className="flex items-center gap-1 text-[10px] font-medium text-rose-700 pt-1 border-t border-rose-200/40">
              <AlertTriangle className="w-3 h-3" />
              <span>Dim Visibility & Waterlogging Risk</span>
            </div>
          </div>
        )}
      </div>

      {/* Floating Pune Neighborhood Quick-Jump Bar (Top Center) */}
      <div className="hidden md:flex absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-slate-200/80 px-2 py-1.5 items-center gap-1 text-xs">
        <span className="text-[11px] font-semibold text-slate-500 px-2">Jump to:</span>
        <button
          onClick={() => focusCorridor([18.5246, 73.8415], 15)}
          className="px-2.5 py-1 rounded-full text-slate-700 hover:bg-slate-100 font-medium transition cursor-pointer"
        >
          FC Road
        </button>
        <button
          onClick={() => focusCorridor([18.5196, 73.8553], 15)}
          className="px-2.5 py-1 rounded-full text-slate-700 hover:bg-slate-100 font-medium transition cursor-pointer"
        >
          Shaniwar Wada
        </button>
        <button
          onClick={() => focusCorridor([18.5482, 73.9025], 14)}
          className="px-2.5 py-1 rounded-full text-slate-700 hover:bg-slate-100 font-medium transition cursor-pointer"
        >
          Kalyani Nagar
        </button>
        <button
          onClick={() => focusCorridor([18.5679, 73.9143], 14)}
          className="px-2.5 py-1 rounded-full text-slate-700 hover:bg-slate-100 font-medium transition cursor-pointer"
        >
          Viman Nagar
        </button>
        <button
          onClick={() => focusCorridor([18.5018, 73.8587], 15)}
          className="px-2.5 py-1 rounded-full text-rose-700 hover:bg-rose-50 font-medium transition cursor-pointer"
        >
          Swargate (Hazards)
        </button>
      </div>

      {/* Floating Action Trigger Button (Bottom Left) */}
      <div className="absolute bottom-5 left-4 z-[1000] flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenReportModal}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs md:text-sm px-4 py-2.5 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          Report Civic Hazard
        </button>
      </div>

      {/* Map Legend (Bottom Center / Left) */}
      <div className="hidden lg:flex absolute bottom-5 left-64 z-[999] bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200/80 px-3.5 py-2 items-center gap-4 text-[11px] text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Heritage / Culture</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-orange-500" />
          <span>Food Spots</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-purple-500" />
          <span>Nightlife</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-sky-500" />
          <span>Budget Stays</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500" />
          <span>Active Hazard</span>
        </div>
      </div>
    </div>
  );
}

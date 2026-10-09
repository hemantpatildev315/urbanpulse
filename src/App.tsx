import { useState, useEffect } from 'react';
import MapView from './components/MapView.tsx';
import ReportModal from './components/ReportModal.tsx';
import AreaComparison from './components/AreaComparison.tsx';
import { getPlaces, getHazards, getMetrics, submitHazardReport } from './services/api.ts';
import type { Place, HazardAlert, AreaMetric, RouteMode } from './types/index.ts';
import {
  Compass,
  AlertTriangle,
  Layers,
  BarChart3,
  PlusCircle,
  CheckCircle2,
  Shield,
  Search,
} from 'lucide-react';

export default function App() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [hazards, setHazards] = useState<HazardAlert[]>([]);
  const [metrics, setMetrics] = useState<AreaMetric[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [routeMode, setRouteMode] = useState<RouteMode>('safe');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initial Data Load
  useEffect(() => {
    async function loadData() {
      const [placesData, hazardsData, metricsData] = await Promise.all([
        getPlaces(),
        getHazards(),
        getMetrics(),
      ]);
      setPlaces(placesData);
      setHazards(hazardsData);
      setMetrics(metricsData);
    }
    loadData();
  }, []);

  // Filter places based on search query
  const filteredPlaces = places.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.area_name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  });

  // Handle new hazard report submission
  const handleReportSubmit = async (payload: {
    title: string;
    description: string;
    area_name: string;
  }) => {
    const res = await submitHazardReport(payload);
    if (res.success && res.data) {
      setHazards((prev) => [res.data, ...prev]);
      setToastMessage(`Incident logged: ${res.data.title}`);
      setTimeout(() => setToastMessage(null), 4000);
      return res.data;
    }
    return null;
  };

  const categories = [
    { id: 'all', label: 'All Sights', icon: Compass },
    { id: 'heritage', label: 'Heritage', icon: Shield },
    { id: 'food', label: 'Street Food & Cafes', icon: Layers },
    { id: 'nightlife', label: 'Nightlife', icon: Layers },
    { id: 'budget_stay', label: 'Budget Stays', icon: Layers },
    { id: 'hazards', label: 'Active Hazards', icon: AlertTriangle, count: hazards.length },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-50 flex flex-col font-sans select-none">
      {/* Top Floating App Bar */}
      <header className="absolute top-0 inset-x-0 z-[1100] px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3 pointer-events-none">
        {/* Brand & Mission Badge */}
        <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-slate-200/80 pointer-events-auto">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white font-black text-base">
            UP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold text-slate-900 tracking-tight">UrbanPulse</h1>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                Pune Live
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Smart City Navigator & Safety Intelligence</p>
          </div>
        </div>

        {/* Category Chips Bar */}
        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-slate-200/80 overflow-x-auto max-w-full pointer-events-auto">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isSelected
                    ? cat.id === 'hazards'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-slate-900 text-white shadow-sm'
                    : cat.id === 'hazards'
                    ? 'text-rose-600 hover:bg-rose-50 font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{cat.label}</span>
                {cat.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Search Input */}
          <div className="relative hidden xl:block w-52">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search spots or areas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/95 backdrop-blur-md pl-8 pr-3 py-2 rounded-2xl text-xs text-slate-800 placeholder:text-slate-400 border border-slate-200/80 shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Area Comparison Trigger */}
          <button
            onClick={() => setIsComparisonOpen(true)}
            className="flex items-center gap-1.5 bg-white/95 hover:bg-white text-slate-800 font-semibold text-xs px-3.5 py-2 rounded-2xl shadow-lg border border-slate-200/80 transition hover:scale-105 active:scale-95 cursor-pointer"
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Compare Areas</span>
          </button>

          {/* Report Hazard Trigger */}
          <button
            onClick={() => setIsReportOpen(true)}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-3.5 py-2 rounded-2xl shadow-lg transition hover:scale-105 active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Report Incident</span>
          </button>
        </div>
      </header>

      {/* Main Interactive Map Canvas */}
      <main className="flex-1 w-full h-full relative">
        <MapView
          places={filteredPlaces}
          hazards={hazards}
          selectedCategory={selectedCategory}
          routeMode={routeMode}
          onRouteChange={setRouteMode}
          onOpenReportModal={() => setIsReportOpen(true)}
        />
      </main>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="absolute bottom-6 right-6 z-[2100] bg-slate-900 text-white text-xs font-medium px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Citizen Report Modal with Real-Time AI NLP Triage */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onSubmit={handleReportSubmit}
      />

      {/* Area Comparison Matrix */}
      <AreaComparison
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        metrics={metrics}
      />
    </div>
  );
}

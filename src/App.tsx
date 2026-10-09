import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import MapView from './components/MapView.tsx';
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

// Dynamic lazy imports for modal dialog components to optimize initial bundle execution
const ReportModal = lazy(() => import('./components/ReportModal.tsx'));
const AreaComparison = lazy(() => import('./components/AreaComparison.tsx'));

interface CategoryConfig {
  id: string;
  label: string;
  icon: typeof Compass;
  count?: number;
}

export default function App() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [hazards, setHazards] = useState<HazardAlert[]>([]);
  const [metrics, setMetrics] = useState<AreaMetric[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [routeMode, setRouteMode] = useState<RouteMode>('safe');
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 300ms Debounce on search queries to minimize unnecessary DOM computations
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Initial Data Ingestion
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [placesData, hazardsData, metricsData] = await Promise.all([
          getPlaces(),
          getHazards(),
          getMetrics(),
        ]);
        if (isMounted) {
          setPlaces(placesData);
          setHazards(hazardsData);
          setMetrics(metricsData);
        }
      } catch (err) {
        console.error('Initial data synchronization error:', err);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Memoized place filtering by debounced search term
  const filteredPlaces = useMemo(() => {
    if (!debouncedSearch.trim()) return places;
    const q = debouncedSearch.toLowerCase().trim();
    return places.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.area_name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [places, debouncedSearch]);

  // Optimistic submission handler with automatic toast notifications
  const handleReportSubmit = useCallback(
    async (payload: { title: string; description: string; area_name: string }) => {
      const res = await submitHazardReport(payload);
      if (res.success && res.data) {
        setHazards((prev) => [res.data, ...prev]);
        setTimeout(() => setToastMessage(null), 4000);
        return res.data;
      }
      return null;
    },
    []
  );

  const handleOpenReport = useCallback(() => setIsReportOpen(true), []);
  const handleCloseReport = useCallback(() => setIsReportOpen(false), []);
  const handleOpenComparison = useCallback(() => setIsComparisonOpen(true), []);
  const handleCloseComparison = useCallback(() => setIsComparisonOpen(false), []);
  const handleRouteChange = useCallback((mode: RouteMode) => setRouteMode(mode), []);
  const handleCategorySelect = useCallback((catId: string) => setSelectedCategory(catId), []);

  const categories: readonly CategoryConfig[] = useMemo(
    () => [
      { id: 'all', label: 'All Sights', icon: Compass },
      { id: 'heritage', label: 'Heritage', icon: Shield },
      { id: 'food', label: 'Street Food & Cafes', icon: Layers },
      { id: 'nightlife', label: 'Nightlife', icon: Layers },
      { id: 'budget_stay', label: 'Budget Stays', icon: Layers },
      { id: 'hazards', label: 'Active Hazards', icon: AlertTriangle, count: hazards.length },
    ],
    [hazards.length]
  );

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-50 flex flex-col font-sans select-none">
      {/* Top Floating App Bar with Semantic Landmarks */}
      <header
        role="banner"
        className="absolute top-0 inset-x-0 z-[1100] px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3 pointer-events-none"
      >
        {/* Brand Identity & Real-time Live Badge */}
        <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-slate-200/80 pointer-events-auto">
          <div
            className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white font-black text-base"
            aria-hidden="true"
          >
            UP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold text-slate-900 tracking-tight">UrbanPulse</h1>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                Pune Live
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Smart City Navigator & Safety Intelligence</p>
          </div>
        </div>

        {/* Category Chips Bar with Accessible Semantics */}
        <nav
          aria-label="Discovery and Hazard Category Filters"
          className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-slate-200/80 overflow-x-auto max-w-full pointer-events-auto"
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-label={`Filter spots by ${cat.label}`}
                onClick={() => handleCategorySelect(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
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
        </nav>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Accessible Search Input with Explicit Label */}
          <div className="relative hidden xl:block w-52">
            <label htmlFor="spot-search" className="sr-only">
              Search spots or areas in Pune
            </label>
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              id="spot-search"
              type="search"
              placeholder="Search spots or areas..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search spots or areas in Pune"
              className="w-full bg-white/95 backdrop-blur-md pl-8 pr-3 py-2 rounded-2xl text-xs text-slate-800 placeholder:text-slate-400 border border-slate-200/80 shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            />
          </div>

          {/* Area Comparison Trigger */}
          <button
            type="button"
            onClick={handleOpenComparison}
            aria-label="Open Pune neighborhood comparison matrix"
            className="flex items-center gap-1.5 bg-white/95 hover:bg-white text-slate-800 font-semibold text-xs px-3.5 py-2 rounded-2xl shadow-lg border border-slate-200/80 transition hover:scale-105 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
            <span>Compare Areas</span>
          </button>

          {/* Report Hazard Trigger */}
          <button
            type="button"
            onClick={handleOpenReport}
            aria-label="Open citizen incident reporting form"
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-3.5 py-2 rounded-2xl shadow-lg transition hover:scale-105 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <PlusCircle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Report Incident</span>
          </button>
        </div>
      </header>

      {/* Main Interactive Map Canvas */}
      <main role="main" className="flex-1 w-full h-full min-h-[600px] relative">
        <MapView
          places={filteredPlaces}
          hazards={hazards}
          selectedCategory={selectedCategory}
          routeMode={routeMode}
          onRouteChange={handleRouteChange}
          onOpenReportModal={handleOpenReport}
        />
      </main>

      {/* Accessible Global Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="absolute bottom-6 right-6 z-[2100] bg-slate-900 text-white text-xs font-medium px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Lazy Suspense Fallbacks for Dialog Modals */}
      <Suspense fallback={null}>
        {isReportOpen && (
          <ReportModal
            isOpen={isReportOpen}
            onClose={handleCloseReport}
            onSubmit={handleReportSubmit}
          />
        )}
      </Suspense>

      <Suspense fallback={null}>
        {isComparisonOpen && (
          <AreaComparison
            isOpen={isComparisonOpen}
            onClose={handleCloseComparison}
            metrics={metrics}
          />
        )}
      </Suspense>
    </div>
  );
}

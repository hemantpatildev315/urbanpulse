import { useState, useMemo, useCallback, useEffect } from 'react';
import { X, ShieldCheck, Sparkles, Bus, Footprints, Moon, ArrowRight } from 'lucide-react';
import type { AreaMetric } from '../types/index.ts';

interface AreaComparisonProps {
  /** Flag determining whether the comparison matrix dialog is visible */
  isOpen: boolean;
  /** Callback fired to close the modal */
  onClose: () => void;
  /** Full list of neighborhood safety & livability metrics */
  metrics: AreaMetric[];
}

interface DimensionConfig {
  label: string;
  key: keyof Pick<AreaMetric, 'safety_index' | 'cleanliness_index' | 'transit_score' | 'walkability_score' | 'night_safety'>;
  icon: typeof ShieldCheck;
  description: string;
}

const COMPARISON_DIMENSIONS: readonly DimensionConfig[] = [
  {
    label: 'Overall Safety Index',
    key: 'safety_index',
    icon: ShieldCheck,
    description: 'Crime resistance, lighting density, and verified citizen reports',
  },
  {
    label: 'Cleanliness Index',
    key: 'cleanliness_index',
    icon: Sparkles,
    description: 'Municipal sanitation, waste clearance, and drainage quality',
  },
  {
    label: 'Transit Access Score',
    key: 'transit_score',
    icon: Bus,
    description: 'Metro, PMPML bus corridor, and auto connectivity',
  },
  {
    label: 'Walkability Score',
    key: 'walkability_score',
    icon: Footprints,
    description: 'Pedestrian sidewalks, crossing signals, and traffic calmness',
  },
  {
    label: 'Night Pedestrian Safety',
    key: 'night_safety',
    icon: Moon,
    description: 'Illumination levels, commercial presence, and late-night security',
  },
];

export default function AreaComparison({ isOpen, onClose, metrics }: AreaComparisonProps) {
  const [area1Name, setArea1Name] = useState<string>('FC Road');
  const [area2Name, setArea2Name] = useState<string>('Swargate');

  // Close modal on Escape key press (WCAG 2.1 AA keyboard navigation)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Memoized area selections for optimal runtime efficiency
  const area1 = useMemo(() => {
    return metrics.find((m) => m.area_name.toLowerCase() === area1Name.toLowerCase()) || metrics[0];
  }, [metrics, area1Name]);

  const area2 = useMemo(() => {
    return metrics.find((m) => m.area_name.toLowerCase() === area2Name.toLowerCase()) || metrics[1] || metrics[0];
  }, [metrics, area2Name]);

  const handleSelectArea1 = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setArea1Name(e.target.value);
  }, []);

  const handleSelectArea2 = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setArea2Name(e.target.value);
  }, []);

  if (!isOpen || !area1 || !area2) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="comparison-modal-title"
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm transition-opacity"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Civic Intelligence Matrix
              </span>
            </div>
            <h2 id="comparison-modal-title" className="text-lg font-bold text-slate-900 mt-0.5">
              Pune Neighborhood Comparison Matrix
            </h2>
            <p className="text-xs text-slate-500">
              Side-by-side civic metrics across safety, livability, transit, and walkability
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close neighborhood comparison dialog"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </header>

        {/* Locality Selectors with Explicit Accessible Labels */}
        <section aria-label="Select Neighborhood Localities to Compare" className="p-6 border-b border-slate-100 bg-slate-50/30 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Locality 1 */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <label htmlFor="area-select-a" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Locality A
            </label>
            <select
              id="area-select-a"
              value={area1Name}
              onChange={handleSelectArea1}
              aria-label="Select first locality for comparison"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              {metrics.map((m) => (
                <option key={`a-${m.area_name}`} value={m.area_name}>
                  {m.area_name} (Safety: {m.safety_index})
                </option>
              ))}
            </select>
          </div>

          {/* Locality 2 */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
            <label htmlFor="area-select-b" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Locality B
            </label>
            <select
              id="area-select-b"
              value={area2Name}
              onChange={handleSelectArea2}
              aria-label="Select second locality for comparison"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              {metrics.map((m) => (
                <option key={`b-${m.area_name}`} value={m.area_name}>
                  {m.area_name} (Safety: {m.safety_index})
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Comparison Table / Matrix */}
        <section aria-label="Metric Comparison Breakdown" className="p-6 overflow-y-auto space-y-5">
          {COMPARISON_DIMENSIONS.map((dim) => {
            const Icon = dim.icon;
            const val1 = area1[dim.key];
            const val2 = area2[dim.key];
            const diff = Number((val1 - val2).toFixed(1));

            return (
              <div key={dim.key} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Icon className="w-4 h-4 text-slate-500" aria-hidden="true" />
                    <span>{dim.label}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {diff > 0 ? (
                      <span className="text-emerald-600 font-bold">
                        {area1.area_name} +{diff} pts
                      </span>
                    ) : diff < 0 ? (
                      <span className="text-emerald-600 font-bold">
                        {area2.area_name} +{Math.abs(diff)} pts
                      </span>
                    ) : (
                      <span className="text-slate-400">Tied</span>
                    )}
                  </span>
                </div>

                {/* Comparative Dual Bars with WCAG 2.1 AA Progressbar Roles */}
                <div className="space-y-1.5">
                  {/* Area 1 Bar */}
                  <div className="flex items-center gap-3">
                    <span className="w-24 text-[11px] font-semibold text-slate-600 truncate">
                      {area1.area_name}
                    </span>
                    <div
                      role="progressbar"
                      aria-valuenow={val1}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${area1.area_name} ${dim.label}: ${val1.toFixed(1)} out of 100`}
                      className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden flex"
                    >
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          val1 >= val2 ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, val1))}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-xs font-bold text-slate-800">
                      {val1.toFixed(1)}
                    </span>
                  </div>

                  {/* Area 2 Bar */}
                  <div className="flex items-center gap-3">
                    <span className="w-24 text-[11px] font-semibold text-slate-600 truncate">
                      {area2.area_name}
                    </span>
                    <div
                      role="progressbar"
                      aria-valuenow={val2}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${area2.area_name} ${dim.label}: ${val2.toFixed(1)} out of 100`}
                      className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden flex"
                    >
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          val2 >= val1 ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, val2))}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-xs font-bold text-slate-800">
                      {val2.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Automated Civic Recommendation */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span>Civic Navigator Summary</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-900">{area1.area_name}</strong> is optimal for{' '}
              {area1.walkability_score > 85 ? 'pedestrian exploration and vibrant cafe walks' : 'commute connectivity'}, while{' '}
              <strong className="text-slate-900">{area2.area_name}</strong> offers{' '}
              {area2.transit_score > 90 ? 'superior multimodal transit terminals' : 'residential tranquility'}. For night navigation after 9 PM, always review active hazard pins.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close neighborhood comparison matrix"
            className="px-5 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            Close Matrix
          </button>
        </footer>
      </div>
    </div>
  );
}

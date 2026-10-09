import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { X, Sparkles, AlertTriangle, ShieldAlert, Send, MapPin, CheckCircle2 } from 'lucide-react';
import { analyzeCitizenReport } from '../utils/triageEngine.ts';
import type { HazardAlert } from '../types/index.ts';

interface ReportModalProps {
  /** Boolean indicating if the modal is currently rendered */
  isOpen: boolean;
  /** Callback invoked when the modal is closed */
  onClose: () => void;
  /** Async submission handler returning the newly created HazardAlert */
  onSubmit: (report: { title: string; description: string; area_name: string }) => Promise<HazardAlert | null>;
}

const PUNE_LOCALITIES: readonly string[] = [
  'FC Road',
  'Deccan',
  'Shivajinagar',
  'Swargate',
  'Ganeshkhind',
  'Karve Road',
  'Kalyani Nagar',
  'Viman Nagar',
  'Shaniwar Wada',
  'Kothrud',
];

const PRESET_SCENARIOS: readonly string[] = [
  'Major vehicle accident near blind spot',
  'Pitch black alley with broken streetlight',
  'Severe waterlogging with submerged street curb',
  'Metro pillar barricade causing traffic bottleneck',
];

export default function ReportModal({ isOpen, onClose, onSubmit }: ReportModalProps) {
  const [areaName, setAreaName] = useState<string>('FC Road');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

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

  // Live real-time NLP classification with useMemo for high runtime efficiency
  const triage = useMemo(() => {
    if (!description.trim()) return null;
    return analyzeCitizenReport(description);
  }, [description]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const generatedTitle = `${(triage?.category || 'hazard')
        .replace('_', ' ')
        .replace(/\b\w/g, c => c.toUpperCase())} alert reported in ${areaName}`;

      const result = await onSubmit({
        title: generatedTitle,
        description,
        area_name: areaName,
      });

      if (result) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setDescription('');
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to submit incident report:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [description, isSubmitting, triage?.category, areaName, onSubmit, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm transition-opacity"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-100" aria-hidden="true">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 id="report-modal-title" className="text-base font-bold text-slate-900 leading-tight">
                Report Civic Hazard
              </h2>
              <p className="text-xs text-slate-500">
                Real-time incident reporting with automated AI NLP triage
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close incident reporting dialog"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </header>

        {isSuccess ? (
          <div role="status" aria-live="polite" className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto" aria-hidden="true">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Incident Successfully Triaged & Logged!</h3>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              The UrbanPulse safety score for <strong className="text-slate-800">{areaName}</strong> has been recalculated and the map updated.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Locality Selector */}
            <div>
              <label htmlFor="incident-locality" className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                Select Locality
              </label>
              <select
                id="incident-locality"
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                aria-label="Select Pune neighborhood locality"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs md:text-sm text-slate-800 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                {PUNE_LOCALITIES.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Description Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="incident-description" className="text-xs font-semibold text-slate-700">
                  Incident Description
                </label>
                <span id="incident-desc-hint" className="text-[11px] text-slate-400">Describe conditions in plain English</span>
              </div>
              <textarea
                id="incident-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Major vehicle accident near blind spot, or pitch black alley with broken streetlight..."
                rows={3}
                aria-required="true"
                aria-describedby="incident-desc-hint"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs md:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition resize-none"
              />
            </div>

            {/* Quick Prompt Presets */}
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Sample hazard report presets">
              <span className="text-[10px] text-slate-400 font-semibold self-center mr-1">Quick Test:</span>
              {PRESET_SCENARIOS.map((scenario) => (
                <button
                  type="button"
                  key={scenario}
                  aria-label={`Insert sample text: ${scenario}`}
                  onClick={() => setDescription(scenario)}
                  className="text-[11px] bg-slate-100 hover:bg-slate-200/80 text-slate-600 px-2 py-1 rounded-md transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  {scenario.length > 28 ? scenario.slice(0, 28) + '...' : scenario}
                </button>
              ))}
            </div>

            {/* Real-Time AI NLP Triage Preview Card */}
            {triage && (
              <section
                role="status"
                aria-live="polite"
                aria-label="Real-time incident triage analysis"
                className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2.5 animate-in fade-in duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                    <span>Live AI Triage Analysis</span>
                  </div>
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {Math.round(triage.confidence * 100)}% Confidence
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {/* Category Chip */}
                  <span className="font-semibold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                    Category: <strong className="text-slate-900">{triage.category.replace('_', ' ').toUpperCase()}</strong>
                  </span>

                  {/* Severity Badge */}
                  <span
                    className={`font-bold px-2.5 py-1 rounded-lg border ${
                      triage.severity === 'critical'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : triage.severity === 'moderate'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-sky-50 text-sky-700 border-sky-200'
                    }`}
                  >
                    {triage.severity.toUpperCase()} SEVERITY
                  </span>

                  {/* Safety Score Impact */}
                  <span className="font-bold text-rose-600 bg-rose-50/60 border border-rose-200/60 px-2.5 py-1 rounded-lg">
                    -{triage.impact} pts Safety Penalty
                  </span>
                </div>

                {/* Context Tags */}
                {triage.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1" aria-label="Incident tags">
                    {triage.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-medium bg-slate-200/60 text-slate-600 px-2 py-0.5 rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Recommended Civic Action */}
                <div className="flex items-start gap-1.5 text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{triage.recommendedAction}</span>
                </div>
              </section>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                aria-label="Cancel incident reporting"
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!description.trim() || isSubmitting}
                aria-label="Submit citizen incident report for AI classification"
                className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white font-medium text-xs md:text-sm px-5 py-2.5 rounded-xl shadow transition-transform active:scale-95 disabled:pointer-events-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
              >
                <Send className="w-3.5 h-3.5" aria-hidden="true" />
                {isSubmitting ? 'Triaging...' : 'Submit Citizen Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

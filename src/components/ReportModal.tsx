import React, { useState, useMemo } from 'react';
import { X, Sparkles, AlertTriangle, ShieldAlert, Send, MapPin, CheckCircle2 } from 'lucide-react';
import { analyzeCitizenReport } from '../utils/triageEngine.ts';
import type { HazardAlert } from '../types/index.ts';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: { title: string; description: string; area_name: string }) => Promise<HazardAlert | null>;
}

const PUNE_LOCALITIES = [
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

const PRESET_SCENARIOS = [
  'Major vehicle accident near blind spot',
  'Pitch black alley with broken streetlight',
  'Severe waterlogging with submerged street curb',
  'Metro pillar barricade causing traffic bottleneck',
];

export default function ReportModal({ isOpen, onClose, onSubmit }: ReportModalProps) {
  const [areaName, setAreaName] = useState('FC Road');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Live real-time NLP classification
  const triage = useMemo(() => {
    if (!description.trim()) return null;
    return analyzeCitizenReport(description);
  }, [description]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
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
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Report Civic Hazard
              </h2>
              <p className="text-xs text-slate-500">
                Real-time incident reporting with automated AI NLP triage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Incident Successfully Triaged & Logged!</h3>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              The UrbanPulse safety score for <strong className="text-slate-800">{areaName}</strong> has been recalculated and the map updated.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Area Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                Select Locality
              </label>
              <select
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs md:text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
                <label className="block text-xs font-semibold text-slate-700">
                  Incident Description
                </label>
                <span className="text-[11px] text-slate-400">Describe conditions in plain English</span>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Major vehicle accident near blind spot, or pitch black alley with broken streetlight..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs md:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition resize-none"
              />
            </div>

            {/* Quick Prompt Presets */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] text-slate-400 font-semibold self-center mr-1">Quick Test:</span>
              {PRESET_SCENARIOS.map((scenario) => (
                <button
                  type="button"
                  key={scenario}
                  onClick={() => setDescription(scenario)}
                  className="text-[11px] bg-slate-100 hover:bg-slate-200/80 text-slate-600 px-2 py-1 rounded-md transition cursor-pointer"
                >
                  {scenario.length > 28 ? scenario.slice(0, 28) + '...' : scenario}
                </button>
              ))}
            </div>

            {/* Real-Time AI NLP Triage Preview Card */}
            {triage && (
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
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
                  <div className="flex flex-wrap gap-1 pt-1">
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
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>{triage.recommendedAction}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!description.trim() || isSubmitting}
                className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white font-medium text-xs md:text-sm px-5 py-2.5 rounded-xl shadow transition-transform active:scale-95 disabled:pointer-events-none cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? 'Triaging...' : 'Submit Citizen Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

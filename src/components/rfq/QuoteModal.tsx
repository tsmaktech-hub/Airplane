import React, { useState } from 'react';
import { AircraftPart, RFQData } from '../../types/aviation';
import { X, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

interface QuoteModalProps {
  part: AircraftPart | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  part,
  isOpen,
  onClose,
}) => {
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [formData, setFormData] = useState<RFQData>({
    companyName: '',
    contactName: '',
    contactEmail: '',
    phone: '',
    deliveryAirportCode: '',
    priorityLevel: 'Critical AOG (Aircraft On Ground)',
    notes: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ref = `RFQ-AC-${Math.floor(10000 + Math.random() * 90000)}`;
    setSubmittedRef(ref);
  };

  const handleResetAndClose = () => {
    setSubmittedRef(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/50">
          <div>
            <h3 className="text-base font-bold text-white font-tech">
              REQUEST FORMAL RFQ
            </h3>
            <span className="text-xs text-cyan-400 font-mono-numbers">
              {part ? `P/N: ${part.partNumber} · ${part.name}` : 'Multi-Part General RFQ'}
            </span>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submittedRef ? (
            <div className="py-6 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white font-tech">
                FORMAL QUOTE DISPATCHED
              </h4>
              <p className="mt-2 text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
                Our aviation contract specialists will issue signed pricing, trace paperwork, and freight logistics within 15 minutes.
              </p>
              <div className="mt-4 p-3 bg-neutral-950 border border-neutral-800 rounded text-xs font-mono-numbers text-neutral-300">
                Tracking Dossier: <strong className="text-cyan-400">{submittedRef}</strong>
              </div>
              <button
                onClick={handleResetAndClose}
                className="mt-6 w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs font-medium transition-colors"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Company / Commercial Carrier</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lufthansa Technik / SkyLine Airways"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Contact Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Chief of Procurement"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Destination Airport (ICAO)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KJFK / EDDF"
                    value={formData.deliveryAirportCode}
                    onChange={(e) => setFormData({ ...formData, deliveryAirportCode: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white focus:outline-none focus:border-cyan-500 uppercase font-mono-numbers"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    placeholder="procurement@airline.aero"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">AOG Criticality</label>
                  <select
                    value={formData.priorityLevel}
                    onChange={(e) => setFormData({ ...formData, priorityLevel: e.target.value as any })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Critical AOG (Aircraft On Ground)">Critical AOG (Air Freight Urgent)</option>
                    <option value="Routine">Standard Quotation</option>
                    <option value="Scheduled Heavy Check">Heavy Check Scheduled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Special Requirements & Trace</label>
                <textarea
                  rows={2}
                  placeholder="Need FAA 8130-3 / EASA dual release, tare weight verification, or rotable exchange core deposit details."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-2"
              >
                <span>Request Certified Quotation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { CartItem, RFQData } from '../../types/aviation';
import { X, Trash2, ArrowRight, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (partId: string, quantity: number) => void;
  onRemoveItem: (partId: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [isSubmittingRFQ, setIsSubmittingRFQ] = useState(false);
  const [rfqSubmitted, setRfqSubmitted] = useState<string | null>(null);

  const [rfqForm, setRfqForm] = useState<RFQData>({
    companyName: 'SkyLine Commercial Airways',
    contactName: 'Capt. Marcus Vance',
    contactEmail: 'm.vance@skyline-ops.aero',
    phone: '+1 (555) 019-2834',
    deliveryAirportCode: 'KJFK',
    priorityLevel: 'Critical AOG (Aircraft On Ground)',
    notes: 'Urgent rotable delivery required before 06:00 UTC maintenance shift.',
  });

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => {
    return acc + (item.part.priceUSD ? item.part.priceUSD * item.quantity : 0);
  }, 0);

  const pricedItemsCount = items.filter((i) => i.part.priceUSD !== null).length;
  const quoteItemsCount = items.filter((i) => i.part.priceUSD === null).length;

  const handleSubmitOrderOrRFQ = (e: React.FormEvent) => {
    e.preventDefault();
    const trackingRef = `AERO-${Math.floor(100000 + Math.random() * 900000)}`;
    setRfqSubmitted(trackingRef);
    onClearCart();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-neutral-900 border-l border-neutral-800 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/40">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight font-tech">
                AIRCRAFT PROCUREMENT CART
              </h2>
              <span className="text-xs font-mono-numbers text-cyan-400">
                {items.length} Component Line Items
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 flex-1 overflow-y-auto">
            {rfqSubmitted ? (
              /* Success / Confirmation Screen */
              <div className="py-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white font-tech">
                  PROCUREMENT ORDER LOGGED
                </h3>
                <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
                  Your certified hardware request has been dispatched to the AeroCore 24/7 Logistics Desk.
                </p>
                <div className="mt-4 p-4 bg-neutral-950 rounded border border-neutral-800 text-left font-mono-numbers text-xs space-y-1">
                  <div>Ref #: <strong className="text-cyan-400">{rfqSubmitted}</strong></div>
                  <div>Carrier Priority: <strong className="text-white">{rfqForm.priorityLevel}</strong></div>
                  <div>Destination Airport: <strong className="text-white">{rfqForm.deliveryAirportCode}</strong></div>
                  <div>Trace Docs: <strong className="text-emerald-400">FAA 8130-3 Included</strong></div>
                </div>
                <button
                  onClick={() => {
                    setRfqSubmitted(null);
                    onClose();
                  }}
                  className="mt-6 w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs font-medium transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            ) : isSubmittingRFQ ? (
              /* RFQ Submission Form */
              <form onSubmit={handleSubmitOrderOrRFQ} className="space-y-4 text-xs">
                <div className="pb-3 border-b border-neutral-800 flex items-center justify-between">
                  <span className="font-semibold text-white">Logistics & AOG Flight Dispatch</span>
                  <button
                    type="button"
                    onClick={() => setIsSubmittingRFQ(false)}
                    className="text-cyan-400 hover:underline"
                  >
                    Back to Items
                  </button>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Airline / Operator Name</label>
                  <input
                    type="text"
                    required
                    value={rfqForm.companyName}
                    onChange={(e) => setRfqForm({ ...rfqForm, companyName: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-400 mb-1">Contact Officer</label>
                    <input
                      type="text"
                      required
                      value={rfqForm.contactName}
                      onChange={(e) => setRfqForm({ ...rfqForm, contactName: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1">Destination Airport (ICAO)</label>
                    <input
                      type="text"
                      required
                      value={rfqForm.deliveryAirportCode}
                      onChange={(e) => setRfqForm({ ...rfqForm, deliveryAirportCode: e.target.value })}
                      placeholder="e.g. KJFK, EGLL"
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white focus:outline-none focus:border-cyan-500 uppercase font-mono-numbers"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Dispatch Priority</label>
                  <select
                    value={rfqForm.priorityLevel}
                    onChange={(e) => setRfqForm({ ...rfqForm, priorityLevel: e.target.value as any })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Critical AOG (Aircraft On Ground)">Critical AOG (Immediate Air Freight)</option>
                    <option value="Routine">Routine Stock Replenishment</option>
                    <option value="Scheduled Heavy Check">Scheduled C-Check Heavy Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Operations Notes & Tail Number</label>
                  <textarea
                    rows={3}
                    value={rfqForm.notes}
                    onChange={(e) => setRfqForm({ ...rfqForm, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-2"
                >
                  <span>Submit Verified Purchase / RFQ</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : items.length === 0 ? (
              <div className="py-16 text-center text-neutral-500">
                <p className="text-sm">Your cart is currently empty.</p>
                <p className="text-xs mt-1">Explore components via 3D exploded view or catalog.</p>
              </div>
            ) : (
              /* Itemized Cart List */
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.part.id}
                    className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg flex flex-col justify-between gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[10px] font-mono-numbers text-cyan-400">
                          {item.part.partNumber} · {item.part.condition}
                        </div>
                        <h4 className="text-xs font-semibold text-white line-clamp-1 mt-0.5">
                          {item.part.name}
                        </h4>
                        <div className="text-[11px] text-neutral-400 font-mono-numbers mt-1">
                          {item.part.priceUSD !== null ? (
                            `$${item.part.priceUSD.toLocaleString()} USD`
                          ) : (
                            <span className="text-cyan-400">RFQ Item</span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.part.id)}
                        className="text-neutral-500 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-900 text-xs">
                      <span className="text-neutral-500 text-[11px]">Quantity</span>
                      <div className="flex items-center gap-2 font-mono-numbers">
                        <button
                          onClick={() => onUpdateQuantity(item.part.id, Math.max(1, item.quantity - 1))}
                          className="w-6 h-6 bg-neutral-900 border border-neutral-800 rounded flex items-center justify-center hover:bg-neutral-800 text-white"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-white">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.part.id, item.quantity + 1)}
                          className="w-6 h-6 bg-neutral-900 border border-neutral-800 rounded flex items-center justify-center hover:bg-neutral-800 text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Subtotal & Action */}
          {!rfqSubmitted && items.length > 0 && !isSubmittingRFQ && (
            <div className="p-6 border-t border-neutral-800 bg-neutral-950/60">
              <div className="space-y-1 mb-4 text-xs font-mono-numbers">
                <div className="flex justify-between text-neutral-400">
                  <span>Priced Items ({pricedItemsCount}):</span>
                  <span className="text-white">${subtotal.toLocaleString()} USD</span>
                </div>
                {quoteItemsCount > 0 && (
                  <div className="flex justify-between text-cyan-400">
                    <span>RFQ Required Items:</span>
                    <span>{quoteItemsCount} line item(s)</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-neutral-800">
                  <span>Estimated Total:</span>
                  <span className="text-cyan-400 font-mono-numbers">
                    ${subtotal.toLocaleString()} USD
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsSubmittingRFQ(true)}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-2"
              >
                <span>Proceed to AOG Checkout & RFQ</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

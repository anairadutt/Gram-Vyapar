import React, { useState } from "react";
import { CatalogProduct, KhataEntry, StoreProfile } from "../data/vyaparData";
import { Mic, Sparkles, Plus, Trash2, Printer, CheckCircle2, Phone } from "lucide-react";

interface VoiceBillerKhataProps {
  storeProfile: StoreProfile;
  catalog: CatalogProduct[];
  khataEntries: KhataEntry[];
  onAddKhataEntry: (entry: KhataEntry) => void;
  onSettleUdhar: (id: string) => void;
}

interface BillLineItem {
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export const VoiceBillerKhata: React.FC<VoiceBillerKhataProps> = ({
  storeProfile,
  catalog,
  khataEntries,
  onAddKhataEntry,
  onSettleUdhar,
}) => {
  const [voiceInput, setVoiceInput] = useState<string>(
    "Rameshwar Kadam Niphad: 5 kg Gavran Tur Dal, 2 Litre Lakdi Ghana Groundnut Oil, 1 kg Waigaon Haldi - Udhar Khata"
  );
  const [parsing, setParsing] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState<string>("Rameshwar Kadam");
  const [customerPhone, setCustomerPhone] = useState<string>("+91 98231 11402");
  const [customerVillage, setCustomerVillage] = useState<string>("Niphad");
  const [paymentMode, setPaymentMode] = useState<"CASH" | "UPI" | "UDHAR">("UDHAR");
  const [lineItems, setLineItems] = useState<BillLineItem[]>([
    {
      itemName: "Unpolished Gavran Tur Dal",
      quantity: 5,
      unit: "kg",
      unitPrice: 145,
      totalPrice: 725,
    },
    {
      itemName: "Wood-Pressed Groundnut Oil",
      quantity: 2,
      unit: "Litre",
      unitPrice: 240,
      totalPrice: 480,
    },
  ]);

  const [khataFilter, setKhataFilter] = useState<"ALL" | "PENDING_UDHAR" | "SETTLED">("ALL");

  const billTotal = lineItems.reduce((acc, item) => acc + item.totalPrice, 0);

  const handleAiParseOrder = async () => {
    if (!voiceInput.trim()) return;
    setParsing(true);
    setParseError(null);
    try {
      const response = await fetch("/api/vyapar/parse-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: voiceInput,
          catalogItems: catalog,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not parse voice note");
      }
      const parsed = data.parsed;
      if (parsed.customerName) setCustomerName(parsed.customerName);
      if (parsed.paymentMode === "CASH" || parsed.paymentMode === "UPI" || parsed.paymentMode === "UDHAR") {
        setPaymentMode(parsed.paymentMode);
      }
      if (Array.isArray(parsed.items) && parsed.items.length > 0) {
        setLineItems(parsed.items);
      }
    } catch (err: any) {
      setParseError(err.message || "Error parsing voice order.");
    } finally {
      setParsing(false);
    }
  };

  const handleQuickAddCatalogItem = (prod: CatalogProduct) => {
    setLineItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.itemName === prod.name);
      if (existingIdx > -1) {
        const updated = [...prev];
        const nextQty = updated[existingIdx].quantity + 1;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: nextQty,
          totalPrice: nextQty * updated[existingIdx].unitPrice,
        };
        return updated;
      }
      return [
        ...prev,
        {
          itemName: prod.name,
          quantity: 1,
          unit: prod.unit,
          unitPrice: prod.pricePerUnit,
          totalPrice: prod.pricePerUnit,
        },
      ];
    });
  };

  const handleRemoveItem = (idx: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveToKhata = () => {
    if (lineItems.length === 0) return;
    const summary = lineItems.map((i) => `${i.quantity} ${i.unit} ${i.itemName}`).join(", ");
    const newEntry: KhataEntry = {
      id: `kh-${Date.now().toString().slice(-4)}`,
      customerName: customerName || "Walk-in Buyer",
      phone: customerPhone || "+91 98000 00000",
      village: customerVillage || storeProfile.village,
      itemsSummary: summary,
      amountInr: billTotal,
      type: paymentMode,
      status: paymentMode === "UDHAR" ? "PENDING_UDHAR" : "SETTLED",
      date: new Date().toISOString().split("T")[0],
    };
    onAddKhataEntry(newEntry);
    setLineItems([]);
  };

  const filteredKhata = khataEntries.filter((entry) => {
    if (khataFilter === "ALL") return true;
    return entry.status === khataFilter;
  });

  const totalPendingUdhar = khataEntries
    .filter((k) => k.status === "PENDING_UDHAR")
    .reduce((sum, k) => sum + k.amountInr, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Bol-Ke-Bill (Voice POS) & Smart Udhar Bahi-Khata
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Speak or type customer orders in Hindi, Hinglish, or Marathi to generate instant GST/Non-GST receipts and track village credit.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-500">Total Market Udhar Receivable</div>
            <div className="text-base font-mono font-semibold text-amber-700 tabular-nums">
              ₹{totalPendingUdhar.toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      </div>

      {/* AI Voice / Hinglish Order Parser Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <Mic className="w-3.5 h-3.5 text-emerald-700" />
            <span>Bol-Ke-Bill Input (Type or Dictate Order in Hindi / Hinglish / English)</span>
          </label>
          <span className="text-xs text-slate-500">Auto-matches Store Catalog prices</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={voiceInput}
            onChange={(e) => setVoiceInput(e.target.value)}
            placeholder="e.g. Kailash Patil 10 kg Indrayani Rice, 3 Litre Groundnut oil UPI..."
            className="flex-1 px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-emerald-700"
          />
          <button
            type="button"
            onClick={handleAiParseOrder}
            disabled={parsing}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-60 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{parsing ? "Converting to Bill..." : "Convert to Bill Items"}</span>
          </button>
        </div>
        {parseError && <p className="text-xs text-red-600">{parseError}</p>}

        {/* Quick Tap Store Inventory Buttons */}
        <div className="pt-1 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500">Quick Add Stock:</span>
          {catalog.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleQuickAddCatalogItem(item)}
              className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1 whitespace-nowrap"
            >
              <Plus className="w-3 h-3 text-slate-500" />
              <span>{item.name.split(" ").slice(0, 3).join(" ")}</span>
              <span className="font-mono text-slate-500 tabular-nums">(₹{item.pricePerUnit})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Split View: Active POS Receipt Left | Udhar Bahi-Khata Ledger Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Bill Parcha */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Digital Vyapar Parcha (Bill)
                </h2>
                <p className="text-xs text-slate-500">
                  {storeProfile.storeName} · UPI: {storeProfile.upiId}
                </p>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg"
                title="Print Receipt"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Buyer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-md tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Village / Area</label>
                <input
                  type="text"
                  value={customerVillage}
                  onChange={(e) => setCustomerVillage(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md"
                />
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <th className="py-2 px-3 font-semibold">Item</th>
                    <th className="py-2 px-2 font-semibold text-right">Qty</th>
                    <th className="py-2 px-2 font-semibold text-right">Rate</th>
                    <th className="py-2 px-3 font-semibold text-right">Amount</th>
                    <th className="py-2 px-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {lineItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        No items in bill. Use Bol-Ke-Bill or tap a stock item above.
                      </td>
                    </tr>
                  ) : (
                    lineItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-medium text-slate-900">{item.itemName}</td>
                        <td className="py-2 px-2 text-right font-mono tabular-nums text-slate-600">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="py-2 px-2 text-right font-mono tabular-nums text-slate-600">
                          ₹{item.unitPrice}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                          ₹{item.totalPrice}
                        </td>
                        <td className="py-2 px-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Payment Mode Selector */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-semibold text-slate-700">Settlement Mode:</span>
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
                {(["CASH", "UPI", "UDHAR"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMode(mode)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                      paymentMode === mode
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {mode === "UDHAR" ? "UDHAR (Credit)" : mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Grand Total Payable</span>
              <span className="text-xl font-mono font-semibold text-emerald-700 tabular-nums">
                ₹{billTotal.toLocaleString("en-IN")}
              </span>
            </div>
            <button
              type="button"
              onClick={handleSaveToKhata}
              disabled={lineItems.length === 0}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 disabled:opacity-50 transition-colors"
            >
              Record Sale in Gramin Bahi-Khata
            </button>
          </div>
        </div>

        {/* Village Bahi-Khata Ledger */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Gramin Bahi-Khata (Customer Ledger & Udhar Tracker)
              </h2>
              <p className="text-xs text-slate-500">
                Real-time village credit recovery and UPI/Cash settlement book
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 self-start">
              <button
                type="button"
                onClick={() => setKhataFilter("ALL")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  khataFilter === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                }`}
              >
                All ({khataEntries.length})
              </button>
              <button
                type="button"
                onClick={() => setKhataFilter("PENDING_UDHAR")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  khataFilter === "PENDING_UDHAR"
                    ? "bg-white text-amber-800 shadow-xs"
                    : "text-slate-600"
                }`}
              >
                Pending Udhar
              </button>
              <button
                type="button"
                onClick={() => setKhataFilter("SETTLED")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  khataFilter === "SETTLED"
                    ? "bg-white text-emerald-800 shadow-xs"
                    : "text-slate-600"
                }`}
              >
                Settled
              </button>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <th className="py-2.5 px-3 font-semibold">Customer & Village</th>
                  <th className="py-2.5 px-3 font-semibold">Items Purchased</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Amount</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Status / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredKhata.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{entry.customerName}</div>
                      <div className="text-slate-500 font-mono tabular-nums flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span>{entry.phone}</span> · <span>{entry.village}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs">
                      <div>{entry.itemsSummary}</div>
                      <div className="text-slate-400 font-mono tabular-nums mt-0.5">
                        {entry.date} · Mode: {entry.type}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                      ₹{entry.amountInr.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {entry.status === "PENDING_UDHAR" ? (
                        <button
                          type="button"
                          onClick={() => onSettleUdhar(entry.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-300 rounded-md hover:bg-amber-100 transition-colors whitespace-nowrap"
                        >
                          Mark Paid (UPI/Cash)
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Settled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

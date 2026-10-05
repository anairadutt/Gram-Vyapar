/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  INITIAL_STORE_PROFILE,
  INITIAL_CATALOG_PRODUCTS,
  INITIAL_KHATA_ENTRIES,
  LIVE_MANDI_RATES,
  CatalogProduct,
  KhataEntry,
  StoreProfile,
} from "./data/vyaparData";
import { VoiceBillerKhata } from "./components/VoiceBillerKhata";
import { OndcCatalogStudio } from "./components/OndcCatalogStudio";
import { MandiIntelligence } from "./components/MandiIntelligence";
import { VyaparMitraChat } from "./components/VyaparMitraChat";
import {
  Receipt,
  Store,
  TrendingUp,
  MessageSquareText,
  ArrowUpRight,
  Download,
} from "lucide-react";

const CATALOG_STORAGE_KEY = "gram_vyapar_catalog_v1";
const KHATA_STORAGE_KEY = "gram_vyapar_khata_v1";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [storeProfile] = useState<StoreProfile>(INITIAL_STORE_PROFILE);

  const [catalog, setCatalog] = useState<CatalogProduct[]>(() => {
    try {
      const saved = localStorage.getItem(CATALOG_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore storage errors
    }
    return INITIAL_CATALOG_PRODUCTS;
  });

  const [khataEntries, setKhataEntries] = useState<KhataEntry[]>(() => {
    try {
      const saved = localStorage.getItem(KHATA_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore storage errors
    }
    return INITIAL_KHATA_ENTRIES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(catalog));
    } catch {
      // ignore
    }
  }, [catalog]);

  useEffect(() => {
    try {
      localStorage.setItem(KHATA_STORAGE_KEY, JSON.stringify(khataEntries));
    } catch {
      // ignore
    }
  }, [khataEntries]);

  const handleAddKhataEntry = (newEntry: KhataEntry) => {
    setKhataEntries((prev) => [newEntry, ...prev]);
  };

  const handleSettleUdhar = (id: string) => {
    setKhataEntries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "SETTLED" } : item))
    );
  };

  const handleAddProduct = (newProd: CatalogProduct) => {
    setCatalog((prev) => [newProd, ...prev]);
  };

  const handleToggleOndcLive = (id: string) => {
    setCatalog((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ondcLive: !item.ondcLive } : item))
    );
  };

  const handleExportLedger = () => {
    const payload = {
      storeProfile,
      exportedAt: new Date().toISOString(),
      catalog,
      khataEntries,
    };
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const a = document.createElement("a");
    a.setAttribute("href", dataStr);
    a.setAttribute("download", `gram-vyapar-ledger-${storeProfile.ondcSellerId}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const totalSalesInr = khataEntries.reduce((sum, e) => sum + e.amountInr, 0);
  const pendingUdharInr = khataEntries
    .filter((e) => e.status === "PENDING_UDHAR")
    .reduce((sum, e) => sum + e.amountInr, 0);
  const ondcLiveCount = catalog.filter((c) => c.ondcLive).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 bg-white border-b border-slate-200">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#dashboard"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab("dashboard");
          }}
          className="text-lg font-semibold tracking-tight text-slate-900 whitespace-nowrap"
        >
          Gram Vyapar
        </a>

        {/* Zone 2: 5 clean navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab("dashboard")}
            className={`transition-colors whitespace-nowrap ${
              activeTab === "dashboard"
                ? "text-slate-900 underline underline-offset-8 decoration-emerald-700 decoration-2 font-semibold"
                : "hover:text-slate-900"
            }`}
          >
            Vyapar Desk
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("khata")}
            className={`transition-colors whitespace-nowrap ${
              activeTab === "khata"
                ? "text-slate-900 underline underline-offset-8 decoration-emerald-700 decoration-2 font-semibold"
                : "hover:text-slate-900"
            }`}
          >
            Bol-Ke-Bill & Khata
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("catalog")}
            className={`transition-colors whitespace-nowrap ${
              activeTab === "catalog"
                ? "text-slate-900 underline underline-offset-8 decoration-emerald-700 decoration-2 font-semibold"
                : "hover:text-slate-900"
            }`}
          >
            ONDC Storefront
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("mandi")}
            className={`transition-colors whitespace-nowrap ${
              activeTab === "mandi"
                ? "text-slate-900 underline underline-offset-8 decoration-emerald-700 decoration-2 font-semibold"
                : "hover:text-slate-900"
            }`}
          >
            APMC Mandi Bhav
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("mitra")}
            className={`transition-colors whitespace-nowrap ${
              activeTab === "mitra"
                ? "text-slate-900 underline underline-offset-8 decoration-emerald-700 decoration-2 font-semibold"
                : "hover:text-slate-900"
            }`}
          >
            Vyapar Mitra AI
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportLedger}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Bahi-Khata</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("khata")}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors whitespace-nowrap"
          >
            + New Voice Bill
          </button>
        </div>
      </header>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden flex items-center gap-1 px-4 py-2 bg-white border-b border-slate-200 overflow-x-auto">
        {[
          { id: "dashboard", label: "Overview" },
          { id: "khata", label: "Voice Bill & Khata" },
          { id: "catalog", label: "ONDC Dukaan" },
          { id: "mandi", label: "Mandi Bhav" },
          { id: "mitra", label: "Vyapar Mitra" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap ${
              activeTab === tab.id ? "bg-emerald-700 text-white" : "text-slate-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Rural Merchant Store Banner */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="text-xs text-slate-500 font-mono tabular-nums">
                  ONDC ID: {storeProfile.ondcSellerId} · FSSAI: {storeProfile.fssaiLicense} ·{" "}
                  {storeProfile.village}, {storeProfile.district} ({storeProfile.state})
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
                  {storeProfile.storeName}
                </h1>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Integrated Rural Commerce Command Center — manage voice-to-bill Kirana POS, village Udhar Bahi-Khata, direct-to-buyer ONDC digital catalogs, and live APMC Mandi arbitrage.
                </p>
                <div className="pt-1 text-xs text-slate-500">
                  Proprietor / Sanchalak:{" "}
                  <strong className="text-slate-800">{storeProfile.ownerName}</strong> · Settlement
                  UPI: <span className="font-mono tabular-nums">{storeProfile.upiId}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab("khata")}
                  className="px-4 py-2.5 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors whitespace-nowrap"
                >
                  Open Bol-Ke-Bill POS
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("catalog")}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap"
                >
                  Build ONDC Catalog
                </button>
              </div>
            </div>

            {/* 4 Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="text-xs text-slate-500">Recorded Khata Volume</div>
                <div className="text-xl font-mono font-semibold text-slate-900 mt-1 tabular-nums">
                  ₹{totalSalesInr.toLocaleString("en-IN")}
                </div>
                <div className="text-xs text-slate-500 mt-1 font-mono tabular-nums">
                  Across {khataEntries.length} recent bills
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="text-xs text-slate-500">Pending Village Udhar (Credit)</div>
                <div className="text-xl font-mono font-semibold text-amber-700 mt-1 tabular-nums">
                  ₹{pendingUdharInr.toLocaleString("en-IN")}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  1-Click UPI settlement enabled
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="text-xs text-slate-500">ONDC Live Storefront SKUs</div>
                <div className="text-xl font-mono font-semibold text-emerald-700 mt-1 tabular-nums">
                  {ondcLiveCount} / {catalog.length} Active
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Direct Pan-India buyer discovery
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="text-xs text-slate-500">Top Local Mandi Signal</div>
                <div className="text-xl font-mono font-semibold text-slate-900 mt-1 tabular-nums">
                  Tur: ₹{LIVE_MANDI_RATES[0].modalPriceQuintal.toLocaleString("en-IN")}/Qtl
                </div>
                <div className="text-xs text-emerald-700 font-mono mt-1 tabular-nums">
                  +{LIVE_MANDI_RATES[0].dailyChangePercent}% at {LIVE_MANDI_RATES[0].mandiName}
                </div>
              </div>
            </div>

            {/* 4 Core Modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500">MODULE 01</span>
                    <Receipt className="w-4 h-4 text-emerald-700" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Bol-Ke-Bill (Voice POS) & Gramin Bahi-Khata
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Convert spoken or typed Hindi/Hinglish orders ("5 kg Tur Dal, 2 Litre Groundnut Oil") into itemized receipts and track village Udhar credit balances.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("khata")}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 self-start"
                >
                  <span>Open Voice POS & Ledger</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500">MODULE 02</span>
                    <Store className="w-4 h-4 text-amber-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    ONDC & WhatsApp Digital Dukaan Builder
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Generate bilingual English + Hindi product cards with HSN codes, GST slabs, retail vs quintal bulk rates, and ready-to-share WhatsApp broadcast pitches.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("catalog")}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 self-start"
                >
                  <span>Manage Digital Storefront</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500">MODULE 03</span>
                    <TrendingUp className="w-4 h-4 text-emerald-700" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    APMC Mandi Bhav & e-NAM Arbitrage Desk
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Track live modal rates vs Government MSP across major APMC mandis and run AI lot realization forecasts (Sell Now vs Hold in Warehouse with e-NWR loan).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("mandi")}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 self-start"
                >
                  <span>Check Live Mandi Rates</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500">MODULE 04</span>
                    <MessageSquareText className="w-4 h-4 text-amber-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Gram Vyapar Mitra — Multilingual AI Advisor
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Get instant help in Hindi, Marathi, Gujarati, Punjabi, Tamil, Telugu, Bengali, or English on polite Udhar reminders, Kirana margins, and FPO/SHG loans.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("mitra")}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 self-start"
                >
                  <span>Ask Gram Vyapar Mitra</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "khata" && (
          <VoiceBillerKhata
            storeProfile={storeProfile}
            catalog={catalog}
            khataEntries={khataEntries}
            onAddKhataEntry={handleAddKhataEntry}
            onSettleUdhar={handleSettleUdhar}
          />
        )}

        {activeTab === "catalog" && (
          <OndcCatalogStudio
            storeProfile={storeProfile}
            catalog={catalog}
            onAddProduct={handleAddProduct}
            onToggleOndcLive={handleToggleOndcLive}
          />
        )}

        {activeTab === "mandi" && <MandiIntelligence />}

        {activeTab === "mitra" && <VyaparMitraChat storeProfile={storeProfile} />}
      </main>

      {/* Quiet Footer */}
      <footer className="bg-white border-t border-slate-200 py-5 px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Gram Vyapar (ग्राम व्यापार) — Rural Commerce, ONDC Storefront & APMC Mandi Intelligence
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://ondc.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 transition-colors"
            >
              ONDC Network
            </a>
            <span>·</span>
            <a
              href="https://enam.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 transition-colors"
            >
              e-NAM National Agriculture Market
            </a>
            <span>·</span>
            <a
              href="https://agmarknet.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 transition-colors"
            >
              Agmarknet Mandi Portal
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

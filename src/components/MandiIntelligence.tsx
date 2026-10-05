import React, { useState } from "react";
import { LIVE_MANDI_RATES, MandiCommodity } from "../data/vyaparData";
import { Sparkles, TrendingUp, TrendingDown, Scale } from "lucide-react";

interface MandiForecastResult {
  signal: string;
  projectedPriceRangeInr: string;
  estimatedTotalRealizationInr: number;
  marketDrivers: string;
  arbitrageMandiSuggestion: string;
  gradingAndMoistureTip: string;
}

export const MandiIntelligence: React.FC = () => {
  const [selectedCommodity, setSelectedCommodity] = useState<MandiCommodity>(LIVE_MANDI_RATES[0]);
  const [lotSizeQuintals, setLotSizeQuintals] = useState<number>(25);
  const [loadingForecast, setLoadingForecast] = useState<boolean>(false);
  const [forecast, setForecast] = useState<MandiForecastResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunForecast = async (comm: MandiCommodity) => {
    setSelectedCommodity(comm);
    setLoadingForecast(true);
    setError(null);
    try {
      const response = await fetch("/api/vyapar/mandi-forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commodity: comm.commodity,
          state: comm.state,
          quantityQuintals: lotSizeQuintals,
          currentModalPrice: comm.modalPriceQuintal,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch Mandi intelligence");
      }
      setForecast(data.forecast);
    } catch (err: any) {
      setError(err.message || "Error running Mandi forecast.");
    } finally {
      setLoadingForecast(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            APMC Mandi Bhav & e-NAM Arbitrage Desk
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Compare live modal prices against Government MSP, calculate lot realization, and get AI sell-vs-hold warehouse (e-NWR) advisory.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start">
          <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
            Your Lot Size (Quintals):
          </label>
          <input
            type="number"
            min={1}
            max={1000}
            value={lotSizeQuintals}
            onChange={(e) => setLotSizeQuintals(parseInt(e.target.value, 10) || 10)}
            className="w-24 px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg tabular-nums"
          />
        </div>
      </div>

      {/* Mandi Rates Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <th className="py-3 px-4 font-semibold">Commodity (फसल / जिंस)</th>
              <th className="py-3 px-4 font-semibold">APMC Mandi</th>
              <th className="py-3 px-4 font-semibold text-right">Min – Max (₹/Qtl)</th>
              <th className="py-3 px-4 font-semibold text-right">Modal Rate</th>
              <th className="py-3 px-4 font-semibold text-right">Govt MSP</th>
              <th className="py-3 px-4 font-semibold text-right">24h Trend</th>
              <th className="py-3 px-4 font-semibold text-right">AI Advisory</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {LIVE_MANDI_RATES.map((item) => {
              const isPositive = item.dailyChangePercent >= 0;
              return (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{item.commodity}</div>
                    <div className="text-slate-500">
                      {item.hindiName} · {item.qualitySpec}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    <div>{item.mandiName}</div>
                    <div className="text-slate-400 font-mono tabular-nums">
                      Arrival: {item.arrivalTonnes} MT
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-600 tabular-nums">
                    ₹{item.minPriceQuintal.toLocaleString("en-IN")} – ₹
                    {item.maxPriceQuintal.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">
                    ₹{item.modalPriceQuintal.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-600 tabular-nums">
                    {item.mspQuintal > 0 ? `₹${item.mspQuintal.toLocaleString("en-IN")}` : "N/A"}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        isPositive ? "text-emerald-700" : "text-red-600"
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5" />
                      )}
                      {isPositive ? `+${item.dailyChangePercent}%` : `${item.dailyChangePercent}%`}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleRunForecast(item)}
                      disabled={loadingForecast && selectedCommodity.id === item.id}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-60 transition-colors inline-flex items-center gap-1 whitespace-nowrap"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>
                        {loadingForecast && selectedCommodity.id === item.id
                          ? "Analyzing..."
                          : "Analyze Lot"}
                      </span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* AI Mandi Arbitrage & Realization Report */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          {error}
        </div>
      )}

      {forecast ? (
        <div className="bg-white border border-emerald-300 rounded-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
            <div>
              <div className="text-xs text-slate-500">
                AI Mandi Strategy · {selectedCommodity.commodity} ({lotSizeQuintals} Quintals)
              </div>
              <h2 className="text-lg font-semibold text-slate-900 mt-0.5">
                Recommended Action:{" "}
                <span className="text-emerald-700">{forecast.signal}</span>
              </h2>
            </div>
            <div className="text-right font-mono tabular-nums">
              <div className="text-xs text-slate-500">Estimated Lot Realization</div>
              <div className="text-lg font-semibold text-slate-900">
                ₹{forecast.estimatedTotalRealizationInr?.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="font-semibold text-slate-900">15-Day Price Band Outlook</div>
              <div className="font-mono text-sm font-semibold text-amber-700 tabular-nums">
                {forecast.projectedPriceRangeInr}
              </div>
              <p className="text-slate-600 leading-relaxed pt-1">{forecast.marketDrivers}</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="font-semibold text-slate-900">Inter-Mandi Arbitrage Route</div>
              <p className="text-slate-600 leading-relaxed">
                {forecast.arbitrageMandiSuggestion}
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="font-semibold text-slate-900">Assaying & Moisture Grading Tip</div>
              <p className="text-slate-600 leading-relaxed">{forecast.gradingAndMoistureTip}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scale className="w-5 h-5 text-emerald-700" />
            <div className="text-xs text-slate-600">
              Select any commodity row above and click <strong className="text-slate-900">Analyze Lot</strong> to calculate net realization for your {lotSizeQuintals}-Quintal batch and check e-NAM inter-mandi arbitrage margins.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

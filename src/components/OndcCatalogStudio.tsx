import React, { useState } from "react";
import { CatalogProduct, StoreProfile } from "../data/vyaparData";
import { Sparkles, Upload, Copy, Check, PlusCircle, Package } from "lucide-react";

interface OndcCatalogStudioProps {
  storeProfile: StoreProfile;
  catalog: CatalogProduct[];
  onAddProduct: (newProd: CatalogProduct) => void;
  onToggleOndcLive: (id: string) => void;
}

interface GeneratedListing {
  englishTitle: string;
  hindiTitle: string;
  category: CatalogProduct["category"];
  hsnCode: string;
  gstRatePercent: number;
  retailPriceInr: number;
  retailUnit: CatalogProduct["unit"];
  wholesaleBulkPriceInr: number;
  qualityGrade: string;
  shelfLifeMonths: number;
  description: string;
  whatsappPitch: string;
}

export const OndcCatalogStudio: React.FC<OndcCatalogStudioProps> = ({
  storeProfile,
  catalog,
  onAddProduct,
  onToggleOndcLive,
}) => {
  const [rawInput, setRawInput] = useState<string>(
    "100% pure chemical-free Sugarcane Jaggery (Gud) blocks made in iron kadhai, 1 kg pack"
  );
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>("");
  const [generating, setGenerating] = useState<boolean>(false);
  const [generated, setGenerated] = useState<GeneratedListing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedPitch, setCopiedPitch] = useState<boolean>(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFileName(file.name);
    setImageMimeType(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      setImageBase64(resultStr.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateListing = async () => {
    if (!rawInput.trim()) return;
    setGenerating(true);
    setError(null);
    try {
      const response = await fetch("/api/vyapar/generate-catalog-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawProductInput: rawInput,
          originVillage: `${storeProfile.village}, ${storeProfile.district}`,
          state: storeProfile.state,
          imageBase64,
          mimeType: imageMimeType,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate ONDC catalog card.");
      }
      setGenerated(data.listing);
    } catch (err: any) {
      setError(err.message || "Error generating listing.");
    } finally {
      setGenerating(false);
    }
  };

  const handlePublishToCatalog = () => {
    if (!generated) return;
    const newProd: CatalogProduct = {
      id: `prod-${Date.now().toString().slice(-4)}`,
      name: generated.englishTitle,
      hindiName: generated.hindiTitle,
      category: generated.category || "Grains & Pulses",
      pricePerUnit: generated.retailPriceInr || 120,
      wholesalePriceQuintal: generated.wholesaleBulkPriceInr || 9500,
      unit:
        generated.retailUnit === "Litre" ||
        generated.retailUnit === "Packet" ||
        generated.retailUnit === "Piece"
          ? generated.retailUnit
          : "kg",
      stockQty: 100,
      reorderLevel: 20,
      hsn: generated.hsnCode || "1701",
      gstPercent: generated.gstRatePercent ?? 5,
      originTag: `${storeProfile.village} GI/FPO`,
      ondcLive: true,
    };
    onAddProduct(newProd);
    setGenerated(null);
  };

  const handleCopyPitch = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            ONDC & WhatsApp Digital Dukaan Builder
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Turn any rural farm produce, handloom craft, or SHG food product into a standardized ONDC network listing with HSN code and WhatsApp broadcast copy.
          </p>
        </div>
        <div className="text-xs font-mono text-slate-500 tabular-nums">
          ONDC Seller ID: <strong className="text-slate-900">{storeProfile.ondcSellerId}</strong>
        </div>
      </div>

      {/* AI Product Generator Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-900">
            Create New ONDC Product Listing with AI
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Describe Your Produce or Handicraft (English / Hindi)
            </label>
            <textarea
              rows={3}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="e.g. Organic cold-pressed safflower (kardi) oil 1 litre bottle..."
              className="w-full p-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Optional: Attach Product / Packaging Photo
            </label>
            <label className="flex items-center justify-between px-4 py-2.5 border border-dashed border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Upload className="w-4 h-4 text-slate-500" />
                <span>
                  {imageFileName ? `Photo: ${imageFileName}` : "Upload product photo for AI grading"}
                </span>
              </div>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>

          <button
            type="button"
            onClick={handleGenerateListing}
            disabled={generating}
            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {generating ? "Generating Bilingual ONDC Card..." : "Generate ONDC & WhatsApp Listing"}
            </span>
          </button>

          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6">
          {!generated ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-10 px-4">
              <Package className="w-8 h-8 text-slate-300 mb-3" />
              <h3 className="text-sm font-semibold text-slate-800">
                Instant Bilingual Catalog & HSN Generator
              </h3>
              <p className="text-xs text-slate-500 max-w-md mt-1">
                Enter any village product on the left and click "Generate ONDC & WhatsApp Listing" to auto-compute HSN codes, GST rates, retail/wholesale pricing, and WhatsApp buyer pitches.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <div className="text-xs text-slate-500">
                    {generated.category} · Grade: {generated.qualityGrade} · HSN:{" "}
                    <span className="font-mono tabular-nums">{generated.hsnCode}</span> (GST{" "}
                    {generated.gstRatePercent}%)
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mt-0.5">
                    {generated.englishTitle}
                  </h3>
                  <div className="text-sm font-medium text-emerald-800">{generated.hindiTitle}</div>
                </div>

                <button
                  type="button"
                  onClick={handlePublishToCatalog}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors flex items-center gap-1.5 whitespace-nowrap self-start"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Publish to Storefront</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-slate-500">Suggested Retail Price</div>
                  <div className="text-sm font-mono font-semibold text-slate-900 mt-0.5 tabular-nums">
                    ₹{generated.retailPriceInr} / {generated.retailUnit}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-slate-500">Wholesale Bulk Rate</div>
                  <div className="text-sm font-mono font-semibold text-amber-700 mt-0.5 tabular-nums">
                    ₹{generated.wholesaleBulkPriceInr} / Quintal
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-slate-500">Shelf Life</div>
                  <div className="text-sm font-mono font-semibold text-slate-900 mt-0.5 tabular-nums">
                    {generated.shelfLifeMonths} Months
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{generated.description}</p>

              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-950">
                    Ready-to-Forward WhatsApp Broadcast Pitch
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyPitch(generated.whatsappPitch)}
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
                  >
                    {copiedPitch ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPitch ? "Copied" : "Copy Text"}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {generated.whatsappPitch}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Storefront Inventory Grid */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900">
          Active Storefront & Stock Inventory ({catalog.length} Products)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {catalog.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:-translate-y-0.5 transition-transform"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{item.category}</span>
                  <span className="font-mono tabular-nums">HSN {item.hsn}</span>
                </div>
                <h3 className="text-base font-semibold text-slate-900">{item.name}</h3>
                <div className="text-xs font-medium text-slate-600">{item.hindiName}</div>
                <div className="text-xs text-slate-500 pt-1">
                  Origin: {item.originTag} · GST: {item.gstPercent}%
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-lg font-mono font-semibold text-slate-900 tabular-nums">
                      ₹{item.pricePerUnit}
                    </span>
                    <span className="text-xs text-slate-500"> / {item.unit}</span>
                  </div>
                  <div className="text-xs font-mono text-slate-600 tabular-nums">
                    Stock:{" "}
                    <strong
                      className={
                        item.stockQty <= item.reorderLevel ? "text-amber-700" : "text-emerald-700"
                      }
                    >
                      {item.stockQty} {item.unit}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-500 font-mono tabular-nums">
                    Bulk: ₹{item.wholesalePriceQuintal.toLocaleString("en-IN")}/Qtl
                  </span>
                  <button
                    type="button"
                    onClick={() => onToggleOndcLive(item.id)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                      item.ondcLive
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.ondcLive ? "ONDC Live ✓" : "Publish to ONDC"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

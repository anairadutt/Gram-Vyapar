import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

function getAiClient() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// 1. Voice / Natural Language Bill & Khata Parser ("2 kg Tur Dal 280 rupaye, 5 kg Chakki Atta...")
app.post("/api/vyapar/parse-order", async (req, res) => {
  try {
    const { transcript, catalogItems } = req.body;
    const ai = getAiClient();

    const catalogContext = Array.isArray(catalogItems)
      ? catalogItems
          .map((c: any) => `- ${c.name} (Unit: ${c.unit}, Price: ₹${c.pricePerUnit}, HSN: ${c.hsn})`)
          .join("\n")
      : "";

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `Parse this Indian rural shopkeeper / farmer voice or text billing note into structured line items and customer details:
Input Note: "${transcript}"

Available Store Catalog for price/unit reference:
${catalogContext}

If an item price is not explicitly spoken in the note, use the store catalog price or a realistic Indian retail price in INR.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            customerName: { type: Type.STRING, description: "Customer name if mentioned, else 'Walk-in Buyer'" },
            paymentMode: { type: Type.STRING, description: "CASH, UPI, or UDHAR (Credit)" },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  itemName: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  unit: { type: Type.STRING, description: "kg, Quintal, Litre, Packet, or Piece" },
                  unitPrice: { type: Type.NUMBER },
                  totalPrice: { type: Type.NUMBER },
                },
                required: ["itemName", "quantity", "unit", "unitPrice", "totalPrice"],
              },
            },
            summaryNote: { type: Type.STRING },
          },
          required: ["customerName", "paymentMode", "items", "summaryNote"],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json({ parsed });
  } catch (error: any) {
    console.error("Parse order error:", error);
    res.status(500).json({
      error: error?.message || "Failed to parse voice/text order.",
    });
  }
});

// 2. ONDC & WhatsApp Digital Catalog Listing Generator (Supports product photo + text)
app.post("/api/vyapar/generate-catalog-listing", async (req, res) => {
  try {
    const { rawProductInput, originVillage, state, imageBase64, mimeType } = req.body;
    const ai = getAiClient();

    const parts: any[] = [];
    if (imageBase64 && mimeType) {
      parts.push({
        inlineData: {
          data: imageBase64,
          mimeType,
        },
      });
    }
    parts.push({
      text: `You are an ONDC (Open Network for Digital Commerce) & Rural e-Commerce Catalog Specialist for Gram Vyapar.
Create a complete, high-converting bilingual (English + Hindi) product listing for a rural producer/artisan/FPO.
Product Input: "${rawProductInput}"
Origin Village/District: ${originVillage || "Wardha"}, ${state || "Maharashtra"}
Generate title, Hindi title, HSN code, GST slab, suggested retail price (INR), suggested wholesale price per quintal/bulk, quality grade, shelf life, and a ready-to-share WhatsApp broadcast pitch.`,
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            englishTitle: { type: Type.STRING },
            hindiTitle: { type: Type.STRING },
            category: { type: Type.STRING, description: "Grains & Pulses, Cold-Pressed Oils, Spices, Handloom & Crafts, or Dairy/Forest Produce" },
            hsnCode: { type: Type.STRING },
            gstRatePercent: { type: Type.NUMBER },
            retailPriceInr: { type: Type.NUMBER },
            retailUnit: { type: Type.STRING },
            wholesaleBulkPriceInr: { type: Type.NUMBER },
            qualityGrade: { type: Type.STRING, description: "e.g. AGMARK Special / GI Tagged / NPOP Organic" },
            shelfLifeMonths: { type: Type.NUMBER },
            description: { type: Type.STRING },
            whatsappPitch: { type: Type.STRING },
          },
          required: [
            "englishTitle",
            "hindiTitle",
            "category",
            "hsnCode",
            "gstRatePercent",
            "retailPriceInr",
            "retailUnit",
            "wholesaleBulkPriceInr",
            "qualityGrade",
            "shelfLifeMonths",
            "description",
            "whatsappPitch",
          ],
        },
      },
    });

    const listing = JSON.parse(response.text?.trim() || "{}");
    res.json({ listing });
  } catch (error: any) {
    console.error("Catalog generator error:", error);
    res.status(500).json({
      error: error?.message || "Failed to generate ONDC catalog listing.",
    });
  }
});

// 3. APMC Mandi Bhav & Arbitrage Intelligence Advisor
app.post("/api/vyapar/mandi-forecast", async (req, res) => {
  try {
    const { commodity, state, quantityQuintals, currentModalPrice } = req.body;
    const ai = getAiClient();

    const prompt = `Analyze the Indian APMC Mandi market outlook & FPO selling strategy for:
Commodity: ${commodity}
State / Region: ${state}
Available Lot Size: ${quantityQuintals} Quintals
Current Local Modal Price: ₹${currentModalPrice} per Quintal

Provide a realistic market advisory including price trend, MSP comparison, recommended action (Sell Now vs Hold in Warehouse with e-NWR pledge), best nearby terminal mandis, and transport/grading tips.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            signal: { type: Type.STRING, description: "SELL NOW, HOLD (WAREHOUSE e-NWR), or SPLIT LOT" },
            projectedPriceRangeInr: { type: Type.STRING, description: "e.g. ₹6,450 – ₹6,780 / Quintal" },
            estimatedTotalRealizationInr: { type: Type.NUMBER },
            marketDrivers: { type: Type.STRING },
            arbitrageMandiSuggestion: { type: Type.STRING },
            gradingAndMoistureTip: { type: Type.STRING },
          },
          required: [
            "signal",
            "projectedPriceRangeInr",
            "estimatedTotalRealizationInr",
            "marketDrivers",
            "arbitrageMandiSuggestion",
            "gradingAndMoistureTip",
          ],
        },
      },
    });

    const forecast = JSON.parse(response.text?.trim() || "{}");
    res.json({ forecast });
  } catch (error: any) {
    console.error("Mandi forecast error:", error);
    res.status(500).json({
      error: error?.message || "Failed to generate Mandi market intelligence.",
    });
  }
});

// 4. Multilingual Gram Vyapar Mitra AI Copilot
app.post("/api/vyapar/chat", async (req, res) => {
  try {
    const { message, language = "Hindi (हिन्दी)", storeProfile } = req.body;
    const ai = getAiClient();

    const systemInstruction = `You are Gram Vyapar Mitra (ग्राम व्यापार मित्र), an expert AI business partner for Indian village entrepreneurs, Kirana shopkeepers, Farmer Producer Organizations (FPOs), Self Help Groups (SHGs), and rural artisans.
Respond in ${language} (using clear, respectful, practical language with exact INR figures).
You help users with:
1. Kirana inventory margins, fast-moving stock planning, and Udhar (credit) recovery messages.
2. ONDC & Meesho/WhatsApp digital catalog selling from villages.
3. APMC Mandi rates, e-NAM registration, MSP, and warehouse receipt (e-NWR) loans.
4. Rural business loans (PM SVANidhi, MUDRA, Kisan Credit Card, Lakhpati Didi SHG revolving funds) and FSSAI registration.

Store Context: ${storeProfile?.storeName || "Kisan & Gramin Bhandar"} in ${storeProfile?.village || "Lasalgaon"}, ${storeProfile?.state || "Maharashtra"}.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });

    res.json({
      reply: response.text || "Unable to generate response right now.",
    });
  } catch (error: any) {
    console.error("Vyapar chat error:", error);
    res.status(500).json({
      error: error?.message || "Failed to process Gram Vyapar query.",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*all", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Gram Vyapar server running on http://localhost:${PORT}`);
  });
}

startServer();

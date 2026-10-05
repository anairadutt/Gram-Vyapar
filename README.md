# Gram Vyapar (ग्राम व्यापार)

**AI-Powered Rural Commerce, Bol-Ke-Bill Voice POS, ONDC Digital Dukaan Builder & APMC Mandi Intelligence**

## Key Features
- **Bol-Ke-Bill (Voice/Text POS) & Smart Bahi-Khata (`src/components/VoiceBillerKhata.tsx`)**: Convert natural Hindi, Hinglish, or English order notes into itemized bills matched with store catalog pricing, print receipts, and track village Udhar (credit) balances.
- **ONDC & WhatsApp Digital Dukaan Studio (`src/components/OndcCatalogStudio.tsx`)**: Generate bilingual (English + Hindi) ONDC-compliant product listings with HSN codes, GST slabs, retail vs wholesale per-quintal pricing, and ready-to-share WhatsApp broadcast pitches from text or product photos.
- **APMC Mandi Bhav & Arbitrage Desk (`src/components/MandiIntelligence.tsx`)**: Compare live APMC Mandi modal prices against Government MSP, calculate batch realization, and get AI sell-vs-hold warehouse (e-NWR) advisory.
- **Gram Vyapar Mitra AI Copilot (`src/components/VyaparMitraChat.tsx`)**: Multilingual rural business advisor supporting Hindi, Marathi, Gujarati, Punjabi, Tamil, Telugu, Bengali, and English.

## Local & GitHub Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure `.env`**:
   ```bash
   cp .env.example .env
   # Add your GEMINI_API_KEY in .env
   ```

3. **Run Development Server (Port 3000)**:
   ```bash
   npm run dev
   ```

4. **Production Build**:
   ```bash
   npm run build
   npm start
   ```

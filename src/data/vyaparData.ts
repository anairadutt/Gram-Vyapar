export interface StoreProfile {
  storeName: string;
  ownerName: string;
  village: string;
  district: string;
  state: string;
  ondcSellerId: string;
  upiId: string;
  fssaiLicense: string;
}

export interface CatalogProduct {
  id: string;
  name: string;
  hindiName: string;
  category:
    | "Grains & Pulses"
    | "Cold-Pressed Oils"
    | "Spices & Condiments"
    | "Handloom & Crafts"
    | "Dairy & Honey";
  pricePerUnit: number;
  wholesalePriceQuintal: number;
  unit: "kg" | "Litre" | "Packet" | "Piece";
  stockQty: number;
  reorderLevel: number;
  hsn: string;
  gstPercent: number;
  originTag: string;
  ondcLive: boolean;
}

export interface KhataEntry {
  id: string;
  customerName: string;
  phone: string;
  village: string;
  itemsSummary: string;
  amountInr: number;
  type: "CASH" | "UPI" | "UDHAR";
  status: "SETTLED" | "PENDING_UDHAR";
  date: string;
}

export interface MandiCommodity {
  id: string;
  commodity: string;
  hindiName: string;
  mandiName: string;
  state: string;
  minPriceQuintal: number;
  maxPriceQuintal: number;
  modalPriceQuintal: number;
  mspQuintal: number;
  dailyChangePercent: number;
  arrivalTonnes: number;
  qualitySpec: string;
}

export const INITIAL_STORE_PROFILE: StoreProfile = {
  storeName: "Sahyadri Gramin FPO & Kirana Kendra",
  ownerName: "harishchandra Patil",
  village: "Lasalgaon",
  district: "Nashik",
  state: "Maharashtra",
  ondcSellerId: "ONDC-GRAM-MH-4829",
  upiId: "sahyadrigramin@sbi",
  fssaiLicense: "21524089001421",
};

export const INITIAL_CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    id: "prod-1",
    name: "Unpolished Gavran Tur Dal (Arhar)",
    hindiName: "बिना पॉलिश गावरान तूर दाल",
    category: "Grains & Pulses",
    pricePerUnit: 145,
    wholesalePriceQuintal: 13200,
    unit: "kg",
    stockQty: 185,
    reorderLevel: 40,
    hsn: "0713",
    gstPercent: 0,
    originTag: "Latur / Nashik Belt",
    ondcLive: true,
  },
  {
    id: "prod-2",
    name: "Wood-Pressed Lakdi Ghana Groundnut Oil",
    hindiName: "लकड़ी घाणा शुद्ध मूंगफली तेल",
    category: "Cold-Pressed Oils",
    pricePerUnit: 240,
    wholesalePriceQuintal: 22500,
    unit: "Litre",
    stockQty: 62,
    reorderLevel: 20,
    hsn: "1508",
    gstPercent: 5,
    originTag: "Cold-Pressed Village Mill",
    ondcLive: true,
  },
  {
    id: "prod-3",
    name: "GI-Tagged Waigaon Haldi (High Curcumin Powder)",
    hindiName: "वायगांव हल्दी पाउडर (5.8% करक्यूमिन)",
    category: "Spices & Condiments",
    pricePerUnit: 280,
    wholesalePriceQuintal: 25000,
    unit: "kg",
    stockQty: 48,
    reorderLevel: 15,
    hsn: "0910",
    gstPercent: 5,
    originTag: "Wardha GI Cluster",
    ondcLive: true,
  },
  {
    id: "prod-4",
    name: "Indrayani Sticky Fragrant Rice",
    hindiName: "इंद्रायणी सुगंधित तांदूळ (चावल)",
    category: "Grains & Pulses",
    pricePerUnit: 78,
    wholesalePriceQuintal: 7100,
    unit: "kg",
    stockQty: 320,
    reorderLevel: 50,
    hsn: "1006",
    gstPercent: 0,
    originTag: "Maval Farmer Group",
    ondcLive: true,
  },
  {
    id: "prod-5",
    name: "Wild Forest Multiflora Raw Honey (500g Jar)",
    hindiName: "जंगली शुद्ध शहद (500 ग्राम)",
    category: "Dairy & Honey",
    pricePerUnit: 310,
    wholesalePriceQuintal: 28000,
    unit: "Packet",
    stockQty: 14,
    reorderLevel: 20,
    hsn: "0409",
    gstPercent: 5,
    originTag: "Sahyadri Tribal SHG",
    ondcLive: true,
  },
  {
    id: "prod-6",
    name: "Handwoven Cotton Dhurrie Rug (4x6 ft)",
    hindiName: "हथकरघा सूती दरी (4x6 फीट)",
    category: "Handloom & Crafts",
    pricePerUnit: 890,
    wholesalePriceQuintal: 78000,
    unit: "Piece",
    stockQty: 11,
    reorderLevel: 10,
    hsn: "5702",
    gstPercent: 5,
    originTag: "Women Artisan SHG",
    ondcLive: false,
  },
];

export const INITIAL_KHATA_ENTRIES: KhataEntry[] = [
  {
    id: "kh-101",
    customerName: "Rameshwar Kadam",
    phone: "+91 98231 11402",
    village: "Niphad",
    itemsSummary: "10 kg Indrayani Rice, 2 Litre Groundnut Oil",
    amountInr: 1260,
    type: "UDHAR",
    status: "PENDING_UDHAR",
    date: "2026-10-04",
  },
  {
    id: "kh-102",
    customerName: "Savita Tai Jadhav (SHG Canteen)",
    phone: "+91 94220 88319",
    village: "Lasalgaon",
    itemsSummary: "15 kg Gavran Tur Dal, 3 kg Waigaon Haldi",
    amountInr: 3015,
    type: "UPI",
    status: "SETTLED",
    date: "2026-10-04",
  },
  {
    id: "kh-103",
    customerName: "Mahadev Kirana & Provision",
    phone: "+91 97654 30912",
    village: "Pimpalgaon",
    itemsSummary: "25 kg Indrayani Rice, 5 Litre Groundnut Oil",
    amountInr: 3150,
    type: "UDHAR",
    status: "PENDING_UDHAR",
    date: "2026-10-03",
  },
  {
    id: "kh-104",
    customerName: "Kailash Bhosale",
    phone: "+91 90112 45821",
    village: "Lasalgaon",
    itemsSummary: "2 kg Gavran Tur Dal, 1 Jar Wild Honey",
    amountInr: 600,
    type: "CASH",
    status: "SETTLED",
    date: "2026-10-05",
  },
];

export const LIVE_MANDI_RATES: MandiCommodity[] = [
  {
    id: "m-1",
    commodity: "Tur / Arhar (Red Gram Whole)",
    hindiName: "तूर / अरहर",
    mandiName: "Latur APMC",
    state: "Maharashtra",
    minPriceQuintal: 9400,
    maxPriceQuintal: 10650,
    modalPriceQuintal: 10120,
    mspQuintal: 7550,
    dailyChangePercent: 2.4,
    arrivalTonnes: 412,
    qualitySpec: "FAQ Moisture < 11%",
  },
  {
    id: "m-2",
    commodity: "Soybean (Yellow FAQ)",
    hindiName: "पीला सोयाबीन",
    mandiName: "Indore APMC",
    state: "Madhya Pradesh",
    minPriceQuintal: 4520,
    maxPriceQuintal: 4980,
    modalPriceQuintal: 4810,
    mspQuintal: 4892,
    dailyChangePercent: -0.8,
    arrivalTonnes: 1280,
    qualitySpec: "Oil Content 18%+",
  },
  {
    id: "m-3",
    commodity: "Onion (Red Nashik Export Grade)",
    hindiName: "लाल प्याज (उनाळू/लेक)",
    mandiName: "Lasalgaon APMC",
    state: "Maharashtra",
    minPriceQuintal: 2800,
    maxPriceQuintal: 3950,
    modalPriceQuintal: 3580,
    mspQuintal: 0,
    dailyChangePercent: 4.6,
    arrivalTonnes: 1850,
    qualitySpec: "55mm+ Export Graded",
  },
  {
    id: "m-4",
    commodity: "Sharbati / Lokwan Wheat",
    hindiName: "लोकवन / शरबती गेहूं",
    mandiName: "Sehore APMC",
    state: "Madhya Pradesh",
    minPriceQuintal: 2650,
    maxPriceQuintal: 3290,
    modalPriceQuintal: 2940,
    mspQuintal: 2425,
    dailyChangePercent: 1.2,
    arrivalTonnes: 940,
    qualitySpec: "Lustre Grade-A",
  },
  {
    id: "m-5",
    commodity: "Mustard Seed (Black/Yellow)",
    hindiName: "सरसों (राई)",
    mandiName: "Alwar APMC",
    state: "Rajasthan",
    minPriceQuintal: 5600,
    maxPriceQuintal: 6240,
    modalPriceQuintal: 5980,
    mspQuintal: 5950,
    dailyChangePercent: 1.9,
    arrivalTonnes: 670,
    qualitySpec: "42% Oil Recovery",
  },
  {
    id: "m-6",
    commodity: "Turmeric Finger (Polished/Unpolished)",
    hindiName: "हल्दी कांडी",
    mandiName: "Sangli APMC",
    state: "Maharashtra",
    minPriceQuintal: 13800,
    maxPriceQuintal: 16900,
    modalPriceQuintal: 15450,
    mspQuintal: 0,
    dailyChangePercent: 3.1,
    arrivalTonnes: 295,
    qualitySpec: "Curcumin > 5%",
  },
];

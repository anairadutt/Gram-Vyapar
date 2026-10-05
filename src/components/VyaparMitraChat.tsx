import React, { useState } from "react";
import { StoreProfile } from "../data/vyaparData";
import { Send, Sparkles, Languages } from "lucide-react";

interface VyaparMitraChatProps {
  storeProfile: StoreProfile;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  time: string;
}

const LANGUAGES = [
  "Hindi (हिन्दी)",
  "English",
  "Marathi (मराठी)",
  "Gujarati (गुजराती)",
  "Punjabi (ਪੰਜਾਬੀ)",
  "Tamil (தமிழ்)",
  "Telugu (తెలుగు)",
  "Bengali (বাংলা)",
];

const SAMPLE_QUESTIONS = [
  "ग्राहक से पुराना उधार (Udhar) विनम्रता से वापस मांगने के लिए WhatsApp मैसेज लिखें",
  "How can our FPO sell unpolished Tur Dal directly on ONDC without middlemen?",
  "किराना दुकान में मुनाफा (Margin) बढ़ाने के लिए कौन से आइटम रखने चाहिए?",
  "How to get a 7% interest loan against warehouse receipt (e-NWR) instead of distress selling?",
];

export const VyaparMitraChat: React.FC<VyaparMitraChatProps> = ({ storeProfile }) => {
  const [language, setLanguage] = useState<string>("Hindi (हिन्दी)");
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `राम-राम / नमस्ते! मैं **ग्राम व्यापार मित्र (Gram Vyapar Mitra)** हूँ — **${storeProfile.storeName}** (${storeProfile.village}, ${storeProfile.district}) का डिजिटल व्यापार सलाहकार।\n\nआप मुझसे किराना मार्जिन, उधार वसूली (Udhar recovery), ONDC डिजिटल दुकान, APMC मंडी भाव, या ग्रामीण व्यापार लोन (PM SVANidhi / MUDRA / FPO Grant) के बारे में अपनी भाषा में पूछ सकते हैं।`,
      time: "Ready",
    },
  ]);

  const handleSend = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = {
      role: "user",
      content: trimmed,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/vyapar/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          language,
          storeProfile,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `त्रुटि / Error: ${err.message || "कृपया पुनः प्रयास करें।"}`,
          time: "Error",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Gram Vyapar Mitra — Multilingual Rural Business Copilot
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Practical advisory for village merchants, FPOs, Self-Help Groups (SHGs), and rural wholesalers.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <Languages className="w-4 h-4 text-slate-500" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-700"
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                Language: {l}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sample Prompts */}
      <div className="flex flex-wrap gap-2">
        {SAMPLE_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(q)}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:border-emerald-600 hover:text-slate-900 transition-colors text-left"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className="bg-white border border-slate-200 rounded-xl flex flex-col h-[500px]">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
            >
              <div className="text-xs text-slate-400 mb-1 font-mono tabular-nums">
                {m.role === "user" ? storeProfile.ownerName : "Gram Vyapar Mitra"} · {m.time}
              </div>
              <div
                className={`max-w-3xl rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-50 border border-slate-200 text-slate-800"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700 animate-spin" />
              <span>तैयार किया जा रहा है / Preparing rural business advice...</span>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="p-4 border-t border-slate-200 flex items-center gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask in ${language} about Mandi rates, Udhar collection, ONDC, FPO schemes...`}
            className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-emerald-700"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 disabled:opacity-50 transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

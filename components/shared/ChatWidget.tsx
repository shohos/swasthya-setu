"use client";

import { useRef, useState } from "react";
import { MessageCircle, Send, X, HeartPulse } from "lucide-react";
import { useAppStore } from "@/lib/store";
import LoadingDots from "./LoadingDots";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "রক্তস্বল্পতা (anemia) কী?",
  "ডেঙ্গুর লক্ষণ কী কী?",
  "গর্ভাবস্থার বিপদ চিহ্ন",
];

export default function ChatWidget() {
  const { chatOpen, setChatOpen } = useAppStore();
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "আসসালামু আলাইকুম! আমি স্বাস্থ্য সেতুর AI সহকারী। স্বাস্থ্য বিষয়ে যেকোনো প্রশ্ন করুন। 🩺",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollDown = () =>
    setTimeout(() => scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" }), 50);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setBusy(true);
    scrollDown();
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.filter((m, i) => i > 0 || m.role === "user") }),
      });
      if (!res.body) throw new Error("no stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let reply = "";
      setMessages([...next, { role: "assistant", content: "" }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        setMessages([...next, { role: "assistant", content: reply }]);
        scrollDown();
      }
    } catch {
      setMessages([
        ...next,
        { role: "assistant", content: "দুঃখিত, সংযোগে সমস্যা হচ্ছে। আবার চেষ্টা করুন।" },
      ]);
    } finally {
      setBusy(false);
      scrollDown();
    }
  }

  return (
    <>
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-4 right-4 z-[90] btn-primary flex items-center gap-2 shadow-xl shadow-teal-900/40"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="hidden sm:inline">Chat in Bangla</span>
          <span className="font-bangla sm:hidden">চ্যাট</span>
        </button>
      )}

      {chatOpen && (
        <div className="fixed bottom-4 right-4 z-[90] w-[calc(100vw-2rem)] sm:w-96 panel shadow-2xl flex flex-col h-[480px] animate-slide-up">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-edge">
            <HeartPulse className="w-5 h-5 text-teal-400" />
            <div>
              <p className="text-sm font-semibold text-slate-100">Health Assistant</p>
              <p className="text-[10px] text-teal-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" /> Powered by
                Claude
              </p>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="ml-auto text-slate-500 hover:text-slate-300"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm font-bangla whitespace-pre-wrap ${
                  m.role === "user"
                    ? "ml-auto bg-teal-600/30 border border-teal-700 text-slate-100"
                    : "bg-card border border-edge text-slate-200"
                }`}
              >
                {m.content || <LoadingDots />}
              </div>
            ))}
          </div>

          {messages.length <= 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs font-bangla px-2.5 py-1 rounded-full bg-card border border-edge text-slate-300 hover:border-teal-600"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="p-3 border-t border-edge flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="আপনার প্রশ্ন লিখুন..."
              className="input-dark font-bangla text-sm"
            />
            <button type="submit" disabled={busy} className="btn-primary px-3" aria-label="Send">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { 
  Send, 
  Sparkles, 
  Brain, 
  AlertTriangle, 
  CheckCircle2, 
  Heart, 
  Eye, 
  TrendingUp,
  MessageSquare,
  ChevronRight,
  Info
} from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

interface ChatbotProps {
  currentChatId: string | null;
}

interface RealityMirrorBlocks {
  preamble?: string;
  facts?: string;
  assumptions?: string;
  emotions?: string;
  reality?: string;
  action?: string;
  isStructured: boolean;
}

export function Chatbot({ currentChatId }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Suggested prompts
  const suggestions = [
    {
      title: "Analyze Setback",
      desc: "Process a recent rejection or failure logically.",
      prompt: "I want to analyze a recent rejection I faced. Let's look at the facts and assumptions.",
      icon: <AlertTriangle className="h-4 w-4 text-amber-400" />
    },
    {
      title: "Debunk Doubts",
      desc: "Examine self-limiting beliefs and facts.",
      prompt: "I am feeling insecure about my abilities. Let's do a Reality Mirror check of my assumptions.",
      icon: <Eye className="h-4 w-4 text-violet-400" />
    },
    {
      title: "Decode Emotions",
      desc: "Untangle conflicting feelings in a situation.",
      prompt: "I have conflicting emotions about a decision I need to make. Help me separate facts from feelings.",
      icon: <Heart className="h-4 w-4 text-rose-400" />
    },
    {
      title: "Next Action",
      desc: "Identify the healthiest next step forward.",
      prompt: "Based on my current personal development block, what is the single healthiest next action I can take?",
      icon: <TrendingUp className="h-4 w-4 text-teal-400" />
    }
  ];

  // Helper parser for Reality Mirror responses
  const parseRealityMirror = (content: string): RealityMirrorBlocks => {
    const hasFacts = content.includes("Facts:");
    const hasAssumptions = content.includes("Assumptions:");
    const hasEmotions = content.includes("Emotions:");
    const hasReality = content.includes("Most Likely Reality:");
    const hasAction = content.includes("Healthiest Next Action:");

    const isStructured = hasFacts || hasAssumptions || hasEmotions || hasReality || hasAction;

    if (!isStructured) {
      return { isStructured: false };
    }

    const extractSection = (text: string, startMarker: string, endMarkers: string[]): string | undefined => {
      const startIndex = text.indexOf(startMarker);
      if (startIndex === -1) return undefined;
      
      let endIndex = text.length;
      for (const endMarker of endMarkers) {
        const idx = text.indexOf(endMarker, startIndex + startMarker.length);
        if (idx !== -1 && idx < endIndex) {
          endIndex = idx;
        }
      }
      
      return text.substring(startIndex + startMarker.length, endIndex).trim();
    };

    const preamble = content.indexOf("Facts:") !== -1 
      ? content.substring(0, content.indexOf("Facts:")).trim() 
      : undefined;

    const facts = extractSection(content, "Facts:", ["Assumptions:", "Emotions:", "Most Likely Reality:", "Healthiest Next Action:"]);
    const assumptions = extractSection(content, "Assumptions:", ["Facts:", "Emotions:", "Most Likely Reality:", "Healthiest Next Action:"]);
    const emotions = extractSection(content, "Emotions:", ["Facts:", "Assumptions:", "Most Likely Reality:", "Healthiest Next Action:"]);
    const reality = extractSection(content, "Most Likely Reality:", ["Facts:", "Assumptions:", "Emotions:", "Healthiest Next Action:"]);
    const action = extractSection(content, "Healthiest Next Action:", ["Facts:", "Assumptions:", "Emotions:", "Most Likely Reality:"]);

    return {
      preamble,
      facts,
      assumptions,
      emotions,
      reality,
      action,
      isStructured: true
    };
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    if (!currentChatId) {
      setMessages([]);
      return;
    }
    loadMessages();
  }, [currentChatId]);

  const loadMessages = async () => {
    if (!currentChatId) return;

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", currentChatId)
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error(error);
      return;
    }

    setMessages(
      (data || []).map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
      }))
    );
  };

  const sendMessage = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || loading) return;

    if (!currentChatId) {
      alert("Please select or create a chat from the sidebar first.");
      return;
    }

    const tempUserMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: textToSend,
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    
    // Clear input
    if (!customText) setInput("");

    await supabase.from("messages").insert({
      chat_id: currentChatId,
      role: "user",
      content: textToSend,
    });

    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: textToSend,
          chatId: currentChatId,
        }),
      });

      const data = await res.json();

      const botMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.answer || "I couldn't generate a response.",
      };

      await supabase.from("messages").insert({
        chat_id: currentChatId,
        role: "assistant",
        content: botMsg.content,
      });

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
      // Refocus input
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (promptText: string) => {
    setInput(promptText);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#08070d] relative overflow-hidden select-none">
      {/* Dynamic top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[120px] rounded-full bg-violet-600/5 blur-[80px] pointer-events-none" />

      {/* Top Navigation / Title bar */}
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between shrink-0 bg-white/[0.01] backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-indigo-200/60 uppercase tracking-widest font-display">
            MindScope Core Engine v2.0
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-indigo-300/40 bg-white/5 border border-white/5 px-3 py-1 rounded-full font-medium">
          <Sparkles className="h-3 w-3 text-violet-400" />
          <span>Reality Mirror Active</span>
        </div>
      </header>

      {/* Message area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-8 space-y-6 scrollbar-custom scroll-smooth relative z-10">
        {messages.length === 0 ? (
          /* Empty Chat Area suggestions */
          <div className="h-full max-w-2xl mx-auto flex flex-col justify-center items-center text-center py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/5 shadow-[0_0_25px_rgba(139,92,246,0.15)] mb-6 animate-bounce" style={{ animationDuration: "3s" }}>
              <Brain className="h-8 w-8 text-violet-400" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display bg-gradient-to-r from-white via-indigo-100 to-violet-200 bg-clip-text text-transparent">
              Reflect • Understand • Grow
            </h2>
            <p className="mt-3 text-sm text-indigo-200/40 max-w-md font-medium tracking-wide">
              I am your Reality Mirror AI. Ask me about relationships, rejection recovery, emotional logic, or personal growth blocks.
            </p>

            {currentChatId ? (
              <div className="mt-10 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(s.prompt)}
                    className="flex flex-col text-left p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-violet-500/20 transition-all group active:scale-[0.98] cursor-pointer shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="p-1 rounded-lg bg-white/5">{s.icon}</span>
                      <span className="text-xs font-bold text-white group-hover:text-violet-400 transition-colors uppercase tracking-wider">
                        {s.title}
                      </span>
                    </div>
                    <span className="text-xs text-indigo-200/50 leading-relaxed font-medium">
                      {s.desc}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-8 flex items-center gap-2 border border-violet-500/20 bg-violet-500/5 rounded-2xl p-4 text-xs font-semibold text-violet-400 tracking-wider">
                <Info size={16} />
                <span>PLEASE CHOOSE OR CREATE A CHAT IN THE SIDEBAR TO BEGIN</span>
              </div>
            )}
          </div>
        ) : (
          /* Conversation bubbles */
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              const parsed = !isUser ? parseRealityMirror(msg.content) : null;

              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"} animate-message`}
                >
                  {isUser ? (
                    /* User bubble */
                    <div className="px-5 py-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-md max-w-[85%] font-medium">
                      {msg.content}
                    </div>
                  ) : (
                    /* AI message output */
                    <div className="flex gap-4 max-w-[90%] sm:max-w-[85%]">
                      {/* Avatar */}
                      <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <Brain className="h-4.5 w-4.5 text-violet-400" />
                      </div>

                      <div className="flex-1 space-y-4">
                        {parsed?.isStructured ? (
                          /* Structured Reality Mirror Mode components */
                          <div className="space-y-4">
                            {parsed.preamble && (
                              <p className="text-sm text-indigo-200/80 leading-relaxed font-medium">
                                {parsed.preamble}
                              </p>
                            )}

                            {/* Section Cards */}
                            {parsed.facts && (
                              <div className="rounded-2xl border border-blue-500/10 bg-blue-500/[0.02] p-4">
                                <div className="flex items-center gap-2 mb-2 text-blue-400 font-bold uppercase tracking-wider text-xs">
                                  <CheckCircle2 size={14} />
                                  <span>Facts Assessed</span>
                                </div>
                                <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed font-medium whitespace-pre-wrap">
                                  {parsed.facts}
                                </p>
                              </div>
                            )}

                            {parsed.assumptions && (
                              <div className="rounded-2xl border border-amber-500/10 bg-amber-500/[0.02] p-4">
                                <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold uppercase tracking-wider text-xs">
                                  <AlertTriangle size={14} />
                                  <span>Assumptions Identified</span>
                                </div>
                                <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed font-medium whitespace-pre-wrap">
                                  {parsed.assumptions}
                                </p>
                              </div>
                            )}

                            {parsed.emotions && (
                              <div className="rounded-2xl border border-purple-500/10 bg-purple-500/[0.02] p-4">
                                <div className="flex items-center gap-2 mb-2 text-purple-400 font-bold uppercase tracking-wider text-xs">
                                  <Heart size={14} />
                                  <span>Emotions InPlay</span>
                                </div>
                                <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed font-medium whitespace-pre-wrap">
                                  {parsed.emotions}
                                </p>
                              </div>
                            )}

                            {parsed.reality && (
                              <div className="rounded-2xl border border-violet-500/30 bg-violet-500/5 p-4 shadow-[0_0_15px_rgba(139,92,246,0.05)]">
                                <div className="flex items-center gap-2 mb-2 text-violet-400 font-bold uppercase tracking-wider text-xs">
                                  <Eye size={14} />
                                  <span>Most Likely Reality</span>
                                </div>
                                <p className="text-xs sm:text-sm text-indigo-100/95 leading-relaxed font-medium whitespace-pre-wrap">
                                  {parsed.reality}
                                </p>
                              </div>
                            )}

                            {parsed.action && (
                              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] p-4">
                                <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold uppercase tracking-wider text-xs">
                                  <TrendingUp size={14} />
                                  <span>Healthiest Next Action</span>
                                </div>
                                <p className="text-xs sm:text-sm text-emerald-300 leading-relaxed font-semibold whitespace-pre-wrap">
                                  {parsed.action}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Standard Message Block */
                          <div className="px-5 py-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words text-indigo-100 bg-white/[0.03] border border-white/5 shadow-sm font-medium">
                            {msg.content}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              /* Pulse Thinking status */
              <div className="flex gap-4 max-w-[85%] animate-pulse">
                <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Brain className="h-4.5 w-4.5 text-violet-400 animate-spin" style={{ animationDuration: "3s" }} />
                </div>
                <div className="px-5 py-3 rounded-2xl text-xs sm:text-sm text-indigo-200/50 bg-white/[0.02] border border-white/5 font-semibold tracking-wider flex items-center gap-2">
                  <span>THINKING & MIRRORING LOGIC</span>
                  <span className="flex gap-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Form Footer */}
      <footer className="p-4 sm:p-5 border-t border-white/5 bg-[#0b0a10]/80 backdrop-blur-lg shrink-0 relative z-10">
        <div className="max-w-3xl mx-auto flex gap-3 relative items-center">
          <div className="absolute left-4 text-violet-400/50">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <Input
            ref={inputRef}
            placeholder={
              currentChatId 
                ? "Describe your emotions, situations or facts..." 
                : "Choose a chat from the sidebar..."
            }
            value={input}
            disabled={loading || !currentChatId}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-13 rounded-2xl bg-white/5 border border-white/5 pl-12 pr-28 text-white placeholder-indigo-200/30 outline-none focus:border-violet-500/30 focus:bg-white/10 focus:ring-2 focus:ring-violet-500/10 text-sm font-medium w-full"
          />

          <div className="absolute right-2 flex items-center gap-2">
            <Button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim() || !currentChatId}
              className="h-9 w-9 p-0 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 shadow-md text-white font-semibold flex items-center justify-center cursor-pointer transition-all active:scale-[0.9]"
            >
              <Send size={14} />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
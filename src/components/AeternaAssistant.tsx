import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, 
  Send, 
  X, 
  Trash2, 
  Bot, 
  Sparkles, 
  AlertCircle, 
  ArrowUpRight 
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const GREETING_TEXT = "Hi! I'm here to answer questions about the Aeterna continuity protocol — how it detects trouble, preserves an AI agent, keeps its identity intact, and safely restores it. Ask me anything, or type 'give me an overview' to start.";

interface AeternaAssistantProps {
  defaultOpen?: boolean;
}

export const AeternaAssistant: React.FC<AeternaAssistantProps> = ({ defaultOpen }) => {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen ?? false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "greeting",
      role: "assistant",
      content: GREETING_TEXT,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isThinking]);

  // Clear conversation handler
  const handleClear = () => {
    setMessages([
      {
        id: "greeting",
        role: "assistant",
        content: GREETING_TEXT,
        timestamp: new Date()
      }
    ]);
    setError(null);
    setIsThinking(false);
  };

  // Helper to format text with light markdown-like rules
  const formatInlineMarkdown = (text: string): string => {
    // Bold: **text**
    let formatted = text.replace(/\*\*([^*]+)\*\*/g, "<strong class='text-white font-semibold'>$1</strong>");
    // Italic: *text* or _text_
    formatted = formatted.replace(/\*([^*]+)\*/g, "<em class='text-brand-ink-dim italic'>$1</em>");
    formatted = formatted.replace(/_([^_]+)_/g, "<em class='text-brand-ink-dim italic'>$1</em>");
    // Inline code: `code`
    formatted = formatted.replace(/`([^`]+)`/g, "<code class='bg-slate-950 border border-brand-border/40 px-1 py-0.5 rounded text-indigo-300 font-mono text-[10px]'>$1</code>");
    return formatted;
  };

  const renderMessageContent = (text: string) => {
    const paragraphs = text.split(/\n\n+/);
    return paragraphs.map((para, pIdx) => {
      const trimmedPara = para.trim();
      // Check if it's a bulleted list block
      if (trimmedPara.startsWith("- ") || trimmedPara.startsWith("* ")) {
        const items = para.split(/\n/).map(item => item.replace(/^[\s-*]+/, "").trim());
        return (
          <ul key={pIdx} className="list-disc pl-4 mb-3 space-y-1.5 text-xs text-brand-ink font-sans">
            {items.map((item, iIdx) => (
              <li key={iIdx} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item) }} />
            ))}
          </ul>
        );
      }
      return (
        <p 
          key={pIdx} 
          className="mb-2 text-xs leading-relaxed text-brand-ink font-sans"
          dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(para) }}
        />
      );
    });
  };

  // Send message API caller with retry/backoff on 429
  const handleSend = async () => {
    const userText = inputValue.trim();
    if (!userText || isThinking) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsThinking(true);
    setError(null);

    // Prepare message history payload for stateless endpoint
    const payloadMessages = [...messages, userMsg].map(m => ({
      role: m.role,
      content: m.content
    }));

    let attempts = 0;
    const maxAttempts = 2;
    let success = false;
    let replyText = "";

    while (attempts < maxAttempts && !success) {
      try {
        attempts++;
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: payloadMessages })
        });

        // Handle 429 Rate Limits
        if (response.status === 429) {
          if (attempts < maxAttempts) {
            setError("I'm getting a lot of requests right now — give me a few seconds.");
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue; // Trigger retry attempt
          } else {
            throw new Error("I'm getting a lot of requests right now — give me a few seconds.");
          }
        }

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Server connection failed (${response.status})`);
        }

        const data = await response.json();
        replyText = data.text;
        success = true;
      } catch (err: any) {
        if (attempts >= maxAttempts) {
          setError(err.message || "Unable to reach the assistant. Please try again.");
          setIsThinking(false);
          return;
        }
      }
    }

    if (success) {
      setError(null);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: replyText,
        timestamp: new Date()
      }]);
    }
    setIsThinking(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  // Pre-configured chips for typical queries to assist user exploration
  const SUGGESTION_CHIPS = [
    "Give me an overview",
    "What are Evidence Tiers?",
    "Explain Post-host Operating Modes",
    "How is Identity kept persistent?"
  ];

  return (
    <>
      {/* 1. Floating Launcher Button (Bottom Left, opposite Narration Controls to avoid clutter) */}
      <div className="fixed bottom-4 left-4 z-50" id="floating-assistant-launcher">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-slate-900 border border-brand-accent/60 hover:border-brand-accent text-white px-3.5 py-2.5 rounded-full shadow-lg shadow-brand-accent/25 hover:shadow-brand-accent/40 transition-all duration-300 font-mono text-xs font-bold cursor-pointer hover:-translate-y-0.5 group"
          title="Ask Aeterna Assistant"
        >
          <div className="relative">
            <Bot className="w-4 h-4 text-brand-accent group-hover:scale-110 transition-transform duration-200" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent"></span>
            </span>
          </div>
          <span className="hidden xs:inline uppercase tracking-wider">Ask Assistant</span>
        </button>
      </div>

      {/* 2. Side Panel / Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for Mobile Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black z-50 md:hidden"
            />

            {/* Sliding Drawer / Panel */}
            <motion.div
              initial={{ x: "-100%", opacity: 0.8 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0.8 }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="fixed inset-y-0 left-0 w-full md:w-[420px] bg-brand-bg/95 border-r border-brand-border/80 shadow-2xl backdrop-blur-xl z-50 flex flex-col font-mono"
              id="assistant-side-panel"
            >
              {/* Header */}
              <div className="p-4 bg-brand-surface border-b border-brand-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-brand-accent/15 rounded border border-brand-accent/30">
                    <Sparkles className="w-4 h-4 text-brand-accent" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-brand-ink uppercase tracking-widest leading-none">
                      Aeterna Assistant
                    </h3>
                    <span className="text-[9px] text-brand-ink-dim font-semibold uppercase tracking-wider block mt-0.5">
                      Continuity Knowledge base
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Clear button */}
                  <button
                    onClick={handleClear}
                    className="p-1.5 hover:bg-brand-surface-alt rounded text-brand-ink-dim hover:text-rose-400 transition cursor-pointer"
                    title="Clear Conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Close button */}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 hover:bg-brand-surface-alt rounded text-brand-ink-dim hover:text-white transition cursor-pointer"
                    title="Close Panel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Messages List Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-thin bg-brand-surface-alt/45">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[85%] ${
                      msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                    }`}
                  >
                    {/* Timestamp / Sender Indicator */}
                    <span className="text-[9px] text-brand-ink-dim uppercase tracking-widest mb-1 font-bold">
                      {msg.role === "user" ? "You" : "Protocol Assistant"}
                    </span>

                    {/* Message Bubble */}
                    <div
                      className={`p-3 rounded-lg border text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "bg-brand-surface border-brand-border text-brand-ink rounded-tr-none"
                          : "bg-brand-bg/60 border-brand-accent/20 text-brand-ink rounded-tl-none shadow-inner"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div>{renderMessageContent(msg.content)}</div>
                      ) : (
                        <p className="font-sans whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Thinking Indicator */}
                {isThinking && (
                  <div className="flex flex-col items-start max-w-[85%]">
                    <span className="text-[9px] text-brand-ink-dim uppercase tracking-widest mb-1 font-bold">
                      Protocol Assistant
                    </span>
                    <div className="p-3 bg-brand-bg/60 border border-brand-accent/20 rounded-lg rounded-tl-none text-brand-ink-dim text-xs flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent"></span>
                      </span>
                      <span>Thinking and verifying...</span>
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {error && (
                  <div className="p-3 bg-rose-950/30 border border-rose-900/50 rounded text-rose-400 text-xs flex items-start gap-2 animate-fade-in font-sans">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold font-mono uppercase text-[9px] tracking-wider mb-0.5">Communication Error</p>
                      <p>{error}</p>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions chips when input is empty */}
              {inputValue.trim() === "" && (
                <div className="p-3 bg-brand-surface/20 border-t border-brand-border/40 space-y-1.5">
                  <span className="text-[8px] uppercase tracking-wider text-brand-ink-dim font-bold block">
                    Quick suggestions
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTION_CHIPS.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setInputValue(chip);
                        }}
                        className="text-[9px] font-semibold font-mono text-brand-ink-dim hover:text-white bg-brand-surface hover:bg-brand-surface-alt border border-brand-border rounded-full px-2 py-1 transition cursor-pointer flex items-center gap-1"
                      >
                        {chip} <ArrowUpRight className="w-2.5 h-2.5 text-brand-accent" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Input Area */}
              <div className="p-4 bg-brand-surface border-t border-brand-border flex items-center gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isThinking}
                  placeholder="Query Aeterna core documentation..."
                  className="flex-1 bg-brand-bg text-brand-ink border border-brand-border rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent disabled:opacity-50 transition"
                />

                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isThinking}
                  className="p-2.5 bg-brand-accent hover:bg-indigo-500 disabled:bg-brand-surface-alt text-white disabled:text-brand-ink-dim rounded transition-all cursor-pointer shadow-md shadow-brand-accent/25 flex items-center justify-center shrink-0"
                  title="Send message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

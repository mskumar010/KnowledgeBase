import { X, Send } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { runWorkflow } from "@/api/client";
import { useFlowStore } from "@/store/useFlowStore";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "running">("idle");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { nodes, edges } = useFlowStore();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status === "running") return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setStatus("running");

    // User requested toast info
    const toastId = toast.loading("Processing your request...");

    try {
      if (nodes.length === 0) {
        throw new Error("Workflow is empty. Please add nodes first.");
      }

      const response = await runWorkflow({ nodes, edges }, userMsg);

      if (!response || !response.answer) {
        throw new Error("No response received from AI");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.answer },
      ]);
      toast.success("Response received", { id: toastId });
    } catch (error: any) {
      console.error(error);
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Failed to run workflow";
      toast.error(errorMessage, { id: toastId });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `**Error:** ${errorMessage}. Please check your connection or workflow configuration.`,
        },
      ]);
    } finally {
      setStatus("idle");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-[800px] h-[600px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
        {/* Header */}
        <div className="h-14 border-b border-slate-100 flex items-center justify-between px-6 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-[10px] leading-none mb-0.5">
                ai
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              GenAI Stack Chat
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div
          className="flex-1 bg-[#f9fafb] p-8 overflow-y-auto flex flex-col gap-6 relative"
          ref={scrollRef}
        >
          {messages.length === 0 && status === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 space-y-4 opacity-50 pointer-events-none">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center border border-green-100">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold">
                  ai
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-800">
                GenAI Stack Chat
              </h3>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className="flex gap-4">
              {msg.role === "user" ? (
                <div className="w-8 h-8 bg-blue-100 rounded-lg text-blue-600 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold">U</span>
                </div>
              ) : (
                <div className="w-8 h-8 bg-green-100 rounded-lg text-green-600 flex items-center justify-center shrink-0">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-[8px] leading-none mb-0.5">
                      ai
                    </span>
                  </div>
                </div>
              )}
              <div className="flex-1 space-y-2 pt-1">
                {msg.role === "assistant" && (
                  <span className="text-xs font-bold text-slate-900 block mb-1">
                    GenAI Stack
                  </span>
                )}
                <div className="prose prose-sm prose-slate max-w-none text-slate-700 leading-relaxed">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {/* Thinking State */}
          {status === "running" && (
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 bg-green-100 rounded-lg text-green-600 flex items-center justify-center shrink-0">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-[8px] leading-none mb-0.5">
                    ai
                  </span>
                </div>
              </div>
              <div className="pt-2">
                <span className="text-sm text-slate-500 animate-pulse">
                  Thinking...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              placeholder={
                status === "running" ? "Thinking..." : "Send a message"
              }
              disabled={status === "running"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-full pl-5 pr-12 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!input.trim() || status === "running"}
              className="absolute right-2 top-2 p-1.5 text-slate-400 hover:text-green-600 disabled:opacity-50 transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

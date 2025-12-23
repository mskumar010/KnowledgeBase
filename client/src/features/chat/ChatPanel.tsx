import { useState, useEffect, useRef } from "react";
import { runWorkflow } from "@/api/client";
import axios from "axios";
import { useFlowStore } from "@/store/useFlowStore";
import { convertFlowToWorkflow } from "@/lib/workflowConverter";
import { cn } from "@/lib/utils";
import { Send, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { type Node } from "@xyflow/react";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export function ChatPanel() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [credits, setCredits] = useState(10); // Default 10 runs
  const maxCredits = 10;
  const [isLoading, setIsLoading] = useState(false);
  const { nodes, edges } = useFlowStore();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Get Active Model
  const llmNode = nodes.find((n) => n.type === "llmEngine") as
    | Node<{ config: { model?: string } }>
    | undefined;
  const activeModel = llmNode?.data?.config?.model || "gemini-2.0-flash";

  // Stop handler
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      setMessages((prev) => [
        ...prev,
        { role: "system", content: "Request cancelled by user." },
      ]);
    }
  };

  // Helper: Trigger submission
  const executeSubmission = async (text: string) => {
    if (!text.trim()) return;

    if (credits <= 0) {
      toast.error("Insufficient Credits", {
        description: "You have used all your free session credits.",
      });
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content:
            "Error: Insufficient Credits. Please refresh to reset (Simulation).",
        },
      ]);
      return;
    }

    // Deduct Credit
    setCredits((prev) => Math.max(0, prev - 1));

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setIsLoading(true);

    // Create new AbortController
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const workflow = convertFlowToWorkflow(nodes, edges);
      console.log(
        "ChatPanel: Sending Workflow:",
        JSON.stringify(workflow, null, 2)
      );
      console.log("ChatPanel: User Message:", userMsg.content);

      const result = await runWorkflow(
        workflow,
        userMsg.content,
        controller.signal
      );

      const assistantMsg: Message = {
        role: "assistant",
        content: result.answer,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error: unknown) {
      if (axios.isCancel(error)) {
        return; // Already handled in handleStop
      }
      console.error(error);
      const errorMsg =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any).response?.data?.detail ||
        "Error executing workflow. Check backend.";
      setMessages((prev) => [
        ...prev,
        { role: "system", content: `Error: ${errorMsg}` },
      ]);
      toast.error("Workflow Execution Failed", {
        description: errorMsg,
      });
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Form handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSubmission(query);
  };

  // Auto-Start on Mount
  useEffect(() => {
    if (messages.length === 0 && !isLoading) {
      // Delay slightly for dramatic effect
      const timer = setTimeout(() => {
        const defaultQ = "whats in the pdf tell me in 1 line ?";
        executeSubmission(defaultQ);
      }, 1000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-200 bg-white/50 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <Sparkles size={16} className="text-blue-500" />
          Live Preview
        </h3>

        {/* Status Bar */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  credits > 3 ? "bg-emerald-500" : "bg-red-500"
                )}
                style={{ width: `${(credits / maxCredits) * 100}%` }}
              />
            </div>
            <span className="text-slate-500">{credits} Left</span>
          </div>
          <div className="text-slate-400 font-medium px-2 py-0.5 bg-slate-50 rounded border border-slate-100">
            {activeModel}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-sm bg-slate-50/50">
        {messages.length === 0 && (
          <div className="text-center mt-10 text-slate-400 text-xs">
            Ready to run...
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={cn(
              "p-3 rounded-lg max-w-[90%] whitespace-pre-wrap shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300",
              msg.role === "user"
                ? "bg-blue-50 border border-blue-100 text-slate-800 ml-auto rounded-br-none"
                : msg.role === "assistant"
                ? "bg-white border border-slate-200 text-slate-700 mr-auto rounded-bl-none"
                : "bg-red-50 border border-red-100 text-red-600 w-full text-center"
            )}
          >
            {msg.content}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs ml-2 animate-pulse">
            <Loader2 size={12} className="animate-spin" />
            <span>Generating response...</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a follow-up..."
            disabled={isLoading}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-4 pr-10 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all font-sans shadow-sm"
          />
          {isLoading ? (
            <button
              type="button"
              onClick={handleStop}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-red-500 hover:bg-red-600 rounded-md text-white transition-all shadow-sm"
            >
              <div className="w-3.5 h-3.5 bg-white rounded-[2px]" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 hover:bg-blue-700 rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <Send size={14} />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

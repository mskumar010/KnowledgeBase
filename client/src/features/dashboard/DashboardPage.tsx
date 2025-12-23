import { getStacks, createStack } from "@/api/client";
import { useEffect, useState } from "react";
import { Loader2, Plus, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { CreateStackModal } from "./CreateStackModal";
import { useNavigate } from "react-router-dom";

export function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stacks, setStacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchStacks = async () => {
    try {
      const data = await getStacks();
      setStacks(data);
    } catch (error) {
      console.error("Failed to fetch stacks:", error);
      toast.error("Failed to load stacks");
    } finally {
      setLoading(false);
    }
  };

  const createDemoStack = async () => {
    setLoading(true);
    try {
      // 1. Create the stack
      const newStack = await createStack(
        "Demo Stack",
        "A pre-built workflow to chat with your PDF."
      );

      // 2. Define default nodes and edges
      const defaultNodes = [
        {
          id: "1",
          type: "userQuery",
          position: { x: 50, y: 100 },
          data: { label: "User Query" },
        },
        {
          id: "4",
          type: "knowledgeBase",
          position: { x: 450, y: 100 },
          data: { label: "Knowledge Base", config: { fileName: "test.pdf" } },
        },
        {
          id: "2",
          type: "llmEngine",
          position: { x: 850, y: 100 },
          data: { label: "LLM Engine", config: { model: "gpt-4o" } },
        },
        {
          id: "3",
          type: "output",
          position: { x: 1250, y: 100 },
          data: { label: "Output" },
        },
      ];

      const defaultEdges = [
        {
          id: "e1-4",
          source: "1",
          target: "4",
          type: "default",
          markerEnd: { type: "arrowclosed" },
        },
        {
          id: "e4-2",
          source: "4",
          target: "2",
          type: "default",
          markerEnd: { type: "arrowclosed" },
        },
        {
          id: "e2-3",
          source: "2",
          target: "3",
          type: "default",
          markerEnd: { type: "arrowclosed" },
        },
      ];

      // 3. Update the stack with these defaults
      // Note: We need to import updateStack from client api
      const { updateStack } = await import("@/api/client");
      await updateStack(newStack.id, {
        name: newStack.name,
        description: newStack.description,
        nodes: defaultNodes,
        edges: defaultEdges,
      });

      // 4. Navigate
      navigate(`/editor/${newStack.id}`, {
        state: { name: newStack.name, openChat: true },
      });
      toast.success("Demo Stack created!", {
        description: "You can now chat with the test PDF.",
      });
    } catch (error) {
      console.error("Failed to create demo stack:", error);
      toast.error("Failed to create demo stack");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStacks();
  }, [isModalOpen]); // Refresh when modal closes (created stack)

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Header */}
      <header className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-white shrink-0">
        <div
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate("/")}
        >
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-[10px] leading-none mb-0.5">
              ai
            </span>
          </div>
          <h1 className="font-bold text-slate-900 text-sm tracking-tight">
            GenAI Stack
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-xs font-bold text-purple-600 transition-colors">
            S
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            My Stacks
          </h2>
          <div className="flex gap-2">
            <button
              onClick={createDemoStack}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md text-sm font-medium shadow-sm transition-all"
            >
              <Loader2
                size={16}
                className={loading ? "animate-spin" : "hidden"}
              />
              Try Demo Stack
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#42a061] hover:bg-[#388a53] text-white rounded-md text-sm font-medium shadow-sm transition-all"
            >
              <Plus size={16} strokeWidth={3} />
              New Stack
            </button>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-slate-300" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stacks.map((stack) => (
              <div
                key={stack.id}
                className="group bg-white rounded-xl border border-slate-200 p-6 flex flex-col hover:shadow-lg hover:shadow-slate-100/50 transition-all duration-300 cursor-pointer h-[180px]"
                onClick={() =>
                  navigate(`/editor/${stack.id}`, {
                    state: { name: stack.name },
                  })
                }
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-900 text-sm">
                    {stack.name}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 line-clamp-1 mb-4">
                  {stack.description || "No description"}
                </p>
                <div className="mt-auto pt-4 flex gap-2 transition-opacity duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/editor/${stack.id}`, {
                        state: { name: stack.name },
                      });
                    }}
                    className="flex-1 py-1.5 border border-slate-200 rounded text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
                  >
                    Edit Stack
                    <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && stacks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center max-w-md">
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Create New Stack
              </h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Start building your generative AI apps with our essential tools
                and frameworks
              </p>
              <div className="flex gap-3">
                <button
                  onClick={createDemoStack}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md text-sm font-medium shadow-sm transition-all"
                >
                  Try Demo Stack
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#42a061] hover:bg-[#388a53] text-white rounded-md text-sm font-medium shadow-sm transition-all"
                >
                  <Plus size={16} strokeWidth={3} />
                  New Stack
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <CreateStackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

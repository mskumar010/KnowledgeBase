import { WorkflowCanvas } from "@/features/workflow/WorkflowCanvas";
import { Sidebar } from "@/features/ui/Sidebar";
import { Header } from "@/features/ui/Header";
import { ChatModal } from "@/features/chat/ChatModal";
import { ErrorBoundary } from "@/features/ui/ErrorBoundary";
import { MessageSquareText, Play, Loader2, Save, Trash2 } from "lucide-react";
import { useLocation, useParams } from "react-router-dom";
import { getStack, updateStack } from "@/api/client";
import { useEffect, useState } from "react";
import { useFlowStore } from "@/store/useFlowStore";
import { toast } from "sonner";

export function EditorPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stackName, setStackName] = useState("");
  const location = useLocation();
  const { id } = useParams();
  const { setNodes, setEdges, nodes, edges } = useFlowStore();

  useEffect(() => {
    const fetchStack = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const stack = await getStack(id);
        setStackName(stack.name);
        if (stack.nodes) setNodes(stack.nodes);
        if (stack.edges) setEdges(stack.edges);
      } catch (error) {
        console.error("Failed to fetch stack", error);
        toast.error("Failed to load stack");
        // Fallback to location state name if available
        if (location.state?.name) setStackName(location.state.name);
      } finally {
        setLoading(false);
      }
    };
    fetchStack();
  }, [id, setNodes, setEdges, location.state]);

  // Check for auto-open chat from navigation state
  useEffect(() => {
    if (location.state?.openChat) {
      setIsChatOpen(true);
    }
  }, [location.state]);

  const handleSave = async () => {
    if (!id) return;
    try {
      await updateStack(id, { nodes, edges });
      toast.success("Stack saved successfully");
    } catch (error) {
      console.error("Failed to save stack", error);
      toast.error("Failed to save stack");
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (window.confirm("Are you sure you want to delete this stack?")) {
      try {
        const { deleteStack } = await import("@/api/client");
        await deleteStack(id);
        toast.success("Stack deleted");
        // Navigate to home/dashboard (root)
        window.location.href = "/";
      } catch (error) {
        console.error("Failed to delete stack", error);
        toast.error("Failed to delete stack");
      }
    }
  };

  return (
    <ErrorBoundary>
      <div className="h-screen w-full bg-[#f0f2f5] text-slate-900 flex flex-col overflow-hidden font-sans selection:bg-blue-100">
        <Header
          title={stackName}
          rightAction={
            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-medium rounded-lg transition-colors shadow-sm"
              >
                <Trash2 size={14} />
                Delete
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
              >
                <Save size={14} />
                Save
              </button>
            </div>
          }
        />

        <div className="flex flex-1 overflow-hidden relative">
          <Sidebar />

          <main className="flex-1 relative bg-dot-pattern">
            <WorkflowCanvas />

            {/* Floating Actions */}
            <div className="absolute bottom-6 right-6 z-40 flex flex-col gap-4">
              {/* Run Button */}
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    const { runWorkflow } = await import("@/api/client");
                    const { convertFlowToWorkflow } = await import(
                      "@/lib/workflowConverter"
                    );

                    const workflow = convertFlowToWorkflow(nodes, edges);

                    // Get User Query
                    const userQueryNode = nodes.find(
                      (n) => n.type === "userQuery"
                    );
                    const queryCtx =
                      (userQueryNode?.data?.query as string) ||
                      "Summarize the document.";

                    const result = await runWorkflow(workflow, queryCtx);

                    // Update Output Node
                    const outputNode = nodes.find((n) => n.type === "output");
                    if (outputNode) {
                      const { useFlowStore } = await import(
                        "@/store/useFlowStore"
                      );
                      useFlowStore.getState().updateNodeData(outputNode.id, {
                        outputResult: result.answer,
                      });
                    }
                    if (!result.answer) {
                      toast.warning(
                        "Workflow finished but returned no answer."
                      );
                    } else {
                      toast.success("Workflow executed! Check Output Node.");
                    }
                  } catch (e) {
                    console.error(e);
                    toast.error("Execution failed.");
                  } finally {
                    setLoading(false);
                  }
                }}
                className="w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg shadow-green-500/30 flex items-center justify-center hover:scale-105 transition-all duration-300 group"
                title="Run Workflow"
              >
                <Play size={24} className="ml-1 fill-white" />
              </button>

              {/* Chat Button */}
              <button
                onClick={() => setIsChatOpen(true)}
                className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center hover:scale-105 transition-all duration-300"
                title="Open Chat"
              >
                <MessageSquareText size={28} />
              </button>
            </div>
          </main>

          {/* Chat Modal Overlay */}
          <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <Loader2 className="animate-spin text-slate-400" size={32} />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

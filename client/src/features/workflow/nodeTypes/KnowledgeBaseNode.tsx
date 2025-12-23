import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { useRef, useState } from "react";
import { uploadDocument } from "@/api/client";
import { toast } from "sonner";
import { Loader2, Upload, Database } from "lucide-react";
import { useFlowStore } from "@/store/useFlowStore";
import { NodeSettingsMenu } from "../components/NodeSettingsMenu";

export function KnowledgeBaseNode({
  id,
  selected,
  data,
}: NodeProps<Node<{ config?: { fileName?: string } }>>) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fileName = data.config?.fileName || null;
  const { updateNodeData } = useFlowStore();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Invalid file type", {
        description: "Please upload a PDF document.",
      });
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Uploading document...");

    try {
      await uploadDocument(file);
      toast.success("Document uploaded", { id: toastId });

      updateNodeData(id, {
        config: {
          ...(data.config || {}),
          fileName: file.name,
        },
      });
    } catch (error: unknown) {
      console.error(error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (error as any).response?.data?.detail || "Upload failed.";
      toast.error("Upload failed", { id: toastId, description: msg });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div
      className={`relative w-[320px] bg-white rounded-xl shadow-md border-2 transition-all duration-200 ${
        selected
          ? "border-emerald-500 ring-2 ring-emerald-500/20"
          : "border-slate-200 hover:border-emerald-300"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-emerald-50/50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-white border border-emerald-100 shadow-sm text-emerald-600">
            <Database size={14} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 leading-tight">
              Knowledge Base
            </h3>
            <p className="text-[10px] text-slate-500 italic">
              Let LLM search info in your file
            </p>
          </div>
        </div>
        <NodeSettingsMenu nodeId={id} />
      </div>

      <div className="p-3 space-y-4">
        {/* Upload Field */}
        <div>
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
            File for Knowledge Base
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="nodrag group py-3 px-4 rounded-lg border border-dashed border-green-500/50 bg-green-50/30 text-center cursor-pointer hover:bg-green-50 hover:border-green-500 transition-all"
          >
            <div className="flex items-center justify-center gap-2 text-xs font-medium text-green-700">
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span className="truncate max-w-[180px]">
                {fileName ? fileName : "Upload File"}
              </span>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="application/pdf"
          />
        </div>

        {/* Embedding Model */}
        <div>
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
            Embedding Model
          </label>
          <select className="w-full bg-white border border-slate-200 rounded-md py-1.5 px-2 text-xs text-slate-700 focus:outline-none focus:border-emerald-500">
            <option>text-embedding-3-large</option>
          </select>
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 border-2 border-white shadow-sm"
        style={{ backgroundColor: "#FF8C00", left: -6 }}
      />

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 border-2 border-white shadow-sm"
        style={{ backgroundColor: "#FF8C00", right: -6 }}
      />
      <div className="absolute -right-1 top-full mt-2 text-[10px] font-medium text-slate-400">
        Context
      </div>
      <div className="absolute -left-1 top-full mt-2 text-[10px] font-medium text-slate-400">
        Query
      </div>
    </div>
  );
}

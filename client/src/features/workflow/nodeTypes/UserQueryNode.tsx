import { Handle, Position, type NodeProps } from "@xyflow/react";
import { MessageSquare } from "lucide-react";
import { NodeSettingsMenu } from "../components/NodeSettingsMenu";
import { useFlowStore } from "@/store/useFlowStore";

export function UserQueryNode({ id, selected, data }: NodeProps) {
  const { updateNodeData } = useFlowStore();
  return (
    <div
      className={`relative w-[320px] bg-white rounded-xl shadow-md border-2 transition-all duration-200 ${
        selected
          ? "border-blue-500 ring-2 ring-blue-500/20"
          : "border-slate-200 hover:border-blue-300"
      }`}
    >
      {/* Figma-style Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-white border border-slate-200 shadow-sm text-slate-500">
            <MessageSquare size={14} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 leading-tight">
              User Input
            </h3>
            <p className="text-[10px] text-slate-500 italic">
              Enter point for querys
            </p>
          </div>
        </div>
        <NodeSettingsMenu nodeId={id} />
      </div>

      {/* Internal Content */}
      <div className="p-3">
        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
          User Query
        </label>
        <textarea
          className="nowheel nodrag w-full bg-white border border-slate-200 rounded-lg p-3 min-h-[80px] text-xs text-slate-700 focus:outline-none focus:border-blue-500 resize-none"
          placeholder="Write your query here..."
          defaultValue={(data.query as string) || ""}
          onChange={(e) => {
            // Optional: Local state update if needed, but for now defaultValue is enough for uncontrolled
            // We'll update the store onBlur to avoid too many re-renders/updates
          }}
          onBlur={(e) => {
            updateNodeData(id, { query: e.target.value });
          }}
        />
      </div>

      {/* Query Handle - Orange (Figma) */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 border-2 border-white shadow-sm"
        style={{ backgroundColor: "#FF8C00", right: -6 }}
      />
      {/* Label for Handle */}
      <div className="absolute -right-1 top-full mt-1 text-[10px] font-medium text-slate-400">
        Query
      </div>
    </div>
  );
}

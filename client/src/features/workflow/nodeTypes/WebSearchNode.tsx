import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Globe, Search } from "lucide-react";
import { NodeSettingsMenu } from "../components/NodeSettingsMenu";

export function WebSearchNode({ id, selected }: NodeProps) {
  return (
    <div
      className={`relative w-[320px] bg-white rounded-xl shadow-md border-2 transition-all duration-200 ${
        selected
          ? "border-sky-500 ring-2 ring-sky-500/20"
          : "border-slate-200 hover:border-sky-300"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-sky-50/50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-white border border-sky-100 shadow-sm text-sky-600">
            <Globe size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              Web Search
            </h3>
            <p className="text-[10px] text-slate-500 font-medium">
              Google & Bing Integration
            </p>
          </div>
        </div>
        <NodeSettingsMenu nodeId={id} />
      </div>

      <div className="p-4">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
          Search Query
        </label>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center gap-2">
          <Search size={14} className="text-slate-400 shrink-0" />
          <span className="text-xs text-slate-500 italic truncate">
            Receives input from previous node...
          </span>
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 border-2 border-white shadow-sm bg-sky-500"
        style={{ left: -6 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 border-2 border-white shadow-sm bg-sky-500"
        style={{ right: -6 }}
      />

      <div className="absolute -left-1 opacity-0 group-hover:opacity-100 transition-opacity top-[50%] -translate-y-1/2 -ml-8 text-[9px] font-bold text-slate-400">
        Query
      </div>
      <div className="absolute -right-1 opacity-0 group-hover:opacity-100 transition-opacity top-[50%] -translate-y-1/2 -mr-8 text-[9px] font-bold text-slate-400">
        Results
      </div>
    </div>
  );
}

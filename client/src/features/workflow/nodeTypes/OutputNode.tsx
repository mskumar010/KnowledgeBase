import { Handle, Position, type NodeProps } from "@xyflow/react";
import { MessageSquareText, Copy } from "lucide-react";
import { NodeSettingsMenu } from "../components/NodeSettingsMenu";

export function OutputNode({ id, selected, data }: NodeProps) {
  // FLow Node Styles:
  // This component relies on global CSS overrides in index.css (see .react-flow__node classes)
  // to remove the default React Flow padding/borders/backgrounds.
  return (
    <div
      className={`relative w-[320px] bg-white rounded-xl shadow-md border-2 transition-all duration-200 ${
        selected
          ? "border-slate-800 ring-2 ring-slate-800/10"
          : "border-slate-200 hover:border-slate-300"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-white border border-slate-200 shadow-sm text-slate-600">
            <MessageSquareText size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              Output
            </h3>
            <p className="text-[10px] text-slate-500 font-medium">
              Result Viewer
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="text-slate-400 hover:text-slate-700 transition-colors p-1 hover:bg-slate-100 rounded">
            <Copy size={16} />
          </button>
          <NodeSettingsMenu nodeId={id} />
        </div>
      </div>

      <div className="p-4">
        {data.outputResult ? (
          <div className="min-h-[120px] p-4 text-xs text-slate-700 bg-slate-50 rounded-b-xl whitespace-pre-wrap font-mono max-h-[300px] overflow-y-auto">
            {data.outputResult as string}
          </div>
        ) : (
          <div className="min-h-[120px] p-4 flex flex-col items-center justify-center text-center gap-2 text-slate-400 bg-slate-50/50 rounded-b-xl">
            <MessageSquareText size={20} className="opacity-20" />
            <div className="space-y-1">
              <span className="text-xs font-medium block text-slate-500">
                No Output Yet
              </span>
              <span className="text-[10px] opacity-70 block max-w-[180px] mx-auto">
                Run the flow to generate results
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 border-2 border-white shadow-sm bg-slate-900"
        style={{ left: -6 }}
      />
      <div className="absolute -left-1 opacity-0 group-hover:opacity-100 transition-opacity top-[50%] -translate-y-1/2 -ml-8 text-[10px] font-bold text-slate-400">
        Input
      </div>
    </div>
  );
}

import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { Zap, Eye, EyeOff } from "lucide-react";
import { useFlowStore } from "@/store/useFlowStore";
import { useState } from "react";
import { NodeSettingsMenu } from "../components/NodeSettingsMenu";

export function LLMNode({
  id,
  selected,
  data,
}: NodeProps<Node<{ config?: { model?: string } }>>) {
  const { updateNodeData } = useFlowStore();
  const config = data.config;
  const [showKey, setShowKey] = useState(false);

  return (
    <div
      className={`relative w-[320px] bg-white rounded-xl shadow-md border-2 transition-all duration-200 ${
        selected
          ? "border-purple-500 ring-2 ring-purple-500/20"
          : "border-slate-200 hover:border-purple-300"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-purple-50/50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-white border border-purple-100 shadow-sm text-purple-600">
            <Zap size={14} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 leading-tight">
              LLM (OpenAI)
            </h3>
            <p className="text-[10px] text-slate-500 italic">
              Run a query with OpenAI LLM
            </p>
          </div>
        </div>
        <NodeSettingsMenu nodeId={id} />
      </div>

      <div className="p-3 space-y-4">
        {/* Model */}
        <div>
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
            Model
          </label>
          <select
            className="nodrag w-full bg-white border border-slate-200 rounded-md py-1.5 px-2 text-xs text-slate-700 focus:outline-none focus:border-purple-500"
            value={config?.model || "gpt-4o"}
            onChange={(e) =>
              updateNodeData(id, {
                config: { ...config, model: e.target.value },
              })
            }
          >
            <option value="gpt-4o">GPT 4o-Mini</option>
            <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
            <option value="perplexity-sonar-small-online">
              Perplexity Sonar
            </option>
            <option value="llama-3.1-8b-instant">
              Groq - Llama 3.1 8b (Free)
            </option>
            <option value="llama-3.3-70b-versatile">
              Groq - Llama 3.3 70b (Free)
            </option>
          </select>
        </div>

        {/* API Key */}
        <div>
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
            API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              className="nodrag w-full bg-white border border-slate-200 rounded-md py-1.5 pl-2 pr-8 text-xs text-slate-700 focus:outline-none focus:border-purple-500"
              value="sk-********************"
              readOnly
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="nodrag absolute right-2 top-1.5 text-slate-400"
            >
              {showKey ? <EyeOff size={12} /> : <Eye size={12} />}
            </button>
          </div>
        </div>

        {/* Prompt */}
        <div>
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
            Prompt
          </label>
          <textarea
            className="nodrag w-full bg-white border border-slate-200 rounded-md p-2 text-xs text-slate-700 min-h-[80px] focus:outline-none focus:border-purple-500 resize-none"
            defaultValue={"You are a helpful PDF assistant."}
          />
        </div>

        {/* Temperature */}
        <div>
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
            Temperature
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              defaultValue="0.75"
              className="nodrag flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <span className="text-xs font-mono text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded">
              0.75
            </span>
          </div>
        </div>

        {/* Web Search Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
          <label className="text-[10px] font-bold text-slate-700">
            WebSearch Tool
          </label>
          <div className="w-8 h-4 bg-green-500 rounded-full relative cursor-pointer">
            <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm"></div>
          </div>
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
        style={{ backgroundColor: "#9F7AEA", right: -6 }}
      />
      <div className="absolute -right-1 top-[95%] mt-1 text-[10px] font-medium text-slate-400">
        Output
      </div>
    </div>
  );
}

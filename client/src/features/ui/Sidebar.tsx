import {
  MessageCircle,
  Database,
  Zap,
  Layers,
  Globe,
  Type,
} from "lucide-react";

export function Sidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="w-[240px] h-full bg-white border-r border-slate-200 flex flex-col shrink-0 z-20">
      {/* Header */}
      <div className="p-4 pb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Components
        </span>
      </div>

      <div className="p-3 flex-1 overflow-y-auto space-y-2">
        {/* Input Node */}
        <div
          className="group bg-white border border-slate-200 rounded-lg p-3 cursor-grab hover:border-slate-300 hover:shadow-sm transition-all duration-200 active:cursor-grabbing flex items-center gap-3"
          onDragStart={(event) => onDragStart(event, "userQuery")}
          draggable
        >
          <div className="w-8 h-8 rounded-md bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-slate-100 group-hover:text-slate-700 transition-colors">
            <Type size={16} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-700 block">
              Input
            </span>
          </div>
          <div className="ml-auto">
            <div className="w-3 h-1.5 rounded-full bg-slate-200/50"></div>
            <div className="w-3 h-1.5 rounded-full bg-slate-200/50 mt-1"></div>
          </div>
        </div>

        {/* LLM Node */}
        <div
          className="group bg-white border border-slate-200 rounded-lg p-3 cursor-grab hover:border-slate-300 hover:shadow-sm transition-all duration-200 active:cursor-grabbing flex items-center gap-3"
          onDragStart={(event) => onDragStart(event, "llmEngine")}
          draggable
        >
          <div className="w-8 h-8 rounded-md bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-slate-100 group-hover:text-slate-700 transition-colors">
            <Zap size={16} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-700 block">
              LLM
            </span>
          </div>
          <div className="ml-auto">
            <div className="w-3 h-1.5 rounded-full bg-slate-200/50"></div>
            <div className="w-3 h-1.5 rounded-full bg-slate-200/50 mt-1"></div>
          </div>
        </div>

        {/* KB Node */}
        <div
          className="group bg-white border border-slate-200 rounded-lg p-3 cursor-grab hover:border-slate-300 hover:shadow-sm transition-all duration-200 active:cursor-grabbing flex items-center gap-3"
          onDragStart={(event) => onDragStart(event, "knowledgeBase")}
          draggable
        >
          <div className="w-8 h-8 rounded-md bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-slate-100 group-hover:text-slate-700 transition-colors">
            <Database size={16} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-700 block">
              Knowledge Base
            </span>
          </div>
          <div className="ml-auto">
            <div className="w-3 h-1.5 rounded-full bg-slate-200/50"></div>
            <div className="w-3 h-1.5 rounded-full bg-slate-200/50 mt-1"></div>
          </div>
        </div>

        {/* Web Search Node - Added based on common patterns if not explicit in images, but safe to add */}
        {/* Web Search Node */}
        <div
          className="group bg-white border border-slate-200 rounded-lg p-3 cursor-grab hover:border-slate-300 hover:shadow-sm transition-all duration-200 active:cursor-grabbing flex items-center gap-3"
          onDragStart={(event) => onDragStart(event, "webSearch")}
          draggable
        >
          <div className="w-8 h-8 rounded-md bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-slate-100 group-hover:text-slate-700 transition-colors">
            <Globe size={16} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-700 block">
              Web Search
            </span>
          </div>
          <div className="ml-auto">
            <div className="w-3 h-1.5 rounded-full bg-slate-200/50"></div>
            <div className="w-3 h-1.5 rounded-full bg-slate-200/50 mt-1"></div>
          </div>
        </div>

        {/* Output Node */}
        <div
          className="group bg-white border border-slate-200 rounded-lg p-3 cursor-grab hover:border-slate-300 hover:shadow-sm transition-all duration-200 active:cursor-grabbing flex items-center gap-3"
          onDragStart={(event) => onDragStart(event, "output")}
          draggable
        >
          <div className="w-8 h-8 rounded-md bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-slate-100 group-hover:text-slate-700 transition-colors">
            <MessageCircle size={16} />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-700 block">
              Output
            </span>
          </div>
          <div className="ml-auto">
            <div className="w-3 h-1.5 rounded-full bg-slate-200/50"></div>
            <div className="w-3 h-1.5 rounded-full bg-slate-200/50 mt-1"></div>
          </div>
        </div>
      </div>
    </aside>
  );
}
